// components/book/LightboxModal.tsx
import { Button } from "@/components/ui/button";
import BookImage from "./BookImage";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxModalProps {
  isOpen: boolean;
  images: string[];
  title: string;
  selectedImageIndex: number;
  onClose: () => void;
  onNextImage: () => void;
  onPrevImage: () => void;
  onSelectImage: (index: number) => void;
}

const LightboxModal = ({
  isOpen,
  images,
  title,
  selectedImageIndex,
  onClose,
  onNextImage,
  onPrevImage,
  onSelectImage
}: LightboxModalProps) => {
  const validImages = images.filter(img => img && img.trim() !== '');
  const hasMultipleImages = validImages.length > 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh]">
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-4 top-4 z-10 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>
        
        {hasMultipleImages && (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={onPrevImage}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={onNextImage}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          </>
        )}
        
        <BookImage
          src={validImages[selectedImageIndex]}
          alt={`${title} - Full View`}
          className="w-full h-auto max-h-[80vh] object-contain"
        />
        
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {validImages.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  selectedImageIndex === index 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                onClick={() => onSelectImage(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LightboxModal;