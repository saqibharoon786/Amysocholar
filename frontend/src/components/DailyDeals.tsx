// components/DailyDeals.tsx
import { Badge } from "./ui/badge";
import { useEffect, useState } from "react";
import { BookService, Book } from "@/services/bookService";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DailyDeals = () => {
  const [deals, setDeals] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBookId, setHoveredBookId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDailyDeals();
  }, []);

  const fetchDailyDeals = async () => {
    try {
      setLoading(true);
      const response = await BookService.getFeaturedBooks(4);
      if (response.success && response.data) {
        setDeals(response.data.books);
      }
    } catch (error) {
      console.error('Error fetching daily deals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, book: Book) => {
    console.error(`❌ Image failed to load for book "${book.title}":`, e.currentTarget.src);
    e.currentTarget.src = "/placeholder-book.png";
    e.currentTarget.alt = "Placeholder book cover";
  };

  // Get current image for a book based on hover state
  const getCurrentImage = (book: Book) => {
    const images = book.coverImages || [];

    // If book is hovered and has multiple images, show the second one
    if (hoveredBookId === book._id && images.length > 1) {
      return images[1];
    }

    // Otherwise show the first image, or placeholder if none
    return images[0] || "/placeholder-book.png";
  };

  // Get image alt text
  const getImageAlt = (book: Book) => {
    const images = book.coverImages || [];

    if (hoveredBookId === book._id && images.length > 1) {
      return `${book.title || "Book Cover"} - Alternate View`;
    }

    return book.title || "Book Cover";
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-3 text-foreground">Daily Deals</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-10"></div>
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading exclusive offers...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-3 text-foreground">Daily Deals</h2>
          <p className="text-muted-foreground text-lg mb-4 max-w-2xl mx-auto">
            Limited time offers on featured books
          </p>
          <div className="w-20 h-1 bg-primary mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {deals.map((deal) => (
            <div
              key={deal._id}
              className="group cursor-pointer bg-background rounded-xl border border-border overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              onClick={() => navigate(`/book/${deal._id}`)}
              onMouseEnter={() => setHoveredBookId(deal._id)}
              onMouseLeave={() => setHoveredBookId(null)}
            >
              <div className="relative overflow-hidden">
                {deal.bestseller && (
                  <Badge className="absolute top-3 left-3 z-10 bg-amber-500 text-foreground hover:bg-amber-600">
                    Bestseller
                  </Badge>
                )}
                {deal.discountedPrice && deal.price > deal.discountedPrice && (
                  <Badge className="absolute top-3 right-3 z-10 bg-red-500 hover:bg-red-600">
                    {Math.round(((deal.price - deal.discountedPrice) / deal.price) * 100)}% OFF
                  </Badge>
                )}

                {/* Cover image with hover effect - same logic as NewArrivals */}
                <img
                  src={getCurrentImage(deal)}
                  alt={getImageAlt(deal)}
                  className="w-full aspect-[3/4] object-cover transition-all duration-500 group-hover:scale-105"
                  onError={(e) => handleImageError(e, deal)}
                  crossOrigin="anonymous"
                  loading="lazy"
                />

                {/* Multiple images indicator - same as NewArrivals */}
                {deal.coverImages && deal.coverImages.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                    {hoveredBookId === deal._id ? "Back" : "More"}
                  </div>
                )}
              </div>

              <div className="p-5 text-center space-y-3">
                <p className="text-sm uppercase tracking-wide text-muted-foreground font-medium">
                  {deal.author || "Unknown Author"}
                </p>
                <h3 className="font-semibold text-foreground line-clamp-2 leading-tight min-h-[3.5rem] flex items-center justify-center">
                  {deal.title || "Untitled"}
                </h3>

                <div className="flex items-center justify-center gap-2">
                  <span className="font-bold text-primary text-lg">
                    {deal.currency || "$"} {(deal.discountedPrice ?? deal.price ?? 0).toFixed(2)}
                  </span>
                  {deal.discountedPrice && deal.discountedPrice < deal.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {deal.currency || "$"} {(deal.price ?? 0).toFixed(2)}
                    </span>
                  )}
                </div>

                {deal.category && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {deal.category}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {deals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">No daily deals available at the moment.</p>
            <p className="text-sm text-muted-foreground">Check back later for exclusive offers!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DailyDeals;