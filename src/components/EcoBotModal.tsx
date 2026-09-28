import React from 'react';
import { GeminiChatbot } from './GeminiChatbot';

interface EcoBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EcoBotModal: React.FC<EcoBotModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full h-[88vh] max-h-[760px] shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex-1 overflow-hidden h-full">
          <GeminiChatbot embedded={true} onClose={onClose} />
        </div>
      </div>
    </div>
  );
};
