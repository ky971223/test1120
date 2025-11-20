import React from 'react';
import { DetectionObject } from '../types';
import { Target, Box, AlertCircle, Crosshair } from 'lucide-react';

interface SidebarProps {
  detections: DetectionObject[];
  isAnalyzing: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ detections, isAnalyzing }) => {
  // Group detections by label for summary
  const summary = detections.reduce((acc, det) => {
    acc[det.label] = (acc[det.label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="w-full md:w-80 bg-slate-900/80 border-l border-slate-700 p-6 flex flex-col h-full overflow-hidden backdrop-blur-md">
      <div className="flex items-center gap-2 mb-6 text-indigo-400">
        <Target className="w-6 h-6" />
        <h2 className="text-xl font-bold text-white">检测结果 (Detection Log)</h2>
      </div>

      {detections.length === 0 && !isAnalyzing ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-500 border border-dashed border-slate-700 rounded-xl p-4">
          <Box className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">暂无检测目标</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400 uppercase font-semibold">物体总数</p>
              <p className="text-2xl font-bold text-white">{detections.length}</p>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400 uppercase font-semibold">类别数量</p>
              <p className="text-2xl font-bold text-white">{Object.keys(summary).length}</p>
            </div>
          </div>

          {/* Object List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {detections.map((det, idx) => (
              <div 
                key={idx} 
                className="group bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/50 p-4 rounded-xl transition-all"
              >
                {/* Header: Label and Confidence */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                    <div>
                      <h3 className="text-lg font-bold text-slate-100 leading-tight">{det.label}</h3>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold font-mono ${
                    det.confidence > 0.8 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {(det.confidence * 100).toFixed(0)}%
                  </div>
                </div>

                {/* Footer: Coordinates Detail */}
                <div className="pl-4 mt-2 pt-2 border-t border-slate-700/50 grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-mono">
                   <div className="flex items-center gap-1">
                      <span className="text-slate-600">MIN:</span>
                      <span>({det.box_2d.xmin}, {det.box_2d.ymin})</span>
                   </div>
                   <div className="flex items-center gap-1 justify-end">
                      <span className="text-slate-600">MAX:</span>
                      <span>({det.box_2d.xmax}, {det.box_2d.ymax})</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

        {isAnalyzing && (
            <div className="mt-4 p-3 bg-indigo-900/20 border border-indigo-500/30 text-indigo-200 text-sm rounded-lg flex items-center gap-2 animate-pulse">
                <AlertCircle size={16} />
                <span>正在分析目标... (Processing)</span>
            </div>
        )}
    </div>
  );
};