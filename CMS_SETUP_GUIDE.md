# COMPLETE CMS SETUP GUIDE - 10,000+ Facts Website

## Architecture Overview
```
Frontend (GitHub Pages) 
    ├── Public Site (Displays Facts)
    ├── Admin Panel (Manage Facts)
    └── Analytics Dashboard

Backend (Supabase)
    ├── PostgreSQL Database
    ├── Storage (Images)
    └── Auth (Optional backup)

Authentication (Firebase)
    └── Google Sign-In
```

---

## STEP 1: Supabase Setup (15 mins)

### 1.1 Create Supabase Project
```
1. Go to supabase.com → New Project
2. Name: "facts-cms"
3. Database Password: (save securely)
4. Region: Singapore (or closest to you)
5. Wait for deployment
```

### 1.2 Create Database Tables

**Table 1: `categories`**
```sql
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
```

**Table 2: `facts`**
```sql
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
```

**Table 3: `admin_users`**
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  firebase_uid VARCHAR(255) UNIQUE,
  role VARCHAR(50) DEFAULT 'editor',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Table 4: `activity_logs`** (For audit trail)
```sql
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id),
  action VARCHAR(100),
  fact_id UUID REFERENCES facts(id),
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 1.3 Create Storage Bucket
```
1. Go to Storage → New Bucket
2. Bucket name: "facts-images"
3. Make it Private (we'll use signed URLs)
4. Create folders inside:
   - /uploads
   - /categories
   - /featured
```

### 1.4 Get Supabase Credentials
```
Settings → API → Copy:
- Project URL (REACT_APP_SUPABASE_URL)
- Anon Public Key (REACT_APP_SUPABASE_ANON_KEY)
- Service Role Key (keep SECRET - for server only)
```

---

## STEP 2: Firebase Setup (10 mins)

### 2.1 Create Firebase Project
```
1. Go to firebase.google.com → Create Project
2. Name: "facts-cms"
3. Enable Google Analytics (optional)
4. Create
```

### 2.2 Enable Google Sign-In
```
1. Authentication → Sign-in method
2. Enable Google
3. Add your GitHub Pages domain to Authorized domains:
   - mohakdev1220.github.io
```

### 2.3 Get Firebase Config
```
Project Settings → Web App → Copy config:
{
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

---

## STEP 3: Create Admin Panel (HTML + JS)

### File Structure
```
/admin
  ├── index.html (Login Page)
  ├── dashboard.html (Main Admin Panel)
  ├── css/
  │   └── admin-styles.css
  └── js/
      ├── firebase-config.js
      ├── supabase-config.js
      ├── auth.js
      ├── admin.js
      └── api.js
```

---

## STEP 4: Create Public Site (Modified)

### File Structure
```
/public
  ├── index.html (Home - Category Cards)
  ├── category.html (Facts in Category)
  ├── fact.html (Single Fact Page)
  ├── css/
  │   └── styles.css
  └── js/
      ├── supabase-config.js
      ├── app.js (Load facts from DB)
      └── animations.js
```

---

## STEP 5: Security Rules

### Supabase RLS (Row Level Security)

**For `facts` table:**
```sql
-- Everyone can read published facts
CREATE POLICY "Public read published facts"
ON facts FOR SELECT
USING (is_published = true);

-- Only admins can modify
CREATE POLICY "Admins only modify facts"
ON facts FOR ALL
USING (auth.uid() IN (SELECT id FROM admin_users));
```

**For `admin_users` table:**
```sql
-- Only admins can see admin list
CREATE POLICY "Admins view admin users"
ON admin_users FOR SELECT
USING (auth.uid() IN (SELECT id FROM admin_users));
```

**For storage (`facts-images`):**
```sql
-- Public read
-- Admins write
```

---

## STEP 6: Key Features

### A. Add New Fact
```
- Title + Description
- Select Category
- Upload Image
- Choose Animation
- Add Tags
- Publish Toggle
- Auto-save to Supabase
```

### B. Edit/Delete Facts
```
- Search by title or category
- Bulk edit
- Soft delete (archive)
- Version history (via activity_logs)
```

### C. Manage Categories
```
- CRUD categories
- Reorder categories
- Add emoji/icons
```

### D. Analytics
```
- Total facts count
- Facts per category
- Most viewed facts
- Recent activity
```

---

## STEP 7: Deployment

### Admin Panel
```
1. Push to /admin folder in GitHub
2. Access at: mohakdev1220.github.io/admin
3. Protect with Firebase Auth (redirects to login if not authenticated)
```

### Public Site
```
1. Deploy facts app in /public folder
2. Fetches facts from Supabase on load
3. No backend needed (static site + API)
```

---

## Data Migration Strategy (For Existing Facts)

### If You Have Static HTML Files:
```
1. Parse HTML files
2. Extract title + description
3. Assign category_id
4. Upload to Supabase via script
5. Move images to Supabase Storage
```

### Script for Bulk Upload:
```javascript
// See bulk-import.js file below
```

---

## Performance Tips

1. **Pagination**: Load 20 facts per page (not 10,000 at once)
2. **Image Optimization**: Convert to WebP, compress before upload
3. **Caching**: Cache category list in localStorage (update daily)
4. **Search**: Use Supabase full-text search for 10,000+ facts
5. **CDN**: GitHub Pages + Supabase CDN automatically caches files

---

## Security Checklist

- [ ] Firebase OAuth 2.0 (Google Sign-In only)
- [ ] Supabase RLS policies enabled
- [ ] Admin users whitelist (only your email)
- [ ] Images in private bucket (signed URLs)
- [ ] Activity logs for audit trail
- [ ] Rate limiting on image uploads
- [ ] HTTPS only (GitHub Pages auto)
- [ ] Environment variables in .env (not in git)

