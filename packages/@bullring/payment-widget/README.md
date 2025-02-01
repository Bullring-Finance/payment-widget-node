# @bullring/payment-widget

Lightning payment widget for web applications.

## Getting Started

1. Download Bullring app from [App Store](https://apps.apple.com/us/app/bullring-finance/id6705121208) or [Play Store](https://play.google.com/store/apps/details?id=com.bullringfinance.pos)
2. Create account and verify identity
3. Add bank account
4. Copy merchant ID from app settings
5. Install widget:

## Installation

```bash
npm install @bullring/payment-widget
```

Or using yarn:
```bash
yarn add @bullring/payment-widget
```

Or using pnpm:
```bash
pnpm add @bullring/payment-widget
```

## Basic Usage

### Vanilla JavaScript/HTML
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/@bullring/payment-widget/dist/styles.css">
  <script type="module" src="https://unpkg.com/@bullring/payment-widget"></script>
</head>
<body>
  <bullring-payment-widget
    invoice-amount="100"
    merchant-id="your-merchant-id"
    merchant-name="Your Store"
  </bullring-payment-widget>

  <script>
    const widget = document.querySelector('bullring-payment-widget');
    
    widget.addEventListener('payment-success', (e) => {
      console.log('Payment successful:', e.detail);
    });

    widget.addEventListener('payment-error', (e) => {
      console.error('Payment failed:', e.detail);
    });

    widget.addEventListener('close', (e) => {
      console.log('Widget closed, transaction ID:', e.detail);
    });
  </script>
</body>
</html>
```

### React
```tsx
import "@bullring/payment-widget";

const PaymentComponent = () => {
  const handlePaymentSuccess = (data: any) => {
    console.log('Payment successful:', data);
  };

  const handlePaymentError = (error: Error) => {
    console.error('Payment failed:', error);
  };

  const handleClose = (txId: string) => {
    console.log('Widget closed:', txId);
  };

  return (
     <bullring-payment-widget
          invoice-amount={1000}
          merchant-id={"e6095fa1-4d03-4d6b-8fa8-e77009484a6e"}
          onpaymentSuccess={(txid) => console.log("Payment received:", txid)}
          onpaymentError={(txid) => console.log("Payment received:", txid)}
          onclose={() => {
            console.log("yey!");
            setCount(0);
          }}
        />
  );
};
```

### Vue
```vue
<template>
  <bullring-payment-widget
    :invoice-amount="100"
    merchant-id="your-merchant-id"
    merchant-name="Your Store"
    @payment-success="handlePaymentSuccess"
    @payment-error="handlePaymentError"
    @close="handleClose"
  />
</template>

<script setup lang="ts">
import '@bullring/payment-widget';
import '@bullring/payment-widget/dist/styles.css';

const handlePaymentSuccess = (data: any) => {
  console.log('Payment successful:', data);
};

const handlePaymentError = (error: Error) => {
  console.error('Payment failed:', error);
};

const handleClose = (txId: string) => {
  console.log('Widget closed:', txId);
};
</script>
```

### Angular
```typescript
// app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Required for web components
  bootstrap: [AppComponent]
})
export class AppModule {}

// app.component.ts
import { Component, OnInit } from '@angular/core';
import '@bullring/payment-widget';
import '@bullring/payment-widget/dist/styles.css';

@Component({
  selector: 'app-root',
  template: `
    <bullring-payment-widget
      [invoice-amount]="100"
      [merchant-id]="merchantId"
      [merchant-name]="merchantName"
      (paymentSuccess)="onPaymentSuccess($event)"
      (paymentError)="onPaymentError($event)"
      (close)="onClose($event)">
    </bullring-payment-widget>
  `
})
export class AppComponent {
  merchantId = 'your-merchant-id';
  merchantName = 'Your Store';

  onPaymentSuccess(event: CustomEvent) {
    console.log('Payment successful:', event.detail);
  }

  onPaymentError(event: CustomEvent) {
    console.error('Payment failed:', event.detail);
  }

  onClose(event: CustomEvent) {
    console.log('Widget closed:', event.detail);
  }
}
```

### Svelte
```svelte
<script lang="ts">
  import '@bullring/payment-widget';
  import '@bullring/payment-widget/dist/styles.css';

  const handlePaymentSuccess = (event: CustomEvent) => {
    console.log('Payment successful:', event.detail);
  };

  const handlePaymentError = (event: CustomEvent) => {
    console.error('Payment failed:', event.detail);
  };

  const handleClose = (event: CustomEvent) => {
    console.log('Widget closed:', event.detail);
  };
</script>

<bullring-payment-widget
  invoice-amount={100}
  merchant-id="your-merchant-id"
  merchant-name="Your Store"
  on:payment-success={handlePaymentSuccess}
  on:payment-error={handlePaymentError}
  on:close={handleClose}
/>
```

## API Reference

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| invoice-amount | number | Yes | Payment amount in the merchant's preferred currency |
| merchant-id | string | Yes | Your Bullring merchant ID |
| merchant-name  | string | No | Display name for your store |

### Events

| Event | Detail Type | Description |
|-------|------------|-------------|
| payment-success | PaymentResponse | Fired when payment is successfully completed |
| payment-error | Error | Fired when an error occurs during payment |
| close | string | Fired when the widget is closed (includes transaction ID) |

### PaymentResponse Type

```typescript
interface PaymentResponse {
  lightningInvoice: string;
  id: string;
  paymentHash: string | null;
  paymentRequestAmount: number;
  paymentRequestCurrency: string;
  invoiceCurrency: string;
  invoiceAmount: number;
  status: 'unpaid' | 'paid' | 'expired';
  note: string;
  createdAt: string;
  updatedAt: string;
}
```

## Styling

The widget comes with default styles, but you can customize its appearance using CSS variables:

```css
:root {
  /* Add your custom styles here */
}
```

## Browser Support

The widget works in all modern browsers that support Web Components:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)


## Internationalization

Currently supports:
- English
- Portuguese

Language detected automatically from browser settings.

## Contact

Website: https://bullring.finance

Email: developer@bullring.finance

## License

MIT

## Support

For support, please contact developer@bullring.finance