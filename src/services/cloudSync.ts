// Serviço de Sincronização em Nuvem em Tempo Real para OdontoWeb
// Permite que qualquer alteração no celular (Android/iOS) apareça instantaneamente no notebook e vice-versa!

const CLOUD_SYNC_ENDPOINT = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a02775064c72bb';

export interface CloudDataPayload {
  producao?: any[];
  financeiro?: any[];
  pacientes?: any[];
  consultas?: any[];
  updatedAt?: number;
  updatedBy?: string;
}

let isSyncing = false;

// Chaves do localStorage
export const KEYS = {
  PRODUCAO: 'odonto_producao_registros_v2',
  FINANCEIRO: 'odonto_financeiro_pessoal_v1',
  PACIENTES: 'odonto_pacientes_v1',
  CONSULTAS: 'odonto_consultas_v1',
  LAST_UPDATE: 'odonto_last_sync_timestamp'
};

/**
 * Envia as alterações locais para a nuvem apenas quando há alterações explícitas
 */
export async function pushToCloud(data: Partial<CloudDataPayload>): Promise<boolean> {
  try {
    const timestamp = Date.now();
    localStorage.setItem(KEYS.LAST_UPDATE, timestamp.toString());

    // Carrega o payload existente do localStorage para manter integridade
    const payload: CloudDataPayload = {
      producao: data.producao !== undefined ? data.producao : getItemJSON(KEYS.PRODUCAO, []),
      financeiro: data.financeiro !== undefined ? data.financeiro : getItemJSON(KEYS.FINANCEIRO, []),
      pacientes: data.pacientes !== undefined ? data.pacientes : getItemJSON(KEYS.PACIENTES, []),
      consultas: data.consultas !== undefined ? data.consultas : getItemJSON(KEYS.CONSULTAS, []),
      updatedAt: timestamp,
      updatedBy: typeof window !== 'undefined' && window.innerWidth < 768 ? 'Celular (Android/iOS)' : 'Notebook/PC'
    };

    const res = await fetch(CLOUD_SYNC_ENDPOINT, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'odontoweb_juniorbor1986_master_sync',
        data: payload
      })
    });

    if (res.ok) {
      console.log('✅ Dados atualizados e sincronizados na nuvem!');
      return true;
    }
  } catch (error) {
    console.warn('Falha temporária ao sincronizar com a nuvem:', error);
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
    const res = await fetch(CLOUD_SYNC_ENDPOINT);
    if (!res.ok) {
      isSyncing = false;
      return false;
    }

    const result = await res.json();
    const cloudData: CloudDataPayload = result.data || {};
    const remoteTimestamp = cloudData.updatedAt || 0;
    const localTimestamp = Number(localStorage.getItem(KEYS.LAST_UPDATE) || '0');

    // Sincroniza se o remoto for mais novo, se for a primeira carga (localTimestamp === 0) ou se for forçado
    if (force || remoteTimestamp > localTimestamp || (localTimestamp === 0 && remoteTimestamp > 0)) {
      console.log(`⚡ Sincronizando dados da nuvem (${cloudData.updatedBy || 'Dispositivo'}):`, cloudData);
      
      if (cloudData.producao !== undefined) {
        localStorage.setItem(KEYS.PRODUCAO, JSON.stringify(cloudData.producao));
      }
      if (cloudData.financeiro !== undefined) {
        localStorage.setItem(KEYS.FINANCEIRO, JSON.stringify(cloudData.financeiro));
      }
      if (cloudData.pacientes !== undefined) {
        localStorage.setItem(KEYS.PACIENTES, JSON.stringify(cloudData.pacientes));
      }
      if (cloudData.consultas !== undefined) {
        localStorage.setItem(KEYS.CONSULTAS, JSON.stringify(cloudData.consultas));
      }

      localStorage.setItem(KEYS.LAST_UPDATE, (remoteTimestamp || Date.now()).toString());

      onUpdate(cloudData);
      isSyncing = false;
      return true;
    }
  } catch (error) {
    // Falha silenciosa
  }

  isSyncing = false;
  return false;
}

function getItemJSON(key: string, fallback: any) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}
