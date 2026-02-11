// components/book-shop/BookShop.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, CheckCircle, XCircle, Filter, Search, Download, User, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BookService, Book } from "@/services/bookService";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
  }, [activeTab, statusFilter]);

  const fetchBooks = async () => {
    try {
      setLoading(true);

      if (activeTab === "pending") {
        const response = await BookService.getPendingBooks(currentPage, itemsPerPage);
        if (response.success && response.data) {
          setPendingBooks(response.data.books || []);
        }
      } else {
        const response = await BookService.getAllBooks({
          status: statusFilter === "all" ? undefined : statusFilter,
          page: currentPage,
          limit: itemsPerPage
        });

        if (response.success && response.data) {
          setBooks(response.data.books || []);
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

  // Filter books based on search term
  const getFilteredBooks = () => {
    let filtered = books.filter(book =>
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showMyBooksOnly && user) {
      filtered = filtered.filter(book => book.uploader?._id === user.id);
    }

    return filtered;
  };

  const getFilteredPendingBooks = () => {
    let filtered = pendingBooks.filter(book =>
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showMyBooksOnly && user) {
      filtered = filtered.filter(book => book.uploader?._id === user.id);
    }

    return filtered;
  };

  const isMyBook = (book: Book) => {
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
      publicationYear: book.publicationYear || "",
      edition: book.edition || "",
      isbn: book.isbn || "",
      tags: book.tags || "",
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
        fetchBooks(); // Refresh data
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
        fetchBooks(); // Refresh data
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
        fetchBooks(); // Refresh data
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
      const formData = new FormData();

      // Append updated fields with proper formatting
      Object.entries(editForm).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Convert booleans to strings
          if (typeof value === 'boolean') {
            formData.append(key, value.toString());
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await BookService.updateBook(selectedBook._id, formData);

      if (response.success && response.data?.book) {
        toast({
          title: "Book Updated",
          description: `"${selectedBook.title}" has been updated successfully`,
          variant: "default",
        });

        // Refresh data
        fetchBooks();
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending", className: "bg-yellow-500/20 text-yellow-200" },
      approved: { variant: "default" as const, label: "Published", className: "bg-green-500/20 text-green-200" },
      rejected: { variant: "destructive" as const, label: "Rejected", className: "bg-red-500/20 text-red-200" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatPrice = (book: Book) => {
    const price = book.discountedPrice || book.price;
    const currency = book.currency || "USD";

    if (book.discountPercentage && book.discountPercentage > 0) {
      return (
        <div className="flex flex-col">
          <span className="font-bold text-white">
            {currency} {price}
          </span>
          <span className="text-xs line-through text-blue-300/70">
            {currency} {book.price}
          </span>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-200 border-blue-500/30 text-xs mt-1 w-fit">
            -{book.discountPercentage}%
          </Badge>
        </div>
      );
    }

    return (
      <span className="font-bold text-white">
        {currency} {price}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredBooks = getFilteredBooks();
  const filteredPendingBooks = getFilteredPendingBooks();

  const totalPages = Math.ceil((activeTab === "pending" ? filteredPendingBooks.length : filteredBooks.length) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const getCurrentItems = () => {
    if (activeTab === "pending") {
      return filteredPendingBooks.slice(startIndex, endIndex);
    }
    return filteredBooks.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6 p-6 min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Book Shop Management</h2>
          <p className="text-blue-200">Manage all books in the system</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
            <Input
              placeholder="Search books by title, author, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-blue-500/30 text-white placeholder:text-blue-300 focus:border-blue-500 focus:ring-blue-500/30"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-white/10 border-blue-500/30 text-white">
              <Filter className="h-4 w-4 mr-2 text-blue-400" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-navy-800 border-blue-500/30">
              <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10">All Status</SelectItem>
              <SelectItem value="approved" className="text-white hover:bg-white/10 focus:bg-white/10">Approved</SelectItem>
              <SelectItem value="pending" className="text-white hover:bg-white/10 focus:bg-white/10">Pending</SelectItem>
              <SelectItem value="rejected" className="text-white hover:bg-white/10 focus:bg-white/10">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* My Books Filter */}
        {user && (
          <div className="flex items-center space-x-2 bg-white/10 p-3 rounded-lg border border-blue-500/30">
            <Switch
              checked={showMyBooksOnly}
              onCheckedChange={setShowMyBooksOnly}
              className="data-[state=checked]:bg-blue-500 bg-white/20"
            />
            <Label className="flex items-center gap-2 cursor-pointer text-white">
              <BookOpen className="h-4 w-4 text-blue-400" />
              Show only my books
              {showMyBooksOnly && (
                <Badge variant="outline" className="bg-white/10 text-white border-blue-500/30">
                  {activeTab === "all" ? getMyBooksCount() : getMyPendingBooksCount()} books
                </Badge>
              )}
            </Label>
          </div>
        )}
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/10 border border-blue-500/30 p-1 rounded-lg">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200 transition-all"
          >
            All Books ({books.length})
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white text-blue-200 transition-all"
          >
            Pending ({pendingBooks.length})
            {getMyPendingBooksCount() > 0 && (
              <Badge variant="outline" className="ml-2 bg-yellow-500/20 text-yellow-200 border-yellow-500/30">
                {getMyPendingBooksCount()} mine
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="rounded-lg border border-blue-500/30 bg-transparent backdrop-blur-sm">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-b border-blue-500/30">
                  <TableHead className="font-semibold text-white">Book</TableHead>
                  <TableHead className="font-semibold text-white">Author</TableHead>
                  <TableHead className="font-semibold text-white">Category</TableHead>
                  <TableHead className="font-semibold text-white">Price</TableHead>
                  <TableHead className="font-semibold text-white">Status</TableHead>
                  <TableHead className="font-semibold text-white">Uploader</TableHead>
                  <TableHead className="font-semibold text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="border-b border-blue-500/30">
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                      <p className="text-blue-200 mt-2">Loading books...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredBooks.length === 0 ? (
                  <TableRow className="border-b border-blue-500/30">
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-blue-400" />
                      </div>
                      <p className="text-blue-200">
                        {showMyBooksOnly ? "No books found in your collection" : "No books found"}
                      </p>
                      {searchTerm || statusFilter !== "all" || showMyBooksOnly ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("all");
                            setShowMyBooksOnly(false);
                          }}
                          className="mt-4 border-blue-500/30 text-white hover:bg-white/10"
                        >
                          Clear filters
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ) : (
                  getCurrentItems().map((book) => (
                    <TableRow key={book._id} className="border-b border-blue-500/30 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 bg-white/10 rounded flex items-center justify-center overflow-hidden border border-blue-500/30">
                            {book.coverImages?.[0] ? (
                              <img
                                src={book.coverImages[0]}
                                alt={book.title || "Book cover"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder-book.png";
                                  e.currentTarget.alt = "Placeholder book cover";
                                }}
                              />
                            ) : (
                              <BookOpen className="h-6 w-6 text-blue-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white line-clamp-1">{book.title}</p>
                            <p className="text-sm text-blue-300">{book.language}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-white">{book.author}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-white/10 text-white border-blue-500/30">
                          {book.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatPrice(book)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(book.status || "pending")}
                        {isMyBook(book) && (
                          <Badge className="ml-2 bg-blue-500/20 text-blue-200">
                            <BookOpen className="h-3 w-3 mr-1" />
                            My Book
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {book.uploader ? (
                          <div className="text-sm">
                            <p className="text-white">{book.uploader.firstName} {book.uploader.lastName}</p>
                            <p className="text-blue-300">{formatDate(book.createdAt || "")}</p>
                          </div>
                        ) : (
                          <span className="text-blue-300">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(book)}
                            className="border-blue-500/30 text-white hover:bg-white/10"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(book)}
                            className="border-blue-500/30 text-white hover:bg-white/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(book)}
                            className="border-blue-500/30 text-white hover:bg-white/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {!loading && filteredBooks.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-blue-500/30">
                <div className="text-sm text-blue-200">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredBooks.length)} of {filteredBooks.length} books
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-blue-500/30 text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={`min-w-[40px] ${currentPage === pageNum
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'border-blue-500/30 text-white hover:bg-white/10'
                          }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-blue-500/30 text-white hover:bg-white/10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <div className="rounded-lg border border-blue-500/30 bg-transparent backdrop-blur-sm">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-b border-blue-500/30">
                  <TableHead className="font-semibold text-white">Book</TableHead>
                  <TableHead className="font-semibold text-white">Author</TableHead>
                  <TableHead className="font-semibold text-white">Category</TableHead>
                  <TableHead className="font-semibold text-white">Price</TableHead>
                  <TableHead className="font-semibold text-white">Uploaded</TableHead>
                  <TableHead className="font-semibold text-white">Uploader</TableHead>
                  <TableHead className="font-semibold text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="border-b border-blue-500/30">
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                      <p className="text-blue-200 mt-2">Loading pending books...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredPendingBooks.length === 0 ? (
                  <TableRow className="border-b border-blue-500/30">
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-blue-400" />
                      </div>
                      <p className="text-blue-200">
                        {showMyBooksOnly
                          ? "No pending books found in your collection"
                          : "No pending books for approval"
                        }
                      </p>
                      <p className="text-sm text-blue-300 mt-2">
                        {showMyBooksOnly
                          ? "All your books have been reviewed"
                          : "All books have been reviewed"
                        }
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  getCurrentItems().map((book) => (
                    <TableRow key={book._id} className="border-b border-blue-500/30 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 bg-white/10 rounded flex items-center justify-center overflow-hidden border border-blue-500/30">
                            {book.coverImages?.[0] ? (
                              <img
                                src={book.coverImages[0]}
                                alt={book.title || "Book cover"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder-book.png";
                                  e.currentTarget.alt = "Placeholder book cover";
                                }}
                              />
                            ) : (
                              <BookOpen className="h-6 w-6 text-blue-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white line-clamp-1">{book.title}</p>
                            <p className="text-sm text-blue-300">{book.language}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-white">{book.author}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-white/10 text-white border-blue-500/30">
                          {book.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-white">
                          {book.currency} {book.price}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="text-white">{formatDate(book.createdAt || "")}</p>
                      </TableCell>
                      <TableCell>
                        {book.uploader ? (
                          <div className="text-sm">
                            <p className="text-white">{book.uploader.firstName} {book.uploader.lastName}</p>
                            {isMyBook(book) && (
                              <Badge className="mt-1 bg-blue-500/20 text-blue-200">
                                <BookOpen className="h-3 w-3 mr-1" />
                                My Book
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-blue-300">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(book)}
                            className="border-blue-500/30 text-white hover:bg-white/10"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(book)}
                            className="bg-green-600 text-white hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(book)}
                            className="bg-red-600 text-white hover:bg-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination for pending books */}
            {!loading && filteredPendingBooks.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-blue-500/30">
                <div className="text-sm text-blue-200">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredPendingBooks.length)} of {filteredPendingBooks.length} books
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-blue-500/30 text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={`min-w-[40px] ${currentPage === pageNum
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'border-blue-500/30 text-white hover:bg-white/10'
                          }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-blue-500/30 text-white hover:bg-white/10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Book Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-navy-800 border-blue-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Edit className="h-5 w-5 text-blue-400" />
              Edit Book - {selectedBook?.title}
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              Update the book information below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Form fields would go here */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="border-blue-500/30 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button onClick={handleUpdateBook} className="bg-blue-600 text-white hover:bg-blue-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-navy-800 border-blue-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-300">
              <Trash2 className="h-5 w-5" />
              Delete Book
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              Are you sure you want to delete "{selectedBook?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-blue-500/30 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-navy-800 border-blue-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-300">
              <XCircle className="h-5 w-5" />
              Reject Book
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              Please provide a reason for rejecting "{selectedBook?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="bg-white/10 border-blue-500/30 text-white placeholder:text-blue-300 focus:border-blue-500 focus:ring-blue-500/30"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} className="border-blue-500/30 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={!rejectionReason.trim()}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Reject Book
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl bg-navy-800 border-blue-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Eye className="h-5 w-5 text-blue-400" />
              {selectedBook?.title}
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              by {selectedBook?.author}
            </DialogDescription>
          </DialogHeader>
          {/* Preview content would go here */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookShop;