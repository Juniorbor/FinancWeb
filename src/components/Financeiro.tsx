import React, { useState, useEffect } from 'react';
import type { TransacaoPessoal } from '../types';
import { pushToCloud, pullFromCloud, subscribeLocalBroadcast } from '../services/cloudSync';
import {
  DollarSign,
  ArrowUpRight,
  Plus,
  Filter,
  Edit2,
  Trash2,
  Home,
  CreditCard,
  TrendingUp,
  FileText,
  Search,
  X,
  Download,
  Wallet,
  RefreshCw
} from 'lucide-react';

interface FinanceiroProps {
  darkMode?: boolean;
}

const STORAGE_KEY = 'odonto_financeiro_pessoal_v1';

const CATEGORIAS_PESSOAIS = [
  'Salário & Renda',
  'Aluguel & Moradia',
  'Contas de Consumo (Água/Luz/Net)',
  'Educação & Faculdade',
  'Transporte & Combustível',
  'Alimentação & Mercado',
  'Família & Filha',
  'Cartões de Crédito',
  'Empréstimos & Acordos',
  'Materiais & Outros'
];

const TRANSACOES_INICIAIS: TransacaoPessoal[] = [
  // Entradas (Salário / Renda)
  { id: 'fin-1', descricao: 'Salário Mensal', tipo: 'Entrada', valor: 3645.00, data: '2026-08-01', categoria: 'Salário & Renda', status: 'Pago', observacao: 'Crédito em Conta' },
  { id: 'fin-2', descricao: 'Primeira Quinzena / Adiantamento', tipo: 'Entrada', valor: 1500.00, data: '2026-08-15', categoria: 'Salário & Renda', status: 'Pago', observacao: 'Adiantamento quinzenal' },
  
  // Despesas Fixas do Lar
  { id: 'fin-3', descricao: 'Aluguel Residencial', tipo: 'Despesa Fixa', valor: 800.00, data: '2026-08-05', categoria: 'Aluguel & Moradia', status: 'Pago', observacao: 'Vencimento dia 05' },
  { id: 'fin-4', descricao: 'Conta de Água', tipo: 'Despesa Fixa', valor: 50.00, data: '2026-08-10', categoria: 'Contas de Consumo (Água/Luz/Net)', status: 'Pago' },
  { id: 'fin-5', descricao: 'Conta de Luz / Energia Elétrica', tipo: 'Despesa Fixa', valor: 500.00, data: '2026-08-12', categoria: 'Contas de Consumo (Água/Luz/Net)', status: 'Pago' },
  { id: 'fin-6', descricao: 'Internet Residencial', tipo: 'Despesa Fixa', valor: 119.90, data: '2026-08-15', categoria: 'Contas de Consumo (Água/Luz/Net)', status: 'Pago' },
  { id: 'fin-7', descricao: 'Mensalidade Faculdade', tipo: 'Despesa Fixa', valor: 1393.82, data: '2026-08-10', categoria: 'Educação & Faculdade', status: 'Pago' },
  { id: 'fin-8', descricao: 'Acordo Faculdade', tipo: 'Despesa Fixa', valor: 323.00, data: '2026-08-10', categoria: 'Educação & Faculdade', status: 'Pago' },
  { id: 'fin-9', descricao: 'Acordo Faculdade (Parcela 2)', tipo: 'Despesa Fixa', valor: 254.00, data: '2026-08-10', categoria: 'Educação & Faculdade', status: 'Pago' },
  { id: 'fin-10', descricao: 'Nivaldo Contador', tipo: 'Despesa Fixa', valor: 60.00, data: '2026-08-15', categoria: 'Serviços', status: 'Pago' },
  { id: 'fin-11', descricao: 'Passagem / Ônibus Faculdade', tipo: 'Despesa Fixa', valor: 300.00, data: '2026-08-01', categoria: 'Transporte & Combustível', status: 'Pago' },
  { id: 'fin-12', descricao: 'Despesas Filha', tipo: 'Despesa Fixa', valor: 400.00, data: '2026-08-05', categoria: 'Família & Filha', status: 'Pago' },

  // Despesas Variáveis & Cartões do Lar
  { id: 'fin-13', descricao: 'Materiais Dental Speed (8x)', tipo: 'Despesa Variável', valor: 109.35, data: '2026-08-15', categoria: 'Materiais & Outros', status: 'Pago', parcelas: '8x' },
  { id: 'fin-14', descricao: 'Materiais Dental Cremer (12x)', tipo: 'Despesa Variável', valor: 403.00, data: '2026-08-15', categoria: 'Materiais & Outros', status: 'Pago', parcelas: '12x' },
  { id: 'fin-15', descricao: 'Empréstimo Nubank Jack', tipo: 'Despesa Variável', valor: 470.00, data: '2026-08-20', categoria: 'Empréstimos & Acordos', status: 'Pago' },
  { id: 'fin-16', descricao: 'Cartão Mãe - Roupas Anna (6x)', tipo: 'Despesa Variável', valor: 140.00, data: '2026-08-18', categoria: 'Cartões de Crédito', status: 'Pago', parcelas: '6x' },
  { id: 'fin-17', descricao: 'Cartão Pai - Material Novo', tipo: 'Despesa Variável', valor: 202.79, data: '2026-08-12', categoria: 'Cartões de Crédito', status: 'Pago' },
  { id: 'fin-18', descricao: 'Cartão NUBANK', tipo: 'Despesa Variável', valor: 200.00, data: '2026-08-22', categoria: 'Cartões de Crédito', status: 'Pago' },
  { id: 'fin-19', descricao: 'MEI Imposto Mensal', tipo: 'Despesa Variável', valor: 75.00, data: '2026-08-20', categoria: 'Serviços', status: 'Pago' }
];

export const Financeiro: React.FC<FinanceiroProps> = ({ darkMode }) => {
  const [transacoes, setTransacoes] = useState<TransacaoPessoal[]>(() => {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo !== null) {
      try {
        return JSON.parse(salvo);
      } catch (e) {
        console.error('Erro ao ler transações pessoais do localStorage:', e);
      }
    }
    return TRANSACOES_INICIAIS;
  });

  const [sincronizando, setSincronizando] = useState<boolean>(false);

  // Função central para salvar e sincronizar instantaneamente na nuvem para todos os dispositivos
  const updateTransacoesECloud = (novas: TransacaoPessoal[]) => {
    setTransacoes(novas);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novas));
    pushToCloud({ financeiro: novas });
  };

  // Carregamento e Polling em Tempo Real da Nuvem
  useEffect(() => {
    // 1. Busca imediata na nuvem ao abrir
    setSincronizando(true);
    pullFromCloud((payload) => {
      if (payload.financeiro) {
        setTransacoes(payload.financeiro);
      }
      setSincronizando(false);
    }, true);

    // 2. Escuta alterações locais de abas simultâneas via BroadcastChannel
    const unsubscribeBroadcast = subscribeLocalBroadcast((payload) => {
      if (payload.financeiro) {
        setTransacoes(payload.financeiro);
      }
    });

    // 3. Polling contínuo a cada 2 segundos
    const interval = setInterval(() => {
      pullFromCloud((payload) => {
        if (payload.financeiro) {
          setTransacoes(payload.financeiro);
        }
      });
    }, 2000);

    const handleFocus = () => {
      pullFromCloud((payload) => {
        if (payload.financeiro) setTransacoes(payload.financeiro);
      }, true);
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      unsubscribeBroadcast();
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const [filtroTipo, setFiltroTipo] = useState<string>('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todas');
  const [busca, setBusca] = useState<string>('');

  // Modal State
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [transacaoEditando, setTransacaoEditando] = useState<TransacaoPessoal | null>(null);

  // Form State
  const [descricao, setDescricao] = useState<string>('');
  const [tipo, setTipo] = useState<'Entrada' | 'Despesa Fixa' | 'Despesa Variável'>('Despesa Fixa');
  const [valor, setValor] = useState<number>(100);
  const [categoria, setCategoria] = useState<string>('Aluguel & Moradia');
  const [data, setData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Pago' | 'Pendente'>('Pago');
  const [parcelas, setParcelas] = useState<string>('');
  const [observacao, setObservacao] = useState<string>('');

  const totalEntradas = transacoes
    .filter((t) => t.tipo === 'Entrada')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalDespesasFixas = transacoes
    .filter((t) => t.tipo === 'Despesa Fixa')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalDespesasVariaveis = transacoes
    .filter((t) => t.tipo === 'Despesa Variável')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalDespesasGerais = totalDespesasFixas + totalDespesasVariaveis;
  const saldoLiquidoPessoal = totalEntradas - totalDespesasGerais;
  const comprometimentoRenda = totalEntradas > 0 ? Math.round((totalDespesasGerais / totalEntradas) * 100) : 0;

  const transacoesFiltradas = transacoes.filter((t) => {
    const atendeTipo = filtroTipo === 'Todos' || t.tipo === filtroTipo;
    const atendeCat = filtroCategoria === 'Todas' || t.categoria === filtroCategoria;
    const atendeBusca = t.descricao.toLowerCase().includes(busca.toLowerCase());
    return atendeTipo && atendeCat && atendeBusca;
  });

  const handleAbrirNovoModal = () => {
    setTransacaoEditando(null);
    setDescricao('');
    setTipo('Despesa Fixa');
    setValor(100);
    setCategoria('Aluguel & Moradia');
    setData(new Date().toISOString().split('T')[0]);
    setStatus('Pago');
    setParcelas('');
    setObservacao('');
    setModalAberto(true);
  };

  const handleAbrirEditarModal = (t: TransacaoPessoal) => {
    setTransacaoEditando(t);
    setDescricao(t.descricao);
    setTipo(t.tipo);
    setValor(t.valor);
    setCategoria(t.categoria);
    setData(t.data);
    setStatus(t.status);
    setParcelas(t.parcelas || '');
    setObservacao(t.observacao || '');
    setModalAberto(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao) return;

    if (transacaoEditando) {
      const atualizadas = transacoes.map((item) =>
        item.id === transacaoEditando.id
          ? {
              ...item,
              descricao,
              tipo,
              valor: Number(valor),
              categoria,
              data,
              status,
              parcelas: parcelas || undefined,
              observacao: observacao || undefined
            }
          : item
      );
      updateTransacoesECloud(atualizadas);
    } else {
      const nova: TransacaoPessoal = {
        id: `fin-${Date.now()}`,
        descricao,
        tipo,
        valor: Number(valor),
        categoria,
        data,
        status,
        parcelas: parcelas || undefined,
        observacao: observacao || undefined
      };
      updateTransacoesECloud([nova, ...transacoes]);
    }

    setModalAberto(false);
  };

  const handleDeleteTransacao = (id: string) => {
    const restantes = transacoes.filter((t) => t.id !== id);
    updateTransacoesECloud(restantes);
  };

  const handleToggleStatus = (id: string) => {
    const alteradas = transacoes.map((t) =>
      t.id === id ? { ...t, status: (t.status === 'Pago' ? 'Pendente' : 'Pago') as 'Pago' | 'Pendente' } : t
    );
    updateTransacoesECloud(alteradas);
  };

  const handleManualSync = async () => {
    setSincronizando(true);
    await pullFromCloud((payload) => {
      if (payload.financeiro) setTransacoes(payload.financeiro);
    }, true);
    setSincronizando(false);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER GESTÃO FINANCEIRA PESSOAL */}
      <div className={`p-4 sm:p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/20 flex items-center gap-1 w-fit">
            <Wallet className="w-3.5 h-3.5" /> Módulo de Controle Orçamentário Familiar & Pessoal (Sincronizado)
          </span>
          <h2 className="text-xl font-extrabold flex items-center gap-2 mt-1">
            <DollarSign className="w-6 h-6 text-teal-500" /> Gestão Financeira Pessoal & Despesas do Lar
          </h2>
          <p className="text-xs text-slate-400">
            Controle de entradas (Salário/Renda), contas fixas da casa, cartões de crédito e despesas domésticas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleManualSync}
            disabled={sincronizando}
            className="bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold px-3.5 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow w-full sm:w-auto"
            title="Sincronizar dados em tempo real com a nuvem"
          >
            <RefreshCw className={`w-4 h-4 ${sincronizando ? 'animate-spin' : ''}`} />
            <span>{sincronizando ? 'Sincronizando...' : 'Atualizar Nuvem'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow w-full sm:w-auto"
          >
            <Download className="w-4 h-4 text-teal-400" /> Exportar Extrato (PDF)
          </button>

          <button
            onClick={handleAbrirNovoModal}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-600/25 transition-all cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4.5 h-4.5" /> + Lançar Entrada ou Despesa do Lar
          </button>
        </div>
      </div>

      {/* 2. CARDS RESUMO DO ORÇAMENTO PESSOAL & DA CASA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Entradas / Salário */}
        <div className={`p-5 rounded-3xl border shadow-xl flex items-center justify-between ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Entradas / Salário</span>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-0.5">R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" /> Rendimento total no mês
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Despesas Fixas do Lar */}
        <div className={`p-5 rounded-3xl border shadow-xl flex items-center justify-between ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Despesas Fixas do Lar</span>
            <h3 className="text-xl font-extrabold text-sky-400 mt-0.5">R$ {totalDespesasFixas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            <span className="text-[10px] text-slate-400">
              Aluguel, Água, Luz, Faculdade, Net
            </span>
          </div>
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">
            <Home className="w-6 h-6" />
          </div>
        </div>

        {/* Despesas Variáveis & Cartões */}
        <div className={`p-5 rounded-3xl border shadow-xl flex items-center justify-between ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Variáveis & Cartões</span>
            <h3 className="text-xl font-extrabold text-rose-400 mt-0.5">R$ {totalDespesasVariaveis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            <span className="text-[10px] text-slate-400">
              Cartões, Materiais e Empréstimos
            </span>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Saldo Pessoal / Reserva */}
        <div className={`p-5 rounded-3xl border shadow-xl flex items-center justify-between ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saldo Pessoal do Mês</span>
            <h3 className={`text-xl font-extrabold mt-0.5 ${
              saldoLiquidoPessoal >= 0 ? 'text-teal-400' : 'text-rose-500'
            }`}>
              R$ {saldoLiquidoPessoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] text-slate-400 block mt-1 font-bold">
              Comprometimento da Renda: <strong className={comprometimentoRenda > 80 ? 'text-rose-400' : 'text-teal-400'}>{comprometimentoRenda}%</strong>
            </span>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl border border-teal-500/20">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. BARRA DE FILTROS E BUSCA DE CONTAS */}
      <div className={`p-4 rounded-3xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <Filter className="w-4 h-4 text-teal-400" /> Filtrar Tipo:
          </div>

          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-2xl border border-slate-800">
            {['Todos', 'Entrada', 'Despesa Fixa', 'Despesa Variável'].map((t) => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  filtroTipo === t
                    ? t === 'Entrada'
                      ? 'bg-emerald-600 text-white shadow'
                      : t === 'Despesa Fixa'
                      ? 'bg-sky-600 text-white shadow'
                      : t === 'Despesa Variável'
                      ? 'bg-rose-600 text-white shadow'
                      : 'bg-teal-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {t === 'Todos' ? 'Todas as Contas' : t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className={`p-2 rounded-xl border text-xs font-bold ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="Todas">Todas as Categorias</option>
            {CATEGORIAS_PESSOAIS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar conta (ex: Aluguel, Luz, Cartão...)"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>
        </div>
      </div>

      {/* 4. TABELA PRINCIPAL DE EXTRATO FINANCEIRO PESSOAL */}
      <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
          <h3 className="font-extrabold text-base flex items-center gap-2 text-teal-400">
            <FileText className="w-5 h-5 text-teal-500" /> Lançamentos de Contas do Lar & Salário ({transacoesFiltradas.length})
          </h3>

          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Saldo Exibido: R$ {(
              transacoesFiltradas.filter((t) => t.tipo === 'Entrada').reduce((a, b) => a + b.valor, 0) -
              transacoesFiltradas.filter((t) => t.tipo !== 'Entrada').reduce((a, b) => a + b.valor, 0)
            ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {transacoesFiltradas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-extrabold uppercase">
                  <th className="p-3">Data</th>
                  <th className="p-3">Descrição da Conta / Renda</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Valor (R$)</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-medium">
                {transacoesFiltradas.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 text-slate-400 font-bold">{t.data}</td>
                    <td className="p-3">
                      <p className="font-bold text-white flex items-center gap-2">
                        {t.descricao}
                        {t.parcelas && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                            {t.parcelas}
                          </span>
                        )}
                      </p>
                      {t.observacao && <span className="text-[10px] text-slate-400">{t.observacao}</span>}
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        t.tipo === 'Entrada'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : t.tipo === 'Despesa Fixa'
                          ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}>
                        {t.tipo}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 font-bold">{t.categoria}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleStatus(t.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border cursor-pointer transition-all ${
                          t.status === 'Pago'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30'
                        }`}
                      >
                        {t.status === 'Pago' ? '✓ Pago' : '⏳ Pendente'}
                      </button>
                    </td>
                    <td className={`p-3 font-extrabold text-sm ${
                      t.tipo === 'Entrada' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {t.tipo === 'Entrada' ? '+' : '-'} R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAbrirEditarModal(t)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-teal-400 rounded-xl transition-colors cursor-pointer"
                          title="Editar Conta"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransacao(t.id)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-rose-400 rounded-xl transition-colors cursor-pointer"
                          title="Excluir Conta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <p className="text-sm font-bold text-slate-300">Nenhum lançamento financeiro encontrado.</p>
            <p>Clique em "+ Lançar Entrada ou Despesa do Lar" para registrar uma nova conta!</p>
          </div>
        )}
      </div>

      {/* MODAL ADICIONAR / EDITAR LANÇAMENTO PESSOAL */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`rounded-3xl p-6 max-w-md w-full shadow-2xl border space-y-4 my-8 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-teal-500" />
                {transacaoEditando ? 'Editar Lançamento Pessoal' : 'Lançar Nova Entrada / Despesa do Lar'}
              </h3>
              <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-400 mb-1">Tipo de Lançamento</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Entrada', 'Despesa Fixa', 'Despesa Variável'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipo(t)}
                      className={`p-2 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer ${
                        tipo === t
                          ? t === 'Entrada'
                            ? 'bg-emerald-600 text-white border-emerald-400'
                            : t === 'Despesa Fixa'
                            ? 'bg-sky-600 text-white border-sky-400'
                            : 'bg-rose-600 text-white border-rose-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Descrição da Conta / Renda</label>
                <input
                  type="text"
                  placeholder="Ex: Aluguel Residencial, Salário, Cartão Nubank..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                  className={`w-full p-2.5 rounded-xl border font-bold ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={valor}
                    onChange={(e) => setValor(Number(e.target.value))}
                    required
                    className={`w-full p-2.5 rounded-xl border font-extrabold text-sm ${
                      tipo === 'Entrada' ? 'text-emerald-400' : 'text-rose-400'
                    } ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Data</label>
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    required
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Categoria Pessoal</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border font-bold ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {CATEGORIAS_PESSOAIS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className={`w-full p-2.5 rounded-xl border font-bold ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="Pago">Pago</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Parcelas / Observação (Opcional)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Ex: 6x, 12x"
                    value={parcelas}
                    onChange={(e) => setParcelas(e.target.value)}
                    className={`p-2.5 rounded-xl border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Ex: Vencimento dia 10"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    className={`p-2.5 rounded-xl border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
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
                  {transacaoEditando ? 'Salvar Alterações' : 'Confirmar e Lançar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
