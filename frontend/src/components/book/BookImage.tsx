// components/book/BookImage.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

interface BookImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onClick?: () => void;
  showNavigation?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  isActive?: boolean;
}

const BookImage = ({ 
  src, 
  alt, 
  className = "", 
  fallbackSrc = "/placeholder-book.png",
  onClick,
  showNavigation,
  onNext,
  onPrev,
  isActive = false
}: BookImageProps) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    setHasError(false);
    setIsLoading(false);
  };

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setHasError(false);
    setIsLoading(true);
  }, [src, fallbackSrc]);

  return (
    <div className={`relative overflow-hidden rounded-xl shadow-lg ${className}`}>
      {/* Loading skeleton */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-gray-400" />
        </div>
      )}
      
      {/* Image */}
      <img
        src={imgSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${onClick ? 'cursor-pointer' : ''}`}
        onError={handleError}
        onLoad={handleLoad}
        crossOrigin="anonymous"
        loading="lazy"
        onClick={onClick}
      />
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
          <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
          <span className="text-sm text-gray-500 text-center">Image not available</span>
        </div>
      )}
      
      {/* Navigation arrows - Always visible for active images */}
      {showNavigation && onPrev && onNext && !hasError && !isLoading && (
        <>
          <Button
            size="icon"
            variant="secondary"
            className="absolute left-2 top-1/2 -translate-y-1/2 opacity-100 transition-opacity backdrop-blur-sm bg-white/80 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-100 transition-opacity backdrop-blur-sm bg-white/80 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}
      
      {/* Active indicator */}
      {isActive && !hasError && (
        <div className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none" />
      )}
    </div>
  );
};

export default BookImage;