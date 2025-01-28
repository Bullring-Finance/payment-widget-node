export interface BullringPaymentWidgetProps
    extends React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
    > {
    "invoice-amount": number;
    "merchant-id": string;
    "merchant-name"?: string;
    onpaymentSuccess?: (data: any) => void;
    onpaymentError?: (error: Error) => void;
    onclose?: (txId: string) => void;
}