import React, { useState } from "react";
import "./App.css";
import { BullringPaymentWidget } from "@bullring/payment-widget/dist";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      {count === 0 ? (
        <button onClick={() => setCount(1)}> Pay 1000 brl</button>
      ) : null}
      {count === 1 ? (
        <BullringPaymentWidget
          amount={1000}
          merchantId="e6095fa1-4d03-4d6b-8fa8-e77009484a6e"
          onPaymentSuccess={(txid) => console.log("Payment received:", txid)}
          onPaymentError={(txid) => console.log("Payment received:", txid)}
          onClose={() => {
            setCount(0);
          }}
        />
      ) : null}
    </>
  );
}

export default App;
