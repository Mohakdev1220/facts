// supabase-config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

// Get from: Supabase → Settings → API
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY_HERE";

// Initialize Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// FACTS OPERATIONS
// ============================================

export async function getAllFacts(categorySlug = null, limit = 20, offset = 0) {
  try {
    let query = supabase
      .from('facts')
      .select(`
        *,
        categories:category_id (id, name, emoji, slug)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    
    if (categorySlug) {
      query = query.eq('categories.slug', categorySlug);
    }
    
    const { data, error } = await query
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ Error fetching facts:", error);
    return [];
  }
}

export async function getFactById(id) {
  try {
    const { data, error } = await supabase
      .from('facts')
      .select(`
        *,
        categories:category_id (id, name, emoji, slug)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Increment views
    await supabase
      .from('facts')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', id);
    
    return data;
  } catch (error) {
    console.error("❌ Error fetching fact:", error);
    return null;
  }
}

export async function getFactsByCategory(categoryId) {
  try {
    const { data, error } = await supabase
      .from('facts')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ Error fetching facts by category:", error);
    return [];
  }
}

export async function searchFacts(query) {
  try {
    const { data, error } = await supabase
      .from('facts')
      .select('*')
      .eq('is_published', true)
      .ilike('title', `%${query}%`)
      .order('views', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ Error searching facts:", error);
    return [];
  }
}

export async function addFact(factData) {
  try {
    const { data, error } = await supabase
      .from('facts')
      .insert([factData])
      .select();
    
    if (error) throw error;
    
    // Log activity
    await logActivity('CREATE', data[0].id, factData);
    
    return data[0];
  } catch (error) {
    console.error("❌ Error adding fact:", error);
    throw error;
  }
}

export async function updateFact(id, updates) {
  try {
    // Get old data for audit
    const { data: oldData } = await supabase
      .from('facts')
      .select('*')
      .eq('id', id)
      .single();
    
    const { data, error } = await supabase
      .from('facts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    // Log activity
    await logActivity('UPDATE', id, { old: oldData, new: updates });
    
    return data[0];
  } catch (error) {
    console.error("❌ Error updating fact:", error);
    throw error;
  }
}

export async function deleteFact(id) {
  try {
    const { error } = await supabase
      .from('facts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Log activity
    await logActivity('DELETE', id, { deleted: true });
    
    return true;
  } catch (error) {
    console.error("❌ Error deleting fact:", error);
    throw error;
  }
}

// ============================================
// CATEGORY OPERATIONS
// ============================================

export async function getAllCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    return [];
  }
}

export async function getCategoryBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ Error fetching category:", error);
    return null;
  }
}

export async function addCategory(categoryData) {
  try {
    const slug = categoryData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const { data, error } = await supabase
      .from('categories')
      .insert([{ ...categoryData, slug }])
      .select();
    
    if (error) throw error;
    await logActivity('CREATE_CATEGORY', null, categoryData);
    return data[0];
  } catch (error) {
    console.error("❌ Error adding category:", error);
    throw error;
  }
}

export async function updateCategory(id, updates) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    await logActivity('UPDATE_CATEGORY', id, updates);
    return data[0];
  } catch (error) {
    console.error("❌ Error updating category:", error);
    throw error;
  }
}

export async function deleteCategory(id) {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    await logActivity('DELETE_CATEGORY', id, { deleted: true });
    return true;
  } catch (error) {
    console.error("❌ Error deleting category:", error);
    throw error;
  }
}

// ============================================
// IMAGE UPLOAD
// ============================================

export async function uploadImage(file, folder = 'uploads') {
  try {
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = `${folder}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('facts-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL or signed URL
    const { data: { publicUrl } } = supabase.storage
      .from('facts-images')
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error("❌ Error uploading image:", error);
    throw error;
  }
}

export async function deleteImage(imageUrl) {
  try {
    const filePath = imageUrl.split('/').pop();
    const { error } = await supabase.storage
      .from('facts-images')
      .remove([filePath]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("❌ Error deleting image:", error);
    throw error;
  }
}

// ============================================
// AUDIT LOG
// ============================================

async function logActivity(action, factId, changes) {
  try {
    // Get current admin user (from Firebase auth)
    const currentUser = auth.currentUser;
    
    await supabase
      .from('activity_logs')
      .insert([{
        admin_id: currentUser?.uid,
        action: action,
        fact_id: factId,
        changes: changes
      }]);
  } catch (error) {
    console.error("❌ Error logging activity:", error);
  }
}

export async function getActivityLogs(limit = 50) {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        admin_users:admin_id (email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ Error fetching logs:", error);
    return [];
  }
}

// ============================================
// ANALYTICS
// ============================================

export async function getAnalytics() {
  try {
    // Total facts
    const { count: totalFacts } = await supabase
      .from('facts')
      .select('*', { count: 'exact', head: true });
    
    // Total categories
    const { count: totalCategories } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    // Most viewed facts
    const { data: topFacts } = await supabase
      .from('facts')
      .select('id, title, views')
      .order('views', { ascending: false })
      .limit(5);
    
    return {
      totalFacts,
      totalCategories,
      topFacts
    };
  } catch (error) {
    console.error("❌ Error fetching analytics:", error);
    return {};
  }
}
