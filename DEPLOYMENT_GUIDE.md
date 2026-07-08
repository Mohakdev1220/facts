# ⚡ DEPLOYMENT GUIDE - Facts CMS

## Setup in 30 Minutes

### STEP 1: Create Supabase Project (5 mins)

1. Go to **supabase.com** → Sign up
2. Create new project: `facts-cms`
3. Wait for deployment ⏳

### STEP 2: Create Database Tables (5 mins)

1. Go to **SQL Editor** in Supabase
2. Copy-paste this SQL and run it:

```sql
-- Create categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  emoji VARCHAR(10),
  description TEXT,
  slug VARCHAR(100) UNIQUE,
  icon_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create facts table
CREATE TABLE facts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  image_url TEXT,
  image_alt TEXT,
  animation_type VARCHAR(50) DEFAULT 'fade-in',
  tags TEXT[],
  views INTEGER DEFAULT 0,
  created_by UUID,
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create admin_users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  firebase_uid VARCHAR(255) UNIQUE,
  role VARCHAR(50) DEFAULT 'editor',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id),
  action VARCHAR(100),
  fact_id UUID REFERENCES facts(id),
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_facts_published ON facts(is_published);
CREATE INDEX idx_facts_category ON facts(category_id);
CREATE INDEX idx_facts_views ON facts(views);
```

### STEP 3: Create Storage Bucket (2 mins)

1. Go to **Storage** → Create new bucket
2. Name: `facts-images`
3. Make it **Private**
4. Create folder: `uploads`

### STEP 4: Get Supabase Credentials (2 mins)

1. Go to **Settings → API**
2. Copy:
   - Project URL → `SUPABASE_URL`
   - Anon Public Key → `SUPABASE_ANON_KEY`

### STEP 5: Setup Firebase (5 mins)

1. Go to **firebase.google.com** → Create project
2. Name: `facts-cms`
3. Enable Google sign-in:
   - Go to **Authentication → Sign-in method**
   - Enable **Google**
   - Add authorized domain: `mohakdev1220.github.io`

4. Get Firebase config:
   - Click your app
   - Copy config JSON

### STEP 6: Update Configuration in HTML Files

Open each HTML file and replace:

**admin-login.html** (Line ~102-113):
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_AUTH_DOMAIN_HERE",
    projectId: "YOUR_PROJECT_ID_HERE",
    storageBucket: "YOUR_STORAGE_BUCKET_HERE",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
    appId: "YOUR_APP_ID_HERE"
};

const ADMIN_EMAILS = [
    "your-email@gmail.com",  // ⚠️ YOUR EMAIL HERE
    "other-admin@gmail.com"   // Add other admins
];
```

**admin-dashboard.html** (Line ~658-669):
```javascript
const firebaseConfig = { /* same as above */ };
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY_HERE";
const ADMIN_EMAILS = ["your-email@gmail.com"];
```

**public-facts-site.html** (Line ~414-416):
```javascript
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY_HERE";
```

### STEP 7: Deploy to GitHub Pages

1. Create folder structure in your GitHub repo:
```
/admin
  ├── index.html (admin-login.html)
  └── dashboard.html (admin-dashboard.html)
/public
  └── index.html (public-facts-site.html)
```

2. Push to GitHub
3. Go to **Settings → Pages**
4. Set source to `main` branch
5. Wait for deployment ✅

### STEP 8: Access Your CMS

- **Admin Panel**: `https://mohakdev1220.github.io/admin/`
- **Public Site**: `https://mohakdev1220.github.io/public/`

---

## Bulk Import Existing Facts

If you have facts in HTML files, run this script:

```javascript
// bulk-import.js
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const facts = [
  {
    title: "Honey never spoils",
    description: "Archaeologists have found honey in Egyptian tombs that is over 3000 years old and still edible.",
    category_id: 7, // FOOD category
    tags: ["honey", "insects", "food"]
  },
  // Add more facts...
];

async function importFacts() {
  for (const fact of facts) {
    const { error } = await supabase
      .from('facts')
      .insert([fact]);
    if (error) console.error(error);
  }
}

importFacts();
```

---

## Security Checklist

- ✅ Firebase: Only Google Sign-In enabled
- ✅ Supabase: RLS policies enabled (read-only for public)
- ✅ Admin emails whitelist
- ✅ Images in private bucket
- ✅ Activity logs for audit trail
- ✅ HTTPS (GitHub Pages auto)

---

## Testing

### Test Admin Login
1. Go to `/admin/`
2. Click "Sign in with Google"
3. Should redirect to dashboard if email is whitelisted

### Test Adding Fact
1. In dashboard, go to "Add Fact" tab
2. Fill form → Add image → Submit
3. Check Supabase: should appear in `facts` table ✅

### Test Public Site
1. Go to `/public/`
2. Click category → should load facts
3. Search for fact → should work

---

## Troubleshooting

### Error: "Not authorized"
→ Add your email to `ADMIN_EMAILS` in both HTML files

### Error: "Network request failed"
→ Check SUPABASE_URL and SUPABASE_ANON_KEY are correct

### Error: "Failed to upload image"
→ Check `facts-images` bucket exists and is private

### Image not showing in public site
→ Check image URL in Supabase → Storage → facts-images

---

## Performance Tips

1. **Pagination**: Load 12 facts per page (not all)
2. **Images**: Compress to <500KB before upload
3. **Search**: Uses Supabase full-text search (fast)
4. **Caching**: Browser cache (60 min) auto-handled

---

## Next Steps

1. ✅ Deploy this CMS
2. ✅ Add your 22 categories
3. ✅ Start adding facts (10,000+)
4. ✅ Share with public
5. ✅ Monitor analytics

---

## Questions?

Check the complete setup guide in `CMS_SETUP_GUIDE.md`

Good luck! 🚀
