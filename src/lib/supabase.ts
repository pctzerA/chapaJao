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
  }
};
