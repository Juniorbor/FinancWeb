// Serviço de Sincronização em Nuvem em Tempo Real para OdontoWeb
// Permite que qualquer alteração no celular (Android/iOS) apareça instantaneamente no notebook!

const getCloudEndpoint = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')) {
    return '/.netlify/functions/sync';
  }
  return 'https://odontoweb-app.netlify.app/.netlify/functions/sync';
};

export interface CloudDataPayload {
  producao?: any[];
  financeiro?: any[];
  pacientes?: any[];
  consultas?: any[];
  updatedAt?: number;
  updatedBy?: string;
}

let isSyncing = false;
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('odontoweb_realtime_channel')
  : null;

// Chaves do localStorage
export const KEYS = {
  PRODUCAO: 'odonto_producao_registros_v2',
  FINANCEIRO: 'odonto_financeiro_pessoal_v1',
  PACIENTES: 'odonto_pacientes_v1',
  CONSULTAS: 'odonto_consultas_v1',
  LAST_UPDATE: 'odonto_last_sync_timestamp'
};

/**
 * Envia as alterações locais para a nuvem Netlify para que o notebook/celular receba em tempo real
 */
export async function pushToCloud(data: Partial<CloudDataPayload>): Promise<boolean> {
  try {
    const timestamp = Date.now();
    localStorage.setItem(KEYS.LAST_UPDATE, timestamp.toString());

    const payload: CloudDataPayload = {
      producao: data.producao !== undefined ? data.producao : getItemJSON(KEYS.PRODUCAO, []),
      financeiro: data.financeiro !== undefined ? data.financeiro : getItemJSON(KEYS.FINANCEIRO, []),
      pacientes: data.pacientes !== undefined ? data.pacientes : getItemJSON(KEYS.PACIENTES, []),
      consultas: data.consultas !== undefined ? data.consultas : getItemJSON(KEYS.CONSULTAS, []),
      updatedAt: timestamp,
      updatedBy: typeof window !== 'undefined' && window.innerWidth < 768 ? 'Celular (Android/iOS)' : 'Notebook/PC'
    };

    // Notifica abas locais instantaneamente via BroadcastChannel
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'SYNC_UPDATE', payload });
    }

    const res = await fetch(getCloudEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log('✅ Alterações sincronizadas com a nuvem!');
      return true;
    }
  } catch (error) {
    console.warn('Conectando à nuvem de sincronização...', error);
  }
  return false;
}

/**
 * Baixa os dados da nuvem se houver dados mais novos ou na inicialização
 */
export async function pullFromCloud(
  onUpdate: (payload: CloudDataPayload) => void,
  force: boolean = false
): Promise<boolean> {
  if (isSyncing) return false;
  isSyncing = true;

  try {
    const res = await fetch(getCloudEndpoint(), {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!res.ok) {
      isSyncing = false;
      return false;
    }

    const result = await res.json();
    const cloudData: CloudDataPayload = result.data || {};
    const remoteTimestamp = cloudData.updatedAt || 0;
    const localTimestamp = Number(localStorage.getItem(KEYS.LAST_UPDATE) || '0');

    // Atualiza se o remoto for mais recente ou se for a carga inicial (force = true)
    if (force || remoteTimestamp > localTimestamp || (localTimestamp === 0 && remoteTimestamp > 0)) {
      console.log(`⚡ Sincronizando dados da nuvem (${cloudData.updatedBy || 'Dispositivo'}):`, cloudData);
      
      if (Array.isArray(cloudData.producao)) {
        localStorage.setItem(KEYS.PRODUCAO, JSON.stringify(cloudData.producao));
      }
      if (Array.isArray(cloudData.financeiro)) {
        localStorage.setItem(KEYS.FINANCEIRO, JSON.stringify(cloudData.financeiro));
      }
      if (Array.isArray(cloudData.pacientes)) {
        localStorage.setItem(KEYS.PACIENTES, JSON.stringify(cloudData.pacientes));
      }
      if (Array.isArray(cloudData.consultas)) {
        localStorage.setItem(KEYS.CONSULTAS, JSON.stringify(cloudData.consultas));
      }

      if (remoteTimestamp > 0) {
        localStorage.setItem(KEYS.LAST_UPDATE, remoteTimestamp.toString());
      }

      onUpdate(cloudData);
      isSyncing = false;
      return true;
    }
  } catch (error) {
    // Falha silenciosa se offline
  }

  isSyncing = false;
  return false;
}

/**
 * Assina atualizações locais em tempo real entre abas no mesmo computador
 */
export function subscribeLocalBroadcast(onUpdate: (payload: CloudDataPayload) => void) {
  if (!broadcastChannel) return () => {};

  const handleMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === 'SYNC_UPDATE') {
      onUpdate(event.data.payload);
    }
  };

  broadcastChannel.addEventListener('message', handleMessage);
  return () => {
    broadcastChannel.removeEventListener('message', handleMessage);
  };
}

function getItemJSON(key: string, fallback: any) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}
