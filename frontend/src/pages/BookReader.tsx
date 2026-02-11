// pages/BookReader.tsx - Complete version with navy blue color scheme from BookActions
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookService } from "@/services/bookService";
import { useAuth } from "@/contexts/AuthContext";
import {
  Loader2,
  BookOpen,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  Type,
  Columns,
  Bookmark,
  Share2,
  ChevronLeft,
  ChevronRight,
  Home,
  Menu,
  Maximize2,
  Minimize2,
  Settings,
  BookMarked,
  Clock,
  Eye,
  Printer,
  MoonStar,
  Laptop,
  BookText,
  FileText,
  X,
  Save,
  Search,
  User,
  AlertCircle,
  ShoppingCart,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// NAVY BLUE COLOR SCHEME from BookActions
const colors = {
  navy: '#1a2a4a',
  navyLight: '#2d4270',
  navyDark: '#0f1a2e',
  navyMuted: '#e8edf5',
  navyForeground: '#f8fafc',
  gold: '#d4a418',
  goldLight: '#e8b92f',
  goldMuted: '#fef9e7',
  success: '#166534',
  successLight: '#22c55e',
  successMuted: '#dcfce7',
  successForeground: '#ffffff',
  warning: '#d97706',
  warningMuted: '#fef3c7',
  border: '#e2e8f0',
  background: '#ffffff',
  foreground: '#1e293b',
  muted: '#64748b',
};

const BookReader = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const format = searchParams.get("format") || "text";

  // Book content state
  const [bookContent, setBookContent] = useState<string>("");
  const [bookInfo, setBookInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsPurchase, setNeedsPurchase] = useState(false);
  const [purchaseInfo, setPurchaseInfo] = useState<any>(null);
  const [textFormat, setTextFormat] = useState<"plain" | "html" | "markdown">("plain");
  const [wordCount, setWordCount] = useState(0);
  const [estimatedReadingTime, setEstimatedReadingTime] = useState(0);
  
  // Page calculation state
  const [pageHeight, setPageHeight] = useState(0);
  const [pages, setPages] = useState<Array<{ start: number; end: number }>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);
  const [isBookCompleted, setIsBookCompleted] = useState(false);

  // Reading preferences
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [letterSpacing, setLetterSpacing] = useState(0.5);
  const [textAlign, setTextAlign] = useState<"left" | "justify" | "center">("justify");
  const [fontFamily, setFontFamily] = useState("'Merriweather', Georgia, serif");
  const [theme, setTheme] = useState<"light" | "dark" | "sepia" | "night">("light");
  const [columnCount, setColumnCount] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [isTextFormat, setIsTextFormat] = useState(format === "text");
  const [viewMode, setViewMode] = useState<"clean" | "original">("clean");

  // Reading progress
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [readingTime, setReadingTime] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  
  // Refs
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Constants for A4 size (in pixels)
  const A4_HEIGHT_PX = 1123; // A4 height at 96 DPI
  const A4_WIDTH_PX = 794;  // A4 width at 96 DPI
  const PAGE_MARGIN = 32;   // Margin in pixels (16px on top and bottom)

  // Timer for reading time
  useEffect(() => {
    const timer = setInterval(() => {
      setReadingTime((prev) => prev + 1);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Save reading preferences to localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem("readingPreferences");
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences);
      setFontSize(preferences.fontSize || 18);
      setLineHeight(preferences.lineHeight || 1.8);
      setFontFamily(preferences.fontFamily || "'Merriweather', Georgia, serif");
      setTheme(preferences.theme || "light");
      setViewMode(preferences.viewMode || "clean");
    }
  }, []);

  // Save preferences when they change
  useEffect(() => {
    const preferences = {
      fontSize,
      lineHeight,
      fontFamily,
      theme,
      viewMode,
    };
    localStorage.setItem("readingPreferences", JSON.stringify(preferences));
  }, [fontSize, lineHeight, fontFamily, theme, viewMode]);

  // Calculate page breaks based on A4 height
  const calculatePages = useCallback(() => {
    if (!contentRef.current || !bookContent) return;
    
    const contentElement = contentRef.current;
    
    // Force reflow to get accurate measurements
    contentElement.style.display = 'none';
    void contentElement.offsetHeight;
    contentElement.style.display = '';
    
    // Get actual height of content
    const totalHeight = contentElement.scrollHeight;
    setContentHeight(totalHeight);
    
    // Calculate number of A4 pages
    const effectivePageHeight = A4_HEIGHT_PX - (PAGE_MARGIN * 2);
    const calculatedPages = Math.ceil(totalHeight / effectivePageHeight);
    setTotalPages(Math.max(1, calculatedPages));
    
    // Create page boundaries
    const pageBoundaries: Array<{ start: number; end: number }> = [];
    for (let i = 0; i < calculatedPages; i++) {
      const start = i * effectivePageHeight;
      const end = Math.min((i + 1) * effectivePageHeight, totalHeight);
      pageBoundaries.push({ start, end });
    }
    
    setPages(pageBoundaries);
    setPageHeight(effectivePageHeight);
    
    // Calculate word count from actual content
    const text = contentElement.textContent || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setEstimatedReadingTime(Math.ceil(words / 200));
    
  }, [bookContent, fontSize, lineHeight, fontFamily, columnCount]);

  // Update pages when content or settings change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (bookContent && contentRef.current) {
        calculatePages();
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, [bookContent, fontSize, lineHeight, fontFamily, columnCount, calculatePages]);

  // Load book content
  useEffect(() => {
    if (id) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        toast.error("Please log in to read this book");
        navigate('/auth', { state: { returnTo: `/book/${id}/read?format=${format}` } });
        return;
      }
      loadBookContent();
    }
  }, [id, isAuthenticated, format]);

  const loadBookContent = async () => {
    try {
      setLoading(true);
      setError(null);
      setNeedsPurchase(false);
      
      // First get book info
      const bookResponse = await BookService.getBookById(id!);
      if (bookResponse.success && bookResponse.data?.book) {
        setBookInfo(bookResponse.data.book);
      } else {
        throw new Error(bookResponse.message || "Failed to load book information");
      }

      // Check purchase status for PDF format
      if (format === "pdf") {
        const purchaseResponse = await BookService.checkPurchaseStatus(id!);
        if (!purchaseResponse.success || !purchaseResponse.data?.hasPurchased) {
          setNeedsPurchase(true);
          toast.error("Please purchase this book to read the PDF version");
          return;
        }
      }

      // Fetch book content using the BookService
      const response = await BookService.readFullBook(id!, format as "text" | "pdf");
      
      if (response.success && response.data) {
        const data = response.data;
        
        // Handle text format response
        if (format === "text" && data) {
          // Check if we have textContent directly in the response
          if (data.textContent) {
            setBookContent(data.textContent);
            setTextFormat(data.textFormat || "html");
          } 
          // Check for content field (if API returns content directly)
          else if (data.content) {
            setBookContent(data.content);
            setTextFormat(data.textFormat || "plain");
          }
          // Check for book field with textContent
          else if (data.book?.textContent) {
            setBookContent(data.book.textContent);
            setTextFormat(data.book.textFormat || "plain");
          } else {
            throw new Error("No text content found in response");
          }
        }
        
        // Set purchase info if available
        if (data.purchase) {
          setPurchaseInfo(data.purchase);
        }
        
        // Load completion status
        const completedBooks = JSON.parse(localStorage.getItem('completedBooks') || '{}');
        if (completedBooks[id!]) {
          setIsBookCompleted(true);
          setHasReachedEnd(true);
          setReadingProgress(100);
          setCurrentPage(totalPages);
        }
        
        // Save reading position if available
        const savedPosition = localStorage.getItem(`book_${id}_position`);
        if (savedPosition && containerRef.current) {
          setTimeout(() => {
            containerRef.current!.scrollTop = parseInt(savedPosition);
            // Recalculate pages after content is loaded
            setTimeout(calculatePages, 300);
          }, 100);
        } else {
          // Calculate pages after content is loaded
          setTimeout(calculatePages, 300);
        }
        
      } else {
        throw new Error(response.message || "Failed to load book content");
      }
      
    } catch (err: any) {
      console.error("Error loading book:", err);
      setError(err.message || "Failed to load book content");
      
      // Don't show toast for purchase required errors (handled separately)
      if (!err.message.includes("purchase") && !err.message.includes("402")) {
        toast.error(err.message || "Failed to load book content");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle reaching the end of the book
  const handleReachEnd = useCallback(() => {
    if (!hasReachedEnd && id) {
      setHasReachedEnd(true);
      setIsBookCompleted(true);
      setReadingProgress(100);
      setCurrentPage(totalPages);
      
      // Save completion status
      const completedBooks = JSON.parse(localStorage.getItem('completedBooks') || '{}');
      completedBooks[id] = {
        completedAt: new Date().toISOString(),
        readingTime: readingTime,
      };
      localStorage.setItem('completedBooks', JSON.stringify(completedBooks));
      
      // Show completion toast
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" style={{ color: colors.success }} />
          <div>
            <p className="font-semibold">Congratulations! 🎉</p>
            <p className="text-sm">You've finished reading this book!</p>
          </div>
        </div>,
        { duration: 5000 }
      );
    }
  }, [hasReachedEnd, id, totalPages, readingTime]);

  // Save reading position on scroll - UPDATED for proper progress calculation
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current && containerRef.current) {
        const container = containerRef.current;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        const maxScroll = scrollHeight - clientHeight;
        
        // Check if we're at the end (within 50px)
        const isAtEnd = scrollTop >= maxScroll - 50;
        
        if (isAtEnd && !hasReachedEnd) {
          handleReachEnd();
        }
        
        // Calculate scroll-based progress (0-100%)
        const scrollProgress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
        
        // Calculate page-based progress
        let pageProgress = 0;
        if (pages.length > 0 && pageHeight > 0) {
          const scrollPosition = scrollTop + (clientHeight / 3);
          const pageIndex = Math.min(Math.floor(scrollPosition / pageHeight), pages.length - 1);
          const newPage = Math.max(1, pageIndex + 1);
          
          if (newPage !== currentPage) {
            setCurrentPage(newPage);
          }
          
          pageProgress = (newPage / totalPages) * 100;
        } else if (pageHeight > 0) {
          const pageIndex = Math.min(Math.floor(scrollTop / pageHeight), totalPages - 1);
          const newPage = Math.max(1, pageIndex + 1);
          
          if (newPage !== currentPage) {
            setCurrentPage(newPage);
          }
          
          pageProgress = (newPage / totalPages) * 100;
        }
        
        // Use weighted progress: 70% page-based, 30% scroll-based
        // This ensures smooth progression and reaches 100% at the end
        const weightedProgress = hasReachedEnd ? 100 : 
          Math.min(99, (pageProgress * 0.7) + (scrollProgress * 0.3));
        
        setReadingProgress(weightedProgress);
        
        // Save position to localStorage
        if (id) {
          localStorage.setItem(`book_${id}_position`, scrollTop.toString());
          localStorage.setItem(`book_${id}_page`, currentPage.toString());
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      // Initial calculation
      setTimeout(handleScroll, 100);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [id, pageHeight, totalPages, pages, currentPage, hasReachedEnd, handleReachEnd]);

  // Load bookmarks from localStorage
  useEffect(() => {
    if (id) {
      const savedBookmarks = localStorage.getItem(`book_${id}_bookmarks`);
      if (savedBookmarks) {
        try {
          setBookmarks(JSON.parse(savedBookmarks));
        } catch (err) {
          console.error("Error parsing bookmarks:", err);
        }
      }
      
      // Load saved page
      const savedPage = localStorage.getItem(`book_${id}_page`);
      if (savedPage) {
        const pageNum = parseInt(savedPage);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
          setCurrentPage(pageNum);
        }
      }
    }
  }, [id, totalPages]);

  // Search in book content
  const handleSearch = () => {
    if (!searchQuery.trim() || !bookContent) {
      setSearchResults([]);
      toast.info("Please enter a search term");
      return;
    }

    // Create a temporary div to extract plain text from HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = bookContent;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    const lowerQuery = searchQuery.toLowerCase();
    const contentLower = plainText.toLowerCase();
    const indices: number[] = [];
    let position = contentLower.indexOf(lowerQuery);
    
    while (position !== -1) {
      indices.push(position);
      position = contentLower.indexOf(lowerQuery, position + 1);
    }
    
    setSearchResults(indices);
    setCurrentSearchIndex(0);
    
    if (indices.length > 0) {
      toast.success(`Found ${indices.length} result${indices.length !== 1 ? 's' : ''}`);
      scrollToSearchResult(indices[0]);
    } else {
      toast.info("No results found");
    }
  };

  const scrollToSearchResult = (position: number) => {
    if (contentRef.current && containerRef.current) {
      // Create a temporary div to get line count
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = bookContent;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      const textBefore = plainText.substring(0, position);
      const lines = textBefore.split('\n').length;
      
      // Approximate scroll position
      const lineHeight = parseInt(getComputedStyle(contentRef.current).lineHeight) || 24;
      const scrollTo = lines * lineHeight - 200; // Offset from top
      
      containerRef.current.scrollTo({
        top: Math.max(0, scrollTo),
        behavior: "smooth"
      });
      
      // Highlight the search term temporarily
      highlightSearchTerm(position);
    }
  };

  const highlightSearchTerm = (position: number) => {
    if (!contentRef.current) return;
    
    // Create a temporary div to extract plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = bookContent;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    const before = plainText.substring(0, position);
    const searchLength = searchQuery.length;
    const after = plainText.substring(position + searchLength);
    
    // Find the search term in the original HTML
    const searchRegex = new RegExp(`(${searchQuery})`, 'gi');
    const highlightedHTML = bookContent.replace(searchRegex, `<mark style="background-color: ${colors.goldMuted}; color: ${colors.gold};">$1</mark>`);
    
    // Update content with highlighted version
    contentRef.current.innerHTML = highlightedHTML;
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      if (contentRef.current) {
        renderContent();
      }
    }, 3000);
  };

  const nextSearchResult = () => {
    if (searchResults.length === 0) return;
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);
    scrollToSearchResult(searchResults[nextIndex]);
  };

  const prevSearchResult = () => {
    if (searchResults.length === 0) return;
    const prevIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentSearchIndex(prevIndex);
    scrollToSearchResult(searchResults[prevIndex]);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
        toast.error("Fullscreen not supported");
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Toggle bookmark
  const toggleBookmark = () => {
    if (!contentRef.current || !containerRef.current) return;
    
    const scrollTop = containerRef.current.scrollTop;
    const scrollHeight = containerRef.current.scrollHeight;
    const bookmarkPosition = Math.round((scrollTop / scrollHeight) * 100);
    
    if (bookmarks.includes(bookmarkPosition)) {
      setBookmarks(bookmarks.filter(pos => pos !== bookmarkPosition));
      toast.success("Bookmark removed");
    } else {
      const newBookmarks = [...bookmarks, bookmarkPosition].sort((a, b) => a - b);
      setBookmarks(newBookmarks);
      localStorage.setItem(`book_${id}_bookmarks`, JSON.stringify(newBookmarks));
      toast.success(`Bookmark added at page ${currentPage}`);
    }
  };

  const goToBookmark = (position: number) => {
    if (containerRef.current) {
      const scrollHeight = containerRef.current.scrollHeight;
      containerRef.current.scrollTo({
        top: (position / 100) * scrollHeight,
        behavior: "smooth"
      });
      toast.info(`Jumped to bookmark at ${position}%`);
    }
  };

  // Format reading time
  const formatReadingTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Jump to specific page
  const goToPage = (pageNumber: number) => {
    if (!containerRef.current || pageNumber < 1 || pageNumber > totalPages) return;
    
    const pageIndex = pageNumber - 1;
    let scrollPosition = 0;
    
    if (pages.length > 0 && pageIndex < pages.length) {
      // Use page boundaries if available
      scrollPosition = pages[pageIndex].start;
    } else if (pageHeight > 0) {
      // Fallback to calculated position
      scrollPosition = pageIndex * pageHeight;
    }
    
    containerRef.current.scrollTo({
      top: scrollPosition,
      behavior: "smooth"
    });
    
    setCurrentPage(pageNumber);
    
    // Update progress based on page
    if (pageNumber === totalPages) {
      handleReachEnd();
    } else {
      const pageProgress = (pageNumber / totalPages) * 100;
      setReadingProgress(pageProgress);
    }
    
    if (pageNumber === totalPages) {
      toast.success(`You've reached the final page!`);
    } else {
      toast.info(`Jumped to page ${pageNumber} of ${totalPages}`);
    }
  };

  // Share book
  const shareBook = () => {
    if (navigator.share) {
      navigator.share({
        title: bookInfo?.title || "Book",
        text: `Check out "${bookInfo?.title}" by ${bookInfo?.author} on our platform`,
        url: window.location.href,
      }).catch(err => {
        console.error("Share failed:", err);
        fallbackShare();
      });
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast.success("Link copied to clipboard");
      });
  };

  // Handle purchase
  const handlePurchase = () => {
    if (!bookInfo) return;
    
    toast.info("Redirecting to purchase page...");
    // Navigate to book detail page for purchase
    navigate(`/book/${id}`, { 
      state: { 
        showPurchaseModal: true,
        format: 'pdf'
      } 
    });
  };

  // Handle PDF view
  const handleViewPDF = () => {
    if (!bookInfo?.pdfFile) {
      toast.error("PDF file not available");
      return;
    }
    
    if (!purchaseInfo) {
      setNeedsPurchase(true);
      return;
    }
    
    // Open PDF in new tab or embedded viewer
    const pdfUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${bookInfo.pdfFile}`;
    window.open(pdfUrl, '_blank');
  };

  // Render content based on format and view mode
  const renderContent = () => {
    if (!contentRef.current) return;
    
    if (textFormat === "html") {
      if (viewMode === "clean") {
        // Clean mode: Remove data attributes for cleaner display
        let cleanHTML = bookContent.replace(/ data-(start|end)="[^"]*"/g, '');
        cleanHTML = cleanHTML.replace(/<hr[^>]*>/g, '<div class="my-8 border-t border-gray-300"></div>');
        contentRef.current.innerHTML = cleanHTML;
      } else {
        // Original mode: Show HTML as is
        contentRef.current.innerHTML = bookContent;
      }
    } else if (textFormat === "markdown") {
      // Basic markdown rendering
      let markdownHTML = bookContent
        .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
        .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
        .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
        .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 my-4 italic">$1</blockquote>')
        .replace(/\n\n/g, '</p><p class="mt-4">')
        .replace(/\n/g, '<br>');
      markdownHTML = `<p class="mt-4">${markdownHTML}</p>`;
      contentRef.current.innerHTML = markdownHTML;
    } else {
      // Plain text with paragraph formatting
      const paragraphs = bookContent.split(/\n\s*\n/);
      const formattedHTML = paragraphs.map(p => 
        `<p class="mt-4">${p.replace(/\n/g, '<br>')}</p>`
      ).join('');
      contentRef.current.innerHTML = formattedHTML;
    }
    
    // Recalculate pages after content is rendered
    setTimeout(calculatePages, 100);
  };

  // Re-render content when view mode or content changes
  useEffect(() => {
    if (bookContent) {
      renderContent();
    }
  }, [bookContent, viewMode, textFormat]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: colors.navyMuted }}>
        <div className="text-center space-y-6">
          <div className="relative">
            <BookOpen className="w-16 h-16 mx-auto animate-pulse" style={{ color: colors.navy }} />
            <Loader2 className="w-8 h-8 animate-spin absolute -top-2 -right-2" style={{ color: colors.navy }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.navy }}>Loading Book</h2>
            <p className="mb-2" style={{ color: colors.navy }}>
              {isTextFormat ? "Fetching text content..." : "Loading PDF document..."}
            </p>
            <p className="text-sm mb-2" style={{ color: colors.navy }}>
              Please wait while we prepare your reading experience
            </p>
          </div>
          <Progress 
            value={45} 
            className="w-64" 
            style={{ 
              backgroundColor: colors.navyMuted,
              ['--progress-background' as any]: colors.navy 
            }}
          />
        </div>
      </div>
    );
  }

  if (error || needsPurchase) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: colors.navyMuted }}>
        <Card className="w-full max-w-md border-2 shadow-xl" style={{ borderColor: colors.navy, backgroundColor: colors.background }}>
          <CardContent className="p-6 text-center">
            {needsPurchase ? (
              <>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: colors.navyMuted }}>
                  <AlertCircle className="w-8 h-8" style={{ color: colors.navy }} />
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: colors.navy }}>Purchase Required</h2>
                <p className="text-muted-foreground mb-4">
                  You need to purchase this book to access the {format === "pdf" ? "PDF" : "full"} version.
                </p>
                {bookInfo && (
                  <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: colors.navyMuted }}>
                    <h3 className="font-semibold mb-1" style={{ color: colors.navy }}>{bookInfo.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">by {bookInfo.author}</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold" style={{ color: colors.navy }}>
                        ${bookInfo.price}
                      </span>
                      {bookInfo.discountPercentage && (
                        <Badge className="bg-red-500 text-white">
                          {bookInfo.discountPercentage}% OFF
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={handlePurchase} 
                    className="gap-2"
                    style={{ backgroundColor: colors.navy, color: colors.navyForeground }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Purchase Now
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/book/${id}`)}
                    style={{ borderColor: colors.navy, color: colors.navy }}
                  >
                    View Details
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: colors.navy }}>Failed to Load Book</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => loadBookContent()} 
                    style={{ backgroundColor: colors.navy, color: colors.navyForeground }}
                  >
                    <Loader2 className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                    style={{ borderColor: colors.navy, color: colors.navy }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentTheme = {
    bg: colors.navyMuted,
    text: colors.foreground,
    contentBg: colors.background,
    border: colors.border,
    highlight: colors.goldMuted,
  };
  
  const readTime = estimatedReadingTime || Math.ceil(wordCount / 200);
  const progressPercentage = Math.round(readingProgress);

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: colors.navyMuted }}>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-sm" style={{ 
        backgroundColor: colors.navy, 
        borderBottom: `1px solid ${colors.navyLight}`,
        color: colors.navyForeground 
      }}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Back Button with Navy Blue */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2"
                style={{ 
                  color: colors.navyForeground,
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.navyLight}`,
                  borderRadius: '8px',
                  padding: '6px 12px',
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>

              <div className="hidden md:block max-w-xs">
                <h1 className="text-sm font-semibold truncate" style={{ color: colors.navyForeground }}>
                  {bookInfo?.title || "Reading Book"}
                </h1>
                <p className="text-xs truncate flex items-center gap-1" style={{ color: `${colors.navyForeground}90` }}>
                  <User className="w-3 h-3" />
                  {bookInfo?.author || "Unknown Author"}
                </p>
              </div>
            </div>

            {/* Center - Reading Progress */}
            <div className="flex-1 max-w-2xl mx-2 sm:mx-4">
              <div className="flex items-center justify-center gap-2 sm:gap-4">
                <div className="text-sm text-center" style={{ color: colors.navyForeground }}>
                  <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="hidden sm:inline">Reading:</span>
                      <span>{formatReadingTime(readingTime)}</span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      <span>Page</span>
                      <span className="font-bold">{currentPage}</span>
                      <span>of</span>
                      <span>{totalPages}</span>
                      {isBookCompleted && (
                        <Badge className="ml-1" style={{ 
                          backgroundColor: colors.success, 
                          color: colors.successForeground,
                          borderColor: colors.success 
                        }}>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      <Type className="w-3 h-3" />
                      <span className="hidden sm:inline">Words:</span>
                      <span>{wordCount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Progress 
                      value={progressPercentage} 
                      className="w-32 sm:w-48"
                      style={{ 
                        backgroundColor: colors.navyLight,
                        ['--progress-background' as any]: colors.navyForeground
                      }}
                    />
                    <span className="text-xs font-medium min-w-[40px]" style={{ color: colors.navyForeground }}>
                      {progressPercentage}%
                      {isBookCompleted && " ✅"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(true)}
                title="Search"
                className="h-8 w-8"
                style={{ color: colors.navyForeground, backgroundColor: 'transparent' }}
              >
                <Search className="w-3.5 h-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleBookmark}
                title="Bookmark this page"
                className="h-8 w-8"
                style={{ color: colors.navyForeground, backgroundColor: 'transparent' }}
              >
                <Bookmark className={`w-3.5 h-3.5 ${bookmarks.length > 0 ? "fill-current" : ""}`} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                className="h-8 w-8 hidden sm:inline-flex"
                style={{ color: colors.navyForeground, backgroundColor: 'transparent' }}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" title="Settings" className="h-8 w-8" style={{ color: colors.navyForeground, backgroundColor: 'transparent' }}>
                    <Settings className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72" style={{ 
                  backgroundColor: colors.navy, 
                  borderColor: colors.navyLight,
                  color: colors.navyForeground 
                }}>
                  <DropdownMenuLabel style={{ color: colors.navyForeground }}>Reading Settings</DropdownMenuLabel>
                  
                  <div className="px-2 py-1.5">
                    <Label className="text-xs" style={{ color: colors.navyForeground }}>Theme</Label>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <Button
                        size="sm"
                        variant={theme === "light" ? "default" : "outline"}
                        onClick={() => setTheme("light")}
                        className="justify-start"
                        style={{
                          backgroundColor: theme === "light" ? colors.navyLight : 'transparent',
                          borderColor: colors.navyLight,
                          color: colors.navyForeground
                        }}
                      >
                        <Sun className="w-3 h-3 mr-2" />
                        Light
                      </Button>
                      <Button
                        size="sm"
                        variant={theme === "dark" ? "default" : "outline"}
                        onClick={() => setTheme("dark")}
                        className="justify-start"
                        style={{
                          backgroundColor: theme === "dark" ? colors.navyLight : 'transparent',
                          borderColor: colors.navyLight,
                          color: colors.navyForeground
                        }}
                      >
                        <Moon className="w-3 h-3 mr-2" />
                        Dark
                      </Button>
                      <Button
                        size="sm"
                        variant={theme === "sepia" ? "default" : "outline"}
                        onClick={() => setTheme("sepia")}
                        className="justify-start"
                        style={{
                          backgroundColor: theme === "sepia" ? colors.navyLight : 'transparent',
                          borderColor: colors.navyLight,
                          color: colors.navyForeground
                        }}
                      >
                        <BookText className="w-3 h-3 mr-2" />
                        Sepia
                      </Button>
                      <Button
                        size="sm"
                        variant={theme === "night" ? "default" : "outline"}
                        onClick={() => setTheme("night")}
                        className="justify-start"
                        style={{
                          backgroundColor: theme === "night" ? colors.navyLight : 'transparent',
                          borderColor: colors.navyLight,
                          color: colors.navyForeground
                        }}
                      >
                        <MoonStar className="w-3 h-3 mr-2" />
                        Night
                      </Button>
                    </div>
                  </div>

                  {textFormat === "html" && (
                    <div className="px-2 py-1.5">
                      <Label className="text-xs" style={{ color: colors.navyForeground }}>View Mode</Label>
                      <div className="flex gap-1 mt-1">
                        <Button
                          size="sm"
                          variant={viewMode === "clean" ? "default" : "outline"}
                          onClick={() => setViewMode("clean")}
                          className="flex-1"
                          style={{
                            backgroundColor: viewMode === "clean" ? colors.navyLight : 'transparent',
                            borderColor: colors.navyLight,
                            color: colors.navyForeground
                          }}
                        >
                          Clean
                        </Button>
                        <Button
                          size="sm"
                          variant={viewMode === "original" ? "default" : "outline"}
                          onClick={() => setViewMode("original")}
                          className="flex-1"
                          style={{
                            backgroundColor: viewMode === "original" ? colors.navyLight : 'transparent',
                            borderColor: colors.navyLight,
                            color: colors.navyForeground
                          }}
                        >
                          Original
                        </Button>
                      </div>
                    </div>
                  )}

                  <Separator className="my-2" style={{ backgroundColor: colors.navyLight }} />

                  <div className="px-2 py-1.5">
                    <Label className="text-xs" style={{ color: colors.navyForeground }}>Font Size: {fontSize}px</Label>
                    <Slider
                      value={[fontSize]}
                      onValueChange={([value]) => setFontSize(value)}
                      min={12}
                      max={32}
                      step={1}
                      className="mt-2"
                      style={{ ['--slider-background' as any]: colors.navyLight }}
                    />
                  </div>

                  <div className="px-2 py-1.5">
                    <Label className="text-xs" style={{ color: colors.navyForeground }}>Line Height: {lineHeight.toFixed(1)}</Label>
                    <Slider
                      value={[lineHeight]}
                      onValueChange={([value]) => setLineHeight(value)}
                      min={1.2}
                      max={2.5}
                      step={0.1}
                      className="mt-2"
                      style={{ ['--slider-background' as any]: colors.navyLight }}
                    />
                  </div>

                  <div className="px-2 py-1.5">
                    <Label className="text-xs" style={{ color: colors.navyForeground }}>Font Family</Label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full mt-1 p-2 text-sm border rounded"
                      style={{ 
                        backgroundColor: colors.navyDark, 
                        borderColor: colors.navyLight, 
                        color: colors.navyForeground 
                      }}
                    >
                      <option value="'Merriweather', Georgia, serif">Merriweather</option>
                      <option value="'Georgia', serif">Georgia</option>
                      <option value="'Times New Roman', Times, serif">Times New Roman</option>
                      <option value="'Arial', sans-serif">Arial</option>
                      <option value="'Roboto', sans-serif">Roboto</option>
                      <option value="'Open Sans', sans-serif">Open Sans</option>
                      <option value="'Courier New', monospace">Courier New</option>
                    </select>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Sheet open={showTableOfContents} onOpenChange={setShowTableOfContents}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" title="Table of Contents" className="h-8 w-8" style={{ color: colors.navyForeground, backgroundColor: 'transparent' }}>
                    <Menu className="w-3.5 h-3.5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 sm:w-96" style={{ 
                  backgroundColor: colors.navy, 
                  borderColor: colors.navyLight 
                }}>
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2" style={{ color: colors.navyForeground }}>
                      <BookOpen className="w-4 h-4" />
                      {bookInfo?.title || "Book"}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    {/* Book Info */}
                    <div className="mb-6 p-3 rounded-lg" style={{ 
                      backgroundColor: colors.navyDark, 
                      border: `1px solid ${colors.navyLight}` 
                    }}>
                      <div className="flex items-start gap-3">
                        {bookInfo?.coverImages?.[0] && (
                          <img
                            src={bookInfo.coverImages[0]}
                            alt={bookInfo.title}
                            className="w-12 h-16 object-cover rounded"
                            style={{ border: `1px solid ${colors.navyLight}` }}
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-sm" style={{ color: colors.navyForeground }}>{bookInfo?.title}</h3>
                          <p className="text-xs" style={{ color: `${colors.navyForeground}90` }}>by {bookInfo?.author}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs" style={{ 
                              borderColor: colors.navyLight, 
                              color: colors.navyForeground 
                            }}>
                              {format === "text" ? "Text" : "PDF"}
                            </Badge>
                            <Badge variant="outline" className="text-xs" style={{ 
                              borderColor: colors.navyLight, 
                              color: colors.navyForeground 
                            }}>
                              {readTime} min read
                            </Badge>
                            <Badge variant="outline" className="text-xs" style={{ 
                              borderColor: colors.navyLight, 
                              color: colors.navyForeground 
                            }}>
                              {totalPages} pages
                            </Badge>
                            {isBookCompleted && (
                              <Badge className="text-xs" style={{ 
                                backgroundColor: colors.success, 
                                color: colors.successForeground,
                                borderColor: colors.success 
                              }}>
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {bookmarks.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: colors.navyForeground }}>
                          <BookMarked className="w-4 h-4" />
                          Bookmarks ({bookmarks.length})
                        </h3>
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                          {bookmarks.map((position, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              className="w-full justify-start text-sm h-auto py-2"
                              onClick={() => {
                                goToBookmark(position);
                                setShowTableOfContents(false);
                              }}
                              style={{ color: colors.navyForeground, backgroundColor: 'transparent' }}
                            >
                              <div className="flex items-center gap-2 w-full">
                                <Bookmark className="w-3 h-3 fill-current flex-shrink-0" style={{ color: colors.navyLight }} />
                                <div className="flex-1 text-left">
                                  <div className="font-medium">Bookmark {index + 1}</div>
                                  <div className="text-xs" style={{ color: `${colors.navyForeground}90` }}>
                                    Page {Math.ceil((position / 100) * totalPages)} • {position}%
                                  </div>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newBookmarks = bookmarks.filter((_, i) => i !== index);
                                    setBookmarks(newBookmarks);
                                    localStorage.setItem(`book_${id}_bookmarks`, JSON.stringify(newBookmarks));
                                    toast.success("Bookmark removed");
                                  }}
                                  style={{ color: colors.navyForeground, backgroundColor: 'transparent' }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <h3 className="font-semibold mb-2" style={{ color: colors.navyForeground }}>Page Navigation</h3>
                    <div className="space-y-1">
                      {Array.from({ length: Math.min(10, totalPages) }).map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                          <Button
                            key={index}
                            variant="ghost"
                            className="w-full justify-start text-sm"
                            onClick={() => {
                              goToPage(pageNumber);
                              setShowTableOfContents(false);
                            }}
                            style={{ color: colors.navyForeground, backgroundColor: 'transparent' }}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>Page {pageNumber}</span>
                              {pageNumber === currentPage && (
                                <Badge variant="secondary" className="text-xs" style={{ 
                                  backgroundColor: colors.navyLight, 
                                  color: colors.navyForeground 
                                }}>
                                  Current
                                </Badge>
                              )}
                              {pageNumber === totalPages && isBookCompleted && (
                                <CheckCircle className="w-3 h-3" style={{ color: colors.success }} />
                              )}
                            </div>
                          </Button>
                        );
                      })}
                      {totalPages > 10 && (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="1"
                            max={totalPages}
                            placeholder="Page number"
                            className="flex-1 h-8"
                            style={{ 
                              backgroundColor: colors.navyDark, 
                              borderColor: colors.navyLight, 
                              color: colors.navyForeground 
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const pageNum = parseInt((e.target as HTMLInputElement).value);
                                if (pageNum >= 1 && pageNum <= totalPages) {
                                  goToPage(pageNum);
                                  setShowTableOfContents(false);
                                }
                              }
                            }}
                          />
                          <Button 
                            size="sm" 
                            className="h-8"
                            onClick={() => {
                              const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                              if (input) {
                                const pageNum = parseInt(input.value);
                                if (pageNum >= 1 && pageNum <= totalPages) {
                                  goToPage(pageNum);
                                  setShowTableOfContents(false);
                                }
                              }
                            }}
                            style={{ 
                              backgroundColor: colors.navyLight, 
                              color: colors.navyForeground, 
                              borderColor: colors.navyLight 
                            }}
                          >
                            Go
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Reading Area */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <Card className="border-2 shadow-lg overflow-hidden" style={{ 
              backgroundColor: colors.background, 
              borderColor: colors.navyLight 
            }}>
              {/* Book Stats Bar */}
              <div className="px-4 py-2 flex items-center justify-between text-sm" style={{ 
                borderBottom: `1px solid ${colors.navyLight}`,
                color: colors.navy 
              }}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>
                      {format === "text" ? "Text Format" : "PDF Document"} • 
                      <span className="ml-1 capitalize">{textFormat}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{readTime} min read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Type className="w-3.5 h-3.5" />
                    <span>{wordCount.toLocaleString()} words</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Pages: {totalPages} (A4)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {purchaseInfo && (
                    <Badge style={{ 
                      backgroundColor: colors.navyMuted, 
                      color: colors.navy,
                      borderColor: colors.navy 
                    }}>
                      Purchased
                    </Badge>
                  )}
                  {isBookCompleted && (
                    <Badge style={{ 
                      backgroundColor: colors.success, 
                      color: colors.successForeground,
                      borderColor: colors.success 
                    }}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </div>

              {/* Reading Area */}
              <div
                ref={containerRef}
                className="h-[calc(100vh-16rem)] sm:h-[calc(100vh-14rem)] overflow-y-auto scroll-smooth relative"
                style={{ backgroundColor: colors.background }}
              >
                <div className="p-4 sm:p-6 md:p-8">
                  <div
                    ref={contentRef}
                    className="max-w-3xl mx-auto"
                    style={{
                      fontSize: `${fontSize}px`,
                      lineHeight: lineHeight,
                      letterSpacing: `${letterSpacing}px`,
                      textAlign: textAlign,
                      fontFamily: fontFamily,
                      columnCount: columnCount,
                      columnGap: "3rem",
                      color: colors.foreground,
                    }}
                  >
                    {/* Content will be rendered here via renderContent() */}
                  </div>
                </div>
                
                {/* End of book indicator */}
                {hasReachedEnd && (
                  <div className="text-center py-12" style={{ backgroundColor: colors.navyMuted }}>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: colors.navy }}>
                      <CheckCircle className="w-8 h-8" style={{ color: colors.navyForeground }} />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: colors.navy }}>Congratulations! 🎉</h3>
                    <p className="mb-4" style={{ color: colors.navy }}>You've finished reading this book</p>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        variant="outline" 
                        onClick={() => navigate(`/book/${id}`)}
                        style={{ 
                          borderColor: colors.navy, 
                          color: colors.navy, 
                          backgroundColor: colors.navyMuted 
                        }}
                      >
                        View Book Details
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/library')}
                        style={{ 
                          borderColor: colors.navy, 
                          color: colors.navy, 
                          backgroundColor: colors.navyMuted 
                        }}
                      >
                        Back to Library
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Controls */}
              <div className="p-4" style={{ borderTop: `1px solid ${colors.navyLight}` }}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={shareBook}
                      className="gap-2"
                      style={{ color: colors.navy, backgroundColor: 'transparent' }}
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Share</span>
                    </Button>

                    
                    {format === "pdf" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewPDF}
                        className="gap-2"
                        style={{ 
                          borderColor: colors.navy, 
                          color: colors.navy, 
                          backgroundColor: colors.navyMuted 
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">View PDF</span>
                      </Button>
                    )}
                    
                    {textFormat === "html" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode(mode => mode === "clean" ? "original" : "clean")}
                        className="gap-2"
                        style={{ 
                          borderColor: colors.navy, 
                          color: colors.navy, 
                          backgroundColor: colors.navyMuted 
                        }}
                      >
                        {viewMode === "clean" ? "Show Original" : "Clean View"}
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setFontSize(f => Math.max(12, f - 1))}
                      disabled={fontSize <= 12}
                      title="Decrease font size"
                      className="h-8 w-8"
                      style={{ color: colors.navy, backgroundColor: 'transparent' }}
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </Button>
                    
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium" style={{ color: colors.navy }}>Aa</span>
                      <span className="text-xs" style={{ color: colors.navy }}>{fontSize}px</span>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setFontSize(f => Math.min(32, f + 1))}
                      disabled={fontSize >= 32}
                      title="Increase font size"
                      className="h-8 w-8"
                      style={{ color: colors.navy, backgroundColor: 'transparent' }}
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (currentPage > 1) {
                          goToPage(currentPage - 1);
                        }
                      }}
                      disabled={currentPage <= 1}
                      title="Previous page"
                      className="h-8 w-8"
                      style={{ color: colors.navy, backgroundColor: 'transparent' }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    <div className="flex flex-col items-center min-w-[80px]">
                      <span className="text-sm font-bold" style={{ color: colors.navy }}>
                        {currentPage}/{totalPages}
                      </span>
                      <span className="text-xs" style={{ color: colors.navy }}>
                        Page {currentPage}
                      </span>
                      <Progress 
                        value={progressPercentage} 
                        className="w-full mt-1 h-1"
                        style={{ 
                          backgroundColor: colors.navyMuted,
                          ['--progress-background' as any]: colors.navy 
                        }}
                      />
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (currentPage < totalPages) {
                          goToPage(currentPage + 1);
                        } else if (currentPage === totalPages && !hasReachedEnd) {
                          handleReachEnd();
                        }
                      }}
                      disabled={currentPage >= totalPages && hasReachedEnd}
                      title={currentPage === totalPages && !hasReachedEnd ? "Mark as completed" : "Next page"}
                      className="h-8 w-8"
                      style={{ color: colors.navy, backgroundColor: 'transparent' }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Only on large screens */}
          <div className="hidden lg:block w-80">
            <Card className="sticky top-24 border-2" style={{ 
              backgroundColor: colors.background, 
              borderColor: colors.navyLight 
            }}>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.navy }}>
                  <BookOpen className="w-4 h-4" />
                  Reading Stats
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: colors.navy }}>Reading Progress</span>
                      <span className="font-bold" style={{ color: colors.navy }}>{progressPercentage}%</span>
                    </div>
                    <Progress 
                      value={progressPercentage} 
                      className="h-2"
                      style={{ 
                        backgroundColor: colors.navyMuted,
                        ['--progress-background' as any]: colors.navy 
                      }}
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: colors.navy }}>
                      <span>Page {currentPage}</span>
                      <span>of {totalPages}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg" style={{ 
                      backgroundColor: colors.navyMuted, 
                      border: `1px solid ${colors.navyLight}` 
                    }}>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3.5 h-3.5" style={{ color: colors.navy }} />
                        <span className="text-sm font-medium" style={{ color: colors.navy }}>Time Spent</span>
                      </div>
                      <p className="text-lg font-bold" style={{ color: colors.navy }}>{formatReadingTime(readingTime)}</p>
                    </div>
                    
                    <div className="p-3 rounded-lg" style={{ 
                      backgroundColor: colors.navyMuted, 
                      border: `1px solid ${colors.navyLight}` 
                    }}>
                      <div className="flex items-center gap-2 mb-1">
                        <Type className="w-3.5 h-3.5" style={{ color: colors.navy }} />
                        <span className="text-sm font-medium" style={{ color: colors.navy }}>Words</span>
                      </div>
                      <p className="text-lg font-bold" style={{ color: colors.navy }}>{wordCount.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg" style={{ 
                    backgroundColor: colors.navyMuted, 
                    border: `1px solid ${colors.navyLight}` 
                  }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Bookmark className="w-3.5 h-3.5" style={{ color: colors.navy }} />
                      <span className="text-sm font-medium" style={{ color: colors.navy }}>Bookmarks</span>
                    </div>
                    {bookmarks.length > 0 ? (
                      <div className="space-y-1">
                        {bookmarks.slice(0, 3).map((position, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs h-7"
                            onClick={() => goToBookmark(position)}
                            style={{ color: colors.navy, backgroundColor: 'transparent' }}
                          >
                            <Bookmark className="w-3 h-3 mr-2 fill-current" style={{ color: colors.navy }} />
                            Bookmark {index + 1} ({position}%)
                          </Button>
                        ))}
                        {bookmarks.length > 3 && (
                          <p className="text-xs text-center" style={{ color: colors.navy }}>
                            +{bookmarks.length - 3} more
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-center py-2" style={{ color: colors.navy }}>
                        No bookmarks yet
                      </p>
                    )}
                  </div>
                  
                  <Separator style={{ backgroundColor: colors.navyLight }} />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2" style={{ color: colors.navy }}>Page Navigation</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        type="number"
                        min="1"
                        max={totalPages}
                        placeholder="Page"
                        className="h-8"
                        value={currentPage}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 1 && value <= totalPages) {
                            setCurrentPage(value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            goToPage(currentPage);
                          }
                        }}
                        style={{ 
                          backgroundColor: colors.navyMuted, 
                          borderColor: colors.navyLight, 
                          color: colors.navy 
                        }}
                      />
                      <Button 
                        size="sm" 
                        className="h-8"
                        onClick={() => goToPage(currentPage)}
                        style={{ 
                          backgroundColor: colors.navy, 
                          color: colors.navyForeground, 
                          borderColor: colors.navy 
                        }}
                      >
                        Go
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => setShowSearch(true)} 
                        className="gap-1"
                        style={{ 
                          backgroundColor: colors.navy, 
                          color: colors.navyForeground, 
                          borderColor: colors.navy 
                        }}
                      >
                        <Search className="w-3 h-3" />
                        Search
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={toggleBookmark} 
                        className="gap-1"
                        style={{ 
                          backgroundColor: colors.navy, 
                          color: colors.navyForeground, 
                          borderColor: colors.navy 
                        }}
                      >
                        <Bookmark className="w-3 h-3" />
                        Bookmark
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={toggleFullscreen} 
                        className="gap-1"
                        style={{ 
                          backgroundColor: colors.navy, 
                          color: colors.navyForeground, 
                          borderColor: colors.navy 
                        }}
                      >
                        <Maximize2 className="w-3 h-3" />
                        Fullscreen
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => navigate(`/book/${id}`)} 
                        className="gap-1"
                        style={{ 
                          backgroundColor: colors.navy, 
                          color: colors.navyForeground, 
                          borderColor: colors.navy 
                        }}
                      >
                        <ArrowLeft className="w-3 h-3" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Search Dialog */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="sm:max-w-md" style={{ 
          backgroundColor: colors.navy, 
          borderColor: colors.navyLight 
        }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: colors.navyForeground }}>
              <Search className="w-4 h-4" />
              Search in Book
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter search term..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
                style={{ 
                  backgroundColor: colors.navyDark, 
                  borderColor: colors.navyLight, 
                  color: colors.navyForeground 
                }}
              />
              <Button 
                onClick={handleSearch}
                style={{ 
                  backgroundColor: colors.navyLight, 
                  color: colors.navyForeground, 
                  borderColor: colors.navyLight 
                }}
              >
                Search
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: colors.navyForeground }}>
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={prevSearchResult}
                      disabled={searchResults.length <= 1}
                      className="h-7 px-2"
                      style={{ 
                        borderColor: colors.navyLight, 
                        color: colors.navyForeground, 
                        backgroundColor: 'transparent' 
                      }}
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={nextSearchResult}
                      disabled={searchResults.length <= 1}
                      className="h-7 px-2"
                      style={{ 
                        borderColor: colors.navyLight, 
                        color: colors.navyForeground, 
                        backgroundColor: 'transparent' 
                      }}
                    >
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm">
                  <span style={{ color: `${colors.navyForeground}90` }}>Showing:</span>
                  <span className="font-medium ml-1" style={{ color: colors.navyForeground }}>
                    {currentSearchIndex + 1} of {searchResults.length}
                  </span>
                </div>
                <Alert style={{ 
                  backgroundColor: colors.navyDark, 
                  borderColor: colors.navyLight 
                }}>
                  <AlertCircle className="w-4 h-4" style={{ color: `${colors.navyForeground}90` }} />
                  <AlertTitle className="text-sm" style={{ color: colors.navyForeground }}>Tip</AlertTitle>
                  <AlertDescription className="text-xs" style={{ color: `${colors.navyForeground}90` }}>
                    The search term will be highlighted for 3 seconds when you navigate to a result.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {searchQuery && searchResults.length === 0 && (
              <div className="text-center py-6">
                <Search className="w-8 h-8 mx-auto mb-2" style={{ color: `${colors.navyForeground}90` }} />
                <p className="text-sm" style={{ color: `${colors.navyForeground}90` }}>
                  No results found for "<span className="font-medium" style={{ color: colors.navyForeground }}>{searchQuery}</span>"
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <Button
          className="rounded-full w-12 h-12 shadow-lg"
          size="icon"
          onClick={() => goToPage(1)}
          title="Go to first page"
          style={{ backgroundColor: colors.navy, color: colors.navyForeground }}
        >
          <ChevronLeft className="w-5 h-5 rotate-180" />
        </Button>
        
        <Button
          className="rounded-full w-12 h-12 shadow-lg"
          size="icon"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          style={{ backgroundColor: colors.navy, color: colors.navyForeground }}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5" />
          ) : (
            <Maximize2 className="w-5 h-5" />
          )}
        </Button>
        
        <Button
          className={cn("rounded-full w-12 h-12 shadow-lg")}
          size="icon"
          onClick={toggleBookmark}
          title={isBookCompleted ? "Book completed!" : "Add bookmark"}
          style={{ 
            backgroundColor: isBookCompleted ? colors.success : colors.navy, 
            color: colors.navyForeground 
          }}
        >
          {isBookCompleted ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* CSS for progress bars */}
      <style>
        {`
          [data-radix-progress-indicator] {
            background-color: ${colors.navy} !important;
          }
          .dark [data-radix-progress-indicator] {
            background-color: ${colors.navyLight} !important;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default BookReader;