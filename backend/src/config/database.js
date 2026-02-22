const { PrismaClient } = require('@prisma/client');

const DB_SIZE_LIMIT_MB = parseInt(process.env.DB_SIZE_LIMIT_MB || '450', 10);
const CHECK_INTERVAL_MS = parseInt(process.env.DB_CHECK_INTERVAL_MS || String(60 * 60 * 1000), 10);
const DB_WARNING_THRESHOLD_MB = Math.floor(DB_SIZE_LIMIT_MB * 0.85); // 85% warning

class DatabaseManager {
  constructor() {
    this.databases = [];
    this.activeIndex = parseInt(process.env.ACTIVE_DB_INDEX || '0', 10);
    this.initialized = false;
    this._fallback = null;
    this.checkTimer = null;
    this._switching = false; // prevent concurrent switches
  }

  getDatabaseUrls() {
    if (process.env.DATABASE_URLS) {
      return process.env.DATABASE_URLS.split(',').map(u => u.trim()).filter(Boolean);
    }
    if (process.env.DATABASE_URL) return [process.env.DATABASE_URL];
    return [];
  }

  createClient(url) {
    return new PrismaClient({
      datasources: { db: { url } },
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      // Connection pool settings for scalability
      // Prisma uses a connection pool internally; these env vars can tune it:
      // ?connection_limit=10&pool_timeout=30 in the URL
    });
  }

  async initialize() {
    if (this.initialized) return;
    const urls = this.getDatabaseUrls();
    urls.forEach((url, i) => {
      this.databases.push({ index: i, url, client: null, sizeMB: 0, isAvailable: true });
    });
    if (this.databases.length === 0) {
      // Fallback single client
      this._fallback = new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });
      await this._fallback.$connect();
      this.initialized = true;
      return;
    }

    // ensure active client
    await this.getActiveClient();
    this.startSizeMonitor();
    this.initialized = true;
  }

  async getActiveClient() {
    const db = this.databases[this.activeIndex];
    if (!db) {
      if (!this._fallback) {
        this._fallback = new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });
        await this._fallback.$connect();
      }
      return this._fallback;
    }
    if (!db.client) {
      db.client = this.createClient(db.url);
      await db.client.$connect();
    }
    return db.client;
  }

  async checkDatabaseSize(client) {
    try {
      const result = await client.$queryRaw`SELECT pg_database_size(current_database()) as size`;
      const sizeMB = Math.round((Number(result[0].size) / (1024 * 1024)) * 100) / 100;
      return sizeMB;
    } catch (err) {
      return -1;
    }
  }

  async findAvailableDatabase() {
    for (let i = 0; i < this.databases.length; i++) {
      if (i === this.activeIndex) continue;
      const db = this.databases[i];
      if (!db.client) {
        try {
          db.client = this.createClient(db.url);
          await db.client.$connect();
        } catch (e) {
          db.isAvailable = false;
          continue;
        }
      }
      const size = await this.checkDatabaseSize(db.client);
      db.sizeMB = size;
      if (size >= 0 && size < DB_SIZE_LIMIT_MB) return i;
    }
    return -1;
  }

  async switchDatabase(newIndex) {
    if (newIndex < 0 || newIndex >= this.databases.length) throw new Error('Invalid DB index');
    const oldIndex = this.activeIndex;
    this.activeIndex = newIndex;
    process.env.ACTIVE_DB_INDEX = String(newIndex);
    const db = this.databases[newIndex];
    if (!db.client) { db.client = this.createClient(db.url); await db.client.$connect(); }
    console.log(`🔄 [DB ROTATION] Switched from DB #${oldIndex} to DB #${newIndex} (size: ${this.databases[oldIndex]?.sizeMB || '?'}MB → ${db.sizeMB || '?'}MB)`);
    return this.getActiveClient();
  }

  async autoSwitch() {
    if (this._switching) return; // prevent concurrent switches
    this._switching = true;
    try {
      // Update sizes of ALL already-connected databases (fast — sockets already open)
      for (const db of this.databases) {
        if (db.client) {
          const size = await this.checkDatabaseSize(db.client);
          if (size >= 0) db.sizeMB = size;
        }
      }

      const activeDb = this.databases[this.activeIndex];
      const activeSize = activeDb?.sizeMB || 0;

      // Log warning when approaching limit
      if (activeSize >= DB_WARNING_THRESHOLD_MB && activeSize < DB_SIZE_LIMIT_MB) {
        console.warn(`⚠️ [DB WARNING] Active DB #${this.activeIndex} at ${activeSize}MB / ${DB_SIZE_LIMIT_MB}MB (${Math.round(activeSize / DB_SIZE_LIMIT_MB * 100)}%)`);
      }

      // If active DB is at or near limit, find and switch to next available
      if (activeSize >= DB_SIZE_LIMIT_MB) {
        console.log(`🚨 [DB ROTATION] DB #${this.activeIndex} exceeded ${DB_SIZE_LIMIT_MB}MB limit (${activeSize}MB). Looking for next available...`);
        const next = await this.findAvailableDatabase();
        if (next >= 0) {
          await this.switchDatabase(next);
        } else {
          console.error(`❌ [DB ROTATION] No available database found under ${DB_SIZE_LIMIT_MB}MB! All databases may be full.`);
        }
      }
    } catch (e) {
      console.error('❌ [DB ROTATION] autoSwitch error:', e.message);
    } finally {
      this._switching = false;
    }
  }

  // Background: connect to all DBs and populate initial sizes (runs once on startup)
  async refreshAllSizes() {
    console.log(`📊 [DB] Refreshing sizes for ${this.databases.length} databases...`);
    for (const db of this.databases) {
      if (!db.client) {
        try {
          db.client = this.createClient(db.url);
          await db.client.$connect();
        } catch (e) {
          db.isAvailable = false;
          console.warn(`⚠️ [DB] Could not connect to DB #${db.index}: ${e.message}`);
          continue;
        }
      }
      const size = await this.checkDatabaseSize(db.client);
      if (size >= 0) { db.sizeMB = size; db.isAvailable = true; }
    }
    const summary = this.databases.map(d => `DB#${d.index}: ${d.sizeMB}MB ${d.index === this.activeIndex ? '(active)' : ''} ${!d.isAvailable ? '(unavailable)' : ''}`).join(', ');
    console.log(`📊 [DB] Sizes: ${summary}`);
  }

  startSizeMonitor() {
    // Initial refresh: connect all DBs and get real sizes (runs in background)
    setTimeout(() => this.refreshAllSizes().catch(e => console.error('DB refresh error:', e.message)), 3000);
    // First auto-switch check after 10s
    setTimeout(() => this.autoSwitch(), 10000);
    // Regular check every interval
    this.checkTimer = setInterval(() => this.autoSwitch(), CHECK_INTERVAL_MS);
    console.log(`⏱️ [DB] Size monitor started (check every ${Math.round(CHECK_INTERVAL_MS / 60000)}min, limit: ${DB_SIZE_LIMIT_MB}MB, warn at: ${DB_WARNING_THRESHOLD_MB}MB)`);
  }

  async getAllStatus() {
    // Return cached data immediately — don't open new connections to idle databases.
    // Only refresh the currently active DB (already connected, fast).
    const out = [];
    for (const db of this.databases) {
      let sizeMB = db.sizeMB || 0;
      // Only re-query the active database (it's already connected)
      if (db.index === this.activeIndex && db.client) {
        try {
          sizeMB = await this.checkDatabaseSize(db.client);
          db.sizeMB = sizeMB;
        } catch (_) { sizeMB = db.sizeMB || 0; }
      }
      out.push({
        index: db.index,
        sizeMB,
        isActive: db.index === this.activeIndex,
        isAvailable: db.isAvailable,
      });
    }
    return out;
  }

  async disconnectAll() {
    if (this.checkTimer) clearInterval(this.checkTimer);
    for (const db of this.databases) if (db.client) await db.client.$disconnect();
    if (this._fallback) await this._fallback.$disconnect();
  }
}

const dbManager = new DatabaseManager();

const prismaProxy = new Proxy({}, {
  get(target, prop) {
    if (prop === '__dbManager') return dbManager;
    if (prop === '$connect') return () => dbManager.initialize();
    if (prop === '$disconnect') return () => dbManager.disconnectAll();

    // Try active database client first
    const active = dbManager.databases[dbManager.activeIndex];
    if (active && active.client) {
      const val = active.client[prop];
      if (val !== undefined && val !== null) {
        // Prisma model delegates (prisma.user, prisma.post etc.) are objects, not functions.
        // Only bind if it's actually a function, otherwise return as-is.
        return typeof val === 'function' ? val.bind(active.client) : val;
      }
    }

    // Fallback to single-DB client
    if (!dbManager._fallback) {
      dbManager._fallback = new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });
    }
    const fval = dbManager._fallback[prop];
    return typeof fval === 'function' ? fval.bind(dbManager._fallback) : fval;
  }
});

module.exports = prismaProxy;
