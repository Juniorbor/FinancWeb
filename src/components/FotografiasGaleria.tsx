import React, { useState } from 'react';
import type { FotografiaClinica } from '../types';
import { CameraModal } from './CameraModal';
import {
  Camera,
  Filter,
  Plus,
  Maximize2,
  ArrowLeftRight,
  Upload,
  X,
  Trash2,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';

interface FotografiasGaleriaProps {
  fotografias: FotografiaClinica[];
  pacienteNome?: string;
  onAddFotografia?: (nova: Omit<FotografiaClinica, 'id'>) => void;
  onDeleteFotografia?: (id: string) => void;
  darkMode?: boolean;
}

export const FotografiasGaleria: React.FC<FotografiasGaleriaProps> = ({
  fotografias,
  pacienteNome,
  onAddFotografia,
  onDeleteFotografia,
  darkMode
}) => {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('Todas');
  const [fotoExpandida, setFotoExpandida] = useState<FotografiaClinica | null>(null);
  const [modoAntesDepois, setModoAntesDepois] = useState<boolean>(false);

  // State Modal Nova Foto
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [cameraAberta, setCameraAberta] = useState<boolean>(false);
  const [fotoExcluindoId, setFotoExcluindoId] = useState<string | null>(null);

  const [titulo, setTitulo] = useState<string>('');
  const [categoria, setCategoria] = useState<'Frontal' | 'Perfil' | 'Sorriso' | 'Intraoral' | 'Oclusal' | 'Antes/Depois'>('Frontal');
  const [data, setData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [imagemUrl, setImagemUrl] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');

  const categorias = ['Todas', 'Frontal', 'Perfil', 'Sorriso', 'Intraoral', 'Oclusal', 'Antes/Depois'];

  // Categorias que utilizam Formato Retrato (Vertical 3:4) para Alinhamento Facial e Labial
  const isFormatoRetrato = (cat: string) => ['Frontal', 'Perfil', 'Sorriso', 'Intraoral'].includes(cat);

  const fotosFiltradas = fotografias.filter((f) => {
    if (categoriaAtiva === 'Todas') return true;
    return f.categoria === categoriaAtiva;
  });

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagemUrl) return;

    if (onAddFotografia) {
      onAddFotografia({
        titulo: titulo || `Foto ${categoria}`,
        categoria,
        data,
        imagemUrl,
        descricao
      });
    }

    setTitulo('');
    setCategoria('Frontal');
    setImagemUrl('');
    setDescricao('');
    setModalAberto(false);
  };

  const handleConfirmarExclusao = () => {
    if (fotoExcluindoId && onDeleteFotografia) {
      onDeleteFotografia(fotoExcluindoId);
      setFotoExcluindoId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Galeria */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-md">
            Galeria Fotográfica de Enquadramento Retrato (Frontal, Perfil & Sorriso)
          </span>
          <h2 className="text-xl font-extrabold flex items-center gap-2 mt-1">
            <Camera className="w-6 h-6 text-teal-500" /> Galeria de Fotografias Clínicas & Evolução
          </h2>
          <p className="text-xs text-slate-400">
            {pacienteNome ? `Registros fotográficos do paciente: ${pacienteNome}` : 'Documentação fotográfica odontológica com suporte a enquadramento Retrato vertical.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setModoAntesDepois(!modoAntesDepois)}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              modoAntesDepois
                ? 'bg-teal-600 text-white shadow-md'
                : darkMode
                ? 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            {modoAntesDepois ? 'Ver Galeria' : 'Comparador Antes & Depois'}
          </button>

          <button
            onClick={() => setModalAberto(true)}
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-teal-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nova Foto Clínica (Retrato)
          </button>
        </div>
      </div>

      {/* Filtros de Categoria com Indicador Retrato */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaAtiva(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              categoriaAtiva === cat
                ? 'bg-teal-600 text-white shadow-sm'
                : darkMode
                ? 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {cat}
            {isFormatoRetrato(cat) && cat !== 'Todas' && (
              <span className="text-[9px] font-extrabold bg-teal-400/20 text-teal-300 px-1.5 py-0.2 rounded">
                Retrato
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Modo Comparador Antes e Depois */}
      {modoAntesDepois ? (
        <div className={`p-6 rounded-3xl border shadow-sm space-y-6 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="text-center max-w-lg mx-auto space-y-1">
            <h3 className="font-extrabold text-lg flex items-center justify-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-teal-500" /> Comparação de Evolução do Tratamento Estético
            </h3>
            <p className="text-xs text-slate-400">Exibição lado a lado dos registros de Pré e Pós procedimento em Formato Retrato.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Foto ANTES */}
            <div className="space-y-2">
              <div className="bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-xl text-xs font-bold text-center border border-rose-500/30">
                1. ANTES (Pré-Tratamento)
              </div>
              {fotografias[0] ? (
                <div className="rounded-2xl overflow-hidden border border-slate-800 aspect-[3/4] max-h-96 mx-auto relative group bg-slate-950 shadow-xl">
                  <img src={fotografias[0].imagemUrl} alt="Antes" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 bg-slate-950/80 text-white px-2 py-1 rounded text-[10px] font-bold">
                    {fotografias[0].titulo || fotografias[0].descricao} ({fotografias[0].data})
                  </div>
                </div>
              ) : (
                <div className="h-64 rounded-2xl bg-slate-800/50 border border-dashed border-slate-700 flex items-center justify-center text-xs text-slate-400">
                  Nenhuma foto cadastrada como 'Antes'
                </div>
              )}
            </div>

            {/* Foto DEPOIS */}
            <div className="space-y-2">
              <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold text-center border border-emerald-500/30">
                2. DEPOIS (Pós-Tratamento / Resultado)
              </div>
              {fotografias[1] || fotografias[0] ? (
                <div className="rounded-2xl overflow-hidden border border-slate-800 aspect-[3/4] max-h-96 mx-auto relative group bg-slate-950 shadow-xl">
                  <img src={(fotografias[1] || fotografias[0]).imagemUrl} alt="Depois" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 bg-slate-950/80 text-white px-2 py-1 rounded text-[10px] font-bold">
                    {(fotografias[1] || fotografias[0]).titulo || (fotografias[1] || fotografias[0]).descricao} ({(fotografias[1] || fotografias[0]).data})
                  </div>
                </div>
              ) : (
                <div className="h-64 rounded-2xl bg-slate-800/50 border border-dashed border-slate-700 flex items-center justify-center text-xs text-slate-400">
                  Nenhuma foto cadastrada como 'Depois'
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Grid Normal de Fotografias (com Suporte ao Formato Retrato 3:4) */
        fotosFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fotosFiltradas.map((foto) => {
              const retrato = isFormatoRetrato(foto.categoria);

              return (
                <div
                  key={foto.id}
                  className={`rounded-3xl border shadow-sm overflow-hidden space-y-3 p-4 transition-all hover:border-teal-500/50 ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className={`relative rounded-2xl overflow-hidden group bg-slate-950 border border-slate-800/60 shadow-md ${
                    retrato ? 'aspect-[3/4] max-h-96' : 'aspect-video'
                  }`}>
                    <img
                      src={foto.imagemUrl}
                      alt={foto.titulo || foto.descricao}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setFotoExpandida(foto)}
                        className="p-2.5 bg-slate-900/90 text-white rounded-xl hover:bg-teal-600 transition-colors cursor-pointer shadow-lg"
                        title="Expandir Foto"
                      >
                        <Maximize2 className="w-4.5 h-4.5" />
                      </button>
                      {onDeleteFotografia && (
                        <button
                          onClick={() => setFotoExcluindoId(foto.id)}
                          className="p-2.5 bg-slate-900/90 text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white transition-colors cursor-pointer shadow-lg"
                          title="Excluir Foto"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      )}
                    </div>

                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="bg-teal-500/90 backdrop-blur-sm text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow">
                        {foto.categoria}
                      </span>
                      {retrato && (
                        <span className="bg-slate-950/80 backdrop-blur-sm text-teal-300 font-bold text-[9px] px-2 py-0.5 rounded-full border border-teal-500/40">
                          Retrato 3:4
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm">{foto.titulo || foto.descricao}</h3>
                      <span className="text-[10px] text-slate-400 font-semibold">{foto.data}</span>
                    </div>
                    {foto.descricao && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{foto.descricao}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`p-12 rounded-3xl border text-center space-y-3 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
          }`}>
            <ImageIcon className="w-10 h-10 text-teal-500 mx-auto opacity-50" />
            <p className="text-xs font-semibold">Nenhuma fotografia clínica cadastrada nesta categoria.</p>
            <button
              onClick={() => setModalAberto(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Adicionar Primeira Foto Clínica (Retrato)
            </button>
          </div>
        )
      )}

      {/* Modal Adicionar Foto Clínica com Moldura Retrato Vertical */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`rounded-3xl p-6 max-w-md w-full shadow-2xl border space-y-4 my-8 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                <Camera className="w-5 h-5 text-teal-500" /> Nova Fotografia Clínica
              </h2>
              <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Seleção de Categoria com destaque ao Formato Retrato */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Categoria da Foto</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as any)}
                    className={`w-full p-2.5 rounded-xl border font-bold ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="Frontal">Frontal (Retrato 3:4)</option>
                    <option value="Perfil">Perfil (Retrato 3:4)</option>
                    <option value="Sorriso">Sorriso (Retrato 3:4)</option>
                    <option value="Intraoral">Intraoral (Retrato 3:4)</option>
                    <option value="Oclusal">Oclusal (Horizontal)</option>
                    <option value="Antes/Depois">Antes/Depois</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Data da Foto</label>
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

              {/* Upload & Frame em Formato Retrato Vertical */}
              <div>
                <label className="block font-bold text-slate-400 mb-1.5">
                  Fotografia da Câmera / Arquivo ({isFormatoRetrato(categoria) ? 'Formato Retrato Vertical 3:4' : 'Formato Padrão'})
                </label>
                {imagemUrl ? (
                  <div className={`relative rounded-2xl overflow-hidden border-2 border-teal-500 max-w-xs mx-auto shadow-xl ${
                    isFormatoRetrato(categoria) ? 'aspect-[3/4] max-h-80' : 'aspect-video'
                  }`}>
                    <img src={imagemUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImagemUrl('')}
                      className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-full shadow cursor-pointer"
                      title="Trocar Imagem"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => setCameraAberta(true)}
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 px-4 py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20 transition-all flex-1"
                      >
                        <Camera className="w-4.5 h-4.5 fill-slate-950" /> 📸 Tirar Foto com a Câmera
                      </button>

                      <label className="bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer flex-1">
                        <Upload className="w-4.5 h-4.5" /> Selecionar do Dispositivo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-[10px] text-teal-400 text-center font-bold">
                      {isFormatoRetrato(categoria) ? '📸 Moldura Retrato Vertical (Ideal para Rosto e Sorriso)' : '📸 Moldura Horizontal'}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Título da Fotografia</label>
                <input
                  type="text"
                  placeholder={`Ex: Foto ${categoria} do Sorriso`}
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  className={`w-full p-2.5 rounded-xl border ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Observações Clínicas / Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Anotações sobre alinhamento labial, facial ou estética..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
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
                  disabled={!imagemUrl}
                  className={`px-4 py-2 rounded-xl font-bold shadow transition-all cursor-pointer ${
                    imagemUrl
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Salvar Foto Clínica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Expansão de Foto */}
      {fotoExpandida && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full space-y-3 relative flex flex-col items-center">
            <button
              onClick={() => setFotoExpandida(null)}
              className="absolute -top-10 right-0 bg-slate-800 text-white p-2 rounded-full hover:bg-rose-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={fotoExpandida.imagemUrl}
              alt={fotoExpandida.titulo || fotoExpandida.descricao}
              className={`object-contain rounded-2xl border border-slate-800 ${
                isFormatoRetrato(fotoExpandida.categoria) ? 'max-h-[80vh] w-auto' : 'w-full max-h-[75vh]'
              }`}
            />

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white flex justify-between items-center text-xs w-full">
              <div>
                <h3 className="font-extrabold text-sm">{fotoExpandida.titulo || fotoExpandida.descricao}</h3>
                <p className="text-slate-400">{fotoExpandida.descricao || 'Sem observações'}</p>
              </div>
              <span className="bg-teal-500/20 text-teal-400 font-bold px-3 py-1 rounded-full border border-teal-500/30">
                {fotoExpandida.categoria} • {fotoExpandida.data}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmação de Exclusão de Foto */}
      {fotoExcluindoId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-3xl p-6 max-w-sm w-full shadow-2xl border space-y-4 text-center ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-extrabold">Excluir Foto Clínica</h3>
            <p className="text-xs text-slate-400">
              Tem certeza que deseja excluir esta fotografia do prontuário? Esta ação não pode ser desfeita.
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setFotoExcluindoId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarExclusao}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow cursor-pointer"
              >
                Excluir Foto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Câmera para Fotografias Clínicas */}
      <CameraModal
        isOpen={cameraAberta}
        onClose={() => setCameraAberta(false)}
        onCapture={(fotoBase64) => setImagemUrl(fotoBase64)}
        darkMode={darkMode}
        tituloModal="📸 Capturar Fotografia Clínica com a Câmera"
      />
    </div>
  );
};
