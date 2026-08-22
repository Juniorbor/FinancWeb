import type {
  Paciente,
  Consulta,
  TransacaoFinanceira,
  ProcedimentoTratamento,
  DenteInfo,
  AnamneseDetalhada,
  RadiografiaExame,
  FotografiaClinica,
  HistoricoTimeline,
  MensagemIA
} from '../types';

// Banco Zerado para Novos Cadastros do Usuário
export const mockPacientes: Paciente[] = [];

export const mockConsultas: Consulta[] = [];

export const mockProcedimentos: ProcedimentoTratamento[] = [];

export const mockTransacoes: TransacaoFinanceira[] = [];

export const dentesIniciaisMock: Record<number, DenteInfo> = {};

export const mockAnamneseDetalhada: AnamneseDetalhada = {
  queixaPrincipal: '',
  historicoMedico: '',
  doencasSistemicas: [],
  medicamentosUso: [],
  alergias: [],
  habitos: [],
  historicoFamiliar: '',
  cirurgiasPrevias: '',
  sensibilidadeAnestesia: false,
  termoConsentimentoAceito: false,
  dataUltimaAtualizacao: new Date().toISOString().split('T')[0]
};

export const mockRadiografias: RadiografiaExame[] = [];

export const mockFotografias: FotografiaClinica[] = [];

export const mockTimeline: HistoricoTimeline[] = [];

export const mockMensagensIA: MensagemIA[] = [
  {
    id: 'msg-1',
    remetente: 'ia',
    texto: 'Olá, Dr. Crenilto Junior! Sou a OdontoIA. O banco de dados foi limpo e está pronto para receber os novos cadastros do consultório. Como posso ajudar hoje?',
    dataHora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
];
