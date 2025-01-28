// src/index.ts
export { default as BullringPaymentWidget } from "./components/BullringPaymentWidget";
export * from "./types/payment";
export * from "./types/props";

// Initialize web component if in browser environment
if (typeof window !== "undefined") {
  import("./web-components/payment-widget").catch((err) =>
    console.error("Failed to load web component:", err)
  );
}
