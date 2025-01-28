import { PaymentResponse } from "./payment";
export interface BullringPaymentWidgetProps {
    invoiceAmount: number;
    merchantId: string;
    merchantName?: string;
    onPaymentSuccess?: (tx: PaymentResponse) => void;
    onPaymentError?: (error: Error | string) => void;
    onClose?: (txId: string) => void;
}

