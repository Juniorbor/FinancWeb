import React from 'react';
import { BarChart3, TrendingUp, Users, Calendar, DollarSign, Download, FileX } from 'lucide-react';

interface RelatoriosProps {
  darkMode?: boolean;
}

export const Relatorios: React.FC<RelatoriosProps> = ({ darkMode }) => {
  return (
    <div className="space-y-6">
      {/* Top Bar Header */}
      <div className={`p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-500" /> Relatórios Analíticos & Desempenho
          </h2>
          <p className="text-xs text-slate-400">
            Painel consolidado de produção clínica, taxa de ocupação e performance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer shadow"
        >
          <Download className="w-4 h-4 text-teal-400" /> Exportar Relatório (PDF / Excel)
        </button>
      </div>

      {/* Grid de KPIs Zerados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`p-5 rounded-3xl border shadow-xl space-y-2 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex justify-between items-center text-xs text-slate-400 font-extrabold">
            <span>TAXA DE OCUPAÇÃO</span>
            <TrendingUp className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-500">0.0%</p>
          <span className="text-[11px] font-semibold text-slate-500">Sem dados no período</span>
        </div>

        <div className={`p-5 rounded-3xl border shadow-xl space-y-2 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex justify-between items-center text-xs text-slate-400 font-extrabold">
            <span>TICKET MÉDIO / PACIENTE</span>
            <DollarSign className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-500">R$ 0,00</p>
          <span className="text-[11px] font-semibold text-slate-500">Sem procedimentos liquidados</span>
        </div>

        <div className={`p-5 rounded-3xl border shadow-xl space-y-2 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex justify-between items-center text-xs text-slate-400 font-extrabold">
            <span>NOVOS PACIENTES / MÊS</span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-500">0</p>
          <span className="text-[11px] font-semibold text-slate-500">Nenhum novo registro no mês</span>
        </div>

        <div className={`p-5 rounded-3xl border shadow-xl space-y-2 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex justify-between items-center text-xs text-slate-400 font-extrabold">
            <span>TAXA DE RETORNO</span>
            <Calendar className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-500">0%</p>
          <span className="text-[11px] font-semibold text-slate-500">Sem consultas finalizadas</span>
        </div>
      </div>

      {/* Seção de Gráficos e Distribuição de Procedimentos Zerada */}
      <div className={`p-8 rounded-3xl border shadow-xl text-center space-y-4 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="w-16 h-16 rounded-3xl bg-slate-800/60 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
          <FileX className="w-8 h-8 text-teal-500" />
        </div>

        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="font-extrabold text-base text-white">Nenhum dado nos Relatórios no momento</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            As informações de relatórios analíticos, gráficos e indicadores de desempenho foram completamente limpas conforme solicitado.
          </p>
        </div>
      </div>
    </div>
  );
};
