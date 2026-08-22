import React, { useState } from 'react';
import type { StatusDente, DenteInfo } from '../types';
import {
  CheckCircle2,
  Sparkles,
  ZoomIn,
  X,
  Save,
  Check,
  Printer,
  Plus,
  FileText,
  Trash2,
  Activity,
  ShieldAlert,
  DollarSign
} from 'lucide-react';

interface OdontogramaProps {
  pacienteNome?: string;
  dentes: Record<number, DenteInfo>;
  onUpdateDente: (numero: number, status: StatusDente, observacoes?: string) => void;
  darkMode?: boolean;
}

export interface ProcedimentoOdontograma {
  id: string;
  denteNumero: number;
  face?: string; // O, V, L, M, D, Raiz, Completo
  procedimento: string;
  data: string;
  dentista: string;
  status: 'Planejado' | 'Em Andamento' | 'Concluído';
  valor: number;
}

const statusCores: Record<StatusDente, { bg: string; text: string; border: string; badge: string; hex: string }> = {
  'Saudável': { bg: 'bg-emerald-500/10 hover:bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', hex: '#10B981' },
  'Cárie': { bg: 'bg-rose-500/10 hover:bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/40', badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30', hex: '#EF4444' },
  'Restaurado': { bg: 'bg-sky-500/10 hover:bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/40', badge: 'bg-sky-500/20 text-sky-400 border-sky-500/30', hex: '#0EA5E9' },
  'Tratamento Canal': { bg: 'bg-amber-500/10 hover:bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30', hex: '#F59E0B' },
  'Extração Indicada': { bg: 'bg-purple-500/10 hover:bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/40', badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30', hex: '#A855F7' },
  'Ausente': { bg: 'bg-slate-800/60 hover:bg-slate-800/80', text: 'text-slate-400', border: 'border-slate-700/60', badge: 'bg-slate-800/80 text-slate-400 border-slate-700', hex: '#64748B' },
  'Implante': { bg: 'bg-teal-500/10 hover:bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/40', badge: 'bg-teal-500/20 text-teal-400 border-teal-500/30', hex: '#14B8A6' },
  'Coroa': { bg: 'bg-indigo-500/10 hover:bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/40', badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', hex: '#6366F1' },
  'Lesão': { bg: 'bg-orange-500/10 hover:bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30', hex: '#F97316' },
  'Mobilidade': { bg: 'bg-yellow-500/10 hover:bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40', badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', hex: '#EAB308' },
};

const quadrant1 = [18, 17, 16, 15, 14, 13, 12, 11];
const quadrant2 = [21, 22, 23, 24, 25, 26, 27, 28];
const quadrant4 = [48, 47, 46, 45, 44, 43, 42, 41];
const quadrant3 = [31, 32, 33, 34, 35, 36, 37, 38];

const getNomeAnatomicoDente = (num: number) => {
  const d = num % 10;
  const arcada = num >= 11 && num <= 28 ? 'Superior' : 'Inferior';
  let nome = '';
  if (d === 1) nome = 'Incisivo Central';
  else if (d === 2) nome = 'Incisivo Lateral';
  else if (d === 3) nome = 'Canino';
  else if (d === 4) nome = 'Primeiro Pré-Molar';
  else if (d === 5) nome = 'Segundo Pré-Molar';
  else if (d === 6) nome = 'Primeiro Molar';
  else if (d === 7) nome = 'Segundo Molar';
  else if (d === 8) nome = 'Terceiro Molar (Siso)';
  return `${nome} ${arcada} (${num})`;
};

// Componente de Ilustração Anatômica de Dente Real em SVG com Notação e Tom Escuro Padrão
const DenteAnatomicoSVG = ({ numero, status, corHex, tamanho = 54 }: { numero: number; status: StatusDente; corHex: string; tamanho?: number }) => {
  const d = numero % 10;
  const isSuperior = numero >= 11 && numero <= 28;

  // Preenchimento escuro elegante de alta tecnologia (Sem cor branca!)
  const rootFill = status === 'Ausente' ? '#1E293B' : status === 'Implante' ? '#0D9488' : '#0F172A';
  const crownFill = status === 'Ausente' ? '#0F172A' : status === 'Coroa' ? '#4F46E5' : '#1E293B';

  // Dente tipo Molar (6, 7, 8)
  if (d >= 6) {
    return (
      <svg width={tamanho} height={tamanho * 1.3} viewBox="0 0 100 130" fill="none" className="transition-all duration-300">
        {/* Raízes Molares */}
        <path
          d={isSuperior ? "M25 65 L20 120 C18 125, 32 125, 35 120 L45 70 L55 70 L65 120 C68 125, 82 125, 80 120 L75 65 Z" : "M25 65 L20 10 C18 5, 32 5, 35 10 L45 60 L55 60 L65 10 C68 5, 82 5, 80 10 L75 65 Z"}
          fill={rootFill}
          stroke={corHex}
          strokeWidth="3.5"
        />
        {/* Coroa Molar Multicúspide */}
        <rect
          x="15"
          y="40"
          width="70"
          height="45"
          rx="12"
          fill={crownFill}
          stroke={corHex}
          strokeWidth="4"
        />
        {/* Cúspides Ocusal */}
        <path d="M20 40 Q 35 28, 50 40 Q 65 28, 80 40" stroke={corHex} strokeWidth="3" fill="none" />
        <circle cx="50" cy="62" r="10" fill={corHex} opacity="0.35" />
      </svg>
    );
  }

  // Dente tipo Pré-Molar (4, 5)
  if (d === 4 || d === 5) {
    return (
      <svg width={tamanho} height={tamanho * 1.3} viewBox="0 0 100 130" fill="none" className="transition-all duration-300">
        <path
          d={isSuperior ? "M30 65 L32 118 C30 125, 45 125, 48 118 L50 68 L68 118 C65 125, 78 125, 76 118 L70 65 Z" : "M30 65 L32 12 C30 5, 45 5, 48 12 L50 62 L68 12 C65 5, 78 5, 76 12 L70 65 Z"}
          fill={rootFill}
          stroke={corHex}
          strokeWidth="3.5"
        />
        <rect
          x="20"
          y="42"
          width="60"
          height="42"
          rx="10"
          fill={crownFill}
          stroke={corHex}
          strokeWidth="4"
        />
        <path d="M25 42 Q 50 32, 75 42" stroke={corHex} strokeWidth="3" fill="none" />
        <circle cx="50" cy="63" r="8" fill={corHex} opacity="0.35" />
      </svg>
    );
  }

  // Canino (3)
  if (d === 3) {
    return (
      <svg width={tamanho} height={tamanho * 1.3} viewBox="0 0 100 130" fill="none" className="transition-all duration-300">
        <path
          d={isSuperior ? "M35 65 L48 125 C47 128, 53 128, 52 125 L65 65 Z" : "M35 65 L48 5 C47 2, 53 2, 52 5 L65 65 Z"}
          fill={rootFill}
          stroke={corHex}
          strokeWidth="3.5"
        />
        <path
          d="M25 70 L50 32 L75 70 Z"
          fill={crownFill}
          stroke={corHex}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="58" r="7" fill={corHex} opacity="0.35" />
      </svg>
    );
  }

  // Incisivos (1, 2)
  return (
    <svg width={tamanho} height={tamanho * 1.3} viewBox="0 0 100 130" fill="none" className="transition-all duration-300">
      <path
        d={isSuperior ? "M35 65 L48 122 C47 126, 53 126, 52 122 L65 65 Z" : "M35 65 L48 8 C47 4, 53 4, 52 8 L65 65 Z"}
        fill={rootFill}
        stroke={corHex}
        strokeWidth="3.5"
      />
      <rect
        x="22"
        y="42"
        width="56"
        height="40"
        rx="6"
        fill={crownFill}
        stroke={corHex}
        strokeWidth="4"
      />
      <circle cx="50" cy="62" r="7" fill={corHex} opacity="0.35" />
    </svg>
  );
};

export const Odontograma: React.FC<OdontogramaProps> = ({
  pacienteNome,
  dentes,
  onUpdateDente
}) => {
  const [denteSelecionado, setDenteSelecionado] = useState<number | null>(16);
  const [denteModalAmpliado, setDenteModalAmpliado] = useState<number | null>(null);
  const [statusTemp, setStatusTemp] = useState<StatusDente>('Saudável');
  const [faceSelecionada, setFaceSelecionada] = useState<string>('Oclusal/Incisal');
  const [obsTemp, setObsTemp] = useState<string>('');
  const [salvoSucesso, setSalvoSucesso] = useState<boolean>(false);

  // Lista de Procedimentos do Prontuário Dental Ondoctor
  const [procedimentosProntuario, setProcedimentosProntuario] = useState<ProcedimentoOdontograma[]>([
    {
      id: 'p-1',
      denteNumero: 16,
      face: 'Oclusal + Mesial',
      procedimento: 'Restauração em Resina Fotopolimerizável',
      data: '21/08/2026',
      dentista: 'Dra. Patricia Medeiros',
      status: 'Concluído',
      valor: 280
    },
    {
      id: 'p-2',
      denteNumero: 24,
      face: 'Completa',
      procedimento: 'Tratamento de Canal (Endodontia)',
      data: '21/08/2026',
      dentista: 'Dra. Patricia Medeiros',
      status: 'Em Andamento',
      valor: 650
    },
    {
      id: 'p-3',
      denteNumero: 36,
      face: 'Raio X + Implante',
      procedimento: 'Instalação de Implante Titânio 4.0mm',
      data: '20/08/2026',
      dentista: 'Dr. Carlos Eduardo',
      status: 'Planejado',
      valor: 1800
    }
  ]);

  const handleSelectDente = (num: number) => {
    setDenteSelecionado(num);
    setDenteModalAmpliado(num);
    const info = dentes[num];
    if (info) {
      setStatusTemp(info.status);
      setObsTemp(info.observacoes || '');
    } else {
      setStatusTemp('Saudável');
      setObsTemp('');
    }
  };

  const handleSalvarDente = () => {
    if (denteSelecionado !== null) {
      onUpdateDente(denteSelecionado, statusTemp, obsTemp);

      if (statusTemp !== 'Saudável') {
        const novoProc: ProcedimentoOdontograma = {
          id: `p-${Date.now()}`,
          denteNumero: denteSelecionado,
          face: faceSelecionada,
          procedimento: `${statusTemp} - Dente ${denteSelecionado}`,
          data: new Date().toLocaleDateString('pt-BR'),
          dentista: 'Dra. Patricia Medeiros',
          status: 'Em Andamento',
          valor: statusTemp === 'Implante' ? 1800 : statusTemp === 'Tratamento Canal' ? 650 : 250
        };
        setProcedimentosProntuario((prev) => [novoProc, ...prev]);
      }

      setSalvoSucesso(true);
      setTimeout(() => setSalvoSucesso(false), 2500);
    }
  };

  const handleDeleteProcedimento = (id: string) => {
    setProcedimentosProntuario((prev) => prev.filter((p) => p.id !== id));
  };

  // Estatísticas do Odontograma Buco-Dental
  const totalCaries = Object.values(dentes).filter((d) => d.status === 'Cárie').length;
  const totalCanais = Object.values(dentes).filter((d) => d.status === 'Tratamento Canal').length;
  const totalImplantes = Object.values(dentes).filter((d) => d.status === 'Implante').length;
  const totalRestaurados = Object.values(dentes).filter((d) => d.status === 'Restaurado').length;
  const valorTotalOrcamento = procedimentosProntuario.reduce((acc, p) => acc + p.valor, 0);

  const renderDenteCard = (num: number) => {
    const info = dentes[num] || { numero: num, status: 'Saudável' };
    const cor = statusCores[info.status] || statusCores['Saudável'];
    const isSelected = denteSelecionado === num;

    return (
      <button
        key={num}
        onClick={() => handleSelectDente(num)}
        className={`flex flex-col items-center justify-between p-2 rounded-2xl border-2 transition-all cursor-pointer min-w-[56px] min-h-[105px] relative group ${
          cor.bg
        } ${isSelected ? 'border-teal-500 ring-2 ring-teal-400 scale-108 shadow-xl z-10' : cor.border}`}
      >
        <span className="text-[11px] font-extrabold text-slate-300">{num}</span>

        {/* Desenho Anatômico do Dente Real com Tom Escuro */}
        <div className="my-0.5 flex items-center justify-center">
          <DenteAnatomicoSVG numero={num} status={info.status} corHex={cor.hex} tamanho={38} />
        </div>

        {/* Notação de Faces do Dente no Padrão Ondoctor Escuro */}
        <div className="w-full grid grid-cols-3 gap-0.5 my-1 text-[8px] font-extrabold text-center">
          <span className="bg-slate-900/90 text-slate-300 rounded border border-slate-700/50">V</span>
          <span className="bg-slate-900/90 text-teal-300 rounded border border-slate-700/50">O</span>
          <span className="bg-slate-900/90 text-slate-300 rounded border border-slate-700/50">L</span>
        </div>

        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${cor.badge} truncate max-w-[52px]`}>
          {info.status.substring(0, 5)}
        </span>

        <div className="absolute inset-0 bg-teal-950/80 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-opacity">
          <ZoomIn className="w-5 h-5 text-teal-300" />
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER PRONTUÁRIO DENTAL ONDOCTOR - TEMA ESCURO PADRÃO */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/20">
            Prontuário Odontológico Digital Ondoctor 2026
          </span>
          <h2 className="text-xl font-extrabold flex items-center gap-2 mt-1 text-white">
            <Sparkles className="w-6 h-6 text-teal-400" /> Odontograma Buco-Maxilo & Ficha Clínica
          </h2>
          <p className="text-xs text-slate-400">
            {pacienteNome ? `Prontuário clínico ativo do paciente: ${pacienteNome}` : 'Registro gráfico bucal, faces dentárias e plano de tratamento.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2 rounded-2xl text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow"
          >
            <Printer className="w-4 h-4 text-teal-400" /> Imprimir Prontuário (PDF)
          </button>

          <button
            onClick={() => {
              if (denteSelecionado) setDenteModalAmpliado(denteSelecionado);
            }}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold px-4 py-2 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-teal-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + Adicionar Tratamento
          </button>
        </div>
      </div>

      {/* 2. KPIS RESUMO DA SAÚDE BUCAL DO PACIENTE - TEMA ESCURO */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cáries Ativas</span>
            <h4 className="text-lg font-extrabold text-rose-400 mt-0.5">{totalCaries} Dente(s)</h4>
          </div>
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Endodontia (Canal)</span>
            <h4 className="text-lg font-extrabold text-amber-400 mt-0.5">{totalCanais} Tratado(s)</h4>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Implantes</span>
            <h4 className="text-lg font-extrabold text-teal-400 mt-0.5">{totalImplantes} Osseointegrado(s)</h4>
          </div>
          <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Restaurados</span>
            <h4 className="text-lg font-extrabold text-sky-400 mt-0.5">{totalRestaurados} Resina/Amálgama</h4>
          </div>
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Orçamento Estimado</span>
            <h4 className="text-lg font-extrabold text-emerald-400 mt-0.5">R$ {valorTotalOrcamento.toLocaleString('pt-BR')}</h4>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. LEGENDA DE CONDIÇÕES CLÍNICAS ONDOCTOR - TEMA ESCURO */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl flex flex-wrap items-center justify-center gap-3 text-xs">
        {Object.entries(statusCores).map(([st, c]) => (
          <div key={st} className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-xl border border-slate-800">
            <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: c.hex, borderColor: c.hex }} />
            <span className="font-bold text-slate-300 text-[11px]">{st}</span>
          </div>
        ))}
      </div>

      {/* 4. GRADE ANATÔMICA DA ARCADA DENTAL (MAXILAR E MANDIBULAR) - TEMA ESCURO */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900 text-white shadow-xl space-y-8">

        {/* ARCADA SUPERIOR (Quadrantes 1 e 2) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              1. Arcada Maxilar Superior (Notação FDI 18 a 28)
            </h3>
            <span className="text-[11px] text-slate-400">Clique para selecionar a face dental ou dente</span>
          </div>

          <div className="flex justify-center gap-1.5 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {/* Quadrante 1 (18-11) */}
            <div className="flex gap-1.5 sm:gap-2 bg-slate-950/70 p-2 rounded-2xl border border-slate-800/80 shadow-inner">
              {quadrant1.map(renderDenteCard)}
            </div>

            <div className="w-1 bg-teal-500/40 rounded-full my-1"></div>

            {/* Quadrante 2 (21-28) */}
            <div className="flex gap-1.5 sm:gap-2 bg-slate-950/70 p-2 rounded-2xl border border-slate-800/80 shadow-inner">
              {quadrant2.map(renderDenteCard)}
            </div>
          </div>
        </div>

        {/* ARCADA INFERIOR (Quadrantes 4 e 3) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              2. Arcada Mandibular Inferior (Notação FDI 48 a 38)
            </h3>
            <span className="text-[11px] text-slate-400">Clique no dente para abrir o seletor de faces</span>
          </div>

          <div className="flex justify-center gap-1.5 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {/* Quadrante 4 (48-41) */}
            <div className="flex gap-1.5 sm:gap-2 bg-slate-950/70 p-2 rounded-2xl border border-slate-800/80 shadow-inner">
              {quadrant4.map(renderDenteCard)}
            </div>

            <div className="w-1 bg-teal-500/40 rounded-full my-1"></div>

            {/* Quadrante 3 (31-38) */}
            <div className="flex gap-1.5 sm:gap-2 bg-slate-950/70 p-2 rounded-2xl border border-slate-800/80 shadow-inner">
              {quadrant3.map(renderDenteCard)}
            </div>
          </div>
        </div>

      </div>

      {/* 5. TABELA DE PROCEDIMENTOS DO PRONTUÁRIO ONDOCTOR - TEMA ESCURO */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
          <div>
            <h3 className="font-extrabold text-base flex items-center gap-2 text-teal-400">
              <FileText className="w-5 h-5 text-teal-400" /> Prontuário de Procedimentos e Tratamentos Executados
            </h3>
            <p className="text-xs text-slate-400">Histórico de intervenções por dente e face no plano de tratamento do paciente.</p>
          </div>

          <span className="bg-teal-500/20 text-teal-300 font-extrabold text-xs px-3 py-1 rounded-full border border-teal-500/30">
            {procedimentosProntuario.length} Procedimento(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-extrabold uppercase">
                <th className="p-3">Data</th>
                <th className="p-3">Dente #</th>
                <th className="p-3">Face</th>
                <th className="p-3">Procedimento / Tratamento</th>
                <th className="p-3">Dentista Responsável</th>
                <th className="p-3">Status</th>
                <th className="p-3">Valor (R$)</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {procedimentosProntuario.map((proc) => (
                <tr key={proc.id} className="hover:bg-slate-800/50 transition-colors font-medium">
                  <td className="p-3 text-slate-400 font-bold">{proc.data}</td>
                  <td className="p-3">
                    <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-md font-extrabold border border-teal-500/30">
                      Dente #{proc.denteNumero}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 font-bold">{proc.face || 'Completa'}</td>
                  <td className="p-3 font-bold text-white">{proc.procedimento}</td>
                  <td className="p-3 text-slate-300">{proc.dentista}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      proc.status === 'Concluído'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : proc.status === 'Em Andamento'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
                        : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                    }`}>
                      {proc.status}
                    </span>
                  </td>
                  <td className="p-3 font-extrabold text-emerald-400">R$ {proc.valor.toLocaleString('pt-BR')}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteProcedimento(proc.id)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-xl transition-colors cursor-pointer"
                      title="Remover do Prontuário"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL HD DE ANÁLISE DE DENTE AMPLIADO COM SELEÇÃO POR FACES - TEMA ESCURO PADRÃO */}
      {denteModalAmpliado !== null && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-800 bg-slate-900 text-white space-y-6 my-8">
            
            {/* Header Modal Dente Ondoctor */}
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                  Módulo de Faces e Diagnóstico Ondoctor
                </span>
                <h2 className="text-xl font-extrabold mt-1 text-teal-400">
                  {getNomeAnatomicoDente(denteModalAmpliado)}
                </h2>
              </div>
              <button
                onClick={() => setDenteModalAmpliado(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              {/* Ilustração HD Escura e Seletor de Faces Dentárias */}
              <div className="bg-slate-950 p-6 rounded-3xl border-2 border-teal-500/40 flex flex-col items-center justify-center relative shadow-inner">
                <DenteAnatomicoSVG
                  numero={denteModalAmpliado}
                  status={statusTemp}
                  corHex={statusCores[statusTemp].hex}
                  tamanho={120}
                />

                {/* Grade de Seleção de Faces */}
                <div className="mt-4 w-full space-y-2">
                  <span className="block text-[10px] font-extrabold uppercase text-center text-teal-400">
                    Selecione a Face do Dente #{denteModalAmpliado}
                  </span>

                  <div className="grid grid-cols-5 gap-1.5 text-[11px] font-extrabold">
                    {[
                      { id: 'Vestibular', label: 'V (Vestib.)' },
                      { id: 'Oclusal/Incisal', label: 'O (Oclus.)' },
                      { id: 'Lingual/Palatina', label: 'L (Palat.)' },
                      { id: 'Mesial', label: 'M (Mesial)' },
                      { id: 'Distal', label: 'D (Distal)' }
                    ].map((face) => (
                      <button
                        key={face.id}
                        type="button"
                        onClick={() => setFaceSelecionada(face.id)}
                        className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                          faceSelecionada === face.id
                            ? 'bg-teal-600 text-white border-teal-400 shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {face.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Seletor de Diagnóstico do Dente */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Selecione o Diagnóstico / Condição:</label>
                  <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                    {(Object.keys(statusCores) as StatusDente[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusTemp(st)}
                        className={`p-2 rounded-xl border text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                          statusTemp === st
                            ? 'bg-teal-600 text-white border-teal-400 shadow-md'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <span>{st}</span>
                        {statusTemp === st && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Anotações do Tratamento / Procedimento:</label>
                  <textarea
                    rows={2}
                    value={obsTemp}
                    onChange={(e) => setObsTemp(e.target.value)}
                    placeholder="Ex: Restauração foto-polimerizável na face Oclusal..."
                    className="w-full p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

            </div>

            {/* Footer Modal Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => setDenteModalAmpliado(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSalvarDente();
                  setDenteModalAmpliado(null);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-teal-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Salvar no Prontuário Ondoctor
              </button>
            </div>

            {salvoSucesso && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 p-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Diagnóstico e procedimento salvos no prontuário com sucesso!
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
