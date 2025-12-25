
import React, { useEffect, useRef } from 'react';

interface TerminalProps {
  logs: string[];
}

const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-2xl flex flex-col h-[400px]">
      <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-amber-500/50" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
        </div>
        <span className="text-xs text-slate-400 mono ml-2 font-medium">orchestrator.log</span>
      </div>
      <div 
        ref={scrollRef}
        className="p-4 overflow-y-auto flex-1 font-mono text-sm space-y-1 scrollbar-hide"
      >
        {logs.length === 0 && (
          <div className="text-slate-600 animate-pulse">Waiting for pipeline execution...</div>
        )}
        {logs.map((log, i) => {
            const isAgent = log.includes("[AGENT]");
            const isComplete = log.includes("successfully");
            return (
              <div key={i} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-slate-600 select-none">[{i.toString().padStart(2, '0')}]</span>
                <span className={`${isAgent ? 'text-blue-400' : isComplete ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {log}
                </span>
              </div>
            );
        })}
      </div>
    </div>
  );
};

export default Terminal;
