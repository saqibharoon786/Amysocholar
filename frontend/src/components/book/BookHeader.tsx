// components/book/BookHeader.tsx
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, Star, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

// NAVY BLUE COLOR SCHEME from BookActions
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

interface BookHeaderProps {
  title: string;
  author: string;
  viewCount: number;
  averageRating: number;
  reviewCount: number;
  authorBio?: string;
  showRatingModal: boolean;
  hoverRating: number;
  onShowRatingModal: () => void;
  onHoverRating: (rating: number) => void;
}

const BookHeader = ({
  title,
  author,
  viewCount,
  averageRating,
  reviewCount,
  authorBio,
  showRatingModal,
  hoverRating,
  onShowRatingModal,
  onHoverRating
}: BookHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      {/* Back Button with Navy Blue Style */}
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="gap-2 self-start transition-colors"
        style={{ 
          backgroundColor: colors.navyMuted,
          color: colors.navy,
          borderColor: colors.navyLight,
          borderWidth: '1px',
          borderRadius: '8px',
          padding: '8px 16px',
        }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Browse
      </Button>
      
      {/* Stats Badges */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full" 
          style={{ 
            color: colors.navy,
            backgroundColor: colors.navyMuted,
            border: `1px solid ${colors.navyLight}`,
          }}>
          <Eye className="w-4 h-4" style={{ color: colors.navy }} />
          <span>{viewCount.toLocaleString()} views</span>
        </div>
        <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full"
          style={{ 
            background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
            color: colors.navyForeground,
            boxShadow: `0 4px 12px ${colors.navy}20`,
          }}>
          <Star className="w-4 h-4" />
          <span>
            {averageRating.toFixed(1)} 
            <span style={{ color: `${colors.navyForeground}90`, marginLeft: '4px' }}>
              ({reviewCount} reviews)
            </span>
          </span>
        </div>
      </div>

      {/* Title and Author - For Main Card */}
      <div className="space-y-6 w-full mt-6">
        {/* Gradient Title */}
        <div className="relative">
          <CardTitle className="text-4xl md:text-5xl font-bold pb-2"
            style={{ 
              background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 50%, ${colors.navy} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
            {title}
          </CardTitle>
          <div className="absolute bottom-0 left-0 w-full h-0.5 rounded-full"
            style={{ 
              background: `linear-gradient(90deg, ${colors.navy} 0%, ${colors.navyLight} 50%, ${colors.navy} 100%)`,
            }}></div>
        </div>
        
        {/* Author Section */}
        <CardDescription className="text-xl">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.navyMuted} 0%, ${colors.background} 100%)`,
                  border: `1px solid ${colors.navyLight}`,
                  boxShadow: `0 4px 12px ${colors.navy}10`,
                }}>
                <User className="w-6 h-6" style={{ color: colors.navy }} />
              </div>
              <div>
                <span className="font-semibold" style={{ color: colors.navy }}>by {author}</span>
                {authorBio && (
                  <span className="text-sm italic ml-3" style={{ color: colors.navyLight }}>
                    · Author Biography Available
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardDescription>
        
        {/* Rating Section with Stylish Navy Blue Gradient */}
        <div className="flex items-center gap-6 flex-wrap pt-4">
          <div className="p-4 rounded-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${colors.navyMuted} 0%, ${colors.background} 100%)`,
              border: `1px solid ${colors.navyLight}`,
              boxShadow: `0 8px 32px ${colors.navy}10`,
            }}>
            <div className="flex items-center gap-6">
              {/* Stars Rating */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={onShowRatingModal}
                        onMouseEnter={() => onHoverRating(star)}
                        onMouseLeave={() => onHoverRating(0)}
                        className="focus:outline-none transform hover:scale-110 transition-transform"
                      >
                        <Star
                          className="w-8 h-8 drop-shadow-lg"
                          style={{ 
                            color: star <= (hoverRating || Math.floor(averageRating || 0))
                              ? colors.gold
                              : colors.navyLight,
                            fill: star <= (hoverRating || Math.floor(averageRating || 0))
                              ? colors.gold
                              : 'none',
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Rating Number in Navy Blue Circle */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
                    }}>
                    <span className="text-2xl font-bold" style={{ color: colors.navyForeground }}>
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.navy }}>
                    <Star className="w-4 h-4" style={{ color: colors.navyForeground }} />
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-2xl font-bold" style={{ color: colors.navy }}>
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm" style={{ color: colors.navyLight }}>
                    from {reviewCount} reviews
                  </span>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={onShowRatingModal}
                    className="gap-2 mt-3 border-0 transition-all shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
                      color: colors.navyForeground,
                      boxShadow: `0 4px 16px ${colors.navy}30`,
                    }}
                  >
                    <Star className="w-4 h-4" />
                    Add Your Rating
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookHeader;