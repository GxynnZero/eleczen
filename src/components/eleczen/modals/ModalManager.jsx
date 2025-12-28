"use client";
import React from 'react';
import { useLiteSimStore } from '@/lib/simulation/state';
import { X } from 'lucide-react';
import SaveCircuitModal from './SaveCircuitModal';

const ModalManager = () => {
    const { modal, closeModal } = useLiteSimStore();

    if (!modal.isOpen) return null;

    const renderContent = () => {
        switch (modal.type) {
            case 'SAVE_CIRCUIT':
                return <SaveCircuitModal onClose={closeModal} />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative bg-gray-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        {modal.type.replace('_', ' ')}
                    </h3>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default ModalManager;
