# Apna Shahkot - Complete Project Documentation

> **A Comprehensive Guide for Beginners**
> 
> This documentation is written for developers who want to understand every aspect of the Shahkot App project. Whether you're preparing for technical interviews or learning full-stack development, this guide will help you understand every component.

---

# Table of Contents

1. [Project Overview](#section-1-project-overview)
2. [Technologies Used](#section-2-technologies-used)
3. [Frameworks and Libraries](#section-3-frameworks-and-libraries)
4. [Project Architecture](#section-4-project-architecture)

---

# SECTION 1: PROJECT OVERVIEW

## 1.1 What This Project Does

**Apna Shahkot** is a comprehensive **city-specific mobile application** built for the residents of Shahkot, a city in Punjab, Pakistan. It's essentially a "super app" that combines multiple features typically found in separate applications into one unified platform.

### The App Provides:

| Feature | Description |
|---------|-------------|
| **Social Feed** | Facebook-like posts with images, videos, likes, and comments |
| **Marketplace** | Buy & sell classified listings (like OLX) |
| **Job Board** | Local job postings and applications |
| **Matrimonial (Rishta)** | CNIC-verified matchmaking service |
| **Sports Tournaments** | Cricket, football, kabaddi tournament management |
| **News Section** | Local news articles |
| **Doctor Directory** | Find local doctors by specialty |
| **Restaurant Deals** | Food deals from local restaurants |
| **Blood Donation** | Emergency blood donor finder |
| **Government Directory** | Helplines and office information |
| **Shop Finder (Bazar)** | Find what product at which shop |
| **AI Chatbot** | Assistant to help navigate the app |
| **Direct Messaging** | Private 1-on-1 chat |
| **Open Chat Room** | Public community discussion |
| **Weather Updates** | Local weather forecasts |

## 1.2 The Problem It Solves

### Problems Faced by Small City Residents:

1. **Fragmented Digital Services**: Residents need multiple apps for different needs:
   - Facebook/Instagram for social
   - OLX for buying/selling
   - Rozee.pk for jobs
   - Different matrimonial apps
   - WhatsApp groups for local news

2. **Location Irrelevance**: Big apps show nationwide content, making it hard to find local information

3. **Trust Issues**: No verification system for matrimonial services leads to fake profiles

4. **Information Gap**: Difficult to find local government helplines, doctors, or shops selling specific items

5. **Community Disconnect**: No unified platform for local community engagement

### How Apna Shahkot Solves These:

```
┌─────────────────────────────────────────────────────────┐
│                    APNA SHAHKOT                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Social  │ │ Market- │ │  Jobs   │ │ Rishta  │       │
│  │  Feed   │ │  place  │ │  Board  │ │ (CNIC)  │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Sports  │ │  News   │ │ Doctors │ │  Govt   │       │
│  │Tourneys │ │         │ │         │ │ Offices │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│                                                         │
│         🔒 50 KM GEOFENCE - Local Users Only 🔒         │
└─────────────────────────────────────────────────────────┘
```

**Key Differentiator: Geofencing**
- Only users within 50 kilometers of Shahkot can register and use the app
- This ensures all content is locally relevant
- Uses GPS verification at registration and login

## 1.3 Target Users

### Primary Users:

| User Type | Age Range | Needs |
|-----------|-----------|-------|
| **Local Residents** | 18-45 | Social, marketplace, services |
| **Shop Owners** | 25-55 | List their shops, sell products |
| **Job Seekers** | 18-35 | Find local employment |
| **Families** | 25-50 | Matrimonial services, community |
| **Young Adults** | 18-30 | Social feed, tournaments, chat |
| **Business Owners** | 25-55 | Post jobs, restaurant deals |

### Secondary Users:

| User Type | Purpose |
|-----------|---------|
| **Admins** | Manage content, approve rishta profiles |
| **News Reporters** | Publish local news articles |
| **Restaurant Owners** | Manage their deals |
| **Doctors** | Will be listed in directory |

## 1.4 Real-World Use Case

### Scenario: Ahmed's Day Using Apna Shahkot

**Morning (8:00 AM)**
- Ahmed checks the **Weather** to plan his day
- Sees a **Notification** that his rishta profile was approved
- Browses matrimonial **Profiles** and sends interest to a match

**Afternoon (2:00 PM)**
- Ahmed's father needs medicine; he searches **Doctors** for a nearby physician
- Calls the doctor directly through the app's click-to-call feature
- Posts on the **Feed** asking if anyone has a used laptop for sale

**Evening (6:00 PM)**
- Ahmed checks the **Marketplace** and contacts a seller via WhatsApp
- Registers for an upcoming **Cricket Tournament** in his area
- Reads local **News** about a new government scheme

**Night (9:00 PM)**
- Chats in the **Open Chat Room** with community members
- Responds to a **DM** from someone interested in buying his old phone
- Uses the **AI Chatbot** to understand how to post a job listing

### Business Model

The app generates revenue through:

1. **Google AdMob Ads**
   - Banner ads displayed on most screens
   - Interstitial ads shown every 3rd screen navigation
   - App-open ads when returning to the app

2. **Future Monetization** (not yet implemented)
   - Featured listings
   - Premium accounts
   - Restaurant partnership fees

---

# SECTION 2: TECHNOLOGIES USED

## 2.1 Frontend Technologies

### 2.1.1 React Native

**What it is:**
React Native is a framework created by Facebook (Meta) that allows developers to build mobile applications using JavaScript and React. Instead of writing separate code for iOS and Android, you write one codebase that works on both platforms.

**How it works:**
```
┌─────────────────────────────────────────────────────────┐
│                   YOUR JAVASCRIPT CODE                   │
│              (React Native Components)                   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  REACT NATIVE BRIDGE                     │
│           (Translates JS to Native Code)                 │
└─────────────────────────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌─────────────────────┐    ┌─────────────────────┐
│    iOS (Swift/ObjC) │    │  Android (Kotlin)   │
│    Native UI        │    │    Native UI        │
└─────────────────────┘    └─────────────────────┘
```

**Why it was used in this project:**

1. **Cross-platform**: One codebase for both Android and iOS
2. **JavaScript ecosystem**: Access to npm packages
3. **Fast development**: Hot reload for instant changes
4. **Native performance**: Unlike web apps, uses actual native components

**Advantages:**

| Advantage | Explanation |
|-----------|-------------|
| **Cost-effective** | One team can build for both platforms |
| **Fast iteration** | Changes appear instantly during development |
| **Large community** | Many libraries and solutions available |
| **Native feel** | Uses actual native UI components |
| **JavaScript** | Easy to learn, widely known language |

**Disadvantages:**

| Disadvantage | Explanation |
|--------------|-------------|
| **Performance gaps** | Slightly slower than pure native |
| **Native modules needed** | Some features require native code |
| **Version compatibility** | Updates can break existing code |
| **Debugging complexity** | Issues can occur at bridge level |

**Alternatives NOT chosen:**

| Alternative | Why Not Chosen |
|-------------|----------------|
| **Flutter (Dart)** | Smaller ecosystem, less familiar language |
| **Native (Swift/Kotlin)** | Would double development time and cost |
| **Ionic/Cordova** | Web-based = worse performance |
| **PWA** | Can't access all native features (GPS, camera) |

### 2.1.2 Expo

**What it is:**
Expo is a platform built on top of React Native that simplifies mobile development. Think of it as "React Native with batteries included" - it provides pre-built tools for common tasks.

**How it works:**
```
┌─────────────────────────────────────────────────────────┐
│                    YOUR APP CODE                         │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      EXPO SDK                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Camera   │ │ Location │ │ Storage  │ │ Notifs   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Media    │ │ Updates  │ │ Fonts    │ │ And More │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    REACT NATIVE                          │
└─────────────────────────────────────────────────────────┘
```

**Why it was used in this project:**

1. **Pre-built APIs**: Camera, location, image picker work out of the box
2. **EAS Build**: Cloud-based build service (no need for Xcode/Android Studio locally)
3. **OTA Updates**: Push updates without app store resubmission
4. **Expo Go**: Test app on phone without building

**From the project's `app.json`:**
```json
{
  "expo": {
    "name": "Apna Shahkot",
    "slug": "NewShahkotApp",
    "version": "1.0.0",
    "plugins": [
      ["expo-location", {...}],
      ["expo-image-picker", {...}],
      ["react-native-google-mobile-ads", {...}]
    ]
  }
}
```

**Advantages:**

| Advantage | Explanation |
|-----------|-------------|
| **Faster setup** | No native toolchain needed to start |
| **Managed workflow** | Expo handles native complexity |
| **Cloud builds** | Build APK/IPA without Mac |
| **Over-the-air updates** | Fix bugs without store submission |
| **Documentation** | Excellent guides and examples |

**Disadvantages:**

| Disadvantage | Explanation |
|--------------|-------------|
| **Larger app size** | Includes entire Expo SDK (~50MB+) |
| **Limited native access** | Not all native modules work |
| **Build dependency** | Relies on Expo's build servers |
| **Performance overhead** | Extra layer adds slight overhead |

**Alternatives NOT chosen:**

| Alternative | Why Not Chosen |
|-------------|----------------|
| **Bare React Native** | More complex setup, requires native knowledge |
| **Expo Bare Workflow** | Project didn't need ejecting initially |

### 2.1.3 React Navigation

**What it is:**
React Navigation is the standard routing and navigation library for React Native apps. It handles moving between screens, managing navigation history, and providing native-feeling transitions.

**Navigation Types in This Project:**

```
┌─────────────────────────────────────────────────────────┐
│                   NAVIGATION STRUCTURE                   │
└─────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   STACK     │    │    TAB      │    │   MODAL     │
│ NAVIGATOR   │    │  NAVIGATOR  │    │ (In Screens)│
│             │    │             │    │             │
│ • Login     │    │ • Home      │    │ • Comments  │
│ • Splash    │    │ • Market    │    │ • New Post  │
│ • Details   │    │ • Explore   │    │ • Listing   │
│ • DM Chat   │    │ • Community │    │   Detail    │
│             │    │ • Profile   │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

**From the project's `App.js`:**
```javascript
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Buy & Sell" component={MarketplaceScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

**Why it was used:**

1. **Industry standard** for React Native navigation
2. **Multiple navigator types**: Stack, Tab, Drawer
3. **Deep linking support**: Open specific screens via URLs
4. **Native animations**: Smooth transitions

**Advantages:**

| Advantage | Explanation |
|-----------|-------------|
| **Declarative** | Define routes as JSX |
| **Customizable** | Full control over headers, tabs |
| **TypeScript support** | Type-safe navigation |
| **Active development** | Regular updates and fixes |

### 2.1.4 Axios

**What it is:**
Axios is a promise-based HTTP client for making API requests. It works in browsers and Node.js, making it perfect for React Native apps.

**How it works:**
```javascript
// Simple GET request
const response = await axios.get('https://api.example.com/users');

// POST request with data
const response = await axios.post('https://api.example.com/users', {
  name: 'Ahmed',
  email: 'ahmed@example.com'
});
```

**How the project uses it (from `api.js`):**
```javascript
// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Add auth token to every request automatically
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Why it was used:**

1. **Request interceptors**: Automatically add auth token
2. **Response interceptors**: Handle 401 errors globally
3. **Timeout support**: Configurable request timeouts
4. **Better error handling**: Detailed error responses

**Alternatives NOT chosen:**

| Alternative | Why Not Chosen |
|-------------|----------------|
| **fetch() API** | Basic, no interceptors, manual JSON parsing |
| **Superagent** | Less popular, similar features |
| **Got** | Not designed for browsers/React Native |

---

## 2.2 Backend Technologies

### 2.2.1 Node.js

**What it is:**
Node.js is a JavaScript runtime that allows running JavaScript code outside a browser. Before Node.js, JavaScript could only run in browsers. Now it can power servers, APIs, and command-line tools.

**How it works:**
```
┌─────────────────────────────────────────────────────────┐
│                     NODE.JS RUNTIME                      │
└─────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│                       V8 ENGINE                          │
│            (Same engine Chrome uses)                     │
└─────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│                    EVENT LOOP                            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │   Non-blocking I/O (Multiple requests at once)   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Event Loop Explained Simply:**
```
Traditional Server (PHP/Java):
  Request 1 → Wait for DB → Response 1
                           Request 2 → Wait for DB → Response 2
                                                      Request 3 → ...
  (Each request blocks the next)

Node.js Server:
  Request 1 → Start DB Query →                          → Response 1
  Request 2 → Start DB Query →        → Response 2
  Request 3 → Start DB Query → Response 3
  (All requests processed simultaneously)
```

**Why it was used in this project:**

1. **Same language (JavaScript)** for frontend and backend
2. **Non-blocking I/O**: Handles many concurrent requests efficiently
3. **NPM ecosystem**: Largest package repository
4. **Perfect for real-time**: Great for chat features

**Advantages:**

| Advantage | Explanation |
|-----------|-------------|
| **Fast** | V8 engine compiles to machine code |
| **Scalable** | Handles thousands of concurrent connections |
| **One language** | JavaScript everywhere |
| **Active community** | 2+ million npm packages |

**Disadvantages:**

| Disadvantage | Explanation |
|--------------|-------------|
| **Single-threaded** | CPU-intensive tasks can block |
| **Callback complexity** | Can lead to callback hell |
| **No typing** | TypeScript needed for type safety |

**Alternatives NOT chosen:**

| Alternative | Why Not Chosen |
|-------------|----------------|
| **Python (Django/Flask)** | Different language, fewer real-time features |
| **Java (Spring Boot)** | Heavier, more complex, overkill for this project |
| **Go** | Learning curve, smaller ecosystem for web apps |
| **PHP (Laravel)** | Legacy feel, less suited for real-time |

### 2.2.2 Express.js

**What it is:**
Express.js is a minimal web framework for Node.js. It provides tools for handling HTTP requests, routing, and middleware - the building blocks of any web server.

**How it works:**
```
HTTP Request
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│                     EXPRESS APP                          │
│                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │Middleware│→│Middleware│→│ Route   │→│Response │       │
│  │ (CORS)   │ │ (Auth)   │ │ Handler │ │         │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│                                                         │
└─────────────────────────────────────────────────────────┘
     │
     ▼
HTTP Response
```

**From the project's `server.js`:**
```javascript
const express = require('express');
const app = express();

// Middleware chain
app.use(helmet());           // Security headers
app.use(cors());             // Cross-origin requests
app.use(compression());      // Gzip responses
app.use(morgan('dev'));      // Request logging
app.use(express.json());     // Parse JSON bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/listings', listingRoutes);
// ... more routes

app.listen(8080);
```

**Core Concepts:**

**1. Routing:**
```javascript
// Define what happens for each URL
router.get('/posts', getAllPosts);      // GET /api/posts
router.post('/posts', createPost);      // POST /api/posts
router.delete('/posts/:id', deletePost); // DELETE /api/posts/123
```

**2. Middleware:**
```javascript
// Functions that run before your route handler
function authenticate(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'No token' });
  // ... verify token
  next(); // Continue to next middleware or route handler
}

// Use middleware
router.get('/protected', authenticate, (req, res) => {
  res.json({ message: 'You are authenticated!' });
});
```

**Why it was used:**

1. **Minimalist**: Only includes what you need
2. **Flexible**: Structure your app however you want
3. **Middleware ecosystem**: Thousands of pre-built middlewares
4. **Industry standard**: Most popular Node.js framework

**Advantages:**

| Advantage | Explanation |
|-----------|-------------|
| **Lightweight** | Fast startup, small footprint |
| **Flexible** | No forced structure |
| **Well documented** | Extensive guides |
| **Mature** | Reliable, battle-tested |

**Alternatives NOT chosen:**

| Alternative | Why Not Chosen |
|-------------|----------------|
| **Fastify** | Newer, smaller ecosystem |
| **Koa** | Less middleware available |
| **NestJS** | Overkill, adds TypeScript complexity |
| **Hapi** | More verbose, less popular |

### 2.2.3 PostgreSQL

**What it is:**
PostgreSQL (often called "Postgres") is a powerful, open-source relational database. It stores data in tables with rows and columns, using SQL (Structured Query Language) for queries.

**Relational Database Concept:**
```
┌─────────────────────────────────────────────────────────┐
│                        USERS TABLE                       │
├──────┬─────────┬─────────────────┬───────────┬─────────┤
│  id  │  name   │     email       │   role    │ created │
├──────┼─────────┼─────────────────┼───────────┼─────────┤
│  1   │ Ahmed   │ ahmed@mail.com  │ USER      │ 2024-01 │
│  2   │ Fatima  │ fatima@mail.com │ ADMIN     │ 2024-02 │
│  3   │ Ali     │ ali@mail.com    │ USER      │ 2024-03 │
└──────┴─────────┴─────────────────┴───────────┴─────────┘
                           │
                           │ userId references
                           ▼
┌─────────────────────────────────────────────────────────┐
│                        POSTS TABLE                       │
├──────┬────────┬──────────────────────────┬──────────────┤
│  id  │ userId │          text            │   created    │
├──────┼────────┼──────────────────────────┼──────────────┤
│  1   │   1    │ "My first post!"         │ 2024-01-15   │
│  2   │   1    │ "Another post"           │ 2024-01-20   │
│  3   │   3    │ "Hello Shahkot!"         │ 2024-03-01   │
└──────┴────────┴──────────────────────────┴──────────────┘
```

**Why it was used:**

1. **Data integrity**: ACID compliance (Atomic, Consistent, Isolated, Durable)
2. **Relationships**: Perfect for users ↔ posts ↔ comments ↔ likes
3. **Complex queries**: JOINs, aggregations, full-text search
4. **Scalability**: Handles millions of records
5. **Free & open-source**: No licensing costs

**From the project's schema:**
```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String?  @unique
  role      Role     @default(USER)
  
  // Relationships
  posts     Post[]
  comments  Comment[]
  likes     Like[]
  listings  Listing[]
}

model Post {
  id        String   @id @default(uuid())
  userId    String
  text      String?
  images    String[]
  
  // Relationship back to User
  user      User     @relation(fields: [userId], references: [id])
  comments  Comment[]
  likes     Like[]
}
```

**Advantages:**

| Advantage | Explanation |
|-----------|-------------|
| **ACID compliant** | Data never gets corrupted |
| **Rich data types** | JSON, arrays, UUID, and more |
| **Full-text search** | Built-in search capabilities |
| **Extensible** | Custom functions, extensions |
| **Well documented** | Extensive documentation |

**Disadvantages:**

| Disadvantage | Explanation |
|--------------|-------------|
| **Complexity** | Steeper learning curve than NoSQL |
| **Schema changes** | Migrations needed for updates |
| **Vertical scaling** | Horizontal scaling is complex |

**Alternatives NOT chosen:**

| Alternative | Why Not Chosen |
|-------------|----------------|
| **MongoDB** | Less suited for relational data (users → posts → comments) |
| **MySQL** | PostgreSQL has better JSON support and features |
| **SQLite** | Not suitable for production with multiple connections |
| **Firebase Firestore** | Vendor lock-in, less query flexibility |

### 2.2.4 Prisma ORM

**What it is:**
Prisma is an Object-Relational Mapping (ORM) tool that lets you interact with databases using JavaScript objects instead of raw SQL queries. It translates your code into SQL automatically.

**Without ORM vs With Prisma:**
```javascript
// WITHOUT ORM (Raw SQL)
const result = await db.query(`
  SELECT users.*, posts.*
  FROM users 
  JOIN posts ON posts.user_id = users.id
  WHERE users.id = '123'
`);
// Result: [[{...raw data...}], fields]
// You have to manually parse and structure

// WITH PRISMA
const user = await prisma.user.findUnique({
  where: { id: '123' },
  include: { posts: true }
});
// Result: { id: '123', name: 'Ahmed', posts: [{...}, {...}] }
// Fully typed, structured object
```

**Prisma Workflow:**
```
┌─────────────────────────────────────────────────────────┐
│  1. SCHEMA DEFINITION (schema.prisma)                    │
│     ┌────────────────────────────────────────────────┐  │
│     │ model User {                                    │  │
│     │   id    String @id @default(uuid())            │  │
│     │   name  String                                 │  │
│     │   posts Post[]                                 │  │
│     │ }                                              │  │
│     └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼ npx prisma generate
┌─────────────────────────────────────────────────────────┐
│  2. GENERATED CLIENT (Type-safe JavaScript)             │
│     prisma.user.findMany()                              │
│     prisma.user.create({ data: {...} })                 │
│     prisma.post.update({ where: {...}, data: {...} })   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼ npx prisma db push
┌─────────────────────────────────────────────────────────┐
│  3. DATABASE TABLES (PostgreSQL)                        │
│     CREATE TABLE "User" (id UUID, name TEXT, ...)       │
│     CREATE TABLE "Post" (id UUID, userId UUID, ...)     │
└─────────────────────────────────────────────────────────┘
```

**From the project's `schema.prisma`:**
```prisma
model User {
  id            String   @id @default(uuid())
  name          String
  phone         String?  @unique
  email         String?  @unique
  role          Role     @default(USER)
  
  posts         Post[]
  comments      Comment[]
  likes         Like[]
  listings      Listing[]
  // ... more relations
}

enum Role {
  USER
  VERIFIED_USER
  NEWS_REPORTER
  ADMIN
}
```

**Usage in route handlers:**
```javascript
// Create a new post
const post = await prisma.post.create({
  data: {
    userId: req.user.id,
    text: req.body.text,
    images: uploadedUrls,
  },
  include: {
    user: { select: { id: true, name: true, photoUrl: true } }
  }
});

// Find posts with pagination
const posts = await prisma.post.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
  include: {
    user: true,
    comments: { take: 3 },
    _count: { select: { likes: true, comments: true } }
  }
});
```

**Why it was used:**

1. **Type safety**: Auto-complete and error checking
2. **Schema as code**: Database structure in one file
3. **Migrations**: Track database changes over time
4. **Relation handling**: Easy to query related data
5. **Prisma Studio**: GUI to view/edit data

**Advantages:**

| Advantage | Explanation |
|-----------|-------------|
| **DX (Developer Experience)** | Excellent IDE integration |
| **Auto-complete** | Know what fields exist |
| **Less boilerplate** | No raw SQL for common ops |
| **Safe** | Prevents SQL injection |
| **Schema sync** | DB always matches schema |

**Alternatives NOT chosen:**

| Alternative | Why Not Chosen |
|-------------|----------------|
| **Sequelize** | More verbose, weaker TypeScript |
| **TypeORM** | More complex configuration |
| **Raw SQL** | Error-prone, no type safety |
| **Knex.js** | Query builder only, no schema |

---

## 2.3 Cloud Services

### 2.3.1 Cloudinary

**What it is:**
Cloudinary is a cloud-based media management service for storing, transforming, and delivering images and videos. It handles all the complexity of media optimization.

**How it works:**
```
┌─────────────────────────────────────────────────────────┐
│                     USER UPLOADS                         │
│                    (10 MB image)                         │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     YOUR BACKEND                         │
│     uploadToCloudinary(file, { width: 1080 })           │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      CLOUDINARY                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ • Stores original file                             │ │
│  │ • Compresses automatically                         │ │
│  │ • Converts to WebP (smaller)                       │ │
│  │ • Resizes to 1080px width                          │ │
│  │ • Serves via global CDN                            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  Returns: https://res.cloudinary.com/xxx/image/xxx.webp │
│                                                         │
│  Original: 10 MB → Optimized: 200 KB                   │
└─────────────────────────────────────────────────────────┘
```

**From the project's `cloudinaryUpload.js`:**
```javascript
async function uploadToCloudinary(file, folder = 'shahkot') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1080, crop: 'limit' },
          { quality: 'auto:good', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
}
```

**Why it was used:**

1. **Automatic optimization**: Images are compressed without quality loss
2. **Format conversion**: Automatically serves WebP/AVIF for modern browsers
3. **CDN delivery**: Fast loading worldwide
4. **Video support**: Handles video transcoding
5. **Free tier**: 25 credits/month (enough for small apps)

**The project uses multi-account rotation:**
```javascript
// When one Cloudinary account hits limit, switch to next
class CloudinaryManager {
  constructor() {
    this.accounts = [
      { cloud_name: 'account1', api_key: '...', api_secret: '...' },
      { cloud_name: 'account2', api_key: '...', api_secret: '...' },
    ];
    this.activeIndex = 0;
  }
  
  async autoSwitch() {
    const { credits } = await this.checkCredits(this.activeAccount);
    if (credits >= 20) {  // 80% of 25 free credits
      this.activeIndex = (this.activeIndex + 1) % this.accounts.length;
    }
  }
}
```

**Alternatives NOT chosen:**

| Alternative | Why Not Chosen |
|-------------|----------------|
| **AWS S3** | No automatic optimization, complex setup |
| **Firebase Storage** | No image transformations |
| **Self-hosted** | Requires server resources, no CDN |
| **Uploadcare** | Higher pricing |

### 2.3.2 Firebase Admin (Push Notifications)

**What it is:**
Firebase Cloud Messaging (FCM) is Google's service for sending push notifications to mobile devices. The app uses Firebase Admin SDK on the backend to send notifications.

**How Push Notifications Work:**
```
┌─────────────────────────────────────────────────────────┐
│                    MOBILE APP                            │
│  1. On install, gets FCM token from Google              │
│  2. Sends token to your backend via API                 │
│  3. Backend stores token with user ID                   │
└─────────────────────────────────────────────────────────┘

Later, when someone likes a post:

┌─────────────────────────────────────────────────────────┐
│                     BACKEND                              │
│  admin.messaging().send({                               │
│    token: userFCMToken,                                 │
│    notification: { title: 'New Like!', body: '...' }    │
│  });                                                    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 FIREBASE SERVERS                         │
│  Routes notification to correct device                  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   USER'S PHONE                           │
│  📱 *PING* "Ahmed liked your post"                      │
└─────────────────────────────────────────────────────────┘
```

**From the project's `firebase.js`:**
```javascript
const admin = require('firebase-admin');

// Load service account from environment variable
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
```

**Why it was used:**

1. **Free**: No cost for most use cases
2. **Reliable**: Google's infrastructure
3. **Cross-platform**: Works for Android and iOS
4. **Easy setup**: Well-documented SDK

### 2.3.3 AWS SES / Resend (Email)

**What it is:**
Email services for sending transactional emails (OTP codes, notifications). The project supports multiple providers with fallback.

**Email Flow:**
```
User registers → Backend generates OTP → Send OTP email

┌─────────────────────────────────────────────────────────┐
│                   EMAIL PRIORITY                         │
│                                                         │
│  1. Try Resend API   ──(if fails)──→                   │
│  2. Try AWS SES SDK  ──(if fails)──→                   │
│  3. Try SES SMTP (nodemailer) ──(if fails)──→          │
│  4. Return error                                        │
└─────────────────────────────────────────────────────────┘
```

**From the project's `email.js`:**
```javascript
async function sendEmail(to, subject, html) {
  // 1. Try Resend
  if (process.env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (res.ok) return { ok: true, provider: 'Resend' };
  }

  // 2. Try AWS SES SDK
  if (process.env.AWS_ACCESS_KEY_ID) {
    await sesClient.send(new SendEmailCommand({...}));
    return { ok: true, provider: 'AWS SES SDK' };
  }

  // 3. Try nodemailer/SMTP
  if (process.env.EMAIL_USER) {
    await transporter.sendMail({...});
    return { ok: true, provider: 'SES SMTP' };
  }

  return { ok: false, error: 'No email provider configured' };
}
```

**Why multiple providers:**

1. **Redundancy**: If one fails, try another
2. **Cost optimization**: Different providers have different pricing
3. **Deliverability**: SES has high deliverability rates

### 2.3.4 DigitalOcean App Platform

**What it is:**
DigitalOcean App Platform is a Platform-as-a-Service (PaaS) that deploys applications directly from GitHub. You push code, it builds and deploys automatically.

**Deployment Flow:**
```
┌─────────────────────────────────────────────────────────┐
│                    DEVELOPMENT                           │
│  1. Write code locally                                  │
│  2. git push origin main                                │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      GITHUB                              │
│  Webhook triggers DigitalOcean                          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 DIGITALOCEAN APP PLATFORM                │
│  1. Pulls code from GitHub                              │
│  2. Runs npm install                                    │
│  3. Runs npx prisma generate                            │
│  4. Starts app with node server.js                      │
│  5. Routes traffic to your app                          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│        https://lionfish-app-xxxx.ondigitalocean.app     │
│                     YOUR LIVE API                        │
└─────────────────────────────────────────────────────────┘
```

**Why it was used:**

1. **Simple deployment**: Just push to GitHub
2. **Managed infrastructure**: No server management
3. **HTTPS included**: Free SSL certificates
4. **Environment variables**: Easy secrets management
5. **Affordable**: $5/month basic plan

**From the project's configuration:**
- Backend URL: `https://lionfish-app-tkr7y.ondigitalocean.app/api`
- Auto-deploys on git push
- Environment variables set in DO dashboard

**Alternatives NOT chosen:**

| Alternative | Why Not Chosen |
|-------------|----------------|
| **Heroku** | More expensive after free tier removed |
| **AWS EC2** | Requires DevOps knowledge |
| **Vercel** | Better for frontend, limited backend |
| **Railway** | Less mature platform |

### 2.3.5 Neon (Database Hosting)

**What it is:**
Neon is a serverless PostgreSQL provider. It hosts PostgreSQL databases in the cloud with features like auto-scaling and branching.

**Why it was used:**

1. **Generous free tier**: 0.5 GB storage
2. **Serverless**: Scales to zero when idle (saves money)
3. **Modern features**: Database branching for testing
4. **Low latency**: Multiple regions available

**From the project's configuration:**
```env
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/shahkot_db"
```

**The project supports multiple databases:**
```javascript
// For scaling beyond one free database
class DatabaseManager {
  getDatabaseUrls() {
    if (process.env.DATABASE_URLS) {
      return process.env.DATABASE_URLS.split(',');
      // Multiple Neon databases for more storage
    }
    return [process.env.DATABASE_URL];
  }
}
```

---

## 2.4 Development Tools

### 2.4.1 Git & GitHub

**What it is:**
Git is a version control system that tracks changes to code. GitHub is a platform that hosts Git repositories and adds collaboration features.

**Git Workflow:**
```
┌─────────────────────────────────────────────────────────┐
│                   LOCAL DEVELOPMENT                      │
│                                                         │
│  1. git init                    // Start tracking       │
│  2. git add .                   // Stage changes        │
│  3. git commit -m "message"     // Save snapshot        │
│  4. git push origin main        // Upload to GitHub     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      GITHUB                              │
│  • Stores code history                                  │
│  • Triggers deployment                                  │
│  • Enables collaboration                                │
└─────────────────────────────────────────────────────────┘
```

### 2.4.2 VS Code

**What it is:**
Visual Studio Code is a code editor by Microsoft. It's the most popular editor for web development.

**Extensions used for this project:**
- Prisma (schema highlighting)
- ESLint (code linting)
- React Native Tools (debugging)
- Thunder Client (API testing)

### 2.4.3 Postman / Thunder Client

**What it is:**
Tools for testing API endpoints without needing a frontend.

**Example API Test:**
```
POST http://localhost:8080/api/auth/login
Headers:
  Content-Type: application/json
Body:
  {
    "email": "test@example.com",
    "password": "password123"
  }

Response:
  {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": "...", "name": "Test", ... }
  }
```

---

# SECTION 3: FRAMEWORKS AND LIBRARIES

## 3.1 Frontend Libraries (Detailed)

### 3.1.1 React (Core Concepts)

**React is the foundation of React Native. Understanding React is essential.**

**Concept 1: Components**

Components are reusable pieces of UI. Think of them as LEGO blocks.

```javascript
// A simple component
function WelcomeMessage({ userName }) {
  return (
    <View>
      <Text>Hello, {userName}!</Text>
    </View>
  );
}

// Using the component
<WelcomeMessage userName="Ahmed" />
// Renders: Hello, Ahmed!
```

**Concept 2: Props (Properties)**

Props are how components receive data from their parent.

```javascript
// Parent component
function App() {
  return (
    <PostCard 
      title="My First Post"
      author="Ahmed"
      likes={42}
    />
  );
}

// Child component receives props
function PostCard({ title, author, likes }) {
  return (
    <View>
      <Text>{title}</Text>
      <Text>By: {author}</Text>
      <Text>Likes: {likes}</Text>
    </View>
  );
}
```

**Concept 3: State**

State is data that can change over time. When state changes, the component re-renders.

```javascript
function LikeButton() {
  // useState hook creates state variable
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const handlePress = () => {
    if (isLiked) {
      setLikes(likes - 1);  // Decrease
    } else {
      setLikes(likes + 1);  // Increase
    }
    setIsLiked(!isLiked);   // Toggle
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Text>{isLiked ? '❤️' : '🤍'} {likes}</Text>
    </TouchableOpacity>
  );
}
```

**Concept 4: useEffect Hook**

useEffect runs code after component renders. Used for API calls, subscriptions, etc.

```javascript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Runs when component mounts or userId changes
  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const response = await api.get(`/users/${userId}`);
      setUser(response.data);
      setLoading(false);
    }
    fetchUser();
  }, [userId]);  // Dependency array - re-run when userId changes

  if (loading) return <Text>Loading...</Text>;
  return <Text>Welcome, {user.name}!</Text>;
}
```

**Concept 5: Context (Global State)**

Context allows sharing data across many components without passing props manually.

```javascript
// Create context
const AuthContext = createContext();

// Provider component wraps the app
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    setUser(response.data.user);
    setToken(response.data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Using context in any component
function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  
  return (
    <View>
      <Text>Hello, {user.name}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
```

### 3.1.2 React Native Components

**Basic Components:**

```javascript
import { 
  View,           // Container (like <div>)
  Text,           // Text display (like <p>)
  Image,          // Images (like <img>)
  ScrollView,     // Scrollable container
  FlatList,       // Efficient scrollable list
  TextInput,      // Input field (like <input>)
  TouchableOpacity, // Clickable container (like <button>)
  StyleSheet,     // Create styles
} from 'react-native';

function ExampleScreen() {
  const [text, setText] = useState('');
  const items = ['Apple', 'Banana', 'Cherry'];

  return (
    <View style={styles.container}>
      {/* Text display */}
      <Text style={styles.title}>Hello World</Text>
      
      {/* Image */}
      <Image 
        source={{ uri: 'https://example.com/image.jpg' }}
        style={styles.image}
      />
      
      {/* Input */}
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Type here..."
        style={styles.input}
      />
      
      {/* Clickable area */}
      <TouchableOpacity onPress={() => alert('Pressed!')}>
        <Text>Press Me</Text>
      </TouchableOpacity>
      
      {/* Efficient list */}
      <FlatList
        data={items}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Text>{item}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
});
```

### 3.1.3 Expo Libraries Used in This Project

**expo-location:**
```javascript
import * as Location from 'expo-location';

async function getLocation() {
  // Request permission
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  // Get current position
  const location = await Location.getCurrentPositionAsync({});
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}
```

**expo-image-picker:**
```javascript
import * as ImagePicker from 'expo-image-picker';

async function pickImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    quality: 0.8,
  });

  if (!result.canceled) {
    return result.assets; // Array of selected images
  }
  return [];
}
```

**expo-av (Audio/Video):**
```javascript
import { Video, Audio } from 'expo-av';

// Playing a video
<Video
  source={{ uri: 'https://example.com/video.mp4' }}
  style={{ width: 300, height: 200 }}
  useNativeControls
  resizeMode="contain"
/>

// Recording audio
const recording = new Audio.Recording();
await recording.prepareToRecordAsync();
await recording.startAsync();
// ... later
await recording.stopAndUnloadAsync();
const uri = recording.getURI();
```

### 3.1.4 AsyncStorage

**What it is:**
AsyncStorage is like localStorage for React Native - persistent key-value storage.

**Usage in the project:**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save data
await AsyncStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIs...');
await AsyncStorage.setItem('user', JSON.stringify(userData));

// Retrieve data
const token = await AsyncStorage.getItem('token');
const userString = await AsyncStorage.getItem('user');
const user = JSON.parse(userString);

// Remove data (on logout)
await AsyncStorage.removeItem('token');
await AsyncStorage.removeItem('user');
```

### 3.1.5 Google Mobile Ads (AdMob)

**How ads are implemented in this project:**

```javascript
// AdManager.js
import mobileAds, { 
  InterstitialAd, 
  AppOpenAd, 
  TestIds,
  AdEventType 
} from 'react-native-google-mobile-ads';

// Ad unit IDs
const AD_UNITS = {
  BANNER: 'ca-app-pub-9583068113931056/6555811508',
  INTERSTITIAL: 'ca-app-pub-9583068113931056/6196360069',
  APP_OPEN: 'ca-app-pub-9583068113931056/8766683089',
};

// Show interstitial every 3rd screen
let screenCount = 0;
function onScreenView() {
  screenCount++;
  if (screenCount % 3 === 0) {
    showInterstitial();
  }
}

// AdBanner component
function AdBanner({ size = 'BANNER' }) {
  return (
    <BannerAd
      unitId={AD_UNITS.BANNER}
      size={BannerAdSize[size]}
    />
  );
}
```

---

## 3.2 Backend Libraries (Detailed)

### 3.2.1 Express Middleware Used

**helmet (Security):**
```javascript
const helmet = require('helmet');
app.use(helmet());

// What helmet does:
// - Sets X-Content-Type-Options: nosniff
// - Sets X-Frame-Options: DENY
// - Removes X-Powered-By header
// - Sets Content-Security-Policy
// ... and more security headers
```

**cors (Cross-Origin Resource Sharing):**
```javascript
const cors = require('cors');
app.use(cors());

// Without CORS, your React Native app can't call the API
// because it's on a different domain
// CORS headers tell the browser it's OK to make the request
```

**morgan (Logging):**
```javascript
const morgan = require('morgan');
app.use(morgan('dev'));

// Logs each request:
// GET /api/posts 200 45ms
// POST /api/auth/login 200 123ms
// GET /api/users/123 404 12ms
```

**compression (Response Compression):**
```javascript
const compression = require('compression');
app.use(compression());

// Compresses response bodies using gzip
// A 100KB JSON response becomes ~15KB
// Faster downloads for users
```

**express-rate-limit:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000,                // limit each IP to 5000 requests
  message: { error: 'Too many requests' }
});

app.use('/api/', limiter);

// Prevents abuse and DDoS attacks
```

### 3.2.2 multer (File Uploads)

**What it is:**
Multer is middleware for handling multipart/form-data, used for file uploads.

**How it works:**
```
Client sends:
  POST /api/posts
  Content-Type: multipart/form-data
  [text field: caption]
  [file field: image1.jpg]
  [file field: image2.jpg]
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│                       MULTER                             │
│  • Parses the multipart data                            │
│  • Stores files in memory (buffer)                      │
│  • Makes files available as req.files                   │
│  • Makes text fields available as req.body              │
└─────────────────────────────────────────────────────────┘
               │
               ▼
Your route handler:
  req.body.caption = "My vacation"
  req.files = [
    { fieldname: 'images', buffer: <Buffer...>, mimetype: 'image/jpeg' },
    { fieldname: 'images', buffer: <Buffer...>, mimetype: 'image/jpeg' }
  ]
```

**From the project's `upload.js`:**
```javascript
const multer = require('multer');

// Store files in memory (not disk)
const storage = multer.memoryStorage();

// Filter to only allow images
const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);  // Accept
  } else {
    cb(new Error('Only images allowed'), false);  // Reject
  }
};

// Create upload middleware
const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024,  // 5MB max
    files: 5                     // Max 5 files
  }
});

// Usage in routes:
router.post('/posts', upload.array('images', 5), createPost);
//                    ↑ Accept up to 5 files in 'images' field
```

### 3.2.3 bcryptjs (Password Hashing)

**Why we hash passwords:**
```
WRONG (Plain text):
  database = { email: "ahmed@mail.com", password: "mypassword123" }
  // If database is hacked, passwords are exposed!

RIGHT (Hashed):
  database = { email: "ahmed@mail.com", password: "$2a$10$X3z..." }
  // Even if hacked, original password can't be recovered
```

**How it works:**
```javascript
const bcrypt = require('bcryptjs');

// Registration: Hash the password
const plainPassword = 'mypassword123';
const hashedPassword = await bcrypt.hash(plainPassword, 10);
// hashedPassword = "$2a$10$X3zK..." (random each time!)

// Store hashedPassword in database

// Login: Compare password
const inputPassword = 'mypassword123';
const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
// isMatch = true (correct password)

const wrongPassword = 'wrongpassword';
const isMatch2 = await bcrypt.compare(wrongPassword, hashedPassword);
// isMatch2 = false (wrong password)
```

**The "10" in hash() is the "salt rounds":**
- Higher = more secure but slower
- 10 is good balance
- Each hash takes ~100ms with 10 rounds

### 3.2.4 jsonwebtoken (JWT)

**What is JWT?**
JWT (JSON Web Token) is a way to securely transmit information between parties. It's used for authentication.

**JWT Structure:**
```
eyJhbGciOiJIUzI1NiIs.eyJ1c2VySWQiOiIxMjM.SflKxwRJSMeKKF2QT4fwp
  ↓                      ↓                     ↓
HEADER                 PAYLOAD               SIGNATURE
{                      {                     Encrypted with
  "alg": "HS256",        "userId": "123",    SECRET_KEY
  "typ": "JWT"           "exp": 1699999999
}                      }
```

**How it works in this project:**
```javascript
const jwt = require('jsonwebtoken');

// On login: Create token
const token = jwt.sign(
  { userId: user.id },           // Payload (data to encode)
  process.env.JWT_SECRET,        // Secret key (keep safe!)
  { expiresIn: '30d' }          // Optional: expires in 30 days
);

// Client stores token and sends with every request:
// Headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIs...' }

// On protected routes: Verify token
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { userId: '123', iat: 1699..., exp: 1700... }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

---

# SECTION 4: PROJECT ARCHITECTURE

## 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              APNA SHAHKOT ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                                    FRONTEND                                  │
│                         (React Native + Expo App)                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          PRESENTATION LAYER                            │  │
│  │   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │  │
│  │   │  Home   │ │ Market  │ │ Explore │ │Community│ │ Profile │        │  │
│  │   │ Screen  │ │ Screen  │ │ Screen  │ │ Screen  │ │ Screen  │        │  │
│  │   └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘        │  │
│  │        └──────────────────────┬──────────────────────────┘            │  │
│  └───────────────────────────────┼───────────────────────────────────────┘  │
│                                  │                                          │
│  ┌───────────────────────────────┼───────────────────────────────────────┐  │
│  │                          STATE LAYER                                   │  │
│  │   ┌─────────────────┐   ┌────┴────────────┐   ┌─────────────────┐     │  │
│  │   │   AuthContext   │   │   Component     │   │  AsyncStorage   │     │  │
│  │   │  (User, Token)  │   │     State       │   │   (Persist)     │     │  │
│  │   └─────────────────┘   └─────────────────┘   └─────────────────┘     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                  │                                          │
│  ┌───────────────────────────────┼───────────────────────────────────────┐  │
│  │                          SERVICE LAYER                                 │  │
│  │                    ┌──────────┴──────────┐                            │  │
│  │                    │     api.js          │                            │  │
│  │                    │  (Axios Instance)   │                            │  │
│  │                    │                     │                            │  │
│  │                    │  - Auth API         │                            │  │
│  │                    │  - Posts API        │                            │  │
│  │                    │  - Listings API     │                            │  │
│  │                    │  - Jobs API         │                            │  │
│  │                    │  - ... more         │                            │  │
│  │                    └──────────┬──────────┘                            │  │
│  └───────────────────────────────┼───────────────────────────────────────┘  │
└──────────────────────────────────┼──────────────────────────────────────────┘
                                   │
                         HTTPS (JSON over HTTP)
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                   BACKEND                                    │
│                      (Node.js + Express on DigitalOcean)                    │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          API GATEWAY LAYER                             │  │
│  │   ┌────────────────────────────────────────────────────────────────┐  │  │
│  │   │  Express App (server.js)                                        │  │  │
│  │   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │  │  │
│  │   │  │  helmet  │ │   cors   │ │  morgan  │ │  rate    │           │  │  │
│  │   │  │          │ │          │ │          │ │  limit   │           │  │  │
│  │   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │  │  │
│  │   └────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                  │                                          │
│  ┌───────────────────────────────┼───────────────────────────────────────┐  │
│  │                          ROUTE LAYER                                   │  │
│  │   /api/auth ─────────────────┼─────────────────> auth.js              │  │
│  │   /api/posts ────────────────┼─────────────────> posts.js             │  │
│  │   /api/listings ─────────────┼─────────────────> listings.js          │  │
│  │   /api/jobs ─────────────────┼─────────────────> jobs.js              │  │
│  │   /api/rishta ───────────────┼─────────────────> rishta.js            │  │
│  │   /api/admin ────────────────┼─────────────────> admin.js             │  │
│  │   ...                                                                  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                  │                                          │
│  ┌───────────────────────────────┼───────────────────────────────────────┐  │
│  │                          MIDDLEWARE LAYER                              │  │
│  │   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐             │  │
│  │   │ authenticate│     │  adminOnly  │     │geofenceCheck│             │  │
│  │   │   (JWT)     │     │             │     │             │             │  │
│  │   └─────────────┘     └─────────────┘     └─────────────┘             │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                  │                                          │
│  ┌───────────────────────────────┼───────────────────────────────────────┐  │
│  │                          DATA ACCESS LAYER                             │  │
│  │                      ┌────────┴────────┐                              │  │
│  │                      │   Prisma ORM    │                              │  │
│  │                      │                 │                              │  │
│  │                      │  prisma.user    │                              │  │
│  │                      │  prisma.post    │                              │  │
│  │                      │  prisma.listing │                              │  │
│  │                      │  ...            │                              │  │
│  │                      └────────┬────────┘                              │  │
│  └───────────────────────────────┼───────────────────────────────────────┘  │
└──────────────────────────────────┼──────────────────────────────────────────┘
                                   │
                           PostgreSQL Protocol
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               DATABASE                                       │
│                      (PostgreSQL on Neon Cloud)                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │   User   │   Post   │  Comment  │  Like   │  Listing  │ Tournament   │  │
│  │   Job    │  Doctor  │Restaurant │  Deal   │   News    │  BloodDonor  │  │
│  │  DMChat  │DMMessage │ChatMessage│Notific- │RishtaProf-│   Report     │  │
│  │          │          │           │  ation  │   ile     │              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                  │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │
│  │ Cloudinary  │  │   Firebase  │  │    AWS      │  │  freeimage.host │    │
│  │             │  │   (FCM)     │  │    SES      │  │                 │    │
│  │ Videos &    │  │ Push Notif- │  │ Email       │  │ Image Hosting   │    │
│  │ Audio       │  │ ications    │  │ Service     │  │ (Free)          │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘    │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐                                          │
│  │   AdMob     │  │ Open-Meteo  │                                          │
│  │             │  │             │                                          │
│  │ Ads Revenue │  │ Weather API │                                          │
│  │             │  │ (Free)      │                                          │
│  └─────────────┘  └─────────────┘                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4.2 Frontend Architecture

### 4.2.1 Folder Structure Explained

```
NewShahkotApp/
│
├── App.js                    # App entry point, navigation setup
├── app.json                  # Expo configuration
├── eas.json                  # EAS Build configuration
├── package.json              # Dependencies
│
├── assets/                   # Static assets
│   ├── icon.png             # App icon
│   ├── splash-icon.png      # Splash screen image
│   └── adaptive-icon.png    # Android adaptive icon
│
└── src/
    ├── components/           # Reusable UI components
    │   ├── PostCard.js      # Single post display
    │   ├── PostComposer.js  # Create new post modal
    │   ├── AdBanner.js      # AdMob banner wrapper
    │   ├── VerifiedBadge.js # Green checkmark badge
    │   ├── SkeletonLoader.js# Loading placeholders
    │   └── ImageViewer.js   # Full-screen image gallery
    │
    ├── config/
    │   └── constants.js     # API URL, colors, categories
    │
    ├── context/
    │   └── AuthContext.js   # Global auth state
    │
    ├── data/
    │   └── bloodDonors.js   # Static local blood donors
    │
    ├── screens/              # Full-page screens
    │   ├── HomeScreen.js
    │   ├── LoginScreen.js
    │   ├── FeedScreen.js
    │   ├── MarketplaceScreen.js
    │   ├── JobsScreen.js
    │   ├── RishtaScreen.js
    │   └── ... (25+ screens)
    │
    ├── services/
    │   └── api.js           # All API calls
    │
    └── utils/
        ├── geolocation.js   # Distance calculation
        └── AdManager.js     # Ad initialization & control
```

### 4.2.2 Navigation Flow

```
App Launch
    │
    ▼
SplashScreen (2.5 seconds)
    │
    ├── Is user authenticated? (Check AsyncStorage)
    │   │
    │   ├── NO ──────────────────────────▶ LoginScreen
    │   │                                      │
    │   │                                      ├── Location check
    │   │                                      │   └── Must be within 50km of Shahkot
    │   │                                      │
    │   │                                      ├── Login flow
    │   │                                      │   └── Email + Password
    │   │                                      │
    │   │                                      └── Register flow
    │   │                                          └── Email + OTP + Password
    │   │
    │   ▼
    └── YES ─────────────────────────────────────┐
                                                 │
                                                 ▼
                                          ┌─────────────────┐
                                          │   MainTabs      │
                                          │  (5 Bottom Tabs)│
                                          └─────────────────┘
                                                 │
         ┌───────────┬───────────┬───────────┬───────────┐
         ▼           ▼           ▼           ▼           ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
    │  Home   │ │  Buy &  │ │ Explore │ │Community│ │ Profile │
    │         │ │  Sell   │ │         │ │         │ │         │
    └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
         │           │           │           │           │
         │           │           │           │           │
     Navigates   Navigates   Navigates   Navigates   Navigates
       to:         to:         to:         to:         to:
         │           │           │           │           │
         ▼           ▼           ▼           ▼           ▼
    • Feed       • Listing  • Jobs      • Rishta    • Admin
    • News         Detail   • Doctors   • OpenChat    Dashboard
    • Tournaments• My       • Rest-     • DMList    • My Posts
    • Weather      Listings   aurants   • DMChat    • My
    • Blood      • Create   • Bazar     • AI Chat     Listings
    • Govt         Listing  • Weather
      Offices              • Helplines
```

### 4.2.3 State Management

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STATE MANAGEMENT OVERVIEW                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            GLOBAL STATE                                      │
│                         (React Context API)                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         AuthContext                                   │   │
│  │                                                                       │   │
│  │  STATE:                        ACTIONS:                               │   │
│  │  • user (object)               • login(email, password)              │   │
│  │  • token (string)              • register(name, email, password)     │   │
│  │  • loading (boolean)           • logout()                            │   │
│  │                                • updateUser(userData)                │   │
│  │  COMPUTED:                                                           │   │
│  │  • isAdmin (user.role === 'ADMIN')                                   │   │
│  │  • isVerified (user.role === 'VERIFIED_USER' || 'ADMIN')            │   │
│  │  • isAuthenticated (!!token)                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  PERSISTENCE: AsyncStorage                                                  │
│  • Token saved on login                                                     │
│  • User object saved on login                                               │
│  • Both cleared on logout                                                   │
│  • Loaded on app start                                                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            LOCAL STATE                                       │
│                     (useState in each component)                             │
│                                                                             │
│  EXAMPLE: FeedScreen.js                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  const [posts, setPosts] = useState([]);        // List of posts    │   │
│  │  const [loading, setLoading] = useState(true);  // Loading spinner  │   │
│  │  const [refreshing, setRefreshing] = useState(false); // Pull       │   │
│  │  const [page, setPage] = useState(1);           // Pagination       │   │
│  │  const [hasMore, setHasMore] = useState(true);  // Infinite scroll  │   │
│  │  const [newText, setNewText] = useState('');    // Post input       │   │
│  │  const [selectedImages, setSelectedImages] = useState([]); // Media │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  EXAMPLE: MarketplaceScreen.js                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  const [listings, setListings] = useState([]);                      │   │
│  │  const [category, setCategory] = useState(null);  // Filter         │   │
│  │  const [searchQuery, setSearchQuery] = useState('');                │   │
│  │  const [showCreateModal, setShowCreateModal] = useState(false);     │   │
│  │  const [selectedListing, setSelectedListing] = useState(null);      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4.3 Backend Architecture

### 4.3.1 Folder Structure Explained

```
backend/
│
├── server.js                 # Entry point proxy for DigitalOcean
├── package.json              # Dependencies
├── Procfile                  # Heroku/DO build command
│
├── prisma/
│   └── schema.prisma         # Database schema (all 25 models)
│
└── src/
    ├── server.js             # Main Express app
    │
    ├── config/
    │   ├── database.js       # Prisma client with multi-DB support
    │   ├── cloudinary.js     # Cloudinary with multi-account rotation
    │   └── firebase.js       # Firebase Admin initialization
    │
    ├── middleware/
    │   ├── auth.js           # JWT authentication
    │   └── geofence.js       # Location verification
    │
    ├── routes/
    │   ├── auth.js           # Login, register, profile
    │   ├── posts.js          # Social feed
    │   ├── listings.js       # Marketplace
    │   ├── jobs.js           # Job board
    │   ├── rishta.js         # Matrimonial
    │   ├── admin.js          # Admin dashboard
    │   ├── chat.js           # Open chat room
    │   ├── dm.js             # Direct messages
    │   ├── notifications.js  # User notifications
    │   └── ... (10+ more)
    │
    ├── utils/
    │   ├── cloudinaryUpload.js # Video/audio upload
    │   ├── imageUpload.js      # Image upload to freeimage.host
    │   ├── email.js            # Email sending
    │   ├── geolocation.js      # Haversine distance
    │   └── upload.js           # Multer configuration
    │
    └── seed.js               # Sample data seeder
```

### 4.3.2 Request Lifecycle

```
Mobile App sends request:
POST /api/posts
Headers: { Authorization: "Bearer eyJhbG..." }
Body: { text: "Hello!", images: [File1, File2] }

┌─────────────────────────────────────────────────────────────────────────────┐
│                         REQUEST LIFECYCLE                                    │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: Express receives request
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  GLOBAL MIDDLEWARE (runs on every request)                                   │
│                                                                             │
│  1. helmet()     → Add security headers                                     │
│  2. cors()       → Allow cross-origin requests                              │
│  3. compression()→ Enable gzip                                              │
│  4. morgan()     → Log "POST /api/posts"                                    │
│  5. express.json()→ Parse JSON body                                         │
│  6. rateLimit()  → Check if IP has exceeded limits                          │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
Step 2: Route matching
        app.use('/api/posts', postRoutes)
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ROUTE MIDDLEWARE (specific to this route)                                   │
│                                                                             │
│  router.post('/', authenticate, uploadMedia, createPost)                    │
│                    ↓                                                        │
│  1. authenticate  → Verify JWT token                                        │
│     • Extract token from Authorization header                               │
│     • jwt.verify(token, SECRET)                                             │
│     • Find user in database                                                 │
│     • Attach user to req.user                                               │
│                    ↓                                                        │
│  2. uploadMedia   → Parse multipart form data                               │
│     • Multer parses images from request                                     │
│     • Stores in memory (req.files)                                          │
│     • Validates file types and sizes                                        │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
Step 3: Route handler
┌─────────────────────────────────────────────────────────────────────────────┐
│  createPost function                                                         │
│                                                                             │
│  async function createPost(req, res) {                                      │
│    // 1. Extract data                                                       │
│    const { text } = req.body;                                               │
│    const userId = req.user.id;                                              │
│    const images = req.files;                                                │
│                                                                             │
│    // 2. Upload images to external service                                  │
│    const imageUrls = await uploadMultipleImages(images);                    │
│    // → HTTP request to freeimage.host                                      │
│    // → Returns URLs like ["https://iili.io/abc.webp", ...]                │
│                                                                             │
│    // 3. Save to database                                                   │
│    const post = await prisma.post.create({                                  │
│      data: { userId, text, images: imageUrls },                            │
│      include: { user: true }                                                │
│    });                                                                      │
│    // → Prisma generates SQL: INSERT INTO "Post" ...                       │
│    // → Executes against PostgreSQL                                         │
│                                                                             │
│    // 4. Return response                                                    │
│    res.status(201).json({ success: true, post });                          │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
Step 4: Response sent to client
{
  "success": true,
  "post": {
    "id": "uuid-123",
    "text": "Hello!",
    "images": ["https://iili.io/abc.webp", "https://iili.io/def.webp"],
    "user": { "id": "...", "name": "Ahmed", "photoUrl": "..." },
    "createdAt": "2024-01-15T..."
  }
}
```

### 4.3.3 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════════════╗
║                            REGISTRATION                                     ║
╚═══════════════════════════════════════════════════════════════════════════╝

Step 1: Request OTP
┌──────────────┐      POST /api/auth/send-otp      ┌──────────────┐
│   Mobile     │   { email: "ahmed@mail.com" }     │   Backend    │
│     App      │ ─────────────────────────────────▶│              │
└──────────────┘                                   └──────┬───────┘
                                                         │
                                                         ▼
                                               Generate 6-digit OTP
                                               Store in EmailOtp table
                                                         │
                                                         ▼
                                               ┌──────────────────┐
                                               │   AWS SES /      │
                                               │   Resend         │
                                               └────────┬─────────┘
                                                        │
                                                        ▼
                                               Email sent to user
                                               "Your code is: 123456"

Step 2: Register with OTP
┌──────────────┐      POST /api/auth/register      ┌──────────────┐
│   Mobile     │   {                               │   Backend    │
│     App      │     email: "ahmed@mail.com",      │              │
│              │     otp: "123456",                │              │
│              │     name: "Ahmed",                │              │
│              │     password: "secret123",        │              │
│              │     latitude: 31.97,              │              │
│              │     longitude: 73.48              │              │
│              │   }                               │              │
└──────────────┘ ─────────────────────────────────▶└──────┬───────┘
                                                         │
                                                         ▼
                                               1. Geofence check
                                                  (Is within 50km?)
                                                         │
                                                         ▼
                                               2. Verify OTP
                                                  (Check EmailOtp table)
                                                         │
                                                         ▼
                                               3. Hash password
                                                  bcrypt.hash(password, 10)
                                                         │
                                                         ▼
                                               4. Create user
                                                  prisma.user.create()
                                                         │
                                                         ▼
                                               5. Generate JWT
                                                  jwt.sign({userId})
                                                         │
                                                         ▼
┌──────────────┐   { token: "eyJ...", user: {...} }  ◀───┘
│   Mobile     │ ◀─────────────────────────────────
│     App      │
└──────────────┘
        │
        ▼
   Save token to AsyncStorage
   Navigate to HomeScreen

╔═══════════════════════════════════════════════════════════════════════════╗
║                               LOGIN                                         ║
╚═══════════════════════════════════════════════════════════════════════════╝

┌──────────────┐      POST /api/auth/login         ┌──────────────┐
│   Mobile     │   {                               │   Backend    │
│     App      │     email: "ahmed@mail.com",      │              │
│              │     password: "secret123",        │              │
│              │     latitude: 31.97,              │              │
│              │     longitude: 73.48              │              │
│              │   }                               │              │
└──────────────┘ ─────────────────────────────────▶└──────┬───────┘
                                                         │
                                                         ▼
                                               1. Geofence check
                                                         │
                                                         ▼
                                               2. Find user by email
                                                         │
                                                         ▼
                                               3. Compare password
                                                  bcrypt.compare()
                                                         │
                                                         ▼
                                               4. Generate JWT
                                                         │
                                                         ▼
┌──────────────┐   { token: "eyJ...", user: {...} }  ◀───┘
│   Mobile     │ ◀─────────────────────────────────
└──────────────┘

╔═══════════════════════════════════════════════════════════════════════════╗
║                        PROTECTED REQUEST                                    ║
╚═══════════════════════════════════════════════════════════════════════════╝

┌──────────────┐      GET /api/posts               ┌──────────────┐
│   Mobile     │   Headers: {                      │   Backend    │
│     App      │     Authorization:                │              │
│              │       "Bearer eyJhbGc..."         │              │
│              │   }                               │              │
└──────────────┘ ─────────────────────────────────▶└──────┬───────┘
                                                         │
                                                         ▼
                                               authenticate middleware:
                                                         │
                                               1. Extract token from header
                                               2. jwt.verify(token, SECRET)
                                               3. Decode: { userId: "123" }
                                               4. Find user: prisma.user.findUnique()
                                               5. Attach to request: req.user = user
                                               6. Call next()
                                                         │
                                                         ▼
                                               Route handler runs:
                                               Can access req.user
                                                         │
                                                         ▼
┌──────────────┐   { posts: [...] }              ◀───────┘
│   Mobile     │ ◀─────────────────────────────
└──────────────┘
```

---

## 4.4 Data Flow Examples

### 4.4.1 Creating a Post with Images

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CREATING A POST - COMPLETE FLOW                           │
└─────────────────────────────────────────────────────────────────────────────┘

USER ACTION:
User types "Beautiful sunset in Shahkot!" and selects 2 photos

┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (FeedScreen.js)                           │
└─────────────────────────────────────────────────────────────────────────────┘
│
│  // User taps "Post" button
│  const handleSubmit = async () => {
│    setLoading(true);
│    
│    // Create FormData (required for file upload)
│    const formData = new FormData();
│    formData.append('text', 'Beautiful sunset in Shahkot!');
│    
│    // Append each selected image
│    selectedImages.forEach((image, index) => {
│      formData.append('images', {
│        uri: image.uri,
│        type: 'image/jpeg',
│        name: `image${index}.jpg`
│      });
│    });
│    
│    // Call API
│    const result = await postsAPI.create(formData);
│    
│    if (result.success) {
│      // Add new post to top of feed
│      setPosts([result.post, ...posts]);
│      setNewText('');
│      setSelectedImages([]);
│    }
│    setLoading(false);
│  };
│
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ HTTP POST with multipart/form-data
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API SERVICE (api.js)                               │
└─────────────────────────────────────────────────────────────────────────────┘
│
│  // Axios interceptor adds auth token automatically
│  api.interceptors.request.use(async (config) => {
│    const token = await AsyncStorage.getItem('token');
│    config.headers.Authorization = `Bearer ${token}`;
│    return config;
│  });
│  
│  // API call
│  postsAPI: {
│    create: (formData) => api.post('/posts', formData, {
│      headers: { 'Content-Type': 'multipart/form-data' },
│      timeout: 300000  // 5 minutes for large uploads
│    })
│  }
│
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ HTTPS Request
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (posts.js route)                           │
└─────────────────────────────────────────────────────────────────────────────┘
│
│  // Route definition
│  router.post('/', 
│    authenticate,                    // 1. Verify JWT
│    uploadMedia.fields([             // 2. Parse files
│      { name: 'images', maxCount: 5 },
│      { name: 'videos', maxCount: 3 }
│    ]),
│    async (req, res) => {            // 3. Route handler
│      const { text } = req.body;
│      const userId = req.user.id;
│      const imageFiles = req.files?.images || [];
│      
│      // Upload images to freeimage.host
│      let imageUrls = [];
│      if (imageFiles.length > 0) {
│        imageUrls = await uploadMultipleImages(imageFiles);
│      }
│      
│      // Create post in database
│      const post = await prisma.post.create({
│        data: {
│          userId,
│          text,
│          images: imageUrls,
│          videos: []
│        },
│        include: {
│          user: {
│            select: { id: true, name: true, photoUrl: true, role: true }
│          }
│        }
│      });
│      
│      res.status(201).json({
│        success: true,
│        post: { ...post, likesCount: 0, commentsCount: 0, isLiked: false }
│      });
│    }
│  );
│
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ Image upload happens here
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     IMAGE UPLOAD (imageUpload.js)                            │
└─────────────────────────────────────────────────────────────────────────────┘
│
│  async function uploadMultipleImages(files) {
│    return Promise.all(files.map(file => uploadImage(file.buffer)));
│  }
│  
│  async function uploadImage(buffer) {
│    const base64 = buffer.toString('base64');
│    
│    // HTTP POST to freeimage.host
│    const response = await fetch('https://freeimage.host/api/1/upload', {
│      method: 'POST',
│      body: new URLSearchParams({
│        key: API_KEY,
│        source: base64,
│        format: 'json'
│      })
│    });
│    
│    const data = await response.json();
│    return data.image.url;  // "https://iili.io/JxyzAbc.webp"
│  }
│
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ Database insert
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE (PostgreSQL via Prisma)                      │
└─────────────────────────────────────────────────────────────────────────────┘
│
│  -- Generated SQL:
│  INSERT INTO "Post" (id, userId, text, images, videos, createdAt, updatedAt)
│  VALUES (
│    'uuid-abc-123',
│    'user-uuid-456',
│    'Beautiful sunset in Shahkot!',
│    ARRAY['https://iili.io/img1.webp', 'https://iili.io/img2.webp'],
│    ARRAY[]::text[],
│    NOW(),
│    NOW()
│  );
│
│  -- Then fetch with user data:
│  SELECT p.*, u.id, u.name, u.photoUrl, u.role
│  FROM "Post" p
│  JOIN "User" u ON p.userId = u.id
│  WHERE p.id = 'uuid-abc-123';
│
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ JSON Response
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RESPONSE TO FRONTEND                               │
└─────────────────────────────────────────────────────────────────────────────┘

{
  "success": true,
  "post": {
    "id": "uuid-abc-123",
    "userId": "user-uuid-456",
    "text": "Beautiful sunset in Shahkot!",
    "images": [
      "https://iili.io/img1.webp",
      "https://iili.io/img2.webp"
    ],
    "videos": [],
    "createdAt": "2024-01-15T18:30:00.000Z",
    "user": {
      "id": "user-uuid-456",
      "name": "Ahmed Khan",
      "photoUrl": "https://iili.io/profile.webp",
      "role": "USER"
    },
    "likesCount": 0,
    "commentsCount": 0,
    "isLiked": false
  }
}

┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND UPDATE                                    │
└─────────────────────────────────────────────────────────────────────────────┘
│
│  // Response received, update UI
│  setPosts([result.post, ...posts]);  // Add to top of feed
│  setLoading(false);
│  Toast.show({ text1: 'Post created!', type: 'success' });
│
│  // FlatList re-renders with new post at top
│  <FlatList
│    data={posts}
│    renderItem={({ item }) => <PostCard post={item} />}
│  />
│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.4.2 Geofencing Verification

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      GEOFENCING - HOW IT WORKS                               │
└─────────────────────────────────────────────────────────────────────────────┘

SHAHKOT CENTER COORDINATES:
  Latitude:  31.9712° N
  Longitude: 73.4818° E
  Radius:    50 kilometers

HAVERSINE FORMULA (calculates distance on a sphere):

  Given:
    - Point A (Shahkot center): lat1, lon1
    - Point B (User location): lat2, lon2

  Distance = 2 × R × arcsin(√(sin²((lat2-lat1)/2) + cos(lat1) × cos(lat2) × sin²((lon2-lon1)/2)))
  
  Where R = 6371 km (Earth's radius)

┌─────────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND CHECK (LoginScreen.js)                         │
└─────────────────────────────────────────────────────────────────────────────┘
│
│  // On screen mount, get user location
│  useEffect(() => {
│    checkLocation();
│  }, []);
│
│  const checkLocation = async () => {
│    // Request permission
│    const { status } = await Location.requestForegroundPermissionsAsync();
│    if (status !== 'granted') {
│      setLocationError('Please enable location services');
│      return;
│    }
│    
│    // Get current position
│    const location = await Location.getCurrentPositionAsync({});
│    const { latitude, longitude } = location.coords;
│    
│    // Check if within Shahkot (client-side check)
│    const result = isWithinShahkot(latitude, longitude);
│    
│    if (!result.isWithin) {
│      setLocationError(
│        `You are ${result.distance}km away from Shahkot. ` +
│        `App is only available within ${result.maxRadius}km.`
│      );
│    } else {
│      setUserLocation({ latitude, longitude });
│      setLocationValid(true);
│    }
│  };
│
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ Login request includes coordinates
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BACKEND CHECK (geofence.js middleware)                  │
└─────────────────────────────────────────────────────────────────────────────┘
│
│  function geofenceCheck(req, res, next) {
│    // Skip if disabled for testing
│    if (process.env.SKIP_GEOFENCE === 'true') {
│      return next();
│    }
│
│    const latitude = req.body.latitude || req.user?.latitude;
│    const longitude = req.body.longitude || req.user?.longitude;
│
│    if (!latitude || !longitude) {
│      return res.status(400).json({
│        error: 'Location is required',
│        code: 'LOCATION_REQUIRED'
│      });
│    }
│
│    const result = isWithinShahkot(latitude, longitude);
│
│    if (!result.isWithin) {
│      return res.status(403).json({
│        error: `You are ${result.distance}KM away from Shahkot.`,
│        code: 'OUTSIDE_GEOFENCE',
│        distance: result.distance,
│        maxRadius: result.maxRadius
│      });
│    }
│
│    next();
│  }
│
└─────────────────────────────────────────────────────────────────────────────┘

EXAMPLE SCENARIOS:

1. User in Shahkot City (31.97°N, 73.48°E)
   ┌─────────────────────────────────────────┐
   │  Distance from center: 0.5 km          │
   │  Within 50km radius: ✅ YES             │
   │  Result: Can use app                    │
   └─────────────────────────────────────────┘

2. User in Lahore (31.52°N, 74.35°E)
   ┌─────────────────────────────────────────┐
   │  Distance from center: ~95 km          │
   │  Within 50km radius: ❌ NO              │
   │  Result: Cannot login or register       │
   └─────────────────────────────────────────┘

3. User in Faisalabad (31.45°N, 73.14°E)
   ┌─────────────────────────────────────────┐
   │  Distance from center: ~65 km          │
   │  Within 50km radius: ❌ NO              │
   │  Result: Cannot login or register       │
   └─────────────────────────────────────────┘

4. User in Nankana Sahib (31.45°N, 73.70°E)
   ┌─────────────────────────────────────────┐
   │  Distance from center: ~48 km          │
   │  Within 50km radius: ✅ YES             │
   │  Result: Can use app                    │
   └─────────────────────────────────────────┘
```

---

## 4.5 Database Models Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DATABASE MODELS (25 total)                              │
└─────────────────────────────────────────────────────────────────────────────┘

                                 ┌─────────────┐
                                 │    User     │
                                 │             │
                                 │ • id        │
                                 │ • name      │
                                 │ • email     │
                                 │ • phone     │
                                 │ • password  │
                                 │ • role      │
                                 │ • photoUrl  │
                                 └──────┬──────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        │           │           │       │       │           │           │
        ▼           ▼           ▼       ▼       ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
   │  Post   │ │ Listing │ │   Job   │ │ Rishta  │ │  Blood  │ │  Shop   │
   │         │ │         │ │         │ │ Profile │ │  Donor  │ │         │
   └────┬────┘ └─────────┘ └────┬────┘ └────┬────┘ └─────────┘ └─────────┘
        │                       │           │
        │                       │           │
   ┌────┴────┐             ┌────┴────┐ ┌────┴────┐
   │         │             │   Job   │ │ Rishta  │
   │         │             │   App   │ │ Interest│
   ▼         ▼             └─────────┘ └─────────┘
┌─────────┐ ┌─────────┐
│ Comment │ │  Like   │
└─────────┘ └─────────┘

OTHER MODELS:
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│Tournament │ │   Match   │ │   News    │ │  Doctor   │
└───────────┘ └───────────┘ └───────────┘ └───────────┘

┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│Restaurant │ │   Deal    │ │GovtOffice │ │Notification│
└───────────┘ └───────────┘ └───────────┘ └───────────┘

┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│  DMChat   │ │ DMMessage │ │ChatMessage│ │  Report   │
└───────────┘ └───────────┘ └───────────┘ └───────────┘

┌───────────┐ ┌───────────┐
│  Block    │ │ EmailOTP  │
└───────────┘ └───────────┘
```

## 4.6 API Endpoint Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API ENDPOINTS OVERVIEW                               │
└─────────────────────────────────────────────────────────────────────────────┘

AUTHENTICATION (/api/auth)
├── POST /send-otp        → Send email OTP for registration
├── POST /register        → Create account with OTP verification
├── POST /login           → Login with email/password
├── POST /forgot-password → Request password reset OTP
├── POST /reset-password  → Reset password with OTP
├── GET  /profile         → Get current user profile
├── PUT  /profile         → Update profile
└── POST /profile/photo   → Upload profile picture

SOCIAL FEED (/api/posts)
├── GET  /                → Get paginated feed
├── GET  /videos          → Get video-only posts
├── POST /                → Create new post
├── POST /:id/like        → Toggle like
├── GET  /:id/comments    → Get post comments
├── POST /:id/comments    → Add comment
└── DELETE /:id           → Delete post (owner/admin)

MARKETPLACE (/api/listings)
├── GET  /                → Browse listings (filters: category, price)
├── GET  /my/all          → Get user's listings
├── GET  /:id             → Get listing detail
├── POST /                → Create listing
├── PUT  /:id             → Update listing
└── DELETE /:id           → Delete listing

JOBS (/api/jobs)
├── GET  /                → Browse jobs
├── GET  /categories      → Get job categories with counts
├── GET  /my              → Get user's posted jobs
├── GET  /:id             → Get job detail
├── POST /                → Post new job
├── PUT  /:id             → Update job
├── DELETE /:id           → Delete job
├── POST /:id/apply       → Apply for job
└── GET  /:id/applications → View applicants (job owner only)

MATRIMONIAL (/api/rishta)
├── GET  /agreement       → Get legal agreement text
├── GET  /my-profile      → Get user's rishta profile
├── POST /apply           → Submit rishta application
├── POST /upload-photos   → Add photos to profile
├── GET  /profiles        → Browse verified profiles
├── POST /interest/:id    → Send interest
├── GET  /interests       → Get received interests
├── GET  /sent-interests  → Get sent interests
├── PUT  /interest/:id/accept → Accept interest
├── PUT  /interest/:id/reject → Reject interest
├── POST /shortlist/:id   → Add to shortlist
├── GET  /shortlisted     → Get shortlisted profiles
└── DELETE /my-profile    → Delete profile

ADMIN (/api/admin)
├── GET  /dashboard       → Get dashboard stats
├── GET  /users           → List all users
├── PUT  /users/:id/toggle-active → Enable/disable user
├── DELETE /users/:id     → Delete user
├── GET  /rishta/pending  → Pending applications
├── PUT  /rishta/:id/approve → Approve application
├── PUT  /rishta/:id/reject  → Reject application
├── POST /cleanup         → Clean old data
└── GET  /storage         → Get storage stats

...and more endpoints for:
- /api/notifications
- /api/chat (open chat room)
- /api/dm (direct messages)
- /api/blood
- /api/doctors
- /api/restaurants
- /api/tournaments
- /api/news
- /api/shops
- /api/govt-offices
- /api/reports
- /api/chatbot
```

---

## Summary

This documentation covered the first four major sections:

1. **Project Overview** - What Apna Shahkot does, problems it solves, and target users
2. **Technologies Used** - Detailed explanation of every technology with pros/cons/alternatives
3. **Frameworks and Libraries** - Deep dive into React, React Native, Express, Prisma, and more
4. **Project Architecture** - Complete system design, data flows, and component interactions

The app demonstrates a full-stack architecture with:
- **Frontend**: React Native + Expo for cross-platform mobile development
- **Backend**: Node.js + Express for RESTful API
- **Database**: PostgreSQL with Prisma ORM for data management
- **Cloud Services**: Cloudinary (media), Firebase (notifications), AWS SES (email), DigitalOcean (hosting)

Key architectural decisions:
- Geofencing restricts app to 50km radius around Shahkot
- JWT-based authentication with role-based access control
- Multi-account rotation for Cloudinary and database scaling
- Real-time features through polling (chat, notifications)
- AdMob integration for monetization

This foundation prepares you to understand and explain the project confidently in technical interviews.

---

# SECTION 5: FOLDER STRUCTURE

In this section, we will slow down and understand the **physical structure of the codebase**.

When beginners look at a project, one of the most confusing things is:

- Which folder does what?
- Where does the app start?
- Where is the backend?
- Where is the database schema?
- Where do uploads happen?
- Which files are reusable and which files are full screens?

This section answers all of that.

Think of the project like a building:

- **Frontend** = the visible rooms where users interact
- **Backend** = the control room and business office behind the scenes
- **Database schema** = the filing system
- **Config files** = the switches, settings, and wiring
- **Docs** = the manual for understanding the building

---

## 5.1 Root Folder Structure

At the top level, the project contains these major folders:

```text
Shahkot/
├── README.md
├── backend/
├── docs/
└── NewShahkotApp/
```

Let us understand each one.

### `README.md`

This is the project's quick-start guide.

It explains:

- what the project is
- how to install dependencies
- how to run the backend
- how to run the app
- what the app features are
- what environment variables are needed

**Why this file exists:**

Every project needs an entry document for developers. If somebody opens the repository for the first time, this is the first place they should look.

---

### `backend/`

This folder contains the **Node.js + Express API server**.

This is where:

- authentication happens
- posts are created
- listings are stored
- database queries run
- files are uploaded
- emails are sent
- notifications are created

You can think of this folder as the **brain of the application**.

---

### `NewShahkotApp/`

This folder contains the **React Native + Expo mobile app**.

This is the user-facing application.

It includes:

- login screen
- home screen
- feed screen
- marketplace screen
- jobs screen
- rishta screen
- chat screens
- admin dashboard screen

You can think of this folder as the **face and body of the application**.

---

### `docs/`

This folder contains documentation and static documents.

Files include:

- `PROJECT_DOCUMENTATION.md`
- `privacy-policy.html`
- `index.html`

**Why this folder matters:**

It helps explain the app to developers, reviewers, interviewers, or users.

---

## 5.2 Backend Folder Structure Explained

Now let us go inside the backend.

```text
backend/
├── firebase-service-account.json
├── package.json
├── Procfile
├── server.js
├── prisma/
├── scripts/
└── src/
```

---

### `backend/package.json`

This file defines:

- the backend project name
- scripts to run the server
- dependencies
- dev dependencies

Important scripts:

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "postinstall": "npx prisma generate",
  "build": "npx prisma generate",
  "db:generate": "npx prisma generate",
  "db:migrate": "npx prisma migrate dev",
  "db:push": "npx prisma db push",
  "db:studio": "npx prisma studio",
  "db:seed": "node src/seed.js"
}
```

### What each script does

#### `npm run dev`
Runs the backend with `nodemon`.

**Why useful:**
Whenever you save a file, the server restarts automatically.

#### `npm start`
Runs the backend in production mode.

#### `npm run db:generate`
Generates the Prisma client based on `schema.prisma`.

#### `npm run db:push`
Pushes the schema directly into the database.

#### `npm run db:migrate`
Creates a proper migration.

#### `npm run db:seed`
Inserts starter data like offices, shops, and doctors.

---

### `backend/server.js`

This is a small proxy file:

```javascript
require('./src/server.js');
```

**Why this exists:**

Some hosting platforms run `node server.js` from the backend root.
This file forwards execution to the real server inside `src/server.js`.

This is a deployment convenience file.

---

### `backend/Procfile`

```text
web: node src/server.js
```

This tells a hosting platform how to start the app.

**Why this exists:**

Platforms like Heroku-style systems or some PaaS tools look for this file to know the startup command.

---

### `backend/firebase-service-account.json`

This file usually contains private Firebase credentials.

**Important note:**
This type of file should usually not be committed publicly because it contains secrets.

In production, this project also supports passing the same credentials through environment variables.

---

## 5.3 Backend Prisma Folder

```text
backend/prisma/
└── schema.prisma
```

### `schema.prisma`

This is one of the most important files in the entire backend.

It defines:

- the database provider (`postgresql`)
- the Prisma generator
- enums
- all database models
- relationships between models
- indexes

This file is the **source of truth for data structure**.

If you want to know what data the app stores, this file is the best place to look.

---

## 5.4 Backend Scripts Folder

```text
backend/scripts/
├── reset-all-dbs.js
├── set-password.js
└── setup-all-dbs.js
```

These are helper scripts.

### `reset-all-dbs.js`
Likely used to reset all configured databases when the project is using multiple database URLs.

### `set-password.js`
Likely used to update or set a user password from the command line.

### `setup-all-dbs.js`
Likely used to prepare multiple databases in a scaled setup.

**Why these matter:**

They show the project was designed not only for local development but also for operations and maintenance.

---

## 5.5 Backend Source Folder

```text
backend/src/
├── seed.js
├── server.js
├── config/
├── generated/
├── middleware/
├── routes/
└── utils/
```

This is the real backend application code.

---

### `backend/src/server.js`

This is the true main backend file.

It:

- loads environment variables
- initializes Firebase
- creates the Express app
- adds middleware
- registers routes
- creates health endpoints
- starts the server
- handles graceful shutdown

**You can think of this file as the backend's main switchboard.**

---

### `backend/src/seed.js`

This file inserts starter records into the database.

Examples from this file:

- government offices
- shops
- doctors

**Why it exists:**

Without seed data, the app would look empty after first install.
This file helps the project start with realistic local data.

---

## 5.6 Backend Config Folder

```text
backend/src/config/
├── cloudinary.js
├── database.js
└── firebase.js
```

These files configure external services and the database connection.

### `database.js`

Purpose:

- create Prisma clients
- manage one or more databases
- monitor size of each database
- switch to another database when one gets too large

This is an advanced file.

Most beginner projects use only one database connection.
This project adds a **database manager** that can rotate across multiple databases.

That is an interesting interview point because it shows practical scaling thinking.

### `cloudinary.js`

Purpose:

- configure Cloudinary credentials
- support multiple Cloudinary accounts
- monitor usage credits
- switch accounts automatically when usage grows too much

This is also an advanced design.

### `firebase.js`

Purpose:

- initialize Firebase Admin SDK
- load service account from JSON file or environment variable
- enable push notifications

---

## 5.7 Backend Middleware Folder

```text
backend/src/middleware/
├── auth.js
└── geofence.js
```

Middleware means a function that runs **before** the final route handler.

### `auth.js`

Contains:

- `authenticate`
- `adminOnly`
- `verifiedOnly`
- `reporterOnly`

This file controls access.

### `geofence.js`

Contains:

- `geofenceCheck`

This checks whether the user is physically within the allowed area near Shahkot.

This middleware is one of the app's main identity features.

---

## 5.8 Backend Routes Folder

```text
backend/src/routes/
├── admin.js
├── auth.js
├── blood.js
├── chat.js
├── chatbot.js
├── dm.js
├── doctors.js
├── govtOffices.js
├── jobs.js
├── listings.js
├── news.js
├── notifications.js
├── police.js
├── posts.js
├── reports.js
├── restaurants.js
├── rishta.js
├── shops.js
└── tournaments.js
```

Each route file is responsible for one feature domain.

This is a good backend design because it keeps the code organized.

### `auth.js`
Handles registration, login, OTP, forgot password, reset password, and profile updates.

### `posts.js`
Handles community feed posts, likes, comments, and deletion.

### `listings.js`
Handles buy/sell marketplace listings.

### `tournaments.js`
Handles sports tournaments and matches.

### `govtOffices.js`
Handles local government office records.

### `shops.js`
Handles bazar/shop finder data.

### `rishta.js`
Handles matrimonial applications, interests, and shortlists.

### `news.js`
Handles news posting and reading.

### `admin.js`
Handles admin dashboards, moderation, and cleanup actions.

### `notifications.js`
Handles reading notifications and marking them as read.

### `blood.js`
Handles blood donor registration and discovery.

### `chat.js`
Handles public open chat messages.

### `chatbot.js`
Handles AI chatbot messaging using an external AI API.

### `dm.js`
Handles direct messaging between users.

### `jobs.js`
Handles job posting, job browsing, and job applications.

### `reports.js`
Handles reporting abusive or inappropriate content.

### `doctors.js`
Handles doctor directory data.

### `restaurants.js`
Handles restaurant records and restaurant owner deals.

### `police.js`
Handles police announcements.

---

## 5.9 Backend Utils Folder

```text
backend/src/utils/
├── cloudinaryUpload.js
├── email.js
├── geolocation.js
├── imageUpload.js
├── upload.js
```

These files contain reusable helper logic.

### `cloudinaryUpload.js`

Responsible for:

- uploading images to Cloudinary
- uploading videos to Cloudinary
- uploading audio to Cloudinary
- deleting files from Cloudinary

### `email.js`

Responsible for:

- sending general email
- sending rishta approval email
- sending rishta rejection email

### `geolocation.js`

Responsible for:

- distance calculation using Haversine formula
- checking if a location is inside Shahkot geofence

### `imageUpload.js`

Responsible for:

- uploading images to freeimage.host

Interesting design detail:

- image uploads go to freeimage.host
- video and audio uploads go to Cloudinary

This likely helps control hosting costs.

### `upload.js`

Responsible for:

- configuring `multer`
- limiting file sizes
- filtering allowed image/video types
- defining upload strategies for different features

---

## 5.10 Frontend Folder Structure Explained

Now let us explore the mobile app folder.

```text
NewShahkotApp/
├── App.js
├── app.json
├── eas.json
├── index.js
├── package.json
├── assets/
└── src/
```

---

### `App.js`

This is the main frontend entry file.

It does several critical things:

- wraps the app in `AuthProvider`
- sets up the navigation container
- shows splash screen first
- decides whether user sees login flow or main app flow
- initializes ads

This is one of the most important frontend files.

---

### `index.js`

This is the React Native entry point that tells Expo which root component to load.

Usually this file is small and simply registers `App`.

---

### `app.json`

This is the Expo app configuration file.

It defines:

- app name
- app slug
- version
- splash configuration
- Android package name
- iOS bundle identifier
- permissions
- plugins

This file is important for mobile build behavior.

---

### `eas.json`

This file defines build profiles for Expo Application Services.

Profiles in this project include:

- `simulator`
- `preview`
- `production`

Each profile can define:

- environment variables
- platform-specific build type
- release settings

---

### `package.json`

This file defines frontend dependencies such as:

- Expo
- React Native
- React Navigation
- Axios
- Expo AV
- AsyncStorage
- AdMob library

---

## 5.11 Frontend Source Folder

```text
NewShahkotApp/src/
├── components/
├── config/
├── context/
├── data/
├── screens/
├── services/
└── utils/
```

### `components/`

Contains reusable UI pieces.

This is different from full screens.

Examples:

- `PostCard.js` = display a single social post
- `PostComposer.js` = create a new post
- `AdBanner.js` = show an ad
- `SkeletonLoader.js` = loading placeholder
- `ImageViewer.js` = full-screen image gallery
- `VerifiedBadge.js` = verified user badge

**Why components matter:**

If you repeat UI code across multiple screens, your app becomes hard to maintain. Components let you reuse logic and design.

---

### `config/`

Contains global constants.

Example file:

- `constants.js`

This stores:

- API base URL
- Shahkot center coordinates
- geofence radius
- app name and version
- listing categories
- sport types
- doctor specialties
- colors and fonts

This is important because it keeps hardcoded values in one place.

---

### `context/`

Contains React Context state management.

Example:

- `AuthContext.js`

This file manages:

- logged-in user
- auth token
- loading state
- login
- logout
- registration
- role helpers

---

### `data/`

Contains static local data.

Example:

- `bloodDonors.js`

This may be used for initial display, fallback behavior, or demo content.

---

### `screens/`

Contains full-page UI screens.

These are the actual pages users navigate to.

Examples:

- `LoginScreen.js`
- `HomeScreen.js`
- `FeedScreen.js`
- `MarketplaceScreen.js`
- `JobsScreen.js`
- `RishtaScreen.js`
- `OpenChatScreen.js`
- `DMListScreen.js`
- `DMChatScreen.js`
- `AdminDashboardScreen.js`

The screens folder is the largest part of the frontend because each business feature usually needs one or more screens.

---

### `services/`

Contains API communication logic.

Example:

- `api.js`

Instead of making raw axios calls scattered all over the app, this project centralizes endpoint functions in one service file.

That is a good design decision.

---

### `utils/`

Contains helper logic that is not a screen and not an API service.

Examples:

- `geolocation.js`
- `AdManager.js`
- `AdManager.web.js`

---

## 5.12 Docs Folder

```text
docs/
├── index.html
├── privacy-policy.html
└── PROJECT_DOCUMENTATION.md
```

### `index.html`

Likely a public-facing documentation or landing file.

### `privacy-policy.html`

Used for privacy policy display, possibly for app store review or web publication.

### `PROJECT_DOCUMENTATION.md`

This file is your learning document.

---

# SECTION 6: IMPORTANT CODE FILES

Now we move from folder-level understanding to **file-level understanding**.

We will explain the most important code files step by step.

---

## 6.1 Frontend: `App.js`

This file is the starting point of the mobile app.

### Main responsibilities

1. Wrap the entire app with authentication context
2. Set up navigation
3. Show splash screen first
4. Decide whether user sees login flow or authenticated flow
5. Initialize ads
6. Track screen changes for ad logic

### Why this file exists

Every React Native app needs a root component. This file is the root coordinator.

### Beginner mental model

Think of `App.js` as the person standing at the entrance of a shopping mall asking:

- Are you logged in?
- Which section do you want to go to?
- Should we show the welcome screen first?
- Should ads be initialized?

### Logical flow

```text
App starts
  ↓
AuthProvider wraps whole app
  ↓
NavigationContainer starts
  ↓
SplashScreen shown briefly
  ↓
If logged in → main tabs
If not logged in → login screen
```

### Why this design is good

- keeps startup logic centralized
- makes auth flow easy to understand
- avoids duplication in screen setup

---

## 6.2 Frontend: `src/context/AuthContext.js`

This file manages authentication state globally.

### Why it exists

Many parts of the app need to know:

- who is the current user?
- is the user logged in?
- is the user admin?
- what token should API requests use?

Without context, you would have to pass these values through many layers of components.

That would become messy.

### Core responsibilities

- load token and user from AsyncStorage on app start
- expose `login()`
- expose `register()`
- expose `logout()`
- expose `updateUser()`
- compute helper values like `isAdmin`

### Key logic

#### On app startup

It checks if token and user data already exist in storage.

If they do:

- user stays logged in
- app opens directly to authenticated flow

If they do not:

- login screen appears

#### `login(data)`

What it does:

1. Sends login request to backend
2. Receives JWT token and user object
3. Stores them in AsyncStorage
4. Updates context state

Why it exists:

Without this function, every screen would need to manually manage login state.

#### `register(data)`

What it does:

1. Sends registration request
2. Receives token and user
3. Stores them
4. Logs the user in immediately after registration

This creates a smoother user experience.

#### `logout()`

What it does:

1. clears token from storage
2. clears user from storage
3. resets auth state
4. sends user back to login flow

#### `updateUser(user)`

What it does:

- updates local user object after profile change
- keeps storage in sync

This is useful when profile photo or personal info changes.

---

## 6.3 Frontend: `src/services/api.js`

This is one of the most important frontend files.

### Why it exists

The app needs to talk to many backend endpoints.

Instead of writing axios request code inside every screen, this file centralizes API communication.

That gives several benefits:

- cleaner screens
- easier maintenance
- easier token handling
- easier base URL changes
- easier timeout and error handling

### Main responsibilities

1. create one shared Axios client
2. set `baseURL`
3. attach auth token automatically
4. handle unauthorized responses globally
5. export API groups like:
   - `authAPI`
   - `postsAPI`
   - `listingsAPI`
   - `jobsAPI`
   - `dmAPI`
   - `restaurantsAPI`

### Key logic

#### Axios request interceptor

This automatically reads the token from AsyncStorage and adds it to the request.

Problem it solves:

Without this, every API request would need to manually write the `Authorization` header.

#### Axios response interceptor

This catches `401 Unauthorized` responses.

Problem it solves:

If token expires or becomes invalid, the app should automatically log the user out instead of staying in a broken state.

### Example benefit

Without service file:

```javascript
axios.get('/posts', { headers: { Authorization: 'Bearer ...' } })
axios.get('/jobs', { headers: { Authorization: 'Bearer ...' } })
axios.get('/news', { headers: { Authorization: 'Bearer ...' } })
```

With service file:

```javascript
postsAPI.getAll()
jobsAPI.getAll()
newsAPI.getAll()
```

Much cleaner.

---

## 6.4 Frontend: `src/config/constants.js`

This file stores configuration constants used throughout the app.

### Why it exists

Imagine if these values were repeated in 30 files:

- API URL
- app name
- colors
- categories
- coordinates

That would be hard to change later.

By centralizing them here, the app becomes maintainable.

### Important groups in this file

#### API configuration

- base API URL
- production vs development handling

#### Geofence configuration

- Shahkot center latitude
- Shahkot center longitude
- radius in kilometers

#### Category constants

- marketplace categories
- job categories
- job types
- news categories
- sport types
- doctor specialties

#### Theme constants

- colors
- font sizes

Problem this solves:

Consistency.

If every screen manually defined categories or colors, the app would quickly become inconsistent.

---

## 6.5 Backend: `src/server.js`

This is the central backend startup file.

### Main responsibilities

1. load `.env`
2. initialize Firebase
3. create Express app
4. add security middleware
5. add parsers
6. add rate limiting
7. add health endpoints
8. register all feature routes
9. handle errors
10. start HTTP server
11. handle graceful shutdown
12. run cleanup jobs

### Why it exists

Every backend app needs one main file to assemble the system.

### Important logic inside this file

#### Security middleware

```javascript
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
```

Problem solved:

- improve security
- allow mobile app requests
- reduce response size
- log requests for debugging

#### Request body parsing

```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

Problem solved:

This allows Express to understand JSON and form bodies.

#### Rate limiter

This protects API from spam or too many requests.

#### Health endpoints

- `/api/health`
- `/api/db-status`
- `/api/cloudinary-status`

These are very useful in production.

They help you answer:

- is server alive?
- which database is active?
- which Cloudinary account is active?

#### Self-ping keep-alive

This file includes a self-ping interval to reduce sleeping on free hosting tiers.

That is a very practical production trick.

#### Inactive user cleanup

This file also deletes inactive non-admin users after 3 months.

Problem solved:

- reduces stale accounts
- keeps data smaller
- enforces privacy policy

---

## 6.6 Backend: `src/config/database.js`

This is one of the most advanced backend files.

### What it does

- creates Prisma clients
- supports multiple databases
- checks database size
- switches active database when limit is reached
- merges reads across multiple databases

### Why it exists

Most small apps use a single database.
But this project is built with the idea that free-tier databases have size limits.

So instead of stopping when one database becomes full, the app can move writes to another database.

### Key class: `DatabaseManager`

This class is responsible for managing all configured databases.

### Important methods

#### `getDatabaseUrls()`

Reads database URLs from environment variables.

Why it exists:

The app can run with one DB or many DBs.

#### `createClient(url)`

Creates a Prisma client for a specific database URL.

#### `initialize()`

Initializes database connections and starts the monitoring process.

#### `checkDatabaseSize(client)`

Runs a SQL query to find current database size.

Problem solved:

Helps detect when a free-tier DB is close to its storage limit.

#### `findAvailableDatabase()`

Looks for another database that still has space.

#### `switchDatabase(newIndex)`

Changes which DB receives writes.

#### `autoSwitch()`

Automatically switches when active DB becomes too large.

### Smart Prisma proxy

This file also contains a proxy layer with very interesting behavior:

- writes go only to active DB
- `findMany()` can merge records from all DBs
- `count()` sums values from all DBs
- `findUnique()` looks in active DB first, then older DBs

This is a clever scalability pattern.

### Interview explanation in simple words

"I created a database manager that can rotate writes to another PostgreSQL database when one free-tier database gets full. Read queries can aggregate across multiple databases so the app still behaves like one logical system."

---

## 6.7 Backend: `src/config/cloudinary.js`

This file does for Cloudinary what `database.js` does for databases.

### It manages:

- one or more Cloudinary accounts
- monthly usage checks
- warning thresholds
- manual account switching
- automatic rotation

### Why this exists

Cloudinary free plans have limited usage credits.

If uploads continue and one account reaches its limit, uploads may fail.

This file helps the app continue working by rotating to another configured account.

### Important methods

#### `parseAccounts()`

Reads Cloudinary credentials from environment variables.

#### `applyActiveConfig()`

Sets the currently active account into the Cloudinary SDK.

#### `checkCredits(account)`

Calls Cloudinary usage API.

#### `manualSwitch(index)`

Lets admin force switch to a specific account.

#### `findAndSwitch()`

Looks for another account with available credits.

#### `autoSwitch()`

Automatically rotates when current account hits the configured threshold.

This is a cost-aware engineering decision.

---

## 6.8 Backend: `src/middleware/auth.js`

This file protects private routes.

### Important functions

#### `authenticate(req, res, next)`

What it does:

1. reads `Authorization` header
2. checks `Bearer <token>` format
3. verifies token using JWT secret
4. loads user from database
5. checks if account is active
6. attaches user to `req.user`
7. updates `lastSeenAt`
8. calls `next()`

Why it exists:

Without this, any person could call private endpoints.

Problem it solves:

- protects user data
- ensures request is tied to a real user
- prevents deactivated users from operating

#### `adminOnly(req, res, next)`

Allows only admin users.

Used for:

- moderation
- user management
- reporter creation
- rishta approvals

#### `verifiedOnly(req, res, next)`

Allows only verified users or admin.

Used for rishta browsing.

Problem solved:

The project wants matrimonial browsing to be restricted to trusted approved accounts.

#### `reporterOnly(req, res, next)`

Allows only news reporters or admin.

---

## 6.9 Backend: `src/middleware/geofence.js`

This file checks location restrictions.

### Main function: `geofenceCheck`

What it does:

1. optionally skips geofence if testing mode is on
2. reads latitude and longitude from request or user profile
3. rejects request if location missing
4. calculates distance from Shahkot center
5. rejects request if outside allowed radius
6. stores location info on request

Why it exists:

This app is designed specifically for Shahkot users.

Problem it solves:

- keeps content local
- prevents irrelevant users from using the system
- preserves the city-only identity of the app

---

## 6.10 Backend: `src/routes/auth.js`

This file handles the full authentication lifecycle.

### Important responsibilities

- send OTP by email
- register new user
- login user
- forgot password OTP
- reset password
- get/update profile
- upload profile photo
- location validation endpoint

### Important logic inside

#### OTP generation

The file creates a 6-digit OTP.

Why it exists:

Email verification is used to prevent fake registrations and help password recovery.

#### Registration flow

The route:

- checks geofence
- validates OTP
- hashes password
- creates user
- detects if this user should be admin
- returns token and user

#### Login flow

The route:

- checks location
- checks password hash
- updates coordinates and last seen time
- may auto-promote admin based on configured email
- returns JWT

#### Profile update flow

Lets user change profile details.

#### Profile photo upload

Uploads image and stores URL.

Problem this file solves:

It turns anonymous visitors into real authenticated users.

---

## 6.11 Backend: `src/routes/posts.js`

This file powers the social feed.

### Key responsibilities

- get paginated feed
- get video-only feed
- create post with images/videos
- toggle like
- get comments
- add comment
- delete post

### Important logic

#### `GET /posts`

Fetches posts with pagination.

Why pagination exists:

Without pagination, loading thousands of posts at once would be slow and memory-heavy.

#### `POST /posts`

Creates a post with optional text, images, and videos.

Interesting design:

- images are uploaded to freeimage.host
- videos are uploaded to Cloudinary

Why this split likely exists:

- image hosting can be cheaper elsewhere
- video handling is better on Cloudinary

#### Like toggle

If like exists → remove it.
If like does not exist → create it.

This is a common social media pattern.

#### Notifications on like

If somebody likes another user's post, the project creates a notification.

This increases engagement.

#### Delete permissions

Only owner or admin can delete.

---

## 6.12 Backend: `src/routes/listings.js`

This file powers the marketplace.

### Responsibilities

- browse listings
- search by text
- filter by category
- filter by price
- view listing details
- create listing
- edit listing
- delete listing
- get user's own listings

### Important logic

#### Search filters

The route allows users to search title and description.

Problem solved:

Users can quickly find relevant products.

#### Sold status

Listings can be marked sold.

Problem solved:

Prevents users from contacting sellers about unavailable items.

#### WhatsApp required

This is a practical local-market feature.

Why this makes sense:

In Pakistan and similar markets, WhatsApp is often the fastest real transaction channel.

---

## 6.13 Backend: `src/routes/rishta.js`

This is one of the most feature-rich route files.

### Responsibilities

- provide legal agreement
- let user apply for rishta profile
- upload CNIC and personal photos
- browse approved profiles
- send interest
- accept or reject interest
- shortlist profiles
- create DM chats on acceptance

### Why this feature is special

Unlike simple social apps, this feature has a **trust and verification workflow**.

### Important design choices

#### Agreement requirement

User must agree to a digital declaration before applying.

Why it exists:

- establishes rules
- improves seriousness of participation

#### CNIC verification

Front and back CNIC images are uploaded.

Why it exists:

- reduces fake profiles
- improves trust

#### Admin approval flow

Profile starts in `PENDING` state.
Admin can approve or reject.

Why it exists:

This is the main trust mechanism of the feature.

#### Interest system

Users do not directly chat with everyone immediately.
They first send interest.

Why it exists:

This adds structure and respect to the matrimonial process.

#### DM creation on accept

If interest is accepted, a direct message chat is created automatically.

This is a smart workflow connection between two features.

---

## 6.14 Backend: `src/routes/admin.js`

This file is the control center for administrators.

### Responsibilities

- dashboard statistics
- user listing and management
- enable/disable user
- delete user
- review rishta applications
- create news reporters
- moderate content
- cleanup old data
- check DB and Cloudinary status

### Why this file is important

Any app with user-generated content needs moderation and management.

### Interesting logic

#### Dashboard counts

Admin can quickly see how many users, posts, listings, etc. exist.

#### Cascading delete behavior

When an admin deletes a user, related records are cleaned too.

Problem solved:

Prevents orphan records and inconsistent state.

#### Rishta approval flow

Admin approval:

- changes profile status
- changes user role to `VERIFIED_USER`
- deletes CNIC images for privacy
- sends approval email

This is a very important end-to-end workflow.

#### Storage status

This lets admin inspect DB usage and Cloudinary usage.

That is unusual for beginner projects and shows operational thinking.

---

# SECTION 7: FUNCTIONS AND LOGIC

Now let us focus on functions.

Instead of only naming files, we will understand what important functions do, why they exist, and what problem they solve.

---

## 7.1 Utility Functions

### `haversineDistance(lat1, lon1, lat2, lon2)`

File: backend `utils/geolocation.js` and frontend `utils/geolocation.js`

#### What it does

Calculates the geographic distance between two coordinates on Earth.

#### Why it exists

The app must know whether a user is within the Shahkot radius.

#### Problem it solves

Simple subtraction of coordinates is not accurate for Earth distance.
Haversine formula gives a more realistic distance for map coordinates.

---

### `isWithinShahkot(latitude, longitude)`

#### What it does

1. calculates distance from Shahkot center
2. checks if distance is within configured radius
3. returns structured result

Example return:

```javascript
{
  isWithin: true,
  distance: 4.22,
  maxRadius: 50
}
```

#### Why it exists

The rest of the application should not need to know the full geofence math.

This helper simplifies that into one reusable function.

#### Problem it solves

- reusable location policy
- consistent frontend and backend checks

---

### `sendEmail(to, subject, html)`

File: `backend/src/utils/email.js`

#### What it does

Attempts to send an email using multiple providers in fallback order.

#### Why it exists

Email delivery can fail for many reasons.
Using fallback providers makes the system more resilient.

#### Problem it solves

- OTP emails must reach users
- rishta decision emails must be delivered reliably

---

### `sendRishtaApprovalEmail(email, name)`

#### What it does

Builds an approval email and sends it.

#### Why it exists

This is a domain-specific helper.

Instead of repeating HTML email code in admin routes, it is abstracted into a reusable function.

#### Problem it solves

- cleaner route files
- consistent email templates

---

### `sendRishtaRejectionEmail(email, name, reason)`

Same idea as approval email, but for rejection.

This improves user communication and transparency.

---

### `uploadImageFile(file)`

File: `backend/src/utils/imageUpload.js`

#### What it does

Uploads an image buffer to freeimage.host.

#### Why it exists

Many features require image hosting:

- profile photos
- listings
- news images
- rishta photos
- post images

This function centralizes image upload logic.

#### Problem it solves

Without it, each route would need to implement upload logic separately.

---

### `uploadMultipleImages(files)`

#### What it does

Uploads many images in parallel.

#### Why it exists

Users often select multiple photos.

#### Problem it solves

Uploading sequentially would be slower. Parallel uploads reduce waiting time.

---

### `uploadVideoToCloudinary(file)`

File: `backend/src/utils/cloudinaryUpload.js`

#### What it does

Uploads video buffer to Cloudinary.

#### Why it exists

Video needs better hosting and delivery than simple image hosts.

#### Problem it solves

- video storage
- large file support
- Cloudinary transcoding

---

### `uploadAudioToCloudinary(buffer)`

#### What it does

Uploads recorded voice message audio.

#### Why it exists

Open chat supports voice messages.

#### Problem it solves

Audio files need a stable public URL for playback by other users.

---

### `deleteFromCloudinary(imageUrl)`

#### What it does

Extracts the public ID from a Cloudinary URL and deletes the asset.

#### Why it exists

When content is removed, media should also be cleaned.

#### Problem it solves

- wasted storage
- privacy concerns
- stale media after deletion

---

## 7.2 Middleware Functions

### `authenticate()`

Already discussed, but from a function perspective:

#### Why it exists

To make route protection reusable.

Instead of rewriting token checks in 20 route handlers, one middleware handles it.

#### Problem solved

- duplicated auth logic
- inconsistent security

---

### `adminOnly()`

#### Why it exists

Some actions are dangerous or privileged.

Examples:

- deleting user data
- approving rishta
- switching cloudinary account
- cleaning old records

#### Problem solved

Prevents regular users from performing admin operations.

---

### `verifiedOnly()`

#### Why it exists

Not every user should access rishta browsing.

#### Problem solved

Protects the trust and seriousness of the matrimonial feature.

---

### `geofenceCheck()`

#### Why it exists

To enforce geographic policy consistently.

#### Problem solved

Stops users outside Shahkot radius from accessing restricted flows.

---

## 7.3 Frontend Logic Functions

### `login()` in AuthContext

#### Why it exists

To centralize auth flow.

#### Problem solved

Multiple screens do not have to manage token storage themselves.

---

### `logout()` in AuthContext

#### Why it exists

To safely end the session everywhere.

#### Problem solved

- stale auth state
- storage inconsistency

---

### `onScreenView()` in AdManager

#### What it does

Tracks navigation changes and decides when to show interstitial ads.

#### Why it exists

Showing ads after every screen would annoy users.

#### Problem solved

Balances monetization with user experience by pacing ad display.

---

### `initAds()` in AdManager

#### What it does

Initializes the AdMob SDK and prepares ad objects.

#### Why it exists

Ads must be initialized once before showing.

#### Problem solved

Prevents ad failures caused by uninitialized SDK state.

---

### `checkLocation()` in LoginScreen

#### What it does

Asks user for location permission, reads current GPS coordinates, and validates them against geofence.

#### Why it exists

The app blocks out-of-area access before login/register.

#### Problem solved

Improves user feedback early and avoids unnecessary failed backend requests.

---

## 7.4 Backend Route Logic Patterns

There are some repeating logic patterns throughout the backend.

Understanding these patterns is useful in interviews.

### Pattern 1: Pagination

Used in:

- posts
- notifications
- news
- jobs
- doctors
- chat
- DM messages

Basic idea:

```javascript
const page = parseInt(req.query.page || '1', 10);
const limit = parseInt(req.query.limit || '20', 10);
const skip = (page - 1) * limit;

const rows = await prisma.post.findMany({ skip, take: limit });
```

#### Why it exists

Loading everything at once is too expensive.

#### Problem solved

- slow load times
- heavy network usage
- memory waste

---

### Pattern 2: Ownership check

Used in:

- posts deletion
- listings update/delete
- jobs update/delete
- shops update/delete

Basic idea:

```javascript
if (record.userId !== req.user.id && req.user.role !== 'ADMIN') {
  return res.status(403).json({ error: 'Not allowed' });
}
```

#### Why it exists

Users should only edit their own content.

#### Problem solved

Prevents unauthorized modification of data.

---

### Pattern 3: Notification creation after action

Used after:

- liking a post
- sending rishta interest
- accepting rishta interest
- applying for job

#### Why it exists

The target user should know something important happened.

#### Problem solved

Improves communication and engagement.

---

### Pattern 4: Include related data in Prisma

Example:

```javascript
include: {
  user: true,
  _count: { select: { likes: true, comments: true } }
}
```

#### Why it exists

Frontend usually needs related data too.

If backend returned only a post row without user info or counts, the frontend would need many extra requests.

#### Problem solved

Reduces API chattiness and improves UI readiness.

---

# SECTION 8: DATABASE DESIGN

This section explains the database in beginner-friendly language.

---

## 8.1 Which Database Is Used?

The project uses **PostgreSQL**.

Prisma ORM is used on top of PostgreSQL.

So the database stack is:

```text
Application code (JavaScript)
        ↓
Prisma ORM
        ↓
PostgreSQL
```

---

## 8.2 Why PostgreSQL Was a Good Choice

This app stores highly structured relational data.

Examples:

- one user has many posts
- one post has many comments
- one job has many applications
- one restaurant has many deals
- one rishta profile belongs to one user

Relational databases are very good for this kind of data.

---

## 8.3 Schema Design Philosophy

The schema is designed around **features**.

Each major feature gets one or more models.

### Feature-to-model mapping

| Feature | Models |
|---|---|
| Authentication | `User`, `EmailOtp` |
| Social feed | `Post`, `Comment`, `Like` |
| Marketplace | `Listing` |
| Tournaments | `Tournament`, `Match` |
| Government directory | `GovtOffice` |
| Bazar/shop finder | `Shop` |
| Rishta | `RishtaProfile`, `RishtaInterest`, `RishtaShortlist` |
| News | `News`, `NewsReporter` |
| Notifications | `Notification` |
| Open chat | `ChatMessage` |
| Direct messages | `DMChat`, `DMMessage`, `Block`, `Report` |
| Blood donation | `BloodDonor` |
| Jobs | `Job`, `JobApplication` |
| Doctors | `Doctor` |
| Restaurants | `Restaurant`, `Deal` |

This is a clean feature-oriented schema.

---

## 8.4 Enums in the Schema

The database uses enums for controlled values.

### Why enums are useful

They prevent invalid data.

Example:

Instead of allowing any random user role string like:

- `super-admin`
- `admn`
- `verified person`

The schema restricts role to valid options only.

### Important enums

#### `Role`

- `USER`
- `VERIFIED_USER`
- `NEWS_REPORTER`
- `ADMIN`

#### `RishtaStatus`

- `PENDING`
- `APPROVED`
- `REJECTED`

#### `ListingCategory`

- electronics
- vehicles
- property
- furniture
- and others

#### `SportType`

- cricket
- football
- kabaddi
- volleyball
- etc.

#### `NewsCategory`

- local
- sports
- education
- politics
- etc.

#### `BloodGroup`

- A positive
- A negative
- B positive
- and others

#### `JobType`

- full time
- part time
- contract
- internship
- daily wage

#### `JobCategory`

- teaching
- medical
- IT
- driving
- and more

#### `DoctorSpecialty`

- general physician
- pediatrician
- gynecologist
- dentist
- etc.

---

## 8.5 Core Model: `User`

This is the most important model.

### Why?

Because most other models are connected to users.

### Important fields

| Field | Meaning |
|---|---|
| `id` | unique user ID |
| `name` | full name |
| `phone` | phone number |
| `email` | email address |
| `whatsapp` | WhatsApp number |
| `password` | hashed password |
| `photoUrl` | profile image |
| `role` | user role |
| `firebaseUid` | optional Firebase identity link |
| `latitude`, `longitude` | saved location |
| `isActive` | whether account is enabled |
| `isBlocked` | whether user is blocked |
| `lastSeenAt` | activity tracking |
| `createdAt`, `updatedAt` | timestamps |

### Relationships

User has many:

- posts
- comments
- likes
- listings
- notifications
- blood donor records
- shops
- news articles
- chat messages
- job postings
- job applications

User has one:

- rishta profile

User participates in:

- DM chats
- sent rishta interests
- shortlists
- submitted reports
- block relations

This makes `User` the central hub of the application.

---

## 8.6 Social Feed Models

### `Post`

Stores feed posts.

Important fields:

- `userId`
- `text`
- `images`
- `videos`
- timestamps

#### Why arrays for images and videos?

Because one post can have multiple media URLs.

### `Comment`

Stores comments on posts.

Important relation:

- belongs to one post
- belongs to one user

### `Like`

Stores which user liked which post.

Important design:

```prisma
@@unique([postId, userId])
```

Why this is important:

It prevents the same user from liking the same post multiple times.

---

## 8.7 Marketplace Model

### `Listing`

Represents items being sold.

Important fields:

- `title`
- `description`
- `price`
- `category`
- `images`
- `whatsapp`
- `isSold`

### Why this model design is practical

- `images` is an array because users may upload multiple photos
- `category` is an enum for consistency
- `whatsapp` is required because that is the communication channel
- `isSold` helps hide unavailable products

---

## 8.8 Tournament Models

### `Tournament`

Stores tournament details such as:

- sport type
- name
- venue
- start/end dates
- teams
- prize
- entry fee

### `Match`

Stores matches inside a tournament.

Important fields:

- `tournamentId`
- `team1`
- `team2`
- `date`
- `time`
- `venue`
- `result`
- `round`
- `score`

### Relationship

One tournament has many matches.

---

## 8.9 Directory Models

### `GovtOffice`

Stores public office information.

Fields include:

- name
- address
- latitude/longitude
- helplines array
- timings
- description

### `Shop`

Stores bazar/shop information.

Interesting field:

- `categories` is an array of search tags

Why this is smart:

Instead of a strict category system only, shops can list many product keywords like:

- mobile phones
- chargers
- shoes
- school supplies

This improves user search experience.

---

## 8.10 Rishta Models

This feature uses three main models.

### `RishtaProfile`

Stores matrimonial profile details.

Important fields:

- `userId`
- `cnicFront`
- `cnicBack`
- `age`
- `gender`
- `education`
- `occupation`
- `familyDetails`
- `preferences`
- `images`
- `signatureAgreed`
- `agreementText`
- `status`
- `adminNote`
- `approvedAt`

### Why this design is thoughtful

- identity verification is supported with CNIC fields
- legal agreement is stored
- admin review is supported through `status` and `adminNote`
- privacy is supported by deleting CNIC after decision

### `RishtaInterest`

Stores one user's interest in another profile.

Important fields:

- `fromUserId`
- `profileId`
- `status`

Unique constraint:

```prisma
@@unique([fromUserId, profileId])
```

This prevents duplicate interest spam.

### `RishtaShortlist`

Stores favorite/saved profiles.

Again, unique per user/profile pair.

---

## 8.11 News Models

### `NewsReporter`

Stores separate reporter accounts.

Interesting detail:

The project supports both:

- separate news reporter accounts
- regular authenticated user news posting

### `News`

Stores:

- title
- content
- images
- category
- reporter ID or user ID

This flexible design allows content from multiple actor types.

---

## 8.12 Notification Model

### `Notification`

Stores simple in-app notifications.

Fields:

- `userId`
- `title`
- `body`
- `isRead`
- `createdAt`

Why this model matters:

Many user actions create events that should be visible later.

Examples:

- someone liked your post
- someone sent interest
- your rishta profile got approved
- someone applied to your job

---

## 8.13 Open Chat Model

### `ChatMessage`

Stores public chat room messages.

Fields:

- `userId`
- `text`
- `images`
- `videos`
- `voiceUrl`
- `voiceDuration`
- `replyToId`
- `createdAt`

Interesting detail:

It supports reply threads by self-referencing `replyToId`.

That means one chat message can reply to another chat message.

---

## 8.14 Direct Messaging Models

### `DMChat`

Represents a private conversation between two users.

Fields include:

- `user1Id`
- `user2Id`
- `source`
- `isBlocked`

Important design:

```prisma
@@unique([user1Id, user2Id])
```

This prevents duplicate chat records for the same pair.

### `DMMessage`

Represents messages inside a private chat.

Fields:

- `chatId`
- `senderId`
- `text`
- `images`
- `createdAt`

### `Block`

Stores who blocked whom.

This is used for safety and abuse control.

### `Report`

Stores abuse reports.

Fields include:

- reporter user
- target user
- target type
- target ID
- reason
- status

This model supports moderation workflows.

---

## 8.15 Blood Donation Model

### `BloodDonor`

Stores blood donor records.

Important fields:

- `bloodGroup`
- `isAvailable`
- `isEmergency`
- `lastDonated`

Why this design is useful:

- supports urgent filtering
- supports availability state
- supports donor history

---

## 8.16 Jobs Models

### `Job`

Stores local job postings.

Important fields:

- `title`
- `company`
- `description`
- `category`
- `type`
- `salary`
- `location`
- `phone`
- `whatsapp`
- `requirements`
- `isActive`

### `JobApplication`

Stores user applications to a job.

Fields:

- `jobId`
- `userId`
- `message`
- `phone`

Important unique constraint:

```prisma
@@unique([jobId, userId])
```

This prevents duplicate applications to the same job by the same user.

---

## 8.17 Doctors and Restaurants Models

### `Doctor`

Stores doctor listing information.

### `Restaurant`

Stores restaurant owner login record and restaurant profile.

Important fields:

- email
- password
- name
- address
- phone
- image
- isActive

### `Deal`

Stores deals offered by a restaurant.

Relationship:

- one restaurant has many deals

This is a neat sub-system because restaurant owners can log in separately from regular users.

---

## 8.18 Relationship Summary

Here is a simplified relationship map:

```text
User
 ├── has many Posts
 │     ├── has many Comments
 │     └── has many Likes
 ├── has many Listings
 ├── has one RishtaProfile
 │     ├── has many RishtaInterests
 │     └── has many RishtaShortlists
 ├── has many Notifications
 ├── has many BloodDonor records
 ├── has many Shops
 ├── has many News articles
 ├── has many ChatMessages
 ├── has many Jobs
 ├── has many JobApplications
 ├── participates in many DMChats
 └── sends many DMMessages

Tournament
 └── has many Matches

Restaurant
 └── has many Deals

Job
 └── has many JobApplications

Post
 ├── has many Comments
 └── has many Likes
```

---

## 8.19 Why This Schema Is Good for Beginners to Study

This schema is a strong learning example because it includes many real-world patterns:

- one-to-many relationships
- one-to-one relationships
- many-to-many behavior through join-like models
- enums
- unique constraints
- arrays
- status-driven workflows
- audit timestamps

It is not just a demo schema. It reflects realistic product needs.

---

# SECTION 9: FEATURE IMPLEMENTATION

Now we explain how the main features are actually implemented.

---

## 9.1 Authentication System

The authentication system combines multiple ideas:

- email-based OTP
- password hashing
- JWT token auth
- location restriction
- profile persistence on mobile

### Registration flow

1. User enters name, email, password
2. App sends OTP request
3. Backend generates OTP and emails it
4. User enters OTP
5. Backend verifies OTP
6. Password is hashed using bcrypt
7. User record is created
8. JWT token is generated
9. App stores token and user in AsyncStorage

### Login flow

1. User enters email and password
2. App also sends current GPS coordinates
3. Backend checks geofence
4. Backend checks password hash
5. Backend returns token and user
6. Frontend stores them

### Password reset flow

1. User enters email
2. OTP is emailed
3. User enters OTP and new password
4. Backend verifies OTP
5. Password is re-hashed and updated

### Why this auth system is good

- secure password storage
- email verification
- portable session token
- good mobile experience

---

## 9.2 User Management

User management happens on both frontend and backend.

### User roles

- `USER`
- `VERIFIED_USER`
- `NEWS_REPORTER`
- `ADMIN`

### How roles are used

#### `USER`

Default role for normal app members.

#### `VERIFIED_USER`

Granted after rishta approval.

Unlocks matrimonial browsing.

#### `NEWS_REPORTER`

For users who publish news in reporter mode.

#### `ADMIN`

Can manage almost everything.

### Admin user management features

- search users
- toggle active status
- delete user

### Inactive user cleanup

Server checks for non-admin users who have been inactive for 3+ months and deletes them.

This is unusual and important operational logic.

---

## 9.3 Marketplace and Main Feature Implementation

### Marketplace

The marketplace is built with:

- `Listing` model
- `listings.js` routes
- `MarketplaceScreen.js`

### Create listing flow

1. User opens listing modal
2. Enters title, description, price, category, WhatsApp
3. Selects images
4. Frontend sends multipart request
5. Backend uploads images
6. Backend stores listing in DB
7. Frontend refreshes list

### Browse listing flow

1. Frontend requests listings with filters
2. Backend builds Prisma query using search/category/price
3. Results return paginated
4. User opens detail modal and contacts seller via WhatsApp

### Why this implementation is practical

- WhatsApp contact fits local user behavior
- image-only listing reduces moderation complexity
- sold state keeps listing status accurate

---

### Social Feed

Implemented using:

- `Post`, `Comment`, `Like`
- `posts.js`
- `FeedScreen.js`
- `PostCard.js`
- `PostComposer.js`

Features include:

- create posts
- upload images/videos
- like posts
- comment on posts
- delete posts
- view video feed separately

### Why this feature matters

It gives the app a community identity instead of being only a directory or utility app.

---

### Jobs

Implemented using:

- `Job`
- `JobApplication`
- `jobs.js`
- `JobsScreen.js`

Key flow:

1. employer posts job
2. job seeker browses and filters
3. user applies with phone/message
4. backend prevents duplicate applications
5. notification is created for job owner

---

### Rishta

Implemented using:

- `RishtaProfile`
- `RishtaInterest`
- `RishtaShortlist`
- `rishta.js`
- `AdminDashboardScreen.js`
- `RishtaScreen.js`

This is a multi-step workflow feature with admin review and privacy handling.

---

### Chat systems

Two messaging systems exist:

#### Public chat

- everyone in one room
- supports text, image, voice, replies

#### Direct messages

- one-to-one
- used also by rishta acceptance flow

This split is a thoughtful product design.

---

## 9.4 API Integrations

This project integrates several external APIs and services.

### 1. Cloudinary API

Used for:

- video uploads
- audio uploads
- some image handling
- media deletion

### 2. freeimage.host API

Used for:

- image uploads for posts, listings, news, etc.

### 3. Email provider APIs

Used for:

- OTP emails
- rishta approval/rejection emails

Providers:

- Resend
- AWS SES SDK
- SMTP fallback

### 4. Firebase Admin / FCM

Used for push notification capability.

### 5. Open-Meteo API

Used directly by frontend weather screen.

Why direct frontend call is acceptable here:

- public weather data
- no secret key required

### 6. LongCat/OpenAI-compatible AI API

Used by chatbot route.

The backend sends user message with a system prompt and returns AI response.

There is also fallback logic if API is unavailable.

---

## 9.5 Ads and Monetization

This project uses **Google AdMob**.

### Ad types used

#### Banner ads

Shown inside screens such as:

- Home
- Feed
- Marketplace
- Jobs
- Doctors
- Rishta
- News

#### Interstitial ads

Shown after every 3 screen transitions, with cooldown logic.

#### App-open ads

Shown when app returns from background, with timing limits.

### Why this is a sensible monetization strategy

- banner ads = passive revenue
- interstitial ads = higher payout but controlled frequency
- app-open ads = monetizes returning users

### Why cooldown logic matters

Too many ads ruin user experience.

The app uses spacing logic to reduce annoyance.

---

## 9.6 File Uploads

File uploads are a major feature across the app.

### Where uploads happen

| Feature | File types |
|---|---|
| Profile photo | image |
| Posts | images, videos |
| Listings | images |
| Rishta | CNIC images, profile photos |
| News | images |
| Restaurant deals | image |
| DM | images |
| Open chat | images, voice |

### Upload flow

1. user selects media on mobile
2. frontend builds multipart request or base64 payload
3. backend parses upload using `multer`
4. backend validates type and size
5. backend uploads media to external host
6. URL is saved in database
7. frontend receives URL-based record

### Why URL storage is important

The database does not store raw image/video file contents.
It stores URLs.

This keeps the database lighter and faster.

---

## 9.7 Notifications and Messaging System

### In-app notifications

The system creates notifications in the `Notification` table.

Examples:

- post liked
- rishta interest received
- rishta interest accepted
- job application received

### Notification UI flow

1. action happens
2. backend creates notification row
3. user opens notifications screen
4. frontend fetches notifications
5. user marks single/all as read

### Messaging system

#### Open chat

Supports:

- text
- images
- voice messages
- replies
- reporting

#### Direct messages

Supports:

- starting chat
- text messages
- image messages
- block/unblock
- report user

### Polling strategy

Instead of WebSockets, the app uses repeated polling intervals.

Examples:

- DM list refreshes every few seconds
- DM chat refreshes every few seconds
- open chat polls regularly

### Why polling was likely chosen

- simpler to implement than sockets
- easier to host on a standard REST backend
- acceptable for moderate local traffic

Tradeoff:

- not as real-time efficient as WebSockets
- extra repeated requests

---

# SECTION 10: DEPLOYMENT AND HOSTING

This section explains how the project is built and deployed.

---

## 10.1 Backend Build and Run Process

### Development mode

```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run dev
```

What happens:

1. dependencies install
2. Prisma client is generated
3. schema is pushed to PostgreSQL
4. Express server starts with nodemon

### Production mode

Hosting platform runs:

```bash
node src/server.js
```

or via root proxy:

```bash
node server.js
```

---

## 10.2 Frontend Build Process

The mobile app uses Expo and EAS Build.

### Development

```bash
cd NewShahkotApp
npm install
npx expo start
```

### Android preview build

Using `eas.json`, preview profile builds APK.

### Production build

Production profile builds Android App Bundle.

Why this matters:

- APK is convenient for testing
- AAB is the proper Play Store production format

---

## 10.3 Environment Variables

Environment variables are secret or environment-specific values stored outside code.

### Backend environment variables

Common important ones include:

#### Database

- `DATABASE_URL`
- `DATABASE_URLS`
- `ACTIVE_DB_INDEX`
- `DB_SIZE_LIMIT_MB`

#### Auth

- `JWT_SECRET`

#### Geofence

- `SHAHKOT_LAT`
- `SHAHKOT_LNG`
- `GEOFENCE_RADIUS_KM`
- `SKIP_GEOFENCE`

#### Cloudinary

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_ACCOUNTS`
- `ACTIVE_CLOUDINARY_INDEX`
- `CLOUDINARY_CREDITS_LIMIT`

#### Firebase

- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `FIREBASE_SERVICE_ACCOUNT_PATH`

#### Email

- `RESEND_API_KEY`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`

#### Admin defaults

- `ADMIN_EMAIL`
- `ADMIN_PHONE`

#### AI Chatbot

- `LONGCAT_API_KEY`
- `LONGCAT_API_URL`
- `LONGCAT_MODEL`

#### File upload / limits

- `MAX_VIDEO_SIZE_MB`
- `FREEIMAGE_API_KEY`

### Frontend environment variables

From `eas.json` and Expo public env usage:

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_SKIP_GEOFENCE`
- `EXPO_PUBLIC_USE_ADS`

### Why environment variables matter

They let you change behavior without editing source code.

Examples:

- switch API between local and production
- turn geofence off for testing
- change JWT secret securely
- configure different build modes

---

## 10.4 Hosting Platform

### Backend hosting

The backend is deployed on **DigitalOcean App Platform**.

Why this is useful:

- simple deployment
- environment variable support
- managed HTTPS
- easy GitHub integration
- no manual Linux server management needed

### Database hosting

The project is designed for **PostgreSQL**, likely hosted on **Neon** or similar cloud PostgreSQL.

### Media hosting

- Cloudinary for video/audio and some media operations
- freeimage.host for images

### Mobile distribution

Expo/EAS is used for building distributable Android binaries.

---

## 10.5 Production Setup

### Backend production checklist

1. Set all environment variables
2. Ensure PostgreSQL database exists
3. Run Prisma generate
4. Run schema migration or push
5. Confirm Cloudinary credentials
6. Confirm email provider configuration
7. Confirm Firebase configuration
8. Confirm JWT secret is strong
9. Start server
10. verify `/api/health`

### Frontend production checklist

1. Set `EXPO_PUBLIC_API_URL` to production API
2. Ensure app permissions are correct in `app.json`
3. Configure AdMob app IDs
4. Build using EAS production profile
5. Test login, uploads, chat, and notifications

### Important production behavior from this project

#### Keep-alive ping

The server pings itself to reduce sleeping on free/cheap hosting tiers.

#### DB and Cloudinary monitoring

The app includes status endpoints and auto-rotation logic.

#### Cleanup jobs

Inactive users are cleaned on schedule.

This shows the project was designed with production maintenance in mind, not just basic local development.

---

## 10.6 How to Explain Deployment in an Interview

You can say:

> "The mobile app is built with Expo and distributed using EAS Build. The backend is an Express API deployed on DigitalOcean App Platform. PostgreSQL is used for persistent data, Prisma manages the schema and queries, and Cloudinary/freeimage.host handle media storage. Environment variables are used for API URLs, secrets, email providers, geofence settings, and media credentials. The backend also includes monitoring and auto-rotation for databases and Cloudinary accounts to work around free-tier limits."

---

## 10.7 Beginner-Friendly Final Recap

If you forget everything else, remember this simple mental model:

### Frontend

- built in React Native + Expo
- screens show UI
- context stores auth state
- API service talks to backend

### Backend

- built in Node.js + Express
- route files handle each feature
- middleware protects routes
- Prisma talks to PostgreSQL

### Database

- PostgreSQL stores structured relational data
- schema is defined in Prisma
- users, posts, listings, jobs, chats, and rishta profiles are connected through relationships

### Media and integrations

- images uploaded to image host
- videos/audio uploaded to Cloudinary
- emails sent through SES/Resend/SMTP
- weather fetched from Open-Meteo
- AI chatbot uses external AI API
- ads monetized with AdMob

### Deployment

- backend hosted on DigitalOcean
- mobile app built with Expo EAS
- environment variables control production setup

---

## Extended Summary of What You Should Now Understand

After reading Sections 1 to 10, you should now be able to explain:

1. what the project does
2. why the project exists
3. how the frontend and backend are separated
4. how authentication works
5. how APIs are structured
6. how the database is designed
7. how uploads and media hosting work
8. how ads are integrated
9. how real features like marketplace, rishta, jobs, and chat are implemented
10. how the project is deployed in production

In the next sections, you could continue with:

- security considerations
- performance optimization
- common bugs and troubleshooting
- step-by-step rebuild guide
- interview questions and model answers
- learning resources

---

# SECTION 11: INTERVIEW PREPARATION

This section is written to help you **talk confidently about the project in interviews**.

The goal is not only to memorize answers.

The real goal is to help you explain:

- what you built
- why you built it that way
- what tradeoffs you made
- how the code works internally
- what you would improve in the future

When you answer interview questions, try to follow this pattern:

1. **Explain the concept simply**
2. **Connect it to this project**
3. **Mention a practical decision or tradeoff**
4. **Add improvement ideas if relevant**

That makes your answer sound real, not memorized.

---

## 11.1 How to Introduce This Project in an Interview

If an interviewer asks, **"Tell me about a project you built"**, you can say something like this:

> "I built a full-stack city-focused mobile application called Apna Shahkot. It is a React Native and Expo app with a Node.js and Express backend and PostgreSQL database managed through Prisma. The app is designed specifically for users within a 50-kilometer radius of Shahkot, so it includes geofencing, authentication, marketplace listings, jobs, social feed, direct messaging, open chat, blood donor search, doctor directory, local news, and a CNIC-verified matrimonial feature. I also integrated media uploads, notifications, AdMob monetization, and production deployment using DigitalOcean and Expo EAS."

That answer is strong because it covers:

- product scope
- tech stack
- unique feature (geofencing)
- full-stack ownership
- real integrations

---

## 11.2 Beginner Interview Questions

These questions are common for junior or early-mid developers.

The interviewer usually wants to know whether you understand fundamentals clearly.

---

### Q1. What is Apna Shahkot?

**Model answer:**

> Apna Shahkot is a city-focused mobile application for Shahkot residents. It combines social networking, local marketplace, jobs, tournaments, doctor directory, government information, blood donation support, messaging, local news, and a verified matrimonial system into one app. The key idea is that only users within a 50 km radius of Shahkot can use it, so all content stays locally relevant.

---

### Q2. What technologies did you use in this project?

**Model answer:**

> On the frontend I used React Native with Expo. For navigation I used React Navigation, and for API calls I used Axios. On the backend I used Node.js with Express. For the database I used PostgreSQL with Prisma ORM. For media uploads I used Cloudinary and freeimage.host. For email I used AWS SES, Resend, and SMTP fallback. For monetization I used Google AdMob. The backend is deployed on DigitalOcean, and the mobile app is built using Expo EAS.

---

### Q3. Why did you choose React Native?

**Model answer:**

> I chose React Native because it allowed me to build one codebase for mobile platforms instead of writing separate Android and iOS apps. It also fits well with JavaScript-based backend development, so the whole stack stays consistent. For this project, React Native was especially useful because the app has many screens and business features, and Expo made development faster.

---

### Q4. What is Expo and why did you use it?

**Model answer:**

> Expo is a framework and toolchain around React Native that simplifies mobile app development. I used it because it provided built-in support for common mobile features like image picking, audio, location, and cloud builds. It helped me move faster and reduced native setup complexity.

---

### Q5. What does the backend do in this project?

**Model answer:**

> The backend handles business logic, authentication, database operations, media upload orchestration, role-based access control, notifications, and integrations like email and AI chatbot requests. The mobile app sends requests to the backend, and the backend validates and processes the data before storing it in PostgreSQL.

---

### Q6. What is Prisma and why did you use it?

**Model answer:**

> Prisma is an ORM that lets me interact with PostgreSQL using JavaScript methods instead of writing raw SQL for every query. I used it because it provides a clear schema file, good developer experience, relation handling, and safer database access. It made the code easier to maintain and understand.

---

### Q7. What is geofencing in your project?

**Model answer:**

> Geofencing means restricting app access based on physical location. In this project, users must be within 50 kilometers of Shahkot. The frontend checks location for user feedback, and the backend also validates coordinates using the Haversine formula so the restriction cannot be bypassed easily.

---

### Q8. How does login work in your app?

**Model answer:**

> The user enters email and password, and the app also sends GPS coordinates. The backend validates location, checks the hashed password using bcrypt, and if everything is valid it returns a JWT token and user object. The app stores them in AsyncStorage and uses the token for future authenticated API calls.

---

### Q9. Why do you hash passwords?

**Model answer:**

> Passwords should never be stored in plain text. I used bcrypt to hash passwords so even if the database is compromised, the original passwords are not directly exposed. During login, the entered password is compared to the stored hash.

---

### Q10. What is JWT and how is it used here?

**Model answer:**

> JWT stands for JSON Web Token. It is used for authentication after login. Once the user logs in, the backend creates a signed token containing the user identity. The mobile app stores that token and sends it in the Authorization header for protected requests. The backend verifies it before allowing access.

---

### Q11. What is the purpose of `AuthContext`?

**Model answer:**

> `AuthContext` stores global authentication state like the current user, token, and helper values such as whether the user is admin or verified. It also exposes functions like login, register, logout, and updateUser. This avoids passing auth data through many components.

---

### Q12. Why did you use AsyncStorage?

**Model answer:**

> AsyncStorage is used to persist the login session on the device. After login, the JWT token and user object are saved locally, so the user does not need to log in again every time they open the app.

---

### Q13. What is the difference between a screen and a component in your app?

**Model answer:**

> A screen is a full page in the app, like `FeedScreen` or `JobsScreen`. A component is a reusable UI piece used inside screens, like `PostCard`, `AdBanner`, or `VerifiedBadge`. Screens usually contain feature logic, while components improve reuse and maintainability.

---

### Q14. How do API calls work in your frontend?

**Model answer:**

> I created a centralized Axios service file. It defines a shared API client with a base URL, timeout settings, request interceptor for attaching JWT tokens, and response interceptor for handling unauthorized errors. Then I grouped feature endpoints into API modules like `authAPI`, `postsAPI`, `jobsAPI`, and so on.

---

### Q15. What are the main features of the app?

**Model answer:**

> The main features are authentication with geofencing, social feed, marketplace, jobs, tournaments, local news, shop finder, blood donor finder, doctor directory, restaurant deals, public chat, private messaging, AI chatbot, notifications, and the verified matrimonial system.

---

## 11.3 Intermediate Interview Questions

These questions test whether you understand architecture, tradeoffs, and implementation details.

---

### Q16. How is your project structured on the frontend and backend?

**Model answer:**

> The project is split into two major parts. The frontend is inside the mobile app folder and uses React Native with Expo. It is organized into screens, components, context, services, config, and utilities. The backend is a Node.js and Express app organized into route files, middleware, config files, utilities, and Prisma schema. Each route file handles one feature domain like auth, posts, jobs, or rishta.

---

### Q17. Why did you centralize API logic in one file?

**Model answer:**

> Centralizing API logic made the frontend cleaner and more maintainable. It allowed me to reuse one Axios instance, attach tokens automatically, define common timeouts, and handle 401 errors globally. Without this, each screen would need to duplicate networking code.

---

### Q18. How does the marketplace feature work end to end?

**Model answer:**

> The marketplace uses a `Listing` database model, backend listing routes, and a `MarketplaceScreen` on the frontend. A user fills out a form with title, description, price, category, WhatsApp number, and images. The frontend sends a multipart request, the backend validates and uploads the images, stores the image URLs and metadata in PostgreSQL, and returns the created listing. Users can also browse listings with search, category filters, and price filters.

---

### Q19. Why is WhatsApp required for marketplace listings?

**Model answer:**

> It is a product decision based on local user behavior. In many local markets, WhatsApp is the fastest and most familiar way for buyers and sellers to communicate. So instead of building a full buyer-seller negotiation system for listings, the app uses WhatsApp as the contact bridge.

---

### Q20. How does the rishta feature work?

**Model answer:**

> The rishta feature is a multi-step verified workflow. A user accepts a digital agreement, uploads CNIC images and profile photos, fills out personal and family information, and submits the profile. The profile starts in a pending state. An admin can approve or reject it. If approved, the user role becomes `VERIFIED_USER` and they can browse other approved profiles. Users can send interest, accept or reject interest, shortlist profiles, and when an interest is accepted the system automatically creates a direct message chat.

---

### Q21. Why did you create separate middleware like `authenticate`, `adminOnly`, and `verifiedOnly`?

**Model answer:**

> Middleware keeps authorization logic reusable and consistent. `authenticate` verifies the JWT and loads the user. `adminOnly` restricts sensitive routes to admins. `verifiedOnly` restricts access to verified-only flows like rishta browsing. This is cleaner than repeating permission checks inside every route handler.

---

### Q22. How are notifications implemented?

**Model answer:**

> Notifications are stored in a `Notification` table. Whenever an important event happens, such as a like, rishta interest, accepted interest, or job application, the backend creates a notification row. The frontend fetches notifications through the notifications API and allows users to mark them as read.

---

### Q23. How does the app handle file uploads?

**Model answer:**

> The frontend creates a multipart request using `FormData`. The backend uses `multer` to parse the uploaded files in memory and validate type and size. Then the backend uploads media to an external hosting service. Images mainly go to freeimage.host, and videos or voice messages go to Cloudinary. The database stores only the resulting URLs.

---

### Q24. Why are images and videos stored differently?

**Model answer:**

> Images and videos have different storage and delivery needs. Videos are heavier and benefit more from Cloudinary features like optimized delivery and transcoding. Images can be hosted more cheaply on a basic image host. This split is likely a cost optimization and performance decision.

---

### Q25. How does your app handle direct messaging?

**Model answer:**

> Direct messaging uses two main models: `DMChat` for the conversation and `DMMessage` for individual messages. When users start a conversation, the backend either finds an existing chat or creates a new one. Messages can include text and images. The frontend polls for new messages every few seconds instead of using WebSockets.

---

### Q26. Why did you use polling instead of WebSockets?

**Model answer:**

> Polling is simpler to implement and host on a standard REST backend, especially for a local community app where traffic volume is moderate. WebSockets would provide more real-time communication, but they would add more infrastructure and complexity. Polling was an acceptable tradeoff for the current scope.

---

### Q27. How is role-based access control implemented?

**Model answer:**

> Role-based access control is implemented using the `role` field on the `User` model and middleware checks in the backend. For example, only admins can access admin routes, only verified users can browse rishta profiles, and only authorized users can perform moderation or restricted actions.

---

### Q28. How do you prevent duplicate likes or duplicate job applications?

**Model answer:**

> I used database-level unique constraints. For example, the `Like` model has a unique constraint on `[postId, userId]`, and `JobApplication` has a unique constraint on `[jobId, userId]`. This prevents duplicate records even if the frontend submits repeated requests.

---

### Q29. How does the admin dashboard work?

**Model answer:**

> The admin dashboard uses protected admin-only backend routes. It fetches aggregate counts, user lists, pending rishta applications, reports, storage stats, and moderation data. From the UI, the admin can manage users, approve or reject rishta profiles, delete abusive content, create reporter accounts, and run cleanup operations.

---

### Q30. How did you deploy the project?

**Model answer:**

> The backend is deployed on DigitalOcean App Platform. The frontend mobile app is built using Expo EAS. Environment variables are used for API URLs, secrets, geofence settings, email config, database config, and media credentials. Prisma handles database schema generation and synchronization.

---

## 11.4 Advanced Interview Questions

These questions test architecture judgment, production awareness, scaling, and deeper engineering thinking.

---

### Q31. What is unique or advanced about your backend database design?

**Model answer:**

> One advanced part is the custom database manager. Instead of using only a single PostgreSQL connection, the backend supports multiple database URLs. It monitors database size and can switch active writes to another database when one approaches its free-tier limit. Read operations can also aggregate across databases through a proxy layer. This was designed to work around storage limits while keeping the app functioning like a single logical system.

---

### Q32. What is unique about your Cloudinary integration?

**Model answer:**

> Similar to the database manager, I implemented a Cloudinary account manager that can monitor usage credits and rotate to another configured Cloudinary account when the active one is close to its limit. This adds operational resilience and cost-awareness for media-heavy features.

---

### Q33. How do you secure protected routes in the backend?

**Model answer:**

> Protected routes are secured using JWT authentication middleware. The middleware extracts the token from the `Authorization` header, verifies it using the server secret, loads the actual user from the database, checks account status, and then attaches the user object to the request. Additional middleware like `adminOnly` and `verifiedOnly` enforce role-based rules.

---

### Q34. What are the main security concerns in this type of app?

**Model answer:**

> The main security concerns include secure password storage, JWT secret protection, validation of uploaded files, rate limiting abuse, access control for admin features, privacy of CNIC uploads, and preventing unauthorized data updates. This project addresses some of those using bcrypt, JWT, middleware, multer limits, and cleanup of sensitive rishta documents after admin decisions.

---

### Q35. What would you improve if this project had to scale further?

**Model answer:**

> I would consider adding WebSockets for real-time messaging, Redis for caching and queues, background jobs for media processing and notification delivery, stronger validation layers, and better search capabilities. I would also consider separating some feature domains into services if traffic became large enough.

---

### Q36. Why did you store media URLs in the database instead of files?

**Model answer:**

> Databases are better suited for structured data, not large media blobs. Storing URLs keeps the database smaller, faster, and easier to back up. Media hosting platforms are better optimized for delivery, compression, CDN distribution, and transformation.

---

### Q37. What tradeoffs did you make by using polling for chat?

**Model answer:**

> Polling is simpler and easier to integrate with a REST backend, but it generates repeated requests and is less real-time than WebSockets. I accepted that tradeoff because it reduced system complexity and was good enough for moderate local usage.

---

### Q38. How does your app maintain privacy in the rishta feature?

**Model answer:**

> The rishta feature uses admin review, verified-user access restrictions, and deletion of CNIC images after the approval or rejection decision. That helps reduce fake profiles and also reduces long-term retention of sensitive identity documents.

---

### Q39. How do you avoid loading too much data at once?

**Model answer:**

> I used pagination in several endpoints like posts, notifications, news, jobs, doctors, and chat messages. The backend calculates `skip` and `take` values, and the frontend loads more data progressively using pull-to-refresh and infinite scroll patterns.

---

### Q40. How do you handle moderation and abuse in the app?

**Model answer:**

> The app includes reporting and blocking systems. Users can report content or users, and admins can review reports and take actions like blocking users, dismissing reports, or deleting content. There are also admin moderation endpoints for posts, listings, chat messages, and other entities.

---

### Q41. What is a good example of business logic in your backend?

**Model answer:**

> A good example is the rishta approval workflow. It is more than CRUD. It includes agreement acceptance, CNIC upload, admin review, role upgrade to `VERIFIED_USER`, deletion of identity documents for privacy, email notifications, and unlocking of new app capabilities. That is a real business process implemented in code.

---

### Q42. How do you explain the database relationships in simple terms?

**Model answer:**

> I explain them as ownership and connections. A user owns posts, listings, jobs, and maybe a rishta profile. A post can have many comments and likes. A job can have many applications. A restaurant can have many deals. Prisma makes those relationships easy to define and query.

---

### Q43. Why is this project a good full-stack project?

**Model answer:**

> It is a good full-stack project because it includes frontend UI, navigation, state management, backend APIs, authentication, database design, media uploads, role-based access control, third-party integrations, deployment, and monetization. It shows end-to-end product thinking instead of only UI or only backend coding.

---

### Q44. How would you talk about tradeoffs in this project honestly?

**Model answer:**

> I would say the project prioritizes practical delivery and feature breadth. For example, polling is simpler than WebSockets, freeimage.host is cheaper for images, and multi-account rotation helps with free-tier limits. These are practical solutions, although they could later be replaced with more scalable infrastructure as usage grows.

---

### Q45. If asked what you learned from this project, what would you say?

**Model answer:**

> I learned how to design a full-stack feature from UI to database, how to structure route-based Express backends, how to manage state and API communication in React Native, how to model real business workflows like verification and moderation, and how to think about deployment, cost limits, and practical scaling.

---

## 11.5 Scenario-Based Questions

Interviewers often ask practical scenarios. These are very important.

---

### Q46. Suppose users complain that chat feels delayed. What would you investigate?

**Model answer:**

> I would first check the polling interval because the app currently uses polling rather than sockets. Then I would inspect backend response times, database query speed, and whether media-heavy messages are slowing requests. If needed, I would consider moving to WebSockets for a more real-time experience.

---

### Q47. Suppose duplicate listings are appearing. Where would you investigate?

**Model answer:**

> I would check whether the issue is frontend-side repeated submission, backend request retries, or missing uniqueness/business validation. I would inspect the listing creation endpoint, request logs, and whether the UI disables the submit button during upload. If the business required it, I could add idempotency or stronger duplicate detection rules.

---

### Q48. Suppose users outside Shahkot are still accessing the app. What could be wrong?

**Model answer:**

> I would first check whether `SKIP_GEOFENCE` is enabled in environment variables. Then I would inspect both frontend and backend geofence logic, because the frontend check is only for UX and the backend must enforce the rule. I would also verify that latitude and longitude are actually being sent and parsed correctly.

---

### Q49. Suppose image uploads start failing but text posts still work. What would you check?

**Model answer:**

> I would inspect the upload route, multer validation, file size limits, and the external image host configuration. Since text posts do not depend on the media upload path, the failure is likely in multipart parsing, media validation, or the external upload service.

---

### Q50. Suppose AdMob revenue is low but users complain about too many ads. What would you do?

**Model answer:**

> I would review ad placement and user flow. Too many interstitials can hurt retention, which can also reduce revenue in the long run. I would test fewer intrusive ads, optimize banner placement, and check metrics like session duration, screen views, and ad impressions before changing the strategy.

---

## 11.6 Strong Interview Talking Points

These are short points you can naturally mention during interviews.

### Good technical talking points

- city-focused app with geofence-based access control
- React Native frontend with Expo and EAS deployment
- Node.js and Express backend with Prisma ORM
- PostgreSQL relational schema with multiple business domains
- JWT authentication with role-based access control
- CNIC-verified matrimonial approval workflow
- social feed, marketplace, jobs, chat, and admin moderation
- media upload split across image and video services
- custom database and Cloudinary rotation logic for free-tier limits
- AdMob monetization strategy with controlled pacing

### Good product talking points

- built around local community needs
- designed for relevance rather than general nationwide noise
- WhatsApp-based local commerce workflow
- trust-focused rishta feature with admin review
- practical focus on affordability and real user behavior

---

## 11.7 How to Answer “What Was Your Contribution?”

If you worked heavily with AI assistance, answer honestly but confidently.

You can say:

> "I designed, reviewed, integrated, and understood the full system. AI assistance helped accelerate implementation, but I was responsible for understanding the architecture, connecting the parts, validating behavior, refining the structure, and making sure the final project worked as a cohesive real application."

That answer is honest and still shows ownership.

---

# SECTION 12: LEARNING RESOURCES

This section helps you continue learning the technologies used in this project.

I am grouping resources into:

1. Hindi/Urdu YouTube resources
2. Official documentation
3. Useful written articles and guides

---

## 12.1 YouTube Tutorials in Hindi/Urdu

Below are recommended creators and search topics. Since video links change over time, it is often better to search by channel name + topic.

---

### React Native / JavaScript / Node.js

#### 1. Code Step By Step

Search terms:

- `Code Step By Step React Native Hindi`
- `Code Step By Step Node.js Express Hindi`
- `Code Step By Step PostgreSQL Hindi`

Why useful:

- beginner-friendly Hindi explanations
- practical code demonstrations
- good for fundamentals

#### 2. Thapa Technical

Search terms:

- `Thapa Technical React Native Hindi`
- `Thapa Technical Node.js Express Hindi`
- `Thapa Technical JWT authentication`

Why useful:

- clear explanations
- concept + coding balance

#### 3. Technical Suneja

Search terms:

- `Technical Suneja React Native`
- `Technical Suneja Node.js`
- `Technical Suneja JWT`

Why useful:

- simple explanations for beginners
- backend topics explained practically

#### 4. Piyush Garg

Search terms:

- `Piyush Garg Node.js Hindi`
- `Piyush Garg system design Hindi`
- `Piyush Garg backend project`

Why useful:

- strong backend explanations
- good for intermediate understanding

#### 5. Hitesh Choudhary

Search terms:

- `Hitesh Choudhary JavaScript Hindi`
- `Hitesh Choudhary React Native`
- `Hitesh Choudhary backend`

Why useful:

- strong conceptual teaching
- good motivation and clarity

---

### PostgreSQL / Prisma / Database Design

#### 6. Chai aur Code / Hitesh Choudhary ecosystem

Search terms:

- `Prisma Hindi`
- `PostgreSQL Hindi`
- `database design Hindi`

#### 7. Piyush Garg

Search terms:

- `Prisma ORM Hindi`
- `PostgreSQL with Node.js Hindi`

Why useful:

- useful for backend and DB structure understanding

---

### Urdu-oriented search suggestions

If you prefer Urdu, search using keywords like:

- `React Native Urdu tutorial`
- `Node.js Urdu tutorial`
- `Express.js Urdu`
- `JWT authentication Urdu`
- `PostgreSQL Urdu`
- `Prisma Urdu`

Even when the exact tutorial is not fully in Urdu, many Pakistani and Indian creators explain in a Hindi-Urdu mixed style that is very easy to follow.

---

## 12.2 Official Documentation

These are the most trusted sources.

---

### React

- https://react.dev/

Best for:

- components
- hooks
- context
- state management basics

### React Native

- https://reactnative.dev/

Best for:

- native components
- styling
- platform APIs

### Expo

- https://docs.expo.dev/

Best for:

- Expo setup
- EAS build
- image picker
- audio/video
- location APIs

### React Navigation

- https://reactnavigation.org/

Best for:

- stack navigation
- tab navigation
- navigation patterns

### Axios

- https://axios-http.com/docs/intro

Best for:

- API calls
- interceptors
- request/response config

### Node.js

- https://nodejs.org/en/docs

Best for:

- runtime concepts
- modules
- async programming

### Express.js

- https://expressjs.com/

Best for:

- routing
- middleware
- request lifecycle

### Prisma

- https://www.prisma.io/docs

Best for:

- schema design
- queries
- relations
- migrations

### PostgreSQL

- https://www.postgresql.org/docs/

Best for:

- SQL concepts
- indexes
- constraints
- performance basics

### Cloudinary

- https://cloudinary.com/documentation

Best for:

- upload API
- transformations
- delivery optimization

### Firebase Admin / FCM

- https://firebase.google.com/docs/admin/setup
- https://firebase.google.com/docs/cloud-messaging

Best for:

- push notifications
- service account setup

### AdMob / Google Mobile Ads

- https://developers.google.com/admob
- https://invertase.io/oss/react-native-google-mobile-ads

Best for:

- monetization
- banner/interstitial/app-open ads

### bcrypt

- https://www.npmjs.com/package/bcryptjs

### jsonwebtoken

- https://www.npmjs.com/package/jsonwebtoken

### multer

- https://github.com/expressjs/multer

---

## 12.3 Useful Articles and Guides

These are the types of article topics that will help you understand this project deeply.

---

### For authentication

Search for:

- `JWT authentication best practices`
- `bcrypt password hashing guide`
- `role based access control Express`

Why useful:

- helps explain your auth design in interviews

---

### For Prisma and database design

Search for:

- `Prisma relations explained`
- `one to many relationship Prisma`
- `database schema design for social app`
- `PostgreSQL indexing beginner guide`

Why useful:

- helps you understand why your schema works

---

### For React Native architecture

Search for:

- `React Native project structure best practices`
- `React Native context api auth`
- `React Native performance guide`

Why useful:

- helps justify frontend structure decisions

---

### For Express backend design

Search for:

- `Express middleware explained`
- `Express route structure best practices`
- `REST API design guide`

Why useful:

- helps you explain the backend cleanly

---

### For file uploads and media storage

Search for:

- `multipart form data explained`
- `multer memory storage guide`
- `Cloudinary Node.js upload tutorial`

Why useful:

- helps you understand your upload pipeline better

---

### For system design and scaling

Search for:

- `polling vs websockets`
- `REST API scaling basics`
- `database sharding beginner explanation`
- `cdn for media delivery explained`

Why useful:

- useful for advanced interview discussion

---

## 12.4 Recommended Learning Order

If you want to truly master this project, study in this order:

### Step 1: JavaScript fundamentals

Learn:

- variables
- functions
- objects
- arrays
- async/await
- promises

### Step 2: React basics

Learn:

- components
- props
- state
- hooks
- context

### Step 3: React Native + Expo

Learn:

- views
- text
- lists
- forms
- navigation
- image picker
- permissions

### Step 4: Node.js + Express

Learn:

- server basics
- routing
- middleware
- request/response cycle

### Step 5: PostgreSQL + Prisma

Learn:

- tables
- rows
- relationships
- CRUD
- Prisma schema and queries

### Step 6: Authentication

Learn:

- bcrypt
- JWT
- protected routes
- role-based access

### Step 7: Media and external services

Learn:

- file uploads
- Cloudinary
- email sending
- push notifications

### Step 8: Deployment

Learn:

- environment variables
- production builds
- backend hosting
- mobile app builds with EAS

This order matches the way this project is built.

---

## 12.5 Final Interview Confidence Advice

To explain this project confidently, do not try to memorize everything word-for-word.

Instead, remember these 5 anchors:

### Anchor 1: Product

"It is a local super app for Shahkot residents."

### Anchor 2: Stack

"React Native + Expo frontend, Node.js + Express backend, PostgreSQL + Prisma database."

### Anchor 3: Unique value

"It uses geofencing so only users near Shahkot can access the app."

### Anchor 4: Strong features

"It includes marketplace, jobs, verified rishta, feed, messaging, directories, and admin moderation."

### Anchor 5: Engineering depth

"It includes authentication, uploads, notifications, deployment, media hosting, AdMob monetization, and custom rotation logic for free-tier limits."

If you can clearly explain those five anchors, you will already sound strong in an interview.

---

## 12.6 Final Practice Exercise

Before your interview, practice answering these 3 questions aloud:

1. **What does your project do?**
2. **How does authentication and geofencing work?**
3. **Which feature are you most proud of and why?**

If you can answer those clearly in 1 to 2 minutes each, you are in a very good position.

---

## Final Recap of the Interview Section

You now have:

- beginner interview questions
- intermediate interview questions
- advanced interview questions
- scenario-based questions
- model answers
- talking points for honesty and ownership
- learning resources in Hindi/Urdu and official docs

This section should help you speak about the project with much more confidence and structure.
