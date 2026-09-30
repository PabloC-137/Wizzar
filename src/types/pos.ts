export interface Product {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  purchasedQty: number;
  returnedQty: number;
  availableQty: number;
  category?: string;
}

export interface ReturnHistoryItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
}

export interface ReturnTransaction {
  id: string;
  folio: string;
  timestamp: string;
  operator: string;
  itemsReturned: ReturnHistoryItem[];
  refundMode: 'none' | 'total' | 'partial';
  refundAmount: number;
  refundDestination: 'wallet' | 'original_method';
  returnReason?: string;
  refundReason?: string;
  notes?: string;
}

export interface SaleRecord {
  id: string;
  folio: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  total: number;
  currency: string;
  paymentMethod: 'Efectivo' | 'Tarjeta de crédito' | 'Transferencia SPEI';
  status: 'Completada' | 'Devolución parcial' | 'Devuelta total';
  products: Product[];
  history: ReturnTransaction[];
  refundableBalance: number;
  clientWalletBalance: number;
}

export interface ReturnWizardState {
  selectedProducts: Record<string, number>; // productId -> quantity to return
  refundMode: 'none' | 'total' | 'partial';
  partialAmount: string; // user input string to allow comfortable typing
  destination: 'wallet' | 'original_method';
  returnReason: string;
  customReturnReason: string;
  refundReason: string;
  customRefundReason: string;
}
