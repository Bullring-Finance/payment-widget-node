declare namespace JSX {
    interface IntrinsicElements {
        'bullring-payment-widget': {
            'invoice-amount': number;
            'merchant-id': string;
            'merchant-name'?: string;
            onpaymentSuccess?: (event: CustomEvent) => void;
            onpaymentError?: (event: CustomEvent) => void;
            onclose?: (event: CustomEvent) => void;
        }
    }
}