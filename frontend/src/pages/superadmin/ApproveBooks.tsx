// ApproveBooks.tsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookService, Book } from "@/services/bookService";
import {
  Check,
  X,
  Eye,
  Loader2,
  Download,
  User,
  BookOpen,
  Clock,
  Filter,
  Image as ImageIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

// Types for better type safety
interface BookStats {
  pending: number;
  approved: number;
  rejected: number;
}

interface RejectDialogState {
  open: boolean;
  bookId?: string;
}

// Enhanced Image Component with better error handling
interface BookImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

const BookImage = ({ src, alt, className = "", fallbackSrc = "/placeholder-book.png" }: BookImageProps) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  const handleLoad = () => {
    setHasError(false);
  };

  return (
    <div className={`relative ${className}`}>
      <img
        src={imgSrc}
        alt={alt}
        className="w-full h-full object-cover rounded-lg"
        onError={handleError}
        onLoad={handleLoad}
        crossOrigin="anonymous"
        loading="lazy"
      />

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1f2e] rounded-lg">
          <ImageIcon className="h-6 w-6 text-[#4a5568]" />
        </div>
      )}
    </div>
  );
};

// Skeleton Loader Component
const BookSkeletonCard = () => (
  <div className="flex gap-4 items-start p-6 border border-[#2d3748] rounded-xl bg-[#1a1f2e] animate-pulse">
    <Skeleton className="w-24 h-32 rounded-lg bg-[#2d3748]" />
    <div className="flex-1 space-y-3">
      <Skeleton className="h-6 w-3/4 bg-[#2d3748]" />
      <Skeleton className="h-4 w-1/4 bg-[#2d3748]" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 bg-[#2d3748]" />
        <Skeleton className="h-6 w-12 bg-[#2d3748]" />
      </div>
      <Skeleton className="h-10 w-1/2 bg-[#2d3748]" />
    </div>
    <div className="w-28 flex flex-col gap-2">
      <Skeleton className="h-8 w-full bg-[#2d3748]" />
      <Skeleton className="h-8 w-full bg-[#2d3748]" />
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({
  title,
  value,
  icon,
  description,
  trend
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: string;
}) => (
  <Card className="rounded-xl border border-[#2d3748] bg-[#1a1f2e]">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#94a3b8]">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {description && (
            <p className="text-xs text-[#718096]">{description}</p>
          )}
          {trend && (
            <p className="text-xs text-green-400 font-medium">{trend}</p>
          )}
        </div>
        <div className="p-3 rounded-full bg-[#2d3748] text-blue-400">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    pending: {
      label: "Pending Review",
      variant: "secondary" as const,
      className: "bg-[#2d3748] text-[#ecc94b] border-[#4a5568]",
      icon: Clock,
    },
    approved: {
      label: "Approved",
      variant: "default" as const,
      className: "bg-[#2d3748] text-[#68d391] border-[#4a5568]",
      icon: Check,
    },
    rejected: {
      label: "Rejected",
      variant: "destructive" as const,
      className: "bg-[#2d3748] text-[#fc8181] border-[#4a5568]",
      icon: X,
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const IconComponent = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`gap-1.5 border ${config.className}`}
    >
      <IconComponent className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

// Utility functions
const formatCurrency = (price?: number, currency = "PKR") => {
  if (price === undefined || price === null) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price}`;
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Animation variants
const motionVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  },
};

const ApproveBooks = () => {
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [rejectDialog, setRejectDialog] = useState<RejectDialogState>({
    open: false
  });
  const [rejectReason, setRejectReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<BookStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Filter books based on search
  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;

    const query = searchQuery.toLowerCase();
    return books.filter(book =>
      book.title?.toLowerCase().includes(query) ||
      book.author?.toLowerCase().includes(query) ||
      book.category?.toLowerCase().includes(query) ||
      book.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [books, searchQuery]);

  // Fetch pending books
  const fetchPendingBooks = async () => {
    try {
      setLoading(true);
      const response = await BookService.getPendingBooks(1, 50);

      if (response.success && response.data?.books) {
        const booksWithImages = response.data.books.map(book => ({
          ...book,
          // Ensure coverImages is always an array
          coverImages: Array.isArray(book.coverImages) ? book.coverImages : [],
        }));

        setBooks(booksWithImages);
        setStats(prev => ({
          ...prev,
          pending: booksWithImages.length,
        }));
      } else {
        throw new Error(response.message || "Failed to fetch pending books");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch pending books",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBooks();
  }, []);

  // Book actions
  const openBookDetails = (book: Book) => {
    setSelectedBook(book);
    setViewOpen(true);
  };

  const handleApprove = async (bookId: string) => {
    setProcessing(bookId);
    try {
      const response = await BookService.approveBook(bookId);
      if (response.success) {
        toast({
          title: "Book Approved",
          description: "Book is now visible to users."
        });
        setBooks(prev => prev.filter(book => book._id !== bookId));
        setStats(prev => ({ ...prev, pending: prev.pending - 1 }));
      } else {
        throw new Error(response.message || "Failed to approve book");
      }
    } catch (err) {
      toast({
        title: "Approval Failed",
        description: err instanceof Error ? err.message : "Failed to approve book",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
      setConfirmApproveOpen(false);
    }
  };

  const handleReject = async () => {
    const { bookId } = rejectDialog;
    if (!bookId) return;

    if (!rejectReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive"
      });
      return;
    }

    setProcessing(bookId);
    try {
      const response = await BookService.rejectBook(bookId, rejectReason.trim());
      if (response.success) {
        toast({
          title: "Book Rejected",
          description: "Book has been rejected successfully."
        });
        setBooks(prev => prev.filter(book => book._id !== bookId));
        setStats(prev => ({ ...prev, pending: prev.pending - 1 }));
      } else {
        throw new Error(response.message || "Failed to reject book");
      }
    } catch (err) {
      toast({
        title: "Rejection Failed",
        description: err instanceof Error ? err.message : "Failed to reject book",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
      setRejectDialog({ open: false });
      setRejectReason("");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8 min-h-screen bg-[#0f1729] p-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-[#1a1f2e]" />
          <Skeleton className="h-4 w-96 bg-[#1a1f2e]" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-[#1a1f2e]" />
          ))}
        </div>

        {/* Content Skeleton */}
        <Card className="rounded-xl border border-[#2d3748] bg-[#1a1f2e]">
          <CardHeader>
            <Skeleton className="h-6 w-48 bg-[#2d3748]" />
            <Skeleton className="h-4 w-96 bg-[#2d3748]" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <BookSkeletonCard key={i} />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8 min-h-screen bg-[#0f1729] p-6"
      initial="hidden"
      animate="visible"
      variants={motionVariants.fadeIn}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Book Approvals
          </h1>
          <p className="text-lg text-[#94a3b8]">
            Review and manage book submissions for publication
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchPendingBooks}
            variant="outline"
            size="sm"
            disabled={loading}
            className="border-[#2d3748] text-[#cbd5e1] hover:text-white hover:border-[#4a5568] hover:bg-[#1a1f2e]"
          >
            <Loader2 className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#2d3748] text-[#cbd5e1] hover:text-white hover:border-[#4a5568] hover:bg-[#1a1f2e]"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={motionVariants.container}
      >
        <motion.div variants={motionVariants.item}>
          <StatCard
            title="Pending Review"
            value={stats.pending}
            icon={<Clock className="h-6 w-6" />}
            description="Awaiting approval"
            trend={stats.pending > 0 ? "Action required" : undefined}
          />
        </motion.div>
        <motion.div variants={motionVariants.item}>
          <StatCard
            title="Approved Today"
            value={stats.approved}
            icon={<Check className="h-6 w-6" />}
            description="Successful approvals"
          />
        </motion.div>
        <motion.div variants={motionVariants.item}>
          <StatCard
            title="Total Processed"
            value={stats.pending + stats.approved + stats.rejected}
            icon={<BookOpen className="h-6 w-6" />}
            description="All time submissions"
          />
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <motion.div variants={motionVariants.item}>
        <Card className="rounded-xl border border-[#2d3748] bg-[#1a1f2e]">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-semibold text-white">
                  Pending Submissions
                </CardTitle>
                <CardDescription className="text-[#94a3b8]">
                  Review book details before approving or rejecting
                </CardDescription>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Input
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-[#1a1f2e] border-[#2d3748] text-white placeholder:text-[#718096] focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#718096]" />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {filteredBooks.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-[#2d3748] flex items-center justify-center">
                  <Check className="h-8 w-8 text-[#4a5568]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">All caught up!</h3>
                  <p className="text-[#94a3b8] max-w-sm mx-auto">
                    {searchQuery
                      ? "No books match your search criteria."
                      : "No pending books to review at the moment."
                    }
                  </p>
                </div>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="border-[#2d3748] text-[#cbd5e1] hover:text-white hover:border-[#4a5568]"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <motion.div
                className="space-y-4"
                variants={motionVariants.container}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {filteredBooks.map((book) => (
                    <motion.div
                      key={book._id}
                      variants={motionVariants.item}
                      layout
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="overflow-hidden border border-[#2d3748] bg-[#1a1f2e]">
                        <CardContent className="p-0">
                          <div className="flex flex-col lg:flex-row gap-6 p-6">
                            {/* Book Cover - Using Enhanced Image Component */}
                            <div className="flex-shrink-0">
                              <BookImage
                                src={book.coverImages?.[0]}
                                alt={book.title || "Book cover"}
                                className="w-20 h-28 lg:w-24 lg:h-32"
                                fallbackSrc="/placeholder-book.png"
                              />
                            </div>

                            {/* Book Details */}
                            <div className="flex-1 min-w-0 space-y-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 space-y-2">
                                  <h3 className="text-lg font-semibold text-white truncate">
                                    {book.title}
                                  </h3>
                                  <p className="text-sm text-[#94a3b8]">
                                    by {book.author}
                                  </p>
                                </div>
                                <StatusBadge status={book.status || "pending"} />
                              </div>

                              {/* Metadata */}
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="text-xs bg-[#2d3748] text-[#cbd5e1] border-[#4a5568]">
                                  {book.category}
                                </Badge>
                                {book.subcategory && (
                                  <Badge variant="outline" className="text-xs border-[#4a5568] text-[#a0aec0]">
                                    {book.subcategory}
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs border-[#4a5568] text-[#a0aec0]">
                                  {formatCurrency(book.price, book.currency)}
                                </Badge>
                                {book.language && (
                                  <Badge variant="outline" className="text-xs border-[#4a5568] text-[#a0aec0]">
                                    {book.language}
                                  </Badge>
                                )}
                              </div>

                              {/* Description */}
                              {book.description && (
                                <p className="text-sm text-[#94a3b8] line-clamp-2">
                                  {book.description}
                                </p>
                              )}

                              {/* Uploader Info */}
                              {book.uploader && (
                                <div className="flex items-center gap-2 text-xs text-[#718096]">
                                  <User className="h-3 w-3" />
                                  <span>
                                    Uploaded by {book.uploader.firstName} {book.uploader.lastName}
                                  </span>
                                  {book.createdAt && (
                                    <>
                                      <span>•</span>
                                      <span>{formatDate(book.createdAt)}</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex lg:flex-col gap-2 lg:w-32 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openBookDetails(book)}
                                className="flex-1 lg:flex-none border-[#2d3748] text-[#cbd5e1] hover:text-white hover:border-[#4a5568] hover:bg-[#2d3748]"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Details
                              </Button>

                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedBook(book);
                                  setConfirmApproveOpen(true);
                                }}
                                disabled={processing === book._id}
                                className="flex-1 lg:flex-none bg-[#2d3748] hover:bg-[#4a5568] text-white border-0"
                              >
                                {processing === book._id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4 mr-2" />
                                )}
                                Approve
                              </Button>

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setRejectDialog({ open: true, bookId: book._id });
                                }}
                                disabled={processing === book._id}
                                className="flex-1 lg:flex-none bg-[#2d3748] hover:bg-[#4a5568] text-white border-0"
                              >
                                {processing === book._id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4 mr-2" />
                                )}
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Book Details Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-[#1a1f2e] border border-[#2d3748]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Book Details</DialogTitle>
            <DialogDescription className="text-[#94a3b8]">
              Complete information and preview of the submitted book
            </DialogDescription>
          </DialogHeader>

          {selectedBook && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Enhanced Image in Dialog */}
                <BookImage
                  src={selectedBook.coverImages?.[0]}
                  alt={selectedBook.title || "Book cover"}
                  className="w-48 h-64 flex-shrink-0"
                  fallbackSrc="/placeholder-book.png"
                />

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-4">
                    <div>
                      <label className="font-semibold text-[#94a3b8]">Title</label>
                      <p className="mt-1 text-white">{selectedBook.title}</p>
                    </div>
                    <div>
                      <label className="font-semibold text-[#94a3b8]">Author</label>
                      <p className="mt-1 text-white">{selectedBook.author}</p>
                    </div>
                    <div>
                      <label className="font-semibold text-[#94a3b8]">Category</label>
                      <p className="mt-1 text-white">{selectedBook.category}</p>
                    </div>
                    <div>
                      <label className="font-semibold text-[#94a3b8]">Subcategory</label>
                      <p className="mt-1 text-white">{selectedBook.subcategory || "Not specified"}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="font-semibold text-[#94a3b8]">Price</label>
                      <p className="mt-1 text-white">{formatCurrency(selectedBook.price, selectedBook.currency)}</p>
                    </div>
                    <div>
                      <label className="font-semibold text-[#94a3b8]">Language</label>
                      <p className="mt-1 text-white">{selectedBook.language || "Not specified"}</p>
                    </div>
                    <div>
                      <label className="font-semibold text-[#94a3b8]">Pages</label>
                      <p className="mt-1 text-white">{selectedBook.totalPages || "Not specified"}</p>
                    </div>
                    <div>
                      <label className="font-semibold text-[#94a3b8]">Publisher</label>
                      <p className="mt-1 text-white">{selectedBook.publisher || "Not specified"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {selectedBook.description && (
                    <div>
                      <label className="font-semibold text-[#94a3b8]">Description</label>
                      <p className="mt-2 text-sm leading-relaxed text-[#cbd5e1]">{selectedBook.description}</p>
                    </div>
                  )}

                  {selectedBook.authorBio && (
                    <div>
                      <label className="font-semibold text-[#94a3b8]">Author Bio</label>
                      <p className="mt-2 text-sm leading-relaxed text-[#cbd5e1]">{selectedBook.authorBio}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedBook.tags && selectedBook.tags.length > 0 && (
                    <div>
                      <label className="font-semibold text-[#94a3b8]">Tags</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedBook.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="bg-[#2d3748] text-[#cbd5e1] border-[#4a5568]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedBook.uploader && (
                    <div>
                      <label className="font-semibold text-[#94a3b8]">Uploaded By</label>
                      <p className="mt-1 text-white">
                        {selectedBook.uploader.firstName} {selectedBook.uploader.lastName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between items-center">
            <div className="flex-1">
              {selectedBook && (
                <StatusBadge status={selectedBook.status || "pending"} />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setViewOpen(false)}
                className="border-[#2d3748] text-[#cbd5e1] hover:text-white hover:border-[#4a5568]"
              >
                Close
              </Button>
              {selectedBook && (
                <Button
                  onClick={() => handleApprove(selectedBook._id)}
                  disabled={processing === selectedBook._id}
                  className="bg-[#2d3748] hover:bg-[#4a5568] text-white border-0"
                >
                  {processing === selectedBook._id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Approve Book
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Approval Dialog */}
      <Dialog open={confirmApproveOpen} onOpenChange={setConfirmApproveOpen}>
        <DialogContent className="max-w-md bg-[#1a1f2e] border border-[#2d3748]">
          <DialogHeader>
            <DialogTitle className="text-white">Approve Book</DialogTitle>
            <DialogDescription className="text-[#94a3b8]">
              This book will become visible to all users. Are you sure you want to approve it?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmApproveOpen(false)}
              className="border-[#2d3748] text-[#cbd5e1] hover:text-white hover:border-[#4a5568]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedBook && handleApprove(selectedBook._id)}
              disabled={processing === selectedBook?._id}
              className="bg-[#2d3748] hover:bg-[#4a5568] text-white border-0"
            >
              {processing === selectedBook?._id ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Book Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open })}>
        <DialogContent className="max-w-md bg-[#1a1f2e] border border-[#2d3748]">
          <DialogHeader>
            <DialogTitle className="text-white">Reject Book Submission</DialogTitle>
            <DialogDescription className="text-[#94a3b8]">
              Please provide a reason for rejecting this book. The uploader will see this feedback.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Enter reason for rejection (e.g., content guidelines, image quality, missing information...)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[120px] resize-none bg-[#1a1f2e] border border-[#2d3748] text-white placeholder:text-[#718096] focus:border-blue-500 focus:ring-blue-500"
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog({ open: false })}
              className="border-[#2d3748] text-[#cbd5e1] hover:text-white hover:border-[#4a5568]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing === rejectDialog.bookId || !rejectReason.trim()}
              className="bg-[#2d3748] hover:bg-[#4a5568] text-white border-0"
            >
              {processing === rejectDialog.bookId ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Reject Book
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ApproveBooks;