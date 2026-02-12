// components/book/BookReviewsTab.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface BookReviewsTabProps {
  averageRating: number;
  reviewCount: number;
  onShowRatingModal: () => void;
}

const BookReviewsTab = ({ 
  averageRating, 
  reviewCount, 
  onShowRatingModal 
}: BookReviewsTabProps) => {
  return (
    <Card className="border-2 border-blue-200/50">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Rating Summary */}
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 mb-4">
              <span className="text-3xl font-bold text-blue-800">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-center mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= Math.floor(averageRating || 0)
                      ? "text-blue-500 fill-current"
                      : "text-blue-200"
                  }`}
                />
              ))}
            </div>
            <h3 className="text-xl font-semibold mb-2 text-blue-900">Customer Reviews</h3>
            <p className="text-blue-700 mb-6 max-w-md mx-auto">
              This book has an average rating of {averageRating.toFixed(1)} 
              from {reviewCount} reviews.
            </p>
            <div className="flex gap-3 justify-center">
              {/* Primary Navy Blue Button */}
              <Button 
                onClick={onShowRatingModal}
                className="bg-blue-700 hover:bg-blue-800 text-white shadow-lg hover:shadow-blue-500/30 transition-all border-0"
              >
                <Star className="w-4 h-4 mr-2" />
                Add Your Review
              </Button>
              
              {/* Outline Navy Blue Button */}
              <Button 
                variant="outline"
                className="border-blue-600 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-700 transition-all"
              >
                Read All Reviews
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookReviewsTab;