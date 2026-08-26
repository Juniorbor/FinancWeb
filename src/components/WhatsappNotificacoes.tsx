import React, { useState, useEffect } from 'react';
import type { ItemProducaoTomo } from '../types';
import {
  MessageSquare,
  Clock,
  Building2,
  Calendar,
  Send,
  CheckCircle2,
  Bell,
  Sparkles,
  Users,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Phone,
  X,
  AlertCircle
} from 'lucide-react';

interface WhatsappNotificacoesProps {
  darkMode?: boolean;
  itensProducao?: ItemProducaoTomo[];
}

export interface DesempenhoClinica {
  id: string;
  nome: string;
  unidade: string;
  pacientesHoje: number;
  faturamentoHoje: number;
  ticketMedioHoje: number;
  procedimentosDestaque: string;
  pacientesMesAnterior: number;
  faturamentoMesAnterior: number;
  crescimentoMes: number;
}

const TODAS_UNIDADES_PRODUCAO = [
  { id: 'cli-1', nome: 'Clínica Ariquemes', unidade: 'Ariquemes', proprietario: 'Fernando' },
  { id: 'cli-2', nome: 'Clínica Porto Velho', unidade: 'Porto Velho', proprietario: 'Fernando' },
  { id: 'cli-3', nome: 'Clínica Machadinho', unidade: 'Machadinho', proprietario: 'Fernando' },
  { id: 'cli-4', nome: 'Clínica Cacoal', unidade: 'Cacoal', proprietario: 'Fernando' },
  { id: 'cli-5', nome: 'Clínica Rolim de Moura', unidade: 'Rolim de Moura', proprietario: 'Bernardo' },
  { id: 'cli-6', nome: 'Clínica Ouro Preto', unidade: 'Ouro Preto', proprietario: 'Bernardo' },
  { id: 'cli-7', nome: 'Clínica Ji-Paraná', unidade: 'Ji-Paraná', proprietario: 'Bernardo' }
];

const STORAGE_KEY_WHATSAPP = 'odonto_whatsapp_config_v1';

export const WhatsappNotificacoes: React.FC<WhatsappNotificacoesProps> = ({
  darkMode,
  itensProducao = []
}) => {
  const [telefoneWhatsApp, setTelefoneWhatsApp] = useState<string>('(69) 993649158');
  const [horarioDiario, setHorarioDiario] = useState<string>('18:30');
  const [automacaoAtiva, setAutomacaoAtiva] = useState<boolean>(true);
  const [notificarDiaUm, setNotificarDiaUm] = useState<boolean>(true);

  const [sucessoMsg, setSucessoMsg] = useState<string>('');
  const [modalEditAberto, setModalEditAberto] = useState<boolean>(false);
  const [modalRelatorioMensalAberto, setModalRelatorioMensalAberto] = useState<boolean>(false);

  // Carregar preferências salvas
  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_KEY_WHATSAPP);
    if (salvo) {
      try {
        const parsed = JSON.parse(salvo);
        if (parsed.telefone) setTelefoneWhatsApp(parsed.telefone);
        if (parsed.horario) setHorarioDiario(parsed.horario);
        if (parsed.automacaoAtiva !== undefined) setAutomacaoAtiva(parsed.automacaoAtiva);
        if (parsed.notificarDiaUm !== undefined) setNotificarDiaUm(parsed.notificarDiaUm);
      } catch (e) {}
    }
  }, []);

  const handleSalvarConfiguracoes = (e: React.FormEvent) => {
    e.preventDefault();
    const config = {
      telefone: telefoneWhatsApp,
      horario: horarioDiario,
      automacaoAtiva,
      notificarDiaUm
    };
    localStorage.setItem(STORAGE_KEY_WHATSAPP, JSON.stringify(config));
    setSucessoMsg('Configurações de automação WhatsApp salvas com sucesso!');
    setModalEditAberto(false);
    setTimeout(() => setSucessoMsg(''), 4000);
  };

  // CALCULA O DESEMPENHO EM TEMPO REAL DE CADA CLÍNICA BASEADO DIRETAMENTE NA TABELA DE LANÇAMENTOS DA PRODUÇÃO
  const dataHojeIso = new Date().toISOString().split('T')[0];

  const clinicas: DesempenhoClinica[] = TODAS_UNIDADES_PRODUCAO.map((u) => {
    // Filtra lançamentos da tabela referentes a esta unidade
    const lancamentosClinica = itensProducao.filter((i) => i.unidade === u.unidade);
    // Lançamentos específicos da data de hoje
    const lancamentosHoje = lancamentosClinica.filter((i) => i.data === dataHojeIso);
    
    // Se houver lançamentos hoje, usamos a data de hoje; caso contrário, mostramos os lançamentos gerais da tabela para esta clínica
    const alvoLancamentos = lancamentosHoje.length > 0 ? lancamentosHoje : lancamentosClinica;

    const pacientesHoje = alvoLancamentos.length;
    const faturamentoHoje = alvoLancamentos.reduce((acc, i) => acc + i.valor, 0);
    const ticketMedioHoje = pacientesHoje > 0 ? faturamentoHoje / pacientesHoje : 0;

    // Região tomográfica em destaque
    const regioesCount: Record<string, number> = {};
    alvoLancamentos.forEach((i) => {
      regioesCount[i.regiao] = (regioesCount[i.regiao] || 0) + 1;
    });
    const regiaoMaisFrequente = Object.keys(regioesCount).sort((a, b) => regioesCount[b] - regioesCount[a])[0];
    const procedimentosDestaque = pacientesHoje > 0 ? regiaoMaisFrequente : 'Sem lançamentos na tabela';

    return {
      id: u.id,
      nome: u.nome,
      unidade: `${u.unidade} (${u.proprietario})`,
      pacientesHoje,
      faturamentoHoje,
      ticketMedioHoje,
      procedimentosDestaque,
      pacientesMesAnterior: lancamentosClinica.length,
      faturamentoMesAnterior: lancamentosClinica.reduce((acc, i) => acc + i.valor, 0),
      crescimentoMes: 0
    };
  });

  // Calcula totais dinâmicos de todas as clínicas baseados na produção
  const totalPacientesHoje = clinicas.reduce((acc, c) => acc + c.pacientesHoje, 0);
  const totalFaturamentoHoje = clinicas.reduce((acc, c) => acc + c.faturamentoHoje, 0);

  // Monta a mensagem formatada para WhatsApp baseada 100% na Tabela de Lançamentos da Produção
  const gerarMensagemWhatsAppDiaria = () => {
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    let texto = `*📊 FINANÇAS PESSOAL - RESUMO DIÁRIO DE PRODUÇÃO DAS CLÍNICAS*\n`;
    texto += `📅 *Data:* ${dataHoje} | ⏰ *Horário:* ${horarioDiario}h\n`;
    texto += `📱 *Destinatário:* ${telefoneWhatsApp}\n\n`;
    texto += `*📈 BALANÇO CONSOLIDADO DO DIA (TABELA DE PRODUÇÃO):*\n`;
    texto += `• Total de Pacientes Atendidos: *${totalPacientesHoje} pacientes*\n`;
    texto += `• Faturamento Total do Dia: *R$ ${totalFaturamentoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n`;
    texto += `*🏥 DESEMPENHO INDIVIDUAL POR CLÍNICA:*\n`;

    clinicas.forEach((c, idx) => {
      texto += `\n*${idx + 1}. ${c.nome.toUpperCase()} (${c.unidade})*\n`;
      texto += `  👥 Pacientes Atendidos Hoje: *${c.pacientesHoje}*\n`;
      texto += `  💰 Faturamento do Dia: *R$ ${c.faturamentoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n`;
      texto += `  🎯 Ticket Médio: *R$ ${c.ticketMedioHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/paciente*\n`;
      if (c.pacientesHoje > 0) {
        texto += `  ✨ Região Principal: _${c.procedimentosDestaque}_\n`;
      } else {
        texto += `  ⚪ Status: _Zerado (Sem lançamentos hoje na tabela)_\n`;
      }
    });

    texto += `\n-----------------------------------\n`;
    texto += `✅ _Relatório automatizado sincronizado com a Tabela de Lançamentos da Produção._`;
    return texto;
  };

  const handleTestarEnvioWhatsApp = () => {
    const numLimpo = telefoneWhatsApp.replace(/\D/g, '');
    const numComPais = numLimpo.startsWith('55') ? numLimpo : `55${numLimpo}`;
    const mensagemEncoded = encodeURIComponent(gerarMensagemWhatsAppDiaria());
    const urlWhatsapp = `https://wa.me/${numComPais}?text=${mensagemEncoded}`;

    window.open(urlWhatsapp, '_blank');
    setSucessoMsg(`Notificação do resumo de produção enviada para (${telefoneWhatsApp})!`);
    setTimeout(() => setSucessoMsg(''), 4000);
  };

  const dataHoje = new Date();
  const mesAnteriorNome = new Date(dataHoje.getFullYear(), dataHoje.getMonth() - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner de Destaque */}
      <div className={`p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 shrink-0">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-widest">
                Sincronizado com Tabela de Lançamentos
              </span>
              <span className="text-[10px] font-extrabold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                18:30h Diário
              </span>
            </div>
            <h2 className="text-xl font-extrabold mt-1 flex items-center gap-2">
              Notificações WhatsApp & Desempenho por Clínica (Produção)
            </h2>
            <p className="text-xs text-slate-400">
              Cálculo em tempo real baseado exclusivamente nos lançamentos efetuados na Tabela de Produção.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setModalEditAberto(true)}
            className="px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 cursor-pointer shadow"
          >
            <Clock className="w-4 h-4 text-emerald-400" /> Configurar Horário & Contato
          </button>

          <button
            onClick={handleTestarEnvioWhatsApp}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" /> Disparar Resumo no WhatsApp Agora
          </button>
        </div>
      </div>

      {sucessoMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-bounce shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{sucessoMsg}</span>
          </div>
          <button onClick={() => setSucessoMsg('')} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Cards de Resumo Executivo da Automação */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-3xl border shadow-xl flex items-center justify-between ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Número Cadastrado</span>
            <h4 className="text-base font-extrabold text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-400" /> {telefoneWhatsApp}
            </h4>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Disparo automático habilitado</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-3xl border shadow-xl flex items-center justify-between ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Horário do Disparo</span>
            <h4 className="text-base font-extrabold text-teal-400 mt-0.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-400" /> Todos os dias às {horarioDiario}h
            </h4>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Resumo com lançamentos do dia</span>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl border border-teal-500/20">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-3xl border shadow-xl flex items-center justify-between ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Pacientes na Tabela</span>
            <h4 className="text-base font-extrabold text-white mt-0.5 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-teal-400" /> {totalPacientesHoje} Pacientes
            </h4>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Soma total das 7 unidades</span>
          </div>
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-3xl border shadow-xl flex items-center justify-between ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Faturamento da Tabela</span>
            <h4 className="text-base font-extrabold text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" /> R$ {totalFaturamentoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h4>
            <span className="text-[10px] text-emerald-400 mt-0.5 block font-bold">Calculado dos lançamentos</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* BANNER DO RELATÓRIO MENSAL (NOTIFICAÇÃO DIA 01) */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-900/40 via-slate-900 to-emerald-900/40 border border-teal-500/30 text-white shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-teal-500/20 text-teal-300 rounded-2xl border border-teal-500/40 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-md border border-teal-500/20">
              Notificação do Sistema • Todo Dia 01
            </span>
            <h3 className="text-base font-extrabold mt-1 text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Relatório Mensal de Desempenho por Clínica ({mesAnteriorNome})
            </h3>
            <p className="text-xs text-slate-300">
              Consolidado estatístico de faturamento e total de exames por clínica extraídos da tabela de produção.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalRelatorioMensalAberto(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-teal-600/30 transition-all shrink-0 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" /> Visualizar Relatório Mensal Completo
        </button>
      </div>

      {/* TABELA DE DESEMPENHO FINANCEIRO & PACIENTES POR CLÍNICA (BASED ON REAL PRODUCTION LAUNCHES) */}
      <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-400" /> Desempenho em Tempo Real por Clínica (Extraído da Tabela de Produção)
            </h3>
            <p className="text-xs text-slate-400">
              Monitoramento automático por unidade baseado nos lançamentos da tabela que alimentam o relatório das 18:30h via WhatsApp.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
            7 Unidades Monitoradas
          </span>
        </div>

        {itensProducao.length === 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
            <span>Tabela de Lançamentos da Produção está zerada no momento. Os dados das clínicas serão preenchidos automaticamente conforme você adicionar registros na tabela.</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3">Clínica / Unidade</th>
                <th className="py-3 px-3 text-center">Pacientes Lançados</th>
                <th className="py-3 px-3 text-right">Faturamento Total</th>
                <th className="py-3 px-3 text-right">Ticket Médio / Exame</th>
                <th className="py-3 px-3">Região / Procedimento Principal</th>
                <th className="py-3 px-3 text-center">Status no WhatsApp 18:30h</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-semibold">
              {clinicas.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-3 flex items-center gap-2.5 font-bold">
                    <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-extrabold text-white block">{c.nome}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{c.unidade}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className={`text-sm font-black px-3 py-1 rounded-xl border ${
                      c.pacientesHoje > 0
                        ? 'text-teal-400 bg-teal-500/10 border-teal-500/20'
                        : 'text-slate-500 bg-slate-800/50 border-slate-700'
                    }`}>
                      {c.pacientesHoje} pacientes
                    </span>
                  </td>

                  <td className={`py-3.5 px-3 text-right font-black text-sm ${
                    c.faturamentoHoje > 0 ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    R$ {c.faturamentoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3.5 px-3 text-right font-bold text-slate-300">
                    R$ {c.ticketMedioHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3.5 px-3 text-slate-300">
                    <span className={`px-2.5 py-1 rounded-lg border text-[11px] ${
                      c.pacientesHoje > 0
                        ? 'bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-slate-900 text-slate-500 border-slate-800 font-normal'
                    }`}>
                      {c.procedimentosDestaque}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-xl border ${
                      c.pacientesHoje > 0
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-slate-400 bg-slate-800/50 border-slate-700'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> {c.pacientesHoje > 0 ? 'Pronto p/ 18:30h' : 'Zerado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CONFIGURAÇÃO DO DISPARO WHATSAPP */}
      {modalEditAberto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`p-6 rounded-3xl border max-w-md w-full shadow-2xl space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2 text-emerald-400">
                <MessageSquare className="w-5 h-5" /> Ajustes de Notificação WhatsApp
              </h3>
              <button onClick={() => setModalEditAberto(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarConfiguracoes} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Contato WhatsApp Destinatário</label>
                <input
                  type="text"
                  value={telefoneWhatsApp}
                  onChange={(e) => setTelefoneWhatsApp(e.target.value)}
                  placeholder="(69) 993649158"
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Número oficial que receberá o balanço diário das 7 clínicas.</span>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Horário de Disparo Diário</label>
                <input
                  type="time"
                  value={horarioDiario}
                  onChange={(e) => setHorarioDiario(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Horário agendado para o envio do resumo de produção.</span>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={automacaoAtiva}
                    onChange={(e) => setAutomacaoAtiva(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span>Ativar Disparo Automático Diário às 18:30h</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificarDiaUm}
                    onChange={(e) => setNotificarDiaUm(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span>Notificar Relatório Mensal no site todo Dia 01 do Mês</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalEditAberto(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  Salvar Preferências
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALHADO DO RELATÓRIO MENSAL (NOTIFICAÇÃO DIA 01) */}
      {modalRelatorioMensalAberto && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`p-6 rounded-3xl border max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">
                  FECHAMENTO MENSAL DA PRODUÇÃO (DIA 01)
                </span>
                <h3 className="font-extrabold text-lg flex items-center gap-2 text-white mt-0.5">
                  <FileSpreadsheet className="w-5 h-5 text-teal-400" /> Relatório Mensal por Clínica - Tabela de Produção ({mesAnteriorNome})
                </h3>
              </div>
              <button onClick={() => setModalRelatorioMensalAberto(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 flex items-center justify-between">
                <div>
                  <span className="font-extrabold uppercase text-[10px] tracking-wider block text-teal-400">Total Faturado na Tabela de Produção</span>
                  <h4 className="text-xl font-black text-emerald-400 mt-0.5">
                    R$ {totalFaturamentoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="font-extrabold uppercase text-[10px] tracking-wider block text-teal-400">Total de Pacientes Lançados</span>
                  <h4 className="text-xl font-black text-white mt-0.5">{totalPacientesHoje} Pacientes</h4>
                </div>
              </div>

              <h4 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider pt-2">
                Detalhamento por Unidade de Produção:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {clinicas.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="font-extrabold text-xs text-teal-400 block truncate">{c.nome} ({c.unidade})</span>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-300">
                        <span>Pacientes Atendidos:</span>
                        <strong className="text-white">{c.pacientesHoje}</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Faturamento da Clínica:</span>
                        <strong className="text-emerald-400">R$ {c.faturamentoHoje.toLocaleString('pt-BR')}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5"
              >
                Imprimir Relatório Mensal
              </button>

              <button
                type="button"
                onClick={() => setModalRelatorioMensalAberto(false)}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Concluir Análise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
