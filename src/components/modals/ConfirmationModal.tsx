import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Conferma',
  cancelLabel = 'Annulla',
  isDestructive = true,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Intestazione */}
        <div className="p-5 sm:p-6 flex items-start gap-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
            isDestructive 
              ? 'bg-red-50 text-red-600 border border-red-100' 
              : 'bg-amber-50 text-amber-600 border border-amber-100'
          }`}>
            {isDestructive ? (
              <Trash2 className="w-5 h-5 stroke-[2]" />
            ) : (
              <AlertTriangle className="w-5 h-5 stroke-[2]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                {title}
              </h3>
              <button
                type="button"
                onClick={onCancel}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Chiudi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Azioni */}
        <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            id="btn-confirm-cancel"
            onClick={onCancel}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer text-center"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            id="btn-confirm-proceed"
            onClick={() => {
              onConfirm();
            }}
            className={`flex-1 sm:flex-initial px-4.5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer text-center ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                : 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
