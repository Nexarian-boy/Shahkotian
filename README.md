kot App 🏙️

A comprehensive city app for **Shahkot, Pakistan** — a location-restricted platform (50KM radius) with social feed, marketplace, tournaments, govt directory, bazar finder, rishta/matrimonial, and news features.

---

## 📁 Project Structure

```
Shahkot/
├── backend/                    # Node.js + Express API
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (12 models)
│   ├── src/
│   │   ├── config/             # Database & Cloudinary config
│   │   ├── middleware/         # Auth (JWT), Geofence middleware
│   │   ├── routes/             # 10 route files (auth, posts, listings, etc.)
│   │   ├── utils/              # Geolocation, email, upload helpers
│   │   ├── seed.js             # Sample data seeder
│   │   └── server.js           # Express app entry point
│   ├── .env                    # Environment variables (CONFIGURE THIS)
│   └── package.json
│
├── NewShahkotApp/              # React Native + Expo (Mobile)
│   ├── src/
│   │   ├── config/constants.js # App constants, colors, categories
│   │   ├── context/AuthContext.js
│   │   ├── screens/            # 25+ screen components
│   │   ├── services/api.js     # Axios API layer
│   │   └── utils/geolocation.js
│   ├── App.js                  # Navigation setup
│   └── package.json
│
└── PLAN.md                     # Full implementation plan
```

---

## 🔧 Prerequisites

1. **Node.js** v18+ — [Download](https://nodejs.org)
2. **PostgreSQL** — [Download](https://www.postgresql.org/download/)
3. **Expo CLI** — `npm install -g expo-cli`
4. **Android Studio** (for emulator) or **Expo Go** app on your phone
5. **Cloudinary Account** (free) — [Sign up](https://cloudinary.com)
6. **Gmail App Password** (for Rishta email notifications)

---

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### 2. Configure Environment Variables

Edit `backend/.env`:

```env
# PostgreSQL - Create a database called "shahkot_db" first
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/shahkot_db?schema=public"

# JWT Secret (change this to something unique)
JWT_SECRET="your-super-secret-key-here"

# Cloudinary (from your Cloudinary dashboard)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (Gmail with App Password)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-16-digit-app-password"

# Admin Config
ADMIN_PHONE="+923001234567"    # First user with this phone becomes admin
ADMIN_EMAIL="admin@shahkotapp.com"
```

### 3. Database Setup

```bash
cd backend

# Push schema to database (creates all tables)
npx prisma db push

# Seed sample data (govt offices, shops)
npm run db:seed

# (Optional) View database in browser
npx prisma studio
```

### 4. Start Backend Server

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### 5. Mobile App Setup

```bash
cd ShahkotApp

# Install dependencies
npm install

# Start Expo
npx expo start
```

Then scan the QR code with **Expo Go** app, or press `a` to launch Android emulator.

---

## 📱 Features

### 1. Location Restriction (Geofencing)
- Haversine formula checks user is within 50KM of Shahkot center (31.9712°N, 73.4818°E)
- Users outside the radius cannot login or register
- Location is checked on app launch before showing login screen
- Backend also validates coordinates via geofenceCheck middleware

### 2. Social Feed (Posts)
- Create text + image + video posts (max 5 images or 3 videos)
- Videos up to 3 minutes, max 100MB each
- Like, comment, share
- Paginated feed, newest first
- Separate video feed for video-only posts

### 3. Buy & Sell (Marketplace)
- Post listings with images, price, description
- Categories: Electronics, Vehicles, Property, Furniture, etc.
- **WhatsApp number is mandatory** — direct chat link for buyers
- Search and filter by category/price

### 4. Tournaments (Admin Only)
- Only admins can create cricket, football, kabaddi, volleyball, hockey, badminton tournaments
- Add matches with teams, scores, results
- Public viewing for all users

### 5. Government Offices
- Directory of local govt offices with addresses and helplines
- Click-to-call phone numbers
- Searchable database

### 6. Bazar / Shop Finder
- **Search "What do you want to buy?"** → Shows which shops sell it
- Shop categories and product tags
- Shop locations and contact info

### 7. Rishta (Matrimonial)
- Digital agreement must be accepted before applying
- CNIC front & back upload required
- **Admin manually verifies and approves/rejects**
- Email notification sent on approval/rejection
- Approved users get `VERIFIED_USER` role
- Only verified users can browse rishta profiles

### 8. News
- Only admin-approved **reporters** can publish news
- Reporters have separate login credentials (created by admin)
- Categories: Local, Sports, Education, Politics, Business, Health, Entertainment

### 9. Admin Dashboard
- Full statistics overview
- User management
- Rishta approval workflow
- Reporter creation
- Content moderation

---

## 🔐 User Roles

| Role | Permissions |
|------|------------|
| `USER` | Post, Buy/Sell, View tournaments/offices/bazar/news |
| `VERIFIED_USER` | All USER + Browse rishta profiles |
| `NEWS_REPORTER` | Publish news articles (separate login) |
| `ADMIN` | Everything + Create tournaments, Approve rishta, Create reporters, Moderate content |

---

## 🛠️ API Endpoints

| Route | Description |
|-------|-------------|
| `POST /api/auth/register` | Register (with geofence check) |
| `POST /api/auth/login` | Login |
| `GET /api/posts` | Get feed |
| `POST /api/posts` | Create post |
| `GET /api/listings` | Browse marketplace |
| `POST /api/listings` | Create listing |
| `GET /api/tournaments` | List tournaments |
| `GET /api/govt-offices` | Govt offices directory |
| `GET /api/shops` | Search shops |
| `POST /api/rishta/apply` | Apply for rishta |
| `GET /api/news` | Browse news |
| `GET /api/admin/dashboard` | Admin stats |
| `PUT /api/admin/rishta/:id/approve` | Approve rishta |

---

## 📝 Tech Stack

- **Mobile**: React Native + Expo
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (30-day tokens)
- **Images & Videos**: Cloudinary
- **Email**: Nodemailer/Gmail
- **Geofencing**: Haversine formula

---

## 🏗️ Scripts

### Backend
```bash
npm run dev          # Start dev server with nodemon
npm start            # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Create migration
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed sample data
```

### Mobile
```bash
npx expo start       # Start dev server
npx expo start --android  # Start with Android
```

---

## ⚠️ Important Notes

1. **Video Limits**: Posts can have up to 3 videos (max 3 minutes, 100MB each). Other features (Rishta, Marketplace, Open Chat) do not support videos for safety and moderation.
2. **First User = Admin**: The first user to register with `ADMIN_PHONE` from `.env` becomes the admin
3. **WhatsApp Required**: Marketplace listings require a WhatsApp number for buyer contact
4. **CNIC Verification**: Rishta profiles require CNIC images — admin manually reviews before approval
5. **Location Check**: App checks location on every launch — users who move outside Shahkot radius lose access
6. **Rate Limiting**: API is rate-limited to 100 requests per 15 minutes per IP

---

## 📦 Build for Production

```bash
cd ShahkotApp

# Build APK for Android
npx expo build:android

# Or use EAS Build (recommended)
npx eas build --platform android
```

Update `PROD_API_URL` in `src/config/constants.js` before building.

---

## 🔒 Re-enabling Geofencing (After Testing)

Geofencing is currently **DISABLED** for testing. To re-enable location restrictions:

### Step 1: Frontend - `ShahkotApp/src/utils/geolocation.js`

**Change FROM:**
```javascript
export function isWithinShahkot(latitude, longitude) {
  // GEOFENCING DISABLED FOR TESTING
  return { isWithin: true, distance: 0, maxRadius: GEOFENCE_RADIUS_KM };
  // ... commented original code
}
```

**Change TO:**
```javascript
export function isWithinShahkot(latitude, longitude) {
  const distance = haversineDistance(
    SHAHKOT_CENTER.lat,
    SHAHKOT_CENTER.lng,
    latitude,
    longitude
  );

  return {
    isWithin: distance <= GEOFENCE_RADIUS_KM,
    distance: Math.round(distance * 100) / 100,
    maxRadius: GEOFENCE_RADIUS_KM,
  };
}
```

### Step 2: Frontend - `ShahkotApp/src/screens/LoginScreen.js`

Find the `checkLocation` function and:
1. **Remove** the bypass code that always sets location valid
2. **Uncomment** the original geofence checking code (marked with "ORIGINAL CODE")

### Step 3: Backend - `backend/.env`

**Change:**
```env
SKIP_GEOFENCE=true
```

**To:**
```env
SKIP_GEOFENCE=false
```

### Step 4: Rebuild and Redeploy

```bash
# Push changes to GitHub
cd E:\Shahkot
git add .
git commit -m "Re-enable geofencing for production"
git push origin master

# Rebuild app
cd ShahkotApp
eas build --platform android --profile production

# Redeploy backend on Render (automatic if connected to GitHub)
```
cd E:\Shahkot\ShahkotApp; eas build --platform android --non-interactive
---

Built for the people of Shahkot 🇵🇰
