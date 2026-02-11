// components/book/RatingModal.tsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Check, Loader2 } from "lucide-react";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  isSubmitting?: boolean;
}

const RatingModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false
}: RatingModalProps) => {
  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (userRating === 0) return;
    await onSubmit(userRating, ratingComment);
    setUserRating(0);
    setRatingComment("");
  };

  const handleClose = () => {
    setUserRating(0);
    setRatingComment("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md border-2 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            Rate this Book
          </CardTitle>
          <CardDescription>
            Share your experience with other readers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Star Rating */}
            <div className="flex justify-center gap-1 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transform hover:scale-125 transition-transform duration-200"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoverRating || userRating)
                        ? "text-yellow-400 fill-current drop-shadow-lg"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            
            {/* Rating Labels */}
            <div className="text-center text-sm text-muted-foreground">
              {userRating === 0 && "Select your rating"}
              {userRating === 1 && "Poor"}
              {userRating === 2 && "Fair"}
              {userRating === 3 && "Good"}
              {userRating === 4 && "Very Good"}
              {userRating === 5 && "Excellent"}
            </div>
            
            {/* Comment Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Optional Comment</label>
              <Textarea
                placeholder="Share your thoughts about this book..."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
        <CardContent className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={userRating === 0 || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Submit Rating
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RatingModal;