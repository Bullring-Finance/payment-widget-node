declare namespace JSX {
    interface BullringPaymentAttributes {
        'invoice-amount': number;
        'merchant-id': string;
        'merchant-name'?: string;
        onPaymentSuccess?: (event: CustomEvent) => void;
        onPaymentError?: (event: CustomEvent) => void;
        onClose?: (event: CustomEvent) => void;
    }

    interface IntrinsicElements {
        'bullring-payment-widget': BullringPaymentAttributes;
    }
}