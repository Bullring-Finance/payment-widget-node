export interface PaymentSuccessEvent extends CustomEvent<PaymentResponse> {
    type: 'payment-success';
}

export interface PaymentErrorEvent extends CustomEvent<Error> {
    type: 'payment-error';
}

export interface CloseEvent extends CustomEvent<string> {
    type: 'close';
}

declare global {
    interface HTMLElementEventMap {
        'payment-success': PaymentSuccessEvent;
        'payment-error': PaymentErrorEvent;
        'close': CloseEvent;
    }
}