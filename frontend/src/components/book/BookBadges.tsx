// components/book/BookBadges.tsx
import { Badge } from "@/components/ui/badge";

interface BookBadgesProps {
  discountPercentage?: number;
  bestseller?: boolean;
  newRelease?: boolean;
  featured?: boolean;
}

export const BookBadges = ({
  discountPercentage,
  bestseller,
  newRelease,
  featured
}: BookBadgesProps) => {
  return (
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
  );
};