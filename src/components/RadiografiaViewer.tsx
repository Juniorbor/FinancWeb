import React, { useState, useEffect, useRef } from 'react';
import type { RadiografiaExame } from '../types';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sun,
  Sliders,
  Maximize2,
  FileText,
  PenTool,
  Circle,
  Square,
  RefreshCw,
  Plus,
  Save,
  Search as LupaIcon,
  ArrowRight,
  Ruler,
  Spline,
  Upload,
  X,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Check,
  Camera
} from 'lucide-react';

interface RadiografiaViewerProps {
  exames: RadiografiaExame[];
  pacienteNome?: string;
  onAddRadiografia?: (novo: Omit<RadiografiaExame, 'id'>) => void;
  onDeleteRadiografia?: (id: string) => void;
  darkMode?: boolean;
}

export interface FormaDesenho {
  id: string;
  tipo: 'seta' | 'retangulo' | 'circulo' | 'medicao_implante' | 'pontilhado';
  x1: number; // Porcentagem (0-100%)
  y1: number;
  x2: number;
  y2: number;
  cor: string;
  espessura: number; // Espessura em pixels (1, 2, 3, 4, 6)
  medidaMm?: string;
  pontos?: { x: number; y: number }[]; // Sequência de pontos para a linha pontilhada
}

export interface RecorteLupaCapturado {
  id: string;
  x: number;
  y: number;
  zoomLupa: number;
  dataHora: string;
  imagemUrl: string;
}

// 20 Cores Vibrantes Médicas para Marcações
const PALETA_20_CORES = [
  { cor: '#EF4444', nome: 'Vermelho' },
  { cor: '#F97316', nome: 'Laranja' },
  { cor: '#F59E0B', nome: 'Amarelo Ouro' },
  { cor: '#EAB308', nome: 'Amarelo Vivo' },
  { cor: '#84CC16', nome: 'Verde Lima' },
  { cor: '#22C55E', nome: 'Verde Esmeralda' },
  { cor: '#10B981', nome: 'Menta' },
  { cor: '#14B8A6', nome: 'Teal' },
  { cor: '#06B6D4', nome: 'Ciano' },
  { cor: '#0EA5E9', nome: 'Azul Celeste' },
  { cor: '#3B82F6', nome: 'Azul Royal' },
  { cor: '#6366F1', nome: 'Índigo' },
  { cor: '#8B5CF6', nome: 'Roxo' },
  { cor: '#A855F7', nome: 'Violeta' },
  { cor: '#D946EF', nome: 'Fúcsia' },
  { cor: '#EC4899', nome: 'Rosa Pink' },
  { cor: '#F43F5E', nome: 'Carmim' },
  { cor: '#FFFFFF', nome: 'Branco' },
  { cor: '#94A3B8', nome: 'Prata Metal' },
  { cor: '#0F172A', nome: 'Preto Obscuro' }
];

// Espessuras de Linha (em pixels)
const OPCOES_ESPESSURA = [
  { valor: 1, label: '1px (Fina)' },
  { valor: 2, label: '2px (Padrão)' },
  { valor: 3, label: '3px (Média)' },
  { valor: 4, label: '4px (Média-Grossa)' },
  { valor: 6, label: '6px (Grossa)' }
];

export const RadiografiaViewer: React.FC<RadiografiaViewerProps> = ({
  exames,
  pacienteNome,
  onAddRadiografia,
  onDeleteRadiografia,
  darkMode
}) => {
  const [exameSelecionado, setExameSelecionado] = useState<RadiografiaExame | null>(
    exames.length > 0 ? exames[0] : null
  );

  // Sincronizar seleção quando um novo exame é adicionado
  useEffect(() => {
    if (exames.length > 0) {
      if (!exameSelecionado || !exames.some((e) => e.id === exameSelecionado.id)) {
        setExameSelecionado(exames[0]);
      }
    }
  }, [exames]);

  // Manipulação de Imagem
  const [zoom, setZoom] = useState<number>(1);
  const [rotacao, setRotacao] = useState<number>(0);
  const [brilho, setBrilho] = useState<number>(100);
  const [contraste, setContraste] = useState<number>(100);
  const [ferramenta, setFerramenta] = useState<string>('selecionar');
  const [corSelecionada, setCorSelecionada] = useState<string>('#EF4444');
  const [espessuraLinha, setEspessuraLinha] = useState<number>(2); // Padrão 2px fino e preciso

  // Região da Lupa Ampliada & Lista de Recortes Capturados
  const [regiaoLupa, setRegiaoLupa] = useState<{ x: number; y: number; zoomLupa: number } | null>(null);
  const [recortesLupa, setRecortesLupa] = useState<RecorteLupaCapturado[]>([]);
  const [capturaSucesso, setCapturaSucesso] = useState<boolean>(false);

  // Dimensões em Pixels do Container do Canvas
  const [containerSize, setContainerSize] = useState({ width: 800, height: 520 });

  // Formas Geométricas Desenhadas por Arraste de Mouse
  const [formas, setFormas] = useState<FormaDesenho[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);

  // Pontos da Linha Pontilhada por Cliques Sequenciais
  const [pontosPontilhado, setPontosPontilhado] = useState<{ x: number; y: number }[]>([]);

  // Estado de Seleção e Arraste Interativo de Elementos e Pontos
  const [formaSelecionadaId, setFormaSelecionadaId] = useState<string | null>(null);
  const [arrastandoFormaId, setArrastandoFormaId] = useState<string | null>(null);
  const [arrastandoPontoIdx, setArrastandoPontoIdx] = useState<number | null>(null);
  const [pontoInicialArraste, setPontoInicialArraste] = useState<{ x: number; y: number } | null>(null);
  const [formaSnapshot, setFormaSnapshot] = useState<FormaDesenho | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // State Modal Adicionar e Excluir Raio-X
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState<boolean>(false);
  const [novoTitulo, setNovoTitulo] = useState<string>('');
  const [novoTipo, setNovoTipo] = useState<'Panorâmica' | 'Periapical' | 'Interproximal' | 'Tomografia 3D'>('Panorâmica');
  const [novaData, setNovaData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [novaImagemUrl, setNovaImagemUrl] = useState<string>('');
  const [novoLaudo, setNovoLaudo] = useState<string>('');

  // Notificação de Salvo
  const [salvoSucesso, setSalvoSucesso] = useState<boolean>(false);

  // Atualiza as dimensões reais em pixels do elemento da imagem para ancoragem 100% perfeita dos desenhos
  const updateImageSize = () => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const width = imageRef.current.clientWidth || rect.width || 800;
      const height = imageRef.current.clientHeight || rect.height || 520;
      if (width > 0 && height > 0) {
        setContainerSize({ width, height });
      }
    }
  };

  useEffect(() => {
    updateImageSize();
    window.addEventListener('resize', updateImageSize);
    return () => window.removeEventListener('resize', updateImageSize);
  }, [exameSelecionado?.id]);

  // Carrega automaticamente os desenhos salvos quando o exame selecionado muda
  useEffect(() => {
    if (exameSelecionado?.id) {
      let formasSalvas: FormaDesenho[] = exameSelecionado.formas || [];
      let recortesSalvos: RecorteLupaCapturado[] = exameSelecionado.recortesLupa || [];

      const localFormas = localStorage.getItem(`odonto_formas_${exameSelecionado.id}`);
      if (localFormas) {
        try {
          const parsed = JSON.parse(localFormas);
          if (Array.isArray(parsed) && parsed.length > 0) {
            formasSalvas = parsed;
          }
        } catch (e) {}
      }

      const localRecortes = localStorage.getItem(`odonto_recortes_${exameSelecionado.id}`);
      if (localRecortes) {
        try {
          const parsed = JSON.parse(localRecortes);
          if (Array.isArray(parsed) && parsed.length > 0) {
            recortesSalvos = parsed;
          }
        } catch (e) {}
      }

      setFormas(formasSalvas);
      setRecortesLupa(recortesSalvos);
      setFormaSelecionadaId(null);
    }
  }, [exameSelecionado?.id]);

  // Persiste automaticamente no localStorage sempre que formas ou recortesLupa forem alterados
  useEffect(() => {
    if (exameSelecionado?.id) {
      localStorage.setItem(`odonto_formas_${exameSelecionado.id}`, JSON.stringify(formas));
      if (exameSelecionado) {
        exameSelecionado.formas = formas;
      }
    }
  }, [formas, exameSelecionado?.id]);

  useEffect(() => {
    if (exameSelecionado?.id) {
      localStorage.setItem(`odonto_recortes_${exameSelecionado.id}`, JSON.stringify(recortesLupa));
      if (exameSelecionado) {
        exameSelecionado.recortesLupa = recortesLupa;
      }
    }
  }, [recortesLupa, exameSelecionado?.id]);

  const handleResetFilters = () => {
    setZoom(1);
    setRotacao(0);
    setBrilho(100);
    setContraste(100);
    setPontosPontilhado([]);
    setRegiaoLupa(null);
    setFormaSelecionadaId(null);
  };

  const handleDesfazerUltimo = () => {
    if (pontosPontilhado.length > 0) {
      setPontosPontilhado((prev) => prev.slice(0, -1));
    } else {
      setFormas((prev) => prev.slice(0, -1));
    }
  };

  // Manipuladores para Seleção e Arraste de Elementos e Pontos de Controle
  const handleMouseDownForma = (e: React.MouseEvent, forma: FormaDesenho) => {
    e.stopPropagation();
    const coords = getCoordinatesPercentage(e);
    setFormaSelecionadaId(forma.id);

    setArrastandoFormaId(forma.id);
    setArrastandoPontoIdx(null);
    setPontoInicialArraste(coords);
    setFormaSnapshot(JSON.parse(JSON.stringify(forma)));
  };

  const handleMouseDownPonto = (e: React.MouseEvent, forma: FormaDesenho, pontoIndex: number) => {
    e.stopPropagation();
    const coords = getCoordinatesPercentage(e);
    setFormaSelecionadaId(forma.id);

    setArrastandoFormaId(forma.id);
    setArrastandoPontoIdx(pontoIndex);
    setPontoInicialArraste(coords);
    setFormaSnapshot(JSON.parse(JSON.stringify(forma)));
  };

  const handleDeleteFormaSelecionada = () => {
    if (formaSelecionadaId) {
      setFormas((prev) => prev.filter((f) => f.id !== formaSelecionadaId));
      setFormaSelecionadaId(null);
    }
  };

  // Atalho de Teclado (Delete / Backspace) para remover o elemento selecionado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && formaSelecionadaId) {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleDeleteFormaSelecionada();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formaSelecionadaId]);

  // Cálculo de Coordenadas 100% Exato e Sem Desvio Relativo ao Corpo Físico da Imagem
  const getCoordinatesPercentage = (e: React.MouseEvent<any>) => {
    const target = imageRef.current;
    if (!target) return { x: 50, y: 50 };
    const rect = target.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return { x: 50, y: 50 };
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const coords = getCoordinatesPercentage(e);

    // Se clicar no fundo sem acertar uma forma, limpa a seleção
    if (!arrastandoFormaId) {
      setFormaSelecionadaId(null);
    }

    if (ferramenta === 'lupa') {
      const zoomAtual = regiaoLupa?.zoomLupa || 3.5;
      setRegiaoLupa({ x: coords.x, y: coords.y, zoomLupa: zoomAtual });

      if (exameSelecionado) {
        const novoRecorte: RecorteLupaCapturado = {
          id: `crop-${Date.now()}`,
          x: coords.x,
          y: coords.y,
          zoomLupa: zoomAtual,
          dataHora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          imagemUrl: exameSelecionado.imagemUrl
        };

        setRecortesLupa((prev) => [novoRecorte, ...prev]);
        setCapturaSucesso(true);
        setTimeout(() => setCapturaSucesso(false), 2500);
      }
      return;
    }

    if (ferramenta === 'selecionar') return;

    if (ferramenta === 'pontilhado') {
      setPontosPontilhado((prev) => {
        if (prev.length > 0) {
          const ultimo = prev[prev.length - 1];
          if (Math.hypot(coords.x - ultimo.x, coords.y - ultimo.y) < 0.3) {
            return prev;
          }
        }
        return [...prev, coords];
      });
      return;
    }

    setIsDrawing(true);
    setStartPoint(coords);
    setCurrentPoint(coords);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const coords = getCoordinatesPercentage(e);
    setCurrentPoint(coords);

    // 1. Processa o arraste interativo de elementos ou pontos de linha pontilhada
    if (arrastandoFormaId && pontoInicialArraste && formaSnapshot) {
      const dx = coords.x - pontoInicialArraste.x;
      const dy = coords.y - pontoInicialArraste.y;

      setFormas((prevFormas) =>
        prevFormas.map((f) => {
          if (f.id !== arrastandoFormaId) return f;

          // A. Arraste de um ponto de controle específico (ex: vértice de linha pontilhada)
          if (arrastandoPontoIdx !== null) {
            if (f.tipo === 'pontilhado' && f.pontos && f.pontos[arrastandoPontoIdx]) {
              const novosPontos = f.pontos.map((pt, idx) => {
                if (idx === arrastandoPontoIdx && formaSnapshot.pontos && formaSnapshot.pontos[idx]) {
                  return {
                    x: Math.max(0, Math.min(100, formaSnapshot.pontos[idx].x + dx)),
                    y: Math.max(0, Math.min(100, formaSnapshot.pontos[idx].y + dy))
                  };
                }
                return pt;
              });

              const minX = Math.min(...novosPontos.map((p) => p.x));
              const minY = Math.min(...novosPontos.map((p) => p.y));
              const maxX = Math.max(...novosPontos.map((p) => p.x));
              const maxY = Math.max(...novosPontos.map((p) => p.y));

              return {
                ...f,
                x1: minX,
                y1: minY,
                x2: maxX,
                y2: maxY,
                pontos: novosPontos
              };
            }

            if (arrastandoPontoIdx === 0) {
              const newX1 = Math.max(0, Math.min(100, formaSnapshot.x1 + dx));
              const newY1 = Math.max(0, Math.min(100, formaSnapshot.y1 + dy));
              let medidaMm = f.medidaMm;
              if (f.tipo === 'medicao_implante') {
                const distPercentage = Math.hypot(f.x2 - newX1, f.y2 - newY1);
                medidaMm = `${Math.max(1.0, distPercentage * 0.45).toFixed(1)} mm`;
              }
              return { ...f, x1: newX1, y1: newY1, medidaMm };
            }

            if (arrastandoPontoIdx === 1) {
              const newX2 = Math.max(0, Math.min(100, formaSnapshot.x2 + dx));
              const newY2 = Math.max(0, Math.min(100, formaSnapshot.y2 + dy));
              let medidaMm = f.medidaMm;
              if (f.tipo === 'medicao_implante') {
                const distPercentage = Math.hypot(newX2 - f.x1, newY2 - f.y1);
                medidaMm = `${Math.max(1.0, distPercentage * 0.45).toFixed(1)} mm`;
              }
              return { ...f, x2: newX2, y2: newY2, medidaMm };
            }
          }

          // B. Arraste do elemento inteiro (Mãozinha / Seleção)
          const newX1 = Math.max(0, Math.min(100, formaSnapshot.x1 + dx));
          const newY1 = Math.max(0, Math.min(100, formaSnapshot.y1 + dy));
          const newX2 = Math.max(0, Math.min(100, formaSnapshot.x2 + dx));
          const newY2 = Math.max(0, Math.min(100, formaSnapshot.y2 + dy));

          let novosPontos = f.pontos;
          if (f.tipo === 'pontilhado' && formaSnapshot.pontos) {
            novosPontos = formaSnapshot.pontos.map((pt) => ({
              x: Math.max(0, Math.min(100, pt.x + dx)),
              y: Math.max(0, Math.min(100, pt.y + dy))
            }));
          }

          return {
            ...f,
            x1: newX1,
            y1: newY1,
            x2: newX2,
            y2: newY2,
            pontos: novosPontos
          };
        })
      );
      return;
    }

    if (ferramenta === 'lupa' && !regiaoLupa) {
      setRegiaoLupa({
        x: coords.x,
        y: coords.y,
        zoomLupa: 3.5
      });
    }
  };

  const handleMouseUp = () => {
    if (arrastandoFormaId) {
      setArrastandoFormaId(null);
      setArrastandoPontoIdx(null);
      setPontoInicialArraste(null);
      setFormaSnapshot(null);
      return;
    }

    if (ferramenta === 'pontilhado') return;

    if (!isDrawing || !startPoint || !currentPoint) {
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentPoint(null);
      return;
    }

    const dx = currentPoint.x - startPoint.x;
    const dy = currentPoint.y - startPoint.y;
    const distPercentage = Math.hypot(dx, dy);

    if (distPercentage < 0.5) {
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentPoint(null);
      return;
    }

    let medidaMm: string | undefined;
    if (ferramenta === 'medicao_implante') {
      const valorMm = Math.max(1.0, (distPercentage * 0.45)).toFixed(1);
      medidaMm = `${valorMm} mm`;
    }

    const novaForma: FormaDesenho = {
      id: `forma-${Date.now()}`,
      tipo: ferramenta as any,
      x1: startPoint.x,
      y1: startPoint.y,
      x2: currentPoint.x,
      y2: currentPoint.y,
      cor: corSelecionada,
      espessura: espessuraLinha,
      medidaMm
    };

    setFormas((prev) => [...prev, novaForma]);
    setFormaSelecionadaId(novaForma.id);
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ferramenta === 'pontilhado' && pontosPontilhado.length > 0) {
      e.preventDefault();
      e.stopPropagation();

      const pontosFiltrados: { x: number; y: number }[] = [];
      pontosPontilhado.forEach((pt) => {
        if (pontosFiltrados.length === 0) {
          pontosFiltrados.push(pt);
        } else {
          const u = pontosFiltrados[pontosFiltrados.length - 1];
          if (Math.hypot(pt.x - u.x, pt.y - u.y) > 0.5) {
            pontosFiltrados.push(pt);
          }
        }
      });

      if (pontosFiltrados.length >= 2) {
        const novaForma: FormaDesenho = {
          id: `forma-${Date.now()}`,
          tipo: 'pontilhado',
          x1: pontosFiltrados[0].x,
          y1: pontosFiltrados[0].y,
          x2: pontosFiltrados[pontosFiltrados.length - 1].x,
          y2: pontosFiltrados[pontosFiltrados.length - 1].y,
          cor: corSelecionada,
          espessura: espessuraLinha,
          pontos: pontosFiltrados
        };
        setFormas((prev) => [...prev, novaForma]);
        setFormaSelecionadaId(novaForma.id);
      }

      setPontosPontilhado([]);
    }
  };

  const handleFinalizarPontilhadoManualmente = () => {
    if (pontosPontilhado.length >= 2) {
      const novaForma: FormaDesenho = {
        id: `forma-${Date.now()}`,
        tipo: 'pontilhado',
        x1: pontosPontilhado[0].x,
        y1: pontosPontilhado[0].y,
        x2: pontosPontilhado[pontosPontilhado.length - 1].x,
        y2: pontosPontilhado[pontosPontilhado.length - 1].y,
        cor: corSelecionada,
        espessura: espessuraLinha,
        pontos: pontosPontilhado
      };
      setFormas((prev) => [...prev, novaForma]);
      setFormaSelecionadaId(novaForma.id);
    }
    setPontosPontilhado([]);
  };

  const handleDeleteRecorteLupa = (id: string) => {
    setRecortesLupa((prev) => prev.filter((r) => r.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNovaImagemUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSalvarNovoExame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaImagemUrl) return;

    const novoExame: RadiografiaExame = {
      id: `rad-${Date.now()}`,
      pacienteId: 'pac-atual',
      titulo: novoTitulo || `Raio-X ${novoTipo}`,
      tipo: novoTipo,
      data: novaData,
      imagemUrl: novaImagemUrl,
      laudo: novoLaudo
    };

    setExameSelecionado(novoExame);

    if (onAddRadiografia) {
      onAddRadiografia(novoExame);
    }

    setNovoTitulo('');
    setNovaImagemUrl('');
    setNovoLaudo('');
    setModalAberto(false);
  };

  const handleSalvarTudoRadiografia = () => {
    if (exameSelecionado?.id) {
      localStorage.setItem(`odonto_formas_${exameSelecionado.id}`, JSON.stringify(formas));
      localStorage.setItem(`odonto_recortes_${exameSelecionado.id}`, JSON.stringify(recortesLupa));
      exameSelecionado.formas = formas;
      exameSelecionado.recortesLupa = recortesLupa;
    }
    setSalvoSucesso(true);
    setTimeout(() => setSalvoSucesso(false), 3000);
  };

  const handleLimparTodosDesenhos = () => {
    if (exameSelecionado?.id) {
      localStorage.removeItem(`odonto_formas_${exameSelecionado.id}`);
      localStorage.removeItem(`odonto_recortes_${exameSelecionado.id}`);
      exameSelecionado.formas = [];
      exameSelecionado.recortesLupa = [];
    }
    setFormas([]);
    setPontosPontilhado([]);
    setRecortesLupa([]);
    setFormaSelecionadaId(null);
  };

  // Conversão de porcentagem para pixels reais para nitidez perfeita
  const pxX = (pct: number) => (pct * containerSize.width) / 100;
  const pxY = (pct: number) => (pct * containerSize.height) / 100;

  // Helper de Renderização de Formas Geométricas em SVG com Seleção e Alças Interativas
  const renderSvgForma = (forma: FormaDesenho, isPreview = false) => {
    const { id, tipo, x1, y1, x2, y2, cor, espessura, medidaMm, pontos } = forma;
    const strokeW = espessura || espessuraLinha || 2;
    const isSelected = formaSelecionadaId === id;

    const x1Px = pxX(x1);
    const y1Px = pxY(y1);
    const x2Px = pxX(x2);
    const y2Px = pxY(y2);

    const minXPx = Math.min(x1Px, x2Px);
    const minYPx = Math.min(y1Px, y2Px);
    const widthPx = Math.abs(x2Px - x1Px);
    const heightPx = Math.abs(y2Px - y1Px);
    const opacity = isPreview ? 0.6 : 1;

    // Handlers para clique e arraste da forma
    const formaEvents = !isPreview
      ? {
          onMouseDown: (e: React.MouseEvent) => handleMouseDownForma(e, forma),
          className: 'pointer-events-auto cursor-grab active:cursor-grabbing hover:filter hover:brightness-125'
        }
      : {};

    if (tipo === 'retangulo') {
      return (
        <g key={id} opacity={opacity} {...formaEvents}>
          <rect
            x={minXPx}
            y={minYPx}
            width={widthPx}
            height={heightPx}
            fill={`${cor}20`}
            stroke={cor}
            strokeWidth={isSelected ? strokeW + 1.5 : strokeW}
            rx="4"
          />
          {isSelected && !isPreview && (
            <>
              <rect
                x={minXPx - 3}
                y={minYPx - 3}
                width={widthPx + 6}
                height={heightPx + 6}
                fill="none"
                stroke="#06B6D4"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <circle
                cx={x1Px}
                cy={y1Px}
                r="6"
                fill="#0F172A"
                stroke="#06B6D4"
                strokeWidth="2"
                className="pointer-events-auto cursor-nwse-resize hover:scale-125"
                onMouseDown={(e) => handleMouseDownPonto(e, forma, 0)}
              />
              <circle
                cx={x2Px}
                cy={y2Px}
                r="6"
                fill="#0F172A"
                stroke="#06B6D4"
                strokeWidth="2"
                className="pointer-events-auto cursor-nwse-resize hover:scale-125"
                onMouseDown={(e) => handleMouseDownPonto(e, forma, 1)}
              />
            </>
          )}
        </g>
      );
    }

    if (tipo === 'circulo') {
      const cx = (x1Px + x2Px) / 2;
      const cy = (y1Px + y2Px) / 2;
      const rx = widthPx / 2;
      const ry = heightPx / 2;
      return (
        <g key={id} opacity={opacity} {...formaEvents}>
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill={`${cor}20`}
            stroke={cor}
            strokeWidth={isSelected ? strokeW + 1.5 : strokeW}
          />
          {isSelected && !isPreview && (
            <>
              <ellipse
                cx={cx}
                cy={cy}
                rx={rx + 3}
                ry={ry + 3}
                fill="none"
                stroke="#06B6D4"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <circle
                cx={x1Px}
                cy={y1Px}
                r="6"
                fill="#0F172A"
                stroke="#06B6D4"
                strokeWidth="2"
                className="pointer-events-auto cursor-nwse-resize hover:scale-125"
                onMouseDown={(e) => handleMouseDownPonto(e, forma, 0)}
              />
              <circle
                cx={x2Px}
                cy={y2Px}
                r="6"
                fill="#0F172A"
                stroke="#06B6D4"
                strokeWidth="2"
                className="pointer-events-auto cursor-nwse-resize hover:scale-125"
                onMouseDown={(e) => handleMouseDownPonto(e, forma, 1)}
              />
            </>
          )}
        </g>
      );
    }

    if (tipo === 'seta') {
      const markerId = `arrow-${cor.replace('#', '')}-${strokeW}`;
      return (
        <g key={id} opacity={opacity} {...formaEvents}>
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth={Math.max(4, strokeW * 2)}
              markerHeight={Math.max(4, strokeW * 2)}
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={cor} />
            </marker>
          </defs>
          <line
            x1={x1Px}
            y1={y1Px}
            x2={x2Px}
            y2={y2Px}
            stroke={cor}
            strokeWidth={isSelected ? strokeW + 1.5 : strokeW}
            markerEnd={`url(#${markerId})`}
          />
          {isSelected && !isPreview && (
            <>
              <circle
                cx={x1Px}
                cy={y1Px}
                r="6"
                fill="#0F172A"
                stroke="#06B6D4"
                strokeWidth="2"
                className="pointer-events-auto cursor-grab active:cursor-grabbing hover:scale-125"
                onMouseDown={(e) => handleMouseDownPonto(e, forma, 0)}
              />
              <circle
                cx={x2Px}
                cy={y2Px}
                r="6"
                fill="#0F172A"
                stroke="#06B6D4"
                strokeWidth="2"
                className="pointer-events-auto cursor-grab active:cursor-grabbing hover:scale-125"
                onMouseDown={(e) => handleMouseDownPonto(e, forma, 1)}
              />
            </>
          )}
        </g>
      );
    }

    if (tipo === 'medicao_implante') {
      const midX = (x1Px + x2Px) / 2;
      const midY = (y1Px + y2Px) / 2;

      return (
        <g key={id} opacity={opacity} {...formaEvents}>
          <line
            x1={x1Px}
            y1={y1Px}
            x2={x2Px}
            y2={y2Px}
            stroke={cor}
            strokeWidth={isSelected ? strokeW + 1.5 : strokeW}
            strokeDasharray={`${strokeW * 2.5} ${strokeW * 1.5}`}
          />
          <circle cx={x1Px} cy={y1Px} r={strokeW + 2} fill={cor} />
          <circle cx={x2Px} cy={y2Px} r={strokeW + 2} fill={cor} />

          {isSelected && !isPreview && (
            <>
              <circle
                cx={x1Px}
                cy={y1Px}
                r="7"
                fill="#0F172A"
                stroke="#06B6D4"
                strokeWidth="2"
                className="pointer-events-auto cursor-grab active:cursor-grabbing hover:scale-125"
                onMouseDown={(e) => handleMouseDownPonto(e, forma, 0)}
              />
              <circle
                cx={x2Px}
                cy={y2Px}
                r="7"
                fill="#0F172A"
                stroke="#06B6D4"
                strokeWidth="2"
                className="pointer-events-auto cursor-grab active:cursor-grabbing hover:scale-125"
                onMouseDown={(e) => handleMouseDownPonto(e, forma, 1)}
              />
            </>
          )}

          {medidaMm && (
            <foreignObject
              x={midX - 45}
              y={midY - 14}
              width="90"
              height="28"
              className="overflow-visible pointer-events-none"
            >
              <div className="flex items-center justify-center">
                <span
                  className="px-2 py-0.5 rounded-md text-[11px] font-extrabold shadow-md border flex items-center gap-1 text-white"
                  style={{ backgroundColor: '#020617', borderColor: cor }}
                >
                  <Ruler className="w-3 h-3 text-teal-400" /> {medidaMm}
                </span>
              </div>
            </foreignObject>
          )}
        </g>
      );
    }

    if (tipo === 'pontilhado' && pontos && pontos.length > 0) {
      const pointsString = pontos.map((p) => `${pxX(p.x)},${pxY(p.y)}`).join(' ');

      return (
        <g key={id} opacity={opacity} {...formaEvents}>
          {/* Linha invisível mais larga para capturar facilmente o clique / toque */}
          {!isPreview && (
            <polyline
              points={pointsString}
              fill="none"
              stroke="transparent"
              strokeWidth={Math.max(14, strokeW * 5)}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Linha pontilhada visível */}
          <polyline
            points={pointsString}
            fill="none"
            stroke={cor}
            strokeWidth={isSelected ? strokeW + 1.5 : strokeW}
            strokeDasharray={`${strokeW * 3} ${strokeW * 2}`}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Se estiver selecionado, desenha um contorno de foco piscante em volta */}
          {isSelected && !isPreview && (
            <polyline
              points={pointsString}
              fill="none"
              stroke="#06B6D4"
              strokeWidth={strokeW + 3}
              strokeDasharray="4 4"
              opacity="0.7"
            />
          )}

          {/* VÉRTICES / PONTOS DE CONTROLE DA LINHA PONTILHADA (CLIQUE E ARRASTE CADA PONTO PARA ALINHAR) */}
          {pontos.map((pt, pIdx) => {
            const cx = pxX(pt.x);
            const cy = pxY(pt.y);
            const isPointDragging = arrastandoFormaId === id && arrastandoPontoIdx === pIdx;

            return (
              <g key={pIdx} className="pointer-events-auto cursor-grab active:cursor-grabbing">
                {/* Anel Externo ao Arrastar ou Focar */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isPointDragging ? Math.max(10, strokeW + 6) : Math.max(7, strokeW + 3)}
                  fill={isPointDragging ? '#06B6D4' : '#0F172A'}
                  fillOpacity={isPointDragging ? 0.5 : 0.8}
                  stroke={isSelected ? '#06B6D4' : cor}
                  strokeWidth="1.5"
                />
                {/* Ponto Central de Controle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={Math.max(4, strokeW + 1)}
                  fill={isPointDragging ? '#06B6D4' : cor}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="hover:scale-125 transition-transform"
                  onMouseDown={(e) => handleMouseDownPonto(e, forma, pIdx)}
                >
                  <title>{`Ponto ${pIdx + 1} da linha pontilhada — Clique e arraste para alinhar!`}</title>
                </circle>
              </g>
            );
          })}
        </g>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Header */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Maximize2 className="w-6 h-6 text-teal-500" /> Visualizador de Imagens Diagnósticas & Panorâmicas
          </h2>
          <p className="text-xs text-slate-400">
            {pacienteNome ? `Exames radiográficos do paciente: ${pacienteNome}` : 'Exames radiográficos, tomografias 3D e medições de implantes.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1.5 overflow-x-auto max-w-xs sm:max-w-md">
            {exames.map((ex) => (
              <button
                key={ex.id}
                onClick={() => {
                  setExameSelecionado(ex);
                  handleResetFilters();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  exameSelecionado?.id === ex.id
                    ? 'bg-teal-600 text-white shadow-md'
                    : darkMode
                    ? 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {ex.titulo} ({ex.tipo})
              </button>
            ))}
          </div>

          <button
            onClick={() => setModalAberto(true)}
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold px-4 py-2 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-teal-600/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Adicionar Raio-X
          </button>

          {exameSelecionado && onDeleteRadiografia && (
            <button
              onClick={() => setModalExcluirAberto(true)}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold px-3 py-2 rounded-2xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              title="Excluir este exame radiográfico"
            >
              <Trash2 className="w-4 h-4" /> Excluir Raio-X
            </button>
          )}
        </div>
      </div>

      {exameSelecionado ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Área Principal de Exibição da Imagem com Ferramentas */}
          <div className="lg:col-span-3 space-y-4">

            {/* Barra de Ferramentas Médicas (Toolbar) */}
            <div className={`p-4 rounded-3xl border shadow-sm space-y-3 ${
              darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}>

              <div className="flex flex-wrap items-center justify-between gap-3">

                {/* Ajustes de Zoom e Rotação */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                    className="p-2 rounded-xl border hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors"
                    title="Aumentar Zoom"
                  >
                    <ZoomIn className="w-4 h-4 text-teal-500" />
                  </button>

                  <button
                    onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                    className="p-2 rounded-xl border hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors"
                    title="Reduzir Zoom"
                  >
                    <ZoomOut className="w-4 h-4 text-teal-500" />
                  </button>

                  <button
                    onClick={() => setRotacao((r) => (r + 90) % 360)}
                    className="p-2 rounded-xl border hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors"
                    title="Girar 90 Graus"
                  >
                    <RotateCw className="w-4 h-4 text-teal-500" />
                  </button>

                  <button
                    onClick={handleResetFilters}
                    className="p-2 rounded-xl border hover:bg-rose-50 dark:hover:bg-slate-800 text-rose-500 transition-colors"
                    title="Restaurar Padrão"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  {(formas.length > 0 || pontosPontilhado.length > 0) && (
                    <button
                      onClick={handleDesfazerUltimo}
                      className="p-2 rounded-xl border hover:bg-amber-50 dark:hover:bg-slate-800 text-amber-500 transition-colors"
                      title="Desfazer Último Desenho / Ponto"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Sliders de Brilho e Contraste */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Brilho: {brilho}%</span>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={brilho}
                      onChange={(e) => setBrilho(Number(e.target.value))}
                      className="w-16 accent-teal-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-sky-500" />
                    <span>Contraste: {contraste}%</span>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={contraste}
                      onChange={(e) => setContraste(Number(e.target.value))}
                      className="w-16 accent-teal-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Seletor de Ferramentas Diagnósticas */}
                <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-2xl border border-slate-700">
                  {[
                    { id: 'selecionar', label: 'Mãozinha / Seleção', icon: PenTool },
                    { id: 'seta', label: 'Arraste Seta', icon: ArrowRight },
                    { id: 'retangulo', label: 'Arraste Retângulo', icon: Square },
                    { id: 'circulo', label: 'Arraste Círculo', icon: Circle },
                    { id: 'medicao_implante', label: 'Arraste Régua Implante (mm)', icon: Ruler },
                    { id: 'pontilhado', label: 'Linha Pontilhada (Cliques + Duplo Clique)', icon: Spline },
                    { id: 'lupa', label: 'Lupa Ampliadora (Clique para Capturar ao Lado)', icon: LupaIcon }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        if (ferramenta === t.id && t.id !== 'selecionar') {
                          setFerramenta('selecionar');
                          if (t.id === 'lupa') {
                            setRegiaoLupa(null);
                          }
                        } else {
                          setFerramenta(t.id);
                          if (t.id !== 'pontilhado') setPontosPontilhado([]);
                        }
                      }}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        ferramenta === t.id
                          ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-400'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title={ferramenta === t.id ? `${t.label} (Clique para desativar)` : t.label}
                    >
                      <t.icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>

              </div>

              {/* Linha 2: Seletor de Espessura da Linha e Paleta de 20 Cores */}
              <div className="pt-2 border-t border-slate-800/40 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">Espessura do Traço:</span>
                  <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-xl border border-slate-700">
                    {OPCOES_ESPESSURA.map((op) => (
                      <button
                        key={op.valor}
                        onClick={() => setEspessuraLinha(op.valor)}
                        className={`px-2 py-0.5 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                          espessuraLinha === op.valor
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                        title={op.label}
                      >
                        {op.valor}px
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Paleta de 20 Cores:</span>
                  {PALETA_20_CORES.map((c) => (
                    <button
                      key={c.cor}
                      onClick={() => setCorSelecionada(c.cor)}
                      style={{ backgroundColor: c.cor }}
                      className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                        corSelecionada === c.cor ? 'scale-125 border-white ring-2 ring-teal-400' : 'border-slate-800 opacity-80 hover:opacity-100'
                      }`}
                      title={c.nome}
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* Container da Radiografia Panorâmica com Alinhamento Preciso */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onDoubleClick={handleDoubleClick}
              className={`relative min-h-[520px] bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-800 flex items-center justify-center p-2 shadow-2xl select-none ${
                ferramenta === 'selecionar' ? 'cursor-default' : 'cursor-crosshair'
              }`}
            >
              {/* Wrapper da Imagem + SVG com Transformação Unificada de Zoom e Rotação */}
              <div
                className="relative inline-block max-h-[540px] max-w-full"
                style={{
                  transform: `scale(${zoom}) rotate(${rotacao}deg)`,
                  transformOrigin: 'center center',
                  transition: isDrawing || arrastandoFormaId ? 'none' : 'transform 0.2s ease'
                }}
              >
                <img
                  ref={imageRef}
                  src={exameSelecionado.imagemUrl}
                  alt={exameSelecionado.titulo}
                  onLoad={updateImageSize}
                  style={{
                    filter: `brightness(${brilho}%) contrast(${contraste}%)`,
                    transition: 'filter 0.2s ease'
                  }}
                  className="max-h-[540px] w-auto max-w-full object-contain block pointer-events-none rounded-2xl shadow-lg select-none"
                />

                {/* OVERLAY SVG EXATAMENTE COINCIDENTE COM OS LIMITES DA IMAGEM */}
                <svg
                  style={{
                    width: containerSize.width || '100%',
                    height: containerSize.height || '100%'
                  }}
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                >
                  {formas.map((forma) => renderSvgForma(forma, false))}

                  {ferramenta === 'pontilhado' && pontosPontilhado.length > 0 && (
                    <g opacity="0.8">
                      <polyline
                        points={[...pontosPontilhado, currentPoint || pontosPontilhado[pontosPontilhado.length - 1]]
                          .map((p) => `${pxX(p.x)},${pxY(p.y)}`)
                          .join(' ')}
                        fill="none"
                        stroke={corSelecionada}
                        strokeWidth={espessuraLinha}
                        strokeDasharray={`${espessuraLinha * 3} ${espessuraLinha * 2}`}
                        strokeLinecap="round"
                      />
                      {pontosPontilhado.map((pt, pIdx) => (
                        <circle key={pIdx} cx={pxX(pt.x)} cy={pxY(pt.y)} r={Math.max(2, espessuraLinha + 0.5)} fill={corSelecionada} stroke="#FFFFFF" strokeWidth="1" />
                      ))}
                    </g>
                  )}

                  {isDrawing && startPoint && currentPoint && ferramenta !== 'pontilhado' && (
                    renderSvgForma(
                      {
                        id: 'preview',
                        tipo: ferramenta as any,
                        x1: startPoint.x,
                        y1: startPoint.y,
                        x2: currentPoint.x,
                        y2: currentPoint.y,
                        cor: corSelecionada,
                        espessura: espessuraLinha,
                        medidaMm: ferramenta === 'medicao_implante' ? `${(Math.hypot(currentPoint.x - startPoint.x, currentPoint.y - startPoint.y) * 0.45).toFixed(1)} mm` : undefined
                      },
                      true
                    )
                  )}
                </svg>

                {/* Indicador Alvo da Lupa Ampliada Alinhado 100% sobre a Imagem */}
                {regiaoLupa && (
                  <div
                    style={{ left: `${regiaoLupa.x}%`, top: `${regiaoLupa.y}%` }}
                    className="absolute w-36 h-36 rounded-full border-2 border-teal-400 bg-teal-500/15 -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-2xl flex items-center justify-center text-teal-300 font-extrabold text-xs z-20"
                  >
                    <div className="absolute inset-0 rounded-full border border-teal-300/40 animate-ping"></div>
                    <div className="w-full h-[1px] bg-teal-400/60 absolute"></div>
                    <div className="h-full w-[1px] bg-teal-400/60 absolute"></div>
                    <span className="bg-slate-950/85 px-2 py-0.5 rounded-full border border-teal-500/40 text-[10px] text-teal-300 shadow flex items-center gap-1">
                      <Camera className="w-3 h-3 text-teal-400" /> CLIQUE P/ CAPTURAR
                    </span>
                  </div>
                )}
              </div>

              {/* Indicador de Ferramenta Ativa */}
              <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-bold text-teal-400 flex items-center gap-2 z-20">
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: corSelecionada }}></span>
                {ferramenta === 'lupa'
                  ? 'LUPA: Passe o cursor p/ pré-visualizar ou CLIQUE p/ capturar a imagem!'
                  : ferramenta === 'pontilhado'
                  ? `LINHA PONTILHADA (${espessuraLinha}px): ${pontosPontilhado.length} ponto(s). Duplo clique p/ finalizar!`
                  : `Ferramenta: ${ferramenta.toUpperCase()} (${espessuraLinha}px)`}
              </div>

              {/* Botão de Finalizar Linha Pontilhada */}
              {ferramenta === 'pontilhado' && pontosPontilhado.length >= 2 && (
                <button
                  type="button"
                  onClick={handleFinalizarPontilhadoManualmente}
                  className="absolute top-3 right-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-lg z-20 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Concluir Linha Pontilhada
                </button>
              )}

              {/* Barra Flutuante de Ação Rápida para o Elemento Selecionado */}
              {formaSelecionadaId && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-teal-500/50 text-xs font-bold text-white shadow-2xl flex items-center gap-3 z-30">
                  <span className="text-teal-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" /> Elemento Selecionado (Arraste para mover ou alinhar pontos)
                  </span>
                  <button
                    onClick={handleDeleteFormaSelecionada}
                    className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ml-2"
                    title="Excluir este elemento desenhado (Atalho: Delete ou Backspace)"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Excluir Elemento
                  </button>
                </div>
              )}
            </div>

            {/* Botão de Destaque "Salvar Tudo na Radiografia Panorâmica" */}
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  {formas.length} desenho(s), {recortesLupa.length} recorte(s) de Lupa salvos.
                </span>
                {(formas.length > 0 || pontosPontilhado.length > 0 || recortesLupa.length > 0) && (
                  <button
                    onClick={handleLimparTodosDesenhos}
                    className="text-rose-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Limpar Todos
                  </button>
                )}
              </div>

              <button
                onClick={handleSalvarTudoRadiografia}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs shadow-xl shadow-teal-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Salvar Tudo na Radiografia Panorâmica
              </button>
            </div>

            {capturaSucesso && (
              <div className="bg-teal-500/20 border border-teal-500/40 text-teal-300 p-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
                <Camera className="w-4 h-4 text-teal-400" /> Região ampliada capturada com sucesso! Veja no painel lateral direito.
              </div>
            )}

            {salvoSucesso && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 p-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Todos os desenhos nítidos, recortes de Lupa e medições foram salvos com sucesso!
              </div>
            )}

          </div>

          {/* Painel Lateral Direito: Região Ampliada Capturada & Galeria de Recortes */}
          <div className="space-y-6">

            {/* PAINEL DA LUPA (Ampliação HD em Foco + Captura) */}
            <div className={`p-5 rounded-3xl border shadow-xl space-y-4 ${
              darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-2">
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <LupaIcon className="w-4 h-4 text-teal-500" /> Região Ampliada HD em Foco
                </h3>
                {regiaoLupa && (
                  <button
                    onClick={() => setRegiaoLupa(null)}
                    className="text-slate-400 hover:text-rose-400 text-xs cursor-pointer"
                  >
                    Fechar
                  </button>
                )}
              </div>

              {regiaoLupa ? (
                <div className="space-y-3">
                  <div
                    className="relative h-64 bg-slate-950 rounded-2xl overflow-hidden border-2 border-teal-500 shadow-2xl transition-all"
                    style={{
                      backgroundImage: `url(${exameSelecionado.imagemUrl})`,
                      backgroundPosition: `${regiaoLupa.x}% ${regiaoLupa.y}%`,
                      backgroundSize: `${regiaoLupa.zoomLupa * 100}%`,
                      backgroundRepeat: 'no-repeat',
                      filter: `brightness(${brilho}%) contrast(${contraste}%)`
                    }}
                  >
                    {/* Mira de Foco Diagnóstico Central */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-teal-400/90 rounded-full flex items-center justify-center bg-teal-500/20 shadow-lg">
                        <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                      </div>
                    </div>

                    {/* Seletor de Nível de Foco Macro */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-slate-950/90 backdrop-blur px-2.5 py-1 rounded-xl border border-teal-500/40 shadow-lg">
                      <span className="text-[10px] font-extrabold text-teal-400 mr-1">Zoom:</span>
                      {[2.5, 3.5, 5.0, 7.0].map((z) => (
                        <button
                          key={z}
                          onClick={() => setRegiaoLupa((prev) => prev ? { ...prev, zoomLupa: z } : null)}
                          className={`px-2 py-0.5 text-[10px] font-extrabold rounded-lg transition-all ${
                            regiaoLupa.zoomLupa === z
                              ? 'bg-teal-600 text-white shadow-md'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {z}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 text-[11px]">Foco Exato: X:{Math.round(regiaoLupa.x)}% Y:{Math.round(regiaoLupa.y)}%</span>
                    <button
                      onClick={() => {
                        const novoRecorte: RecorteLupaCapturado = {
                          id: `crop-${Date.now()}`,
                          x: regiaoLupa.x,
                          y: regiaoLupa.y,
                          zoomLupa: regiaoLupa.zoomLupa,
                          dataHora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                          imagemUrl: exameSelecionado.imagemUrl
                        };
                        setRecortesLupa((prev) => [novoRecorte, ...prev]);
                        setCapturaSucesso(true);
                        setTimeout(() => setCapturaSucesso(false), 2500);
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white border border-teal-500 px-3 py-1 rounded-xl text-[11px] font-extrabold flex items-center gap-1 shadow cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" /> Salvar Recorte HD
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-40 rounded-2xl bg-slate-800/40 border border-dashed border-slate-700 flex flex-col items-center justify-center text-center p-4 text-xs text-slate-400 space-y-1">
                  <LupaIcon className="w-6 h-6 text-teal-500 opacity-60" />
                  <p className="font-bold text-slate-300">Nenhuma região selecionada</p>
                  <p className="text-[10px]">Clique na radiografia com a Lupa para capturar a imagem ao lado.</p>
                </div>
              )}
            </div>

            {/* GALERIA DE RECORTES CAPTURADOS PELA LUPA */}
            {recortesLupa.length > 0 && (
              <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center justify-between border-b border-slate-800/40 pb-2">
                  <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-4 h-4" /> Recortes Capturados ({recortesLupa.length})
                  </h4>
                  <button
                    onClick={() => setRecortesLupa([])}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
                  >
                    Limpar Galeria
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  {recortesLupa.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => setRegiaoLupa({ x: rec.x, y: rec.y, zoomLupa: rec.zoomLupa })}
                      className="group relative aspect-video rounded-xl overflow-hidden border border-slate-700 hover:border-teal-400 cursor-pointer shadow transition-all"
                      style={{
                        backgroundImage: `url(${rec.imagemUrl})`,
                        backgroundPosition: `${rec.x}% ${rec.y}%`,
                        backgroundSize: `${rec.zoomLupa * 100}%`,
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-1.5">
                        <span className="text-[9px] font-extrabold text-teal-300 bg-slate-900/80 px-1 rounded">
                          {rec.zoomLupa}x
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRecorteLupa(rec.id);
                          }}
                          className="text-rose-400 hover:text-rose-300 p-0.5 bg-slate-900/80 rounded-full"
                          title="Excluir Recorte"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="absolute bottom-1 left-1 text-[8px] font-bold bg-slate-950/80 text-slate-300 px-1 rounded">
                        {rec.dataHora}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Painel de Laudo Radiográfico */}
            <div className={`p-5 rounded-3xl border shadow-sm space-y-4 ${
              darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-500 bg-teal-500/10 px-2 py-0.5 rounded-md">
                  Laudo Clínico Diagnóstico
                </span>
                <h3 className="font-bold text-base mt-1">{exameSelecionado.titulo}</h3>
                <p className="text-xs text-slate-400">Data: {exameSelecionado.data}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-500" /> Parecer do Radiologista
                </h4>
                <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 text-xs text-slate-300">
                  {exameSelecionado.laudo || 'Reabsorção óssea leve na região molar. Densidade óssea preservada para planejamento de implantes na maxila.'}
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className={`p-12 rounded-3xl border text-center space-y-3 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
        }`}>
          <Maximize2 className="w-10 h-10 text-teal-500 mx-auto opacity-50" />
          <p className="text-xs font-semibold">Nenhum exame radiográfico cadastrado.</p>
          <button
            onClick={() => setModalAberto(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            Adicionar Primeiro Raio-X do Paciente
          </button>
        </div>
      )}

      {/* Modal Adicionar Imagem / Raio-X do Paciente */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`rounded-3xl p-6 max-w-lg w-full shadow-2xl border space-y-4 my-8 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-500" /> Adicionar Raio-X / Exame Diagnóstico
              </h2>
              <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoExame} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1.5">Imagem Radiográfica do Computador</label>
                {novaImagemUrl ? (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-teal-500">
                    <img src={novaImagemUrl} alt="Preview Exame" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNovaImagemUrl('')}
                      className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-full shadow cursor-pointer"
                      title="Trocar Imagem"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-800/40 hover:bg-slate-800 transition-all">
                    <Upload className="w-8 h-8 text-teal-500" />
                    <span className="font-bold text-slate-300">Clique para selecionar imagem de Raio-X</span>
                    <span className="text-[10px] text-slate-400">Formatos aceitos: JPG, PNG, DICOM, WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Título do Exame</label>
                <input
                  type="text"
                  placeholder="Ex: Radiografia Panorâmica Inicial"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  required
                  className={`w-full p-2.5 rounded-xl border ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Tipo de Exame</label>
                  <select
                    value={novoTipo}
                    onChange={(e) => setNovoTipo(e.target.value as any)}
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="Panorâmica">Panorâmica</option>
                    <option value="Periapical">Periapical</option>
                    <option value="Interproximal">Interproximal</option>
                    <option value="Tomografia 3D">Tomografia 3D</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Data do Exame</label>
                  <input
                    type="date"
                    value={novaData}
                    onChange={(e) => setNovaData(e.target.value)}
                    required
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Parecer / Laudo Médico</label>
                <textarea
                  rows={2}
                  placeholder="Anotações diagnósticas ou laudo do exame..."
                  value={novoLaudo}
                  onChange={(e) => setNovoLaudo(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!novaImagemUrl}
                  className={`px-4 py-2 rounded-xl font-bold shadow transition-all cursor-pointer ${
                    novaImagemUrl
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Salvar Raio-X
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão de Radiografia */}
      {modalExcluirAberto && exameSelecionado && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-3xl p-6 max-w-md w-full shadow-2xl border space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">Excluir Exame Radiográfico</h3>
                <p className="text-xs text-slate-400">Esta ação removerá o exame do prontuário.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700">
              Tem certeza que deseja excluir permanentemente o exame <strong className="text-white">"{exameSelecionado.titulo}"</strong>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalExcluirAberto(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onDeleteRadiografia && exameSelecionado) {
                    onDeleteRadiografia(exameSelecionado.id);
                    setExameSelecionado(null);
                  }
                  setModalExcluirAberto(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Sim, Excluir Radiografia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
