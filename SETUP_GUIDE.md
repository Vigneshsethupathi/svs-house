# SVS House Management App — Setup Guide
# SVS வீடு மேலாண்மை ஆப் — அமைப்பு வழிகாட்டி

## What you get / என்ன கிடைக்கும்
- Mobile PWA app (works like Android app, no Play Store needed)
- Phone number + OTP login
- Tamil / English language toggle
- Dashboard with budget tracker
- Materials management with photos
- Payment / Engineer payment tracking
- Daily construction photos
- Activity log (bottom-right floating button)
- Push notifications when anyone adds/edits

---

## STEP 1: Create Firebase Project
## படி 1: Firebase திட்டம் உருவாக்கவும்

1. Go to: https://console.firebase.google.com
2. Click "Add project" → Name it "svs-house"
3. Disable Google Analytics (optional) → Create project

### Enable services:
- **Authentication**: Build → Authentication → Get started → Phone (enable it)
- **Firestore**: Build → Firestore Database → Create database → Production mode → Choose region (asia-south1 for India)
- **Storage**: Build → Storage → Get started → Production mode
- **Hosting** (optional): Build → Hosting → Get started

### Get your config:
- Project Settings (gear icon) → Your apps → Add app → Web (</>)
- App name: "svs-house-web" → Register
- **Copy the firebaseConfig object** — you will need this

---

## STEP 2: Add your Firebase config
## படி 2: Firebase config சேர்க்கவும்

Open the file: `src/firebase.js`

Replace this section:
```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

With your actual config from Firebase Console.

---

## STEP 3: Enable Phone Auth & Add test number
## படி 3: Phone Auth இயக்கவும்

In Firebase Console:
1. Authentication → Sign-in method → Phone → Enable
2. For testing: Add test phone number: +91XXXXXXXXXX with test OTP: 123456
3. Add your 3 users' phone numbers as authorized users

### Add Firestore Security Rules:
Go to Firestore → Rules → Replace with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Add Storage Rules:
Go to Storage → Rules → Replace with:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## STEP 4: Deploy to GitHub Pages (FREE hosting)
## படி 4: GitHub Pages-ல் பதிவேற்றவும்

### One-time GitHub setup:
1. Go to https://github.com → Create account (free)
2. Create new repository named: `svs-house`
3. Make it Public

### In your terminal (in the svs-house folder):
```bash
# Install git if not installed
# Then run:

git init
git add .
git commit -m "SVS House App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/svs-house.git
git push -u origin main

# Deploy to GitHub Pages:
npm run deploy
```

4. Go to GitHub → your repo → Settings → Pages
5. Source: "gh-pages" branch → Save
6. Your app URL: `https://YOUR_USERNAME.github.io/svs-house`

**Update `package.json`** — change this line:
```json
"homepage": "https://YOUR_GITHUB_USERNAME.github.io/svs-house"
```
Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

---

## STEP 5: Share with your 3 users
## படி 5: 3 பயனர்களுக்கு பகிரவும்

Send them the URL: `https://YOUR_USERNAME.github.io/svs-house`

### How to install on Android:
1. Open Chrome → Go to the URL
2. Tap ⋮ (3 dots menu)
3. "Add to Home screen"
4. Tap "Add"
5. App icon appears on home screen ✓

### How to install on iPhone:
1. Open Safari → Go to the URL
2. Tap share button (box with arrow)
3. "Add to Home Screen"
4. Tap "Add" ✓

---

## STEP 6: Set up first Admin user
## படி 6: முதல் Admin பயனர் அமைவு

After first login:
1. Go to Firebase Console → Firestore → users collection
2. Find your user document
3. Change `role: "member"` to `role: "admin"`

---

## Firestore structure (auto-created by app)
```
/users/{uid}          → user profiles
/materials/{id}       → material entries
/payments/{id}        → payment entries  
/photos/{id}          → daily photos
/logs/{id}            → activity logs
/settings/budget      → total budget amount
```

---

## Notifications Setup (optional but recommended)
In Firebase Console → Cloud Messaging → Web Push certificates
Generate VAPID key → Add to your app's notification code

---

## Local development
```bash
npm install
npm start
# Opens at http://localhost:3000
```

## Update & redeploy
After any code changes:
```bash
npm run deploy
```
All 3 users get the update automatically next time they open the app.

---

## Cost: ₹0 (Completely Free)
- Firebase free tier: 50K reads/day, 20K writes/day — more than enough for 3 users
- GitHub Pages: Free forever for public repos
- No server needed, no monthly fees

---

## Support
If you get any errors, check:
1. Firebase config is correctly pasted
2. Phone number format: +91XXXXXXXXXX  
3. Firebase Authentication has Phone enabled
4. Firestore and Storage rules allow authenticated users
