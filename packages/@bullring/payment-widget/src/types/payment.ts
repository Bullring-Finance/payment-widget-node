export interface PaymentResponse {
    lightningInvoice: string;
    id: string;
    paymentHash: string | null;
    paymentRequestAmount: number;
    paymentRequestCurrency: string;
    invoiceCurrency: string;
    invoiceAmount: number;
    status: "unpaid" | "paid" | "expired";
    note: string;
    createdAt: string;
    updatedAt: string;
}

export interface Profile {
    name: string;
    preferredCurrency: string;
}