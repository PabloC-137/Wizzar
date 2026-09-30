/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SaleRecord, Product, ReturnTransaction } from './types/pos';
import { INITIAL_SALES } from './data/mockSales';
import { Header } from './components/Header';
import { SaleDetail } from './components/SaleDetail';
import { ReturnWizardModal } from './components/ReturnWizard/ReturnWizardModal';
import { NotificationToast } from './components/NotificationToast';
import { formatCurrency } from './utils/formatters';
import {
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Package,
  Wallet,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [sales, setSales] = useState<SaleRecord[]>(() => {
    // Try to load from localStorage or fallback to INITIAL_SALES
    const saved = localStorage.getItem('pos_sales_data_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_SALES;
      }
    }
    return INITIAL_SALES;
  });

  const [currentSaleId, setCurrentSaleId] = useState<string>('sale-1');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isDemoPresetActive, setIsDemoPresetActive] = useState(false);
  const [toastData, setToastData] = useState<{ message: string; subMessage: string } | null>(null);

  const currentSale = sales.find((s) => s.id === currentSaleId) || sales[0];

  const saveSales = (newSales: SaleRecord[]) => {
    setSales(newSales);
    localStorage.setItem('pos_sales_data_v1', JSON.stringify(newSales));
  };

  const handleResetAllData = () => {
    localStorage.removeItem('pos_sales_data_v1');
    setSales(INITIAL_SALES);
    setCurrentSaleId('sale-1');
    setIsDemoPresetActive(false);
    setToastData({
      message: 'Datos restablecidos',
      subMessage: 'Se han recargado las ventas de demostración iniciales.',
    });
  };

  const handleOpenDemoWizard = () => {
    setCurrentSaleId('sale-1');
    setIsDemoPresetActive(true);
    setIsWizardOpen(true);
  };

  const handleOpenRegularWizard = () => {
    setIsDemoPresetActive(false);
    setIsWizardOpen(true);
  };

  const handleCompleteTransaction = (
    transaction: ReturnTransaction,
    updatedProducts: Product[]
  ) => {
    const updatedSales = sales.map((s) => {
      if (s.id !== currentSale.id) return s;

      const newRefundable = Math.max(0, s.refundableBalance - transaction.refundAmount);
      const newWallet =
        transaction.refundDestination === 'wallet'
          ? s.clientWalletBalance + transaction.refundAmount
          : s.clientWalletBalance;

      // Status check
      const totalUnitsBought = updatedProducts.reduce((acc, p) => acc + p.purchasedQty, 0);
      const totalUnitsReturned = updatedProducts.reduce((acc, p) => acc + p.returnedQty, 0);
      const isTotalReturn = totalUnitsReturned === totalUnitsBought && newRefundable === 0;

      return {
        ...s,
        products: updatedProducts,
        refundableBalance: newRefundable,
        clientWalletBalance: newWallet,
        status: isTotalReturn
          ? ('Devuelta total' as const)
          : ('Devolución parcial' as const),
        history: [transaction, ...s.history],
      };
    });

    saveSales(updatedSales);

    // Build friendly toast
    const itemsCount = transaction.itemsReturned.reduce((a, b) => a + b.quantity, 0);
    const refundStr =
      transaction.refundAmount > 0
        ? `${formatCurrency(transaction.refundAmount, currentSale.currency)} a ${
            transaction.refundDestination === 'wallet' ? 'Wallet' : 'método original'
          }`
        : 'Sin reembolso monetario';

    setToastData({
      message: 'Operación registrada exitosamente',
      subMessage: `${itemsCount} producto(s) reingresados a inventario · ${refundStr}.`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Header
        currentSale={currentSale}
        sales={sales}
        onSelectSale={(s) => setCurrentSaleId(s.id)}
        onResetAllData={handleResetAllData}
        onOpenDemoWizard={handleOpenDemoWizard}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Demonstration Context Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <span>Caso de prueba rápida: Venta POS-10482 (Ana Martínez)</span>
              </div>
              <p className="leading-relaxed">
                Pruebe el caso solicitado: devuelva solo la <strong>Mochila urbana</strong>, elija{' '}
                <strong>Monto total ($1,250.00 MXN)</strong> y destino <strong>Wallet</strong>. Verifique cómo la
                confirmación final deja explícito que solo la mochila vuelve al stock, el reembolso se emite completo y
                el <strong>Termo de acero</strong> no fue devuelto.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenDemoWizard}
            className="shrink-0 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Ejecutar caso de prueba</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sales Detail View (follo, products, history, Devolver button) */}
        <SaleDetail
          sale={currentSale}
          onOpenReturnWizard={handleOpenRegularWizard}
        />
      </main>

      {/* Return & Refund 3-Step Wizard Modal */}
      {isWizardOpen && (
        <ReturnWizardModal
          key={`${currentSale.id}-${isDemoPresetActive}`}
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          sale={currentSale}
          onCompleteTransaction={handleCompleteTransaction}
          initialDemoPreset={isDemoPresetActive}
        />
      )}

      {/* Toast Notification */}
      {toastData && (
        <NotificationToast
          message={toastData.message}
          subMessage={toastData.subMessage}
          onClose={() => setToastData(null)}
        />
      )}

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>Sistema POS Devoluciones y Reembolsos</span>
            <span>·</span>
            <span>Arquitectura desacoplada de inventario y caja</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">Terminal activa: POS-MX-04</div>
        </div>
      </footer>
    </div>
  );
}
