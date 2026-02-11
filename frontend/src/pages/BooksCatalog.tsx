// pages/BooksCatalog.tsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookService, Book } from "@/services/bookService";
import { Loader2, Search, Grid, List } from "lucide-react";

const BooksCatalog = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchBooks();
  }, [searchParams]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const query = searchParams.get('q');
      const category = searchParams.get('category');

      let response;
      if (query) {
        response = await BookService.searchBooks(query);
      } else if (category) {
        response = await BookService.getBooksByCategory(category);
      } else {
        response = await BookService.getApprovedBooks(1, 20);
      }

      if (response.success && response.data) {
        setBooks(response.data.books);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Search and Filters */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <Input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Found {books.length} books
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Books Grid/List */}
        <div className={
          viewMode === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            : "space-y-6"
        }>
          {books.map((book) => (
            <div
              key={book._id}
              className={
                viewMode === 'grid'
                  ? "bg-card rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer"
                  : "bg-card rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer flex gap-6"
              }
              onClick={() => window.location.href = `/book/${book._id}`}
            >
              <img
                src={book.coverImage}
                alt={book.title}
                className={
                  viewMode === 'grid'
                    ? "w-full aspect-[3/4] object-cover rounded mb-4"
                    : "w-32 aspect-[3/4] object-cover rounded"
                }
              />
              <div className={viewMode === 'list' ? "flex-1" : ""}>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  {book.author}
                </p>
                <h3 className="font-semibold mb-2 line-clamp-2">{book.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                  {book.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">
                    {book.currency} {book.discountedPrice || book.price}
                  </span>
                  {book.discountedPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {book.currency} {book.price}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {books.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No books found.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchParams({});
                setSearchQuery('');
              }}
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BooksCatalog;