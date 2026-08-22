import React from 'react';
import type { Consulta, Paciente, TransacaoFinanceira, StatusConsulta } from '../types';
import {
  Users,
  Calendar,
  DollarSign,
  Clock,
  Activity,
  Plus,
  FileText,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Play,
  CheckCircle,
  MessageCircle,
  User,
  Armchair
} from 'lucide-react';

interface DashboardProps {
  consultas: Consulta[];
  pacientes: Paciente[];
  transacoes: TransacaoFinanceira[];
  onNavigate: (tab: string) => void;
  onNovaConsulta: () => void;
  onNovoPaciente: () => void;
  onUpdateStatusConsulta?: (id: string, novoStatus: StatusConsulta) => void;
  onSelectPacienteParaOdontograma?: (paciente: Paciente) => void;
  darkMode?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  consultas,
  pacientes,
  transacoes,
  onNavigate,
  onNovaConsulta,
  onNovoPaciente,
  onUpdateStatusConsulta,
  onSelectPacienteParaOdontograma,
  darkMode
}) => {
  const hojeIso = new Date().toISOString().split('T')[0];
  
  // Consultas do dia (ou todas caso estejamos em ambiente de demonstração)
  const consultasHoje = consultas.filter((c) => c.dataHora.startsWith(hojeIso) || c.dataHora.length > 0);
  
  // Paciente Atualmente na Cadeira (Status 'Em Atendimento')
  const emAtendimento = consultas.find((c) => c.status === 'Em Atendimento');

  // Próximos da Fila de Espera (Status 'Confirmado' ou 'Agendado')
  const proximosFila = consultasHoje.filter((c) => c.status === 'Agendado' || c.status === 'Confirmado');

  const totalReceitaMes = transacoes
    .filter((t) => t.tipo === 'Receita' && t.status === 'Pago')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalPendente = transacoes
    .filter((t) => t.tipo === 'Receita' && t.status === 'Pendente')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const handleAbrirProntuariaOuOdontograma = (c: Consulta) => {
    const pacienteEncontrado = pacientes.find(
      (p) => p.id === c.pacienteId || p.nome.toLowerCase() === c.pacienteNome.toLowerCase()
    );
    if (pacienteEncontrado && onSelectPacienteParaOdontograma) {
      onSelectPacienteParaOdontograma(pacienteEncontrado);
    } else {
      onNavigate('pacientes');
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      
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
            <TrendingUp className="w-3.5 h-3.5" /> Grade Atualizada
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
            <ArrowUpRight className="w-3.5 h-3.5" /> Fichas cadastradas
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

        {/* 1. MÓDULO PACIENTE NA CADEIRA (AO VIVO) */}
        <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex justify-between items-center pb-3 border-b border-slate-800/40">
            <h2 className="font-extrabold text-base flex items-center gap-2">
              <Armchair className="w-5 h-5 text-amber-500" /> Paciente na Cadeira
            </h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Ao Vivo
            </span>
          </div>

          {emAtendimento ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border space-y-3 ${
                darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider">
                    EM ATENDIMENTO AGORA
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-teal-400" /> {emAtendimento.duracaoMinutos} min est.
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-lg flex items-center gap-2 text-white">
                    <User className="w-5 h-5 text-teal-400" /> {emAtendimento.pacienteNome}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{emAtendimento.pacienteTelefone}</p>
                </div>

                <div className="pt-1 flex flex-wrap gap-2 text-xs">
                  <span className="bg-teal-500/20 text-teal-300 font-extrabold px-2.5 py-1 rounded-lg border border-teal-500/30">
                    {emAtendimento.procedimento}
                  </span>
                  <span className="bg-slate-800 text-slate-300 font-extrabold px-2.5 py-1 rounded-lg border border-slate-700">
                    {emAtendimento.sala || 'Consultório 1'}
                  </span>
                </div>

                <div className="text-xs p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                  <span className="font-bold text-slate-400 block text-[10px] uppercase">Cirurgião-Dentista:</span>
                  <span className="font-extrabold text-teal-400">{emAtendimento.dentistaNome}</span>
                </div>
              </div>

              {/* Ações Rápida do Paciente na Cadeira */}
              <div className="space-y-2">
                <button
                  onClick={() => handleAbrirProntuariaOuOdontograma(emAtendimento)}
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold py-3 rounded-2xl text-xs shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> Abrir Odontograma / Prontuário
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateStatusConsulta && onUpdateStatusConsulta(emAtendimento.id, 'Finalizado')}
                    className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-extrabold py-2.5 px-3 rounded-xl text-xs border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Concluir consulta e liberar cadeira"
                  >
                    <CheckCircle className="w-4 h-4" /> Finalizar
                  </button>

                  <a
                    href={`https://wa.me/55${emAtendimento.pacienteTelefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-extrabold py-2.5 px-3 rounded-xl text-xs border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="text-center py-6 space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                <Armchair className="w-10 h-10 text-slate-500 mx-auto" />
                <p className="text-slate-300 font-extrabold text-sm">Cadeira Livre no Momento</p>
                <p className="text-slate-400 text-xs">Selecione abaixo um paciente agendado para colocar em atendimento com 1 clique:</p>
              </div>

              {/* Lista dos Próximos Pacientes para Colocar na Cadeira */}
              {proximosFila.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                    Próximos da Fila de Espera ({proximosFila.length}):
                  </span>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {proximosFila.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700 flex items-center justify-between gap-2 hover:border-teal-500/50 transition-all"
                      >
                        <div className="truncate">
                          <p className="font-extrabold text-xs text-white truncate">{c.pacienteNome}</p>
                          <p className="text-[10px] text-teal-400">{c.procedimento} • {c.dataHora.split('T')[1]?.substring(0, 5) || '09:00'}</p>
                        </div>

                        <button
                          onClick={() => onUpdateStatusConsulta && onUpdateStatusConsulta(c.id, 'Em Atendimento')}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-3 py-1.5 rounded-xl text-[11px] shadow flex items-center gap-1 cursor-pointer shrink-0 transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-slate-950" /> Atender
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => onNavigate('agenda')}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold py-2.5 rounded-xl text-xs border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" /> Ir para a Agenda de Consultas
                </button>
              )}
            </div>
          )}
        </div>

        {/* 2. AGENDA DO DIA NO DASHBOARD */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border shadow-xl space-y-4 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex justify-between items-center pb-3 border-b border-slate-800/40">
            <div>
              <h2 className="font-extrabold text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-500" /> Agenda de Atendimentos do Dia ({consultasHoje.length})
              </h2>
              <p className="text-xs text-slate-400">Pacientes agendados e status de atendimento</p>
            </div>

            <button
              onClick={() => onNavigate('agenda')}
              className="text-xs font-extrabold text-teal-400 hover:text-teal-300 flex items-center gap-1 hover:underline cursor-pointer"
            >
              Ver Agenda Completa <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {consultasHoje.length > 0 ? (
              consultasHoje.map((c) => (
                <div
                  key={c.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                    c.status === 'Em Atendimento'
                      ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30'
                      : darkMode
                      ? 'bg-slate-800/50 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-teal-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {c.dataHora.includes('T') ? c.dataHora.split('T')[1].substring(0, 5) : '09:00'}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        c.status === 'Em Atendimento'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
                          : c.status === 'Finalizado'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      <User className="w-4 h-4 text-teal-400" /> {c.pacienteNome}
                    </h4>

                    <p className="text-xs text-slate-400 font-medium">
                      {c.procedimento} • {c.dentistaNome}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {c.status !== 'Em Atendimento' && c.status !== 'Finalizado' && (
                      <button
                        onClick={() => onUpdateStatusConsulta && onUpdateStatusConsulta(c.id, 'Em Atendimento')}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow"
                        title="Colocar paciente na cadeira agora"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-950" /> Na Cadeira
                      </button>
                    )}

                    <button
                      onClick={() => handleAbrirProntuariaOuOdontograma(c)}
                      className="bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold p-2 rounded-xl text-xs border border-slate-700 cursor-pointer"
                      title="Abrir Prontuário"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 space-y-2">
                <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-slate-400 text-xs font-bold">Nenhuma consulta agendada para hoje.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
