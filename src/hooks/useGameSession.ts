import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { GameSession, PlayerScore } from '../types';

export function useGameSession(sessionId: string) {
  const [session, setSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionSubscription = supabase
      .channel(`game_session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          setSession(payload.new as GameSession);
        }
      )
      .subscribe();

    const playersSubscription = supabase
      .channel(`player_scores:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'player_scores',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          // Refresh player scores when changes occur
          fetchPlayers();
        }
      )
      .subscribe();

    async function fetchInitialData() {
      try {
        const [sessionResult, playersResult] = await Promise.all([
          supabase
            .from('game_sessions')
            .select('*')
            .eq('id', sessionId)
            .single(),
          supabase
            .from('player_scores')
            .select('*')
            .eq('session_id', sessionId)
            .order('score', { ascending: false }),
        ]);

        if (sessionResult.error) throw sessionResult.error;
        if (playersResult.error) throw playersResult.error;

        setSession(sessionResult.data);
        setPlayers(playersResult.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    async function fetchPlayers() {
      const { data, error: playersError } = await supabase
        .from('player_scores')
        .select('*')
        .eq('session_id', sessionId)
        .order('score', { ascending: false });

      if (!playersError && data) {
        setPlayers(data);
      }
    }

    fetchInitialData();

    return () => {
      sessionSubscription.unsubscribe();
      playersSubscription.unsubscribe();
    };
  }, [sessionId]);

  return { session, players, loading, error };
}