export const getBaseUrl = (merchantId: string) => {
    if (merchantId === "e6095fa1-4d03-4d6b-8fa8-e77009484a6e") {
        return "https://staging-api.bullring.finance/v1";
    }
    return "https://api.bullring.finance/v1";
};

export const generateInvoice = async (merchantId: string, amount: number, currency: string) => {
    const response = await fetch(`${getBaseUrl(merchantId)}/stores/${merchantId}/invoices/widget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency })
    });
    return response.json();
};