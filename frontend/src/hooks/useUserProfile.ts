import { useEffect, useState } from 'react';
import { userClient } from '../api/client';
import type { UserProfile } from '../proto/user';
import type { RpcOptions } from '@protobuf-ts/runtime-rpc';

export const useUserProfile = (userId: string | null, options?: RpcOptions) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchProfile = async () => {
      if (!userId) {
        setProfile(null);
        return;
      }
      try {
        setLoading(true);
        const { response } = await userClient.getUser({ id: userId }, options);
        if (active) setProfile(response);
      } catch (error) {
        console.warn('Failed to load profile', error);
        if (active) setProfile(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      active = false;
    };
  }, [options, userId]);

  return {
    profile,
    profileName: profile?.name ?? '',
    loading,
  };
};
