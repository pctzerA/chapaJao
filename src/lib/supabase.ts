import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface BolaoUser {
  id: string;
  nome: string;
  telefone: string;
  role: 'user' | 'admin';
  predictions: Record<string, { home: string; away: string }>;
  locked_rounds: Record<string, boolean>; // Rodadas com palpites bloqueados
  created_at: string;
}

export interface BolaoRound {
  id: string;
  stage: string;
  ordem: number;
  created_at: string;
}

export interface BolaoMatch {
  id: string;
  round_id: string;
  date: string;
  time: string;
  home_team: string;
  away_team: string;
  venue: string;
  ordem: number;
  created_at: string;
}

// Database operations
export const db = {
  // Get all users
  async getAllUsers(): Promise<BolaoUser[]> {
    const { data, error } = await supabase
      .from('bolao_users')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data || [];
  },

  // Get user by phone
  async getUserByPhone(telefone: string): Promise<BolaoUser | null> {
    const { data, error } = await supabase
      .from('bolao_users')
      .select('*')
      .eq('telefone', telefone)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // User not found
        return null;
      }
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  },

  // Create new user
  async createUser(nome: string, telefone: string): Promise<BolaoUser | null> {
    const { data, error } = await supabase
      .from('bolao_users')
      .insert({
        nome,
        telefone,
        role: 'user',
        predictions: {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return data;
  },

  // Update user
  async updateUser(
    telefone: string, 
    updates: Partial<Pick<BolaoUser, 'nome' | 'telefone' | 'role' | 'predictions'>>
  ): Promise<BolaoUser | null> {
    const { data, error } = await supabase
      .from('bolao_users')
      .update(updates)
      .eq('telefone', telefone)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  },

  // Delete user
  async deleteUser(telefone: string): Promise<boolean> {
    const { error } = await supabase
      .from('bolao_users')
      .delete()
      .eq('telefone', telefone);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  },

  // Update predictions
  async updatePredictions(
    telefone: string,
    predictions: Record<string, { home: string; away: string }>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('bolao_users')
      .update({ predictions })
      .eq('telefone', telefone);

    if (error) {
      console.error('Error updating predictions:', error);
      return false;
    }

    return true;
  },

  // Toggle admin role
  async toggleAdmin(telefone: string, isAdmin: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('bolao_users')
      .update({ role: isAdmin ? 'admin' : 'user' })
      .eq('telefone', telefone);

    if (error) {
      console.error('Error toggling admin:', error);
      return false;
    }

    return true;
  },

  // Lock round predictions
  async lockRound(telefone: string, roundName: string): Promise<boolean> {
    // Get current locked_rounds
    const { data: user } = await supabase
      .from('bolao_users')
      .select('locked_rounds')
      .eq('telefone', telefone)
      .single();

    if (!user) return false;

    const lockedRounds = user.locked_rounds || {};
    lockedRounds[roundName] = true;

    const { error } = await supabase
      .from('bolao_users')
      .update({ locked_rounds: lockedRounds })
      .eq('telefone', telefone);

    if (error) {
      console.error('Error locking round:', error);
      return false;
    }

    return true;
  },

  // Check if round is locked
  async isRoundLocked(telefone: string, roundName: string): Promise<boolean> {
    const { data: user } = await supabase
      .from('bolao_users')
      .select('locked_rounds')
      .eq('telefone', telefone)
      .single();

    if (!user) return false;

    return user.locked_rounds?.[roundName] === true;
  },

  // === ROUNDS & MATCHES MANAGEMENT ===

  // Get all rounds with their matches
  async getAllRounds(): Promise<{ stage: string; partidas: any[] }[]> {
    const { data: rounds, error: roundsError } = await supabase
      .from('bolao_rounds')
      .select('*')
      .order('ordem', { ascending: true });

    if (roundsError) {
      console.error('Error fetching rounds:', roundsError);
      return [];
    }

    if (!rounds || rounds.length === 0) return [];

    // Get matches for all rounds
    const { data: matches, error: matchesError } = await supabase
      .from('bolao_matches')
      .select('*')
      .order('ordem', { ascending: true });

    if (matchesError) {
      console.error('Error fetching matches:', matchesError);
      return [];
    }

    // Group matches by round
    return rounds.map(round => ({
      stage: round.stage,
      partidas: (matches || []).filter(m => m.round_id === round.id).map(m => ({
        id: m.id,
        date: m.date,
        time: m.time,
        home: m.home_team,
        away: m.away_team,
        venue: m.venue
      }))
    }));
  },

  // Create new round with matches
  async createRound(stage: string, matches: { homeTeam: string; awayTeam: string; date: string; time: string; venue: string }[]): Promise<boolean> {
    // Get max ordem
    const { data: maxRound } = await supabase
      .from('bolao_rounds')
      .select('ordem')
      .order('ordem', { ascending: false })
      .limit(1)
      .single();

    const nextOrdem = (maxRound?.ordem || 0) + 1;

    // Insert round
    const { data: round, error: roundError } = await supabase
      .from('bolao_rounds')
      .insert({ stage, ordem: nextOrdem })
      .select()
      .single();

    if (roundError) {
      console.error('Error creating round:', roundError);
      return false;
    }

    // Insert matches
    const matchInserts = matches.map((m, i) => ({
      id: `r${nextOrdem}-${i + 1}`,
      round_id: round.id,
      date: m.date,
      time: m.time,
      home_team: m.homeTeam,
      away_team: m.awayTeam,
      venue: m.venue,
      ordem: i + 1
    }));

    const { error: matchesError } = await supabase
      .from('bolao_matches')
      .insert(matchInserts);

    if (matchesError) {
      console.error('Error creating matches:', matchesError);
      // Rollback: delete the round
      await supabase.from('bolao_rounds').delete().eq('id', round.id);
      return false;
    }

    return true;
  },

  // Update round and its matches
  async updateRound(oldStage: string, newStage: string, matches: { homeTeam: string; awayTeam: string; date: string; time: string; venue: string }[]): Promise<boolean> {
    // Get round by stage
    const { data: round, error: findError } = await supabase
      .from('bolao_rounds')
      .select('*')
      .eq('stage', oldStage)
      .single();

    if (findError || !round) {
      console.error('Error finding round:', findError);
      return false;
    }

    // Update round stage if changed
    if (oldStage !== newStage) {
      const { error: updateError } = await supabase
        .from('bolao_rounds')
        .update({ stage: newStage })
        .eq('id', round.id);

      if (updateError) {
        console.error('Error updating round:', updateError);
        return false;
      }
    }

    // Delete old matches
    const { error: deleteError } = await supabase
      .from('bolao_matches')
      .delete()
      .eq('round_id', round.id);

    if (deleteError) {
      console.error('Error deleting old matches:', deleteError);
      return false;
    }

    // Insert new matches
    const matchInserts = matches.map((m, i) => ({
      id: `${round.id.slice(0, 8)}-${i + 1}`,
      round_id: round.id,
      date: m.date,
      time: m.time,
      home_team: m.homeTeam,
      away_team: m.awayTeam,
      venue: m.venue,
      ordem: i + 1
    }));

    const { error: insertError } = await supabase
      .from('bolao_matches')
      .insert(matchInserts);

    if (insertError) {
      console.error('Error inserting new matches:', insertError);
      return false;
    }

    return true;
  },

  // Delete round (cascade deletes matches)
  async deleteRound(stage: string): Promise<boolean> {
    const { error } = await supabase
      .from('bolao_rounds')
      .delete()
      .eq('stage', stage);

    if (error) {
      console.error('Error deleting round:', error);
      return false;
    }

    return true;
  }
};
