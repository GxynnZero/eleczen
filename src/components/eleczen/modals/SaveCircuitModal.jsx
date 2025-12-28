"use client";
import React, { useState } from 'react';
import { useLiteSimStore } from '@/lib/simulation/state';
import { saveCircuitAction } from '@/app/actions/circuit';
import { Loader2, Save } from 'lucide-react';

const SaveCircuitModal = ({ onClose }) => {
    const { components, wires, meta } = useLiteSimStore();
    const [name, setName] = useState(meta.projectName || "My Circuit");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = { components, wires, meta: { ...meta, projectName: name } };
            const result = await saveCircuitAction(name, data);

            if (result.success) {
                onClose();
                // Optionally show a toast here
            } else {
                setError(result.error || "Failed to save");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Project Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20 transition-all placeholder:text-gray-700"
                    placeholder="Enter project name..."
                    autoFocus
                />
            </div>

            {error && (
                <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded-lg border border-red-900/50 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {error}
                </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue border border-neon-blue/50 hover:border-neon-blue text-xs font-bold rounded-lg transition-all shadow-[0_0_10px_rgba(0,243,255,0.1)] hover:shadow-[0_0_15px_rgba(0,243,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save Project
                </button>
            </div>
        </form>
    );
};

export default SaveCircuitModal;
