import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { getInfoDenteBiblioteca } from '../data/bibliotecaDentes3D';

THREE.Cache.enabled = true;

import type {
  StatusDente,
  DenteInfo,
  CondicaoSuperficie,
  RadiografiaExame,
  FotografiaClinica,
  ProcedimentoTratamento
} from '../types';

import {
  Sparkles,
  Printer,
  X,
  Save,
  CheckCircle2,
  ZoomIn,
  Check,
  Plus,
  Trash2,
  Activity,
  ShieldAlert,
  DollarSign,
  Box,
  LayoutGrid
} from 'lucide-react';

interface OdontogramaProps {
  pacienteNome?: string;
  dentes: Record<number, DenteInfo>;
  onUpdateDente: (
    numero: number,
    status: StatusDente,
    observacoes?: string,
    superficies?: CondicaoSuperficie[]
  ) => void;
  radiografias?: RadiografiaExame[];
  fotografias?: FotografiaClinica[];
  procedimentos?: ProcedimentoTratamento[];
  onAddProcedimento?: (proc: Omit<ProcedimentoTratamento, 'id'>) => void;
  darkMode?: boolean;
}

export type ModoVisualizacaoArcada = 'frontal' | 'maxila' | 'mandibula' | 'individual' | 'decidua';

export interface ProcedimentoOdontograma {
  id: string;
  denteNumero: number;
  face?: string;
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
  'Restauração Provisória': { bg: 'bg-cyan-500/10 hover:bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/40', badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', hex: '#06B6D4' },
  'Tratamento Canal': { bg: 'bg-amber-500/10 hover:bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30', hex: '#F59E0B' },
  'Extração Indicada': { bg: 'bg-purple-500/10 hover:bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/40', badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30', hex: '#A855F7' },
  'Ausente': { bg: 'bg-slate-800/60 hover:bg-slate-800/80', text: 'text-slate-400', border: 'border-slate-700/60', badge: 'bg-slate-800/80 text-slate-400 border-slate-700', hex: '#64748B' },
  'Implante': { bg: 'bg-teal-500/10 hover:bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/40', badge: 'bg-teal-500/20 text-teal-400 border-teal-500/30', hex: '#14B8A6' },
  'Coroa': { bg: 'bg-indigo-500/10 hover:bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/40', badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', hex: '#6366F1' },
  'Faceta': { bg: 'bg-pink-500/10 hover:bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/40', badge: 'bg-pink-500/20 text-pink-400 border-pink-500/30', hex: '#EC4899' },
  'Fratura': { bg: 'bg-red-500/10 hover:bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40', badge: 'bg-red-500/20 text-red-400 border-red-500/30', hex: '#DC2626' },
  'Desgaste': { bg: 'bg-stone-500/10 hover:bg-stone-500/20', text: 'text-stone-400', border: 'border-stone-500/40', badge: 'bg-stone-500/20 text-stone-400 border-stone-500/30', hex: '#78716C' },
  'Mobilidade': { bg: 'bg-yellow-500/10 hover:bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40', badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', hex: '#EAB308' },
  'Reabsorção': { bg: 'bg-orange-600/10 hover:bg-orange-600/20', text: 'text-orange-400', border: 'border-orange-600/40', badge: 'bg-orange-600/20 text-orange-400 border-orange-600/30', hex: '#EA580C' },
  'Lesão': { bg: 'bg-orange-500/10 hover:bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30', hex: '#F97316' },
  'Tratamento Periodontal': { bg: 'bg-emerald-600/10 hover:bg-emerald-600/20', text: 'text-emerald-400', border: 'border-emerald-600/40', badge: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30', hex: '#059669' },
  'Selante': { bg: 'bg-lime-500/10 hover:bg-lime-500/20', text: 'text-lime-400', border: 'border-lime-500/40', badge: 'bg-lime-500/20 text-lime-400 border-lime-500/30', hex: '#84CC16' },
  'Dente Impactado': { bg: 'bg-violet-500/10 hover:bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/40', badge: 'bg-violet-500/20 text-violet-400 border-violet-500/30', hex: '#8B5CF6' },
  'Outro': { bg: 'bg-slate-700/10 hover:bg-slate-700/20', text: 'text-slate-300', border: 'border-slate-600/40', badge: 'bg-slate-700/20 text-slate-300 border-slate-600/30', hex: '#94A3B8' }
};

const quadrant1 = [18, 17, 16, 15, 14, 13, 12, 11];
const quadrant2 = [21, 22, 23, 24, 25, 26, 27, 28];
const quadrant4 = [48, 47, 46, 45, 44, 43, 42, 41];
const quadrant3 = [31, 32, 33, 34, 35, 36, 37, 38];

const getNomeAnatomicoDente = (num: number) => {
  const info = getInfoDenteBiblioteca(num);
  return info ? info.nome : `Dente #${num}`;
};

// Componente de Ilustração Anatômica de Dente Real em SVG com Notação e Tom Escuro Padrão
const DenteAnatomicoSVG = ({ numero, status, corHex, tamanho = 54 }: { numero: number; status: StatusDente; corHex: string; tamanho?: number }) => {
  const d = numero % 10;
  const isSuperior = numero >= 11 && numero <= 28;

  const rootFill = status === 'Ausente' ? '#1E293B' : status === 'Implante' ? '#0D9488' : '#0F172A';
  const crownFill = status === 'Ausente' ? '#0F172A' : status === 'Coroa' ? '#4F46E5' : '#1E293B';

  if (d >= 6) {
    return (
      <svg width={tamanho} height={tamanho * 1.3} viewBox="0 0 100 130" fill="none" className="transition-all duration-300">
        <path
          d={isSuperior ? "M25 65 L20 120 C18 125, 32 125, 35 120 L45 70 L55 70 L65 120 C68 125, 82 125, 80 120 L75 65 Z" : "M25 65 L20 10 C18 5, 32 5, 35 10 L45 60 L55 60 L65 10 C68 5, 82 5, 80 10 L75 65 Z"}
          fill={rootFill}
          stroke={corHex}
          strokeWidth="3.5"
        />
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
        <path d="M20 40 Q 35 28, 50 40 Q 65 28, 80 40" stroke={corHex} strokeWidth="3" fill="none" />
        <circle cx="50" cy="62" r="10" fill={corHex} opacity="0.35" />
      </svg>
    );
  }

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

// ============================================================================
// COMPONENTE CANVAS 3D INTERATIVO TIPO THREE.JS
// ============================================================================
const Tooth3DCanvas: React.FC<{
  denteNumero: number;
  denteInfo?: DenteInfo;
  modoArcada: ModoVisualizacaoArcada;
  mostrarInterno?: boolean;
  dentesData: Record<number, DenteInfo>;
  darkMode?: boolean;
  gltfUrl?: string | null;
  autoRotate?: boolean;
  onSelectDente?: (numero: number) => void;
}> = ({
  denteNumero,
  modoArcada,
  mostrarInterno = false,
  dentesData,
  darkMode = true,
  gltfUrl,
  autoRotate = false,
  onSelectDente
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);

  const [hoveredToothNum, setHoveredToothNum] = useState<number | null>(null);
  const hoveredToothNumRef = useRef<number | null>(null);
  const onSelectDenteRef = useRef(onSelectDente);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  useEffect(() => {
    onSelectDenteRef.current = onSelectDente;
  }, [onSelectDente]);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth || 500;
    const height = mountRef.current.clientHeight || 450;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(darkMode ? 0x030712 : 0xf8fafc);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 1.5, 4);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err) {
      console.warn('WebGL não suportado:', err);
      if (mountRef.current) {
        mountRef.current.innerHTML = `
          <div class="w-full h-full min-h-[380px] flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800">
            <span class="text-sm font-extrabold text-teal-400 mb-1">Visualização 2D Ativa</span>
            <p class="text-xs text-slate-500 max-w-xs">Alternado para modo 2D clássico com diagramas de faces e imagens verdes.</p>
          </div>
        `;
      }
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    const mainGroup = new THREE.Group();
    mainGroupRef.current = mainGroup;
    scene.add(mainGroup);

    if (gltfUrl) {
      const loader = new GLTFLoader();
      loader.load(gltfUrl, (gltf) => {
        mainGroup.add(gltf.scene);
      });
    } else {
      const dentesParaRenderizar = [
        ...quadrant1, ...quadrant2, ...quadrant4, ...quadrant3
      ];

      dentesParaRenderizar.forEach((num) => {
        const infoBib = getInfoDenteBiblioteca(num);
        const glbPath = infoBib.modelo;
        const dente3D = new THREE.Group();
        dente3D.userData = { numero: num };

        const loader = new GLTFLoader();
        loader.load(
          glbPath,
          (gltf) => {
            dente3D.add(gltf.scene);
          },
          undefined,
          () => {
            const fallbackMesh = new THREE.Mesh(
              new THREE.CylinderGeometry(0.3, 0.2, 0.8, 12),
              new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2 })
            );
            dente3D.add(fallbackMesh);
          }
        );

        const isUpper = num >= 11 && num <= 28;
        const isRight = (num >= 11 && num <= 18) || (num >= 41 && num <= 48);
        const posInSeq = num % 10;

        const angleStep = 0.22;
        const angle = (isRight ? -posInSeq : posInSeq) * angleStep;
        const radius = 5.2;
        const x = Math.sin(angle) * radius;
        const z = (Math.cos(angle) - 1) * radius;
        const y = isUpper ? 0.35 : -0.35;

        dente3D.position.set(x, y, z);
        dente3D.rotation.y = angle;
        dente3D.scale.set(0.6, 0.6, 0.6);

        mainGroup.add(dente3D);
      });
    }

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handlePointerMove = (event: MouseEvent) => {
      if (!mountRef.current || !cameraRef.current || !mainGroupRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(mainGroupRef.current.children, true);

      let foundNum: number | null = null;
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && obj !== mainGroupRef.current) {
          if (obj.userData && obj.userData.numero) {
            foundNum = obj.userData.numero;
            break;
          }
          obj = obj.parent;
        }
      }
      if (foundNum !== hoveredToothNumRef.current) {
        hoveredToothNumRef.current = foundNum;
        setHoveredToothNum(foundNum);
      }
    };

    const handlePointerClick = (event: MouseEvent) => {
      if (!mountRef.current || !cameraRef.current || !mainGroupRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(mainGroupRef.current.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && obj !== mainGroupRef.current) {
          if (obj.userData && obj.userData.numero) {
            if (onSelectDenteRef.current) {
              onSelectDenteRef.current(obj.userData.numero);
            }
            break;
          }
          obj = obj.parent;
        }
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousemove', handlePointerMove);
    domElem.addEventListener('click', handlePointerClick);

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElem.removeEventListener('mousemove', handlePointerMove);
      domElem.removeEventListener('click', handlePointerClick);
      window.removeEventListener('resize', handleResize);
    };
  }, [denteNumero, modoArcada, mostrarInterno, dentesData, darkMode, gltfUrl, autoRotate]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[380px] sm:min-h-[480px] cursor-grab active:cursor-grabbing relative overflow-hidden rounded-2xl"
    >
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-extrabold text-teal-400">
        <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
        <span>MOTOR 3D REAL-TIME</span>
      </div>

      {hoveredToothNum && (
        <div className="absolute top-3 right-3 z-20 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-teal-500/50 shadow-2xl pointer-events-none flex flex-col text-right">
          <span className="text-[10px] font-extrabold text-teal-400 uppercase tracking-wider">
            DENTE #{hoveredToothNum}
          </span>
          <span className="text-xs font-extrabold text-white">
            {getInfoDenteBiblioteca(hoveredToothNum).nome}
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL ODONTOGRAMA PROFISSIONAL (2D CLÁSSICO E 3D COMBINADOS)
// ============================================================================
export const Odontograma: React.FC<OdontogramaProps> = ({
  pacienteNome,
  dentes,
  onUpdateDente
}) => {
  // Modo de Exibição Principal: '2D' por padrão (com quadrados, verde e faces)
  const [modoDimensao, setModoDimensao] = useState<'2D' | '3D'>('2D');
  
  const [denteSelecionado, setDenteSelecionado] = useState<number | null>(16);
  const [denteModalAmpliado, setDenteModalAmpliado] = useState<number | null>(null);
  const [statusTemp, setStatusTemp] = useState<StatusDente>('Saudável');
  const [faceSelecionada, setFaceSelecionada] = useState<string>('Oclusal/Incisal');
  const [obsTemp, setObsTemp] = useState<string>('');
  const [salvoSucesso, setSalvoSucesso] = useState<boolean>(false);

  // Procedimentos Registrados
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

  const handleSelectDente = useCallback((num: number) => {
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
  }, [dentes]);

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

  // KPIs
  const totalCaries = Object.values(dentes).filter((d) => d.status === 'Cárie').length;
  const totalCanais = Object.values(dentes).filter((d) => d.status === 'Tratamento Canal').length;
  const totalImplantes = Object.values(dentes).filter((d) => d.status === 'Implante').length;
  const totalRestaurados = Object.values(dentes).filter((d) => d.status === 'Restaurado').length;
  const valorTotalOrcamento = procedimentosProntuario.reduce((acc, p) => acc + p.valor, 0);

  // Renderizador individual do Card Dental 2D em Quadrado com Notação de Faces (Compacto e Responsivo)
  const renderDenteCard = (num: number) => {
    const info = dentes[num] || { numero: num, status: 'Saudável' };
    const cor = statusCores[info.status] || statusCores['Saudável'];
    const isSelected = denteSelecionado === num;

    return (
      <button
        key={num}
        onClick={() => handleSelectDente(num)}
        className={`flex-1 min-w-[28px] max-w-[46px] sm:min-w-[36px] sm:max-w-[52px] flex flex-col items-center justify-between p-1 sm:p-1.5 rounded-xl border transition-all cursor-pointer relative group ${
          cor.bg
        } ${isSelected ? 'border-teal-400 ring-2 ring-teal-400/80 scale-105 shadow-lg z-10' : cor.border}`}
      >
        <span className="text-[10px] sm:text-[11px] font-black text-slate-200">{num}</span>

        {/* Ilustração Anatômica em Imagem SVG com Tom Verde / Colorido (Compacto) */}
        <div className="my-0.5 flex items-center justify-center">
          <DenteAnatomicoSVG numero={num} status={info.status} corHex={cor.hex} tamanho={28} />
        </div>

        {/* Grade de Seleção das 5 Faces do Dente em Quadrados (V, O, L) */}
        <div className="w-full grid grid-cols-3 gap-0.5 my-0.5 text-[7px] sm:text-[8px] font-black text-center">
          <span className="bg-slate-950/90 text-slate-300 rounded border border-slate-700/60 leading-none py-0.5">V</span>
          <span className="bg-slate-950/90 text-teal-300 rounded border border-slate-700/60 leading-none py-0.5">O</span>
          <span className="bg-slate-950/90 text-slate-300 rounded border border-slate-700/60 leading-none py-0.5">L</span>
        </div>

        <span className={`text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded ${cor.badge} truncate max-w-full`}>
          {info.status}
        </span>

        <div className="absolute inset-0 bg-teal-950/80 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-opacity">
          <ZoomIn className="w-4 h-4 text-teal-300" />
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER PRONTUÁRIO DENTAL ONDOCTOR */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/20">
            Prontuário Odontológico Digital Ondoctor
          </span>
          <h2 className="text-xl font-extrabold flex items-center gap-2 mt-1 text-white">
            <Sparkles className="w-6 h-6 text-teal-400" /> Odontograma Buco-Maxilo & Ficha Clínica
          </h2>
          <p className="text-xs text-slate-400">
            {pacienteNome ? `Prontuário clínico ativo do paciente: ${pacienteNome}` : 'Registro gráfico bucal com imagens em verde, faces dentárias e orçamento.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Modo: 2D Clássico (Padrão) vs 3D */}
          <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center gap-1 shadow-inner">
            <button
              onClick={() => setModoDimensao('2D')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                modoDimensao === '2D'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Modo 2D Clássico (Quadrados)
            </button>

            <button
              onClick={() => setModoDimensao('3D')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                modoDimensao === '3D'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" /> Modo 3D Realista
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2 rounded-2xl text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow"
          >
            <Printer className="w-4 h-4 text-teal-400" /> Imprimir (PDF)
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

      {/* 2. KPIS RESUMO DA SAÚDE BUCAL */}
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

      {/* 3. LEGENDA DE CONDIÇÕES CLÍNICAS */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl flex flex-wrap items-center justify-center gap-3 text-xs">
        {Object.entries(statusCores).map(([st, c]) => (
          <div key={st} className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-xl border border-slate-800">
            <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: c.hex, borderColor: c.hex }} />
            <span className="font-bold text-slate-300 text-[11px]">{st}</span>
          </div>
        ))}
      </div>

      {/* 4. ÁREA PRINCIPAL DO ODONTOGRAMA (2D CLÁSSICO OU 3D) */}
      {modoDimensao === '2D' ? (
        /* VISUALIZAÇÃO 2D EM QUADRADOS E CORES VERDES CLÁSSICAS */
        <div className="p-3.5 sm:p-5 rounded-3xl border border-slate-800 bg-slate-900 text-white shadow-xl space-y-4">
          
          {/* ARCADA SUPERIOR (Quadrantes 1 e 2) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                1. Arcada Maxilar Superior (Notação FDI 18 a 28)
              </h3>
              <span className="text-[10px] text-slate-400 hidden sm:inline">Clique em qualquer quadrado dental para abrir a ficha de faces</span>
            </div>

            <div className="flex items-center justify-between gap-1 sm:gap-2 w-full">
              {/* Quadrante 1 (18-11) */}
              <div className="flex-1 flex gap-1 sm:gap-1.5 bg-slate-950/70 p-1.5 sm:p-2 rounded-2xl border border-slate-800/80 shadow-inner overflow-hidden">
                {quadrant1.map(renderDenteCard)}
              </div>

              <div className="w-1 h-12 bg-teal-500/40 rounded-full flex-shrink-0"></div>

              {/* Quadrante 2 (21-28) */}
              <div className="flex-1 flex gap-1 sm:gap-1.5 bg-slate-950/70 p-1.5 sm:p-2 rounded-2xl border border-slate-800/80 shadow-inner overflow-hidden">
                {quadrant2.map(renderDenteCard)}
              </div>
            </div>
          </div>

          {/* ARCADA INFERIOR (Quadrantes 4 e 3) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                2. Arcada Mandibular Inferior (Notação FDI 48 a 38)
              </h3>
              <span className="text-[10px] text-slate-400 hidden sm:inline">Notação por cores: Verde (Saudável), Vermelho (Cárie), Azul (Restaurado)</span>
            </div>

            <div className="flex items-center justify-between gap-1 sm:gap-2 w-full">
              {/* Quadrante 4 (48-41) */}
              <div className="flex-1 flex gap-1 sm:gap-1.5 bg-slate-950/70 p-1.5 sm:p-2 rounded-2xl border border-slate-800/80 shadow-inner overflow-hidden">
                {quadrant4.map(renderDenteCard)}
              </div>

              <div className="w-1 h-12 bg-teal-500/40 rounded-full flex-shrink-0"></div>

              {/* Quadrante 3 (31-38) */}
              <div className="flex-1 flex gap-1 sm:gap-1.5 bg-slate-950/70 p-1.5 sm:p-2 rounded-2xl border border-slate-800/80 shadow-inner overflow-hidden">
                {quadrant3.map(renderDenteCard)}
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* VISUALIZAÇÃO 3D REALISTA */
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl p-4">
          <Tooth3DCanvas
            denteNumero={denteSelecionado || 16}
            denteInfo={dentes[denteSelecionado || 16]}
            modoArcada="frontal"
            dentesData={dentes}
            darkMode={true}
            onSelectDente={handleSelectDente}
          />
        </div>
      )}

      {/* 5. TABELA DE PROCEDIMENTOS DO PRONTUÁRIO DENTAL */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-teal-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Plano de Tratamentos & Histórico Odontológico
          </h3>
          <span className="text-xs text-slate-400 font-bold">
            Total: {procedimentosProntuario.length} Procedimento(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                <th className="p-3">Data</th>
                <th className="p-3">Dente #</th>
                <th className="p-3">Face Dental</th>
                <th className="p-3">Procedimento / Tratamento</th>
                <th className="p-3">Profissional</th>
                <th className="p-3">Status</th>
                <th className="p-3">Valor</th>
                <th className="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {procedimentosProntuario.map((proc) => (
                <tr key={proc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 text-slate-400 font-medium">{proc.data}</td>
                  <td className="p-3">
                    <span className="font-extrabold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                      Dente {proc.denteNumero}
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

      {/* MODAL HD DE ANÁLISE DE DENTE AMPLIADO COM SELEÇÃO POR FACES E DIAGNÓSTICO */}
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
              
              {/* Ilustração HD Escura e Seletor de Faces Dentárias em Quadrados */}
              <div className="bg-slate-950 p-6 rounded-3xl border-2 border-teal-500/40 flex flex-col items-center justify-center relative shadow-inner">
                <DenteAnatomicoSVG
                  numero={denteModalAmpliado}
                  status={statusTemp}
                  corHex={statusCores[statusTemp].hex}
                  tamanho={120}
                />

                {/* Grade de Seleção de Faces em Quadrados */}
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
                <Save className="w-4 h-4" /> Salvar no Prontuário
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
