// components/upload-book/BooksLibrary.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";
import BookGridView from "./BookGridView";
import BookTableView from "./BookTableView";
import { Book } from "@/types/book";

interface BooksLibraryProps {
  isFormOpen: boolean;
  viewMode: 'grid' | 'table';
  books: Book[];
  loading: boolean;
  onUploadClick: () => void;
}

const BooksLibrary = ({ isFormOpen, viewMode, books, loading, onUploadClick }: BooksLibraryProps) => {
  return (
    <div className={`transition-all duration-500 ${isFormOpen ? 'xl:block' : 'xl:col-span-2'}`}>
      <Card className="h-full border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-gradient-to-br from-white/90 to-purple-50/50 dark:from-gray-900/90 dark:to-purple-950/20 backdrop-blur-sm w-full">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent border-b border-purple-500/20">
          <CardTitle className="text-3xl font-bold flex items-center gap-4">
            <div className="p-3 bg-purple-500 rounded-2xl text-white shadow-lg">
              <BookOpen className="h-7 w-7" />
            </div>
            Your Books Library
            <span className="text-lg font-normal text-muted-foreground ml-2">
              ({books.length} books)
            </span>
          </CardTitle>
          <CardDescription className="text-lg">
            Manage and view all books in your inventory
          </CardDescription>
        </CardHeader>
        
        <CardContent className="h-[calc(100%-120px)] overflow-y-auto p-6 w-full">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : viewMode === 'grid' ? (
            <BookGridView books={books} />
          ) : (
            <BookTableView books={books} />
          )}
          
          {!loading && books.length === 0 && (
            <EmptyState onUploadClick={onUploadClick} isFormOpen={isFormOpen} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Empty State Sub-component
const EmptyState = ({ onUploadClick, isFormOpen }: { onUploadClick: () => void; isFormOpen: boolean }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center w-full">
    <BookOpen className="h-20 w-20 text-muted-foreground/40 mb-4" />
    <h3 className="text-2xl font-semibold text-muted-foreground mb-2">No Books Available</h3>
    <p className="text-muted-foreground text-lg mb-6">
      {isFormOpen 
        ? "Fill out the form to add your first book!" 
        : "Click 'Upload New Book' to get started!"}
    </p>
    {!isFormOpen && (
      <Button
        onClick={onUploadClick}
        className="h-12 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Plus className="h-5 w-5 mr-2" />
        Upload Your First Book
      </Button>
    )}
  </div>
);

export default BooksLibrary;