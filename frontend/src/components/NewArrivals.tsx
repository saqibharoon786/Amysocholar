// components/NewArrivals.tsx
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookService, Book, PopularCategory } from "@/services/bookService";
import { Loader2, BookOpen, Sparkles } from "lucide-react";

// ENHANCED NAVY BLUE COLOR SCHEME
const colors = {
  navy: '#0f1a2e',
  navyLight: '#1a2a4a',
  navyLighter: '#2d4270',
  navyMuted: '#e8edf5',
  navyForeground: '#f8fafc',
  white: '#ffffff',
  gold: '#d4a418',
  borderLight: '#e2e8f0',
  borderDark: '#1a2a4a',
  success: '#166534',
  warning: '#d97706',
  muted: '#64748b',
  background: '#f8fafc',
  foreground: '#1e293b',
};

const NewArrivals = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<PopularCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [hoveredBook, setHoveredBook] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNewReleases();
    fetchCategories();
  }, []);

  const fetchNewReleases = async () => {
    try {
      setLoading(true);
      const response = await BookService.getNewReleases(8);

      if (response?.success && response?.data?.books) {
        setBooks(response.data.books);
      }
    } catch (error) {
      console.error("Error fetching new releases:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await BookService.getPopularCategories();
      if (response?.success && Array.isArray(response?.data)) {
        setCategories(response.data.slice(0, 4));
      } else {
        setCategories([
          { _id: "fiction", name: "Fiction", bookCount: 0, totalViews: 0 },
          { _id: "non-fiction", name: "Non-Fiction", bookCount: 0, totalViews: 0 },
          { _id: "science", name: "Science", bookCount: 0, totalViews: 0 },
          { _id: "technology", name: "Technology", bookCount: 0, totalViews: 0 }
        ]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchBooksByCategory = async (category: string) => {
    try {
      setLoading(true);
      const response = await BookService.getBooksByCategory(category, 1, 8);
      if (response?.success && response?.data?.books) {
        setBooks(response.data.books);
      }
    } catch (error) {
      console.error("Error fetching books by category:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "all") {
      fetchNewReleases();
    } else {
      fetchBooksByCategory(tab);
    }
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    book: Book
  ) => {
    e.currentTarget.src = "placeholder-book.png";
    e.currentTarget.alt = "Placeholder book cover";
  };

  const getCurrentImage = (book: Book) => {
    return book.coverImages?.[0] || "/placeholder-book.png";
  };

  const getImageAlt = (book: Book) => {
    return book.title || "Book Cover";
  };

  if (loading || categoriesLoading) {
    return (
      <section className="py-16 relative overflow-hidden" style={{ 
        backgroundColor: colors.background,
        backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #e8edf5 100%)'
      }}>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 animate-pulse"
            style={{ 
              backgroundColor: colors.white,
              border: `4px solid ${colors.navy}`,
              boxShadow: `0 10px 30px ${colors.navy}20`
            }}>
            <BookOpen className="h-14 w-14" style={{ color: colors.navy }} />
          </div>
          <h2 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 bg-clip-text text-transparent">
            NEW ARRIVALS
          </h2>
          <Loader2 className="h-12 w-12 animate-spin mx-auto mt-8" style={{ color: colors.navy }} />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 relative overflow-hidden" style={{ 
      backgroundColor: colors.background,
      backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)'
    }}>
      <div className="container mx-auto px-4 relative z-10">
        {/* HEADER SECTION - EXACTLY LIKE YOUR DESIGN */}
        <div className="text-center mb-12">
          {/* FRESH OFF THE PRESS Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full mb-6 animate-float"
            style={{ 
              backgroundColor: colors.navyMuted,
              border: `2px solid ${colors.navyLight}`,
              boxShadow: `0 4px 20px ${colors.navy}15`
            }}>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full animate-pulse" 
                style={{ backgroundColor: colors.gold, marginRight: '6px' }}></div>
              <span className="text-sm font-bold uppercase tracking-widest" 
                style={{ color: colors.navy, letterSpacing: '2px' }}>
                FRESH OFF THE PRESS
              </span>
              <div className="w-2 h-2 rounded-full animate-pulse ml-2" 
                style={{ backgroundColor: colors.gold }}></div>
            </div>
          </div>
          
          {/* Animated Book Icon */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-full animate-ping-slow" 
              style={{ 
                backgroundColor: colors.navyMuted,
                opacity: 0.6 
              }}></div>
            <div className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform duration-500 animate-float"
              style={{ 
                backgroundColor: colors.white,
                border: `3px solid ${colors.navy}`,
                boxShadow: `0 10px 40px ${colors.navy}20`
              }}>
              <BookOpen className="h-10 w-10 animate-book-bounce" style={{ color: colors.navy }} />
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center animate-spin-slow"
                style={{ backgroundColor: colors.gold }}>
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          
          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight"
            style={{ 
              background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLighter} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.5px'
            }}>
            New Arrivals
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8 animate-fade-in-up"
            style={{ color: colors.navyLighter }}>
            Discover our handpicked selection of the latest literary treasures
          </p>
          
          {/* Decorative Line */}
          <div className="w-24 h-1 mx-auto rounded-full mb-8"
            style={{ 
              background: `linear-gradient(90deg, transparent, ${colors.navy}, transparent)`,
              opacity: 0.5
            }}></div>
        </div>

        {/* ROUNDED TABS */}
        <div className="flex justify-center gap-2 mb-12 flex-wrap">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            onClick={() => handleTabChange("all")}
            size="lg"
            className="relative overflow-hidden transition-all duration-300 font-medium rounded-full"
            style={activeTab === "all" ? {
              backgroundColor: colors.navy,
              color: colors.white,
              borderColor: colors.navy,
              boxShadow: `0 6px 20px ${colors.navy}40`,
              padding: '10px 28px',
              fontSize: '1rem',
              borderRadius: '9999px',
            } : {
              borderColor: colors.navy,
              color: colors.navy,
              backgroundColor: 'transparent',
              padding: '10px 28px',
              fontSize: '1rem',
              borderRadius: '9999px',
              borderWidth: '2px',
              fontWeight: '500'
            }}
          >
            All
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category._id}
              variant={activeTab === category._id ? "default" : "outline"}
              onClick={() => handleTabChange(category._id)}
              size="lg"
              className="relative overflow-hidden transition-all duration-300 font-medium rounded-full"
              style={activeTab === category._id ? {
                backgroundColor: colors.navy,
                color: colors.white,
                borderColor: colors.navy,
                boxShadow: `0 6px 20px ${colors.navy}40`,
                padding: '10px 28px',
                fontSize: '1rem',
                borderRadius: '9999px',
              } : {
                borderColor: colors.navy,
                color: colors.navy,
                backgroundColor: 'transparent',
                padding: '10px 28px',
                fontSize: '1rem',
                borderRadius: '9999px',
                borderWidth: '2px',
                fontWeight: '500'
              }}
            >
              {category.name || category._id.charAt(0).toUpperCase() + category._id.slice(1)}
            </Button>
          ))}
        </div>

        {/* BOOK CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {books.map((book, index) => (
            <div
              key={book._id}
              className="group relative cursor-pointer rounded-2xl transition-all duration-300 transform hover:-translate-y-2"
              onClick={() => navigate(`/book/${book._id}`)}
              onMouseEnter={() => setHoveredBook(book._id)}
              onMouseLeave={() => setHoveredBook(null)}
              style={{ 
                backgroundColor: colors.white,
                border: `2px solid ${colors.borderLight}`,
                boxShadow: hoveredBook === book._id 
                  ? `0 15px 40px ${colors.navy}20`
                  : `0 5px 20px ${colors.navy}10`,
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                height: '420px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                width: '100%',
                maxWidth: '320px',
                margin: '0 auto',
              }}
            >
              <div className="relative flex-shrink-0" style={{ height: '250px' }}>
                {book.newRelease && (
                  <Badge className="absolute top-3 right-3 z-10 px-3 py-1"
                    style={{ 
                      backgroundColor: colors.navy,
                      color: colors.white,
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      borderRadius: '9999px',
                    }}>
                    NEW
                  </Badge>
                )}

                <div className="w-full h-full overflow-hidden">
                  <img
                    src={getCurrentImage(book)}
                    alt={getImageAlt(book)}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                      borderRadius: '14px 14px 0 0',
                    }}
                    onError={(e) => handleImageError(e, book)}
                    crossOrigin="anonymous"
                    loading="lazy"
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"></div>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <div className="mb-3">
                  <p className="text-xs uppercase tracking-widest font-medium mb-2" 
                    style={{ color: colors.navyLighter, letterSpacing: '1px' }}>
                    {book.author || "Unknown Author"}
                  </p>
                  
                  <h3 className="font-bold text-base mb-3 line-clamp-2 leading-snug"
                    style={{ color: colors.navy, minHeight: '40px' }}>
                    {book.title || "Untitled"}
                  </h3>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg" style={{ color: colors.navy }}>
                      {book.currency || "$"}{" "}
                      {(book.discountedPrice ?? book.price ?? 0).toFixed(2)}
                    </span>
                    {book.discountedPrice &&
                      book.discountedPrice < book.price && (
                        <span className="text-sm line-through px-2 py-1 rounded" 
                          style={{ 
                            color: colors.muted,
                            backgroundColor: `${colors.muted}10`,
                          }}>
                          {book.currency || "$"}{" "}
                          {(book.price ?? 0).toFixed(2)}
                        </span>
                      )}
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-transparent group-hover:bg-blue-600 transition-all duration-300"></div>
            </div>
          ))}
        </div>

        {books.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
              style={{ 
                backgroundColor: colors.navyMuted, 
                border: `2px dashed ${colors.navyLight}`,
              }}>
              <BookOpen className="h-10 w-10" style={{ color: colors.navyLight }} />
            </div>
            <p className="text-xl mb-4" style={{ color: colors.navyLight }}>
              No books found in this category.
            </p>
            <Button
              variant="outline"
              size="lg"
              className="mt-4 px-8 py-3 rounded-full"
              onClick={() => handleTabChange("all")}
              style={{ 
                borderColor: colors.navy, 
                color: colors.navy,
                backgroundColor: 'transparent',
                borderWidth: '2px',
                fontWeight: '500'
              }}
            >
              View All Books
            </Button>
          </div>
        )}
      </div>

      {/* CSS ANIMATIONS */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes book-bounce {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-3deg);
          }
          75% {
            transform: rotate(3deg);
          }
        }
        
        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.2);
            opacity: 0;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-book-bounce {
          animation: book-bounce 2s ease-in-out infinite;
        }
        
        .animate-ping-slow {
          animation: ping-slow 3s ease-out infinite;
        }
        
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        
        .animate-fade-in {
          animation: fadeInUp 0.8s ease-out;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .grid-cols-1 {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }
        }
        
        @media (min-width: 641px) and (max-width: 1024px) {
          .sm\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        
        @media (min-width: 1025px) {
          .lg\\:grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
        
        .group {
          transition: all 0.3s ease;
        }
        
        .group:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 40px rgba(15, 26, 46, 0.2) !important;
        }
      `}</style>
    </section>
  );
};

export default NewArrivals;