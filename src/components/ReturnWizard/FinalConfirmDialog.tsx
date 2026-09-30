import React from 'react';
import { AlertTriangle, CheckCircle2, Package, Wallet, X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface FinalConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  totalProductsCount: number;
  productNames: string[];
  refundAmount: number;
  refundDestination: 'wallet' | 'original_method';
  currency: string;
}

export const FinalConfirmDialog: React.FC<FinalConfirmDialogProps> = ({
  isOpen,
  onClose,
  onProceed,
  totalProductsCount,
  productNames,
  refundAmount,
  refundDestination,
  currency,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-bold text-slate-900">
              ¿Confirmar registro de la operación?
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Esta acción actualizará el catálogo del inventario y/o emitirá fondos de manera irreversible en el
              sistema POS.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            aria-label="Cerrar advertencia"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 flex items-center gap-1.5 font-medium">
              <Package className="w-3.5 h-3.5 text-emerald-600" />
              Retorno a inventario:
            </span>
            <span className="font-bold text-slate-900">
              {totalProductsCount > 0 ? `${totalProductsCount} unidades físicas` : '0 unidades (sin retorno)'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600 flex items-center gap-1.5 font-medium">
              <Wallet className="w-3.5 h-3.5 text-amber-600" />
              Emisión de reembolso:
            </span>
            <span className="font-bold font-mono text-amber-800">
              {refundAmount > 0
                ? `${formatCurrency(refundAmount, currency)} (${
                    refundDestination === 'wallet' ? 'A Wallet' : 'Al método original'
                  })`
                : 'Sin reembolso ($0.00)'}
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Revisar datos
          </button>
          <button
            type="button"
            onClick={onProceed}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Sí, confirmar y registrar
          </button>
        </div>
      </div>
    </div>
  );
};
