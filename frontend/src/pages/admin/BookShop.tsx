// components/book-shop/BookShop.tsx - CORRECTED VERSION
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, CheckCircle, XCircle, Filter, Search, Star, Download, User, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BookService, Book, constructImageUrl } from "@/services/BookService";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

const BookShop = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [pendingBooks, setPendingBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showMyBooksOnly, setShowMyBooksOnly] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    author: "",
    price: "",
    description: "",
    category: "",
    language: "",
    totalPages: "",
    discountPercentage: "0",
    featured: false,
    bestseller: false,
    newRelease: false,
    currency: "USD",
    authorBio: "",
    publisher: "",
    publicationYear: "",
    edition: "",
    isbn: "",
    previewPages: "",
    tags: "",
    metaDescription: "",
    subcategory: ""
  });

  // Fetch books on component mount and when tab changes
  useEffect(() => {
    fetchBooks();
  }, [activeTab, statusFilter, showMyBooksOnly]);

  const fetchBooks = async () => {
    try {
      setLoading(true);

      if (activeTab === "pending") {
        if (showMyBooksOnly && user) {
          // Use my books with pending status
          const response = await BookService.getMyBooks("pending", 1, 50);
          if (response.success && response.data) {
            setPendingBooks(response.data.books || []);
          }
        } else {
          // Use the correct pending books API for all books
          const response = await BookService.getPendingBooks(1, 50);
          if (response.success && response.data) {
            setPendingBooks(response.data.books || []);
          }
        }
      } else {
        if (showMyBooksOnly && user) {
          // My books with status filter: pending | rejected | approved | all
          const response = await BookService.getMyBooks(
            statusFilter === "all" ? undefined : statusFilter,
            1,
            50
          );
          if (response.success && response.data) {
            setBooks(response.data.books || []);
          }
        } else {
          // All books with status filter: use getAllBooks so filter works correctly
          const response = await BookService.getAllBooks({
            page: 1,
            limit: 50,
            status: statusFilter === "all" ? "all" : statusFilter,
          });
          if (response.success && response.data) {
            setBooks(response.data.books || []);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter books based on search
  const getFilteredBooks = () => {
    return books.filter(book =>
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredPendingBooks = () => {
    return pendingBooks.filter(book =>
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getMyBook = (book: Book) => {
    return user && book.uploader?._id === user.id;
  };

  const getMyBooksCount = () => {
    if (!user) return 0;
    return books.filter(book => book.uploader?._id === user.id).length;
  };

  const getMyPendingBooksCount = () => {
    if (!user) return 0;
    return pendingBooks.filter(book => book.uploader?._id === user.id).length;
  };

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setEditForm({
      title: book.title || "",
      author: book.author || "",
      price: book.price?.toString() || "",
      description: book.description || "",
      category: book.category || "",
      language: book.language || "",
      totalPages: book.totalPages?.toString() || "",
      discountPercentage: book.discountPercentage?.toString() || "0",
      featured: book.featured || false,
      bestseller: book.bestseller || false,
      newRelease: book.newRelease || false,
      currency: book.currency || "USD",
      authorBio: book.authorBio || "",
      publisher: book.publisher || "",
      publicationYear: book.publicationYear?.toString() || "",
      edition: book.edition || "",
      isbn: book.isbn || "",
      tags: book.tags?.join(', ') || "",
      metaDescription: book.metaDescription || "",
      subcategory: book.subcategory || ""
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (book: Book) => {
    setSelectedBook(book);
    setDeleteDialogOpen(true);
  };

  const handlePreview = (book: Book) => {
    setSelectedBook(book);
    setPreviewDialogOpen(true);
  };

  const handleApprove = async (book: Book) => {
    try {
      const response = await BookService.approveBook(book._id);

      if (response.success) {
        toast({
          title: "Book Approved",
          description: `"${book.title}" has been approved and published`,
          variant: "default",
        });

        // Remove from pending list and add to approved list
        setPendingBooks(prev => prev.filter(b => b._id !== book._id));
        if (response.data?.book) {
          setBooks(prev => [response.data.book, ...prev]);
        }
      }
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve book",
        variant: "destructive",
      });
    }
  };

  const handleReject = (book: Book) => {
    setSelectedBook(book);
    setRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedBook || !rejectionReason.trim()) return;

    try {
      const response = await BookService.rejectBook(selectedBook._id, rejectionReason);

      if (response.success) {
        toast({
          title: "Book Rejected",
          description: `"${selectedBook.title}" has been rejected`,
          variant: "default",
        });

        // Remove from pending list
        setPendingBooks(prev => prev.filter(book => book._id !== selectedBook._id));
        setRejectDialogOpen(false);
        setSelectedBook(null);
        setRejectionReason("");
      }
    } catch (error: any) {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject book",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!selectedBook) return;

    try {
      // Use the correct delete route for my books
      const response = await BookService.deleteBook(selectedBook._id);

      if (response.success) {
        toast({
          title: "Book Deleted",
          description: `"${selectedBook.title}" has been deleted successfully`,
          variant: "default",
        });

        // Remove book from local state
        if (activeTab === "pending") {
          setPendingBooks(prev => prev.filter(book => book._id !== selectedBook._id));
        } else {
          setBooks(prev => prev.filter(book => book._id !== selectedBook._id));
        }
        setDeleteDialogOpen(false);
        setSelectedBook(null);
      }
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete book",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBook = async () => {
    if (!selectedBook) return;

    try {
      // Prepare update data according to your backend API
      const updateData = {
        title: editForm.title,
        author: editForm.author,
        price: parseFloat(editForm.price),
        description: editForm.description,
        category: editForm.category,
        language: editForm.language,
        totalPages: parseInt(editForm.totalPages) || 0,
        discountPercentage: parseFloat(editForm.discountPercentage) || 0,
        featured: editForm.featured,
        bestseller: editForm.bestseller,
        newRelease: editForm.newRelease,
        currency: editForm.currency,
        authorBio: editForm.authorBio,
        publisher: editForm.publisher,
        publicationYear: editForm.publicationYear ? parseInt(editForm.publicationYear) : undefined,
        edition: editForm.edition,
        isbn: editForm.isbn,
        tags: editForm.tags,
        metaDescription: editForm.metaDescription,
        subcategory: editForm.subcategory
      };

      console.log("Updating book with data:", updateData);

      // Use the correct update route for my books
      const response = await BookService.updateBook(selectedBook._id, updateData);

      if (response.success && response.data?.book) {
        toast({
          title: "Book Updated",
          description: `"${selectedBook.title}" has been updated successfully`,
          variant: "default",
        });

        // Update book in local state
        if (activeTab === "pending") {
          setPendingBooks(prev => prev.map(book =>
            book._id === selectedBook._id
              ? { ...book, ...response.data!.book }
              : book
          ));
        } else {
          setBooks(prev => prev.map(book =>
            book._id === selectedBook._id
              ? { ...book, ...response.data!.book }
              : book
          ));
        }

        setEditDialogOpen(false);
        setSelectedBook(null);
      }
    } catch (error: any) {
      console.error("Update error:", error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || error.message || "Failed to update book",
        variant: "destructive",
      });
    }
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    book: Book
  ) => {
    const target = e.currentTarget;
    target.src = "/placeholder-book.png";
    target.alt = "Placeholder book cover";
  };

  const getCurrentImage = (book: Book) => {
    const path = book.coverImages?.[0];
    return path ? constructImageUrl(path) : "/placeholder-book.png";
  };

  const getImageAlt = (book: Book) => {
    return book.title || "Book Cover";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", className: "bg-amber-500/25 text-amber-300 border border-amber-500/50 font-medium" },
      approved: { label: "Published", className: "bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 font-medium" },
      rejected: { label: "Rejected", className: "bg-red-500/25 text-red-300 border border-red-500/50 font-medium" }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const getFeaturedBadge = (featured: boolean) => {
    return featured ? <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">⭐ Featured</Badge> : null;
  };

  const getBestsellerBadge = (bestseller: boolean) => {
    return bestseller ? <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">🔥 Bestseller</Badge> : null;
  };

  const getNewReleaseBadge = (newRelease: boolean) => {
    return newRelease ? <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">🆕 New</Badge> : null;
  };

  const getMyBookBadge = (book: Book) => {
    return getMyBook(book) ? (
      <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
        <BookOpen className="h-3 w-3 mr-1" />
        My Book
      </Badge>
    ) : null;
  };

  const formatPrice = (book: Book) => {
    const price = book.discountedPrice || book.price;
    const currency = book.currency || "USD";

    if (book.discountPercentage && book.discountPercentage > 0) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-emerald-400">
            {currency} {price}
          </span>
          <span className="text-sm line-through text-slate-400">
            {currency} {book.price}
          </span>
          <Badge variant="outline" className="border-red-500/50 text-red-300 text-xs">
            -{book.discountPercentage}%
          </Badge>
        </div>
      );
    }

    return (
      <span className="text-lg font-bold text-slate-100">
        {currency} {price}
      </span>
    );
  };

  const filteredBooks = getFilteredBooks();
  const filteredPendingBooks = getFilteredPendingBooks();

  return (
    <div className="space-y-6 p-6 min-h-screen pb-12 overflow-visible" style={{ backgroundColor: '#0f1729' }}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold tracking-tight" style={{ color: '#f1f5f9' }}>
            Book Shop Management
          </h2>
          <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Manage all books in the system</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4" style={{ color: '#94a3b8' }} />
            <Input
              placeholder="Search books by title, author, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 bg-slate-800/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-blue-500 [&>span]:text-slate-100"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] border-2 bg-slate-800/50 border-slate-600 text-slate-100 placeholder:text-slate-400 [&>span]:text-slate-100">
              <Filter className="h-4 w-4 mr-2" style={{ color: '#94a3b8' }} />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600 text-slate-100">
              <SelectItem value="all" className="text-slate-100 focus:bg-slate-700">All Status</SelectItem>
              <SelectItem value="approved" className="text-slate-100 focus:bg-slate-700">Approved</SelectItem>
              <SelectItem value="pending" className="text-slate-100 focus:bg-slate-700">Pending</SelectItem>
              <SelectItem value="rejected" className="text-slate-100 focus:bg-slate-700">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] p-1 bg-slate-800/50 border border-slate-600">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 transition-all"
          >
            All Books ({showMyBooksOnly ? filteredBooks.length : books.length})
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 transition-all"
          >
            Pending ({showMyBooksOnly ? filteredPendingBooks.length : pendingBooks.length})
            {getMyPendingBooksCount() > 0 && (
              <Badge variant="secondary" className="ml-2 bg-amber-500/25 text-amber-300 border border-amber-500/50 text-xs">
                {getMyPendingBooksCount()} mine
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* All Books Tab */}
        <TabsContent value="all" className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <p>Loading books...</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-visible">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book._id}
                    book={book}
                    getMyBook={getMyBook(book)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPreview={handlePreview}
                    getStatusBadge={getStatusBadge}
                    getMyBookBadge={getMyBookBadge}
                    getFeaturedBadge={getFeaturedBadge}
                    getBestsellerBadge={getBestsellerBadge}
                    getNewReleaseBadge={getNewReleaseBadge}
                    formatPrice={formatPrice}
                    getCurrentImage={getCurrentImage}
                    getImageAlt={getImageAlt}
                    handleImageError={handleImageError}
                  />
                ))}
              </div>

              {filteredBooks.length === 0 && (
                <EmptyState
                  showMyBooksOnly={showMyBooksOnly}
                  onClearFilters={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setShowMyBooksOnly(false);
                  }}
                />
              )}
            </>
          )}
        </TabsContent>

        {/* Pending Books Tab */}
        <TabsContent value="pending" className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <p>Loading pending books...</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-visible">
                {filteredPendingBooks.map((book) => (
                  <PendingBookCard
                    key={book._id}
                    book={book}
                    getMyBook={getMyBook(book)}
                    onPreview={handlePreview}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    getStatusBadge={getStatusBadge}
                    getMyBookBadge={getMyBookBadge}
                    getCurrentImage={getCurrentImage}
                    getImageAlt={getImageAlt}
                    handleImageError={handleImageError}
                  />
                ))}
              </div>

              {filteredPendingBooks.length === 0 && (
                <PendingEmptyState showMyBooksOnly={showMyBooksOnly} />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Book Dialog */}
      <EditBookDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        selectedBook={selectedBook}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleUpdateBook}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        selectedBook={selectedBook}
        onConfirm={confirmDelete}
      />

      {/* Reject Confirmation Dialog */}
      <RejectDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        selectedBook={selectedBook}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onConfirm={confirmReject}
      />

      {/* Preview Dialog */}
      <PreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        selectedBook={selectedBook}
        getMyBook={getMyBook}
        getStatusBadge={getStatusBadge}
        getFeaturedBadge={getFeaturedBadge}
        getBestsellerBadge={getBestsellerBadge}
        getNewReleaseBadge={getNewReleaseBadge}
        getCurrentImage={getCurrentImage}
        getImageAlt={getImageAlt}
        handleImageError={handleImageError}
      />
    </div>
  );
};

// Component for Book Card
const BookCard = ({
  book,
  getMyBook,
  onEdit,
  onDelete,
  onPreview,
  getStatusBadge,
  getMyBookBadge,
  getFeaturedBadge,
  getBestsellerBadge,
  getNewReleaseBadge,
  formatPrice,
  getCurrentImage,
  getImageAlt,
  handleImageError
}: any) => (
  <Card className={`group relative overflow-visible border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col rounded-b-lg ${getMyBook
    ? 'border-slate-500 bg-slate-800/90 hover:border-blue-500/50'
    : 'border-slate-600 bg-slate-800/90 hover:border-slate-500'
    }`}>
    {/* Badge Container */}
    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
      <div className="flex flex-col gap-1">
        {getStatusBadge(book.status || "pending")}
        {getMyBookBadge(book)}
      </div>
      <div className="flex flex-wrap gap-1">
        {getFeaturedBadge(book.featured || false)}
        {getBestsellerBadge(book.bestseller || false)}
        {getNewReleaseBadge(book.newRelease || false)}
      </div>
    </div>

    <CardHeader className="p-0 relative rounded-t-lg shrink-0">
      <div className="relative w-full aspect-[3/4] min-h-[200px] bg-slate-700/50 rounded-t-lg overflow-hidden">
        <img
          src={getCurrentImage(book)}
          alt={getImageAlt(book)}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => handleImageError(e, book)}
          crossOrigin="anonymous"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
      </div>
    </CardHeader>

    <CardContent className="p-4 pt-4 space-y-3 overflow-visible flex-1 min-w-0">
      <CardTitle className="text-lg leading-snug line-clamp-2 text-slate-100 min-h-[2.5rem] pt-0">
        {book.title}
      </CardTitle>

      <div className="flex items-center gap-2 text-sm text-slate-400">
        <User className="h-3 w-3 flex-shrink-0" />
        <span className="line-clamp-1 text-slate-300">{book.author}</span>
      </div>

      <div className="flex items-center justify-between text-slate-200">
        {formatPrice(book)}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span className="text-slate-300">{book.viewCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            <span className="text-slate-300">{book.downloadCount || 0}</span>
          </div>
        </div>
        <Badge variant="outline" className="text-xs border-slate-500 text-slate-300 shrink-0">
          {book.category}
        </Badge>
      </div>

      {book.uploader && (
        <div className="text-xs text-slate-400 border-t border-slate-600 pt-2">
          Uploaded by: <span className="text-slate-300">{book.uploader.firstName} {book.uploader.lastName}</span>
          {getMyBook && (
            <Badge variant="outline" className="ml-2 border-blue-500/50 text-blue-300 text-xs">
              You
            </Badge>
          )}
        </div>
      )}
    </CardContent>

    <CardFooter className="p-4 pt-3 flex-shrink-0 flex gap-2 border-t border-slate-600 rounded-b-lg bg-slate-800/90 min-h-[52px] items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPreview(book)}
        className="flex-1 h-9 border-slate-500 text-slate-200 hover:bg-slate-700 hover:text-white"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(book)}
        className="flex-1 h-9 border-slate-500 text-slate-200 hover:bg-slate-700 hover:text-white"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(book)}
        className="flex-1 h-9 border-slate-500 text-slate-200 hover:bg-red-900/30 hover:text-red-300"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </CardFooter>
  </Card>
);

// Component for Pending Book Card
const PendingBookCard = ({
  book,
  getMyBook,
  onPreview,
  onApprove,
  onReject,
  getStatusBadge,
  getMyBookBadge,
  getCurrentImage,
  getImageAlt,
  handleImageError
}: any) => (
  <Card className={`group relative overflow-visible border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col rounded-b-lg ${getMyBook
    ? 'border-slate-500 bg-slate-800/90 hover:border-blue-500/50'
    : 'border-slate-600 bg-slate-800/90 hover:border-slate-500'
    }`}>
    {/* Badge Container */}
    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
      <div className="flex flex-col gap-1">
        {getStatusBadge(book.status || "pending")}
        {getMyBookBadge(book)}
      </div>
      <Badge className="bg-amber-600 text-white border-0">
        Awaiting Review
      </Badge>
    </div>

    <CardHeader className="p-0 relative rounded-t-lg shrink-0">
      <div className="relative w-full aspect-[3/4] min-h-[200px] bg-slate-700/50 rounded-t-lg overflow-hidden">
        <img
          src={getCurrentImage(book)}
          alt={getImageAlt(book)}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => handleImageError(e, book)}
          crossOrigin="anonymous"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
      </div>
    </CardHeader>

    <CardContent className="p-4 pt-4 space-y-3 overflow-visible flex-1 min-w-0">
      <CardTitle className="text-lg leading-snug line-clamp-2 text-slate-100 min-h-[2.5rem] pt-0">
        {book.title}
      </CardTitle>

      <div className="flex items-center gap-2 text-sm text-slate-400">
        <User className="h-3 w-3 flex-shrink-0" />
        <span className="line-clamp-1 text-slate-300">{book.author}</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-slate-300">
          <span className="text-slate-400">Price:</span>
          <span className="font-bold text-slate-100">
            {book.currency} {book.price}
          </span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span className="text-slate-400">Uploaded:</span>
          <span className="text-xs text-slate-300">
            {new Date(book.createdAt || "").toLocaleDateString()}
          </span>
        </div>
      </div>

      {book.uploader && (
        <div className="text-xs text-slate-400 border-t border-slate-600 pt-2">
          Uploaded by: <span className="text-slate-300">{book.uploader.firstName} {book.uploader.lastName}</span>
          {getMyBook && (
            <Badge variant="outline" className="ml-2 border-blue-500/50 text-blue-300 text-xs">
              You
            </Badge>
          )}
        </div>
      )}
    </CardContent>

    <CardFooter className="p-4 pt-3 flex-shrink-0 flex gap-2 border-t border-slate-600 rounded-b-lg bg-slate-800/90 min-h-[52px] items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPreview(book)}
        className="flex-1 h-9 border-slate-500 text-slate-200 hover:bg-slate-700 hover:text-white"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        onClick={() => onApprove(book)}
        className="flex-1 h-9 bg-green-600 hover:bg-green-700 text-white"
      >
        <CheckCircle className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onReject(book)}
        className="flex-1 h-9 border-red-500/50 text-red-300 hover:bg-red-900/30"
      >
        <XCircle className="h-4 w-4" />
      </Button>
    </CardFooter>
  </Card>
);

// Empty State Component
const EmptyState = ({ showMyBooksOnly, onClearFilters }: any) => (
  <div className="text-center py-12 space-y-4">
    <div className="w-24 h-24 mx-auto bg-slate-700 rounded-full flex items-center justify-center">
      <Search className="h-8 w-8 text-slate-400" />
    </div>
    <p className="text-slate-300">
      {showMyBooksOnly ? "No books found in your collection" : "No books found"}
    </p>
    <Button variant="outline" onClick={onClearFilters} className="border-slate-500 text-slate-200 hover:bg-slate-700">
      Clear filters
    </Button>
  </div>
);

// Pending Empty State Component
const PendingEmptyState = ({ showMyBooksOnly }: any) => (
  <div className="text-center py-12 space-y-4">
    <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center bg-slate-700">
      <CheckCircle className="h-8 w-8 text-amber-400" />
    </div>
    <p className="text-slate-300">
      {showMyBooksOnly
        ? "No pending books found in your collection"
        : "No pending books for approval"
      }
    </p>
    <p className="text-sm text-slate-400">
      {showMyBooksOnly
        ? "All your books have been reviewed"
        : "All books have been reviewed"
      }
    </p>
  </div>
);

// Edit Book Dialog Component - dark theme
const EditBookDialog = ({ open, onOpenChange, selectedBook, editForm, setEditForm, onSave }: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-600 text-slate-100">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-slate-100">
          <Edit className="h-5 w-5 text-slate-300" />
          Edit Book - {selectedBook?.title}
        </DialogTitle>
        <DialogDescription className="text-slate-400">
          Update the book information below. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              placeholder="Book title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Author *</Label>
            <Input
              id="author"
              value={editForm.author}
              onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
              placeholder="Author name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={editForm.price}
              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={editForm.currency} onValueChange={(value) => setEditForm({ ...editForm, currency: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            placeholder="Book description"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              placeholder="Book category"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Input
              id="language"
              value={editForm.language}
              onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
              placeholder="Book language"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalPages">Total Pages</Label>
            <Input
              id="totalPages"
              type="number"
              value={editForm.totalPages}
              onChange={(e) => setEditForm({ ...editForm, totalPages: e.target.value })}
              placeholder="Number of pages"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discountPercentage">Discount Percentage</Label>
            <Input
              id="discountPercentage"
              type="number"
              step="0.01"
              value={editForm.discountPercentage}
              onChange={(e) => setEditForm({ ...editForm, discountPercentage: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="publicationYear">Publication Year</Label>
            <Input
              id="publicationYear"
              type="number"
              value={editForm.publicationYear}
              onChange={(e) => setEditForm({ ...editForm, publicationYear: e.target.value })}
              placeholder="2024"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="publisher">Publisher</Label>
            <Input
              id="publisher"
              value={editForm.publisher}
              onChange={(e) => setEditForm({ ...editForm, publisher: e.target.value })}
              placeholder="Publisher name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="isbn">ISBN</Label>
            <Input
              id="isbn"
              value={editForm.isbn}
              onChange={(e) => setEditForm({ ...editForm, isbn: e.target.value })}
              placeholder="ISBN number"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="authorBio">Author Bio</Label>
          <Textarea
            id="authorBio"
            value={editForm.authorBio}
            onChange={(e) => setEditForm({ ...editForm, authorBio: e.target.value })}
            placeholder="Author biography"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            value={editForm.tags}
            onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
            placeholder="fiction, science, technology"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={editForm.featured}
              onCheckedChange={(checked) => setEditForm({ ...editForm, featured: checked })}
            />
            <Label htmlFor="featured">Featured</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="bestseller"
              checked={editForm.bestseller}
              onCheckedChange={(checked) => setEditForm({ ...editForm, bestseller: checked })}
            />
            <Label htmlFor="bestseller">Bestseller</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="newRelease"
              checked={editForm.newRelease}
              onCheckedChange={(checked) => setEditForm({ ...editForm, newRelease: checked })}
            />
            <Label htmlFor="newRelease">New Release</Label>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-500 text-slate-200 hover:bg-slate-700">
          Cancel
        </Button>
        <Button onClick={onSave} className="bg-slate-600 hover:bg-slate-500 text-white">Save Changes</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Delete Dialog Component - dark theme
const DeleteDialog = ({ open, onOpenChange, selectedBook, onConfirm }: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="bg-slate-800 border-slate-600 text-slate-100">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-red-400">
          <Trash2 className="h-5 w-5" />
          Delete Book
        </DialogTitle>
        <DialogDescription className="text-slate-400">
          Are you sure you want to delete "{selectedBook?.title}"? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-500 text-slate-200 hover:bg-slate-700">
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white">
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Reject Dialog Component - dark theme
const RejectDialog = ({ open, onOpenChange, selectedBook, rejectionReason, setRejectionReason, onConfirm }: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="bg-slate-800 border-slate-600 text-slate-100">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-red-400">
          <XCircle className="h-5 w-5" />
          Reject Book
        </DialogTitle>
        <DialogDescription className="text-slate-400">
          Please provide a reason for rejecting "{selectedBook?.title}".
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <Textarea
          placeholder="Enter rejection reason..."
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          rows={3}
          className="border-slate-500 bg-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-red-400"
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-500 text-slate-200 hover:bg-slate-700">
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          disabled={!rejectionReason.trim()}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Reject Book
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Preview Dialog Component - dark theme to match book shop
const PreviewDialog = ({
  open,
  onOpenChange,
  selectedBook,
  getMyBook,
  getStatusBadge,
  getFeaturedBadge,
  getBestsellerBadge,
  getNewReleaseBadge,
  getCurrentImage,
  getImageAlt,
  handleImageError
}: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl bg-slate-800 border-slate-600 text-slate-100">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-slate-100">
          <Eye className="h-5 w-5 text-slate-300" />
          {selectedBook?.title}
        </DialogTitle>
        <DialogDescription className="text-slate-400">
          by {selectedBook?.author}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <img
              src={selectedBook ? getCurrentImage(selectedBook) : "/placeholder-book.png"}
              alt={selectedBook ? getImageAlt(selectedBook) : "Book Cover"}
              className="w-48 h-64 object-cover rounded-lg shadow-lg border border-slate-600"
              onError={(e) => selectedBook && handleImageError(e, selectedBook)}
              crossOrigin="anonymous"
              loading="lazy"
            />
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap gap-2">
              {getStatusBadge(selectedBook?.status || 'pending')}
              {getFeaturedBadge(selectedBook?.featured || false)}
              {getBestsellerBadge(selectedBook?.bestseller || false)}
              {getNewReleaseBadge(selectedBook?.newRelease || false)}
              {selectedBook && getMyBook(selectedBook) && (
                <Badge className="bg-indigo-600 text-white border-0">
                  <BookOpen className="h-3 w-3 mr-1" />
                  My Book
                </Badge>
              )}
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {selectedBook?.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2 text-slate-100">Book Details</h4>
                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span>{selectedBook?.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Language:</span>
                    <span>{selectedBook?.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pages:</span>
                    <span>{selectedBook?.totalPages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Publisher:</span>
                    <span>{selectedBook?.publisher}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-slate-100">Pricing</h4>
                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Price:</span>
                    <span>{selectedBook?.currency} {selectedBook?.price}</span>
                  </div>
                  {selectedBook?.discountPercentage > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Discount:</span>
                        <span className="text-emerald-400">-{selectedBook.discountPercentage}%</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-400">Final Price:</span>
                        <span className="text-emerald-400">
                          {selectedBook.currency} {selectedBook.discountedPrice || selectedBook.price}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {selectedBook?.uploader && (
              <div className="border-t border-slate-600 pt-4">
                <h4 className="font-semibold mb-2 text-slate-100">Upload Information</h4>
                <div className="text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Uploaded by:</span>
                    <span>
                      {selectedBook.uploader.firstName} {selectedBook.uploader.lastName}
                      {getMyBook(selectedBook) && (
                        <Badge variant="outline" className="ml-2 border-blue-500/50 text-blue-300 text-xs">
                          You
                        </Badge>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Uploaded on:</span>
                    <span>{new Date(selectedBook.createdAt || "").toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default BookShop;