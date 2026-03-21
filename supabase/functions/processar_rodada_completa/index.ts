/**
 * Edge Function: processar_rodada_completa
 * 
 * Calcula pontuação dos usuários com base nos resultados oficiais
 * e desbloqueia conquistas automaticamente.
 * 
 * Lógica de Pontos:
 * - 6 pts: Placar exato (home e away corretos)
 * - 3 pts: Acertou vencedor ou empate (saldo correto)
 * - 2 pts: Placar invertido (acertou números mas trocados)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  home_score: number;
  away_score: number;
}

interface Match {
  id: string;
  home_team: string;
  away_team: string;
}

interface Achievement {
  id: string;
  badge_key: string;
  name: string;
  description: string;
  icon: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    const { match_id, home_score, away_score } = await req.json();

    console.log(`📊 Processando resultados: Match ${match_id} - ${home_score} x ${away_score}`);

    // Validar entrada
    if (!match_id || home_score === undefined || away_score === undefined) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros inválidos. Envie: match_id, home_score, away_score' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Buscar todos os palpites para esta partida
    const { data: predictions, error: predError } = await supabaseAdmin
      .from('predictions')
      .select('*')
      .eq('match_id', match_id);

    if (predError) {
      console.error('❌ Erro ao buscar palpites:', predError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar palpites: ' + predError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!predictions || predictions.length === 0) {
      console.log('⚠️ Nenhum palpite encontrado para esta partida');
      return new Response(
        JSON.stringify({ message: 'Nenhum palpite registrado para esta partida', processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Encontrados ${predictions.length} palpites para processar`);

    // 2. Calcular pontos para cada usuário
    const userPoints: Record<string, number> = {};
    const exactScores: Record<string, number> = {}; // Para conquistas

    for (const pred of predictions as Prediction[]) {
      const predHome = pred.home_score;
      const predAway = pred.away_score;
      const resHome = home_score;
      const resAway = away_score;

      let points = 0;

      // PLACAR EXATO (6 pontos)
      if (predHome === resHome && predAway === resAway) {
        points = 6;
        exactScores[pred.user_id] = (exactScores[pred.user_id] || 0) + 1;
        console.log(`🎯 ${pred.user_id}: Placar exato! +6 pts`);
      }
      // SALDO CORRETO (3 pontos) - acertou vencedor ou empate
      else if ((predHome - predAway) === (resHome - resAway)) {
        points = 3;
        console.log(`✓ ${pred.user_id}: Saldo correto! +3 pts`);
      }
      // PLACAR INVERTIDO (2 pontos)
      else if (predHome === resAway && predAway === resHome) {
        points = 2;
        console.log(`🔄 ${pred.user_id}: Placar invertido! +2 pts`);
      } else {
        console.log(`❌ ${pred.user_id}: Errou (+0 pts)`);
      }

      userPoints[pred.user_id] = points;
    }

    // 3. Atualizar pontuação total de cada usuário
    const updatePromises = Object.entries(userPoints).map(async ([userId, points]) => {
      const { error: updateError } = await supabaseAdmin.rpc(
        'increment_user_points',
        { user_uuid: userId, points_to_add: points }
      );

      if (updateError) {
        console.error(`❌ Erro ao atualizar pontos do usuário ${userId}:`, updateError);
      } else {
        console.log(`💾 Usuário ${userId}: +${points} pts salvos`);
      }
    });

    await Promise.all(updatePromises);

    // 4. Verificar e desbloquear conquistas
    const { data: achievements } = await supabaseAdmin
      .from('achievements')
      .select('*');

    if (achievements) {
      for (const [userId, exactCount] of Object.entries(exactScores)) {
        // Buscar total de placares exatos do usuário
        const { data: userPredictions } = await supabaseAdmin
          .from('predictions')
          .select('id, home_score, away_score, match_id')
          .eq('user_id', userId);

        // Aqui precisaríamos comparar com resultados reais (tabela de resultados)
        // Por enquanto, vamos apenas desbloquear baseado no contador desta partida

        const achievementsToUnlock: Achievement[] = [];

        if (exactCount >= 1) {
          const firstPredAch = achievements.find((a: Achievement) => a.badge_key === 'primeiro_palpite');
          if (firstPredAch) achievementsToUnlock.push(firstPredAch);
        }

        if (exactCount >= 3) {
          const threeExactAch = achievements.find((a: Achievement) => a.badge_key === 'tres_exatos');
          if (threeExactAch) achievementsToUnlock.push(threeExactAch);
        }

        // Inserir conquistas (UPSERT - ignorar se já existe)
        for (const ach of achievementsToUnlock) {
          const { error: achError } = await supabaseAdmin
            .from('user_achievements')
            .upsert({ user_id: userId, achievement_id: ach.id }, { onConflict: 'user_id,achievement_id' });

          if (!achError) {
            console.log(`🏆 Conquista desbloqueada: ${ach.name} para usuário ${userId}`);
          }
        }
      }
    }

    console.log('✅ Processamento concluído com sucesso!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Pontuação calculada e conquistas desbloqueadas',
        processed: predictions.length,
        total_points_distributed: Object.values(userPoints).reduce((a, b) => a + b, 0)
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Erro geral:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
