import * as React from "react";
import { useState, useEffect, ReactNode } from "react";
import type { LucideProps } from "lucide-react";
import { CheckCircle, Copy, XCircle } from "lucide-react";
import { icons } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import enTranslations from "./locales/en";
import ptTranslations from "./locales/pt";
import "./styles.css";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    pt: { translation: ptTranslations },
  },
  lng: navigator.language,
  fallbackLng: "en",
});

export interface BullringPaymentWidgetProps {
  amount: number;
  merchantId: string;
  merchantName?: string;
  onPaymentSuccess?: (tx: PaymentResponse) => void;
  onPaymentError?: (error: Error | string) => void;
  onClose?: (txId: string) => void;
}

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
interface Profile {
  name: string;
  preferredCurrency: string;
}

type IconComponent = React.ForwardRefExoticComponent<
  LucideProps & React.RefAttributes<SVGSVGElement>
>;

const Icon = React.forwardRef<
  SVGSVGElement,
  LucideProps & { name: keyof typeof icons }
>(({ name, ...props }, ref) => {
  const IconComponent = icons[name] as IconComponent;
  return <IconComponent ref={ref} {...props} />;
});

type PaymentStatus = "idle" | "pending" | "success" | "error";
const getBaseUrl = (merchantId: string) => {
  if (merchantId === "e6095fa1-4d03-4d6b-8fa8-e77009484a6e") {
    return "https://staging-api.bullring.finance/v1";
  }
  return "https://api.bullring.finance/v1";
};

const BullringPaymentWidget: React.FC<BullringPaymentWidgetProps> = ({
  amount = 0,
  merchantId,
  merchantName,
  onPaymentSuccess = () => {},
  onPaymentError = () => {},
  onClose = () => {},
}): ReactNode => {
  const { t } = useTranslation();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [invoice, setInvoice] = useState<string>("");
  const [invoiceId, setInvoiceId] = useState<string>("");
  const [, setCountdown] = useState<number>(900);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const BASEURL = getBaseUrl(merchantId);

  const formatAmountIntl = (value: number | null, currency: string): string => {
    if (typeof value !== "number" || !currency) return "0";
    return new Intl.NumberFormat(navigator.language, {
      style: "currency",
      currency,
    }).format(value);
  };
  const generateInvoice = async (): Promise<void> => {
    if (!amount || !merchantId) {
      setIsLoading(false);
      onPaymentError("Invalid amount or merchant ID");
      return;
    }
    if (!profile?.name || !profile?.preferredCurrency) {
      console.error("Failed to generate invoice:", error);
      setError(new Error("Failed to generate invoice"));
      onPaymentError(
        error instanceof Error ? error : new Error("Failed to generate invoice")
      );
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      // Actual API implementation would look like this:

      const response = await fetch(
        `${BASEURL}/stores/${merchantId}/invoices/widget`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            currency: profile?.preferredCurrency,
          }),
        }
      );

      const data: PaymentResponse = await response.json();

      setInvoice(data.lightningInvoice);
      setInvoiceId(data.id);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to generate invoice:", error);
      setError(new Error("Failed to generate invoice"));
      onPaymentError(
        error instanceof Error ? error : new Error("Failed to generate invoice")
      );
    }
  };

  const fetchStoreProfile = async () => {
    // Actual API implementation would look like this:
    try {
      setIsLoading(true);
      const response = await fetch(`${BASEURL}/stores/${merchantId}/widget`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data: Profile = await response.json();

      if (!data.name || !data.preferredCurrency) {
        console.error("Failed to generate invoice:", error);
        setError(new Error("Failed to generate invoice"));
        onPaymentError(
          error instanceof Error
            ? error
            : new Error("Failed to generate invoice")
        );
        setIsLoading(false);
      }
      setProfile(data);
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      setError(new Error("Failed to generate invoice"));
      onPaymentError(
        error instanceof Error ? error : new Error("Failed to generate invoice")
      );
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async (): Promise<void> => {
    if (!invoice || paymentStatus === "success") return;

    try {
      // Simulated status check for demo
      // In production, this would make an API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await fetch(
        `${BASEURL}/stores/${merchantId}/invoices/${invoiceId}/status`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data: PaymentResponse = await response.json();

      if (data.status === "paid") {
        setPaymentStatus("success");
        onPaymentSuccess(data);
      } else {
        // setPaymentStatus("error");
        // onPaymentError("Payment failed");
      }
    } catch (error) {
      console.error("Failed to check status:", error);
    }
  };

  useEffect(() => {
    fetchStoreProfile();
  }, []);

  useEffect(() => {
    if (profile?.name && profile?.preferredCurrency) {
      generateInvoice();
    }
  }, [profile]);

  useEffect(() => {
    if (invoice && invoiceId) {
      const statusInterval = setInterval(() => {
        checkPaymentStatus();
      }, 2000);
      const timerInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 0) {
            clearInterval(timerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(statusInterval);
        clearInterval(timerInterval);
      };
    }
  }, [invoice, invoiceId]);

  const copyToClipboard = async (val: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(val);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const PaymentSuccess = () => {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full bg-white max-w-sm mx-auto rounded-lg shadow-lg">
        <div className="mx-auto p-6 max-w-lg relative">
          <div className="mb-12">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500 stroke-2" />
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex justify-start mb-4 items-center">
              <p className="text-gray-500 mr-1">{t("payment.amount")}: </p>
              <p className="text-gray-900 text-sm truncate mt-1">
                {formatAmountIntl(amount, profile?.preferredCurrency as string)}
              </p>
            </div>
            <div className="flex justify-start items-center">
              <p className="text-gray-500 mr-1">{t("payment.id")}: </p>
              <p className="text-gray-900 text-sm truncate mt-1">{invoiceId}</p>
            </div>
          </div>

          <div className="mt-auto">
            <button
              className="w-full py-4 bg-gray-100 rounded-xl my-4 text-gray-900"
              onClick={() => onClose(invoiceId)}
            >
              {t("payment.close")}
            </button>
            <div className="mt-12 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
              <img
                src="https://res.cloudinary.com/bullring-finance/image/upload/v1737826118/Logo_bullring_1_u8f6gy.svg"
                alt="Bullring Finance Logo"
                className="h-6"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PaymentCreationError = () => {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full bg-white max-w-sm mx-auto rounded-lg shadow-lg">
        <div className="mx-auto p-6 max-w-lg flex flex-col">
          <div className="mb-12 pt-8">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500 stroke-2" />
            <p className="text-gray-800 text-center">{t("payment.error")}</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex justify-start">
              <p className="text-gray-500">{t("payment.details")}:</p>
              <p className="text-red-500 ml-1">{t("payment.invoiceError")}</p>
            </div>
          </div>

          <div className="mt-auto mt-5">
            <button
              className="w-full py-4 bg-gray-100 rounded-xl mb-8 text-gray-900 mt-5"
              onClick={fetchStoreProfile}
            >
              {t("payment.retry")}
            </button>

            <div className="mt-12 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
              <img
                src="https://res.cloudinary.com/bullring-finance/image/upload/v1737826118/Logo_bullring_1_u8f6gy.svg"
                alt="Bullring Finance Logo"
                className="h-6"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (paymentStatus === "success") {
    return (
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-black/25"
          onClick={() => {
            onClose(invoiceId);
          }}
        />
        <PaymentSuccess />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-black/25"
          onClick={() => {
            onClose(invoiceId);
          }}
        />
        <PaymentCreationError />
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-black/25"
          onClick={() => onClose(invoiceId)}
        />
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm mx-auto rounded-lg shadow-lg p-6 ${"bg-white text-gray-900"}`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Icon
              name="RefreshCw"
              className="w-6 h-6 animate-spin"
              aria-hidden="true"
            />
            <span>{t("payment.loading")}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/25"
        onClick={() => onClose(invoiceId)}
      />
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm mx-auto rounded-lg shadow-lg p-6 ${"bg-white text-gray-900"}`}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg opacity-75 text-center w-full">
            {t("payment.title", { merchant: merchantName || profile?.name })}
          </span>
        </div>

        <div className="text-center mb-6">
          <div className="text-2xl font-bold">
            {formatAmountIntl(amount, profile?.preferredCurrency as string)}
          </div>
        </div>

        {invoice && (
          <div className="bg-white p-4 rounded-lg mb-4">
            <div
              className="h-64 flex items-center justify-center border mx-auto"
              style={{
                width: 250,
                height: 250,
                maxWidth: "100%",
                borderRadius: 10,
              }}
            >
              <QRCodeSVG
                value={invoice}
                size={220}
                className="qr-style"
                minVersion={10}
                imageSettings={{
                  width: 45,
                  height: 45,
                  src: "https://res.cloudinary.com/bullring-finance/image/upload/v1737821231/icon_vx7b1o.png",
                  excavate: true,
                }}
              />
            </div>
          </div>
        )}

        <div className="border border-dashed border-slate-700 rounded-xl p-1 flex items-center justify-between">
          <div className="flex flex-col items-start">
            <p className="text-base mb-1 pl-3">{t("payment.lightning")}</p>
            <p className="text-slate-400 text-sm truncate w-48 pl-3">
              {invoice || t("payment.noInvoice")}
            </p>
          </div>
          <button
            className="bg-white p-2 rounded-xl hover:bg-slate-200 hover:border-transparent"
            onClick={() => copyToClipboard(invoice)}
          >
            <Copy size={24} />
          </button>
        </div>

        <div className="mt-auto">
          <button
            className="w-full py-4 bg-gray-100 rounded-xl my-4 text-gray-900"
            onClick={() => onClose(invoiceId)}
          >
            {t("payment.close")}
          </button>
          <div className="mt-8 text-center text-sm text-slate-400">
            <p className="flex items-center justify-center gap-2">
              {t("payment.poweredBy")}
              <img
                src="https://res.cloudinary.com/bullring-finance/image/upload/v1737826118/Logo_bullring_1_u8f6gy.svg"
                alt="Bullring Finance Logo"
                className="h-6"
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BullringPaymentWidget;
