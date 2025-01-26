import React, { useState } from "react";
import "./App.css";
import BullringPaymentWidget from "@bullring/payment-widget";

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
          merchantId="1081ea8f-3e32-4b95-8241-fa5b54e19f59"
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
