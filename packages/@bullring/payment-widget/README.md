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

## Usage

```tsx
import PaymentWidget from '@bullring/payment-widget'

function App() {
  return (
    <PaymentWidget 
      merchantId="e6095fa1-4d03-4d6b-8fa8-e77009484a6e"
      amount={1000}  
      onSuccess={(invoice) => console.log('Payment successful', invoice)}
      onError={(error) => console.log('Payment failed', error)}
      onClose={() => {
            console.log('user initiated close action')
          }}
    />
  )
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| merchantName (optional) | string | Store/merchant name |
| merchantId | string | Store/merchant name |
| amount | number | Payment amount |
| onSuccess | (id: string) => void | Success callback |
| onError | (error: Error) => void | Error callback |
| onClose | () => void | Close callback |

### PaymentInvoice

```ts

interface PaymentInvoice {

  id: string;

  lightningInvoice: string;

  status: 'paid' | 'unpaid' | 'expired';

}

```

## Internationalization

Currently supports:
- English
- Portuguese

Language detected automatically from browser settings.

## License

MIT
```