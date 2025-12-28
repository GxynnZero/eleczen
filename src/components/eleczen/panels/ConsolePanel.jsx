import React, { useRef, useEffect } from 'react';
import { useLiteSimStore } from '@/lib/simulation/state';

const ConsolePanel = () => {
    const { logs, clearLogs } = useLiteSimStore();
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [logs]);

    return (
        <div className="w-full h-full flex flex-col font-mono text-xs">
            <div className="flex justify-between items-center px-4 py-2 border-b border-white/10 bg-black/40">
                <span className="text-gray-500 font-bold">CONSOLE</span>
                <button onClick={clearLogs} className="text-gray-600 hover:text-white transition-colors">Clear</button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-auto p-2 space-y-1 text-gray-400">
                {logs.length === 0 && <div className="text-gray-800 italic px-2">No logs active</div>}

                {logs.map((log, i) => (
                    <div key={i} className={`px-2 py-0.5 border-l-2 pl-2 ${log.type === 'error' ? 'border-red-500 text-red-400' :
                        log.type === 'warn' ? 'border-yellow-500 text-yellow-500' :
                            'border-gray-800'
                        }`}>
                        <span className="opacity-40 mr-2">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
                        {log.message}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConsolePanel;
