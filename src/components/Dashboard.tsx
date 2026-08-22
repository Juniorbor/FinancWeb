import React from 'react';
import type { Consulta, Paciente, TransacaoFinanceira } from '../types';
import {
  Users,
  Calendar,
  DollarSign,
  Clock,
  UserCheck,
  Activity,
  Plus,
  FileText,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

interface DashboardProps {
  consultas: Consulta[];
  pacientes: Paciente[];
  transacoes: TransacaoFinanceira[];
  onNavigate: (tab: string) => void;
  onNovaConsulta: () => void;
  onNovoPaciente: () => void;
  darkMode?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  consultas,
  pacientes,
  transacoes,
  onNavigate,
  onNovaConsulta,
  onNovoPaciente,
  darkMode
}) => {
  const consultasHoje = consultas.filter((c) => c.dataHora.startsWith('2026-08-21'));
  const emAtendimento = consultasHoje.find((c) => c.status === 'Em Atendimento');

  const totalReceitaMes = transacoes
    .filter((t) => t.tipo === 'Receita' && t.status === 'Pago')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalPendente = transacoes
    .filter((t) => t.tipo === 'Receita' && t.status === 'Pendente')
    .reduce((acc, curr) => acc + curr.valor, 0);

  return (
    <div className="space-y-6">
      {/* Banner de Boas-Vindas 2026 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-300 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" /> OdontoWeb Platform 2026
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Painel de Atendimento Clínico & Gestão
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
              Resumo operacional diário do consultório — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onNovaConsulta}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold px-4 py-3 rounded-2xl text-xs shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nova Consulta
            </button>
            <button
              onClick={onNovoPaciente}
              className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-4 py-3 rounded-2xl text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-teal-400" /> Cadastrar Paciente
            </button>
          </div>
        </div>
      </div>

      {/* Cards KPI com Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className={`p-5 rounded-3xl border shadow-sm transition-all hover:shadow-md ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Consultas Hoje</p>
            <div className="bg-teal-500/10 p-3 rounded-2xl text-teal-500">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold mt-2">{consultasHoje.length}</p>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
            <TrendingUp className="w-3.5 h-3.5" /> 100% Confirmados
          </div>
        </div>

        <div className={`p-5 rounded-3xl border shadow-sm transition-all hover:shadow-md ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Base Pacientes</p>
            <div className="bg-sky-500/10 p-3 rounded-2xl text-sky-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold mt-2">{pacientes.length}</p>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-sky-500">
            <ArrowUpRight className="w-3.5 h-3.5" /> +4 cadastros este mês
          </div>
        </div>

        <div className={`p-5 rounded-3xl border shadow-sm transition-all hover:shadow-md ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receita Realizada</p>
            <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold mt-2">
            R$ {totalReceitaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
            <ShieldCheck className="w-3.5 h-3.5" /> Pagamentos Confirmados
          </div>
        </div>

        <div className={`p-5 rounded-3xl border shadow-sm transition-all hover:shadow-md ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">A Receber / Aberto</p>
            <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-500">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold mt-2">
            R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-amber-500">
            <Clock className="w-3.5 h-3.5" /> Em andamento
          </div>
        </div>

      </div>

      {/* Grade Principal: Paciente Ao Vivo + Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Paciente na Cadeira Agora */}
        <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex justify-between items-center pb-3 border-b border-slate-800/20 dark:border-slate-800">
            <h2 className="font-bold text-base flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-500" /> Paciente na Cadeira
            </h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Ao Vivo
            </span>
          </div>

          {emAtendimento ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border space-y-2 ${
                darkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'
              }`}>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NOME DO PACIENTE</span>
                <p className="font-extrabold text-lg">{emAtendimento.pacienteNome}</p>
                <p className="text-xs text-slate-400">{emAtendimento.pacienteTelefone}</p>
                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  <span className="bg-teal-500/20 text-teal-300 font-bold px-2.5 py-1 rounded-lg border border-teal-500/30">
                    {emAtendimento.procedimento}
                  </span>
                  <span className="bg-slate-800 text-slate-300 font-bold px-2.5 py-1 rounded-lg">
                    {emAtendimento.sala}
                  </span>
                </div>
              </div>

              <div className="text-xs p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                <p className="font-bold">Dentista responsável:</p>
                <p className="text-slate-300">{emAtendimento.dentistaNome}</p>
              </div>

              <button
                onClick={() => onNavigate('odontograma')}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-3 rounded-2xl text-xs shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" /> Abrir Odontograma / Prontuário
              </button>
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <Clock className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-slate-400 text-xs font-semibold">Nenhum paciente em atendimento no momento.</p>
            </div>
          )}
        </div>

        {/* Agenda do Dia */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border shadow-sm space-y-4 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex justify-between items-center pb-3 border-b border-slate-800/20 dark:border-slate-800">
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-500" /> Agenda de Atendimentos do Dia
              </h2>
              <p className="text-xs text-slate-400">Consultas e procedimentos agendados</p>
            </div>

            <button
              onClick={() => onNavigate('agenda')}
              className="text-teal-500 hover:text-teal-400 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              Ver Agenda Completa <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/20 dark:divide-slate-800">
            {consultasHoje.map((consulta) => (
              <div
                key={consulta.id}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-800/40 px-3 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-teal-500/10 border border-teal-500/20 px-3 py-2 rounded-2xl text-center min-w-[70px]">
                    <span className="block text-xs font-extrabold text-teal-400">
                      {consulta.dataHora.split('T')[1]}
                    </span>
                    <span className="block text-[10px] text-slate-400">{consulta.duracaoMinutos} min</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-xs sm:text-sm">{consulta.pacienteNome}</h3>
                    <p className="text-xs text-slate-400">
                      {consulta.procedimento} • <span className="text-teal-400">{consulta.dentistaNome}</span>
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold ${
                    consulta.status === 'Em Atendimento'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : consulta.status === 'Confirmado'
                      ? 'bg-sky-500/20 text-sky-400'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {consulta.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
