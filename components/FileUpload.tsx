import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon, Video as VideoIcon, FileWarning } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
    return validTypes.includes(file.type);
  };

  return (
    <div 
      className="w-full h-64 border-2 border-dashed border-slate-600 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer flex flex-col items-center justify-center group"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input 
        type="file" 
        id="file-input" 
        className="hidden" 
        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
        onChange={handleChange}
      />
      
      <div className="p-4 rounded-full bg-slate-700 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-all mb-4 text-slate-400">
        <Upload size={32} />
      </div>
      
      <h3 className="text-lg font-semibold text-slate-200 mb-2">Upload Media</h3>
      <p className="text-slate-400 text-sm text-center max-w-xs mb-4">
        Drag & drop or click to browse
      </p>
      
      <div className="flex gap-4 text-xs text-slate-500 uppercase tracking-wider font-medium">
        <span className="flex items-center gap-1"><ImageIcon size={14} /> Images</span>
        <span className="flex items-center gap-1"><VideoIcon size={14} /> Videos</span>
      </div>
    </div>
  );
};