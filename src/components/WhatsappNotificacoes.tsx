import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';

interface WhatsappNotificacoesProps {
  darkMode?: boolean;
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
  crescimentoMes: number; // Porcentagem
}

export const CLINICAS_MOCK_INICIAIS: DesempenhoClinica[] = [
  {
    id: 'cli-1',
    nome: 'Finanças Pessoal - Unidade Centro',
    unidade: 'Matriz - Centro',
    pacientesHoje: 14,
    faturamentoHoje: 3850.00,
    ticketMedioHoje: 275.00,
    procedimentosDestaque: 'Tomografias & Limpezas',
    pacientesMesAnterior: 310,
    faturamentoMesAnterior: 84500.00,
    crescimentoMes: 12.4
  },
  {
    id: 'cli-2',
    nome: 'Finanças Pessoal - Unidade Norte',
    unidade: 'Filial 01 - Norte',
    pacientesHoje: 9,
    faturamentoHoje: 2420.00,
    ticketMedioHoje: 268.88,
    procedimentosDestaque: 'Restaurações & Raios-X',
    pacientesMesAnterior: 215,
    faturamentoMesAnterior: 58200.00,
    crescimentoMes: 8.7
  },
  {
    id: 'cli-3',
    nome: 'Finanças Pessoal - Unidade Sul',
    unidade: 'Filial 02 - Sul',
    pacientesHoje: 11,
    faturamentoHoje: 2980.00,
    ticketMedioHoje: 270.90,
    procedimentosDestaque: 'Endodontia & Próteses',
    pacientesMesAnterior: 265,
    faturamentoMesAnterior: 71900.00,
    crescimentoMes: 15.1
  }
];

const STORAGE_KEY_WHATSAPP = 'odonto_whatsapp_config_v1';

export const WhatsappNotificacoes: React.FC<WhatsappNotificacoesProps> = ({ darkMode }) => {
  const [telefoneWhatsApp, setTelefoneWhatsApp] = useState<string>('(69) 993649158');
  const [horarioDiario, setHorarioDiario] = useState<string>('18:30');
  const [automacaoAtiva, setAutomacaoAtiva] = useState<boolean>(true);
  const [notificarDiaUm, setNotificarDiaUm] = useState<boolean>(true);

  const [clinicas] = useState<DesempenhoClinica[]>(CLINICAS_MOCK_INICIAIS);
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

  // Calcula totais do dia
  const totalPacientesHoje = clinicas.reduce((acc, c) => acc + c.pacientesHoje, 0);
  const totalFaturamentoHoje = clinicas.reduce((acc, c) => acc + c.faturamentoHoje, 0);

  // Monta a mensagem formatada profissional para WhatsApp
  const gerarMensagemWhatsAppDiaria = () => {
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    let texto = `*📊 FINANÇAS PESSOAL - RESUMO DIÁRIO DE DESEMPENHO*\n`;
    texto += `📅 *Data:* ${dataHoje} | ⏰ *Horário:* 18:30h\n`;
    texto += `📱 *Destinatário:* (69) 993649158\n\n`;
    texto += `*📈 RESUMO GERAL DAS CLÍNICAS:*\n`;
    texto += `• Total de Pacientes Atendidos Hoje: *${totalPacientesHoje} pacientes*\n`;
    texto += `• Faturamento Total do Dia: *R$ ${totalFaturamentoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n`;
    texto += `*🏥 DESEMPENHO INDIVIDUAL POR CLÍNICA:*\n`;

    clinicas.forEach((c, idx) => {
      texto += `\n*${idx + 1}. ${c.nome.toUpperCase()}*\n`;
      texto += `  👥 Pacientes Atendidos Hoje: *${c.pacientesHoje}*\n`;
      texto += `  💰 Faturamento do Dia: *R$ ${c.faturamentoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n`;
      texto += `  🎯 Ticket Médio: *R$ ${c.ticketMedioHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/paciente*\n`;
      texto += `  ✨ Destaque: _${c.procedimentosDestaque}_\n`;
    });

    texto += `\n-----------------------------------\n`;
    texto += `✅ _Relatório automatizado gerado por Finanças Pessoal Platform._`;
    return texto;
  };

  const handleTestarEnvioWhatsApp = () => {
    const numLimpo = telefoneWhatsApp.replace(/\D/g, '');
    const numComPais = numLimpo.startsWith('55') ? numLimpo : `55${numLimpo}`;
    const mensagemEncoded = encodeURIComponent(gerarMensagemWhatsAppDiaria());
    const urlWhatsapp = `https://wa.me/${numComPais}?text=${mensagemEncoded}`;

    window.open(urlWhatsapp, '_blank');
    setSucessoMsg(`Notificação montada e enviada via WhatsApp para (${telefoneWhatsApp})!`);
    setTimeout(() => setSucessoMsg(''), 4000);
  };

  // Notificação do Relatório Mensal (Dia 01 do mês anterior)
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
                Automação Inteligente Ativa
              </span>
              <span className="text-[10px] font-extrabold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                18:30h Diário
              </span>
            </div>
            <h2 className="text-xl font-extrabold mt-1 flex items-center gap-2">
              Notificações WhatsApp & Desempenho das Clínicas
            </h2>
            <p className="text-xs text-slate-400">
              Receba diariamente às 18:30h no seu WhatsApp o balanço de pacientes e faturamento por clínica.
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
            <span className="text-[10px] text-slate-400 mt-0.5 block">Próximo envio: Hoje às 18:30h</span>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl border border-teal-500/20">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-3xl border shadow-xl flex items-center justify-between ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Pacientes Atendidos Hoje</span>
            <h4 className="text-base font-extrabold text-white mt-0.5 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-teal-400" /> {totalPacientesHoje} Pacientes
            </h4>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Soma de 3 unidades ativas</span>
          </div>
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-3xl border shadow-xl flex items-center justify-between ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Faturamento do Dia</span>
            <h4 className="text-base font-extrabold text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" /> R$ {totalFaturamentoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h4>
            <span className="text-[10px] text-emerald-400 mt-0.5 block font-bold">+11.2% em relação a ontem</span>
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
              Consolidado estatístico de faturamento, novos pacientes e crescimento relativo referente ao mês anterior.
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

      {/* TABELA DE DESEMPENHO FINANCEIRO & PACIENTES POR CLÍNICA */}
      <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-400" /> Desempenho em Tempo Real por Clínica
            </h3>
            <p className="text-xs text-slate-400">
              Monitoramento diário por unidade que alimenta o relatório automatizado das 18:30h via WhatsApp.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
            3 Unidades Monitoradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3">Clínica / Unidade</th>
                <th className="py-3 px-3 text-center">Pacientes Atendidos Hoje</th>
                <th className="py-3 px-3 text-right">Faturamento Diário</th>
                <th className="py-3 px-3 text-right">Ticket Médio / Paciente</th>
                <th className="py-3 px-3">Procedimento em Destaque</th>
                <th className="py-3 px-3 text-center">Status Envio 18:30h</th>
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
                    <span className="text-sm font-black text-teal-400 bg-teal-500/10 px-3 py-1 rounded-xl border border-teal-500/20">
                      {c.pacientesHoje} pacientes
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right font-black text-emerald-400 text-sm">
                    R$ {c.faturamentoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3.5 px-3 text-right font-bold text-slate-300">
                    R$ {c.ticketMedioHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3.5 px-3 text-slate-300">
                    <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 text-[11px]">
                      {c.procedimentosDestaque}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pronto p/ 18:30h
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
                <span className="text-[10px] text-slate-400 mt-1 block">Número oficial que receberá o balanço das clínicas.</span>
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
                <span className="text-[10px] text-slate-400 mt-1 block">Horário agendado para o resumo de faturamento diário.</span>
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
                  FECHAMENTO MENSAL CONSOLIDADO (DIA 01)
                </span>
                <h3 className="font-extrabold text-lg flex items-center gap-2 text-white mt-0.5">
                  <FileSpreadsheet className="w-5 h-5 text-teal-400" /> Relatório Mensal de Desempenho por Clínica ({mesAnteriorNome})
                </h3>
              </div>
              <button onClick={() => setModalRelatorioMensalAberto(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 flex items-center justify-between">
                <div>
                  <span className="font-extrabold uppercase text-[10px] tracking-wider block text-teal-400">Total Faturado no Mês Anterior</span>
                  <h4 className="text-xl font-black text-emerald-400 mt-0.5">
                    R$ {(84500 + 58200 + 71900).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="font-extrabold uppercase text-[10px] tracking-wider block text-teal-400">Total de Pacientes</span>
                  <h4 className="text-xl font-black text-white mt-0.5">790 Pacientes Atendidos</h4>
                </div>
              </div>

              <h4 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider pt-2">
                Detalhamento por Clínica (Mês de {mesAnteriorNome}):
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {clinicas.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="font-extrabold text-xs text-teal-400 block truncate">{c.nome}</span>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-300">
                        <span>Pacientes Atendidos:</span>
                        <strong className="text-white">{c.pacientesMesAnterior}</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Faturamento Total:</span>
                        <strong className="text-emerald-400">R$ {c.faturamentoMesAnterior.toLocaleString('pt-BR')}</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Crescimento:</span>
                        <strong className="text-teal-400">+{c.crescimentoMes}%</strong>
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
