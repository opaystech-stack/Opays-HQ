"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { canAccessModule } from '@/lib/rbac';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  type: 'ASSOCIATE' | 'EMPLOYEE';
  role: 'CEO' | 'COO' | 'CTO' | 'SALES' | 'INVESTOR' | 'ENGINEER' | 'ADMIN';
  is_admin: boolean;
  equity_percent: number;
  salary_amount: number;
  vesting_start_date: string;
  avatar_url: string | null;
  permissions: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

interface ProfileContextValue {
  profile: Profile | null;
  loading: boolean;
  isAssociate: boolean;
  isManager: boolean;
  isCEO: boolean;
  isSalesLead: boolean;
  unreadCount: number;
  refreshProfile: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  checkAccess: (moduleId: string) => boolean;
  logout: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}

export function ProfileProvider({ 
  initialProfile, 
  children 
}: { 
  initialProfile: Profile | null;
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const isAssociate = profile?.type === 'ASSOCIATE';
  const isManager = ['CEO', 'COO', 'CTO', 'ADMIN'].includes(profile?.role || '') || !!profile?.is_admin;
  const isCEO = profile?.role === 'CEO' || !!profile?.is_admin;
  const isSalesLead = profile?.role === 'SALES' || profile?.role === 'CEO';

  const checkAccess = useCallback((moduleId: string): boolean => {
    return canAccessModule(profile, moduleId);
  }, [profile]);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) setProfile(data as Profile);
    }
    setLoading(false);
  }, [supabase]);

  const refreshNotifications = useCallback(async () => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profile?.id)
      .eq('is_read', false);
    setUnreadCount(count || 0);
  }, [supabase, profile?.id]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }, [supabase]);

  // Fetch notification count on mount and subscribe to changes
  useEffect(() => {
    if (!profile?.id) return;
    refreshNotifications();

    const channel = supabase
      .channel('notifications-count')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `profile_id=eq.${profile.id}`,
      }, () => {
        refreshNotifications();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, refreshNotifications, supabase]);

  const value = useMemo(() => ({
    profile,
    loading,
    isAssociate,
    isManager,
    isCEO,
    isSalesLead,
    unreadCount,
    refreshProfile,
    refreshNotifications,
    checkAccess,
    logout,
  }), [profile, loading, isAssociate, isManager, isCEO, isSalesLead, unreadCount, refreshProfile, refreshNotifications, checkAccess, logout]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}
