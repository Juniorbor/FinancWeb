// Serviço de Sincronização em Nuvem em Tempo Real para OdontoWeb
// Permite que qualquer alteração no celular (Android/iOS) apareça instantaneamente no notebook!

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
 * Envia as alterações locais para a nuvem para que o notebook/celular receba em tempo real
 */
export async function pushToCloud(data: Partial<CloudDataPayload>): Promise<boolean> {
  try {
    const timestamp = Date.now();
    localStorage.setItem(KEYS.LAST_UPDATE, timestamp.toString());

    // Monta o payload completo combinando com os dados locais do localStorage
    const payload: CloudDataPayload = {
      producao: data.producao !== undefined ? data.producao : getItemJSON(KEYS.PRODUCAO, []),
      financeiro: data.financeiro !== undefined ? data.financeiro : getItemJSON(KEYS.FINANCEIRO, []),
      pacientes: data.pacientes !== undefined ? data.pacientes : getItemJSON(KEYS.PACIENTES, []),
      consultas: data.consultas !== undefined ? data.consultas : getItemJSON(KEYS.CONSULTAS, []),
      updatedAt: timestamp,
      updatedBy: navigator.userAgent.includes('Mobile') ? 'Celular (Android/iOS)' : 'Notebook/PC'
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
      console.log('✅ Alterações sincronizadas na nuvem com sucesso!');
      return true;
    }
  } catch (error) {
    console.warn('Serviço de nuvem offline ou aguardando conexão:', error);
  }
  return false;
}

/**
 * Baixa as atualizações da nuvem se houverem dados mais recentes criados no celular ou notebook
 */
export async function pullFromCloud(
  onUpdate: (payload: CloudDataPayload) => void
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

    // Se a nuvem tiver dados mais novos do que o dispositivo local, atualiza!
    if (remoteTimestamp > localTimestamp) {
      console.log(`⚡ Sincronizando novas alterações vindas de: ${cloudData.updatedBy || 'outro dispositivo'}`);
      
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

      localStorage.setItem(KEYS.LAST_UPDATE, remoteTimestamp.toString());

      // Executa callback para atualizar os estados do React no app
      onUpdate(cloudData);
      isSyncing = false;
      return true;
    }
  } catch (error) {
    // Falha silenciosa se desconectado
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
