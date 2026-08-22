import React, { useState } from 'react';
import {
  Search,
  Moon,
  Sun,
  Bell,
  Plus,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import type { Paciente, Consulta } from '../types';

interface HeaderBarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  usuarioLogado: {
    nome: string;
    email: string;
    funcao: string;
    cro: string;
  } | null;
  onLogout: () => void;
  onNavigate: (tab: string) => void;
  pacientes: Paciente[];
  consultas: Consulta[];
  onSelectPaciente: (paciente: Paciente) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  darkMode,
  onToggleDarkMode,
  usuarioLogado,
  onLogout,
  onNavigate,
  pacientes,
  consultas: _consultas,
  onSelectPaciente
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);

  const notificacoes = [
    { id: 1, titulo: 'Nova Consulta Agendada', desc: 'Ana Clara confirmou para as 09:00', hora: 'Há 10 min' },
    { id: 2, titulo: 'Resultado de Tomografia', desc: 'Raio-X Panorâmico de Roberto Alves disponível', hora: 'Há 45 min' },
    { id: 3, titulo: 'Aviso de Estoque', desc: 'Insumo Resina Composta A2 abaixo do limite', hora: 'Há 2 horas' }
  ];

  const resultadosBusca = searchQuery.trim()
    ? pacientes.filter(
        (p) =>
          p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.cpf.includes(searchQuery) ||
          p.telefone.includes(searchQuery)
      )
    : [];

  const iniciais = usuarioLogado?.nome
    ? usuarioLogado.nome.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'OW';

  return (
    <header
      className={`sticky top-0 z-20 h-16 border-b transition-colors backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 ${
        darkMode
          ? 'bg-slate-900/90 border-slate-800/80 text-white'
          : 'bg-white/90 border-slate-200/80 text-slate-800'
      }`}
    >
      {/* Busca Global Inteligente */}
      <div className="relative flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Busca global de pacientes, CPF ou prontuários (Pressione / para buscar)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            className={`w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              darkMode
                ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500'
                : 'bg-slate-100/80 border-slate-200 text-slate-800 placeholder-slate-400'
            }`}
          />
        </div>

        {/* Dropdown de Resultados da Busca */}
        {searchOpen && searchQuery.trim() && (
          <div
            className={`absolute left-0 top-full mt-2 w-full rounded-2xl border shadow-2xl overflow-hidden z-50 p-2 space-y-1 ${
              darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase">Pacientes Encontrados</div>
            {resultadosBusca.length > 0 ? (
              resultadosBusca.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectPaciente(p);
                    onNavigate('pacientes');
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className={`p-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-between ${
                    darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="font-bold text-xs">{p.nome}</p>
                    <p className="text-[11px] text-slate-400">CPF: {p.cpf} • Tel: {p.telefone}</p>
                  </div>
                  <span className="text-[10px] font-semibold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-md">
                    Ver Prontuário
                  </span>
                </div>
              ))
            ) : (
              <div className="p-3 text-xs text-slate-400 text-center">Nenhum paciente encontrado com termo de busca.</div>
            )}
          </div>
        )}
      </div>

      {/* Ações da Direita */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Botão Novo Agendamento Rápido */}
        <button
          onClick={() => onNavigate('agenda')}
          className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Nova Consulta
        </button>

        {/* Toggle Dark / Light Mode */}
        <button
          onClick={onToggleDarkMode}
          className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
            darkMode
              ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
          }`}
          title={darkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notificações Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className={`p-2.5 rounded-2xl border transition-all relative cursor-pointer ${
              darkMode
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500"></span>
          </button>

          {/* Menu de Notificações */}
          {notifOpen && (
            <div
              className={`absolute right-0 top-full mt-3 w-80 rounded-2xl border shadow-2xl p-3 z-50 space-y-2 ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/30">
                <span className="font-bold text-xs uppercase text-slate-400 tracking-wider">Notificações</span>
                <span className="text-[10px] text-teal-500 font-semibold cursor-pointer">Marcar lidas</span>
              </div>

              <div className="space-y-1.5">
                {notificacoes.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl border text-xs space-y-1 transition-colors ${
                      darkMode ? 'bg-slate-800/50 border-slate-800 hover:bg-slate-800' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-900 dark:text-white">{n.titulo}</span>
                      <span className="text-[10px] text-slate-400">{n.hora}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Perfil do Usuário Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            className={`flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border transition-all cursor-pointer ${
              darkMode
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-xs font-extrabold text-white shadow">
              {iniciais}
            </div>

            <div className="hidden md:block text-left">
              <p className="text-xs font-bold leading-tight">{usuarioLogado?.nome || 'Dra. Patricia Medeiros'}</p>
              <p className="text-[10px] text-teal-500 leading-none font-semibold">{usuarioLogado?.cro || 'CRO-SP 123456'}</p>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Menu Dropdown do Perfil */}
          {profileOpen && (
            <div
              className={`absolute right-0 top-full mt-3 w-56 rounded-2xl border shadow-2xl p-2 z-50 space-y-1 ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="p-3 border-b border-slate-800/30 text-xs">
                <p className="font-bold text-slate-900 dark:text-white">{usuarioLogado?.nome}</p>
                <p className="text-[11px] text-slate-400">{usuarioLogado?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold text-teal-500 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-md">
                  {usuarioLogado?.funcao}
                </span>
              </div>

              <button
                onClick={() => {
                  onNavigate('configuracoes');
                  setProfileOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  darkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <User className="w-4 h-4 text-teal-500" /> Meu Perfil & Clínica
              </button>

              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sair do Sistema
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
