import React from 'react';
import { SaleRecord, ReturnWizardState } from '../../types/pos';
import { formatCurrency } from '../../utils/formatters';
import {
  Wallet,
  CreditCard,
  Banknote,
  Info,
  AlertTriangle,
  Check,
  Percent,
} from 'lucide-react';

interface Step2RefundProps {
  sale: SaleRecord;
  wizardState: ReturnWizardState;
  onChangeRefundMode: (mode: 'none' | 'total' | 'partial') => void;
  onChangePartialAmount: (amountStr: string) => void;
  onChangeDestination: (dest: 'wallet' | 'original_method') => void;
  onChangeRefundReason: (reason: string) => void;
  onChangeCustomRefundReason: (custom: string) => void;
  currency: string;
}

const COMMON_REFUND_REASONS = [
  'Garantía / Falla del producto',
  'Compensación al cliente por demora',
  'Ajuste comercial pactado en gerencia',
  'Disconformidad con el artículo',
  'Otro motivo',
];

export const Step2Refund: React.FC<Step2RefundProps> = ({
  sale,
  wizardState,
  onChangeRefundMode,
  onChangePartialAmount,
  onChangeDestination,
  onChangeRefundReason,
  onChangeCustomRefundReason,
  currency,
}) => {
  const isCashSale = sale.paymentMethod === 'Efectivo';
  const maxRefundable = sale.refundableBalance;

  // Numerical evaluation of partial amount
  const numericPartial = parseFloat(wizardState.partialAmount) || 0;
  const isPartialOverLimit = wizardState.refundMode === 'partial' && numericPartial > maxRefundable;
  const isPartialInvalid = wizardState.refundMode === 'partial' && (numericPartial <= 0 || isNaN(numericPartial));

  const effectiveRefundAmount =
    wizardState.refundMode === 'none'
      ? 0
      : wizardState.refundMode === 'total'
      ? maxRefundable
      : numericPartial;

  const handleQuickPercent = (pct: number) => {
    const calculated = (maxRefundable * pct) / 100;
    onChangePartialAmount(calculated.toFixed(2));
  };

  return (
    <div className="space-y-6">
      {/* Title & subtitle */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-amber-600" />
          Reembolso opcional
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Defina si se emitirá una compensación o devolución monetaria al cliente, y el medio correspondiente.
        </p>
      </div>

      {/* MANDATORY PROMINENT INFORMATIVE BANNER */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 leading-relaxed">
          <strong className="font-semibold block text-amber-900 text-[13px] mb-0.5">
            Cálculo independiente
          </strong>
          El importe del reembolso es independiente de los productos seleccionados.
        </div>
      </div>

      {/* Refund Modes (Radio Cards) */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700">Seleccione el esquema de reembolso:</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Sin reembolso */}
          <button
            type="button"
            onClick={() => onChangeRefundMode('none')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              wizardState.refundMode === 'none'
                ? 'bg-blue-50/50 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">Sin reembolso</span>
                {wizardState.refundMode === 'none' && <Check className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Solo registrar retorno físico al inventario sin salida monetaria.
              </p>
            </div>
            <div className="mt-3 font-mono font-bold text-sm text-slate-900">
              {formatCurrency(0, currency)}
            </div>
          </button>

          {/* 2. Monto total */}
          <button
            type="button"
            onClick={() => onChangeRefundMode('total')}
            disabled={maxRefundable <= 0}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              wizardState.refundMode === 'total'
                ? 'bg-amber-50/60 border-amber-600 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            } ${maxRefundable <= 0 ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">Monto total</span>
                {wizardState.refundMode === 'total' && <Check className="w-4 h-4 text-amber-600" />}
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Reembolsar el total del saldo disponible de esta venta.
              </p>
            </div>
            <div className="mt-3 font-mono font-bold text-sm text-amber-800">
              {formatCurrency(maxRefundable, currency)}
            </div>
          </button>

          {/* 3. Monto parcial */}
          <button
            type="button"
            onClick={() => {
              onChangeRefundMode('partial');
              if (!wizardState.partialAmount || parseFloat(wizardState.partialAmount) <= 0) {
                // preset with half or full if empty
                onChangePartialAmount((maxRefundable / 2).toFixed(2));
              }
            }}
            disabled={maxRefundable <= 0}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              wizardState.refundMode === 'partial'
                ? 'bg-amber-50/60 border-amber-600 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            } ${maxRefundable <= 0 ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">Monto parcial</span>
                {wizardState.refundMode === 'partial' && <Check className="w-4 h-4 text-amber-600" />}
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Especificar libremente una cifra monetaria a reembolsar.
              </p>
            </div>
            <div className="mt-3 font-mono font-bold text-sm text-slate-700">
              {wizardState.refundMode === 'partial' && numericPartial > 0
                ? formatCurrency(numericPartial, currency)
                : 'A definir...'}
            </div>
          </button>
        </div>
      </div>

      {/* Partial Amount Input Section (Visible when 'Monto parcial' is chosen) */}
      {wizardState.refundMode === 'partial' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label htmlFor="partialAmountInput" className="text-xs font-semibold text-slate-800">
              Ingrese el monto a reembolsar ({currency}):
            </label>
            <span className="text-[11px] text-slate-500">
              Máximo reembolsable:{' '}
              <strong className="font-mono text-slate-800">{formatCurrency(maxRefundable, currency)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
              <input
                id="partialAmountInput"
                type="number"
                step="0.01"
                min="0.01"
                max={maxRefundable}
                value={wizardState.partialAmount}
                onChange={(e) => onChangePartialAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full pl-8 pr-4 py-2.5 bg-white border rounded-lg font-mono font-bold text-base text-slate-900 focus:outline-none focus:ring-2 ${
                  isPartialOverLimit
                    ? 'border-rose-400 focus:ring-rose-500 text-rose-700'
                    : 'border-slate-300 focus:ring-blue-500'
                }`}
              />
            </div>

            {/* Quick helper shortcuts */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleQuickPercent(25)}
                className="px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => handleQuickPercent(50)}
                className="px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => handleQuickPercent(100)}
                className="px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700"
              >
                100%
              </button>
            </div>
          </div>

          {isPartialOverLimit && (
            <div className="text-xs text-rose-600 flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>El monto no puede exceder el saldo disponible de {formatCurrency(maxRefundable, currency)}.</span>
            </div>
          )}

          {isPartialInvalid && !isPartialOverLimit && (
            <div className="text-xs text-amber-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Ingrese un valor numérico mayor a $0.00.</span>
            </div>
          )}
        </div>
      )}

      {/* Destination of Money (Wallet vs Original Payment Method) */}
      {wizardState.refundMode !== 'none' && (
        <div className="space-y-3 pt-1">
          <label className="block text-xs font-semibold text-slate-700">
            Destino del dinero reembolsado:
          </label>

          {/* Cash sale special explanation banner */}
          {isCashSale && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 flex items-start gap-2.5">
              <Banknote className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Venta pagada totalmente en efectivo:</strong> Por normatividad de seguridad y arqueo de caja
                POS, se ha predeterminado la <strong>Wallet del cliente</strong>. No se entrega efectivo físico desde esta
                pantalla administrativa.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Wallet Option */}
            <button
              type="button"
              onClick={() => onChangeDestination('wallet')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                wizardState.destination === 'wallet'
                  ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <span>Wallet / Monedero del cliente</span>
                </div>
                {wizardState.destination === 'wallet' && <Check className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-[11px] text-slate-500">
                Abono inmediato a la cuenta de {sale.clientName}. Disponible para futuras compras.
              </p>
            </button>

            {/* Original Payment Method Option */}
            <button
              type="button"
              onClick={() => {
                if (!isCashSale) {
                  onChangeDestination('original_method');
                }
              }}
              disabled={isCashSale}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                wizardState.destination === 'original_method'
                  ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              } ${
                isCashSale
                  ? 'opacity-40 cursor-not-allowed bg-slate-50'
                  : 'cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                  <CreditCard className="w-4 h-4 text-slate-600" />
                  <span>Método de pago original</span>
                </div>
                {wizardState.destination === 'original_method' && <Check className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-[11px] text-slate-500">
                {isCashSale
                  ? 'No disponible para ventas en efectivo (use Wallet).'
                  : `Reverso a ${sale.paymentMethod} (puede tardar 3 a 5 días hábiles).`}
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Refund Reason (Requested only if refund is selected) */}
      {wizardState.refundMode !== 'none' && (
        <div className="space-y-2 pt-1 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-800">
              Motivo del reembolso monetario <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Requerido para auditoría</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {COMMON_REFUND_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => onChangeRefundReason(reason)}
                className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors cursor-pointer ${
                  wizardState.refundReason === reason
                    ? 'bg-amber-100/70 border-amber-400 text-amber-950 font-medium'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>

          {/* Custom text field if 'Otro motivo' is chosen or general detail */}
          {wizardState.refundReason === 'Otro motivo' && (
            <div className="mt-2">
              <input
                type="text"
                value={wizardState.customRefundReason}
                onChange={(e) => onChangeCustomRefundReason(e.target.value)}
                placeholder="Especifique el motivo detallado del reembolso..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
