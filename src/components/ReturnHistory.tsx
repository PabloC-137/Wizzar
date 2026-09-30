import React from 'react';
import { ReturnTransaction } from '../types/pos';
import { formatCurrency } from '../utils/formatters';
import { History, Package, Wallet, CheckCircle2, User, Clock } from 'lucide-react';

interface ReturnHistoryProps {
  history: ReturnTransaction[];
  currency: string;
}

export const ReturnHistory: React.FC<ReturnHistoryProps> = ({ history, currency }) => {
  if (history.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-slate-200/80 text-slate-500 mx-auto flex items-center justify-center mb-3">
          <History className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">Sin movimientos previos</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Esta venta no tiene devoluciones de mercancía ni reembolsos monetarios registrados hasta el momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((record) => {
        const hasProducts = record.itemsReturned.length > 0;
        const totalItems = record.itemsReturned.reduce((acc, curr) => acc + curr.quantity, 0);
        const hasRefund = record.refundAmount > 0;

        return (
          <div
            key={record.id}
            className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 transition-shadow hover:shadow-xs"
          >
            {/* Header of history item */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {record.folio}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {record.timestamp}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{record.operator}</span>
              </div>
            </div>

            {/* Content: 2 distinct columns for Inventory vs Refund */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Inventory return column */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold mb-1.5">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>Devolución al inventario ({totalItems} u.)</span>
                </div>
                {hasProducts ? (
                  <ul className="space-y-1 text-slate-700">
                    {record.itemsReturned.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center text-xs">
                        <span className="truncate pr-2">
                          {item.productName} <span className="text-slate-400 font-mono">({item.sku})</span>
                        </span>
                        <span className="font-semibold text-emerald-700 whitespace-nowrap">
                          +{item.quantity} u.
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic">No se reintegraron productos al inventario en este movimiento.</p>
                )}
                {record.returnReason && (
                  <div className="mt-2 pt-2 border-t border-emerald-100/60 text-slate-600">
                    <span className="font-medium text-emerald-900">Motivo de inventario:</span> {record.returnReason}
                  </div>
                )}
              </div>

              {/* Refund column */}
              <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-amber-900 font-semibold mb-1.5">
                  <Wallet className="w-4 h-4 text-amber-600" />
                  <span>Reembolso monetario</span>
                </div>
                {hasRefund ? (
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-slate-600">Importe devuelto:</span>
                      <span className="font-mono font-bold text-amber-800 text-sm">
                        {formatCurrency(record.refundAmount, currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 mt-1">
                      <span>Destino:</span>
                      <span className="font-medium text-slate-800 capitalize">
                        {record.refundDestination === 'wallet' ? 'Wallet del cliente' : 'Método de pago original'}
                      </span>
                    </div>
                    {record.refundReason && (
                      <div className="mt-2 pt-2 border-t border-amber-100/60 text-slate-600">
                        <span className="font-medium text-amber-950">Motivo del reembolso:</span> {record.refundReason}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">Sin reembolso de dinero asociado.</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
