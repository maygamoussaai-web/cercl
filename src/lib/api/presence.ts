import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

// Présence en ligne légère via Supabase Realtime Presence (pas de ligne en base
// par utilisateur/seconde — cf. §6 des directives complémentaires).
export function useCirclePresence(circleId: string | undefined, userId: string | undefined) {
  const [online, setOnline] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!circleId || !userId) return undefined;

    const channel = supabase.channel(`presence-circle-${circleId}`, {
      config: { presence: { key: userId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnline(new Set(Object.keys(state)));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [circleId, userId]);

  return online;
}
