# ⚡ QUICK START - 30 Minute Setup

## 🎯 3 Simple Steps

### STEP 1: Create Accounts (5 mins)

**Supabase**
```
1. Go to supabase.com
2. Sign up → Create new project
3. Name: facts-cms
4. Wait for deployment
5. Note down: Project URL + Anon Key
```

**Firebase**
```
1. Go to firebase.google.com
2. Create project → Name: facts-cms
3. Go to Authentication → Enable Google
4. Add authorized domain: mohakdev1220.github.io
5. Get config from: Project Settings → Web App
```

### STEP 2: Setup Database (10 mins)

**Create Tables in Supabase SQL Editor:**

```sql
-- Categories
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  emoji VARCHAR(10),
  description TEXT,
  slug VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Facts
CREATE TABLE facts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  image_url TEXT,
  animation_type VARCHAR(50) DEFAULT 'fade-in',
  tags TEXT[],
  views INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin Users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'editor',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity Logs
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id),
  action VARCHAR(100),
  fact_id UUID REFERENCES facts(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_facts_published ON facts(is_published);
CREATE INDEX idx_facts_category ON facts(category_id);
```

**Create Storage Bucket:**
```
1. Go to Storage → New Bucket
2. Name: facts-images
3. Make it Private
```

### STEP 3: Deploy to GitHub (15 mins)

**Update Config in HTML Files:**

Find these lines and replace:

**admin-login.html (line ~110):**
```javascript
const firebaseConfig = {
    apiKey: "YOUR_KEY",
    authDomain: "YOUR_DOMAIN",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_BUCKET",
    messagingSenderId: "YOUR_ID",
    appId: "YOUR_APP"
};

const ADMIN_EMAILS = ["your-email@gmail.com"];
```

**admin-dashboard.html (line ~660):**
```javascript
const firebaseConfig = { /* same as above */ };
const SUPABASE_URL = "https://YOUR_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_KEY";
const ADMIN_EMAILS = ["your-email@gmail.com"];
```

**public-facts-site.html (line ~415):**
```javascript
const SUPABASE_URL = "https://YOUR_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_KEY";
```

**Push to GitHub:**
```bash
# Create folder structure
mkdir -p admin public

# Copy files
cp admin-login.html admin/index.html
cp admin-dashboard.html admin/dashboard.html
cp public-facts-site.html public/index.html

# Push to GitHub
git add .
git commit -m "Add Facts CMS"
git push origin main
```

---

## 🎉 Done! Access Your CMS

```
Admin Panel:    https://mohakdev1220.github.io/admin/
Public Site:    https://mohakdev1220.github.io/public/
Import Tool:    https://mohakdev1220.github.io/admin/import.html
```

---

## 📝 First Time Setup Checklist

- [ ] Supabase project created
- [ ] Firebase project created + Google auth enabled
- [ ] Database tables created in Supabase
- [ ] Storage bucket created
- [ ] Admin email added to ADMIN_EMAILS
- [ ] Config updated in 3 HTML files
- [ ] Files uploaded to GitHub
- [ ] Admin panel accessed (should show login)
- [ ] Logged in with Google (should go to dashboard)
- [ ] Add first category
- [ ] Add first fact
- [ ] View on public site

---

## 🚀 Quick Commands

**Add Categories (in admin panel):**
```
1. Go to Admin Panel
2. Click "Categories" tab
3. Add all 22 categories with emoji
```

**Import Facts (bulk):**
```
1. Prepare CSV with columns: title, description, category_id, tags
2. Go to bulk-import-tool.html
3. Upload CSV
4. Click Import
5. Done!
```

**View Analytics:**
```
1. Admin Panel → Analytics tab
2. See total facts, views, top facts
```

---

## ⚠️ Common Issues

| Error | Fix |
|-------|-----|
| "Not authorized" | Add your email to ADMIN_EMAILS |
| Image upload fails | Check facts-images bucket exists |
| Google login fails | Check authorized domain in Firebase |
| No facts on public site | Check is_published = true |
| Slow loading | Check image sizes (compress to <500KB) |

---

## 📞 Support

- Stuck? Check README.md (full docs)
- Database issues? Check CMS_SETUP_GUIDE.md
- Deployment issues? Check DEPLOYMENT_GUIDE.md

---

**All set! Your CMS is ready to power 10,000+ facts! 🧠✨**
