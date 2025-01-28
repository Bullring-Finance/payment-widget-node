declare module '@vue/runtime-core' {
    export interface GlobalComponents {
        'bullring-payment-widget': {
            invoiceAmount: number;
            merchantId: string;
            merchantName?: string;
            onPaymentSuccess?: (event: CustomEvent) => void;
            onPaymentError?: (event: CustomEvent) => void;
            onClose?: (event: CustomEvent) => void;
        }
    }
}