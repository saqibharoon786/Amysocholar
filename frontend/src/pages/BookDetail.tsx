// pages/BookDetail.tsx - Simplified version
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookService, Book, BookPreview } from "@/services/bookService";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, BookOpen, FileText, Eye, Star } from "lucide-react";
import { toast } from "sonner";
import { PaymentService } from '@/services/paymentService';

// Import components
import BookGallery from "@/components/book/BookGallery";
import BookActions from "@/components/book/BookActions";
import BookDetailsTab from "@/components/book/BookDetailsTab";
import BookDescriptionTab from "@/components/book/BookDescriptionTab";
import BookPreviewTab from "@/components/book/BookPreviewTab";
import BookReviewsTab from "@/components/book/BookReviewsTab";
import BookStats from "@/components/book/BookStats";
import LightboxModal from "@/components/book/LightboxModal";
import RatingModal from "@/components/book/RatingModal";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [bookPreview, setBookPreview] = useState<BookPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [reading, setReading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseCheckLoading, setPurchaseCheckLoading] = useState(false);
  
  // Image gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  
  // Rating state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (id) {
      fetchBook(id);
      fetchBookPreview(id);
      if (isAuthenticated) {
        checkPurchaseStatus(id);
      }
    }
  }, [id, isAuthenticated]);

  const fetchBook = async (bookId: string) => {
    try {
      setLoading(true);
      const response = await BookService.getBookById(bookId);
      if (response.success && response.data) {
        setBook(response.data.book);
        // Increment view count
        await BookService.incrementViewCount(bookId);
      } else {
        toast.error(response.message || 'Failed to load book details');
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      toast.error('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookPreview = async (bookId: string) => {
    try {
      const response = await BookService.getBookPreview(bookId);
      if (response.success && response.data) {
        setBookPreview(response.data);
      }
    } catch (error) {
      console.error('Error fetching book preview:', error);
    }
  };

  const checkPurchaseStatus = async (bookId: string) => {
    try {
      setPurchaseCheckLoading(true);
      const response = await BookService.checkPurchaseStatus(bookId);
      if (response.success && response.data) {
        setHasPurchased(response.data.hasPurchased);
      }
    } catch (error) {
      console.error('Error checking purchase status:', error);
    } finally {
      setPurchaseCheckLoading(false);
    }
  };

const handlePurchase = async (paymentMethod: 'safepay' | 'bank' | 'jazzcash' | 'easypaisa' = 'safepay') => {
  if (!isAuthenticated) {
    navigate('/auth');
    return;
  }

  if (!book) {
    toast.error('Book information not available');
    return;
  }

  try {
    setPurchasing(true);
    const response = await BookService.purchaseBook(book._id, {
      format: 'pdf',
      paymentMethod: paymentMethod
    });
    
    if (response.success) {
      if (paymentMethod === 'safepay' && response.data?.paymentUrl) {
        // Redirect to SafePay payment page
        window.location.href = response.data.paymentUrl;
      } else if (paymentMethod === 'bank') {
        toast.success('Purchase initiated! Complete bank transfer to get access.');
        // You can show bank details modal here
        // showBankDetailsModal();
      } else {
        toast.success('Purchase initiated successfully!');
        setHasPurchased(true);
      }
    } else {
      toast.error(response.message || 'Failed to purchase book');
    }
  } catch (error) {
    console.error('Error purchasing book:', error);
    toast.error('Failed to purchase book');
  } finally {
    setPurchasing(false);
  }
};

  const handleReadTextBook = async () => {
    if (!book) {
      toast.error('Book information not available');
      return;
    }
  console.log('=== handleReadTextBook START ===');
  console.log('Book ID:', book?._id);
  console.log('Is Authenticated:', isAuthenticated);
    try {
      setReading(true);
      const response = await BookService.readFullBook(book._id, 'text');
      if (response.success && response.data) {
        navigate(`/book/${book._id}/read?format=text`);
      } else {
        toast.error(response.message || 'Failed to open book for reading');
      }
    } catch (error) {
      console.error('Error reading book:', error);
      toast.error('Failed to open book for reading');
    } finally {
      setReading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!book) {
      toast.error('Book information not available');
      return;
    }

    if (!hasPurchased) {
      toast.error('Please purchase the book to download PDF');
      return;
    }

    try {
      const response = await BookService.readFullBook(book._id, 'pdf');
      if (response.success && response.data?.filePath) {
        const downloadUrl = `${import.meta.env.VITE_API_URL || ''}${response.data.filePath}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${book.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('PDF download started');
      } else {
        toast.error(response.message || 'Failed to download PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleRatingSubmit = async (rating: number, comment: string) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!book) {
      toast.error('Book information not available');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setSubmittingRating(true);
      const response = await BookService.updateBookRating(book._id, rating);
      if (response.success) {
        toast.success('Thank you for your rating!');
        setShowRatingModal(false);
        // Refresh book data to update rating
        fetchBook(book._id);
      } else {
        toast.error(response.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const calculateDiscountedPrice = () => {
    if (!book) return 0;
    if (book.discountPercentage && book.discountPercentage > 0) {
      return book.price * (1 - book.discountPercentage / 100);
    }
    return book.price;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading book details...</span>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Book not found</h2>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const discountedPrice = calculateDiscountedPrice();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 py-8">
      <div className="container mx-auto px-4">
        {/* Main Book Title and Author */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            {book.title}
          </h1>
          <div className="text-xl text-muted-foreground">
            by {book.author}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Book Cover Gallery and Actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-2 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-6">
                {/* Book Cover Gallery */}
                <div className="relative mb-6">
                  <BookGallery
                    images={book.coverImages || []}
                    title={book.title}
                    discountPercentage={book.discountPercentage}
                    bestseller={book.bestseller}
                    newRelease={book.newRelease}
                    featured={book.featured}
                    selectedImageIndex={selectedImageIndex}
                    onImageSelect={setSelectedImageIndex}
                    onLightboxOpen={() => setShowLightbox(true)}
                  />
                </div>

                {/* Action Buttons */}
                <BookActions
                  book={{
                    _id: book._id,
                    title: book.title,
                    price: book.price,
                    currency: book.currency || 'PKR',
                    discountPercentage: book.discountPercentage
                  }}
                  hasPurchased={hasPurchased}
                  purchasing={purchasing}
                  purchaseCheckLoading={purchaseCheckLoading}
                  reading={reading}
                  onPurchase={handlePurchase}
                  onReadTextBook={handleReadTextBook}
                  onDownloadPDF={handleDownloadPDF}
                  onRateBook={() => setShowRatingModal(true)}
                  isAuthenticated={isAuthenticated}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Book Details */}
          <div className="lg:col-span-2">
            <Card className="border-2 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent>
                {/* Colorful and Attractive Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4 gap-2 p-2 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-2xl shadow-inner">
                    <TabsTrigger 
                      value="details" 
                      className="relative group data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md text-blue-700 hover:text-blue-800"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span className="font-semibold">Details</span>
                      </div>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 group-data-[state=active]:w-3/4 h-1 bg-blue-300 rounded-full transition-all duration-300"></div>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="description"
                      className="relative group data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md text-purple-700 hover:text-purple-800"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="font-semibold">Description</span>
                      </div>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 group-data-[state=active]:w-3/4 h-1 bg-purple-300 rounded-full transition-all duration-300"></div>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="preview"
                      className="relative group data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md text-green-700 hover:text-green-800"
                    >
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span className="font-semibold">Preview</span>
                      </div>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 group-data-[state=active]:w-3/4 h-1 bg-green-300 rounded-full transition-all duration-300"></div>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="reviews"
                      className="relative group data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md text-amber-700 hover:text-amber-800"
                    >
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        <span className="font-semibold">Reviews</span>
                      </div>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 group-data-[state=active]:w-3/4 h-1 bg-amber-300 rounded-full transition-all duration-300"></div>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="animate-fadeIn">
                    <BookDetailsTab book={book} />
                  </TabsContent>

                  <TabsContent value="description" className="animate-fadeIn">
                    <BookDescriptionTab 
                      description={book.description}
                      authorBio={book.authorBio}
                    />
                  </TabsContent>

                  <TabsContent value="preview" className="animate-fadeIn">
                    <BookPreviewTab
                      book={book}
                      bookPreview={bookPreview}
                      isAuthenticated={isAuthenticated}
                      purchasing={purchasing}
                      hasPurchased={hasPurchased}
                      onPurchase={handlePurchase}
                      onReadTextBook={handleReadTextBook}
                    />
                  </TabsContent>

                  <TabsContent value="reviews" className="animate-fadeIn">
                    <BookReviewsTab
                      averageRating={book.averageRating || 0}
                      reviewCount={book.reviewCount || 0}
                      onShowRatingModal={() => setShowRatingModal(true)}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <BookStats
              viewCount={book.viewCount || 0}
              downloadCount={book.downloadCount || 0}
              purchaseCount={book.purchaseCount || 0}
              createdAt={book.createdAt}
              discountedPrice={discountedPrice}
              currency={book.currency || 'PKR'}
              hasPurchased={hasPurchased}
            />
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <LightboxModal
        isOpen={showLightbox}
        images={book.coverImages || []}
        title={book.title}
        selectedImageIndex={selectedImageIndex}
        onClose={() => setShowLightbox(false)}
        onNextImage={() => setSelectedImageIndex((prev) => 
          prev === (book.coverImages?.filter(img => img && img.trim() !== '').length || 1) - 1 ? 0 : prev + 1
        )}
        onPrevImage={() => setSelectedImageIndex((prev) => 
          prev === 0 ? (book.coverImages?.filter(img => img && img.trim() !== '').length || 1) - 1 : prev - 1
        )}
        onSelectImage={setSelectedImageIndex}
      />

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        isSubmitting={submittingRating}
      />

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BookDetail;