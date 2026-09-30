import React, { useState } from 'react';
import { SaleRecord, ReturnWizardState, Product, ReturnTransaction } from '../../types/pos';
import { Step1Products } from './Step1Products';
import { Step2Refund } from './Step2Refund';
import { Step3Confirm } from './Step3Confirm';
import { FinalConfirmDialog } from './FinalConfirmDialog';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Package,
  Wallet,
  ShieldAlert,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface ReturnWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleRecord;
  onCompleteTransaction: (transaction: ReturnTransaction, updatedProducts: Product[]) => void;
  initialDemoPreset?: boolean;
}

export const ReturnWizardModal: React.FC<ReturnWizardModalProps> = ({
  isOpen,
  onClose,
  sale,
  onCompleteTransaction,
  initialDemoPreset = false,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(initialDemoPreset ? 3 : 1);
  const [showFinalDialog, setShowFinalDialog] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize wizard state
  const isCashSale = sale.paymentMethod === 'Efectivo';

  const [wizardState, setWizardState] = useState<ReturnWizardState>(() => {
    const initialSelected: Record<string, number> = {};
    
    if (initialDemoPreset) {
      sale.products.forEach((p) => {
        if (p.name.toLowerCase().includes('mochila') || p.sku === 'MOC-001') {
          initialSelected[p.id] = Math.min(1, p.availableQty);
        } else {
          initialSelected[p.id] = 0;
        }
      });
      return {
        selectedProducts: initialSelected,
        refundMode: 'total',
        partialAmount: '',
        destination: 'wallet',
        returnReason: 'Cliente no satisfecho con el producto',
        customReturnReason: '',
        refundReason: 'Garantía / Falla del producto',
        customRefundReason: '',
      };
    }

    sale.products.forEach((p) => {
      initialSelected[p.id] = 0;
    });

    return {
      selectedProducts: initialSelected,
      refundMode: 'none',
      partialAmount: '',
      destination: isCashSale ? 'wallet' : 'original_method',
      returnReason: 'Cliente no satisfecho con el producto',
      customReturnReason: '',
      refundReason: 'Garantía / Falla del producto',
      customRefundReason: '',
    };
  });

  if (!isOpen) return null;

  // Handler for Demo Case
  const handleLoadDemoCase = () => {
    const demoSelected: Record<string, number> = {};
    sale.products.forEach((p) => {
      // Look for "Mochila urbana" or first product
      if (p.name.toLowerCase().includes('mochila') || p.sku === 'MOC-001') {
        demoSelected[p.id] = Math.min(1, p.availableQty);
      } else {
        demoSelected[p.id] = 0;
      }
    });

    setWizardState({
      selectedProducts: demoSelected,
      refundMode: 'total',
      partialAmount: '',
      destination: 'wallet',
      returnReason: 'Cliente no satisfecho con el producto',
      customReturnReason: '',
      refundReason: 'Garantía / Falla del producto',
      customRefundReason: '',
    });
    setCurrentStep(3); // Jump straight to step 3 so user can view the exact demonstration cards
    setValidationError(null);
  };

  // Step 1 Handlers
  const handleUpdateProductQuantity = (productId: string, quantity: number) => {
    setWizardState((prev) => ({
      ...prev,
      selectedProducts: {
        ...prev.selectedProducts,
        [productId]: quantity,
      },
    }));
    setValidationError(null);
  };

  const handleSelectAllProducts = () => {
    const allSelected: Record<string, number> = {};
    sale.products.forEach((p) => {
      allSelected[p.id] = p.availableQty;
    });
    setWizardState((prev) => ({
      ...prev,
      selectedProducts: allSelected,
    }));
    setValidationError(null);
  };

  const handleClearAllProducts = () => {
    const noneSelected: Record<string, number> = {};
    sale.products.forEach((p) => {
      noneSelected[p.id] = 0;
    });
    setWizardState((prev) => ({
      ...prev,
      selectedProducts: noneSelected,
    }));
  };

  // Step 2 Handlers
  const handleChangeRefundMode = (mode: 'none' | 'total' | 'partial') => {
    setWizardState((prev) => ({
      ...prev,
      refundMode: mode,
    }));
    setValidationError(null);
  };

  const handleChangePartialAmount = (amountStr: string) => {
    setWizardState((prev) => ({
      ...prev,
      partialAmount: amountStr,
    }));
    setValidationError(null);
  };

  const handleChangeDestination = (dest: 'wallet' | 'original_method') => {
    setWizardState((prev) => ({
      ...prev,
      destination: dest,
    }));
  };

  const handleChangeRefundReason = (reason: string) => {
    setWizardState((prev) => ({
      ...prev,
      refundReason: reason,
    }));
    setValidationError(null);
  };

  const handleChangeCustomRefundReason = (custom: string) => {
    setWizardState((prev) => ({
      ...prev,
      customRefundReason: custom,
    }));
    setValidationError(null);
  };

  // Step 3 Handlers
  const handleChangeReturnReason = (reason: string) => {
    setWizardState((prev) => ({
      ...prev,
      returnReason: reason,
    }));
    setValidationError(null);
  };

  const handleChangeCustomReturnReason = (custom: string) => {
    setWizardState((prev) => ({
      ...prev,
      customReturnReason: custom,
    }));
    setValidationError(null);
  };

  // Calculations
  const totalReturningUnits = Object.values(wizardState.selectedProducts).reduce(
    (acc, qty) => acc + (qty || 0),
    0
  );

  const numericPartial = parseFloat(wizardState.partialAmount) || 0;
  const refundAmount =
    wizardState.refundMode === 'none'
      ? 0
      : wizardState.refundMode === 'total'
      ? sale.refundableBalance
      : numericPartial;

  // Validation before proceeding
  const handleNext = () => {
    setValidationError(null);

    if (currentStep === 1) {
      // Step 1 allows proceeding with 0 products (to allow refund-only flow)
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      // Check partial refund input
      if (wizardState.refundMode === 'partial') {
        if (isNaN(numericPartial) || numericPartial <= 0) {
          setValidationError('Por favor ingrese un monto parcial válido mayor a cero.');
          return;
        }
        if (numericPartial > sale.refundableBalance) {
          setValidationError(
            `El monto a reembolsar no puede superar el saldo disponible de ${formatCurrency(
              sale.refundableBalance,
              sale.currency
            )}.`
          );
          return;
        }
      }

      if (wizardState.refundMode !== 'none') {
        const finalReason =
          wizardState.refundReason === 'Otro motivo'
            ? wizardState.customRefundReason.trim()
            : wizardState.refundReason.trim();

        if (!finalReason) {
          setValidationError('Por favor seleccione o especifique el motivo del reembolso.');
          return;
        }
      }

      setCurrentStep(3);
      return;
    }
  };

  const handleBack = () => {
    setValidationError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2);
    }
  };

  const handlePreConfirm = () => {
    setValidationError(null);

    // Rule: Must have at least one action: products returned OR refund
    if (totalReturningUnits === 0 && refundAmount === 0) {
      setValidationError(
        'Debe existir al menos una acción: seleccionar productos para devolver al inventario o registrar un importe a reembolsar.'
      );
      return;
    }

    // Rule: Motivo de devolución obligatorio si hay productos
    if (totalReturningUnits > 0) {
      const returnReason =
        wizardState.returnReason === 'Otro motivo de inventario'
          ? wizardState.customReturnReason.trim()
          : wizardState.returnReason.trim();

      if (!returnReason) {
        setValidationError('Por favor ingrese el motivo de devolución de inventario.');
        return;
      }
    }

    // Rule: Motivo de reembolso obligatorio si hay reembolso
    if (refundAmount > 0) {
      const refundReason =
        wizardState.refundReason === 'Otro motivo de reembolso' || wizardState.refundReason === 'Otro motivo'
          ? wizardState.customRefundReason.trim()
          : wizardState.refundReason.trim();

      if (!refundReason) {
        setValidationError('Por favor ingrese el motivo del reembolso de dinero.');
        return;
      }
    }

    // Open confirmation warning
    setShowFinalDialog(true);
  };

  const handleExecuteTransaction = () => {
    setShowFinalDialog(false);

    // Prepare updated products
    const updatedProducts: Product[] = sale.products.map((p) => {
      const qtyToReturn = wizardState.selectedProducts[p.id] || 0;
      return {
        ...p,
        returnedQty: p.returnedQty + qtyToReturn,
        availableQty: Math.max(0, p.availableQty - qtyToReturn),
      };
    });

    const itemsReturned = sale.products
      .filter((p) => (wizardState.selectedProducts[p.id] || 0) > 0)
      .map((p) => ({
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        quantity: wizardState.selectedProducts[p.id] || 0,
      }));

    const finalReturnReason =
      totalReturningUnits > 0
        ? wizardState.returnReason === 'Otro motivo de inventario'
          ? wizardState.customReturnReason
          : wizardState.returnReason
        : undefined;

    const finalRefundReason =
      refundAmount > 0
        ? wizardState.refundReason === 'Otro motivo de reembolso' || wizardState.refundReason === 'Otro motivo'
          ? wizardState.customRefundReason
          : wizardState.refundReason
        : undefined;

    const newTransaction: ReturnTransaction = {
      id: `dev-${Date.now()}`,
      folio: `DEV-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' hrs',
      operator: 'Caja 01 - Mostrador Principal',
      itemsReturned,
      refundMode: wizardState.refundMode,
      refundAmount,
      refundDestination: wizardState.destination,
      returnReason: finalReturnReason,
      refundReason: finalRefundReason,
    };

    onCompleteTransaction(newTransaction, updatedProducts);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl my-auto shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Wizard Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              POS
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Devolver / Reembolsar</span>
                <span className="font-mono text-xs text-slate-500 font-normal">
                  · {sale.folio} ({sale.clientName})
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Paso {currentStep} de 3:{' '}
                {currentStep === 1
                  ? 'Inventario de productos'
                  : currentStep === 2
                  ? 'Reembolso monetario'
                  : 'Revisión y confirmación'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadDemoCase}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors cursor-pointer"
              title="Cargar Mochila urbana + Reembolso Total a Wallet (como pide el caso de demostración)"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Cargar caso de demostración</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              aria-label="Cerrar asistente"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Indicator Tracker */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between max-w-xl mx-auto">
            {/* Step 1 Item */}
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep === 1
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  currentStep === 1 ? 'text-blue-900 font-semibold' : 'text-slate-600'
                }`}
              >
                1. Productos
              </span>
            </div>

            <div className={`h-0.5 flex-1 mx-2 sm:mx-4 ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

            {/* Step 2 Item */}
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep === 2
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  currentStep === 2 ? 'text-blue-900 font-semibold' : 'text-slate-600'
                }`}
              >
                2. Reembolso
              </span>
            </div>

            <div className={`h-0.5 flex-1 mx-2 sm:mx-4 ${currentStep === 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

            {/* Step 3 Item */}
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep === 3
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                3
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  currentStep === 3 ? 'text-blue-900 font-semibold' : 'text-slate-600'
                }`}
              >
                3. Confirmar
              </span>
            </div>
          </div>
        </div>

        {/* Wizard Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Validation error message if any */}
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {currentStep === 1 && (
            <Step1Products
              products={sale.products}
              selectedProducts={wizardState.selectedProducts}
              onUpdateQuantity={handleUpdateProductQuantity}
              onSelectAll={handleSelectAllProducts}
              onClearAll={handleClearAllProducts}
              currency={sale.currency}
            />
          )}

          {currentStep === 2 && (
            <Step2Refund
              sale={sale}
              wizardState={wizardState}
              onChangeRefundMode={handleChangeRefundMode}
              onChangePartialAmount={handleChangePartialAmount}
              onChangeDestination={handleChangeDestination}
              onChangeRefundReason={handleChangeRefundReason}
              onChangeCustomRefundReason={handleChangeCustomRefundReason}
              currency={sale.currency}
            />
          )}

          {currentStep === 3 && (
            <Step3Confirm
              sale={sale}
              wizardState={wizardState}
              onChangeReturnReason={handleChangeReturnReason}
              onChangeCustomReturnReason={handleChangeCustomReturnReason}
              onChangeRefundReason={handleChangeRefundReason}
              onChangeCustomRefundReason={handleChangeCustomRefundReason}
              currency={sale.currency}
            />
          )}
        </div>

        {/* Wizard Sticky Bottom Footer */}
        <div className="sticky bottom-0 z-20 px-5 py-3.5 bg-white/95 backdrop-blur-sm border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>
                  {currentStep === 1 ? 'Siguiente: Reembolso' : 'Siguiente: Confirmar'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePreConfirm}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirmar y registrar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pre-commit final warning modal */}
      <FinalConfirmDialog
        isOpen={showFinalDialog}
        onClose={() => setShowFinalDialog(false)}
        onProceed={handleExecuteTransaction}
        totalProductsCount={totalReturningUnits}
        productNames={sale.products
          .filter((p) => (wizardState.selectedProducts[p.id] || 0) > 0)
          .map((p) => p.name)}
        refundAmount={refundAmount}
        refundDestination={wizardState.destination}
        currency={sale.currency}
      />
    </div>
  );
};
