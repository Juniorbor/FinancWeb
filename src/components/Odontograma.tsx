import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { getInfoDenteBiblioteca } from '../data/bibliotecaDentes3D';

THREE.Cache.enabled = true;

import type {
  StatusDente,
  DenteInfo,
  SuperficieDente,
  CondicaoSuperficie,
  RadiografiaExame,
  FotografiaClinica,
  ProcedimentoTratamento
} from '../types';

import {
  Sparkles,
  Layers,
  Printer,
  Save,
  ArrowLeft,
  X,
  ImageIcon,
  Bot,
  Tag,
  Info,
  Upload,
  RotateCw
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

// NOTAÇÃO DE DENTES FDI 3950
const DENTES_PERMANENTES_MAXILA_DIREITA = [18, 17, 16, 15, 14, 13, 12, 11];
const DENTES_PERMANENTES_MAXILA_ESQUERDA = [21, 22, 23, 24, 25, 26, 27, 28];
const DENTES_PERMANENTES_MANDIBULA_ESQUERDA = [31, 32, 33, 34, 35, 36, 37, 38];
const DENTES_PERMANENTES_MANDIBULA_DIREITA = [48, 47, 46, 45, 44, 43, 42, 41];

const DENTES_DECIDUOS_MAXILA_DIREITA = [55, 54, 53, 52, 51];
const DENTES_DECIDUOS_MAXILA_ESQUERDA = [61, 62, 63, 64, 65];
const DENTES_DECIDUOS_MANDIBULA_ESQUERDA = [71, 72, 73, 74, 75];
const DENTES_DECIDUOS_MANDIBULA_DIREITA = [85, 84, 83, 82, 81];

export const CORES_STATUS_CLINICO: Record<StatusDente, { bg: string; text: string; border: string; hex: string }> = {
  'Saudável': { bg: 'bg-emerald-500/10 hover:bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', hex: '#10B981' },
  'Cárie': { bg: 'bg-rose-500/15 hover:bg-rose-500/25', text: 'text-rose-400', border: 'border-rose-500/40', hex: '#F43F5E' },
  'Restaurado': { bg: 'bg-sky-500/15 hover:bg-sky-500/25', text: 'text-sky-400', border: 'border-sky-500/40', hex: '#38BDF8' },
  'Restauração Provisória': { bg: 'bg-cyan-500/15 hover:bg-cyan-500/25', text: 'text-cyan-400', border: 'border-cyan-500/40', hex: '#06B6D4' },
  'Tratamento Canal': { bg: 'bg-amber-500/15 hover:bg-amber-500/25', text: 'text-amber-400', border: 'border-amber-500/40', hex: '#F59E0B' },
  'Extração Indicada': { bg: 'bg-purple-500/15 hover:bg-purple-500/25', text: 'text-purple-400', border: 'border-purple-500/40', hex: '#A855F7' },
  'Ausente': { bg: 'bg-slate-800/80 hover:bg-slate-800', text: 'text-slate-400', border: 'border-slate-700', hex: '#64748B' },
  'Implante': { bg: 'bg-teal-500/15 hover:bg-teal-500/25', text: 'text-teal-400', border: 'border-teal-500/40', hex: '#14B8A6' },
  'Coroa': { bg: 'bg-indigo-500/15 hover:bg-indigo-500/25', text: 'text-indigo-400', border: 'border-indigo-500/40', hex: '#6366F1' },
  'Faceta': { bg: 'bg-violet-500/15 hover:bg-violet-500/25', text: 'text-violet-400', border: 'border-violet-500/40', hex: '#8B5CF6' },
  'Fratura': { bg: 'bg-red-600/20 hover:bg-red-600/30', text: 'text-red-400', border: 'border-red-500/50', hex: '#EF4444' },
  'Desgaste': { bg: 'bg-orange-500/15 hover:bg-orange-500/25', text: 'text-orange-400', border: 'border-orange-500/40', hex: '#F97316' },
  'Mobilidade': { bg: 'bg-yellow-500/15 hover:bg-yellow-500/25', text: 'text-yellow-400', border: 'border-yellow-500/40', hex: '#EAB308' },
  'Reabsorção': { bg: 'bg-pink-500/15 hover:bg-pink-500/25', text: 'text-pink-400', border: 'border-pink-500/40', hex: '#EC4899' },
  'Lesão': { bg: 'bg-rose-600/20 hover:bg-rose-600/30', text: 'text-rose-500', border: 'border-rose-600/50', hex: '#E11D48' },
  'Tratamento Periodontal': { bg: 'bg-emerald-600/15 hover:bg-emerald-600/25', text: 'text-emerald-300', border: 'border-emerald-600/40', hex: '#059669' },
  'Selante': { bg: 'bg-blue-500/15 hover:bg-blue-500/25', text: 'text-blue-400', border: 'border-blue-500/40', hex: '#3B82F6' },
  'Dente Impactado': { bg: 'bg-slate-700/80 hover:bg-slate-700', text: 'text-slate-300', border: 'border-slate-600', hex: '#475569' },
  'Outro': { bg: 'bg-slate-800 hover:bg-slate-700', text: 'text-slate-300', border: 'border-slate-700', hex: '#94A3B8' }
};

export const getNomeAnatomicoDente = (num: number): { nome: string; arcada: string; lado: string; tipo: string } => {
  const isDeciduo = num >= 51 && num <= 85;
  const d = num % 10;
  
  let arcada = 'Superior (Maxila)';
  let lado = 'Direito';
  
  if (num >= 21 && num <= 28) { arcada = 'Superior (Maxila)'; lado = 'Esquerdo'; }
  else if (num >= 31 && num <= 38) { arcada = 'Inferior (Mandíbula)'; lado = 'Esquerdo'; }
  else if (num >= 41 && num <= 48) { arcada = 'Inferior (Mandíbula)'; lado = 'Direito'; }
  else if (num >= 61 && num <= 65) { arcada = 'Superior Decídua'; lado = 'Esquerdo'; }
  else if (num >= 71 && num <= 75) { arcada = 'Inferior Decídua'; lado = 'Esquerdo'; }
  else if (num >= 81 && num <= 85) { arcada = 'Inferior Decídua'; lado = 'Direito'; }
  else if (num >= 51 && num <= 55) { arcada = 'Superior Decídua'; lado = 'Direito'; }

  let nome = '';
  let tipo = 'Incisivo';

  if (!isDeciduo) {
    if (d === 1) { nome = 'Incisivo Central'; tipo = 'Incisivo'; }
    else if (d === 2) { nome = 'Incisivo Lateral'; tipo = 'Incisivo'; }
    else if (d === 3) { nome = 'Canino'; tipo = 'Canino'; }
    else if (d === 4) { nome = 'Primeiro Pré-Molar'; tipo = 'Pré-Molar'; }
    else if (d === 5) { nome = 'Segundo Pré-Molar'; tipo = 'Pré-Molar'; }
    else if (d === 6) { nome = 'Primeiro Molar'; tipo = 'Molar'; }
    else if (d === 7) { nome = 'Segundo Molar'; tipo = 'Molar'; }
    else if (d === 8) { nome = 'Terceiro Molar (Siso)'; tipo = 'Terceiro Molar'; }
  } else {
    if (d === 1) { nome = 'Incisivo Central Decíduo'; tipo = 'Incisivo Infantil'; }
    else if (d === 2) { nome = 'Incisivo Lateral Decíduo'; tipo = 'Incisivo Infantil'; }
    else if (d === 3) { nome = 'Canino Decíduo'; tipo = 'Canino Infantil'; }
    else if (d === 4) { nome = 'Primeiro Molar Decíduo'; tipo = 'Molar Infantil'; }
    else if (d === 5) { nome = 'Segundo Molar Decíduo'; tipo = 'Molar Infantil'; }
  }

  return { nome: `${nome} ${lado}`, arcada, lado, tipo };
};

// ============================================================================
// GERADOR PROCEDURAL DE GEOMETRIA 3D DE DENTES ANATÔMICOS (THREE.JS)
// ============================================================================
const criarGeometriaDente3D = (numero: number) => {
  const d = numero % 10;
  const isSuperior = (numero >= 11 && numero <= 28) || (numero >= 51 && numero <= 65);
  const group = new THREE.Group();

  // Materiais PBR Anatômicos Fotorrealistas (Idênticos ao modelo clínico anexo)
  const esmalteMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf6ede4, // Tom marfim/porcelana anatômico
    roughness: 0.12,
    metalness: 0.02,
    transmission: 0.14,
    ior: 1.55,
    clearcoat: 0.95,
    clearcoatRoughness: 0.03,
    reflectivity: 0.92
  });

  const coloMaterial = new THREE.MeshStandardMaterial({
    color: 0xe6cba7, // Colo do dente (transição esmalte-cemento)
    roughness: 0.35,
    metalness: 0.0
  });

  const raizMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8b88f, // Cemento radicular anatômico beige/amarelado
    roughness: 0.50,
    metalness: 0.0
  });

  const polpaMaterial = new THREE.MeshStandardMaterial({
    color: 0xbe123c,
    emissive: 0x881337,
    roughness: 0.25
  });

  const dentinaMaterial = new THREE.MeshStandardMaterial({
    color: 0xe2c69b,
    roughness: 0.45,
    transparent: true,
    opacity: 0.88
  });

  // 1. INCISIVOS (Central e Lateral: 1, 2)
  if (d === 1 || d === 2) {
    // Coroa Anatômica em Pá/Cinzel
    const coroaGeo = new THREE.CylinderGeometry(0.55, 0.42, 1.25, 32);
    const pos = coroaGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      let z = pos.getZ(i);
      if (y > 0.2) {
        pos.setZ(i, z * 0.35); // Bordo incisal afinado e anatômico
      }
    }
    coroaGeo.computeVertexNormals();
    const coroaMesh = new THREE.Mesh(coroaGeo, esmalteMaterial);
    coroaMesh.position.y = isSuperior ? 0.65 : -0.65;
    coroaMesh.name = 'coroa';
    group.add(coroaMesh);

    // Colo cervical
    const coloGeo = new THREE.CylinderGeometry(0.43, 0.40, 0.2, 32);
    const coloMesh = new THREE.Mesh(coloGeo, coloMaterial);
    coloMesh.position.y = isSuperior ? 1.28 : -1.28;
    group.add(coloMesh);

    // Raiz Única Cônica Elegante
    const raizGeo = new THREE.CylinderGeometry(0.40, 0.08, 1.85, 32);
    const posR = raizGeo.attributes.position;
    for (let i = 0; i < posR.count; i++) {
      let y = posR.getY(i);
      let z = posR.getZ(i);
      if (y < -0.4) {
        posR.setZ(i, z + (y + 0.4) * 0.15); // Curvatura apical leve
      }
    }
    raizGeo.computeVertexNormals();
    const raizMesh = new THREE.Mesh(raizGeo, raizMaterial);
    raizMesh.position.y = isSuperior ? 2.2 : -2.2;
    raizMesh.rotation.x = isSuperior ? 0 : Math.PI;
    raizMesh.name = 'raiz';
    group.add(raizMesh);

    // Polpa radicular interna
    const polpaGeo = new THREE.CylinderGeometry(0.08, 0.02, 2.4, 12);
    const polpaMesh = new THREE.Mesh(polpaGeo, polpaMaterial);
    polpaMesh.position.y = isSuperior ? 1.3 : -1.3;
    polpaMesh.name = 'polpa';
    group.add(polpaMesh);
  }
  // 2. CANINOS (3)
  else if (d === 3) {
    // Coroa Anatômica Lanceolada com Cúspide Central Proeminente
    const coroaGeo = new THREE.CylinderGeometry(0.58, 0.44, 1.38, 32);
    const pos = coroaGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      let x = pos.getX(i);
      let z = pos.getZ(i);
      if (y > 0.3) {
        pos.setY(i, y + (0.3 - Math.abs(x) * 0.4)); // Ponta de cúspide lanceolada
        pos.setZ(i, z * 0.5);
      }
    }
    coroaGeo.computeVertexNormals();
    const coroaMesh = new THREE.Mesh(coroaGeo, esmalteMaterial);
    coroaMesh.position.y = isSuperior ? 0.7 : -0.7;
    coroaMesh.name = 'coroa';
    group.add(coroaMesh);

    // Colo cervical
    const coloGeo = new THREE.CylinderGeometry(0.45, 0.42, 0.2, 32);
    const coloMesh = new THREE.Mesh(coloGeo, coloMaterial);
    coloMesh.position.y = isSuperior ? 1.38 : -1.38;
    group.add(coloMesh);

    // Raiz Canina Única Longa e Robusta
    const raizGeo = new THREE.CylinderGeometry(0.43, 0.08, 2.3, 32);
    const raizMesh = new THREE.Mesh(raizGeo, raizMaterial);
    raizMesh.position.y = isSuperior ? 2.5 : -2.5;
    raizMesh.rotation.x = isSuperior ? 0 : Math.PI;
    raizMesh.name = 'raiz';
    group.add(raizMesh);

    const polpaGeo = new THREE.CylinderGeometry(0.09, 0.02, 2.8, 12);
    const polpaMesh = new THREE.Mesh(polpaGeo, polpaMaterial);
    polpaMesh.position.y = isSuperior ? 1.4 : -1.4;
    polpaMesh.name = 'polpa';
    group.add(polpaMesh);
  }
  // 3. PRÉ-MOLARES (4, 5)
  else if (d === 4 || d === 5) {
    // Coroa Bicúspide Ovalada com Sulco Central
    const coroaGeo = new THREE.CylinderGeometry(0.62, 0.48, 1.28, 32);
    const pos = coroaGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      let x = pos.getX(i);
      if (y > 0.35) {
        pos.setY(i, y - Math.abs(x) * 0.28); // Sulco oclusal central e 2 cúspides
      }
    }
    coroaGeo.computeVertexNormals();
    const coroaMesh = new THREE.Mesh(coroaGeo, esmalteMaterial);
    coroaMesh.position.y = isSuperior ? 0.65 : -0.65;
    coroaMesh.name = 'coroa';
    group.add(coroaMesh);

    // Colo cervical
    const coloGeo = new THREE.CylinderGeometry(0.49, 0.44, 0.2, 32);
    const coloMesh = new THREE.Mesh(coloGeo, coloMaterial);
    coloMesh.position.y = isSuperior ? 1.30 : -1.30;
    group.add(coloMesh);

    // Raízes Pré-Molares Anatômicas
    const numR = (isSuperior && d === 4) ? 2 : 1;
    for (let r = 0; r < numR; r++) {
      const raizGeo = new THREE.CylinderGeometry(0.32, 0.07, 1.95, 24);
      const raizMesh = new THREE.Mesh(raizGeo, raizMaterial);
      const offsetX = numR > 1 ? (r === 0 ? 0.14 : -0.14) : 0;
      raizMesh.position.set(offsetX, isSuperior ? 2.25 : -2.25, 0);
      raizMesh.rotation.x = isSuperior ? 0 : Math.PI;
      raizMesh.name = 'raiz';
      group.add(raizMesh);
    }

    const polpaGeo = new THREE.CylinderGeometry(0.08, 0.02, 2.5, 12);
    const polpaMesh = new THREE.Mesh(polpaGeo, polpaMaterial);
    polpaMesh.position.y = isSuperior ? 1.3 : -1.3;
    polpaMesh.name = 'polpa';
    group.add(polpaMesh);
  }
  // 4. MOLARES (6, 7, 8)
  else {
    // Coroa Molar Quadricúspide com Sulcos Anatômicos
    const coroaGeo = new THREE.BoxGeometry(1.25, 1.15, 1.15, 16, 16, 16);
    const pos = coroaGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      let x = pos.getX(i);
      let z = pos.getZ(i);
      if (y > 0.3) {
        const distCenter = Math.sqrt(x * x + z * z);
        pos.setY(i, y - (0.35 - Math.min(0.28, distCenter * 0.4)));
      }
    }
    coroaGeo.computeVertexNormals();
    const coroaMesh = new THREE.Mesh(coroaGeo, esmalteMaterial);
    coroaMesh.position.y = isSuperior ? 0.60 : -0.60;
    coroaMesh.name = 'coroa';
    group.add(coroaMesh);

    // Colo cervical
    const coloGeo = new THREE.BoxGeometry(1.15, 0.2, 1.05);
    const coloMesh = new THREE.Mesh(coloGeo, coloMaterial);
    coloMesh.position.y = isSuperior ? 1.20 : -1.20;
    group.add(coloMesh);

    // Raízes Molares com Curvatura Distal Anatômica (3 na maxila, 2 na mandíbula)
    const numRaizes = isSuperior ? 3 : 2;
    for (let r = 0; r < numRaizes; r++) {
      const raizGeo = new THREE.CylinderGeometry(0.28, 0.06, 2.0, 24);
      const raizMesh = new THREE.Mesh(raizGeo, raizMaterial);
      const angle = (r / numRaizes) * Math.PI * 2;
      const offsetX = Math.cos(angle) * 0.32;
      const offsetZ = Math.sin(angle) * 0.32;
      raizMesh.position.set(offsetX, isSuperior ? 2.25 : -2.25, offsetZ);
      raizMesh.rotation.x = isSuperior ? (offsetZ * 0.15) : (Math.PI - offsetZ * 0.15);
      raizMesh.rotation.z = -offsetX * 0.15;
      raizMesh.name = 'raiz';
      group.add(raizMesh);

      const polpaGeo = new THREE.CylinderGeometry(0.06, 0.015, 2.2, 12);
      const polpaMesh = new THREE.Mesh(polpaGeo, polpaMaterial);
      polpaMesh.position.set(offsetX * 0.7, isSuperior ? 1.3 : -1.3, offsetZ * 0.7);
      polpaMesh.name = 'polpa';
      group.add(polpaMesh);
    }
  }

  // Camada Interna de Dentina Anatômica
  const dentinaGeo = new THREE.CylinderGeometry(0.35, 0.15, 1.8, 16);
  const dentinaMesh = new THREE.Mesh(dentinaGeo, dentinaMaterial);
  dentinaMesh.position.y = isSuperior ? 0.9 : -0.9;
  dentinaMesh.name = 'dentina';
  group.add(dentinaMesh);

  return group;
};

// ============================================================================
// COMPONENTE CANVAS 3D INTERATIVO PRINCIPAL (THREE.JS WEBGL)
// ============================================================================
const Tooth3DCanvas: React.FC<{
  denteNumero: number;
  denteInfo?: DenteInfo;
  modoArcada: ModoVisualizacaoArcada;
  mostrarInterno?: boolean;
  dentesData: Record<number, DenteInfo>;
  darkMode?: boolean;
  faceAngulo?: string;
  gltfUrl?: string | null;
  autoRotate?: boolean;
  onSelectDente?: (numero: number) => void;
}> = ({
  denteNumero,
  denteInfo,
  modoArcada,
  mostrarInterno = false,
  dentesData,
  darkMode = true,
  faceAngulo,
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
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Renderização e Animação 3D
  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth || 500;
    const height = mountRef.current.clientHeight || 450;

    // 1. Cenário e Câmera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(darkMode ? 0x030712 : 0xf8fafc);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 1.5, 4);

    // 2. Renderer com ACESFilmicToneMapping e sombras suaves
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 3. Controles de Órbita Suaves (OrbitControls)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 25;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.5;

    // 4. Iluminação de Estúdio Dental Profissional
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 1.2);
    fillLight.position.set(-5, 2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
    rimLight.position.set(0, -5, 0);
    scene.add(rimLight);

    // 5. Construção dos Dentes no Espaço 3D conforme o Modo
    const mainGroup = new THREE.Group();
    mainGroupRef.current = mainGroup;
    scene.add(mainGroup);

    if (gltfUrl) {
      // Carregamento de Arquivo GLTF/GLB Customizado do Usuário
      const loader = new GLTFLoader();
      loader.load(
        gltfUrl,
        (gltf) => {
          const model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 3.5 / (maxDim || 1);

          model.scale.setScalar(scale);
          model.position.sub(center.multiplyScalar(scale));

          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (!child.material || !child.material.map) {
                child.material = new THREE.MeshPhysicalMaterial({
                  color: 0xf8fafc,
                  roughness: 0.15,
                  metalness: 0.0,
                  transmission: 0.2,
                  ior: 1.5,
                  clearcoat: 1.0,
                  clearcoatRoughness: 0.1
                });
              }
            }
          });

          mainGroup.add(model);
        },
        undefined,
        (err) => console.error('Erro ao carregar modelo GLTF:', err)
      );
    } else if (modoArcada === 'individual') {
      // Modo Dente Único Ampliado
      const dente3D = criarGeometriaDente3D(denteNumero);
      
      // Aplicar Overlays Clínicos 3D sobre o modelo
      const status = denteInfo?.status || 'Saudável';
      if (status === 'Cárie') {
        const carieGeo = new THREE.SphereGeometry(0.25, 12, 12);
        const carieMat = new THREE.MeshStandardMaterial({ color: 0x881337, roughness: 0.8 });
        const carieMesh = new THREE.Mesh(carieGeo, carieMat);
        carieMesh.position.set(0, 0.4, 0.25);
        dente3D.add(carieMesh);
      } else if (status === 'Restaurado') {
        const resinaGeo = new THREE.BoxGeometry(0.4, 0.2, 0.4);
        const resinaMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.2 });
        const resinaMesh = new THREE.Mesh(resinaGeo, resinaMat);
        resinaMesh.position.set(0, 0.5, 0);
        dente3D.add(resinaMesh);
      } else if (status === 'Coroa') {
        const coroaGeo = new THREE.CylinderGeometry(0.65, 0.6, 1.2, 16);
        const coroaMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.8 });
        const coroaCap = new THREE.Mesh(coroaGeo, coroaMat);
        coroaCap.position.set(0, 0.5, 0);
        dente3D.add(coroaCap);
      } else if (status === 'Implante') {
        const parafusoGeo = new THREE.CylinderGeometry(0.35, 0.2, 1.8, 12);
        const parafusoMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.95, roughness: 0.15 });
        const parafusoMesh = new THREE.Mesh(parafusoGeo, parafusoMat);
        parafusoMesh.position.set(0, -1.2, 0);
        dente3D.add(parafusoMesh);
      }

      // Aplicar Transparência no Modo de Corte Anatômico Interno
      if (mostrarInterno) {
        dente3D.traverse((child) => {
          if (child instanceof THREE.Mesh && child.name === 'coroa') {
            child.material = new THREE.MeshPhysicalMaterial({
              color: 0xfbf9f5,
              transparent: true,
              opacity: 0.35,
              roughness: 0.1
            });
          }
        });
      }

      mainGroup.add(dente3D);
    } else {
      // Modos Arcada Completa (Frontal, Maxila, Mandíbula, Decídua)
      const dentesParaRenderizar =
        modoArcada === 'maxila'
          ? [...DENTES_PERMANENTES_MAXILA_DIREITA, ...DENTES_PERMANENTES_MAXILA_ESQUERDA]
          : modoArcada === 'mandibula'
          ? [...DENTES_PERMANENTES_MANDIBULA_DIREITA, ...DENTES_PERMANENTES_MANDIBULA_ESQUERDA]
          : modoArcada === 'decidua'
          ? [...DENTES_DECIDUOS_MAXILA_DIREITA, ...DENTES_DECIDUOS_MAXILA_ESQUERDA, ...DENTES_DECIDUOS_MANDIBULA_DIREITA, ...DENTES_DECIDUOS_MANDIBULA_ESQUERDA]
          : [
              ...DENTES_PERMANENTES_MAXILA_DIREITA,
              ...DENTES_PERMANENTES_MAXILA_ESQUERDA,
              ...DENTES_PERMANENTES_MANDIBULA_DIREITA,
              ...DENTES_PERMANENTES_MANDIBULA_ESQUERDA
            ];

      dentesParaRenderizar.forEach((num) => {
        const dente3D = criarGeometriaDente3D(num);
        const info = dentesData[num];
        const status = info?.status || 'Saudável';

        // Disposição em curva anatômica de parábola (Arcada Dental)
        const isUpper = (num >= 11 && num <= 28) || (num >= 51 && num <= 65);
        const isRight = (num >= 11 && num <= 18) || (num >= 41 && num <= 48) || (num >= 51 && num <= 55) || (num >= 81 && num <= 85);
        const posInSeq = num % 10;

        const angleStep = 0.22;
        const angle = (isRight ? -posInSeq : posInSeq) * angleStep;
        const radius = 5.2;
        const x = Math.sin(angle) * radius;
        const z = (Math.cos(angle) - 1) * radius;
        const y = isUpper ? 0.35 : -0.35; // Oclusão anatômica onde as coroas se tocam no centro

        dente3D.position.set(x, y, z);
        dente3D.rotation.y = angle;
        dente3D.scale.set(0.60, 0.60, 0.60);
        dente3D.userData = { numero: num };

        // Colorir de acordo com o status clínico
        if (status !== 'Saudável') {
          const hex = CORES_STATUS_CLINICO[status]?.hex || '#10B981';
          dente3D.traverse((child) => {
            if (child instanceof THREE.Mesh && child.name === 'coroa') {
              child.material = new THREE.MeshStandardMaterial({ color: new THREE.Color(hex), roughness: 0.3 });
            }
          });
        }

        mainGroup.add(dente3D);
      });

      if (modoArcada === 'maxila') {
        camera.position.set(0, 8, 2);
        camera.lookAt(0, 0, 0);
      } else if (modoArcada === 'mandibula') {
        camera.position.set(0, -8, 2);
        camera.lookAt(0, 0, 0);
      } else {
        camera.position.set(0, 0, 11);
        camera.lookAt(0, 0, 0);
      }
    }

    // 6. Loop de Animação Contínua com OrbitControls
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
      setHoveredToothNum(foundNum);
    };

    const handlePointerClick = (event: MouseEvent) => {
      if (!mountRef.current || !cameraRef.current || !mainGroupRef.current || !onSelectDente) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(mainGroupRef.current.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && obj !== mainGroupRef.current) {
          if (obj.userData && obj.userData.numero) {
            onSelectDente(obj.userData.numero);
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
  }, [denteNumero, modoArcada, mostrarInterno, dentesData, darkMode, gltfUrl, autoRotate, onSelectDente]);

  // Posicionamento Dinâmico de Câmera por Face Selecionada
  useEffect(() => {
    if (!cameraRef.current || modoArcada !== 'individual') return;
    const cam = cameraRef.current;
    if (faceAngulo === 'OCLUSAL') {
      cam.position.set(0, 4.5, 0.1);
      cam.lookAt(0, 0, 0);
    } else if (faceAngulo === 'VESTIBULAR') {
      cam.position.set(0, 0, 5.5);
      cam.lookAt(0, 0, 0);
    } else if (faceAngulo === 'PALATINA' || faceAngulo === 'LINGUAL') {
      cam.position.set(0, 0, -5.5);
      cam.lookAt(0, 0, 0);
    } else if (faceAngulo === 'MESIAL') {
      cam.position.set(-5.5, 0, 0);
      cam.lookAt(0, 0, 0);
    } else if (faceAngulo === 'DISTAL') {
      cam.position.set(5.5, 0, 0);
      cam.lookAt(0, 0, 0);
    }
  }, [faceAngulo, modoArcada]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[380px] sm:min-h-[480px] cursor-grab active:cursor-grabbing relative overflow-hidden rounded-2xl"
    >
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-extrabold text-teal-400">
        <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
        <span>ENGINE 3D WEBGL REAL-TIME</span>
      </div>

      {hoveredToothNum && (
        <div className="absolute top-3 right-3 z-20 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-teal-500/50 shadow-2xl pointer-events-none flex flex-col text-right transition-all">
          <span className="text-[10px] font-extrabold text-teal-400 uppercase tracking-wider">
            DENTE #{hoveredToothNum}
          </span>
          <span className="text-xs font-extrabold text-white">
            {getInfoDenteBiblioteca(hoveredToothNum).nome}
          </span>
          <span className="text-[10px] text-slate-400 font-bold">
            {getInfoDenteBiblioteca(hoveredToothNum).arcada.toUpperCase()} • LADO {getInfoDenteBiblioteca(hoveredToothNum).lado.toUpperCase()}
          </span>
        </div>
      )}

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-md px-4 py-1.5 rounded-full text-[11px] font-bold text-slate-300 shadow-xl border border-slate-800 z-10 pointer-events-none">
        Clique e arraste para girar | Scroll para zoom | Clique no dente para analisar
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL ODONTOGRAMA PROFISSIONAL 3D
// ============================================================================
export const Odontograma: React.FC<OdontogramaProps> = ({
  pacienteNome = 'Paciente',
  dentes,
  onUpdateDente,
  radiografias = [],
  fotografias = [],
  procedimentos = [],
  onAddProcedimento,
  darkMode = true
}) => {
  const [modoArcada, setModoArcada] = useState<ModoVisualizacaoArcada>('frontal');
  const [denteSelecionadoNum, setDenteSelecionadoNum] = useState<number>(16);
  const [superficieSelecionada, setSuperficieSelecionada] = useState<SuperficieDente | null>('Oclusal');
  const [faceAngulo, setFaceAngulo] = useState<string>('VESTIBULAR');
  const [mostrarInterno, setMostrarInterno] = useState<boolean>(false);
  const [assistenteIAAberto, setAssistenteIAAberto] = useState<boolean>(false);
  const [customGltfUrl, setCustomGltfUrl] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);

  const handleFileUploadGltf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomGltfUrl(url);
    }
  };

  // Form State do Painel Lateral
  const [statusNovoInput, setStatusNovoInput] = useState<StatusDente>('Saudável');
  const [observacoesInput, setObservacoesInput] = useState<string>('');
  const [novoProcDescInput, setNovoProcDescInput] = useState<string>('');
  const [novoProcValorInput, setNovoProcValorInput] = useState<number>(250);

  const denteInfoAtual = useMemo(() => dentes[denteSelecionadoNum] || { numero: denteSelecionadoNum, status: 'Saudável' }, [dentes, denteSelecionadoNum]);
  const infoAnatomica = useMemo(() => getNomeAnatomicoDente(denteSelecionadoNum), [denteSelecionadoNum]);

  // Sincronizar inputs ao mudar de dente
  useEffect(() => {
    if (denteInfoAtual) {
      setStatusNovoInput(denteInfoAtual.status || 'Saudável');
      setObservacoesInput(denteInfoAtual.observacoes || '');
    }
  }, [denteSelecionadoNum, denteInfoAtual]);

  const handleSalvarCondicaoDente = () => {
    onUpdateDente(denteSelecionadoNum, statusNovoInput, observacoesInput);
  };

  const handleAdicionarProcedimentoDente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoProcDescInput || !onAddProcedimento) return;
    onAddProcedimento({
      pacienteId: 'pac-atual',
      denteNumero: denteSelecionadoNum,
      descricao: `${novoProcDescInput} (Dente #${denteSelecionadoNum})`,
      valor: novoProcValorInput,
      status: 'Planejado',
      dataCriacao: new Date().toISOString().split('T')[0]
    });
    setNovoProcDescInput('');
  };

  // Exames e Fotos Relacionadas ao Dente Selecionado
  const radiografiasDente = radiografias.filter((r) => r.titulo.includes(denteSelecionadoNum.toString()) || r.anotacoes?.includes(denteSelecionadoNum.toString()));
  const fotografiasDente = fotografias.filter((f) => f.descricao?.includes(denteSelecionadoNum.toString()) || f.titulo?.includes(denteSelecionadoNum.toString()));
  const procedimentosDente = procedimentos.filter((p) => p.denteNumero === denteSelecionadoNum);

  return (
    <div className={`space-y-6 select-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>
      
      {/* 1. HEADER DO ODONTOGRAMA COM CONTROLES PRINCIPAIS */}
      <div className={`p-6 rounded-3xl border shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/20">
              Prontuário Odontológico 3D Realista
            </span>
            <span className="text-[10px] font-bold text-slate-400">Notação FDI / ISO 3950</span>
          </div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-teal-400" /> Odontograma 3D Anatômico & Interativo
          </h2>
          <p className="text-xs text-slate-400">
            Modelos 3D realistas de cada dente da arcada para diagnóstico, plano de tratamento e análise clínica.
          </p>
        </div>

        {/* BARRAS DE SELEÇÃO DE MODOS DE ARCADA */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-1 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            {(
              [
                { id: 'frontal', label: 'Frontal Arch' },
                { id: 'maxila', label: 'Maxila' },
                { id: 'mandibula', label: 'Mandíbula' },
                { id: 'individual', label: 'Analisar 3D' },
                { id: 'decidua', label: 'Decídua (Infantil)' }
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setModoArcada(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  modoArcada === m.id
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <label className="bg-slate-800 hover:bg-slate-700 text-teal-300 font-extrabold px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow-md">
            <Upload className="w-4 h-4 text-teal-400" /> Carregar modelo .GLB / .GLTF
            <input type="file" accept=".glb,.gltf" onChange={handleFileUploadGltf} className="hidden" />
          </label>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`font-extrabold px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 border transition-all cursor-pointer shadow-md ${
              autoRotate ? 'bg-teal-600 text-white border-teal-500 shadow-teal-600/30' : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <RotateCw className="w-4 h-4" /> Auto-Girar
          </button>

          <button
            onClick={() => setAssistenteIAAberto(true)}
            className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-extrabold px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 border border-purple-500/30 transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4 text-purple-400" /> Assistente IA
          </button>

          <button
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-teal-400" /> Exportar Relatório
          </button>
        </div>
      </div>

      {/* 2. LAYOUT PRINCIPAL EM DUAS COLUNAS: CANVAS 3D + PAINEL DE ANÁLISE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA / CENTRAL (8 COLS): CANVAS 3D + ARCADA DENTÁRIA */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          
          <div className={`p-6 rounded-3xl border shadow-xl relative flex flex-col justify-between ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            
            {/* Header do Viewport 3D */}
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                <h3 className="font-extrabold text-sm text-teal-400">
                  {modoArcada === 'individual'
                    ? `DENTE ${denteSelecionadoNum} — ${infoAnatomica.nome.toUpperCase()}`
                    : `VISUALIZAÇÃO 3D DA ARCADA DENTÁRIA (${modoArcada.toUpperCase()})`}
                </h3>
              </div>

              {modoArcada === 'individual' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMostrarInterno(!mostrarInterno)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition-all ${
                      mostrarInterno
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                    title="Visualizar corte anatômico interno: Esmalte -> Dentina -> Câmara Pulpar -> Canal"
                  >
                    <Layers className="w-3.5 h-3.5 text-rose-400" />
                    <span>{mostrarInterno ? 'Modo Anatômico Interno (Ativo)' : 'Estrutura Interna'}</span>
                  </button>

                  <button
                    onClick={() => setModoArcada('frontal')}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                    title="Voltar para Arcada Completa"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* CANVAS 3D INTERATIVO WEBGL THREE.JS */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-2xl">
              <Tooth3DCanvas
                denteNumero={denteSelecionadoNum}
                denteInfo={denteInfoAtual}
                modoArcada={modoArcada}
                mostrarInterno={mostrarInterno}
                dentesData={dentes}
                darkMode={darkMode}
                faceAngulo={faceAngulo}
                gltfUrl={customGltfUrl}
                autoRotate={autoRotate}
                onSelectDente={(num) => {
                  setDenteSelecionadoNum(num);
                  setModoArcada('individual');
                }}
              />

              {/* Botões Flutuantes de Angulação da Câmera por Face */}
              {modoArcada === 'individual' && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1 shadow-2xl z-20">
                  <span className="text-[10px] font-extrabold text-slate-400 px-2 uppercase">Faces:</span>
                  {(['VESTIBULAR', 'PALATINA', 'OCLUSAL', 'MESIAL', 'DISTAL'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFaceAngulo(f)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                        faceAngulo === f
                          ? 'bg-teal-600 text-white shadow-md ring-1 ring-teal-400'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* BARRA DE SELEÇÃO RÁPIDA DE DENTES NA ARCADA (NUMERAÇÃO FDI 3950) */}
            {modoArcada !== 'decidua' ? (
              <div className="mt-6 space-y-4 pt-4 border-t border-slate-800/40">
                <div className="text-center text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                  Arcada Permanente (Notação FDI)
                </div>

                {/* Maxila Superior */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-teal-400 block text-center uppercase">Maxila Superior</span>
                  <div className="flex justify-center items-center gap-1.5 flex-wrap">
                    {[...DENTES_PERMANENTES_MAXILA_DIREITA, ...DENTES_PERMANENTES_MAXILA_ESQUERDA].map((num) => {
                      const info = dentes[num];
                      const st = info?.status || 'Saudável';
                      const isSelected = denteSelecionadoNum === num;
                      return (
                        <button
                          key={num}
                          onClick={() => {
                            setDenteSelecionadoNum(num);
                            setModoArcada('individual');
                          }}
                          className={`w-9 h-11 rounded-xl border flex flex-col items-center justify-between p-1 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-teal-600 text-white border-teal-400 ring-2 ring-teal-400 scale-110 shadow-lg z-10'
                              : darkMode
                              ? 'bg-slate-950/70 border-slate-800 hover:border-teal-500/50'
                              : 'bg-slate-100 border-slate-200 hover:border-teal-500'
                          }`}
                        >
                          <span className="font-mono font-extrabold text-[11px]">{num}</span>
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: CORES_STATUS_CLINICO[st]?.hex || '#10B981' }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mandíbula Inferior */}
                <div className="space-y-1 pt-2">
                  <span className="text-[10px] font-bold text-sky-400 block text-center uppercase">Mandíbula Inferior</span>
                  <div className="flex justify-center items-center gap-1.5 flex-wrap">
                    {[...DENTES_PERMANENTES_MANDIBULA_DIREITA, ...DENTES_PERMANENTES_MANDIBULA_ESQUERDA].map((num) => {
                      const info = dentes[num];
                      const st = info?.status || 'Saudável';
                      const isSelected = denteSelecionadoNum === num;
                      return (
                        <button
                          key={num}
                          onClick={() => {
                            setDenteSelecionadoNum(num);
                            setModoArcada('individual');
                          }}
                          className={`w-9 h-11 rounded-xl border flex flex-col items-center justify-between p-1 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-teal-600 text-white border-teal-400 ring-2 ring-teal-400 scale-110 shadow-lg z-10'
                              : darkMode
                              ? 'bg-slate-950/70 border-slate-800 hover:border-teal-500/50'
                              : 'bg-slate-100 border-slate-200 hover:border-teal-500'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: CORES_STATUS_CLINICO[st]?.hex || '#10B981' }}
                          />
                          <span className="font-mono font-extrabold text-[11px]">{num}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Dentição Decídua Infantil */
              <div className="mt-6 space-y-4 pt-4 border-t border-slate-800/40">
                <div className="text-center text-xs font-extrabold text-amber-400 uppercase tracking-widest">
                  Dentição Decídua Infantil (51 a 85)
                </div>
                <div className="flex justify-center items-center gap-2 flex-wrap">
                  {[
                    ...DENTES_DECIDUOS_MAXILA_DIREITA,
                    ...DENTES_DECIDUOS_MAXILA_ESQUERDA,
                    ...DENTES_DECIDUOS_MANDIBULA_DIREITA,
                    ...DENTES_DECIDUOS_MANDIBULA_ESQUERDA
                  ].map((num) => {
                    const isSelected = denteSelecionadoNum === num;
                    return (
                      <button
                        key={num}
                        onClick={() => {
                          setDenteSelecionadoNum(num);
                          setModoArcada('individual');
                        }}
                        className={`w-9 h-11 rounded-xl border flex flex-col items-center justify-center font-extrabold text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400 scale-110 shadow-lg'
                            : 'bg-slate-950/70 border-slate-800 hover:border-amber-400'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* COLUNA DIREITA (5 COLS): PAINEL LATERAL DE DIAGNÓSTICO DO DENTE */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          
          <div className={`p-6 rounded-3xl border shadow-xl space-y-6 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            
            {/* Header do Dente Selecionado */}
            <div className="border-b border-slate-800/40 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">
                  Dente #{denteSelecionadoNum}
                </span>
                <span className="text-xs text-slate-400 font-bold">{infoAnatomica.tipo}</span>
              </div>

              <h3 className="text-lg font-extrabold text-white">{infoAnatomica.nome}</h3>
              <p className="text-xs text-slate-400">{infoAnatomica.arcada}</p>
            </div>

            {/* Seletor do Status Clínico Principal */}
            <div className="space-y-2">
              <label className="block font-extrabold text-xs text-slate-300">Condição Clínica Atual</label>
              <select
                value={statusNovoInput}
                onChange={(e) => setStatusNovoInput(e.target.value as StatusDente)}
                className={`w-full p-3 rounded-2xl border text-xs font-extrabold cursor-pointer ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                {Object.keys(CORES_STATUS_CLINICO).map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Seletor de Superfícies Atingidas */}
            <div className="space-y-2">
              <label className="block font-extrabold text-xs text-slate-300">Superfícies Atingidas (Faces)</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Oclusal', 'Vestibular', 'Lingual', 'Palatina', 'Mesial', 'Distal', 'Cervical', 'Radicular'] as SuperficieDente[]).map((sup) => {
                  const isSel = superficieSelecionada === sup;
                  return (
                    <button
                      key={sup}
                      onClick={() => setSuperficieSelecionada(sup)}
                      className={`p-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer text-center ${
                        isSel
                          ? 'bg-teal-600 text-white border-teal-400 ring-2 ring-teal-400 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sup}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Observações Clínicas */}
            <div className="space-y-2">
              <label className="block font-extrabold text-xs text-slate-300">Observações Clínicas do Cirurgião</label>
              <textarea
                rows={3}
                value={observacoesInput}
                onChange={(e) => setObservacoesInput(e.target.value)}
                placeholder="Ex: Restauração em resina composta na face oclusal com infiltração marginal discreta..."
                className={`w-full p-3 rounded-2xl border text-xs font-medium resize-none ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <button
              onClick={handleSalvarCondicaoDente}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold p-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-600/25 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" /> Salvar Alteração no Prontuário
            </button>

            {/* Adicionar Procedimento Direto ao Dente */}
            {onAddProcedimento && (
              <form onSubmit={handleAdicionarProcedimentoDente} className="pt-4 border-t border-slate-800/40 space-y-3">
                <span className="text-xs font-extrabold text-teal-400 block">+ Lançar Procedimento para o Dente #{denteSelecionadoNum}</span>
                <input
                  type="text"
                  placeholder="Descrição (ex: Restauração Resina, Canal...)"
                  value={novoProcDescInput}
                  onChange={(e) => setNovoProcDescInput(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Valor (R$)"
                    value={novoProcValorInput}
                    onChange={(e) => setNovoProcValorInput(Number(e.target.value))}
                    className={`w-1/2 p-2.5 rounded-xl border text-xs font-extrabold text-emerald-400 ${
                      darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                  <button
                    type="submit"
                    className="w-1/2 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold p-2.5 rounded-xl text-xs cursor-pointer border border-slate-700"
                  >
                    + Adicionar
                  </button>
                </div>
              </form>
            )}

            {/* Lista de Procedimentos do Dente */}
            {procedimentosDente.length > 0 && (
              <div className="pt-4 border-t border-slate-800/40 space-y-2">
                <span className="text-xs font-extrabold text-teal-400 block">Procedimentos Planejados ({procedimentosDente.length})</span>
                <div className="space-y-1.5">
                  {procedimentosDente.map((p) => (
                    <div key={p.id} className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{p.descricao}</span>
                      <span className="font-extrabold text-emerald-400">R$ {p.valor.toLocaleString('pt-BR')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exames e Radiografias Relacionadas ao Dente */}
            <div className="pt-4 border-t border-slate-800/40 space-y-3">
              <span className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-teal-400" /> Exames de Imagem do Dente #{denteSelecionadoNum} ({radiografiasDente.length + fotografiasDente.length})
              </span>

              {radiografiasDente.length > 0 || fotografiasDente.length > 0 ? (
                <div className="space-y-2">
                  {radiografiasDente.map((r) => (
                    <div key={r.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{r.titulo}</span>
                        <span className="text-[10px] text-slate-400">{r.data} • {r.tipo}</span>
                      </div>
                      <img src={r.imagemUrl} alt={r.titulo} className="w-10 h-10 object-cover rounded-lg border border-slate-700" />
                    </div>
                  ))}
                  {fotografiasDente.map((f) => (
                    <div key={f.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{f.descricao}</span>
                        <span className="text-[10px] text-slate-400">{f.data} • Foto Clínica</span>
                      </div>
                      <img src={f.imagemUrl} alt={f.descricao} className="w-10 h-10 object-cover rounded-lg border border-slate-700" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">Nenhum exame de imagem especificamente vinculado a este dente.</p>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* 3. LEGENDA CLÍNICA COLORIDA PADRÃO DO ODONTOGRAMA */}
      <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
          <h3 className="font-extrabold text-sm text-teal-400 flex items-center gap-2">
            <Tag className="w-4 h-4" /> Legenda de Convenções e Estados Clínicos Odontológicos
          </h3>
          <span className="text-xs text-slate-400 font-bold">{Object.keys(CORES_STATUS_CLINICO).length} convenções</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(CORES_STATUS_CLINICO).map(([st, c]) => (
            <div key={st} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
              <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: c.hex }} />
              <span className="font-bold text-slate-200 text-[11px] truncate">{st}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. MODAL ASSISTENTE IA ODONTOLÓGICA */}
      {assistenteIAAberto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className={`rounded-3xl p-6 max-w-xl w-full shadow-2xl border space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
              <h3 className="text-base font-extrabold flex items-center gap-2 text-purple-400">
                <Bot className="w-5 h-5 text-purple-400 animate-pulse" /> Assistente OdontoIA — Análise do Odontograma
              </h3>
              <button onClick={() => setAssistenteIAAberto(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/50 space-y-2">
                <span className="font-bold text-purple-300 block">Resumo Automático de Patologias Registradas:</span>
                <p className="text-slate-300">
                  O odontograma do paciente <strong>{pacienteNome}</strong> registra patologias ativas que requerem intervenção clínica. Recomenda-se realizar raspagem periodontal e restaurações nas superfícies acometidas por cárie.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-2 font-bold">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  As informações fornecidas pela IA são exclusivamente auxiliares e não substituem a avaliação clínica soberana, exames complementares ou o diagnóstico do cirurgião-dentista.
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800/40">
              <button
                onClick={() => setAssistenteIAAberto(false)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs cursor-pointer shadow-lg"
              >
                Compreendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
