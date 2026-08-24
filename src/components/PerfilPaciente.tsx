import React, { useState } from 'react';
import type {
  Paciente,
  Consulta,
  ProcedimentoTratamento,
  DenteInfo,
  StatusDente,
  AnamneseDetalhada,
  RadiografiaExame,
  FotografiaClinica,
  HistoricoTimeline
} from '../types';

import { AnamneseView } from './AnamneseView';
import { Odontograma } from './Odontograma';
import { RadiografiaViewer } from './RadiografiaViewer';
import { FotografiasGaleria } from './FotografiasGaleria';

import {
  User,
  Phone,
  Mail,
  Calendar,
  ShieldAlert,
  Sparkles,
  FileText,
  ImageIcon,
  Camera,
  Wrench,
  Clock,
  ArrowLeft,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  BookOpen,
  X,
  Edit2,
  RotateCcw
} from 'lucide-react';

interface PerfilPacienteProps {
  paciente: Paciente;
  consultas: Consulta[];
  procedimentos: ProcedimentoTratamento[];
  dentes: Record<number, DenteInfo>;
  onUpdateDente: (numero: number, status: StatusDente, observacoes?: string) => void;
  anamnese: AnamneseDetalhada;
  radiografias: RadiografiaExame[];
  fotografias: FotografiaClinica[];
  timeline: HistoricoTimeline[];
  onVoltar: () => void;
  onAddRadiografia?: (novo: Omit<RadiografiaExame, 'id'>) => void;
  onDeleteRadiografia?: (id: string) => void;
  onAddFotografia?: (nova: Omit<FotografiaClinica, 'id'>) => void;
  onDeleteFotografia?: (id: string) => void;
  darkMode?: boolean;
}

export interface ProcedimentoCatalogo {
  id: string;
  nome: string;
  categoria: string;
  valorPadrao: number;
  duracaoMinutos: number;
}

// CATÁLOGO COMPLETO DE PROCEDIMENTOS ODONTOLÓGICOS ORDENADO EM ORDEM ALFABÉTICA (A-Z)
export const CATALOGO_PROCEDIMENTOS_ODONTO: ProcedimentoCatalogo[] = [
  { id: 'cat-1', nome: 'Ajuste Oclusal por Desgaste Seletivo', categoria: 'Ortodontia / Oclusão', valorPadrao: 220, duracaoMinutos: 30 },
  { id: 'cat-2', nome: 'Aparelho Ortodôntico Fixo Autoligado (Instalação)', categoria: 'Ortodontia', valorPadrao: 1500, duracaoMinutos: 60 },
  { id: 'cat-3', nome: 'Aparelho Ortodôntico Estético de Safira', categoria: 'Ortodontia', valorPadrao: 2200, duracaoMinutos: 60 },
  { id: 'cat-4', nome: 'Aplicação Tópica de Flúor (Fluroroterapia)', categoria: 'Prevenção', valorPadrao: 120, duracaoMinutos: 20 },
  { id: 'cat-5', nome: 'Aumento de Coroa Clínica (Cirurgia Gengival)', categoria: 'Periodontia / Cirurgia', valorPadrao: 550, duracaoMinutos: 45 },
  { id: 'cat-6', nome: 'Apinamento / Contenção Ortodôntica Fixa', categoria: 'Ortodontia', valorPadrao: 350, duracaoMinutos: 30 },
  { id: 'cat-7', nome: 'Biópsia de Cavidade Oral', categoria: 'Estomatologia / Cirurgia', valorPadrao: 480, duracaoMinutos: 40 },
  { id: 'cat-8', nome: 'Cirurgia de Terceiro Molar (Siso Incluso/Impactado)', categoria: 'Cirurgia Bucomaxilofacial', valorPadrao: 750, duracaoMinutos: 60 },
  { id: 'cat-9', nome: 'Clareamento Dental Caseiro com Moldeira', categoria: 'Dentística Estética', valorPadrao: 650, duracaoMinutos: 30 },
  { id: 'cat-10', nome: 'Clareamento Dental a Laser / LED em Consultório', categoria: 'Dentística Estética', valorPadrao: 1100, duracaoMinutos: 60 },
  { id: 'cat-11', nome: 'Coroa Total em Cerâmica Pure Zircônia', categoria: 'Prótese Dentária', valorPadrao: 1800, duracaoMinutos: 60 },
  { id: 'cat-12', nome: 'Coroa Metalocerâmica sobre Dente', categoria: 'Prótese Dentária', valorPadrao: 1200, duracaoMinutos: 60 },
  { id: 'cat-13', nome: 'Coroa de Cerâmica sobre Implante', categoria: 'Prótese / Implantodontia', valorPadrao: 1950, duracaoMinutos: 60 },
  { id: 'cat-14', nome: 'Curativo de Demora / Alívio da Dor Endodôntica', categoria: 'Endodontia', valorPadrao: 180, duracaoMinutos: 30 },
  { id: 'cat-15', nome: 'Dermabrasão / Plastia Gengival (Gengivoplastia)', categoria: 'Periodontia Estética', valorPadrao: 680, duracaoMinutos: 45 },
  { id: 'cat-16', nome: 'Enxerto Ósseo Liofilizado (Por Elemento)', categoria: 'Implantodontia / Cirurgia', valorPadrao: 1400, duracaoMinutos: 60 },
  { id: 'cat-17', nome: 'Enxerto Gengival Livre / Conjuntivo', categoria: 'Periodontia / Cirurgia', valorPadrao: 950, duracaoMinutos: 60 },
  { id: 'cat-18', nome: 'Exodontia Simples de Dente Permanente', categoria: 'Cirurgia', valorPadrao: 280, duracaoMinutos: 30 },
  { id: 'cat-19', nome: 'Exodontia de Dente Decíduo (Infantil)', categoria: 'Odontopediatria', valorPadrao: 180, duracaoMinutos: 20 },
  { id: 'cat-20', nome: 'Facetas de Resina Composta Direta', categoria: 'Dentística Estética', valorPadrao: 650, duracaoMinutos: 45 },
  { id: 'cat-21', nome: 'Frenectomia Labial ou Lingual', categoria: 'Cirurgia', valorPadrao: 450, duracaoMinutos: 30 },
  { id: 'cat-22', nome: 'Implante Dental de Titânio Osseointegrado', categoria: 'Implantodontia', valorPadrao: 2200, duracaoMinutos: 60 },
  { id: 'cat-23', nome: 'Inlay / Onlay em Porcelana ou Resina', categoria: 'Prótese / Dentística', valorPadrao: 980, duracaoMinutos: 45 },
  { id: 'cat-24', nome: 'Lentes de Contato de Porcelana (Por Elemento)', categoria: 'Dentística Estética', valorPadrao: 2400, duracaoMinutos: 60 },
  { id: 'cat-25', nome: 'Manutenção Mensal de Aparelho Ortodôntico', categoria: 'Ortodontia', valorPadrao: 180, duracaoMinutos: 30 },
  { id: 'cat-26', nome: 'Núcleo Metálico Fundido ou Fibra de Vidro', categoria: 'Prótese Dentária', valorPadrao: 380, duracaoMinutos: 30 },
  { id: 'cat-27', nome: 'Placa Miorrelaxante para Bruxismo (Acrílico)', categoria: 'Prótese / DTM', valorPadrao: 550, duracaoMinutos: 30 },
  { id: 'cat-28', nome: 'Profilaxia Completa com Jato de Bicarbonato', categoria: 'Prevenção / Higiene', valorPadrao: 220, duracaoMinutos: 45 },
  { id: 'cat-29', nome: 'Prótese Total Removível (Dentadura Superior/Inferior)', categoria: 'Prótese Dentária', valorPadrao: 1600, duracaoMinutos: 60 },
  { id: 'cat-30', nome: 'Prótese Parcial Removível (Roach)', categoria: 'Prótese Dentária', valorPadrao: 1400, duracaoMinutos: 60 },
  { id: 'cat-31', nome: 'Prótese Protocolo sobre Implantes', categoria: 'Implantodontia / Prótese', valorPadrao: 7500, duracaoMinutos: 90 },
  { id: 'cat-32', nome: 'Raspagem Subgengival e Alisamento Radicular', categoria: 'Periodontia', valorPadrao: 320, duracaoMinutos: 45 },
  { id: 'cat-33', nome: 'Raspagem Supragengival de Tártaro (Tartarectomia)', categoria: 'Periodontia', valorPadrao: 240, duracaoMinutos: 30 },
  { id: 'cat-34', nome: 'Restauração de Resina Fotopolimerizável (1 Face)', categoria: 'Dentística Restauradora', valorPadrao: 190, duracaoMinutos: 30 },
  { id: 'cat-35', nome: 'Restauração de Resina Fotopolimerizável (2 Faces)', categoria: 'Dentística Restauradora', valorPadrao: 240, duracaoMinutos: 40 },
  { id: 'cat-36', nome: 'Restauração de Resina Fotopolimerizável (3 ou + Faces)', categoria: 'Dentística Restauradora', valorPadrao: 290, duracaoMinutos: 45 },
  { id: 'cat-37', nome: 'Selante de Fóssulas e Fissuras (Por Dente)', categoria: 'Odontopediatria / Prevenção', valorPadrao: 110, duracaoMinutos: 20 },
  { id: 'cat-38', nome: 'Sinus Lift (Levantamento de Seio Maxilar)', categoria: 'Implantodontia / Cirurgia', valorPadrao: 2800, duracaoMinutos: 90 },
  { id: 'cat-39', nome: 'Tratamento Endodôntico Unirradicular (1 Canal)', categoria: 'Endodontia', valorPadrao: 550, duracaoMinutos: 60 },
  { id: 'cat-40', nome: 'Tratamento Endodôntico Birradicular (2 Canais)', categoria: 'Endodontia', valorPadrao: 720, duracaoMinutos: 60 },
  { id: 'cat-41', nome: 'Tratamento Endodôntico Multirradicular (Molares)', categoria: 'Endodontia', valorPadrao: 950, duracaoMinutos: 90 },
  { id: 'cat-42', nome: 'Retratamento Endodôntico (Por Canal)', categoria: 'Endodontia', valorPadrao: 780, duracaoMinutos: 60 }
].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

export const PerfilPaciente: React.FC<PerfilPacienteProps> = ({
  paciente,
  consultas,
  procedimentos,
  dentes,
  onUpdateDente,
  anamnese,
  radiografias,
  fotografias,
  timeline,
  onVoltar,
  onAddRadiografia,
  onDeleteRadiografia,
  onAddFotografia,
  onDeleteFotografia,
  darkMode
}) => {
  const [abaAtiva, setAbaAtiva] = useState<string>('visaogeral');

  // Procedimentos do Paciente
  const [procedimentosPaciente, setProcedimentosPaciente] = useState<ProcedimentoTratamento[]>(
    procedimentos.filter((p) => p.pacienteId === paciente.id)
  );

  // Filtro do Catálogo Alfabético
  const [buscaCatalogo, setBuscaCatalogo] = useState<string>('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas');
  const [letraFiltro, setLetraFiltro] = useState<string>('Todas');

  // Persistência dos Valores Customizados do Catálogo
  const CATALOGO_PRECOS_KEY = 'odonto_catalogo_valores_custom_v1';
  const [valoresCustom, setValoresCustom] = useState<Record<string, number>>(() => {
    const salvo = localStorage.getItem(CATALOGO_PRECOS_KEY);
    if (salvo) {
      try {
        return JSON.parse(salvo);
      } catch (e) {
        console.error('Erro ao restaurar valores do catálogo:', e);
      }
    }
    return {};
  });

  const [itemEditandoValor, setItemEditandoValor] = useState<ProcedimentoCatalogo | null>(null);
  const [novoValorCatalogoInput, setNovoValorCatalogoInput] = useState<string>('');

  const getValorItemCatalogo = (item: ProcedimentoCatalogo) => {
    return valoresCustom[item.id] !== undefined ? valoresCustom[item.id] : item.valorPadrao;
  };

  const handleSalvarValorCatalogo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemEditandoValor) return;
    const valorNum = parseFloat(novoValorCatalogoInput.replace(',', '.'));
    if (isNaN(valorNum) || valorNum < 0) return;

    const novosValores = { ...valoresCustom, [itemEditandoValor.id]: valorNum };
    setValoresCustom(novosValores);
    localStorage.setItem(CATALOGO_PRECOS_KEY, JSON.stringify(novosValores));
    setItemEditandoValor(null);
  };

  const handleResetValoresCatalogo = () => {
    if (window.confirm('Deseja restaurar todos os valores sugeridos do catálogo para a tabela padrão original?')) {
      setValoresCustom({});
      localStorage.removeItem(CATALOGO_PRECOS_KEY);
    }
  };

  const [modalProcAberto, setModalProcAberto] = useState<boolean>(false);
  const [procNomeInput, setProcNomeInput] = useState<string>('');
  const [denteNumInput, setDenteNumInput] = useState<string>('');
  const [valorInput, setValorInput] = useState<number>(250);
  const [statusInput, setStatusInput] = useState<'Planejado' | 'Em Andamento' | 'Concluído'>('Planejado');

  const handleAdicionarProcedimentoCat = (item: ProcedimentoCatalogo) => {
    setProcNomeInput(item.nome);
    setValorInput(getValorItemCatalogo(item));
    setModalProcAberto(true);
  };

  const abas = [
    { id: 'visaogeral', label: 'Visão Geral', icon: User },
    { id: 'tratamentos', label: 'Plano de Tratamentos', icon: Wrench },
    { id: 'atendimento', label: 'Atendimentos', icon: Calendar },
    { id: 'anamnese', label: 'Anamnese', icon: FileText },
    { id: 'odontograma', label: 'Odontograma', icon: Sparkles },
    { id: 'radiografias', label: 'Radiografias', icon: ImageIcon },
    { id: 'fotografias', label: 'Fotografias', icon: Camera },
    { id: 'historico', label: 'Linha do Tempo', icon: Clock }
  ];

  const consultasPaciente = consultas.filter((c) => c.pacienteId === paciente.id);
  // Lista de Categorias Únicas do Catálogo
  const categoriasDisponiveis = ['Todas', ...Array.from(new Set(CATALOGO_PROCEDIMENTOS_ODONTO.map((c) => c.categoria)))];

  // Lista de Letras Únicas para Filtro Alfabético
  const letrasDisponiveis = ['Todas', ...Array.from(new Set(CATALOGO_PROCEDIMENTOS_ODONTO.map((c) => c.nome.charAt(0).toUpperCase()))).sort()];

  // Catálogo Filtrado Alfabeticamente
  const catalogoFiltrado = CATALOGO_PROCEDIMENTOS_ODONTO.filter((item) => {
    const atendeBusca = item.nome.toLowerCase().includes(buscaCatalogo.toLowerCase()) ||
      item.categoria.toLowerCase().includes(buscaCatalogo.toLowerCase());
    const atendeCat = categoriaFiltro === 'Todas' || item.categoria === categoriaFiltro;
    const atendeLetra = letraFiltro === 'Todas' || item.nome.charAt(0).toUpperCase() === letraFiltro;
    return atendeBusca && atendeCat && atendeLetra;
  });

  const handleSalvarNovoProcedimento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!procNomeInput) return;

    const novo: ProcedimentoTratamento = {
      id: `proc-${Date.now()}`,
      pacienteId: paciente.id,
      descricao: procNomeInput,
      denteNumero: denteNumInput ? Number(denteNumInput) : undefined,
      valor: valorInput,
      status: statusInput,
      dataCriacao: new Date().toLocaleDateString('pt-BR')
    };

    setProcedimentosPaciente((prev) => [novo, ...prev]);
    setModalProcAberto(false);
    setProcNomeInput('');
    setDenteNumInput('');
  };

  const handleDeleteProcedimento = (id: string) => {
    setProcedimentosPaciente((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateStatusProc = (id: string, novoStatus: 'Planejado' | 'Em Andamento' | 'Concluído') => {
    setProcedimentosPaciente((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: novoStatus } : p))
    );
  };

  const valorTotalOrcamento = procedimentosPaciente.reduce((acc, p) => acc + p.valor, 0);
  const valorConcluido = procedimentosPaciente.filter((p) => p.status === 'Concluído').reduce((acc, p) => acc + p.valor, 0);

  return (
    <div className="space-y-6">
      {/* Botão de Voltar para Lista */}
      <button
        onClick={onVoltar}
        className={`flex items-center gap-2 text-xs font-bold transition-colors cursor-pointer ${
          darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Lista de Pacientes
      </button>

      {/* Card Superior do Paciente */}
      <div className={`p-6 rounded-3xl border shadow-xl relative overflow-hidden ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

          <div className="flex items-center gap-5">
            {paciente.fotoUrl ? (
              <img
                src={paciente.fotoUrl}
                alt={paciente.nome}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-500 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center font-extrabold text-white text-2xl border-2 border-teal-500 shadow-md shrink-0">
                {paciente.nome ? (paciente.nome.trim().split(' ').length === 1 ? paciente.nome.slice(0, 2).toUpperCase() : (paciente.nome.trim().split(' ')[0][0] + paciente.nome.trim().split(' ')[paciente.nome.trim().split(' ').length - 1][0]).toUpperCase()) : 'P'}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold">{paciente.nome}</h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-400 border border-teal-300 dark:border-teal-800">
                  {paciente.convenio || 'Particular'}
                </span>
              </div>

              <p className="text-xs text-slate-400">
                CPF: {paciente.cpf} • Nasc: {paciente.dataNascimento} • Profissão: {paciente.profissao || 'Não informada'}
              </p>

              <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-teal-500" /> {paciente.telefone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-teal-500" /> {paciente.email}
                </span>
              </div>
            </div>
          </div>

          {/* Card de Próxima Consulta / Atendimento */}
          <div className={`p-4 rounded-2xl border text-xs space-y-1 min-w-[220px] ${
            darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-500">Próxima Consulta</span>
            <p className="font-bold text-sm">{paciente.proximaconsulta || '2026-08-21 09:00'}</p>
            <p className="text-slate-400 text-[11px]">Última consulta: {paciente.ultimoconsulta || '2026-08-10'}</p>
          </div>

        </div>

        {/* Alerta de Alergias */}
        {paciente.alergias && paciente.alergias.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-800 dark:text-rose-300 font-bold">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>ALERGIAS CADASTRADAS: {paciente.alergias.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Navegação por Abas do Prontuário */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800/20 dark:border-slate-800">
        {abas.map((aba) => {
          const Icon = aba.icon;
          const isActive = abaAtiva === aba.id;
          return (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`flex items-center gap-2 px-4 py-3 font-bold text-xs rounded-t-2xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/30'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {aba.label}
            </button>
          );
        })}
      </div>

      {/* Conteúdo das Abas */}
      <div className="pt-2">

        {/* 1. Visão Geral */}
        {abaAtiva === 'visaogeral' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Coluna 1 e 2: Resumo Clínico e Tratamentos Ativos */}
            <div className="lg:col-span-2 space-y-6">
              <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-teal-500" /> Planos de Tratamento em Andamento
                  </h3>
                  <button
                    onClick={() => setAbaAtiva('tratamentos')}
                    className="text-xs font-bold text-teal-500 hover:text-teal-400"
                  >
                    Ver Catálogo A-Z & Adicionar →
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {procedimentosPaciente.map((proc) => (
                    <div key={proc.id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {proc.descricao} {proc.denteNumero && `(Dente ${proc.denteNumero})`}
                        </p>
                        <span className="text-slate-400">Criado em: {proc.dataCriacao}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          R$ {proc.valor.toLocaleString('pt-BR')}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          proc.status === 'Concluído' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}>
                          {proc.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Coluna 3: Linha do Tempo Recente */}
            <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-500" /> Atividades Recentes
              </h3>

              <div className="space-y-4 relative pl-4 border-l-2 border-teal-500/30">
                {timeline.map((item) => (
                  <div key={item.id} className="relative text-xs space-y-1">
                    <div className="absolute -left-[21px] top-0 w-3.5 h-3.5 rounded-full bg-teal-500 border-2 border-white dark:border-slate-900"></div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{item.titulo}</p>
                    <p className="text-slate-400 text-[11px]">{item.descricao}</p>
                    <span className="text-[10px] text-teal-500 font-semibold">{item.dataHora}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 2. PLANO DE TRATAMENTOS E CATÁLOGO ALFABÉTICO COMPLETO A-Z */}
        {abaAtiva === 'tratamentos' && (
          <div className="space-y-6">
            
            {/* Header Resumo Financeiro de Tratamentos do Paciente */}
            <div className={`p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
              darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/20">
                  Plano de Tratamento Odontológico & Tabela de Valores
                </span>
                <h2 className="text-xl font-extrabold flex items-center gap-2 mt-1">
                  <Wrench className="w-6 h-6 text-teal-500" /> Tratamentos Odontológicos e Orçamento
                </h2>
                <p className="text-xs text-slate-400">
                  Selecione procedimentos no catálogo oficial em ordem alfabética ou monte o plano personalizado.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total do Plano:</span>
                  <span className="text-lg font-extrabold text-teal-400">R$ {valorTotalOrcamento.toLocaleString('pt-BR')}</span>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Realizado:</span>
                  <span className="text-lg font-extrabold text-emerald-400">R$ {valorConcluido.toLocaleString('pt-BR')}</span>
                </div>

                <button
                  onClick={() => {
                    setProcNomeInput(CATALOGO_PROCEDIMENTOS_ODONTO[0].nome);
                    setValorInput(CATALOGO_PROCEDIMENTOS_ODONTO[0].valorPadrao);
                    setModalProcAberto(true);
                  }}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold px-4 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-teal-600/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> + Adicionar Tratamento ao Paciente
                </button>
              </div>
            </div>

            {/* TABELA DE TRATAMENTOS ATIVOS DO PACIENTE */}
            <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
              darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
                <h3 className="font-extrabold text-base flex items-center gap-2 text-teal-400">
                  <CheckCircle2 className="w-5 h-5 text-teal-500" /> Procedimentos Planejados para {paciente.nome} ({procedimentosPaciente.length})
                </h3>
              </div>

              {procedimentosPaciente.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-extrabold uppercase">
                        <th className="p-3">Data</th>
                        <th className="p-3">Procedimento Odontológico</th>
                        <th className="p-3">Dente / Região</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Valor (R$)</th>
                        <th className="p-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 font-medium">
                      {procedimentosPaciente.map((proc) => (
                        <tr key={proc.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 text-slate-400 font-bold">{proc.dataCriacao}</td>
                          <td className="p-3 font-bold text-white">{proc.descricao}</td>
                          <td className="p-3 text-teal-300">
                            {proc.denteNumero ? `Dente #${proc.denteNumero}` : 'Boca Toda / Geral'}
                          </td>
                          <td className="p-3">
                            <select
                              value={proc.status}
                              onChange={(e) => handleUpdateStatusProc(proc.id, e.target.value as any)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border cursor-pointer ${
                                proc.status === 'Concluído'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : proc.status === 'Em Andamento'
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                              }`}
                            >
                              <option value="Planejado">Planejado</option>
                              <option value="Em Andamento">Em Andamento</option>
                              <option value="Concluído">Concluído</option>
                            </select>
                          </td>
                          <td className="p-3 font-extrabold text-emerald-400">R$ {proc.valor.toLocaleString('pt-BR')}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteProcedimento(proc.id)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-xl transition-colors cursor-pointer"
                              title="Excluir Procedimento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  Nenhum procedimento adicionado ao plano deste paciente ainda. Escolha no catálogo abaixo!
                </div>
              )}
            </div>

            {/* CATÁLOGO OFICIAL DE PROCEDIMENTOS ODONTOLÓGICOS EM ORDEM ALFABÉTICA (A-Z) */}
            <div className={`p-6 rounded-3xl border shadow-xl space-y-6 ${
              darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/40 pb-4">
                <div>
                  <h3 className="font-extrabold text-base flex items-center gap-2 text-teal-400">
                    <BookOpen className="w-5 h-5 text-teal-500" /> Catálogo Odontológico em Ordem Alfabética (A-Z)
                  </h3>
                  <p className="text-xs text-slate-400">Tabela de procedimentos padrão com valores e tempo estimado de execução.</p>
                </div>

                 <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  {Object.keys(valoresCustom).length > 0 && (
                    <button
                      onClick={handleResetValoresCatalogo}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Restaurar valores padrão originais"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Restaurar Tabela Padrão
                    </button>
                  )}

                  {/* Seletor de Categoria */}
                  <select
                    value={categoriaFiltro}
                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                    className={`p-2.5 rounded-xl border text-xs font-bold ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {categoriasDisponiveis.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  {/* Busca no Catálogo */}
                  <div className="relative flex-1 md:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nome A-Z (ex: Canal, Clareamento...)"
                      value={buscaCatalogo}
                      onChange={(e) => setBuscaCatalogo(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Barra de Filtros por Letra Inicial (A-Z) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">Índice A-Z:</span>
                {letrasDisponiveis.map((letra) => (
                  <button
                    key={letra}
                    onClick={() => setLetraFiltro(letra)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                      letraFiltro === letra
                        ? 'bg-teal-600 text-white shadow-md ring-1 ring-teal-400'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {letra}
                  </button>
                ))}
              </div>

              {/* Tabela / Lista em Ordem Alfabética Organizada */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800/60 max-h-[550px]">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-950 text-slate-400 font-extrabold uppercase border-b border-slate-800 z-10 whitespace-nowrap">
                    <tr>
                      <th className="p-3 w-12 text-center">#</th>
                      <th className="p-3 w-12 text-center">Letra</th>
                      <th className="p-3">Procedimento Odontológico (Ordem Alfabética A-Z)</th>
                      <th className="p-3">Especialidade / Categoria</th>
                      <th className="p-3 text-center">Duração</th>
                      <th className="p-3">Valor Sugerido (R$)</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 font-medium">
                    {catalogoFiltrado.length > 0 ? (
                      catalogoFiltrado.map((item, index) => {
                        const primeiraLetra = item.nome.charAt(0).toUpperCase();
                        const valorAtivo = getValorItemCatalogo(item);
                        const foiEditado = valoresCustom[item.id] !== undefined;

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-800/50 transition-colors group"
                          >
                            <td className="p-3 text-center font-mono text-slate-500 font-extrabold whitespace-nowrap">
                              {String(index + 1).padStart(2, '0')}
                            </td>
                            <td className="p-3 text-center whitespace-nowrap">
                              <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 font-black text-xs inline-flex items-center justify-center border border-teal-500/30">
                                {primeiraLetra}
                              </span>
                            </td>
                            <td className="p-3 font-extrabold text-white group-hover:text-teal-300 transition-colors">
                              {item.nome}
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                {item.categoria}
                              </span>
                            </td>
                            <td className="p-3 text-center text-slate-400 font-bold whitespace-nowrap">
                              ⏱ {item.duracaoMinutos} min
                            </td>
                            <td className="p-3 font-extrabold text-emerald-400 text-sm whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span>R$ {valorAtivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                {foiEditado && (
                                  <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded border border-teal-500/30 uppercase font-black">
                                    Editado
                                  </span>
                                )}
                                <button
                                  onClick={() => {
                                    setItemEditandoValor(item);
                                    setNovoValorCatalogoInput(valorAtivo.toString());
                                  }}
                                  className="p-1 text-slate-400 hover:text-teal-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                  title="Editar Valor Sugerido deste Procedimento"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="p-3 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleAdicionarProcedimentoCat(item)}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-teal-600/20 cursor-pointer transition-all ml-auto"
                              >
                                <Plus className="w-3.5 h-3.5" /> + Adicionar ao Orçamento
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 text-xs font-bold">
                          Nenhum procedimento encontrado com os filtros selecionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 3. Atendimentos */}
        {abaAtiva === 'atendimento' && (
          <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="font-bold text-lg">Histórico de Consultas do Paciente</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {consultasPaciente.map((c) => (
                <div key={c.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{c.procedimento}</p>
                    <p className="text-slate-400">{c.dentistaNome} • Sala: {c.sala}</p>
                  </div>
                  <span className="font-bold px-3 py-1 rounded-full bg-teal-100 text-teal-800">{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Anamnese */}
        {abaAtiva === 'anamnese' && (
          <AnamneseView anamnese={anamnese} pacienteNome={paciente.nome} darkMode={darkMode} />
        )}

        {/* 5. Odontograma */}
        {abaAtiva === 'odontograma' && (
          <Odontograma pacienteNome={paciente.nome} dentes={dentes} onUpdateDente={onUpdateDente} />
        )}

        {/* 6. Radiografias */}
        {abaAtiva === 'radiografias' && (
          <RadiografiaViewer
            exames={radiografias}
            pacienteNome={paciente.nome}
            onAddRadiografia={onAddRadiografia}
            onDeleteRadiografia={onDeleteRadiografia}
            darkMode={darkMode}
          />
        )}

        {/* 7. Fotografias */}
        {abaAtiva === 'fotografias' && (
          <FotografiasGaleria
            fotografias={fotografias}
            pacienteNome={paciente.nome}
            onAddFotografia={onAddFotografia}
            onDeleteFotografia={onDeleteFotografia}
            darkMode={darkMode}
          />
        )}

        {/* 8. Linha do Tempo */}
        {abaAtiva === 'historico' && (
          <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="font-bold text-lg">Histórico Completo de Eventos</h3>
            <div className="space-y-4 pl-4 border-l-2 border-teal-500/40 text-xs">
              {timeline.map((t) => (
                <div key={t.id} className="space-y-1">
                  <p className="font-bold text-slate-800 dark:text-slate-200">{t.titulo}</p>
                  <p className="text-slate-400">{t.descricao}</p>
                  <span className="text-[10px] text-teal-500">{t.dataHora} • Profissional: {t.profissional}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* MODAL DE ADICIONAR PROCEDIMENTO DO CATÁLOGO AO TRATAMENTO DO PACIENTE */}
      {modalProcAberto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`rounded-3xl p-6 max-w-lg w-full shadow-2xl border space-y-4 my-8 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-teal-500" /> Adicionar Procedimento ao Plano de Tratamento
              </h3>
              <button onClick={() => setModalProcAberto(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoProcedimento} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Procedimento Odontológico (Seleção A-Z)</label>
                <select
                  value={procNomeInput}
                  onChange={(e) => {
                    const sel = CATALOGO_PROCEDIMENTOS_ODONTO.find((c) => c.nome === e.target.value);
                    setProcNomeInput(e.target.value);
                    if (sel) setValorInput(sel.valorPadrao);
                  }}
                  className={`w-full p-2.5 rounded-xl border font-bold ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {CATALOGO_PROCEDIMENTOS_ODONTO.map((item) => (
                    <option key={item.id} value={item.nome}>
                      {item.nome} (R$ {item.valorPadrao})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Dente / Região (Opcional)</label>
                  <input
                    type="number"
                    placeholder="Ex: 16 (Notação FDI)"
                    value={denteNumInput}
                    onChange={(e) => setDenteNumInput(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Valor do Procedimento (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={valorInput}
                    onChange={(e) => setValorInput(Number(e.target.value))}
                    required
                    className={`w-full p-2.5 rounded-xl border font-extrabold text-emerald-400 ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Status Inicial do Tratamento</label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as any)}
                  className={`w-full p-2.5 rounded-xl border font-bold ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="Planejado">Planejado</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluído">Concluído</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setModalProcAberto(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-extrabold rounded-xl shadow-lg shadow-teal-600/30 cursor-pointer"
                >
                  Confirmar e Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL DE EDIÇÃO DO VALOR SUGERIDO NO CATÁLOGO */}
      {itemEditandoValor && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-3xl p-6 max-w-md w-full shadow-2xl border space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
              <h3 className="text-sm font-extrabold flex items-center gap-2 text-teal-400">
                <Edit2 className="w-4 h-4 text-teal-400" /> Editar Valor Sugerido do Catálogo
              </h3>
              <button onClick={() => setItemEditandoValor(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-teal-400 px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">
                {itemEditandoValor.categoria}
              </span>
              <h4 className="font-extrabold text-sm text-white">{itemEditandoValor.nome}</h4>
              <p className="text-xs text-slate-400">Valor padrão original: R$ {itemEditandoValor.valorPadrao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>

            <form onSubmit={handleSalvarValorCatalogo} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Novo Valor Sugerido (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={novoValorCatalogoInput}
                  onChange={(e) => setNovoValorCatalogoInput(e.target.value)}
                  required
                  autoFocus
                  className={`w-full p-3 rounded-xl border text-sm font-extrabold text-emerald-400 ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setItemEditandoValor(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl font-extrabold shadow cursor-pointer transition-all"
                >
                  Salvar Novo Valor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
