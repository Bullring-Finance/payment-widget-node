// web-components/payment-widget.ts
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import BullringPaymentWidget from '../components/BullringPaymentWidget';


class PaymentWidget extends HTMLElement {
    private root: ReactDOM.Root | null = null;
    private mountPoint: HTMLDivElement;

    static get observedAttributes() {
        return ['amount', 'merchant-id', 'merchant-name'];
    }

    constructor() {
        super();
        this.mountPoint = document.createElement('div');
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(this.mountPoint);

        // Add global styles
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(`
      .qr-style image {
        clip-path: circle(65%);
      }
      button:hover {
        border-color: transparent;
      }
    `);
        shadow.adoptedStyleSheets = [styleSheet];
    }

    getProps() {
        return {
            amount: Number(this.getAttribute('amount')) || 0,
            merchantId: this.getAttribute('merchant-id') || '',
            merchantName: this.getAttribute('merchant-name') || undefined,
            onPaymentSuccess: (tx: any) => {
                this.dispatchEvent(new CustomEvent('payment-success', { detail: tx }));
            },
            onPaymentError: (error: any) => {
                this.dispatchEvent(new CustomEvent('payment-error', { detail: error }));
            },
            onClose: (txId: string) => {
                this.dispatchEvent(new CustomEvent('close', { detail: txId }));
            },
        };
    }

    connectedCallback() {
        try {
            this.root = ReactDOM.createRoot(this.mountPoint);
            this.render();
        } catch (error) {
            console.error('Failed to initialize payment widget:', error);
        }
    }

    disconnectedCallback() {
        if (this.root) {
            try {
                this.root.unmount();
            } catch (error) {
                console.error('Failed to unmount payment widget:', error);
            }
        }
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    private render() {
        if (!this.root) return;
        try {
            this.root.render(
                React.createElement(BullringPaymentWidget, this.getProps())
            );
        } catch (error) {
            console.error('Failed to render payment widget:', error);
        }
    }
}

// Check if the custom element is already defined
if (!customElements.get('bullring-payment')) {
    customElements.define('bullring-payment', PaymentWidget);
}

export default PaymentWidget;
