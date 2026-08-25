// ============================================================================
// BIBLIOTECA DE MODELOS 3D DENTÁRIOS ODONTOLÓGICOS (FDI / ISO 3950)
// ============================================================================

export interface InfoDenteBiblioteca {
  numero: string;
  numeroInt: number;
  nome: string;
  arcada: 'maxila' | 'mandibula';
  lado: 'direito' | 'esquerdo';
  tipo: 'incisivo' | 'canino' | 'premolar' | 'molar';
  modelo: string;
  isDeciduo: boolean;
  posicao?: { x: number; y: number; z: number };
  rotacao?: { x: number; y: number; z: number };
  escala?: { x: number; y: number; z: number };
}

// ----------------------------------------------------------------------------
// 1. DENTES PERMANENTES (11-18, 21-28, 31-38, 41-48)
// ----------------------------------------------------------------------------
export const BIBLIOTECA_DENTES_PERMANENTES: Record<number, InfoDenteBiblioteca> = {
  // QUADRANTE 1 - MAXILA DIREITA
  11: {
    numero: '11',
    numeroInt: 11,
    nome: 'Incisivo central superior direito',
    arcada: 'maxila',
    lado: 'direito',
    tipo: 'incisivo',
    modelo: '/models/odontologia/dentes/permanentes/dente_11.glb',
    isDeciduo: false
  },
  12: {
    numero: '12',
    numeroInt: 12,
    nome: 'Incisivo lateral superior direito',
    arcada: 'maxila',
    lado: 'direito',
    tipo: 'incisivo',
    modelo: '/models/odontologia/dentes/permanentes/dente_12.glb',
    isDeciduo: false
  },
  13: {
    numero: '13',
    numeroInt: 13,
    nome: 'Canino superior direito',
    arcada: 'maxila',
    lado: 'direito',
    tipo: 'canino',
    modelo: '/models/odontologia/dentes/permanentes/dente_13.glb',
    isDeciduo: false
  },
  14: {
    numero: '14',
    numeroInt: 14,
    nome: 'Primeiro pré-molar superior direito',
    arcada: 'maxila',
    lado: 'direito',
    tipo: 'premolar',
    modelo: '/models/odontologia/dentes/permanentes/dente_14.glb',
    isDeciduo: false
  },
  15: {
    numero: '15',
    numeroInt: 15,
    nome: 'Segundo pré-molar superior direito',
    arcada: 'maxila',
    lado: 'direito',
    tipo: 'premolar',
    modelo: '/models/odontologia/dentes/permanentes/dente_15.glb',
    isDeciduo: false
  },
  16: {
    numero: '16',
    numeroInt: 16,
    nome: 'Primeiro molar superior direito',
    arcada: 'maxila',
    lado: 'direito',
    tipo: 'molar',
    modelo: '/models/odontologia/dentes/permanentes/dente_16.glb',
    isDeciduo: false
  },
  17: {
    numero: '17',
    numeroInt: 17,
    nome: 'Segundo molar superior direito',
    arcada: 'maxila',
    lado: 'direito',
    tipo: 'molar',
    modelo: '/models/odontologia/dentes/permanentes/dente_17.glb',
    isDeciduo: false
  },
  18: {
    numero: '18',
    numeroInt: 18,
    nome: 'Terceiro molar superior direito (Siso)',
    arcada: 'maxila',
    lado: 'direito',
    tipo: 'molar',
    modelo: '/models/odontologia/dentes/permanentes/dente_18.glb',
    isDeciduo: false
  },

  // QUADRANTE 2 - MAXILA ESQUERDA
  21: {
    numero: '21',
    numeroInt: 21,
    nome: 'Incisivo central superior esquerdo',
    arcada: 'maxila',
    lado: 'esquerdo',
    tipo: 'incisivo',
    modelo: '/models/odontologia/dentes/permanentes/dente_21.glb',
    isDeciduo: false
  },
  22: {
    numero: '22',
    numeroInt: 22,
    nome: 'Incisivo lateral superior esquerdo',
    arcada: 'maxila',
    lado: 'esquerdo',
    tipo: 'incisivo',
    modelo: '/models/odontologia/dentes/permanentes/dente_22.glb',
    isDeciduo: false
  },
  23: {
    numero: '23',
    numeroInt: 23,
    nome: 'Canino superior esquerdo',
    arcada: 'maxila',
    lado: 'esquerdo',
    tipo: 'canino',
    modelo: '/models/odontologia/dentes/permanentes/dente_23.glb',
    isDeciduo: false
  },
  24: {
    numero: '24',
    numeroInt: 24,
    nome: 'Primeiro pré-molar superior esquerdo',
    arcada: 'maxila',
    lado: 'esquerdo',
    tipo: 'premolar',
    modelo: '/models/odontologia/dentes/permanentes/dente_24.glb',
    isDeciduo: false
  },
  25: {
    numero: '25',
    numeroInt: 25,
    nome: 'Segundo pré-molar superior esquerdo',
    arcada: 'maxila',
    lado: 'esquerdo',
    tipo: 'premolar',
    modelo: '/models/odontologia/dentes/permanentes/dente_25.glb',
    isDeciduo: false
  },
  26: {
    numero: '26',
    numeroInt: 26,
    nome: 'Primeiro molar superior esquerdo',
    arcada: 'maxila',
    lado: 'esquerdo',
    tipo: 'molar',
    modelo: '/models/odontologia/dentes/permanentes/dente_26.glb',
    isDeciduo: false
  },
  27: {
    numero: '27',
    numeroInt: 27,
    nome: 'Segundo molar superior esquerdo',
    arcada: 'maxila',
    lado: 'esquerdo',
    tipo: 'molar',
    modelo: '/models/odontologia/dentes/permanentes/dente_27.glb',
    isDeciduo: false
  },
  28: {
    numero: '28',
    numeroInt: 28,
    nome: 'Terceiro molar superior esquerdo (Siso)',
    arcada: 'maxila',
    lado: 'esquerdo',
    tipo: 'molar',
    modelo: '/models/odontologia/dentes/permanentes/dente_28.glb',
    isDeciduo: false
  },

  // QUADRANTE 3 - MANDÍBULA ESQUERDA
  31: {
    numero: '31',
    numeroInt: 31,
    nome: 'Incisivo central inferior esquerdo',
    arcada: 'mandibula',
    lado: 'esquerdo',
    tipo: 'incisivo',
    modelo: '/models/odontologia/dentes/permanentes/dente_31.glb',
    isDeciduo: false
  },
  32: {
    numero: '32',
    numeroInt: 32,
    nome: 'Incisivo lateral inferior esquerdo',
    arcada: 'mandibula',
    lado: 'esquerdo',
    tipo: 'incisivo',
    modelo: '/models/odontologia/dentes/permanentes/dente_32.glb',
    isDeciduo: false
  },
  33: {
    numero: '33',
    numeroInt: 33,
    nome: 'Canino inferior esquerdo',
    arcada: 'mandibula',
    lado: 'esquerdo',
    tipo: 'canino',
    modelo: '/models/odontologia/dentes/permanentes/dente_33.glb',
    isDeciduo: false
  },
  34: {
    numero: '34',
    numeroInt: 34,
    nome: 'Primeiro pré-molar inferior esquerdo',
    arcada: 'mandibula',
    lado: 'esquerdo',
    tipo: 'premolar',
    modelo: '/models/odontologia/dentes/permanentes/dente_34.glb',
    isDeciduo: false
  },
  35: {
    numero: '35',
    numeroInt: 35,
    nome: 'Segundo pré-molar inferior esquerdo',
    arcada: 'mandibula',
    lado: 'esquerdo',
    tipo: 'premolar',
    modelo: '/models/odontologia/dentes/permanentes/dente_35.glb',
    isDeciduo: false
  },
  36: {
    numero: '36',
    numeroInt: 36,
    nome: 'Primeiro molar inferior esquerdo',
    arcada: 'mandibula',
    lado: 'esquerdo',
    tipo: 'molar',
    modelo: '/models/odontologia/dentes/permanentes/dente_36.glb',
    isDeciduo: false
  },
  37: {
    numero: '37',
    numeroInt: 37,
    nome: 'Segundo molar inferior esquerdo',
    arcada: 'mandibula',
    lado: 'esquerdo',
    tipo: 'molar',
    modelo: '/models/odontologia/dentes/permanentes/dente_37.glb',
    isDeciduo: false
  },
  38: {
    numero: '38',
    numeroInt: 38,
    nome: 'Terceiro molar inferior esquerdo (Siso)',
    arcada: 'mandibula',
    lado: 'esquerdo',
    tipo: 'molar',
    modelo: '/models/odontologia/dentes/permanentes/dente_38.glb',
    isDeciduo: false
  },

  // QUADRANTE 4 - MANDÍBULA DIREITA
  41: {
    numero: '41',
    numeroInt: 41,
    nome: 'Incisivo central inferior direito',
    arcada: 'mandibula',
    lado: 'direito',
    tipo: 'incisivo',
    modelo: '/models/odontologia/dentes/permanentes/dente_41.glb',
    isDeciduo: false
  },
  42: {
    numero: '42',
    numeroInt: 42,
    nome: 'Incisivo lateral inferior direito',
    arcada: 'mandibula',
    lado: 'direito',
    tipo: 'incisivo',
    modelo: '/models/odontologia/dentes/permanentes/dente_42.glb',
    isDeciduo: false
  },
  43: {
    numero: '43',
    numeroInt: 43,
    nome: 'Canino inferior direito',
    arcada: 'mandibula',
    lado: 'direito',
    tipo: 'canino',
    modelo: '/models/odontologia/dentes/permanentes/dente_43.glb',
    isDeciduo: false
  },
  44: {
    numero: '44',
    numeroInt: 44,
    nome: 'Primeiro pré-molar inferior direito',
    arcada: 'mandibula',
    lado: 'direito',
    tipo: 'premolar',
    modelo: '/models/odontologia/dentes/permanentes/dente_44.glb',
    isDeciduo: false
  },
  45: {
    numero: '45',
    numeroInt: 45,
    nome: 'Segundo pré-molar inferior direito',
    arcada: 'mandibula',
    lado: 'direito',
    tipo: 'premolar',
    modelo: '/models/odontologia/dentes/permanentes/dente_45.glb',
    isDeciduo: false
  },
  46: {
    numero: '46',
    numeroInt: 46,
    nome: 'Primeiro molar inferior direito',
    arcada: 'mandibula',
    lado: 'direito',
    tipo: 'molar',
    modelo: '/models/odontologia/dentes/permanentes/dente_46.glb',
    isDeciduo: false
  },
  47: {
    numero: '47',
    numeroInt: 47,
    nome: 'Segundo molar inferior direito',
    arcada: 'mandibula',
    lado: 'direito',
    tipo: 'molar',
    modelo: '/models/odontologia/dentes/permanentes/dente_47.glb',
    isDeciduo: false
  },
  48: {
    numero: '48',
    numeroInt: 48,
    nome: 'Terceiro molar inferior direito (Siso)',
    arcada: 'mandibula',
    lado: 'direito',
    tipo: 'molar',
    modelo: '/models/odontologia/dentes/permanentes/dente_48.glb',
    isDeciduo: false
  }
};

// ----------------------------------------------------------------------------
// 2. DENTES DECÍDUOS / INFANTIS (51-55, 61-65, 71-75, 81-85)
// ----------------------------------------------------------------------------
export const BIBLIOTECA_DENTES_DECIDUOS: Record<number, InfoDenteBiblioteca> = {
  // QUADRANTE 5 - MAXILA DIREITA DECÍDUA
  51: { numero: '51', numeroInt: 51, nome: 'Incisivo central superior direito decíduo', arcada: 'maxila', lado: 'direito', tipo: 'incisivo', modelo: '/models/odontologia/dentes/deciduos/dente_51.glb', isDeciduo: true },
  52: { numero: '52', numeroInt: 52, nome: 'Incisivo lateral superior direito decíduo', arcada: 'maxila', lado: 'direito', tipo: 'incisivo', modelo: '/models/odontologia/dentes/deciduos/dente_52.glb', isDeciduo: true },
  53: { numero: '53', numeroInt: 53, nome: 'Canino superior direito decíduo', arcada: 'maxila', lado: 'direito', tipo: 'canino', modelo: '/models/odontologia/dentes/deciduos/dente_53.glb', isDeciduo: true },
  54: { numero: '54', numeroInt: 54, nome: 'Primeiro molar superior direito decíduo', arcada: 'maxila', lado: 'direito', tipo: 'molar', modelo: '/models/odontologia/dentes/deciduos/dente_54.glb', isDeciduo: true },
  55: { numero: '55', numeroInt: 55, nome: 'Segundo molar superior direito decíduo', arcada: 'maxila', lado: 'direito', tipo: 'molar', modelo: '/models/odontologia/dentes/deciduos/dente_55.glb', isDeciduo: true },

  // QUADRANTE 6 - MAXILA ESQUERDA DECÍDUA
  61: { numero: '61', numeroInt: 61, nome: 'Incisivo central superior esquerdo decíduo', arcada: 'maxila', lado: 'esquerdo', tipo: 'incisivo', modelo: '/models/odontologia/dentes/deciduos/dente_61.glb', isDeciduo: true },
  62: { numero: '62', numeroInt: 62, nome: 'Incisivo lateral superior esquerdo decíduo', arcada: 'maxila', lado: 'esquerdo', tipo: 'incisivo', modelo: '/models/odontologia/dentes/deciduos/dente_62.glb', isDeciduo: true },
  63: { numero: '63', numeroInt: 63, nome: 'Canino superior esquerdo decíduo', arcada: 'maxila', lado: 'esquerdo', tipo: 'canino', modelo: '/models/odontologia/dentes/deciduos/dente_63.glb', isDeciduo: true },
  64: { numero: '64', numeroInt: 64, nome: 'Primeiro molar superior esquerdo decíduo', arcada: 'maxila', lado: 'esquerdo', tipo: 'molar', modelo: '/models/odontologia/dentes/deciduos/dente_64.glb', isDeciduo: true },
  65: { numero: '65', numeroInt: 65, nome: 'Segundo molar superior esquerdo decíduo', arcada: 'maxila', lado: 'esquerdo', tipo: 'molar', modelo: '/models/odontologia/dentes/deciduos/dente_65.glb', isDeciduo: true },

  // QUADRANTE 7 - MANDÍBULA ESQUERDA DECÍDUA
  71: { numero: '71', numeroInt: 71, nome: 'Incisivo central inferior esquerdo decíduo', arcada: 'mandibula', lado: 'esquerdo', tipo: 'incisivo', modelo: '/models/odontologia/dentes/deciduos/dente_71.glb', isDeciduo: true },
  72: { numero: '72', numeroInt: 72, nome: 'Incisivo lateral inferior esquerdo decíduo', arcada: 'mandibula', lado: 'esquerdo', tipo: 'incisivo', modelo: '/models/odontologia/dentes/deciduos/dente_72.glb', isDeciduo: true },
  73: { numero: '73', numeroInt: 73, nome: 'Canino inferior esquerdo decíduo', arcada: 'mandibula', lado: 'esquerdo', tipo: 'canino', modelo: '/models/odontologia/dentes/deciduos/dente_73.glb', isDeciduo: true },
  74: { numero: '74', numeroInt: 74, nome: 'Primeiro molar inferior esquerdo decíduo', arcada: 'mandibula', lado: 'esquerdo', tipo: 'molar', modelo: '/models/odontologia/dentes/deciduos/dente_74.glb', isDeciduo: true },
  75: { numero: '75', numeroInt: 75, nome: 'Segundo molar inferior esquerdo decíduo', arcada: 'mandibula', lado: 'esquerdo', tipo: 'molar', modelo: '/models/odontologia/dentes/deciduos/dente_75.glb', isDeciduo: true },

  // QUADRANTE 8 - MANDÍBULA DIREITA DECÍDUA
  81: { numero: '81', numeroInt: 81, nome: 'Incisivo central inferior direito decíduo', arcada: 'mandibula', lado: 'direito', tipo: 'incisivo', modelo: '/models/odontologia/dentes/deciduos/dente_81.glb', isDeciduo: true },
  82: { numero: '82', numeroInt: 82, nome: 'Incisivo lateral inferior direito decíduo', arcada: 'mandibula', lado: 'direito', tipo: 'incisivo', modelo: '/models/odontologia/dentes/deciduos/dente_82.glb', isDeciduo: true },
  83: { numero: '83', numeroInt: 83, nome: 'Canino inferior direito decíduo', arcada: 'mandibula', lado: 'direito', tipo: 'canino', modelo: '/models/odontologia/dentes/deciduos/dente_83.glb', isDeciduo: true },
  84: { numero: '84', numeroInt: 84, nome: 'Primeiro molar inferior direito decíduo', arcada: 'mandibula', lado: 'direito', tipo: 'molar', modelo: '/models/odontologia/dentes/deciduos/dente_84.glb', isDeciduo: true },
  85: { numero: '85', numeroInt: 85, nome: 'Segundo molar inferior direito decíduo', arcada: 'mandibula', lado: 'direito', tipo: 'molar', modelo: '/models/odontologia/dentes/deciduos/dente_85.glb', isDeciduo: true }
};

// ----------------------------------------------------------------------------
// FUNÇÕES AUXILIARES DE BUSCA E METADADOS
// ----------------------------------------------------------------------------
export function getInfoDenteBiblioteca(numero: number): InfoDenteBiblioteca {
  if (numero >= 51 && numero <= 85) {
    return BIBLIOTECA_DENTES_DECIDUOS[numero] || {
      numero: numero.toString(),
      numeroInt: numero,
      nome: `Dente Decíduo #${numero}`,
      arcada: numero <= 65 ? 'maxila' : 'mandibula',
      lado: (numero >= 51 && numero <= 55) || (numero >= 81 && numero <= 85) ? 'direito' : 'esquerdo',
      tipo: 'molar',
      modelo: `/models/odontologia/dentes/deciduos/dente_${numero}.glb`,
      isDeciduo: true
    };
  }

  return BIBLIOTECA_DENTES_PERMANENTES[numero] || {
    numero: numero.toString(),
    numeroInt: numero,
    nome: `Dente Permanete #${numero}`,
    arcada: numero <= 28 ? 'maxila' : 'mandibula',
    lado: (numero >= 11 && numero <= 18) || (numero >= 41 && numero <= 48) ? 'direito' : 'esquerdo',
    tipo: 'molar',
    modelo: `/models/odontologia/dentes/permanentes/dente_${numero}.glb`,
    isDeciduo: false
  };
}
