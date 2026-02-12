// components/book/BookStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Download, ShoppingCart, Calendar, FileText, BookOpen } from "lucide-react";

// NAVY BLUE COLOR SCHEME
const colors = {
  navy: '#1a2a4a',
  navyLight: '#2d4270',
  navyDark: '#0f1a2e',
  navyMuted: '#e8edf5',
  navyForeground: '#f8fafc',
  gold: '#d4a418',
  goldLight: '#e8b92f',
  goldMuted: '#fef9e7',
  success: '#166534',
  successLight: '#22c55e',
  successMuted: '#dcfce7',
  successForeground: '#ffffff',
  warning: '#d97706',
  warningMuted: '#fef3c7',
  border: '#e2e8f0',
  background: '#ffffff',
  foreground: '#1e293b',
  muted: '#64748b',
};

interface BookStatsProps {
  viewCount: number;
  downloadCount: number;
  purchaseCount: number;
  createdAt?: string;
  discountedPrice: number;
  currency: string;
  hasPurchased: boolean;
}

const BookStats = ({
  viewCount,
  downloadCount,
  purchaseCount,
  createdAt,
  discountedPrice,
  currency,
  hasPurchased
}: BookStatsProps) => {
  const formatCurrency = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch (error) {
      return `${currency} ${amount.toFixed(2)}`;
    }
  };

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      {/* Reading Formats */}
      <Card className="border-2 hover:shadow-lg transition-shadow"
        style={{ backgroundColor: colors.background, borderColor: colors.navyLight }}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-3" style={{ color: colors.navy }}>
            <div className="p-2 rounded-lg" style={{ backgroundColor: colors.navyMuted }}>
              <BookOpen className="w-5 h-5" style={{ color: colors.navy }} />
            </div>
            Available Formats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border-2 rounded-xl transition-colors"
              style={{ 
                borderColor: colors.navyLight,
                backgroundColor: colors.navyMuted,
              }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: colors.successMuted }}>
                  <BookOpen className="w-4 h-4" style={{ color: colors.success }} />
                </div>
                <div>
                  <p className="font-medium" style={{ color: colors.navy }}>Text Version</p>
                  <p className="text-sm" style={{ color: colors.muted }}>Read online for free</p>
                </div>
              </div>
              <div className="text-right">
                <div className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: colors.successMuted,
                    color: colors.success,
                  }}>
                  FREE
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 border-2 rounded-xl transition-colors"
              style={{ 
                borderColor: colors.navyLight,
                backgroundColor: colors.navyMuted,
              }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: colors.navyMuted }}>
                  <FileText className="w-4 h-4" style={{ color: colors.navy }} />
                </div>
                <div>
                  <p className="font-medium" style={{ color: colors.navy }}>PDF Version</p>
                  <p className="text-sm" style={{ color: colors.muted }}>Download and keep</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium" style={{ color: colors.navy }}>
                  {formatCurrency(discountedPrice, currency || 'PKR')}
                </p>
                {hasPurchased && (
                  <div className="text-xs mt-1 px-2 py-1 rounded-full"
                    style={{ 
                      backgroundColor: colors.successMuted,
                      color: colors.success,
                    }}>
                    PURCHASED
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Book Stats */}
      <Card className="border-2 hover:shadow-lg transition-shadow"
        style={{ backgroundColor: colors.background, borderColor: colors.navyLight }}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-3" style={{ color: colors.navy }}>
            <div className="p-2 rounded-lg" style={{ backgroundColor: colors.navyMuted }}>
              <FileText className="w-5 h-5" style={{ color: colors.navy }} />
            </div>
            Book Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg transition-colors"
              style={{ backgroundColor: colors.navyMuted }}>
              <span className="flex items-center gap-2" style={{ color: colors.navy }}>
                <Eye className="w-4 h-4" />
                Views
              </span>
              <span className="font-medium" style={{ color: colors.navy }}>{viewCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg transition-colors"
              style={{ backgroundColor: colors.navyMuted }}>
              <span className="flex items-center gap-2" style={{ color: colors.navy }}>
                <Download className="w-4 h-4" />
                Downloads
              </span>
              <span className="font-medium" style={{ color: colors.navy }}>{downloadCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg transition-colors"
              style={{ backgroundColor: colors.navyMuted }}>
              <span className="flex items-center gap-2" style={{ color: colors.navy }}>
                <ShoppingCart className="w-4 h-4" />
                Purchases
              </span>
              <span className="font-medium" style={{ color: colors.navy }}>{purchaseCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg transition-colors"
              style={{ backgroundColor: colors.navyMuted }}>
              <span className="flex items-center gap-2" style={{ color: colors.navy }}>
                <Calendar className="w-4 h-4" />
                Upload Date
              </span>
              <span className="font-medium" style={{ color: colors.navy }}>
                {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookStats;