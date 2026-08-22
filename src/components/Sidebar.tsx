import React from 'react';
import {
  Activity,
  Calendar,
  Users,
  Bot,
  DollarSign,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  LogOut,
  FileSpreadsheet
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  darkMode?: boolean;
  onLogout?: () => void;
  badgeCounts?: {
    pacientes?: number;
    consultasHoje?: number;
    pendentes?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  darkMode,
  onLogout,
  badgeCounts
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'pacientes', label: 'Pacientes', icon: Users, badge: badgeCounts?.pacientes },
    { id: 'agenda', label: 'Agenda', icon: Calendar, badge: badgeCounts?.consultasHoje },
    { id: 'producao', label: 'Produção', icon: FileSpreadsheet },
    { id: 'ia', label: 'OdontoIA Assistente', icon: Bot, isHighlight: true },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign, badge: badgeCounts?.pendentes ? `! ${badgeCounts.pendentes}` : undefined },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-30 transition-all duration-300 flex flex-col justify-between border-r backdrop-blur-xl select-none ${
        darkMode
          ? 'bg-slate-900/95 border-slate-800/80 text-slate-200'
          : 'bg-white/95 border-slate-200/80 text-slate-700'
      } ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Top Header Logo */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/20 dark:border-slate-800/60">
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden"
        >
          <div className="bg-gradient-to-tr from-teal-600 to-cyan-500 p-2.5 rounded-2xl text-slate-950 font-bold shadow-lg shadow-teal-500/20 shrink-0">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-300">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Odonto<span className="text-teal-500">Web</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block -mt-1 uppercase tracking-wider">
                SaaS Odontológico
              </span>
            </div>
          )}
        </div>

        {/* Botão de recolher/expandir sidebar */}
        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-xl border transition-colors hidden md:flex items-center justify-center cursor-pointer ${
            darkMode
              ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
              : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
          }`}
          title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md shadow-teal-600/20'
                    : item.isHighlight
                    ? darkMode
                      ? 'bg-teal-950/40 text-teal-400 hover:bg-teal-900/60 border border-teal-800/40'
                      : 'bg-teal-50 text-teal-700 hover:bg-teal-100/80 border border-teal-200/60'
                    : darkMode
                    ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : item.isHighlight ? 'text-teal-500' : 'text-slate-400 group-hover:text-teal-500'
                }`} />

                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : darkMode
                        ? 'bg-slate-800 text-teal-400 border border-slate-700'
                        : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>

              {/* Tooltip quando a sidebar está recolhida */}
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="p-3 border-t border-slate-800/20 dark:border-slate-800/60 space-y-2">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            darkMode
              ? 'text-rose-400 hover:bg-rose-950/40 hover:text-rose-300'
              : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
          }`}
          title="Encerrar Sessão"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sair do Sistema</span>}
        </button>
      </div>
    </aside>
  );
};
