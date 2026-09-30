import React from 'react';
import { SaleRecord } from '../types/pos';
import { formatCurrency } from '../utils/formatters';
import { ReturnHistory } from './ReturnHistory';
import {
  Calendar,
  CreditCard,
  User,
  ShoppingBag,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Wallet,
  Package,
} from 'lucide-react';

interface SaleDetailProps {
  sale: SaleRecord;
  onOpenReturnWizard: () => void;
}

export const SaleDetail: React.FC<SaleDetailProps> = ({ sale, onOpenReturnWizard }) => {
  const totalUnitsBought = sale.products.reduce((acc, p) => acc + p.purchasedQty, 0);
  const totalUnitsReturned = sale.products.reduce((acc, p) => acc + p.returnedQty, 0);
  const totalUnitsAvailable = sale.products.reduce((acc, p) => acc + p.availableQty, 0);
  const canReturnAnything = totalUnitsAvailable > 0 || sale.refundableBalance > 0;

  return (
    <div className="space-y-6">
      {/* Principle Clarification Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/40 to-slate-50 border border-blue-200/80 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              Principio de Operación Independiente
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
              En este sistema POS, <strong className="text-emerald-800">devolver productos al inventario</strong> y{' '}
              <strong className="text-amber-800">reembolsar dinero</strong> son acciones independientes. Seleccionar
              mercancía no calcula automáticamente un reembolso monetario, permitiendo flexibilidad total para cambios,
              garantías o acuerdos de tienda.
            </p>
          </div>
        </div>

        {/* PRIMARY ACTION BUTTON: Single 'Devolver' button as specified */}
        <div className="shrink-0 w-full sm:w-auto">
          <button
            onClick={onOpenReturnWizard}
            disabled={!canReturnAnything}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              canReturnAnything
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Devolver</span>
          </button>
        </div>
      </div>

      {/* Sale Header & Metadata Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {sale.folio}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {sale.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <strong className="text-slate-700">{sale.clientName}</strong>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{sale.date}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                <span>Pago: <strong className="text-slate-700">{sale.paymentMethod}</strong></span>
              </span>
            </div>
          </div>

          {/* Quick Metrics Cluster */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Total de la venta</div>
              <div className="text-base font-bold font-mono text-slate-900">
                {formatCurrency(sale.total, sale.currency)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-amber-800 font-medium">Saldo reembolsable</div>
              <div className="text-base font-bold font-mono text-amber-700">
                {formatCurrency(sale.refundableBalance, sale.currency)}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-[11px] text-emerald-800 font-medium">Inventario disponible</div>
              <div className="text-base font-bold font-mono text-emerald-700">
                {totalUnitsAvailable} de {totalUnitsBought} u.
              </div>
            </div>
          </div>
        </div>

        {/* Client extra details row */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Correo:</span>
            <span className="font-mono text-slate-700">{sale.clientEmail}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Teléfono:</span>
            <span className="font-mono text-slate-700">{sale.clientPhone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-400">Saldo en Wallet:</span>
            <span className="font-bold font-mono text-blue-700">
              {formatCurrency(sale.clientWalletBalance, sale.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Purchased Products Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">Productos comprados</h3>
            <span className="text-xs text-slate-400 font-mono">({sale.products.length} artículos)</span>
          </div>
          <span className="text-xs text-slate-500">
            Disponibles para devolver al inventario:{' '}
            <strong className="text-emerald-700 font-mono">{totalUnitsAvailable} u.</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-5">Producto</th>
                <th className="py-3 px-4 font-mono">SKU</th>
                <th className="py-3 px-4 text-right">Precio unitario</th>
                <th className="py-3 px-4 text-center">Comprada</th>
                <th className="py-3 px-4 text-center text-slate-500">Ya devuelta</th>
                <th className="py-3 px-4 text-center text-emerald-800">Disponible</th>
                <th className="py-3 px-5 text-right font-mono">Importe original</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sale.products.map((item) => {
                const isExhausted = item.availableQty === 0;
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/60 transition-colors ${
                      isExhausted ? 'bg-slate-50/40 text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      {item.category && <div className="text-[11px] text-slate-400 mt-0.5">{item.category}</div>}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600">{item.sku}</td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-600">
                      {formatCurrency(item.unitPrice, sale.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-800">
                      {item.purchasedQty}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                      {item.returnedQty > 0 ? (
                        <span className="text-amber-700 font-semibold">{item.returnedQty}</span>
                      ) : (
                        '0'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                          item.availableQty > 0
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {item.availableQty}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-semibold tabular-nums text-slate-900">
                      {formatCurrency(item.unitPrice * item.purchasedQty, sale.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return & Refund History */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Historial de devoluciones y reembolsos</h3>
            <span className="text-xs text-slate-400 font-mono">({sale.history.length} registros)</span>
          </div>
          <span className="text-xs text-slate-400">Auditoría completa de movimientos</span>
        </div>

        <ReturnHistory history={sale.history} currency={sale.currency} />
      </div>
    </div>
  );
};
