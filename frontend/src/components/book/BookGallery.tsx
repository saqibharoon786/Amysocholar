// components/book/BookGallery.tsx
import { useState } from "react";
import BookImage from "./BookImage";
import { Badge } from "@/components/ui/badge";

interface BookGalleryProps {
  images: string[];
  title: string;
  discountPercentage?: number;
  bestseller?: boolean;
  newRelease?: boolean;
  featured?: boolean;
  selectedImageIndex: number;
  onImageSelect: (index: number) => void;
  onLightboxOpen: () => void;
}

const BookGallery = ({
  images,
  title,
  discountPercentage,
  bestseller,
  newRelease,
  featured,
  selectedImageIndex,
  onImageSelect,
  onLightboxOpen
}: BookGalleryProps) => {
  const validImages = images.filter(img => img && img.trim() !== '');
  const hasMultipleImages = validImages.length > 1;

  if (validImages.length === 0) {
    return (
      <div className="relative">
        <div className="aspect-[3/4] mb-4">
          <BookImage
            src="/placeholder-book.png"
            alt={`${title} - Cover`}
            className="w-full h-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Image */}
      <div className="aspect-[3/4] mb-4">
        <BookImage
          src={validImages[selectedImageIndex]}
          alt={`${title} - Cover ${selectedImageIndex + 1}`}
          className="w-full h-full"
          onClick={onLightboxOpen}
          showNavigation={hasMultipleImages}
          onNext={() => onImageSelect((selectedImageIndex + 1) % validImages.length)}
          onPrev={() => onImageSelect((selectedImageIndex - 1 + validImages.length) % validImages.length)}
        />
      </div>

      {/* Image Counter */}
      {hasMultipleImages && (
        <div className="text-center mb-4 text-sm text-muted-foreground">
          Image {selectedImageIndex + 1} of {validImages.length}
        </div>
      )}

      {/* Thumbnail Gallery */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {validImages.map((image, index) => (
            <button
              key={index}
              className="relative flex-shrink-0 w-16 h-20 focus:outline-none group"
              onClick={() => onImageSelect(index)}
            >
              <BookImage
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full rounded-lg"
                isActive={selectedImageIndex === index}
              />
              {selectedImageIndex === index && (
                <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
        {discountPercentage && discountPercentage > 0 && (
          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse">
            {discountPercentage}% OFF
          </Badge>
        )}
        {bestseller && (
          <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            BESTSELLER
          </Badge>
        )}
        {newRelease && (
          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            NEW
          </Badge>
        )}
        {featured && (
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            FEATURED
          </Badge>
        )}
      </div>
    </div>
  );
};

export default BookGallery;