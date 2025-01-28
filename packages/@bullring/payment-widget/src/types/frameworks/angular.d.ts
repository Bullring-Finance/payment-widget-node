declare namespace angular {
    interface BullringPaymentElement extends HTMLElement {
        invoiceAmount: number;
        merchantId: string;
        merchantName?: string;
    }

    // For use with Angular's component decorator
    interface BullringPaymentEvents {
        paymentSuccess: CustomEvent;
        paymentError: CustomEvent;
        close: CustomEvent;
    }
}