import { supabase } from '@/integrations/supabase/client';

// Check if user is admin through database lookup instead of hardcoded emails
export const isAdminUser = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_admin');
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    return data || false;
  } catch (error) {
    console.error('Error in admin check:', error);
    return false;
  }
};

export const ensureAdminApproval = async (userId: string, email: string, name: string): Promise<void> => {
  try {
    console.log('Ensuring admin approval for:', email);
    
    // Check if user profile exists
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role, is_approved')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error checking user profile:', profileError);
      return;
    }

    // If user is already admin and approved, no need to do anything
    if (profile && profile.role === 'admin' && profile.is_approved) {
      console.log('User is already an approved admin');
      return;
    }

    // If profile exists but not admin, update it
    if (profile) {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          role: 'admin',
          is_approved: true 
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Error updating admin profile:', updateError);
      } else {
        console.log('Admin profile updated successfully');
      }
    } else {
      // Create new admin profile
      console.log('Creating admin profile entry');
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          email: email,
          name: name,
          role: 'admin',
          is_approved: true
        });
      
      if (insertError) {
        console.error('Error creating admin profile:', insertError);
      } else {
        console.log('Admin profile created successfully');
      }
    }
  } catch (error) {
    console.error('Error managing admin approval:', error);
  }
};

export const checkUserApproval = async (userId: string): Promise<boolean> => {
  try {
    console.log('Checking user approval for:', userId);
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_approved')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error checking user approval:', profileError);
      return false;
    }

    const isApproved = profile?.is_approved || false;
    console.log('User approval status:', isApproved);
    return isApproved;
  } catch (error) {
    console.error('Error in approval process:', error);
    return false;
  }
};

export const createApprovalRequest = async (userId: string, email: string, name: string): Promise<void> => {
  try {
    console.log('Creating approval request for:', email);
    // Check if profile already exists
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      console.log('User profile already exists');
      return;
    }

    // Create user profile with pending approval status
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        email: email,
        name: name,
        role: 'user',
        is_approved: false
      });

    if (insertError) {
      console.error('Error creating user profile:', insertError);
    } else {
      console.log('User profile created successfully');
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
};