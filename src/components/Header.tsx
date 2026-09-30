import React from 'react';
import { Store, RotateCcw, Sparkles } from 'lucide-react';
import { SaleRecord } from '../types/pos';

interface HeaderProps {
  currentSale: SaleRecord;
  sales: SaleRecord[];
  onSelectSale: (sale: SaleRecord) => void;
  onResetAllData: () => void;
  onOpenDemoWizard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSale,
  sales,
  onSelectSale,
  onResetAllData,
  onOpenDemoWizard,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark / Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-inner">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
              Devoluciones de Venta
              <span className="hidden sm:inline-block text-xs font-normal text-slate-400">· Terminal POS #04</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Context & Sale Switcher */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-300">
          <span className="text-slate-400">Venta activa:</span>
          <select
            value={currentSale.id}
            onChange={(e) => {
              const found = sales.find((s) => s.id === e.target.value);
              if (found) onSelectSale(found);
            }}
            className="bg-slate-800 border border-slate-700 text-white rounded-md px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {sales.map((sale) => (
              <option key={sale.id} value={sale.id}>
                {sale.folio} - {sale.clientName} ({sale.paymentMethod})
              </option>
            ))}
          </select>
        </div>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDemoWizard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors whitespace-nowrap"
            title="Abrir wizard precargado con el caso de demostración (Mochila urbana + Reembolso total a Wallet)"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Caso demostración</span>
            <span className="sm:hidden">Caso demo</span>
          </button>

          <button
            onClick={onResetAllData}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Reiniciar datos iniciales"
            aria-label="Reiniciar datos iniciales"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
