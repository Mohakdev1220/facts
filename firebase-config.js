// firebase-config.js
// Get from: Firebase Console → Project Settings → Web App

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_AUTH_DOMAIN_HERE",
  projectId: "YOUR_PROJECT_ID_HERE",
  storageBucket: "YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Allowed admin emails (hardcoded for security)
const ADMIN_EMAILS = [
  "your-email@gmail.com", // Add your email here
  "other-admin@gmail.com"  // Add other admins
];

// Google Sign-In
async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user is admin
    if (!ADMIN_EMAILS.includes(user.email)) {
      await signOut(auth);
      throw new Error("❌ Not authorized. Only admins can access this panel.");
    }
    
    // Store Firebase UID in Supabase admin_users table
    await registerAdminUser(user.uid, user.email);
    
    return user;
  } catch (error) {
    console.error("❌ Login Error:", error.message);
    throw error;
  }
}

// Register admin user in Supabase
async function registerAdminUser(firebaseUid, email) {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .upsert({
        id: firebaseUid,
        email: email,
        firebase_uid: firebaseUid,
        role: 'editor',
        is_active: true
      }, { onConflict: 'firebase_uid' });
    
    if (error) throw error;
    console.log("✅ Admin user registered:", email);
  } catch (error) {
    console.error("❌ Admin registration error:", error);
  }
}

// Logout
async function logout() {
  try {
    await signOut(auth);
    console.log("✅ Logged out successfully");
  } catch (error) {
    console.error("❌ Logout Error:", error);
  }
}

// Monitor auth state
function onAuthChange(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user && ADMIN_EMAILS.includes(user.email)) {
      callback(user);
    } else if (user) {
      signOut(auth);
      callback(null);
    } else {
      callback(null);
    }
  });
}

export { auth, loginWithGoogle, logout, onAuthChange, ADMIN_EMAILS };
