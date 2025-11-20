import React, { useRef, useEffect, useState } from 'react';
import { DetectionObject, MediaType } from '../types';
import { Scan, Maximize, Play, Pause } from 'lucide-react';

interface DetectionCanvasProps {
  file: File | null;
  mediaType: MediaType;
  detections: DetectionObject[];
  isAnalyzing: boolean;
  onVideoFrameRequest: (base64Frame: string) => void;
}

// Helper to generate consistent colors based on label string
const getColorForLabel = (label: string) => {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 60%)`;
};

export const DetectionCanvas: React.FC<DetectionCanvasProps> = ({
  file,
  mediaType,
  detections,
  isAnalyzing,
  onVideoFrameRequest,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setObjectUrl(null);
  }, [file]);

  const handleCaptureFrame = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8); // JPEG quality 0.8
        onVideoFrameRequest(base64);
      }
    }
  };

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!file || !objectUrl) return null;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black/40 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      <div className="relative max-w-full max-h-[70vh]" ref={containerRef}>
        {mediaType === 'image' ? (
          <img
            src={objectUrl}
            alt="Analysis Target"
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
          />
        ) : (
          <video
            ref={videoRef}
            src={objectUrl}
            className="max-w-full max-h-[70vh] rounded-lg"
            playsInline
            loop
            muted
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}

        {/* Overlay Layer */}
        <div className="absolute inset-0 pointer-events-none">
          {detections.map((det, idx) => {
            // Convert 0-1000 normalized coords to percentages
            const top = (det.box_2d.ymin / 1000) * 100;
            const left = (det.box_2d.xmin / 1000) * 100;
            const width = ((det.box_2d.xmax - det.box_2d.xmin) / 1000) * 100;
            const height = ((det.box_2d.ymax - det.box_2d.ymin) / 1000) * 100;
            
            const color = getColorForLabel(det.label);

            return (
              <div
                key={`${det.label}-${idx}`}
                className="absolute border-[3px] opacity-0 animate-fade-in"
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                  borderColor: color,
                  boxShadow: `0 0 10px ${color}66, inset 0 0 10px ${color}33`,
                  animation: 'fadeIn 0.5s ease-out forwards',
                }}
              >
                <div 
                  className="absolute -top-9 left-[-2px] flex flex-col items-start"
                >
                  <div 
                    className="px-2 py-1 text-xs font-bold text-black rounded-t-md shadow-sm whitespace-nowrap flex items-center gap-2"
                    style={{ backgroundColor: color }}
                  >
                    <span className="text-sm leading-none" style={{fontFamily: 'system-ui, sans-serif'}}>{det.label}</span>
                    <span className="bg-black/20 px-1 rounded text-[10px] leading-none">
                      {Math.round(det.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scanning Effect Overlay when analyzing */}
        {isAnalyzing && (
          <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent w-full h-[10%] animate-scan" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-3">
                <Scan className="w-10 h-10 text-indigo-400 animate-pulse" />
                <span className="text-indigo-200 font-medium tracking-wider animate-pulse">正在识别 (Detecting)...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Controls */}
      {mediaType === 'video' && (
        <div className="absolute bottom-6 flex gap-4 z-20">
            <button 
                onClick={toggleVideoPlay}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full backdrop-blur-md border border-slate-600 transition-all"
            >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                {isPlaying ? 'Pause' : 'Play'}
            </button>

            <button
                onClick={handleCaptureFrame}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-full shadow-lg shadow-indigo-900/20 transition-all transform hover:scale-105"
            >
                <Maximize size={18} />
                {isAnalyzing ? '处理中...' : '分析当前帧 (Analyze)'}
            </button>
        </div>
      )}
      
      <style>{`
        @keyframes scan {
          0% { top: -10%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            opacity: 1;
        }
      `}</style>
    </div>
  );
};