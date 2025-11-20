import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { DetectionCanvas } from './components/DetectionCanvas';
import { Sidebar } from './components/Sidebar';
import { detectObjectsInImage } from './services/geminiService';
import { DetectionObject, MediaType } from './types';
import { Radar, Trash2, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>(null);
  const [detections, setDetections] = useState<DetectionObject[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setDetections([]); // Reset previous detections
    setError(null);

    const type = selectedFile.type.startsWith('video') ? 'video' : 'image';
    setMediaType(type);

    if (type === 'image') {
      setIsAnalyzing(true);
      try {
        const base64 = await convertFileToBase64(selectedFile);
        const results = await detectObjectsInImage(base64);
        setDetections(results);
      } catch (err) {
        console.error(err);
        setError("Failed to detect objects. Please check your API key and try again.");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleVideoFrameRequest = async (base64Frame: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const results = await detectObjectsInImage(base64Frame);
      setDetections(results);
    } catch (err) {
      console.error(err);
      setError("Analysis failed for this frame.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetApp = () => {
    setFile(null);
    setMediaType(null);
    setDetections([]);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
            <Radar className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">GenAI-YOLO Detector</h1>
            <p className="text-xs text-slate-400">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>
        
        {file && (
          <button 
            onClick={resetApp}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-red-500/10 hover:border-red-500/50 border border-transparent transition-all"
          >
            <Trash2 size={16} />
            Clear Selection
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left / Center Stage: Canvas */}
        <div className="flex-1 p-6 flex items-center justify-center relative overflow-y-auto">
          {!file ? (
            <div className="w-full max-w-xl animate-fade-in-up">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">Intelligent Object Detection</h2>
                <p className="text-slate-400 text-lg">
                    Simulating State-of-the-Art YOLOv8 architecture using Multimodal GenAI.
                    Upload an image for full scan, or a video for frame-by-frame analysis.
                </p>
              </div>
              <FileUpload onFileSelect={handleFileSelect} />
            </div>
          ) : (
            <DetectionCanvas 
              file={file}
              mediaType={mediaType}
              detections={detections}
              isAnalyzing={isAnalyzing}
              onVideoFrameRequest={handleVideoFrameRequest}
            />
          )}

          {/* Error Toast */}
          {error && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-red-900/90 border border-red-500 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-bounce-in">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Sidebar: Only visible when file is loaded */}
        {file && (
          <Sidebar 
            detections={detections} 
            isAnalyzing={isAnalyzing} 
          />
        )}

      </main>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        @keyframes bounceIn {
            0% { transform: translate(-50%, 20px); opacity: 0; }
            50% { transform: translate(-50%, -5px); opacity: 1; }
            100% { transform: translate(-50%, 0); }
        }
        .animate-bounce-in {
            animation: bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default App;