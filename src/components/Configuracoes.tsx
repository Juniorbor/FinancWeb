import React, { useState } from 'react';
import { Settings, User, Building2, Moon, Save, CheckCircle2 } from 'lucide-react';

interface ConfiguracoesProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  usuarioLogado: {
    nome: string;
    email: string;
    funcao: string;
    cro: string;
  } | null;
}

export const Configuracoes: React.FC<ConfiguracoesProps> = ({
  darkMode,
  onToggleDarkMode,
  usuarioLogado
}) => {
  const [salvo, setSalvo] = useState<boolean>(false);
  const [nomeClinica, setNomeClinica] = useState<string>('Consultório Odontológico OdontoWeb');
  const [cro, setCro] = useState<string>(usuarioLogado?.cro || 'CRO-SP 123456');

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Header */}
      <div className={`p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Settings className="w-6 h-6 text-teal-500" /> Configurações do Sistema & Clínica
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ajustes gerais do consultório, preferências de interface e perfil profissional.
          </p>
        </div>

        <button
          onClick={handleSalvar}
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-teal-600/20 transition-all cursor-pointer"
        >
          {salvo ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          {salvo ? 'Configurações Salvas!' : 'Salvar Preferências'}
        </button>
      </div>

      <form onSubmit={handleSalvar} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">

        {/* Perfil da Clínica */}
        <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h3 className="font-bold text-sm uppercase text-teal-500 tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Informações do Consultório / Clínica
          </h3>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Nome Fantasia da Clínica</label>
            <input
              type="text"
              value={nomeClinica}
              onChange={(e) => setNomeClinica(e.target.value)}
              className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Endereço da Unidade Principal</label>
            <input
              type="text"
              defaultValue="Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
              className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>
        </div>

        {/* Perfil Profissional */}
        <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h3 className="font-bold text-sm uppercase text-teal-500 tracking-wider flex items-center gap-2">
            <User className="w-4 h-4" /> Perfil do Profissional Responsável
          </h3>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Nome do Cirurgião-Dentista</label>
            <input
              type="text"
              defaultValue={usuarioLogado?.nome || 'Dra. Patricia Medeiros'}
              className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Registro CRO</label>
            <input
              type="text"
              value={cro}
              onChange={(e) => setCro(e.target.value)}
              className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>
        </div>

        {/* Tema & Aparência */}
        <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h3 className="font-bold text-sm uppercase text-teal-500 tracking-wider flex items-center gap-2">
            <Moon className="w-4 h-4" /> Tema e Aparência Visual (SaaS 2026)
          </h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Modo Escuro (Dark Theme)</p>
              <p className="text-[11px] text-slate-400">Alterna entre o tema Claro e o tema Escuro de alto contraste.</p>
            </div>

            <button
              type="button"
              onClick={onToggleDarkMode}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                darkMode ? 'bg-amber-400 text-slate-950 shadow' : 'bg-slate-900 text-white shadow'
              }`}
            >
              {darkMode ? 'Ativo (Escuro)' : 'Ativar Modo Escuro'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
