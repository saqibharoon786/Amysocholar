import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockBooks } from "@/data/mockBooks";
import { categoryService } from "@/services/categoryService";
import { Search, Filter, BookOpen, Plus, Download, Eye, Edit, Trash2, Sparkles } from "lucide-react";

const BookList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [books, setBooks] = useState(mockBooks);
  const [categories, setCategories] = useState<string[]>(["All Categories"]);
  const [newBookAdded, setNewBookAdded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    categoryService.getCategories().then((res) => {
      if (res.success && res.data && res.data.length) {
        setCategories(["All Categories", ...res.data]);
      }
    });
  }, []);

  // Listen for new book uploads from localStorage or event
  useEffect(() => {
    const checkForNewBooks = () => {
      const newBooks = JSON.parse(localStorage.getItem('newBooks') || '[]');
      if (newBooks.length > books.length) {
        setBooks(newBooks);
        triggerBoomEffect();
      }
    };

    // Check every 2 seconds for new books
    const interval = setInterval(checkForNewBooks, 2000);
    return () => clearInterval(interval);
  }, [books.length]);

  const triggerBoomEffect = () => {
    setNewBookAdded(true);
    setTimeout(() => setNewBookAdded(false), 3000);
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddMockBook = () => {
    const newBook = {
      id: books.length + 1,
      title: "New Amazing Book",
      author: "New Author",
      category: "Law Books",
      price: 499,
      quantity: 25,
      status: "published",
      isNew: true
    };
    
    const updatedBooks = [newBook, ...books];
    setBooks(updatedBooks);
    localStorage.setItem('newBooks', JSON.stringify(updatedBooks));
    triggerBoomEffect();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 space-y-8 animate-in fade-in duration-1000">
      <style>
        {`
          @keyframes boom {
            0% {
              transform: scale(0.8);
              opacity: 0;
            }
            50% {
              transform: scale(1.05);
              opacity: 1;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.1); }
            50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.3); }
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
          }
          .animate-boom {
            animation: boom 0.6s ease-out;
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-glow {
            animation: glow 3s ease-in-out infinite;
          }
          .animate-slide-in {
            animation: slideIn 0.5s ease-out;
          }
          .animate-sparkle {
            animation: sparkle 0.8s ease-out;
          }
          .new-book-highlight {
            background: linear-gradient(90deg, #dcfce7, #bbf7d0, #dcfce7);
            background-size: 200% 100%;
            animation: shimmer 2s infinite;
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>

      {/* Boom Effect Overlay */}
      {newBookAdded && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="animate-sparkle">
            <div className="text-6xl">🎉</div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 animate-pulse" />
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-xl animate-glow">
              <BookOpen className="h-8 w-8 text-white animate-float" />
            </div>
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-white">
                Book Library
              </h2>
              <p className="text-xl text-slate-400 mt-2">
                Discover and manage your entire book collection
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleAddMockBook}
            className="h-12 px-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Add Demo Book
          </Button>
          <Button variant="outline" className="h-12 px-6 text-base font-semibold">
            <Download className="h-5 w-5 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Books", value: books.length, change: "+12%", color: "blue" },
          { label: "Available Stock", value: books.reduce((sum, book) => sum + book.quantity, 0), change: "+5%", color: "green" },
          { label: "Categories", value: new Set(books.map(book => book.category)).size, change: "+2", color: "purple" },
          { label: "Total Value", value: `₹${books.reduce((sum, book) => sum + (book.price * book.quantity), 0).toLocaleString()}`, change: "+18%", color: "orange" },
        ].map((stat, index) => (
          <Card 
            key={stat.label}
            className="border border-slate-600 bg-slate-800/80 shadow-xl backdrop-blur-sm group cursor-pointer hover:bg-slate-800 transition-all duration-500"
            style={{ 
              animationDelay: `${index * 150}ms`,
              animation: mounted ? `slideIn 0.6s ease-out ${index * 150}ms both` : 'none'
            }}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2 text-slate-100">
                    {stat.value}
                  </p>
                  <p className={`text-sm font-semibold mt-2 ${
                    stat.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-700 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-6 h-6 bg-slate-500 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Section */}
      <Card className="border border-slate-600 bg-slate-800/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-3 text-slate-100">
            <Filter className="h-6 w-6 text-slate-400" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search by title, author, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg border-slate-500 bg-slate-700/50 text-slate-100 placeholder:text-slate-400 rounded-xl"
              />
            </div>
            <div className="w-full lg:w-80">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-14 text-lg border-slate-500 bg-slate-700/50 text-slate-100 rounded-xl">
                  <Filter className="h-5 w-5 mr-3 text-slate-400" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-lg py-3 text-slate-200 focus:bg-slate-700">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 mt-6">
            <Badge variant="secondary" className="px-4 py-2 text-sm bg-slate-600 text-slate-200 border-slate-500">
              {filteredBooks.length} books found
            </Badge>
            {selectedCategory !== "All Categories" && (
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-emerald-900/40 text-emerald-300 border-emerald-600/50">
                Category: {selectedCategory}
              </Badge>
            )}
            {searchTerm && (
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-purple-900/40 text-purple-300 border-purple-600/50">
                Search: "{searchTerm}"
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card className="border border-slate-600 bg-slate-800/80 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-600 bg-slate-800">
          <CardTitle className="text-2xl font-bold flex items-center gap-3 text-slate-100">
            <BookOpen className="h-6 w-6 text-slate-400" />
            Books Inventory
            <Badge variant="secondary" className="ml-2 px-3 py-1 bg-slate-600 text-slate-200 border-slate-500">
              {filteredBooks.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-700/50 border-b border-slate-600 hover:bg-slate-700/70">
                  <TableHead className="h-16 text-lg font-bold text-slate-200">Book Title</TableHead>
                  <TableHead className="h-16 text-lg font-bold text-slate-200">Author</TableHead>
                  <TableHead className="h-16 text-lg font-bold text-slate-200">Category</TableHead>
                  <TableHead className="h-16 text-lg font-bold text-slate-200">Price</TableHead>
                  <TableHead className="h-16 text-lg font-bold text-slate-200">Stock</TableHead>
                  <TableHead className="h-16 text-lg font-bold text-slate-200">Status</TableHead>
                  <TableHead className="h-16 text-lg font-bold text-slate-200 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.map((book, index) => (
                  <TableRow 
                    key={book.id}
                    className={`border-b border-slate-600 hover:bg-slate-700/30 transition-all duration-300 ${
                      book.isNew ? 'new-book-highlight animate-boom' : ''
                    }`}
                    style={{ 
                      animationDelay: book.isNew ? '0s' : `${index * 50}ms`,
                      animation: mounted && !book.isNew ? `slideIn 0.5s ease-out ${index * 50}ms both` : 'none'
                    }}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-slate-300" />
                        </div>
                        <div>
                          <div className="font-semibold text-lg text-slate-100">
                            {book.title}
                          </div>
                          <div className="text-sm text-slate-400">ID: {book.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-lg font-medium text-slate-200">{book.author}</div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className="bg-slate-600/50 text-slate-200 border-slate-500 text-sm px-3 py-1">
                        {book.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-xl font-bold text-emerald-400">₹{book.price}</div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-semibold text-slate-200">{book.quantity}</div>
                        <div className="w-20 bg-slate-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              book.quantity > 50 ? 'bg-green-500' : 
                              book.quantity > 20 ? 'bg-yellow-500' : 'bg-red-500'
                            } transition-all duration-500`}
                            style={{ width: `${Math.min(100, (book.quantity / 100) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className={`
                        px-3 py-1 text-sm font-semibold border-0
                        ${book.status === 'published' 
                          ? 'bg-emerald-900/50 text-emerald-300' 
                          : book.status === 'pending'
                          ? 'bg-amber-900/50 text-amber-300'
                          : 'bg-red-900/50 text-red-300'
                        }
                      `}>
                        {book.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-slate-500 bg-slate-700 text-slate-100 hover:bg-slate-600" title="View">
                          <Eye className="h-4 w-4 text-slate-100" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-slate-500 bg-slate-700 text-slate-100 hover:bg-slate-600" title="Edit">
                          <Edit className="h-4 w-4 text-slate-100" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-slate-500 bg-slate-700 text-red-300 hover:bg-red-900/50" title="Delete">
                          <Trash2 className="h-4 w-4 text-red-300" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Empty State */}
          {filteredBooks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-24 w-24 text-slate-500 mb-6" />
              <h3 className="text-2xl font-semibold text-slate-300 mb-3">No books found</h3>
              <p className="text-slate-400 text-lg mb-6 max-w-md">
                {searchTerm || selectedCategory !== "All Categories" 
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by uploading your first book to the library"
                }
              </p>
              <Button 
                onClick={handleAddMockBook}
                className="h-12 px-8 text-lg font-semibold bg-slate-600 hover:bg-slate-500 text-white border-slate-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Demo Book
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookList;