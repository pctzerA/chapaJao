/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Save, LogOut, Trash2, Edit2, Shield, Plus, X, CheckCircle2, Trophy, Calendar, TrendingUp, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import logoChapajao from '@/assets/chapajao-logo.png';
import { db, type BolaoUser } from '@/lib/supabase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- DATA ---
const TEAM_DATA: Record<string, { city: string; logo: string }> = {
  "Bragantino": { city: "Bragança Paulista - SP", logo: "https://s.sde.globo.com/media/organizations/2021/06/28/bragantino.svg" },
  "Botafogo": { city: "Rio de Janeiro - RJ", logo: "https://s.sde.globo.com/media/organizations/2019/02/04/botafogo-svg.svg" },
  "Fluminense": { city: "Rio de Janeiro - RJ", logo: "https://s.sde.globo.com/media/organizations/2014/04/14/fluminense_60x60.png" },
  "Atlético-MG": { city: "Belo Horizonte - MG", logo: "https://s.sde.globo.com/media/organizations/2018/03/10/atletico-mg.svg" },
  "São Paulo": { city: "São Paulo - SP", logo: "https://s.sde.globo.com/media/organizations/2014/04/14/sao_paulo_60x60.png" },
  "Palmeiras": { city: "São Paulo - SP", logo: "https://s.sde.globo.com/media/organizations/2014/04/14/palmeiras_60x60.png" },
  "Vasco da Gama": { city: "Rio de Janeiro - RJ", logo: "https://s.sde.globo.com/media/organizations/2021/09/04/vasco_SVG.svg" },
  "Grêmio": { city: "Porto Alegre - RS", logo: "https://s.sde.globo.com/media/organizations/2014/04/14/gremio_60x60.png" },
  "Athletico-PR": { city: "Curitiba - PR", logo: "https://s.sde.globo.com/media/organizations/2019/09/09/Athletico-PR.svg" },
  "Coritiba": { city: "Curitiba - PR", logo: "https://s.sde.globo.com/media/organizations/2017/03/29/coritiba65.png" },
  "Cruzeiro": { city: "Belo Horizonte - MG", logo: "https://s.sde.globo.com/media/organizations/2021/02/13/cruzeiro_2021.svg" },
  "Santos": { city: "Santos - SP", logo: "https://s.sde.globo.com/media/organizations/2014/04/14/santos_60x60.png" },
  "Remo": { city: "Belém - PA", logo: "https://i.postimg.cc/G8bNngdY/Remoo.jpg" },
  "Bahia": { city: "Salvador - BA", logo: "https://s.sde.globo.com/media/organizations/2014/04/14/bahia_60x60.png" },
  "EC Vitória": { city: "Salvador - BA", logo: "https://i.postimg.cc/8FR33gQM/vitorioaaa.jpg" },
  "Mirassol": { city: "Mirassol - SP", logo: "https://i.postimg.cc/DWrDD3k1/mirassoll.png" },
  "Internacional": { city: "Porto Alegre - RS", logo: "https://s.sde.globo.com/media/organizations/2016/05/03/inter65.png" },
  "Chapecoense": { city: "Chapecó - SC", logo: "https://i.postimg.cc/qhpYHD4K/chapecoensse.jpg" },
  "Corinthians": { city: "São Paulo - SP", logo: "https://s.sde.globo.com/media/organizations/2019/09/30/Corinthians.svg" },
  "Flamengo": { city: "Rio de Janeiro - RJ", logo: "https://s.sde.globo.com/media/organizations/2018/04/10/Flamengo-2018.svg" }
};

const INITIAL_ROUNDS = [
  {
    "stage": "Rodada 8",
    "partidas": [
      { "id": "r8-1", "date": "21/03", "time": "16:00", "home": "Bragantino", "away": "Botafogo", "venue": "Nabi Abi Chedid" },
      { "id": "r8-2", "date": "21/03", "time": "18:30", "home": "Fluminense", "away": "Atlético-MG", "venue": "Maracanã" },
      { "id": "r8-3", "date": "21/03", "time": "21:00", "home": "São Paulo", "away": "Palmeiras", "venue": "MorumBIS" },
      { "id": "r8-4", "date": "22/03", "time": "16:00", "home": "Vasco da Gama", "away": "Grêmio", "venue": "São Januário" },
      { "id": "r8-5", "date": "22/03", "time": "16:00", "home": "Athletico-PR", "away": "Coritiba", "venue": "Ligga Arena" },
      { "id": "r8-6", "date": "22/03", "time": "16:00", "home": "Cruzeiro", "away": "Santos", "venue": "Mineirão" },
      { "id": "r8-7", "date": "22/03", "time": "16:00", "home": "Remo", "away": "Bahia", "venue": "Mangueirão" },
      { "id": "r8-8", "date": "22/03", "time": "18:30", "home": "EC Vitória", "away": "Mirassol", "venue": "Barradão" },
      { "id": "r8-9", "date": "22/03", "time": "18:30", "home": "Internacional", "away": "Chapecoense", "venue": "Beira-Rio" },
      { "id": "r8-10", "date": "22/03", "time": "20:30", "home": "Corinthians", "away": "Flamengo", "venue": "Neo Química Arena" }
    ]
  },
  {
    "stage": "Rodada 9",
    "partidas": [
      { "id": "r9-1", "date": "01/04", "time": "A conf.", "home": "Bahia", "away": "Athletico-PR", "venue": "Arena Fonte Nova" },
      { "id": "r9-2", "date": "01/04", "time": "A conf.", "home": "Botafogo", "away": "Mirassol", "venue": "Nilton Santos" },
      { "id": "r9-3", "date": "01/04", "time": "A conf.", "home": "Fluminense", "away": "Corinthians", "venue": "Maracanã" },
      { "id": "r9-4", "date": "01/04", "time": "A conf.", "home": "Santos", "away": "Remo", "venue": "Vila Belmiro" },
      { "id": "r9-5", "date": "01/04", "time": "A conf.", "home": "Cruzeiro", "away": "EC Vitória", "venue": "Mineirão" },
      { "id": "r9-6", "date": "01/04", "time": "A conf.", "home": "Palmeiras", "away": "Grêmio", "venue": "Allianz Parque" },
      { "id": "r9-7", "date": "01/04", "time": "A conf.", "home": "Coritiba", "away": "Vasco da Gama", "venue": "Couto Pereira" },
      { "id": "r9-8", "date": "01/04", "time": "A conf.", "home": "Chapecoense", "away": "Atlético-MG", "venue": "Arena Condá" },
      { "id": "r9-9", "date": "01/04", "time": "A conf.", "home": "Bragantino", "away": "Flamengo", "venue": "Nabi Abi Chedid" },
      { "id": "r9-10", "date": "01/04", "time": "A conf.", "home": "Internacional", "away": "São Paulo", "venue": "Beira-Rio" }
    ]
  },
  {
    "stage": "Rodada 10",
    "partidas": [
      { "id": "r10-1", "date": "05/04", "time": "A conf.", "home": "Vasco da Gama", "away": "Botafogo", "venue": "São Januário" },
      { "id": "r10-2", "date": "05/04", "time": "A conf.", "home": "Bahia", "away": "Palmeiras", "venue": "Arena Fonte Nova" },
      { "id": "r10-3", "date": "05/04", "time": "A conf.", "home": "Grêmio", "away": "Remo", "venue": "Arena do Grêmio" },
      { "id": "r10-4", "date": "05/04", "time": "A conf.", "home": "Corinthians", "away": "Internacional", "venue": "Neo Química Arena" },
      { "id": "r10-5", "date": "05/04", "time": "A conf.", "home": "Chapecoense", "away": "EC Vitória", "venue": "Arena Condá" },
      { "id": "r10-6", "date": "05/04", "time": "A conf.", "home": "Mirassol", "away": "Bragantino", "venue": "Campos Maia" },
      { "id": "r10-7", "date": "05/04", "time": "A conf.", "home": "Flamengo", "away": "Santos", "venue": "Maracanã" },
      { "id": "r10-8", "date": "05/04", "time": "A conf.", "home": "Coritiba", "away": "Fluminense", "venue": "Couto Pereira" },
      { "id": "r10-9", "date": "05/04", "time": "A conf.", "home": "São Paulo", "away": "Cruzeiro", "venue": "MorumBIS" },
      { "id": "r10-10", "date": "05/04", "time": "A conf.", "home": "Atlético-MG", "away": "Athletico-PR", "venue": "Arena MRV" }
    ]
  },
  {
    "stage": "Rodada 5 (Atrasado)",
    "partidas": [
      { "id": "r5-1", "date": "29/03", "time": "18:30", "home": "Athletico-PR", "away": "Botafogo", "venue": "Ligga Arena" }
    ]
  }
];

const ADMIN_USERS = [
  { name: 'João', phone: '3291386363' },
  { name: 'Phelipe', phone: '32999264951' }
];

// --- TYPES ---
type MatchPrediction = { home: string; away: string };
type PredictionsState = Record<string, MatchPrediction>;
type UserData = { name: string; predictions: PredictionsState; phone: string; isAdmin?: boolean; lockedRounds?: Record<string, boolean> };
type Match = typeof INITIAL_ROUNDS[0]['partidas'][0];

// Helper to convert BolaoUser to UserData
function bolaoUserToUserData(bolaoUser: BolaoUser): UserData {
  return {
    name: bolaoUser.nome,
    phone: bolaoUser.telefone,
    predictions: bolaoUser.predictions || {},
    isAdmin: bolaoUser.role === 'admin',
    lockedRounds: bolaoUser.locked_rounds || {}
  };
}

// --- LOCAL STORAGE ---
const LS_USER_KEY = 'bolao_user_data';
const LS_RESULTS_KEY = 'bolao_results';
const LS_ALL_USERS_KEY = 'bolao_all_users';
const LS_ROUNDS_KEY = 'bolao_rounds';

function loadUser(): UserData | null {
  const raw = localStorage.getItem(LS_USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveUser(data: UserData) {
  localStorage.setItem(LS_USER_KEY, JSON.stringify(data));
  saveUserToAllUsers(data);
}

function loadResults(): PredictionsState {
  const raw = localStorage.getItem(LS_RESULTS_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveResults(data: PredictionsState) {
  localStorage.setItem(LS_RESULTS_KEY, JSON.stringify(data));
}

function loadAllUsers(): UserData[] {
  const raw = localStorage.getItem(LS_ALL_USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAllUsers(users: UserData[]) {
  localStorage.setItem(LS_ALL_USERS_KEY, JSON.stringify(users));
}

function saveUserToAllUsers(userData: UserData) {
  const allUsers = loadAllUsers();
  const index = allUsers.findIndex(u => u.phone === userData.phone);
  if (index >= 0) {
    allUsers[index] = userData;
  } else {
    allUsers.push(userData);
  }
  saveAllUsers(allUsers);
}

function loadRounds() {
  const raw = localStorage.getItem(LS_ROUNDS_KEY);
  return raw ? JSON.parse(raw) : INITIAL_ROUNDS;
}

function saveRounds(rounds: typeof INITIAL_ROUNDS) {
  localStorage.setItem(LS_ROUNDS_KEY, JSON.stringify(rounds));
}

// --- COMPONENTS ---
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2"
    >
      <CheckCircle2 className="w-5 h-5" />
      {message}
    </motion.div>
  );
}

type MatchInput = {
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
};

function AddRoundModal({ 
  round, 
  onSave, 
  onClose 
}: { 
  round?: typeof INITIAL_ROUNDS[0]; 
  onSave: (stage: string, matches: MatchInput[]) => void; 
  onClose: () => void; 
}) {
  const [stage, setStage] = useState(round?.stage || '');
  const [matches, setMatches] = useState<MatchInput[]>(
    round?.partidas.map(p => ({
      homeTeam: p.home,
      awayTeam: p.away,
      date: p.date,
      time: p.time,
      venue: p.venue
    })) || [{ homeTeam: '', awayTeam: '', date: '', time: '', venue: '' }]
  );

  const teams = Object.keys(TEAM_DATA);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stage.trim() && matches.every(m => m.homeTeam && m.awayTeam && m.date && m.time && m.venue)) {
      onSave(stage.trim(), matches);
      onClose();
    }
  };

  const addMatch = () => {
    setMatches([...matches, { homeTeam: '', awayTeam: '', date: '', time: '', venue: '' }]);
  };

  const removeMatch = (index: number) => {
    setMatches(matches.filter((_, i) => i !== index));
  };

  const updateMatch = (index: number, field: keyof MatchInput, value: string) => {
    const updated = [...matches];
    updated[index] = { ...updated[index], [field]: value };
    setMatches(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]"
      >
        {/* HEADER FIXO */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800">Adicionar Nova Rodada</h3>
          <button 
            onClick={onClose} 
            className="bg-green-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-semibold text-sm"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Cancelar</span>
          </button>
        </div>

        {/* CONTEÚDO COM SCROLL */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da Rodada</label>
              <input
                type="text"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: Rodada 11"
                required
              />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Partidas</h4>
              <div className="space-y-4">
                {matches.map((match, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-3 md:p-4 space-y-3">
                    {/* TIMES - Mobile: vertical, Desktop: horizontal */}
                    <div className="flex flex-col md:flex-row md:items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Time Casa</label>
                        <select
                          value={match.homeTeam}
                          onChange={(e) => updateMatch(index, 'homeTeam', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          required
                        >
                          <option value="">Selecione...</option>
                          {teams.map(team => (
                            <option key={team} value={team}>{team}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Time Fora</label>
                          <select
                            value={match.awayTeam}
                            onChange={(e) => updateMatch(index, 'awayTeam', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                            required
                          >
                            <option value="">Selecione...</option>
                            {teams.map(team => (
                              <option key={team} value={team}>{team}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMatch(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition self-end"
                          disabled={matches.length === 1}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* DETALHES - Mobile: vertical, Desktop: grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Data</label>
                        <input
                          type="text"
                          value={match.date}
                          onChange={(e) => updateMatch(index, 'date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          placeholder="Ex: 10/04"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Hora</label>
                        <input
                          type="text"
                          value={match.time}
                          onChange={(e) => updateMatch(index, 'time', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          placeholder="Ex: 16:00"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Estádio</label>
                        <input
                          type="text"
                          value={match.venue}
                          onChange={(e) => updateMatch(index, 'venue', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          placeholder="Ex: Maracanã"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addMatch}
                className="mt-3 text-green-600 font-semibold hover:text-green-700 flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Adicionar Partida
              </button>
            </div>
          </div>

          {/* FOOTER FIXO */}
          <div className="border-t border-gray-200 p-4 md:p-6 flex-shrink-0 bg-gray-50">
            <button
              type="submit"
              className="w-full bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-md flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Salvar Rodada
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function EditUserModal({ user, onSave, onClose }: { user: UserData; onSave: (name: string, phone: string) => void; onClose: () => void }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && phone.trim()) {
      onSave(name.trim(), phone.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Editar Usuário</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Usuário</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telefone (WhatsApp)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Salvar Alterações
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirmar Ação</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            Excluir
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ConfirmPredictionsModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Confirmação Definitiva</h3>
          <p className="text-gray-700 leading-relaxed">
            Tem a certeza de que deseja guardar estes resultados? <strong>Após a confirmação, não será possível alterar os seus palpites.</strong>
          </p>
          <p className="text-sm text-gray-600 mt-3 italic">
            Esta regra garante a segurança do sistema e o respeito por todos os adversários.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-bold shadow-md flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Sim, Confirmar Palpites
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (name: string, phone: string) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && phone.trim()) {
      setIsLoading(true);
      await onLogin(name.trim(), phone.trim());
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-yellow-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4 border-4 border-yellow-400">
              <img 
                src={logoChapajao} 
                alt="Bolão do ChapaJão"
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Bolão do ChapaJão</h1>
            <p className="text-gray-600">Faça seus palpites e boa sorte!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seu nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="Digite seu nome"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone (WhatsApp)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="(32) 99999-9999"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Entrando...' : 'Entrar no Bolão'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function MatchCard({ match, prediction, onPredictionChange, isAdmin, result }: {
  match: Match;
  prediction?: MatchPrediction;
  onPredictionChange?: (matchId: string, home: string, away: string) => void;
  isAdmin?: boolean;
  result?: MatchPrediction;
}) {
  const [homeScore, setHomeScore] = useState(prediction?.home || '');
  const [awayScore, setAwayScore] = useState(prediction?.away || '');

  useEffect(() => {
    if (prediction) {
      setHomeScore(prediction.home);
      setAwayScore(prediction.away);
    }
  }, [prediction]);

  useEffect(() => {
    if (onPredictionChange && (homeScore !== '' || awayScore !== '')) {
      onPredictionChange(match.id, homeScore, awayScore);
    }
  }, [homeScore, awayScore]);

  const homeTeam = TEAM_DATA[match.home];
  const awayTeam = TEAM_DATA[match.away];

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 md:p-6">
      <div className="flex items-center justify-between gap-2 md:gap-4">
        {/* Home Team */}
        <div className="flex flex-col items-end gap-1 flex-1 min-w-0">
          <span className="text-xs md:text-sm font-semibold text-gray-800 truncate w-full text-right">{match.home}</span>
        </div>

        <img 
          src={homeTeam.logo} 
          alt={match.home}
          className="w-10 h-10 md:w-12 md:h-12 object-contain flex-shrink-0"
        />

        {/* Scores */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <input
            type="number"
            min="0"
            max="99"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className="w-12 h-12 md:w-14 md:h-14 text-center border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-lg md:text-xl font-bold"
            placeholder="-"
            disabled={!onPredictionChange}
          />
          <span className="text-gray-400 font-bold text-base md:text-lg">X</span>
          <input
            type="number"
            min="0"
            max="99"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="w-12 h-12 md:w-14 md:h-14 text-center border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-lg md:text-xl font-bold"
            placeholder="-"
            disabled={!onPredictionChange}
          />
        </div>

        <img 
          src={awayTeam.logo} 
          alt={match.away}
          className="w-10 h-10 md:w-12 md:h-12 object-contain flex-shrink-0"
        />

        {/* Away Team */}
        <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
          <span className="text-xs md:text-sm font-semibold text-gray-800 truncate w-full">{match.away}</span>
        </div>
      </div>

      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100 flex flex-wrap items-center justify-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 md:w-4 md:h-4" />
          <span>{match.date}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 md:w-4 md:h-4" />
          <span>{match.time}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 md:w-4 md:h-4" />
          <span className="truncate max-w-[120px] md:max-w-none">{match.venue}</span>
        </div>
      </div>
    </div>
  );
}

// --- MAIN APP ---
export default function App() {
  const [user, setUser] = useState<UserData | null>(loadUser);
  const [predictions, setPredictions] = useState<PredictionsState>(() => user?.predictions || {});
  const [results, setResults] = useState<PredictionsState>(loadResults);
  const [rounds, setRounds] = useState<typeof INITIAL_ROUNDS>([]);
  const [selectedRound, setSelectedRound] = useState(rounds[0].stage);
  const [activeTab, setActiveTab] = useState<'home' | 'predictions' | 'simulator' | 'ranking' | 'admin'>('home');
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [showEditUser, setShowEditUser] = useState<UserData | null>(null);
  const [showAddRound, setShowAddRound] = useState(false);
  const [editingRound, setEditingRound] = useState<typeof INITIAL_ROUNDS[0] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmPredictions, setShowConfirmPredictions] = useState(false);

  // Load all users and rounds from database on mount
  useEffect(() => {
    const loadDataFromDB = async () => {
      console.log('🔄 Carregando dados do banco...');
      
      // Load users
      const users = await db.getAllUsers();
      setAllUsers(users.map(bolaoUserToUserData));
      console.log('✅ Usuários carregados:', users.length);
      
      // Load rounds
      const roundsData = await db.getAllRounds();
      if (roundsData.length > 0) {
        setRounds(roundsData);
        setSelectedRound(roundsData[0].stage);
        console.log('✅ Rodadas carregadas:', roundsData.length);
      } else {
        // Fallback to initial rounds if database is empty
        setRounds(INITIAL_ROUNDS);
        setSelectedRound(INITIAL_ROUNDS[0].stage);
        console.log('⚠️ Usando rodadas iniciais (banco vazio)');
      }
      
      setLoading(false);
    };
    loadDataFromDB();
  }, []);

  // Load user predictions from database when user is logged in
  useEffect(() => {
    const loadUserPredictions = async () => {
      if (!user?.phone) return;
      
      console.log('🔄 Carregando palpites do banco de dados...');
      const bolaoUser = await db.getUserByPhone(user.phone);
      
      if (bolaoUser) {
        console.log('📊 Palpites encontrados no banco:', Object.keys(bolaoUser.predictions || {}).length, 'jogos');
        console.log('🔒 Rodadas bloqueadas:', Object.keys(bolaoUser.locked_rounds || {}).length);
        
        // Update predictions from database
        setPredictions(bolaoUser.predictions || {});
        
        // Update user locked rounds
        const updatedUser = {
          ...user,
          predictions: bolaoUser.predictions || {},
          lockedRounds: bolaoUser.locked_rounds || {}
        };
        setUser(updatedUser);
        saveUser(updatedUser); // Update localStorage too
      } else {
        console.log('⚠️ Usuário não encontrado no banco');
      }
    };
    
    loadUserPredictions();
  }, [user?.phone]); // Reload when user changes

  const isFixedAdmin = useMemo(() => {
    if (!user) return false;
    return ADMIN_USERS.some(admin => admin.phone === user.phone);
  }, [user]);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return isFixedAdmin || user.isAdmin === true;
  }, [user, isFixedAdmin]);

  // Auto-save predictions to localStorage ONLY (real save to database happens on confirmation)
  useEffect(() => {
    if (user) {
      const updated = { ...user, predictions };
      saveUser(updated); // Keep localStorage for immediate recovery if user exits without saving
      console.log('💾 Auto-save local (localStorage) - Total de palpites:', Object.keys(predictions).length);
    }
  }, [predictions]);

  const handleLogin = async (name: string, phone: string) => {
    console.log('🔐 Login iniciado para:', phone);
    
    // Check database first
    let bolaoUser = await db.getUserByPhone(phone);
    
    if (!bolaoUser) {
      console.log('👤 Usuário não encontrado, criando novo...');
      // Create new user in database
      bolaoUser = await db.createUser(name, phone);
      if (!bolaoUser) {
        setToast('Erro ao criar usuário. Tente novamente.');
        return;
      }
      
      // Reload all users
      const users = await db.getAllUsers();
      setAllUsers(users.map(bolaoUserToUserData));
    } else {
      console.log('✅ Usuário encontrado no banco:', bolaoUser.nome);
      console.log('📊 Palpites carregados do banco:', Object.keys(bolaoUser.predictions || {}).length, 'jogos');
    }

    const userData = bolaoUserToUserData(bolaoUser);
    setUser(userData);
    setPredictions(userData.predictions || {});
    saveUser(userData); // Keep localStorage for backward compatibility
    
    console.log('🎯 Login completo. Palpites no estado:', Object.keys(userData.predictions || {}).length);
  };

  const handleLogout = () => {
    setUser(null);
    setPredictions({});
  };

  const handlePredictionChange = (matchId: string, home: string, away: string) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: { home, away }
    }));
  };

  const handleResultChange = (matchId: string, home: string, away: string) => {
    const newResults = {
      ...results,
      [matchId]: { home, away }
    };
    setResults(newResults);
    saveResults(newResults);
  };

  const canConfirmPredictions = useMemo(() => {
    const currentRound = rounds.find(r => r.stage === selectedRound);
    if (!currentRound) return false;

    return currentRound.partidas.every(match => 
      predictions[match.id] && 
      predictions[match.id].home !== '' && 
      predictions[match.id].away !== ''
    );
  }, [predictions, selectedRound, rounds]);

  const isRoundLocked = useMemo(() => {
    if (!user || !user.lockedRounds) return false;
    return user.lockedRounds[selectedRound] === true;
  }, [user, selectedRound]);

  const handleConfirmPredictions = async () => {
    if (!user) return;
    
    console.log('💾 SALVANDO PALPITES NO BANCO DE DADOS...');
    console.log('📋 Total de palpites a salvar:', Object.keys(predictions).length);
    console.log('🎯 Rodada selecionada:', selectedRound);
    
    // PRIMEIRO: Salvar os palpites no banco de dados
    const saveSuccess = await db.updatePredictions(user.phone, predictions);
    if (!saveSuccess) {
      console.error('❌ Erro ao salvar palpites no banco');
      setToast('❌ Erro ao salvar palpites. Tente novamente.');
      return;
    }
    console.log('✅ Palpites salvos no banco com sucesso!');
    
    // SEGUNDO: Bloquear rodada no banco de dados
    const lockSuccess = await db.lockRound(user.phone, selectedRound);
    if (!lockSuccess) {
      console.error('❌ Erro ao bloquear rodada no banco');
      setToast('❌ Erro ao bloquear palpites. Tente novamente.');
      return;
    }
    console.log('🔒 Rodada "' + selectedRound + '" bloqueada no banco com sucesso!');

    // TERCEIRO: Atualizar estado local
    const updatedLockedRounds = {
      ...(user.lockedRounds || {}),
      [selectedRound]: true
    };
    
    const updatedUser = {
      ...user,
      predictions,
      lockedRounds: updatedLockedRounds
    };
    
    setUser(updatedUser);
    saveUser(updatedUser);
    
    console.log('✅ Estado local atualizado. Rodadas bloqueadas:', Object.keys(updatedLockedRounds));
    
    setShowConfirmPredictions(false);
    setToast('✅ Palpites confirmados e bloqueados com sucesso!');
  };

  const handleToggleAdmin = async (phone: string) => {
    if (ADMIN_USERS.some(admin => admin.phone === phone)) {
      setToast('Administrador fixo não pode ser alterado!');
      return;
    }

    const targetUser = allUsers.find(u => u.phone === phone);
    if (!targetUser) return;

    const newAdminStatus = !targetUser.isAdmin;
    
    // Update in database
    const success = await db.toggleAdmin(phone, newAdminStatus);
    if (!success) {
      setToast('Erro ao atualizar permissões. Tente novamente.');
      return;
    }

    // Reload users from database
    const users = await db.getAllUsers();
    setAllUsers(users.map(bolaoUserToUserData));
    
    // Update current user if it's them
    if (user && user.phone === phone) {
      const updatedUser = users.find(u => u.telefone === phone);
      if (updatedUser) {
        const userData = bolaoUserToUserData(updatedUser);
        setUser(userData);
        saveUser(userData);
      }
    }
    
    setToast(newAdminStatus ? 'Admin concedido!' : 'Admin revogado!');
  };

  const handleAddUser = async (name: string, phone: string) => {
    console.log('➕ Adicionando usuário:', name, phone);
    
    const existingUser = allUsers.find(u => u.phone === phone);
    if (existingUser) {
      setToast('❌ Usuário com este telefone já existe!');
      return;
    }

    // Create in database
    const newUser = await db.createUser(name, phone);
    if (!newUser) {
      setToast('❌ Erro ao adicionar usuário. Tente novamente.');
      return;
    }
    
    console.log('✅ Usuário criado no banco:', newUser.id);
    
    // Reload users from database
    const users = await db.getAllUsers();
    setAllUsers(users.map(bolaoUserToUserData));
    console.log('🔄 Lista de usuários atualizada');
    
    setToast('✅ Usuário adicionado com sucesso!');
  };

  const handleEditUser = async (oldPhone: string, name: string, phone: string) => {
    console.log('✏️ Editando usuário:', oldPhone, '->', name, phone);
    
    // Update in database
    const updated = await db.updateUser(oldPhone, { nome: name, telefone: phone });
    if (!updated) {
      setToast('❌ Erro ao atualizar usuário. Tente novamente.');
      return;
    }
    
    console.log('✅ Usuário atualizado no banco');
    
    // Reload users from database
    const users = await db.getAllUsers();
    setAllUsers(users.map(bolaoUserToUserData));
    
    // Update current user if it's them
    if (user && user.phone === oldPhone) {
      const updatedUserData = bolaoUserToUserData(updated);
      setUser(updatedUserData);
      saveUser(updatedUserData);
    }
    
    console.log('🔄 Lista de usuários atualizada');
    setToast('✅ Usuário atualizado com sucesso!');
  };

  const handleDeleteUser = (phone: string) => {
    if (ADMIN_USERS.some(admin => admin.phone === phone)) {
      setToast('❌ Administrador fixo não pode ser excluído!');
      return;
    }

    setConfirmModal({
      message: `Tem certeza que deseja excluir este usuário?`,
      onConfirm: async () => {
        console.log('🗑️ Excluindo usuário:', phone);
        
        // Delete from database
        const success = await db.deleteUser(phone);
        if (!success) {
          setToast('❌ Erro ao excluir usuário. Tente novamente.');
          setConfirmModal(null);
          return;
        }
        
        console.log('✅ Usuário excluído do banco');
        
        // Reload users from database
        const users = await db.getAllUsers();
        setAllUsers(users.map(bolaoUserToUserData));
        
        console.log('🔄 Lista de usuários atualizada');
        setToast('✅ Usuário excluído com sucesso!');
        setConfirmModal(null);
      }
    });
  };

  const handleSaveRound = async (stage: string, matches: MatchInput[]) => {
    console.log('💾 Salvando rodada:', stage, 'com', matches.length, 'partidas');
    
    let success = false;
    
    if (editingRound) {
      // Update existing round
      console.log('✏️ Atualizando rodada existente:', editingRound.stage);
      success = await db.updateRound(editingRound.stage, stage, matches);
      
      if (success) {
        console.log('✅ Rodada atualizada no banco');
        setToast('✅ Rodada atualizada com sucesso!');
      } else {
        setToast('❌ Erro ao atualizar rodada. Tente novamente.');
        return;
      }
    } else {
      // Create new round
      console.log('➕ Criando nova rodada');
      success = await db.createRound(stage, matches);
      
      if (success) {
        console.log('✅ Rodada criada no banco');
        setToast('✅ Rodada criada com sucesso!');
      } else {
        setToast('❌ Erro ao criar rodada. Tente novamente.');
        return;
      }
    }
    
    // Reload rounds from database
    const roundsData = await db.getAllRounds();
    setRounds(roundsData);
    console.log('🔄 Rodadas atualizadas do banco:', roundsData.length);
    
    setEditingRound(null);
  };

  const handleDeleteRound = (stage: string) => {
    setConfirmModal({
      message: `Tem certeza que deseja excluir a rodada "${stage}"?`,
      onConfirm: async () => {
        console.log('🗑️ Excluindo rodada:', stage);
        
        const success = await db.deleteRound(stage);
        
        if (!success) {
          setToast('❌ Erro ao excluir rodada. Tente novamente.');
          setConfirmModal(null);
          return;
        }
        
        console.log('✅ Rodada excluída do banco');
        
        // Reload rounds from database
        const roundsData = await db.getAllRounds();
        setRounds(roundsData);
        
        if (selectedRound === stage && roundsData.length > 0) {
          setSelectedRound(roundsData[0].stage);
        }
        
        console.log('🔄 Rodadas atualizadas do banco:', roundsData.length);
        setToast('✅ Rodada excluída com sucesso!');
        setConfirmModal(null);
      }
    });
  };

  const calculateRanking = () => {
    const ranking = allUsers.map(user => {
      let points = 0;
      let exact = 0;

      Object.entries(user.predictions).forEach(([matchId, prediction]) => {
        const result = results[matchId];
        if (!result) return;

        const predHome = parseInt(prediction.home);
        const predAway = parseInt(prediction.away);
        const resHome = parseInt(result.home);
        const resAway = parseInt(result.away);

        if (predHome === resHome && predAway === resAway) {
          points += 10;
          exact++;
        } else if ((predHome - predAway) === (resHome - resAway)) {
          points += 5;
        } else if (
          (predHome > predAway && resHome > resAway) ||
          (predHome < predAway && resHome < resAway) ||
          (predHome === predAway && resHome === resAway)
        ) {
          points += 3;
        }
      });

      return { name: user.name, points, exact, saldo: 0 };
    });

    ranking.sort((a, b) => b.points - a.points);
    return ranking;
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const currentRound = rounds.find(r => r.stage === selectedRound);
  const ranking = calculateRanking();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-3 hover:opacity-90 transition"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-yellow-400 shadow-lg">
                <img 
                  src={logoChapajao} 
                  alt="Bolão do ChapaJão"
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <div className="text-left">
                <h1 className="text-lg font-bold">Bolão do ChapaJão</h1>
                <p className="text-xs text-green-100">Olá, {user.name}!</p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-green-700 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-t border-green-700">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('home')}
                className={cn(
                  "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition",
                  activeTab === 'home'
                    ? "border-yellow-400 text-white bg-green-700"
                    : "border-transparent text-green-100 hover:bg-green-700"
                )}
              >
                🏠 Início
              </button>
              <button
                onClick={() => setActiveTab('predictions')}
                className={cn(
                  "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition",
                  activeTab === 'predictions'
                    ? "border-yellow-400 text-white bg-green-700"
                    : "border-transparent text-green-100 hover:bg-green-700"
                )}
              >
                📋 Palpites
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={cn(
                  "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition",
                  activeTab === 'simulator'
                    ? "border-yellow-400 text-white bg-green-700"
                    : "border-transparent text-green-100 hover:bg-green-700"
                )}
              >
                📊 Simulador
              </button>
              <button
                onClick={() => setActiveTab('ranking')}
                className={cn(
                  "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition",
                  activeTab === 'ranking'
                    ? "border-yellow-400 text-white bg-green-700"
                    : "border-transparent text-green-100 hover:bg-green-700"
                )}
              >
                🏆 Ranking
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={cn(
                    "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition",
                    activeTab === 'admin'
                      ? "border-yellow-400 text-white bg-green-700"
                      : "border-transparent text-green-100 hover:bg-green-700"
                  )}
                >
                  ⚙️ Admin
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-2">
                  <Trophy className="w-8 h-8 text-green-600" />
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Bem-vindo ao Bolão do ChapaJão</h2>
                </div>
                <p className="text-gray-600">Olá, {user.name}! 🎉</p>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Seus Palpites</h3>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Save className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{Object.keys(predictions).length}</p>
                  <p className="text-xs text-gray-500 mt-1">Total de jogos</p>
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Pontuação Total</h3>
                    <div className="p-2 bg-yellow-50 rounded-lg">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{ranking.find(r => r.name === user.name)?.points || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Pontos acumulados</p>
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Sua Posição</h3>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{ranking.findIndex(r => r.name === user.name) + 1 || 0}°</p>
                  <p className="text-xs text-gray-500 mt-1">No ranking geral</p>
                </div>
              </div>

              {/* Jogos do Dia */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-800">Jogos de Hoje</h3>
                </div>
                {(() => {
                  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                  const todayMatches = rounds.flatMap(r => r.partidas).filter(m => m.date === today);
                  
                  if (todayMatches.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Nenhum jogo agendado para hoje</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {todayMatches.map(match => {
                        const homeTeam = TEAM_DATA[match.home];
                        const awayTeam = TEAM_DATA[match.away];
                        const userPrediction = predictions[match.id];
                        
                        return (
                          <div key={match.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                            <div className="flex items-center gap-3 flex-1">
                              <img src={homeTeam.logo} alt={match.home} className="w-8 h-8 object-contain" />
                              <span className="font-semibold text-sm md:text-base text-gray-800 truncate">{match.home}</span>
                            </div>
                            
                            <div className="flex flex-col items-center gap-1 px-4">
                              {userPrediction ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-green-600">{userPrediction.home}</span>
                                  <span className="text-xs text-gray-400">x</span>
                                  <span className="text-sm font-bold text-green-600">{userPrediction.away}</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setActiveTab('predictions')}
                                  className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition font-medium"
                                >
                                  Palpitar
                                </button>
                              )}
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{match.time}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 flex-1 justify-end">
                              <span className="font-semibold text-sm md:text-base text-gray-800 truncate text-right">{match.away}</span>
                              <img src={awayTeam.logo} alt={match.away} className="w-8 h-8 object-contain" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Cards de Ação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(() => {
                  const totalMatches = rounds.flatMap(r => r.partidas).length;
                  const predictedMatches = Object.keys(predictions).length;
                  const hasPendingPredictions = predictedMatches < totalMatches;

                  return hasPendingPredictions ? (
                    <>
                      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-8 text-white">
                        <h3 className="text-2xl font-bold mb-2">Fazer Palpites</h3>
                        <p className="text-green-100 mb-6">Preencha seus palpites para a fase de grupos</p>
                        <button
                          onClick={() => setActiveTab('predictions')}
                          className="w-full bg-white text-green-600 py-3 rounded-xl font-bold hover:bg-green-50 transition shadow-md"
                        >
                          Ir para Palpites
                        </button>
                      </div>

                      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
                        <h3 className="text-xl font-bold mb-2 text-gray-800">Ver Ranking</h3>
                        <p className="text-gray-600 mb-6">Confira a classificação de todos os participantes</p>
                        <button
                          onClick={() => setActiveTab('ranking')}
                          className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                        >
                          Ver Ranking Completo
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="md:col-span-2">
                      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-xl p-8 text-white">
                        <div className="flex items-center gap-3 mb-4">
                          <Trophy className="w-12 h-12" />
                          <div>
                            <h3 className="text-2xl font-bold">Ver Ranking</h3>
                            <p className="text-yellow-100">Todos os palpites foram salvos! Acompanhe sua posição</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('ranking')}
                          className="w-full bg-white text-yellow-600 py-3 rounded-xl font-bold hover:bg-yellow-50 transition shadow-md"
                        >
                          Ver Ranking Completo
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          )}

          {activeTab === 'predictions' && (
            <motion.div
              key="predictions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Palpites do Brasileirão</h2>
                <p className="text-sm text-gray-600">Olá, {user.name}!</p>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {rounds.map(round => (
                  <button
                    key={round.stage}
                    onClick={() => setSelectedRound(round.stage)}
                    className={cn(
                      "px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition",
                      selectedRound === round.stage
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    )}
                  >
                    {round.stage}
                  </button>
                ))}
              </div>

              <div className="grid gap-4">
                {currentRound?.partidas.map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    prediction={predictions[match.id]}
                    onPredictionChange={isRoundLocked ? undefined : handlePredictionChange}
                    result={results[match.id]}
                  />
                ))}
              </div>

              {!isRoundLocked && (
                <div className="flex justify-center pt-6">
                  <button
                    onClick={() => setShowConfirmPredictions(true)}
                    disabled={!canConfirmPredictions}
                    className={cn(
                      "px-10 py-4 rounded-2xl font-bold transition shadow-xl flex items-center gap-3 text-lg",
                      canConfirmPredictions
                        ? "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    <Save className="w-6 h-6" />
                    Confirmar Palpites
                  </button>
                </div>
              )}
              
              {isRoundLocked && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-900 mb-2">🔒 Palpites Bloqueados</h3>
                  <p className="text-sm text-blue-800">
                    Seus palpites para esta rodada foram confirmados e não podem mais ser alterados.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'simulator' && (
            <motion.div
              key="simulator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Tabela de Classificação</h2>
              <p className="text-sm text-gray-600 mb-6">Simulação em tempo real baseada nos seus palpites.</p>
              
              <div className="bg-white rounded-2xl shadow overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">CLUBE</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700">P</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700">J</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700">V</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700">E</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700">D</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700">GP</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700">GC</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700">SG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Object.keys(TEAM_DATA).map((team, index) => (
                      <tr key={team} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <img src={TEAM_DATA[team].logo} alt={team} className="w-6 h-6 object-contain" />
                            <span className="font-medium text-blue-600">{team}</span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-2 font-bold">0</td>
                        <td className="text-center py-3 px-2">0</td>
                        <td className="text-center py-3 px-2">0</td>
                        <td className="text-center py-3 px-2">0</td>
                        <td className="text-center py-3 px-2">0</td>
                        <td className="text-center py-3 px-2">0</td>
                        <td className="text-center py-3 px-2">0</td>
                        <td className="text-center py-3 px-2">0</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'ranking' && (
            <motion.div
              key="ranking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2">Ranking Geral</h2>
              <p className="text-sm text-gray-600 mb-6">Classificação dos participantes do bolão.</p>

              <div className="bg-white rounded-2xl shadow overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">POS</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">PARTICIPANTE</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">CRAVO</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">SALDO</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">PONTOS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ranking.map((player, index) => (
                      <tr key={player.name} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className={cn(
                            "w-8 h-8 rounded flex items-center justify-center font-bold text-white text-sm",
                            index === 0 && "bg-yellow-400",
                            index === 1 && "bg-gray-400",
                            index === 2 && "bg-orange-400",
                            index > 2 && "bg-gray-300"
                          )}>
                            {index + 1}°
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-blue-600">{player.name}</td>
                        <td className="text-center py-3 px-4">{player.exact}</td>
                        <td className="text-center py-3 px-4">{player.saldo}</td>
                        <td className="text-center py-3 px-4 font-bold text-green-600">{player.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'admin' && isAdmin && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Painel Administrativo</h2>
                <p className="text-sm text-gray-600">Lançamento de Resultados Oficiais.</p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {rounds.map(round => (
                    <button
                      key={round.stage}
                      onClick={() => setSelectedRound(round.stage)}
                      className={cn(
                        "px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition",
                        selectedRound === round.stage
                          ? "bg-green-600 text-white shadow-md"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                      )}
                    >
                      {round.stage}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingRound(currentRound!);
                      setShowAddRound(true);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar Rodada
                  </button>
                  <button
                    onClick={() => handleDeleteRound(selectedRound)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir Rodada
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {currentRound?.partidas.map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    prediction={results[match.id]}
                    onPredictionChange={handleResultChange}
                    isAdmin
                  />
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <h3 className="font-semibold text-blue-900 mb-2">🔄 Atualização Automática</h3>
                <p className="text-sm text-blue-800">
                  Os resultados são salvos automaticamente e atualizam o Ranking de todos os participantes.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">Adicionar Nova Rodada</h3>
                  </div>
                  <button 
                    onClick={() => setShowAddRound(true)}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition font-bold flex items-center gap-2 shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                    Nova Rodada
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Gerenciar Usuários</h3>
                  <div className="flex gap-3 mb-6">
                    <input
                      type="text"
                      placeholder="Nome do Usuário"
                      id="addUserName"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="tel"
                      placeholder="Telefone (WhatsApp)"
                      id="addUserPhone"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button 
                      onClick={() => {
                        const nameInput = document.getElementById('addUserName') as HTMLInputElement;
                        const phoneInput = document.getElementById('addUserPhone') as HTMLInputElement;
                        if (nameInput.value.trim() && phoneInput.value.trim()) {
                          handleAddUser(nameInput.value.trim(), phoneInput.value.trim());
                          nameInput.value = '';
                          phoneInput.value = '';
                        }
                      }}
                      className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition font-bold whitespace-nowrap shadow-md"
                    >
                      Adicionar Usuário
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">NOME</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">TELEFONE</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allUsers.map(u => {
                        const isUserFixedAdmin = ADMIN_USERS.some(admin => admin.phone === u.phone);
                        const isUserAdmin = isUserFixedAdmin || u.isAdmin;
                        
                        return (
                          <tr key={u.phone} className="hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{u.name}</span>
                                {isUserAdmin && (
                                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-semibold">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-600">{u.phone}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-center gap-3">
                                <button
                                  onClick={() => handleToggleAdmin(u.phone)}
                                  className={cn(
                                    "p-2.5 rounded-xl transition-all",
                                    isUserAdmin 
                                      ? "text-yellow-500 hover:bg-yellow-50" 
                                      : "text-gray-400 hover:bg-gray-50"
                                  )}
                                  title={isUserAdmin ? "Revogar admin" : "Conceder admin"}
                                >
                                  <Shield className="w-6 h-6" fill={isUserAdmin ? "currentColor" : "none"} />
                                </button>
                                <button
                                  onClick={() => setShowEditUser(u)}
                                  className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                  title="Editar"
                                >
                                  <Edit2 className="w-6 h-6" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.phone)}
                                  className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-6 h-6" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal && (
          <ConfirmModal
            message={confirmModal.message}
            onConfirm={confirmModal.onConfirm}
            onCancel={() => setConfirmModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditUser && (
          <EditUserModal
            user={showEditUser}
            onSave={(name, phone) => {
              handleEditUser(showEditUser.phone, name, phone);
              setShowEditUser(null);
            }}
            onClose={() => setShowEditUser(null)}
          />
        )}
      </AnimatePresence>

      {/* Add Round Modal */}
      <AnimatePresence>
        {showAddRound && (
          <AddRoundModal
            round={editingRound || undefined}
            onSave={handleSaveRound}
            onClose={() => {
              setShowAddRound(false);
              setEditingRound(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Confirm Predictions Modal */}
      <AnimatePresence>
        {showConfirmPredictions && (
          <ConfirmPredictionsModal
            onConfirm={handleConfirmPredictions}
            onCancel={() => setShowConfirmPredictions(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
