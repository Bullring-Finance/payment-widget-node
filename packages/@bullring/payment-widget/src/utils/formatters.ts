export const formatAmountIntl = (value: number | null, currency: string): string => {
    if (typeof value !== "number" || !currency) return "0";
    return new Intl.NumberFormat(navigator.language, {
        style: "currency",
        currency,
    }).format(value);
};