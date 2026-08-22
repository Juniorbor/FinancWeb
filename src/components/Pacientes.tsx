import React, { useState } from 'react';
import type { Paciente } from '../types';
import { CameraModal } from './CameraModal';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  Mail,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  LayoutGrid,
  List,
  FileText,
  Edit2,
  Trash2,
  AlertTriangle,
  Upload,
  User as UserIcon,
  Camera,
  X
} from 'lucide-react';

interface PacientesProps {
  pacientes: Paciente[];
  onAddPaciente: (novo: Omit<Paciente, 'id' | 'dataCadastro'>) => void;
  onEditPaciente: (paciente: Paciente) => void;
  onDeletePaciente: (id: string) => void;
  onSelectPacienteParaOdontograma: (paciente: Paciente) => void;
  onVerPerfilCompleto?: (paciente: Paciente) => void;
  darkMode?: boolean;
}

export const Pacientes: React.FC<PacientesProps> = ({
  pacientes,
  onAddPaciente,
  onEditPaciente,
  onDeletePaciente,
  onSelectPacienteParaOdontograma,
  onVerPerfilCompleto,
  darkMode
}) => {
  const [busca, setBusca] = useState<string>('');
  const [modoVisualizacao, setModoVisualizacao] = useState<'cards' | 'tabela'>('cards');
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [cameraAberta, setCameraAberta] = useState<boolean>(false);
  const [pacienteEditando, setPacienteEditando] = useState<Paciente | null>(null);
  const [pacienteExcluindoId, setPacienteExcluindoId] = useState<string | null>(null);

  // Form states
  const [nome, setNome] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');
  const [dataNascimento, setDataNascimento] = useState<string>('1990-01-01');
  const [telefone, setTelefone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [convenio, setConvenio] = useState<string>('Particular');
  const [alergiaInput, setAlergiaInput] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');
  const [fotoUrl, setFotoUrl] = useState<string>('');

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.cpf.includes(busca) ||
      p.telefone.includes(busca)
  );

  const handleAbrirNovoModal = () => {
    setPacienteEditando(null);
    setNome('');
    setCpf('');
    setDataNascimento('1990-01-01');
    setTelefone('');
    setEmail('');
    setConvenio('Particular');
    setAlergiaInput('');
    setObservacoes('');
    setFotoUrl('');
    setModalAberto(true);
  };

  const handleAbrirEditarModal = (paciente: Paciente) => {
    setPacienteEditando(paciente);
    setNome(paciente.nome);
    setCpf(paciente.cpf);
    setDataNascimento(paciente.dataNascimento);
    setTelefone(paciente.telefone);
    setEmail(paciente.email);
    setConvenio(paciente.convenio || 'Particular');
    setAlergiaInput(paciente.alergias ? paciente.alergias.join(', ') : '');
    setObservacoes(paciente.observacoes || '');
    setFotoUrl(paciente.fotoUrl || '');
    setModalAberto(true);
  };

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (pacienteEditando) {
      onEditPaciente({
        ...pacienteEditando,
        nome,
        cpf,
        dataNascimento,
        telefone,
        email,
        convenio,
        fotoUrl: fotoUrl || undefined,
        alergias: alergiaInput ? alergiaInput.split(',').map((a) => a.trim()) : [],
        observacoes
      });
    } else {
      onAddPaciente({
        nome,
        cpf,
        dataNascimento,
        telefone,
        email,
        convenio,
        fotoUrl: fotoUrl || undefined,
        alergias: alergiaInput ? alergiaInput.split(',').map((a) => a.trim()) : [],
        observacoes
      });
    }

    setModalAberto(false);
  };

  const handleConfirmarExclusao = () => {
    if (pacienteExcluindoId) {
      onDeletePaciente(pacienteExcluindoId);
      setPacienteExcluindoId(null);
    }
  };

  // Helper para obter iniciais do nome
  const getIniciais = (nomeStr: string) => {
    if (!nomeStr) return 'P';
    const partes = nomeStr.trim().split(' ');
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-500" /> Pacientes & Prontuários Digitais
          </h1>
          <p className="text-xs text-slate-400">
            Cadastro de pacientes com foto de perfil, anamnese e histórico odontológico.
          </p>
        </div>

        <button
          onClick={handleAbrirNovoModal}
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Cadastrar Novo Paciente
        </button>
      </div>

      {/* Barra de Filtros e Alternador de Exibição */}
      <div className={`p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou telefone..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModoVisualizacao('cards')}
            className={`p-2 rounded-xl border transition-colors ${
              modoVisualizacao === 'cards'
                ? 'bg-teal-600 text-white border-teal-600 shadow'
                : darkMode
                ? 'bg-slate-800 border-slate-700 text-slate-400'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
            title="Visualização em Cards"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <button
            onClick={() => setModoVisualizacao('tabela')}
            className={`p-2 rounded-xl border transition-colors ${
              modoVisualizacao === 'tabela'
                ? 'bg-teal-600 text-white border-teal-600 shadow'
                : darkMode
                ? 'bg-slate-800 border-slate-700 text-slate-400'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
            title="Visualização em Tabela"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conteúdo: Modo Cards */}
      {modoVisualizacao === 'cards' ? (
        pacientesFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pacientesFiltrados.map((paciente) => (
              <div
                key={paciente.id}
                className={`p-5 rounded-3xl border shadow-sm space-y-4 transition-all hover:border-teal-500/50 relative ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {paciente.fotoUrl ? (
                      <img
                        src={paciente.fotoUrl}
                        alt={paciente.nome}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-teal-500 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center font-extrabold text-white text-sm border-2 border-teal-500 shadow-sm">
                        {getIniciais(paciente.nome)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-extrabold text-base">{paciente.nome}</h3>
                      <p className="text-xs text-slate-400">CPF: {paciente.cpf} • Nasc: {paciente.dataNascimento}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAbrirEditarModal(paciente)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition-colors"
                      title="Editar Paciente"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPacienteExcluindoId(paciente.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Excluir Paciente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="bg-teal-500/20 text-teal-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-teal-500/30 ml-1">
                      {paciente.convenio || 'Particular'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-400">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-teal-500" /> {paciente.telefone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-teal-500" /> {paciente.email}
                  </p>
                </div>

                {paciente.alergias && paciente.alergias.length > 0 && (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-xs flex items-center gap-2 text-rose-400 font-bold">
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Alergias: {paciente.alergias.join(', ')}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/30 flex items-center justify-between gap-2">
                  {onVerPerfilCompleto && (
                    <button
                      onClick={() => onVerPerfilCompleto(paciente)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-teal-400" /> Abrir Prontuário
                    </button>
                  )}

                  <button
                    onClick={() => onSelectPacienteParaOdontograma(paciente)}
                    className="bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer ml-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Odontograma <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold">
            Nenhum paciente cadastrado. Clique no botão acima para cadastrar seu primeiro paciente!
          </div>
        )
      ) : (
        /* Conteúdo: Modo Tabela */
        <div className={`rounded-3xl border shadow-sm overflow-hidden ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/40 text-slate-400 uppercase font-bold">
                <th className="py-3.5 px-4">Paciente</th>
                <th className="py-3.5 px-4">CPF</th>
                <th className="py-3.5 px-4">Telefone</th>
                <th className="py-3.5 px-4">Convênio</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {pacientesFiltrados.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold flex items-center gap-2">
                    {p.fotoUrl ? (
                      <img src={p.fotoUrl} alt={p.nome} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-[11px]">
                        {getIniciais(p.nome)}
                      </div>
                    )}
                    {p.nome}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{p.cpf}</td>
                  <td className="py-3.5 px-4 text-slate-400">{p.telefone}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-teal-500/20 text-teal-400 font-bold px-2 py-0.5 rounded-md">
                      {p.convenio || 'Particular'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleAbrirEditarModal(p)}
                      className="text-slate-400 hover:text-teal-400 p-1"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => setPacienteExcluindoId(p.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => onSelectPacienteParaOdontograma(p)}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1 rounded-lg text-[11px] ml-2"
                    >
                      Odontograma
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Cadastro / Edição de Paciente */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`rounded-3xl p-6 max-w-lg w-full shadow-2xl border space-y-4 my-8 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h2 className="text-lg font-extrabold">
              {pacienteEditando ? `Editar Cadastro: ${pacienteEditando.nome}` : 'Cadastrar Novo Paciente'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Upload e Foto do Paciente */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-400">Foto de Perfil do Paciente</label>
                <div className="flex items-center gap-4">
                  {fotoUrl ? (
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-teal-500 shrink-0">
                      <img src={fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFotoUrl('')}
                        className="absolute top-0.5 right-0.5 bg-rose-600 text-white p-0.5 rounded-full"
                        title="Remover Foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-400 shrink-0">
                      <UserIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCameraAberta(true)}
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-md shadow-teal-500/20 transition-all"
                      >
                        <Camera className="w-4 h-4 fill-slate-950" /> 📸 Tirar Foto com a Câmera
                      </button>

                      <label className="bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer w-fit">
                        <Upload className="w-4 h-4" /> Selecionar Arquivo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFotoUpload}
                          className="hidden"
                        />
                      </label>

                      {fotoUrl && (
                        <button
                          type="button"
                          onClick={() => setFotoUrl('')}
                          className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Trash2 className="w-4 h-4" /> Excluir Imagem
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">Tire uma foto ao vivo usando a câmera do celular/pc ou envie um arquivo. A foto será anexada ao cadastro e salva em 'Fotografias'.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  placeholder="Ex: Ana Clara Silva"
                  className={`w-full p-2.5 rounded-xl border ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">CPF</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    required
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Data Nascimento</label>
                  <input
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    required
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    required
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Convênio</label>
                  <input
                    type="text"
                    placeholder="Particular, Amil, Unimed..."
                    value={convenio}
                    onChange={(e) => setConvenio(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">E-mail</label>
                <input
                  type="email"
                  placeholder="paciente@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Alergias Conhecidas</label>
                <input
                  type="text"
                  placeholder="Ex: Penicilina, Dipirona..."
                  value={alergiaInput}
                  onChange={(e) => setAlergiaInput(e.target.value)}
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
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow cursor-pointer"
                >
                  {pacienteEditando ? 'Salvar Alterações' : 'Salvar Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {pacienteExcluindoId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-3xl p-6 max-w-sm w-full shadow-2xl border space-y-4 text-center ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-extrabold">Confirmar Exclusão de Paciente</h3>
            <p className="text-xs text-slate-400">
              Tem certeza que deseja excluir o cadastro deste paciente? Esta ação não pode ser desfeita.
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setPacienteExcluindoId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarExclusao}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow cursor-pointer"
              >
                Excluir Paciente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Captura de Foto com a Câmera do Celular/Notebook */}
      <CameraModal
        isOpen={cameraAberta}
        onClose={() => setCameraAberta(false)}
        onCapture={(fotoBase64) => setFotoUrl(fotoBase64)}
        darkMode={darkMode}
        tituloModal="📸 Tirar Foto de Cadastro do Paciente"
      />
    </div>
  );
};
