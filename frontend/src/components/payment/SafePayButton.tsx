// components/payment/SafePayButton.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Loader2, ExternalLink } from "lucide-react";
import api from "@/services/api";

interface SafePayButtonProps {
  bookId: string;
  amount: number;
  currency: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const SafePayButton = ({ bookId, onError }: SafePayButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleSafePayPurchase = async () => {
    try {
      setLoading(true);
      const { data } = await api.post<{ success: boolean; message?: string; payment?: { paymentUrl: string }; redirectUrl?: string }>('/payments/create', {
        bookId,
        paymentMethod: 'safepay'
      });

      const paymentUrl = data?.payment?.paymentUrl ?? data?.redirectUrl;
      if (data?.success && paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        onError?.(data?.message || 'Payment initiation failed');
      }
    } catch (error: any) {
      console.error('SafePay error:', error);
      onError?.(error?.response?.data?.message || error?.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSafePayPurchase}
      disabled={loading}
      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 gap-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Lock className="w-4 h-4" />
      )}
      <span>Pay with SafePay</span>
      <ExternalLink className="w-4 h-4 ml-auto" />
    </Button>
  );
};

export default SafePayButton;