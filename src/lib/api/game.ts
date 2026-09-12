import { supabase } from '@/lib/supabase';
import type { Game } from '@/types';

export async function fetchActiveGameForCircle(circleId: string): Promise<Game | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('circle_id', circleId)
    .in('status', ['lobby', 'in_progress'])
    .maybeSingle();
  if (error) throw error;
  return data as Game | null;
}

export async function fetchGame(gameId: string): Promise<Game> {
  const { data, error } = await supabase.from('games').select('*').eq('id', gameId).single();
  if (error) throw error;
  return data as Game;
}

export async function fetchGamePlayers(gameId: string) {
  const { data, error } = await supabase.from('game_players').select('*, profiles(*)').eq('game_id', gameId);
  if (error) throw error;
  return data ?? [];
}

export async function joinGame(gameId: string) {
  const { error } = await supabase.rpc('join_game', { p_game_id: gameId });
  if (error) throw error;
}

export async function advanceTurn(gameId: string) {
  const { data, error } = await supabase.rpc('advance_turn', { p_game_id: gameId });
  if (error) throw error;
  return data;
}

export async function finishGame(gameId: string): Promise<Game> {
  const { data, error } = await supabase.rpc('finish_game', { p_game_id: gameId });
  if (error) throw error;
  return data as Game;
}

export async function fetchLatestTurn(gameId: string) {
  const { data, error } = await supabase
    .from('game_turns')
    .select('*, game_content(text_content, type)')
    .eq('game_id', gameId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as any;
}

export async function chooseTurnType(turnId: string, choice: 'action' | 'verite') {
  const { data, error } = await supabase.rpc('choose_turn_type', { p_turn_id: turnId, p_choice: choice });
  if (error) throw error;
  return data;
}

export async function setCustomQuestion(turnId: string, question: string) {
  const { data, error } = await supabase.rpc('set_turn_custom_question', { p_turn_id: turnId, p_question: question });
  if (error) throw error;
  return data;
}

export async function setProofRequired(turnId: string, required: boolean) {
  const { error } = await supabase.rpc('set_proof_required', { p_turn_id: turnId, p_required: required });
  if (error) throw error;
}

export async function rerollTurnContent(turnId: string) {
  const { data, error } = await supabase.rpc('reroll_turn_content', { p_turn_id: turnId });
  if (error) throw error;
  return data;
}

export async function submitTurnResponse(
  turnId: string,
  params: { answerText?: string; proofUrl?: string; proofType?: 'photo' | 'video' }
) {
  const { error } = await supabase.rpc('submit_turn_response', {
    p_turn_id: turnId,
    p_answer_text: params.answerText ?? null,
    p_proof_url: params.proofUrl ?? null,
    p_proof_type: params.proofType ?? null,
  });
  if (error) throw error;
}

export async function rateTurn(turnId: string, stars: number) {
  const { data: userData } = await supabase.auth.getUser();
  const raterId = userData.user?.id;
  const { error } = await supabase.from('game_turn_ratings').upsert({ turn_id: turnId, rater_id: raterId, stars });
  if (error) throw error;
}

export async function fetchTurnRatings(turnId: string) {
  const { data, error } = await supabase.from('game_turn_ratings').select('*').eq('turn_id', turnId);
  if (error) throw error;
  return data ?? [];
}

export function subscribeToGame(gameId: string, onChange: () => void) {
  const channel = supabase
    .channel(`game-${gameId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'game_turns', filter: `game_id=eq.${gameId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'game_players', filter: `game_id=eq.${gameId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'game_turn_ratings' }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
