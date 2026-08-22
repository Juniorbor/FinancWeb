import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, SwitchCamera, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (fotoBase64: string) => void;
  darkMode?: boolean;
  tituloModal?: string;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  darkMode = true,
  tituloModal = 'Tirar Foto com a Câmera'
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [fotoCapturada, setFotoCapturada] = useState<string | null>(null);
  const [erroCamera, setErroCamera] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Iniciar câmera quando o modal for aberto
  useEffect(() => {
    if (isOpen && !fotoCapturada) {
      iniciarCamera(facingMode);
    } else {
      pararCamera();
    }

    return () => {
      pararCamera();
    };
  }, [isOpen, facingMode, fotoCapturada]);

  const iniciarCamera = async (modo: 'user' | 'environment') => {
    setErroCamera(null);
    pararCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErroCamera('O seu navegador ou dispositivo não possui suporte para acesso à câmera.');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: modo,
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Erro ao acessar a câmera:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErroCamera('Permissão de acesso à câmera negada. Por favor, permita o uso da câmera no navegador.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErroCamera('Nenhuma câmera foi encontrada no dispositivo.');
      } else {
        setErroCamera(`Não foi possível conectar à câmera: ${err.message || 'Erro desconhecido'}`);
      }
    }
  };

  const pararCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleAlternarCamera = () => {
    const novoModo = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(novoModo);
  };

  const handleTirarFoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;

    // Redimensiona a foto para tamanho ideal (max 800px) garantindo sincronização instantânea entre celular e notebook
    const maxDim = 800;
    let width = video.videoWidth || 640;
    let height = video.videoHeight || 480;

    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Se for a câmera frontal, espelha horizontalmente para ficar natural
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      setFotoCapturada(dataUrl);
      pararCamera();
    }
  };

  const handleConfirmarFoto = () => {
    if (fotoCapturada) {
      onCapture(fotoCapturada);
      setFotoCapturada(null);
      pararCamera();
      onClose();
    }
  };

  const handleTirarOutra = () => {
    setFotoCapturada(null);
  };

  const handleFecharModal = () => {
    setFotoCapturada(null);
    pararCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className={`rounded-3xl p-6 max-w-lg w-full shadow-2xl border space-y-4 my-auto ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
          <h3 className="text-base font-extrabold flex items-center gap-2 text-teal-400">
            <Camera className="w-5 h-5 text-teal-500" /> {tituloModal}
          </h3>
          <button
            onClick={handleFecharModal}
            className="text-slate-400 hover:text-white p-1 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Feed de Vídeo ou Prévia da Foto */}
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800 shadow-inner">
          {fotoCapturada ? (
            <img
              src={fotoCapturada}
              alt="Foto Capturada"
              className="w-full h-full object-contain"
            />
          ) : erroCamera ? (
            <div className="p-6 text-center text-xs space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <p className="font-extrabold text-rose-400">{erroCamera}</p>
              <button
                onClick={() => iniciarCamera(facingMode)}
                className="bg-slate-800 hover:bg-slate-700 text-teal-400 px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Tentar Novamente
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Botão de Alternar Câmeras (Frontal / Traseira) */}
              <button
                onClick={handleAlternarCamera}
                className="absolute top-3 right-3 p-2.5 rounded-full bg-slate-900/80 text-teal-400 hover:bg-slate-900 border border-slate-700 backdrop-blur-md transition-all cursor-pointer shadow-lg"
                title="Alternar Câmera (Frontal / Traseira)"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Controls Footer */}
        <div className="pt-2 flex items-center justify-between gap-3">
          {fotoCapturada ? (
            <>
              <button
                type="button"
                onClick={handleTirarOutra}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-teal-400" /> Tirar Outra
              </button>
              
              <button
                type="button"
                onClick={handleConfirmarFoto}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-teal-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4.5 h-4.5" /> Anexar Foto ao Cadastro
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleFecharModal}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-2xl cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleTirarFoto}
                disabled={!!erroCamera}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg shadow-teal-500/30 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Camera className="w-5 h-5 fill-slate-950" /> 📸 Capturar Foto
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
