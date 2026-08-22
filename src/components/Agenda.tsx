import React, { useState } from 'react';
import type { Consulta, StatusConsulta, Paciente } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  CheckCircle,
  UserCheck,
  Play,
  Edit2,
  Trash2,
  Clock,
  User,
  X,
  Grid,
  List as ListIcon,
  CalendarDays,
  Sparkles,
  MessageCircle
} from 'lucide-react';

interface AgendaProps {
  consultas: Consulta[];
  pacientes: Paciente[];
  onAddConsulta: (nova: Omit<Consulta, 'id'>) => void;
  onEditConsulta: (consulta: Consulta) => void;
  onDeleteConsulta: (id: string) => void;
  onUpdateStatus: (id: string, novoStatus: StatusConsulta) => void;
  darkMode?: boolean;
}

type TipoVisualizacao = 'dia' | 'semana' | 'mes' | 'lista';

const statusCores: Record<StatusConsulta, { bg: string; text: string; border: string; badge: string; hex: string }> = {
  'Agendado': { bg: 'bg-sky-500/10 hover:bg-sky-500/20', text: 'text-sky-500', border: 'border-sky-500/30', badge: 'bg-sky-500/20 text-sky-400 border-sky-500/30', hex: '#0284C7' },
  'Confirmado': { bg: 'bg-teal-500/10 hover:bg-teal-500/20', text: 'text-teal-500', border: 'border-teal-500/30', badge: 'bg-teal-500/20 text-teal-400 border-teal-500/30', hex: '#0D9488' },
  'Em Atendimento': { bg: 'bg-amber-500/10 hover:bg-amber-500/20', text: 'text-amber-500', border: 'border-amber-500/30', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse', hex: '#D97706' },
  'Finalizado': { bg: 'bg-emerald-500/10 hover:bg-emerald-500/20', text: 'text-emerald-500', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', hex: '#059669' },
  'Cancelado': { bg: 'bg-rose-500/10 hover:bg-rose-500/20', text: 'text-rose-500', border: 'border-rose-500/30', badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30', hex: '#E11D48' },
};

const SALAS_CONSULTORIO = ['Todos', 'Consultório 1', 'Consultório 2', 'Consultório 3'];
const DENTISTAS_LISTA = [
  'Todos',
  'Dr. Carlos Eduardo (Implantodontia)',
  'Dra. Patricia Medeiros (Clínica Geral)',
  'Dr. Lucas Alencar (Ortodontia)'
];

const HORARIOS_DIA = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

export const Agenda: React.FC<AgendaProps> = ({
  consultas,
  pacientes,
  onAddConsulta,
  onEditConsulta,
  onDeleteConsulta,
  onUpdateStatus,
  darkMode
}) => {
  const [dataSelecionada, setDataSelecionada] = useState<string>('2026-08-21');
  const [visualizacao, setVisualizacao] = useState<TipoVisualizacao>('dia');
  const [filtroDentista, setFiltroDentista] = useState<string>('Todos');
  const [filtroSala, setFiltroSala] = useState<string>('Todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('Todos');
  const [busca, setBusca] = useState<string>('');

  // Modais State
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [consultaEditando, setConsultaEditando] = useState<Consulta | null>(null);
  const [consultaExcluindoId, setConsultaExcluindoId] = useState<string | null>(null);

  // Form State
  const [pacienteId, setPacienteId] = useState<string>('');
  const [dentistaNome, setDentistaNome] = useState<string>('Dra. Patricia Medeiros (Clínica Geral)');
  const [horaInicio, setHoraInicio] = useState<string>('09:00');
  const [duracaoMinutos, setDuracaoMinutos] = useState<number>(45);
  const [procedimento, setProcedimento] = useState<string>('Consulta Avaliação');
  const [sala, setSala] = useState<string>('Consultório 1');
  const [observacoes, setObservacoes] = useState<string>('');

  // Navegação de Datas
  const handleDataAnterior = () => {
    const d = new Date(dataSelecionada);
    d.setDate(d.getDate() - 1);
    setDataSelecionada(d.toISOString().split('T')[0]);
  };

  const handleProximaData = () => {
    const d = new Date(dataSelecionada);
    d.setDate(d.getDate() + 1);
    setDataSelecionada(d.toISOString().split('T')[0]);
  };

  const handleHoje = () => {
    setDataSelecionada('2026-08-21');
  };

  // Filtro de Consultas
  const consultasFiltradas = consultas.filter((c) => {
    const dataConsulta = c.dataHora.split('T')[0];
    const atendeData = visualizacao === 'dia' ? dataConsulta === dataSelecionada : true;
    const atendeDentista = filtroDentista === 'Todos' || c.dentistaNome.includes(filtroDentista);
    const atendeSala = filtroSala === 'Todos' || (c.sala && c.sala === filtroSala);
    const atendeStatus = filtroStatus === 'Todos' || c.status === filtroStatus;
    const atendeBusca =
      c.pacienteNome.toLowerCase().includes(busca.toLowerCase()) ||
      c.procedimento.toLowerCase().includes(busca.toLowerCase());

    return atendeData && atendeDentista && atendeSala && atendeStatus && atendeBusca;
  });

  // KPIs Resumo do Dia
  const totalDia = consultas.filter((c) => c.dataHora.split('T')[0] === dataSelecionada).length;
  const confirmadosDia = consultas.filter((c) => c.dataHora.split('T')[0] === dataSelecionada && c.status === 'Confirmado').length;
  const atendimentoDia = consultas.filter((c) => c.dataHora.split('T')[0] === dataSelecionada && c.status === 'Em Atendimento').length;
  const finalizadosDia = consultas.filter((c) => c.dataHora.split('T')[0] === dataSelecionada && c.status === 'Finalizado').length;

  const handleAbrirNovoModal = (horarioPref = '09:00', salaPref = 'Consultório 1') => {
    setConsultaEditando(null);
    setPacienteId(pacientes[0]?.id || '');
    setDentistaNome('Dra. Patricia Medeiros (Clínica Geral)');
    setHoraInicio(horarioPref);
    setDuracaoMinutos(45);
    setProcedimento('Consulta Avaliação');
    setSala(salaPref);
    setObservacoes('');
    setModalAberto(true);
  };

  const handleAbrirEditarModal = (consulta: Consulta) => {
    setConsultaEditando(consulta);
    setPacienteId(consulta.pacienteId);
    setDentistaNome(consulta.dentistaNome);
    const hora = consulta.dataHora.includes('T') ? consulta.dataHora.split('T')[1].substring(0, 5) : '09:00';
    setHoraInicio(hora);
    setDuracaoMinutos(consulta.duracaoMinutos);
    setProcedimento(consulta.procedimento);
    setSala(consulta.sala || 'Consultório 1');
    setObservacoes(consulta.observacoes || '');
    setModalAberto(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const pac = pacientes.find((p) => p.id === pacienteId) || {
      nome: 'Paciente Avulso',
      telefone: '(11) 99887-6655'
    };

    const dataHoraIso = `${dataSelecionada}T${horaInicio}:00`;

    if (consultaEditando) {
      onEditConsulta({
        ...consultaEditando,
        pacienteId: pacienteId || 'pac-temp',
        pacienteNome: pac.nome,
        pacienteTelefone: pac.telefone,
        dentistaNome,
        dataHora: dataHoraIso,
        duracaoMinutos,
        procedimento,
        sala,
        observacoes
      });
    } else {
      onAddConsulta({
        pacienteId: pacienteId || 'pac-temp',
        pacienteNome: pac.nome,
        pacienteTelefone: pac.telefone,
        dentistaNome,
        dataHora: dataHoraIso,
        duracaoMinutos,
        procedimento,
        status: 'Agendado',
        sala,
        observacoes
      });
    }
    setModalAberto(false);
  };

  // Formatador de Data por Extenso (ex: "Sexta-feira, 21 de Agosto de 2026")
  const formatarDataPorExtenso = (dataIso: string) => {
    const partes = dataIso.split('-');
    if (partes.length !== 3) return dataIso;
    const date = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
    const semana = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    const dia = date.getDate();
    const mes = date.toLocaleDateString('pt-BR', { month: 'long' });
    const ano = date.getFullYear();
    const semanaCap = semana.charAt(0).toUpperCase() + semana.slice(1);
    const mesCap = mes.charAt(0).toUpperCase() + mes.slice(1);
    return `${semanaCap}, ${dia} de ${mesCap} de ${ano}`;
  };

  return (
    <div className="w-full max-w-full space-y-6">
      {/* 1. TOP HEADER & AGENDA CONTROLS ON-DOCTOR STYLE */}
      <div className={`p-4 sm:p-6 lg:p-8 rounded-3xl border shadow-xl space-y-6 w-full ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>

        {/* Linha 1: Título + Seleção de Data + Botão Novo Agendamento */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/10 text-teal-500 rounded-2xl border border-teal-500/20 shadow-sm">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md">
                Gestão Clínico-Odontológica Ondoctor 2026
              </span>
              <h2 className="text-xl font-extrabold mt-0.5">Agenda & Grade de Consultas</h2>
            </div>
          </div>

          {/* Navegação de Datas com Mini-Picker */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/40 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={handleDataAnterior}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Dia Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleHoje}
              className="px-3 py-1.5 rounded-xl bg-teal-600/20 text-teal-300 border border-teal-500/30 text-xs font-extrabold hover:bg-teal-600 hover:text-white transition-all cursor-pointer"
            >
              Hoje
            </button>

            <input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              className={`p-1.5 rounded-xl border text-xs font-extrabold ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            />

            <button
              onClick={handleProximaData}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Próximo Dia"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <span className="hidden sm:inline text-xs font-extrabold text-teal-400 px-3 border-l border-slate-800">
              {formatarDataPorExtenso(dataSelecionada)}
            </span>
          </div>

          {/* Botão Novo Agendamento */}
          <button
            onClick={() => handleAbrirNovoModal()}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-teal-600/25 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4.5 h-4.5" /> + Agendar Consulta
          </button>
        </div>

        {/* Linha 2: Tabs de Visualização (Dia, Semana, Mês, Lista) + Filtros */}
        <div className="pt-4 border-t border-slate-800/40 flex flex-wrap items-center justify-between gap-4">

          {/* Selector Tabs (Dia, Semana, Mês, Lista) */}
          <div className="flex items-center gap-1 bg-slate-950/50 p-1 rounded-2xl border border-slate-800">
            {[
              { id: 'dia', label: 'Dia (Cadeiras)', icon: Grid },
              { id: 'semana', label: 'Semana (7 Dias)', icon: CalendarDays },
              { id: 'mes', label: 'Mês', icon: CalendarIcon },
              { id: 'lista', label: 'Lista / Prontuário', icon: ListIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setVisualizacao(tab.id as TipoVisualizacao)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  visualizacao === tab.id
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Filtros Rápidos (Dentista, Consultório, Status, Busca) */}
          <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
            {/* Filtro Dentista */}
            <select
              value={filtroDentista}
              onChange={(e) => setFiltroDentista(e.target.value)}
              className={`p-2.5 rounded-xl border text-xs font-bold flex-1 sm:flex-none min-w-[140px] ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              {DENTISTAS_LISTA.map((d) => (
                <option key={d} value={d === 'Todos' ? 'Todos' : d.split(' ')[1]}>{d}</option>
              ))}
            </select>

            {/* Filtro Sala / Consultório */}
            <select
              value={filtroSala}
              onChange={(e) => setFiltroSala(e.target.value)}
              className={`p-2.5 rounded-xl border text-xs font-bold flex-1 sm:flex-none min-w-[130px] ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              {SALAS_CONSULTORIO.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Filtro Status */}
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className={`p-2.5 rounded-xl border text-xs font-bold flex-1 sm:flex-none min-w-[130px] ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="Todos">Todos os Status</option>
              <option value="Agendado">Agendado</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Em Atendimento">Em Atendimento</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Cancelado">Cancelado</option>
            </select>

            {/* Campo Busca */}
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar paciente ou procedimento..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-medium ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>

        </div>

      </div>

      {/* 2. SUMMARY CARDS KPIS DO DIA */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Hoje</span>
            <h4 className="text-xl font-extrabold text-sky-400 mt-0.5">{totalDia} Consultas</h4>
          </div>
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Confirmados</span>
            <h4 className="text-xl font-extrabold text-teal-400 mt-0.5">{confirmadosDia} Pacientes</h4>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Em Atendimento</span>
            <h4 className="text-xl font-extrabold text-amber-400 mt-0.5">{atendimentoDia} Na Cadeira</h4>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 animate-pulse">
            <Play className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Finalizados</span>
            <h4 className="text-xl font-extrabold text-emerald-400 mt-0.5">{finalizadosDia} Concluídos</h4>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. CONTEÚDO PRINCIPAL DA AGENDA POR TIPO DE VISUALIZAÇÃO */}

      {/* A) VISUALIZAÇÃO POR DIA (Grade Diária por Cadeira / Consultório) */}
      {visualizacao === 'dia' && (
        <div className={`p-4 sm:p-6 lg:p-8 rounded-3xl border shadow-xl overflow-x-auto w-full ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          
          {/* Header das Cadeiras / Consultórios */}
          <div className="grid grid-cols-4 gap-4 min-w-[700px] w-full border-b border-slate-800/60 pb-3 font-extrabold text-xs">
            <div className="text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-400" /> Horário
            </div>
            {['Consultório 1 (Maxila)', 'Consultório 2 (Implantes)', 'Consultório 3 (Ortodontia)'].map((salaNome, idx) => (
              <div key={idx} className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-teal-400 flex items-center justify-between font-bold">
                <span>{salaNome}</span>
                <span className="text-[10px] bg-teal-500/20 px-2 py-0.5 rounded-full text-teal-300">Livre</span>
              </div>
            ))}
          </div>

          {/* Slots Horários x Cadeiras */}
          <div className="space-y-3 pt-3 min-w-[700px] w-full">
            {HORARIOS_DIA.map((horaSlot) => {
              // Consultas que caem neste horário
              const consultasHora = consultasFiltradas.filter((c) => {
                const h = c.dataHora.includes('T') ? c.dataHora.split('T')[1].substring(0, 5) : '09:00';
                return h.substring(0, 2) === horaSlot.substring(0, 2);
              });

              return (
                <div key={horaSlot} className="grid grid-cols-4 gap-4 items-stretch border-b border-slate-800/20 pb-3 min-h-[85px]">
                  
                  {/* Coluna 1: Hora */}
                  <div className="flex flex-col justify-start pt-1 font-extrabold text-sm text-slate-400">
                    <span>{horaSlot}</span>
                    <span className="text-[10px] text-slate-400 font-normal">00 min</span>
                  </div>

                  {/* Colunas 2, 3 e 4: Consultórios 1, 2 e 3 */}
                  {['Consultório 1', 'Consultório 2', 'Consultório 3'].map((salaNome) => {
                    const cNaSala = consultasHora.find((c) => (c.sala || 'Consultório 1').includes(salaNome));

                    if (cNaSala) {
                      const corStatus = statusCores[cNaSala.status] || statusCores['Agendado'];

                      return (
                        <div
                          key={cNaSala.id}
                          className={`p-3 rounded-2xl border-2 transition-all shadow-lg flex flex-col justify-between relative group ${corStatus.bg} ${corStatus.border}`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${corStatus.badge}`}>
                                {cNaSala.status}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-teal-400" /> {cNaSala.duracaoMinutos} min
                              </span>
                            </div>

                            <h4 className="font-extrabold text-sm text-white truncate flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-teal-400" /> {cNaSala.pacienteNome}
                            </h4>

                            <p className="text-xs font-bold text-teal-300 truncate mt-0.5">
                              {cNaSala.procedimento}
                            </p>

                            <p className="text-[11px] text-slate-400 truncate">
                              {cNaSala.dentistaNome}
                            </p>
                          </div>

                          {/* Quick Controls no Card */}
                          <div className="pt-2 border-t border-slate-800/30 flex items-center justify-between gap-1 text-[11px]">
                            {/* Dropdown Mudança de Status */}
                            <select
                              value={cNaSala.status}
                              onChange={(e) => onUpdateStatus(cNaSala.id, e.target.value as StatusConsulta)}
                              className="bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-bold rounded-lg p-1 cursor-pointer"
                            >
                              <option value="Agendado">Agendado</option>
                              <option value="Confirmado">Confirmado</option>
                              <option value="Em Atendimento">Em Atendimento</option>
                              <option value="Finalizado">Finalizado</option>
                              <option value="Cancelado">Cancelado</option>
                            </select>

                            <div className="flex items-center gap-1">
                              {/* WhatsApp Link */}
                              <a
                                href={`https://wa.me/55${cNaSala.pacienteTelefone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                                title="Enviar Mensagem no WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>

                              <button
                                onClick={() => handleAbrirEditarModal(cNaSala)}
                                className="p-1 text-sky-400 hover:bg-sky-500/20 rounded-lg transition-colors cursor-pointer"
                                title="Editar Agendamento"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setConsultaExcluindoId(cNaSala.id)}
                                className="p-1 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
                                title="Excluir Agendamento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Slot Vazio para clicar e agendar
                    return (
                      <button
                        key={salaNome}
                        onClick={() => handleAbrirNovoModal(horaSlot, salaNome)}
                        className="rounded-2xl border-2 border-dashed border-slate-800 hover:border-teal-500/50 hover:bg-teal-500/5 p-3 flex items-center justify-center text-slate-400 hover:text-teal-400 text-xs font-bold transition-all cursor-pointer group"
                      >
                        <span className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                          <Plus className="w-4 h-4" /> Agendar {horaSlot}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* B) VISUALIZAÇÃO POR SEMANA */}
      {visualizacao === 'semana' && (
        <div className={`p-4 sm:p-6 lg:p-8 rounded-3xl border shadow-xl overflow-x-auto w-full ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="grid grid-cols-7 gap-3 min-w-[850px] w-full">
            {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((diaNome, idx) => {
              const consultasDoDia = consultas.filter((c) => {
                const diaIdx = new Date(c.dataHora.split('T')[0]).getDay();
                return diaIdx === (idx + 1) % 7;
              });

              return (
                <div key={diaNome} className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-3 min-h-[420px]">
                  <div className="border-b border-slate-800 pb-2 text-center">
                    <span className="font-extrabold text-xs text-teal-400">{diaNome}</span>
                    <p className="text-[10px] text-slate-400">{consultasDoDia.length} consulta(s)</p>
                  </div>

                  <div className="space-y-2">
                    {consultasDoDia.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleAbrirEditarModal(c)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer hover:scale-102 ${statusCores[c.status].bg} ${statusCores[c.status].border}`}
                      >
                        <div className="text-[10px] text-teal-300">{c.dataHora.split('T')[1]?.substring(0, 5)}</div>
                        <div className="truncate text-white">{c.pacienteNome}</div>
                        <div className="text-[10px] text-slate-400 truncate">{c.procedimento}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* C) VISUALIZAÇÃO POR MÊS */}
      {visualizacao === 'mes' && (
        <div className={`p-4 sm:p-6 lg:p-8 rounded-3xl border shadow-xl w-full ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold text-teal-400 mb-3">
            <span>DOM</span><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span>
          </div>

          <div className="grid grid-cols-7 gap-2.5">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((diaNum) => {
              const dataStr = `2026-08-${diaNum < 10 ? '0' + diaNum : diaNum}`;
              const countDia = consultas.filter((c) => c.dataHora.split('T')[0] === dataStr).length;
              const isSelected = dataSelecionada === dataStr;

              return (
                <button
                  key={diaNum}
                  onClick={() => {
                    setDataSelecionada(dataStr);
                    setVisualizacao('dia');
                  }}
                  className={`min-h-[85px] sm:min-h-[100px] p-2.5 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-400 ring-2 ring-teal-400'
                      : darkMode
                      ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-extrabold text-xs">{diaNum}</span>
                  {countDia > 0 && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      {countDia} agend.
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* D) VISUALIZAÇÃO EM LISTA / PRONTUÁRIO */}
      {visualizacao === 'lista' && (
        <div className={`p-4 sm:p-6 lg:p-8 rounded-3xl border shadow-xl w-full ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-extrabold uppercase">
                  <th className="p-3">Horário / Data</th>
                  <th className="p-3">Paciente</th>
                  <th className="p-3">Procedimento</th>
                  <th className="p-3">Dentista</th>
                  <th className="p-3">Consultório</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {consultasFiltradas.map((c) => {
                  const cor = statusCores[c.status];
                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors font-medium">
                      <td className="p-3 font-extrabold text-teal-400">
                        {c.dataHora.replace('T', ' ')}
                      </td>
                      <td className="p-3 font-bold text-white">
                        {c.pacienteNome}
                        <div className="text-[10px] text-slate-400">{c.pacienteTelefone}</div>
                      </td>
                      <td className="p-3">{c.procedimento}</td>
                      <td className="p-3 text-slate-300">{c.dentistaNome}</td>
                      <td className="p-3 text-slate-400">{c.sala || 'Consultório 1'}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-extrabold ${cor.badge}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAbrirEditarModal(c)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConsultaExcluindoId(c.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* MODAL DE AGENDAMENTO (NOVO / EDITAR) */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`rounded-3xl p-6 max-w-lg w-full shadow-2xl border space-y-4 my-8 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                {consultaEditando ? 'Editar Agendamento de Consulta' : 'Novo Agendamento Odontológico'}
              </h3>
              <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Selecione o Paciente</label>
                <select
                  value={pacienteId}
                  onChange={(e) => setPacienteId(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome} ({p.telefone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Dentista Responsável</label>
                  <select
                    value={dentistaNome}
                    onChange={(e) => setDentistaNome(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="Dra. Patricia Medeiros (Clínica Geral)">Dra. Patricia Medeiros</option>
                    <option value="Dr. Carlos Eduardo (Implantodontia)">Dr. Carlos Eduardo</option>
                    <option value="Dr. Lucas Alencar (Ortodontia)">Dr. Lucas Alencar</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Consultório / Sala</label>
                  <select
                    value={sala}
                    onChange={(e) => setSala(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="Consultório 1">Consultório 1</option>
                    <option value="Consultório 2">Consultório 2</option>
                    <option value="Consultório 3">Consultório 3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Horário de Início</label>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    required
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Duração Estimada</label>
                  <select
                    value={duracaoMinutos}
                    onChange={(e) => setDuracaoMinutos(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos (1h)</option>
                    <option value={90}>90 minutos (1h30)</option>
                    <option value={120}>120 minutos (2h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Procedimento Odontológico</label>
                <input
                  type="text"
                  placeholder="Ex: Consulta Avaliação, Profilaxia, Canal, Implante..."
                  value={procedimento}
                  onChange={(e) => setProcedimento(e.target.value)}
                  required
                  className={`w-full p-2.5 rounded-xl border ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Observações do Agendamento</label>
                <textarea
                  rows={2}
                  placeholder="Anotações para a recepcionista ou dentista..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-extrabold rounded-xl shadow-lg shadow-teal-600/30 cursor-pointer"
                >
                  {consultaEditando ? 'Salvar Alterações' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE CONSULTA */}
      {consultaExcluindoId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-3xl p-6 max-w-md w-full shadow-2xl border space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">Cancelar Agendamento</h3>
                <p className="text-xs text-slate-400">Esta consulta será removida da grade de horários.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-800/50 p-3 rounded-2xl border border-slate-700">
              Tem certeza que deseja desmarcar e excluir esta consulta da agenda?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConsultaExcluindoId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
              >
                Manter Agendamento
              </button>

              <button
                type="button"
                onClick={() => {
                  onDeleteConsulta(consultaExcluindoId);
                  setConsultaExcluindoId(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Sim, Excluir Consulta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
