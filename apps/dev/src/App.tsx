import React, { useState } from "react";
import "./App.css";
import "@bullring/payment-widget";
export interface BullringPaymentWidgetProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  amount: number;
  merchantId: string;
  merchantName?: string;
  onPaymentSuccess?: (data: any) => void;
  onPaymentError?: (error: Error) => void;
  onClose?: (txId: string) => void;
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      {count === 0 ? (
        <button onClick={() => setCount(1)}> Pay 1000 brl</button>
      ) : null}
      {count === 1 ? (
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
      ) : null}
    </>
  );
}

export default App;
