import React from 'react';
import { GeminiChatbot } from '../components/GeminiChatbot';

export const EcoBotPage: React.FC = () => {
  return (
    <div className="h-[calc(100vh-5.5rem)] flex flex-col -m-4 sm:-m-6 lg:-m-8">
      {/* Clean, Full-Screen Chat Interface */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <GeminiChatbot embedded={false} />
      </div>
    </div>
  );
};
