import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  error: string;
  onClose: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6 animate-slide-up">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-red-300 font-medium mb-1">Merge Failed</h4>
          <p className="text-red-200 text-sm">{error}</p>
        </div>
        <button
          onClick={onClose}
          className="text-red-400 hover:text-red-300 transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};