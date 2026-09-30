import React from 'react';
import { Product } from '../../types/pos';
import { formatCurrency } from '../../utils/formatters';
import { Package, Plus, Minus, Info, Check, RotateCcw } from 'lucide-react';

interface Step1ProductsProps {
  products: Product[];
  selectedProducts: Record<string, number>;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  currency: string;
}

export const Step1Products: React.FC<Step1ProductsProps> = ({
  products,
  selectedProducts,
  onUpdateQuantity,
  onSelectAll,
  onClearAll,
  currency,
}) => {
  const totalSelectedUnits = Object.values(selectedProducts).reduce((acc, qty) => acc + (qty || 0), 0);
  const totalAvailableUnits = products.reduce((acc, p) => acc + p.availableQty, 0);

  return (
    <div className="space-y-6">
      {/* Title & subtitle */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-600" />
          Productos que regresan al inventario
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Indique la mercancía física que el cliente entrega físicamente al mostrador y que será reingresada al stock.
        </p>
      </div>

      {/* MANDATORY PROMINENT INFORMATIVE BANNER */}
      <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg shadow-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 leading-relaxed">
          <strong className="font-semibold block text-emerald-900 text-[13px] mb-0.5">
            Actualización exclusiva de stock
          </strong>
          Seleccionar productos solo actualiza el inventario. No calcula el importe del reembolso.
        </div>
      </div>

      {/* Global Quick Action Bar */}
      <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700">Artículos disponibles:</span>
          <span className="font-mono font-semibold text-slate-900">{totalAvailableUnits} u.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            disabled={totalAvailableUnits === 0 || totalSelectedUnits === totalAvailableUnits}
            className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Devolver todo
          </button>
          {totalSelectedUnits > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Products list with +/- controls */}
      <div className="space-y-3">
        {products.map((product) => {
          const count = selectedProducts[product.id] || 0;
          const isMax = count >= product.availableQty;
          const isMin = count <= 0;
          const isUnavailable = product.availableQty === 0;

          return (
            <div
              key={product.id}
              className={`p-4 rounded-xl border transition-all ${
                count > 0
                  ? 'bg-emerald-50/30 border-emerald-300 ring-1 ring-emerald-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              } ${isUnavailable ? 'opacity-50 bg-slate-50' : ''}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">{product.name}</span>
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {product.sku}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Precio original: {formatCurrency(product.unitPrice, currency)}</span>
                    <span>·</span>
                    <span>Comprado: {product.purchasedQty} u.</span>
                    <span>·</span>
                    <span>
                      Disponible para devolver:{' '}
                      <strong className="text-emerald-700 font-mono">{product.availableQty} u.</strong>
                    </span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  {isUnavailable ? (
                    <span className="text-xs text-slate-400 italic">No disponible para devolución</span>
                  ) : (
                    <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(product.id, Math.max(0, count - 1))}
                        disabled={isMin}
                        className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label={`Disminuir ${product.name}`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <div className="w-10 text-center font-mono font-bold text-sm text-slate-900 tabular-nums">
                        {count}
                      </div>

                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(product.id, Math.min(product.availableQty, count + 1))}
                        disabled={isMax}
                        className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label={`Aumentar ${product.name}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Box & No-Product Message */}
      <div className="pt-2">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="font-medium text-slate-700">
            Productos seleccionados:{' '}
            <span className="font-mono font-bold text-emerald-700 text-sm">{totalSelectedUnits} unidades</span>
          </div>

          {totalSelectedUnits === 0 ? (
            <div className="text-slate-500 italic flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Puede continuar sin productos para registrar solo un reembolso.</span>
            </div>
          ) : (
            <div className="text-emerald-700 flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Estas {totalSelectedUnits} unidades regresarán al inventario general.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
