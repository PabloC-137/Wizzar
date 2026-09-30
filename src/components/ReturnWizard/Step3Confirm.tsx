import React from 'react';
import { SaleRecord, ReturnWizardState, Product } from '../../types/pos';
import { formatCurrency } from '../../utils/formatters';
import {
  Package,
  Wallet,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  ShieldCheck,
  Tag,
  ArrowRight,
} from 'lucide-react';

interface Step3ConfirmProps {
  sale: SaleRecord;
  wizardState: ReturnWizardState;
  onChangeReturnReason: (reason: string) => void;
  onChangeCustomReturnReason: (custom: string) => void;
  onChangeRefundReason: (reason: string) => void;
  onChangeCustomRefundReason: (custom: string) => void;
  currency: string;
}

const COMMON_RETURN_REASONS = [
  'Defecto de fabricación / falla',
  'Talla o modelo incorrecto',
  'Empaque o producto dañado',
  'Cliente no satisfecho con el producto',
  'Otro motivo de inventario',
];

const COMMON_REFUND_REASONS = [
  'Garantía / Falla del producto',
  'Compensación al cliente por demora',
  'Ajuste comercial pactado en gerencia',
  'Disconformidad con el artículo',
  'Otro motivo de reembolso',
];

export const Step3Confirm: React.FC<Step3ConfirmProps> = ({
  sale,
  wizardState,
  onChangeReturnReason,
  onChangeCustomReturnReason,
  onChangeRefundReason,
  onChangeCustomRefundReason,
  currency,
}) => {
  const selectedProductEntries = Object.entries(wizardState.selectedProducts).filter(
    ([, qty]) => (qty || 0) > 0
  );
  const totalReturningUnits = selectedProductEntries.reduce((sum, [, qty]) => sum + qty, 0);

  const numericPartial = parseFloat(wizardState.partialAmount) || 0;
  const refundAmount =
    wizardState.refundMode === 'none'
      ? 0
      : wizardState.refundMode === 'total'
      ? sale.refundableBalance
      : numericPartial;

  const hasProducts = totalReturningUnits > 0;
  const hasRefund = refundAmount > 0;

  // Final reasons calculation
  const effectiveReturnReason =
    wizardState.returnReason === 'Otro motivo de inventario'
      ? wizardState.customReturnReason
      : wizardState.returnReason;

  const effectiveRefundReason =
    wizardState.refundReason === 'Otro motivo de reembolso' || wizardState.refundReason === 'Otro motivo'
      ? wizardState.customRefundReason
      : wizardState.refundReason;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          Confirmación de la operación
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Revise minuciosamente ambas operaciones independientes antes de emitir la confirmación definitiva.
        </p>
      </div>

      {/* MANDATORY EXACT BANNER PHRASE */}
      <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-4 text-center">
        <p className="text-xs sm:text-sm font-semibold text-blue-950 flex items-center justify-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Una devolución de productos y un reembolso de dinero son operaciones independientes.</span>
        </p>
      </div>

      {/* TWO VISUALLY SEPARATE CARDS (Green Inventory vs Amber/Red Refund) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARD 1: Productos que regresan al inventario */}
        <div className="bg-white border-2 border-emerald-500/40 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            <div className="bg-emerald-50/80 px-4 py-3 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                <Package className="w-4 h-4 text-emerald-700" />
                <span>Productos que regresan al inventario</span>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-800 bg-white border border-emerald-200 px-2 py-0.5 rounded">
                {totalReturningUnits} u.
              </span>
            </div>

            <div className="p-4 space-y-3">
              {hasProducts ? (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-500">Mercancía reingresada:</div>
                  <ul className="divide-y divide-slate-100">
                    {sale.products.map((p) => {
                      const returningQty = wizardState.selectedProducts[p.id] || 0;
                      const isReturning = returningQty > 0;

                      return (
                        <li key={p.id} className="py-2 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {isReturning ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-slate-300" />
                              )}
                              <span>{p.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono ml-5">
                              SKU: {p.sku} · {isReturning ? 'Reingresa a stock' : 'No fue devuelto (queda con cliente)'}
                            </div>
                          </div>

                          <div className="text-right">
                            {isReturning ? (
                              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs">
                                +{returningQty} u.
                              </span>
                            ) : (
                              <span className="font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded text-xs">
                                0 devueltos
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-1">
                  <Package className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">Sin productos a devolver</p>
                  <p className="text-[11px] text-slate-500">
                    Ningún producto regresará al inventario. No se modificará el stock físico.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Inventory Status Badge */}
          <div className="p-3 bg-emerald-50/40 border-t border-emerald-100 text-[11px] text-emerald-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {hasProducts
                ? `Se repondrán ${totalReturningUnits} unidades en el almacén central.`
                : 'Inventario intacto.'}
            </span>
          </div>
        </div>

        {/* CARD 2: Dinero a reembolsar */}
        <div className="bg-white border-2 border-amber-500/40 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            <div className="bg-amber-50/80 px-4 py-3 border-b border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <Wallet className="w-4 h-4 text-amber-700" />
                <span>Dinero a reembolsar</span>
              </div>
              <span className="font-mono text-xs font-bold text-amber-900 bg-white border border-amber-200 px-2 py-0.5 rounded">
                {formatCurrency(refundAmount, currency)}
              </span>
            </div>

            <div className="p-4 space-y-3 text-xs">
              {hasRefund ? (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg">
                    <div className="text-[11px] text-amber-800 font-medium">Monto efectivo a reintegrar:</div>
                    <div className="text-2xl font-bold font-mono text-amber-900 mt-0.5">
                      {formatCurrency(refundAmount, currency)}
                    </div>
                    <div className="text-[11px] text-amber-700 mt-1">
                      Modalidad:{' '}
                      <span className="font-semibold uppercase tracking-wider">
                        {wizardState.refundMode === 'total' ? 'Monto total de venta' : 'Monto parcial especificado'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[11px] text-slate-500 font-medium">Canal de destino:</div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div className="font-semibold text-slate-800 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-blue-600" />
                        <span>
                          {wizardState.destination === 'wallet'
                            ? `Wallet de ${sale.clientName}`
                            : `Método original (${sale.paymentMethod})`}
                        </span>
                      </div>
                      <span className="text-[11px] text-blue-700 font-medium">Inmediato</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-1">
                  <Wallet className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">Sin reembolso ($0.00 MXN)</p>
                  <p className="text-[11px] text-slate-500">
                    No se transferirá ni dispensará dinero al cliente en esta transacción.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Refund Status Badge */}
          <div className="p-3 bg-amber-50/40 border-t border-amber-100 text-[11px] text-amber-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              {hasRefund
                ? `Se debitará del saldo disponible y se acreditará a ${
                    wizardState.destination === 'wallet' ? 'Wallet' : 'Método original'
                  }.`
                : 'Sin impacto financiero.'}
            </span>
          </div>
        </div>
      </div>

      {/* REQUIRED AUDIT REASONS SECTION */}
      <div className="space-y-4 pt-2 border-t border-slate-200">
        {/* Motivo de devolución (Requerido solo si hay productos) */}
        {hasProducts && (
          <div className="space-y-2 bg-emerald-50/30 border border-emerald-200/60 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-700" />
                Motivo de devolución de inventario <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-emerald-800">Obligatorio para reingreso a almacén</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMMON_RETURN_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onChangeReturnReason(r)}
                  className={`px-3 py-1.5 text-xs text-left rounded-lg border transition-colors cursor-pointer ${
                    wizardState.returnReason === r
                      ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {wizardState.returnReason === 'Otro motivo de inventario' && (
              <input
                type="text"
                value={wizardState.customReturnReason}
                onChange={(e) => onChangeCustomReturnReason(e.target.value)}
                placeholder="Describa el motivo de inventario..."
                className="w-full mt-2 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            )}

            {!effectiveReturnReason && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Seleccione o ingrese un motivo de inventario para continuar.
              </p>
            )}
          </div>
        )}

        {/* Motivo de reembolso (Requerido solo si hay reembolso) */}
        {hasRefund && (
          <div className="space-y-2 bg-amber-50/30 border border-amber-200/60 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-700" />
                Motivo de reembolso monetario <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-amber-800">Obligatorio para auditoría financiera</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMMON_REFUND_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onChangeRefundReason(r)}
                  className={`px-3 py-1.5 text-xs text-left rounded-lg border transition-colors cursor-pointer ${
                    wizardState.refundReason === r
                      ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {(wizardState.refundReason === 'Otro motivo de reembolso' ||
              wizardState.refundReason === 'Otro motivo') && (
              <input
                type="text"
                value={wizardState.customRefundReason}
                onChange={(e) => onChangeCustomRefundReason(e.target.value)}
                placeholder="Describa el motivo financiero..."
                className="w-full mt-2 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            )}

            {!effectiveRefundReason && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Seleccione o ingrese un motivo de reembolso para continuar.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Validation alert if NEITHER products nor refund is selected */}
      {!hasProducts && !hasRefund && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900 leading-relaxed">
            <strong className="block text-rose-950 font-bold mb-0.5">Operación vacía</strong>
            Debe existir al menos una acción: seleccionar productos para devolver al inventario o especificar un monto a
            reembolsar. Regrese al paso anterior para configurar al menos una opción.
          </div>
        </div>
      )}
    </div>
  );
};
