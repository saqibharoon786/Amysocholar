import { useState } from "react";
import { 
  ShoppingCart, 
  Heart, 
  Download, 
  BookOpen,
  Loader2,
  Star,
} from "lucide-react";
import { toast } from "sonner";

interface BookActionsProps {
  book: {
    _id: string;
    title: string;
    price: number;
    currency: string;
    discountPercentage?: number;
  };
  hasPurchased: boolean;
  purchasing: boolean;
  purchaseCheckLoading: boolean;
  reading: boolean;
  onPurchase: (paymentMethod: 'safepay' | 'bank' | 'jazzcash' | 'easypaisa') => Promise<void>;
  onReadTextBook: () => void;
  onDownloadPDF: () => void;
  onRateBook: () => void;
  isAuthenticated: boolean;
}

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

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  actionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  primaryButton: {
    position: 'relative',
    width: '100%',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    overflow: 'hidden',
    background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 50%, ${colors.navy} 100%)`,
    color: colors.navyForeground,
    boxShadow: `0 12px 24px -8px ${colors.navy}50`,
    border: 'none',
    borderRadius: '12px',
    padding: '0 24px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '16px',
    fontFamily: 'inherit',
  },
  shimmerEffect: {
    position: 'absolute',
    inset: 0,
    transform: 'translateX(-100%)',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
    transition: 'transform 1s ease',
  },
  buttonIconContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    background: `${colors.navyForeground}20`,
    padding: '10px',
  },
  buttonTextContainer: {
    textAlign: 'left' as const,
  },
  buttonTitle: {
    fontWeight: 700,
    fontSize: '18px',
    margin: 0,
  },
  buttonSubtitle: {
    fontSize: '14px',
    fontWeight: 500,
    opacity: 0.8,
    margin: 0,
    marginTop: '2px',
  },
  outlineButton: {
    position: 'relative',
    width: '100%',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: `2px solid ${colors.navy}30`,
    background: colors.background,
    color: colors.foreground,
    borderRadius: '12px',
    padding: '0 24px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '16px',
    fontFamily: 'inherit',
  },
  outlineButtonIconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    background: colors.navyMuted,
    padding: '10px',
    transition: 'all 0.3s ease',
  },
  downloadButton: {
    position: 'relative',
    width: '100%',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: `2px solid ${colors.success}30`,
    background: colors.successMuted,
    color: colors.success,
    borderRadius: '12px',
    padding: '0 24px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '16px',
    fontFamily: 'inherit',
  },
  downloadIconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    background: `${colors.success}15`,
    padding: '10px',
    transition: 'all 0.3s ease',
  },
  secondaryActionsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    paddingTop: '8px',
  },
  ghostButton: {
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    background: 'transparent',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '15px',
    fontWeight: 600,
    fontFamily: 'inherit',
    color: colors.foreground,
  },
};

const BookActions = ({
  book,
  hasPurchased,
  purchasing,
  purchaseCheckLoading,
  reading,
  onPurchase,
  onReadTextBook,
  onDownloadPDF,
  onRateBook,
  isAuthenticated
}: BookActionsProps) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const formatCurrency = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      return `${currency} ${amount.toFixed(2)}`;
    }
  };

  const calculateDiscountedPrice = () => {
    if (book.discountPercentage && book.discountPercentage > 0) {
      return book.price * (1 - book.discountPercentage / 100);
    }
    return book.price;
  };

  const discountedPrice = calculateDiscountedPrice();

  const handleDirectPurchase = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase');
      return;
    }
    await onPurchase('safepay');
  };

  return (
    <div style={styles.container}>
      {/* Action Buttons Group */}
      <div style={styles.actionsContainer}>
        {/* Free Text Reading Button */}
        <button 
          style={{
            ...styles.primaryButton,
            transform: hoveredButton === 'read' ? 'scale(1.02)' : 'scale(1)',
            boxShadow: hoveredButton === 'read' 
              ? `0 16px 32px -8px ${colors.navy}60` 
              : `0 12px 24px -8px ${colors.navy}50`,
          }}
          onClick={onReadTextBook}
          disabled={reading}
          onMouseEnter={() => setHoveredButton('read')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          <div 
            style={{
              ...styles.shimmerEffect,
              transform: hoveredButton === 'read' ? 'translateX(100%)' : 'translateX(-100%)',
            }}
          ></div>
          
          {reading ? (
            <>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontWeight: 700, fontSize: '18px' }}>Opening Reader...</span>
            </>
          ) : (
            <>
              <div style={styles.buttonIconContainer}>
                <BookOpen size={24} />
              </div>
              <div style={styles.buttonTextContainer}>
                <p style={styles.buttonTitle}>Read Free Text</p>
                <p style={styles.buttonSubtitle}>Instant access • No purchase required</p>
              </div>
            </>
          )}
        </button>

        {/* Purchase PDF Button */}
        {!hasPurchased && (
          <button 
            style={{
              ...styles.outlineButton,
              borderColor: hoveredButton === 'purchase' ? colors.navy : `${colors.navy}30`,
              background: hoveredButton === 'purchase' ? colors.navyMuted : colors.background,
              boxShadow: hoveredButton === 'purchase' ? '0 8px 24px -8px rgba(0,0,0,0.15)' : 'none',
            }}
            onClick={handleDirectPurchase}
            disabled={purchasing || purchaseCheckLoading}
            onMouseEnter={() => setHoveredButton('purchase')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <div style={{
              ...styles.outlineButtonIconContainer,
              background: hoveredButton === 'purchase' ? colors.navy : colors.navyMuted,
            }}>
              {purchasing ? (
                <Loader2 size={24} color={hoveredButton === 'purchase' ? colors.navyForeground : colors.navy} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <ShoppingCart size={24} color={hoveredButton === 'purchase' ? colors.navyForeground : colors.navy} />
              )}
            </div>
            <div style={styles.buttonTextContainer}>
              <p style={styles.buttonTitle}>
                {purchasing ? 'Processing Purchase...' : 'Buy PDF Version'}
              </p>
              <p style={{ ...styles.buttonSubtitle, color: colors.muted }}>
                {formatCurrency(discountedPrice, book.currency || 'PKR')} • One-time payment
              </p>
            </div>
          </button>
        )}

        {/* Download PDF Button (if already purchased) */}
        {hasPurchased && (
          <button 
            style={{
              ...styles.downloadButton,
              borderColor: hoveredButton === 'download' ? colors.success : `${colors.success}30`,
              background: hoveredButton === 'download' ? colors.success : colors.successMuted,
              color: hoveredButton === 'download' ? colors.successForeground : colors.success,
              boxShadow: hoveredButton === 'download' ? '0 8px 24px -8px rgba(0,0,0,0.15)' : 'none',
            }}
            onClick={onDownloadPDF}
            onMouseEnter={() => setHoveredButton('download')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <div style={{
              ...styles.downloadIconContainer,
              background: hoveredButton === 'download' ? `${colors.successForeground}20` : `${colors.success}15`,
            }}>
              <Download size={24} />
            </div>
            <div style={styles.buttonTextContainer}>
              <p style={styles.buttonTitle}>Download PDF</p>
              <p style={{ ...styles.buttonSubtitle, opacity: 0.8 }}>
                Already purchased • Available offline
              </p>
            </div>
          </button>
        )}

        {/* Secondary Actions */}
        <div style={styles.secondaryActionsRow}>
          <button 
            style={{
              ...styles.ghostButton,
              background: hoveredButton === 'rate' ? colors.goldMuted : 'transparent',
              color: hoveredButton === 'rate' ? colors.gold : colors.foreground,
            }}
            onClick={onRateBook}
            onMouseEnter={() => setHoveredButton('rate')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <Star size={20} fill={colors.gold} color={colors.gold} />
            <span>Rate Book</span>
          </button>

          <button 
            style={{
              ...styles.ghostButton,
              background: hoveredButton === 'wishlist' ? '#fef2f2' : 'transparent',
              color: hoveredButton === 'wishlist' ? '#dc2626' : colors.foreground,
            }}
            onMouseEnter={() => setHoveredButton('wishlist')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <Heart size={20} />
            <span>Wishlist</span>
          </button>
        </div>
      </div>

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BookActions;