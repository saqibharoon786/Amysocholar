import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Document, Page, pdfjs } from "react-pdf";
import axios from "axios";
import {
  Loader2,
  Scale,
  Calendar,
  User,
  BookOpen,
  FileText,
  X,
  Check,
  Clock,
  Clock3,
  Hash,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Copy,
  Share2,
  Star,
  Heart,
  Eye,
  Download,
  ShoppingCart,
  FileCheck,
  Shield,
  Award,
  Layers,
  FileSearch,
  Search,
  Globe,
  Building,
  Tag,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { JudgmentService } from "@/services/JudgmentService";
import { judgmentCategoryService } from "@/services/judgmentCategoryService";

// Fallback color scheme used by this component when a global theme is not provided
const COLOR_SCHEME = {
  backgrounds: {
    primary: '#F8F6F2',
    secondary: '#FFF8F0',
    accent: '#F5F2EB'
  },
  accents: {
    primary: '#8B4513',
    secondary: '#A0522D'
  },
  text: {
    primary: '#2C1810',
    muted: '#7A6956',
    secondary: '#FFFFFF'
  },
  gradients: {
    primary: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(139,69,19,0.03))'
  }
};

// Icon aliases used in this file
const DownloadIcon = Download;
const FileTextIcon = FileText;
const BuildingIcon = Building;

// Define types for Judgment and Filters
interface Judgment {
  _id: string;
  citation: string;
  caseTitle?: string;
  parties: string;
  court: string;
  caseType: string;
  year: number;
  caseNumber?: string;
  judge?: string;
  textFile?: string;
  pdfFile?: string;
  coverImages?: string[];
  textContent?: string;
  textFormat?: string;
  description?: string;
  summary?: string;
  price?: number;
  currency?: string;
  tags?: string[];
  createdAt: string;
}

interface JudgmentFilters {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  caseType?: string;
  category?: string;
}

// Professional Book-like Text Viewer - FIXED with proper pagination (10 paragraphs per page)
const BookTextViewer = ({ 
  content, 
  currentPage, 
  totalPages, 
  onNextPage, 
  onPrevPage,
  judgment 
}: { 
  content: string;
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  judgment: Judgment | null;
}) => {
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [textAlign, setTextAlign] = useState<"left" | "justify" | "center">("justify");
  const [fontFamily, setFontFamily] = useState("'Merriweather', Georgia, serif");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [readingTime, setReadingTime] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [visibleParagraphs, setVisibleParagraphs] = useState<string[]>([]);
  const [paragraphsPerPage] = useState(10); // Fixed 10 paragraphs per page
  const [visiblePages, setVisiblePages] = useState<number[]>([1]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Navy Blue Color Scheme from BookReader
  const colors = {
    navy: '#1a2a4a',
    navyLight: '#2d4270',
    navyDark: '#0f1a2e',
    navyMuted: '#e8edf5',
    navyForeground: '#f8fafc',
    gold: '#d4a418',
    success: '#166534',
    border: '#e2e8f0',
    background: '#ffffff',
    foreground: '#1e293b',
    muted: '#64748b',
  };

  // Parse content into paragraphs correctly - FIXED VERSION
  useEffect(() => {
    if (content && !isInitialized) {
      // Split content by lines first
      const lines = content.split('\n');
      const rawParagraphs: string[] = [];
      let currentParagraph = '';

      // Process each line
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        // If line is empty and we have content in current paragraph, save it
        if (trimmedLine === '' && currentParagraph) {
          rawParagraphs.push(currentParagraph.trim());
          currentParagraph = '';
        } 
        // If line starts with "Paragraph" or looks like a paragraph marker
        else if (trimmedLine.toLowerCase().startsWith('paragraph') || 
                 /^\d+\.\s/.test(trimmedLine) || 
                 /^[A-Z][a-z]+:\s/.test(trimmedLine)) {
          // Save current paragraph if exists
          if (currentParagraph) {
            rawParagraphs.push(currentParagraph.trim());
          }
          // Start new paragraph
          currentParagraph = trimmedLine;
        }
        // If line is not empty, add it to current paragraph
        else if (trimmedLine !== '') {
          if (currentParagraph) {
            currentParagraph += ' ' + trimmedLine;
          } else {
            currentParagraph = trimmedLine;
          }
        }
      });

      // Add the last paragraph if exists
      if (currentParagraph) {
        rawParagraphs.push(currentParagraph.trim());
      }

      // If no paragraphs were found using the above method, use simple split
      if (rawParagraphs.length === 0) {
        const simpleParagraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        setParagraphs(simpleParagraphs);
      } else {
        setParagraphs(rawParagraphs);
      }

      setIsInitialized(true);
      
      // Calculate initial reading progress
      const progress = Math.min(100, Math.round((currentPage / totalPages) * 100));
      setReadingProgress(progress);
    }
  }, [content, currentPage, totalPages, isInitialized]);

  // Update visible paragraphs when currentPage or paragraphs change
  useEffect(() => {
    if (paragraphs.length === 0) return;
    
    // Calculate start and end index for current page
    const startIndex = (currentPage - 1) * paragraphsPerPage;
    const endIndex = Math.min(startIndex + paragraphsPerPage, paragraphs.length);
    
    // Get the paragraphs for current page
    const currentVisibleParagraphs = paragraphs.slice(startIndex, endIndex);
    setVisibleParagraphs(currentVisibleParagraphs);
    
    // Calculate reading progress based on paragraphs
    const totalParagraphs = paragraphs.length;
    const readParagraphs = Math.min(endIndex, totalParagraphs);
    const progress = Math.min(100, Math.round((readParagraphs / totalParagraphs) * 100));
    setReadingProgress(progress);
    
    // Update visible pages for pagination display
    const maxVisiblePages = 7;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    setVisiblePages(pages);
    
    // Scroll to top when page changes
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [paragraphs, currentPage, paragraphsPerPage, totalPages]);

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const toggleBookmark = () => {
    if (!contentRef.current || !containerRef.current) return;
    
    const scrollTop = containerRef.current.scrollTop;
    const scrollHeight = containerRef.current.scrollHeight;
    const bookmarkPosition = Math.round((scrollTop / scrollHeight) * 100);
    
    if (bookmarks.includes(bookmarkPosition)) {
      setBookmarks(bookmarks.filter(pos => pos !== bookmarkPosition));
    } else {
      const newBookmarks = [...bookmarks, bookmarkPosition].sort((a, b) => a - b);
      setBookmarks(newBookmarks);
    }
  };

  const goToBookmark = (position: number) => {
    if (containerRef.current) {
      const scrollHeight = containerRef.current.scrollHeight;
      containerRef.current.scrollTo({
        top: (position / 100) * scrollHeight,
        behavior: "smooth"
      });
    }
  };

  const formatReadingTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // FIXED: Proper page navigation function
  const goToPage = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    
    // Update current page
    const newPage = pageNumber;
    
    // Call parent handlers based on direction
    if (newPage > currentPage) {
      onNextPage();
    } else if (newPage < currentPage) {
      onPrevPage();
    }
    
    // Scroll to top of container
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  // FIXED: Proper heading detection
  const processContentWithHeadings = useCallback((paragraphsToProcess: string[]): string => {
    if (!paragraphsToProcess || paragraphsToProcess.length === 0) return '';
    
    return paragraphsToProcess.map((paragraph, index) => {
      const trimmed = paragraph.trim();
      
      // Check if paragraph looks like a heading
      if (trimmed.toLowerCase().startsWith('paragraph') && trimmed.length < 100) {
        return `<h2 class="text-xl font-bold mb-5 mt-7 pb-2 border-b" style="color: ${colors.navy}; border-color: ${colors.navyLight}">${trimmed}</h2>`;
      }
      
      // Check if it's a numbered paragraph
      if (/^\d+\.\s/.test(trimmed) && trimmed.length < 150) {
        return `<h3 class="text-lg font-bold mb-4 mt-6" style="color: ${colors.navy}">${trimmed}</h3>`;
      }
      
      // Check for other heading patterns
      if ((trimmed.endsWith(':') && trimmed.length < 200) || 
          (trimmed === trimmed.toUpperCase() && trimmed.length < 100)) {
        return `<h4 class="text-md font-semibold mb-3 mt-5" style="color: ${colors.navy}">${trimmed}</h4>`;
      }
      
      // Regular paragraph with proper spacing
      return `<p class="mb-6 leading-relaxed text-justify" style="text-indent: 2em; font-size: ${fontSize}px; line-height: ${lineHeight};">${trimmed}</p>`;
    }).join('');
  }, [colors.navy, colors.navyLight, fontSize, lineHeight]);

  const formattedContent = processContentWithHeadings(visibleParagraphs);

  // Calculate paragraph range for current page
  const startParagraph = (currentPage - 1) * paragraphsPerPage + 1;
  const endParagraph = Math.min(currentPage * paragraphsPerPage, paragraphs.length);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: colors.navyMuted }}>
      {/* Top Navigation Bar - BookReader Style */}
      <header className="sticky top-0 z-50 backdrop-blur-sm" style={{ 
        backgroundColor: colors.navy, 
        borderBottom: `1px solid ${colors.navyLight}`,
        color: colors.navyForeground 
      }}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Back Button */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="gap-2"
                style={{ 
                  color: colors.navyForeground,
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.navyLight}`,
                  borderRadius: '8px',
                  padding: '6px 12px',
                }}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>

              <div className="hidden md:block max-w-xs">
                <h1 className="text-sm font-semibold truncate" style={{ color: colors.navyForeground }}>
                  {judgment?.citation || "Judgment"}
                </h1>
                <p className="text-xs truncate flex items-center gap-1" style={{ color: `${colors.navyForeground}90` }}>
                  <User className="w-3 h-3" />
                  {judgment?.court || "Court"}
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
                      <span>Paragraphs:</span>
                      <span className="font-bold">{startParagraph}-{endParagraph} of {paragraphs.length}</span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      <span>Page</span>
                      <span className="font-bold">{currentPage}</span>
                      <span>of</span>
                      <span>{totalPages}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <div className="w-32 sm:w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${readingProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium min-w-[40px]" style={{ color: colors.navyForeground }}>
                      {readingProgress}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2">
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
                className="h-8 w-8"
                style={{ color: colors.navyForeground, backgroundColor: 'transparent' }}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Reading Area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <Card className="border-2 shadow-lg overflow-hidden h-full flex flex-col" style={{ 
          backgroundColor: colors.background, 
          borderColor: colors.navyLight 
        }}>
          {/* Page Header */}
          <div className="p-4 border-b" style={{ backgroundColor: colors.navyMuted, borderColor: colors.navyLight }}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold" style={{ color: colors.navy }}>
                  Page {currentPage} of {totalPages}
                </h2>
                <p className="text-sm" style={{ color: colors.muted }}>
                  Showing paragraphs {startParagraph} to {endParagraph} ({visibleParagraphs.length} paragraphs)
                </p>
              </div>
              <div className="text-sm font-medium" style={{ color: colors.navy }}>
                {paragraphs.length} total paragraphs
              </div>
            </div>
          </div>

          {/* Reading Area */}
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto scroll-smooth relative"
            style={{ backgroundColor: colors.background }}
          >
            <div className="p-4 sm:p-6 md:p-8 lg:p-10">
              <div
                ref={contentRef}
                className="max-w-4xl mx-auto"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: lineHeight,
                  textAlign: textAlign,
                  fontFamily: fontFamily,
                  color: colors.foreground,
                }}
                dangerouslySetInnerHTML={{ __html: formattedContent }}
              />
            </div>
          </div>

          {/* Bottom Controls - FIXED with working pagination */}
          <div className="p-4" style={{ borderTop: `1px solid ${colors.navyLight}` }}>
            {/* Top Row - Bookmark and Font Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleBookmark}
                  className="gap-2"
                  style={{ color: colors.navy, backgroundColor: 'transparent' }}
                >
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Bookmark</span>
                </Button>
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {paragraphs.length} paragraphs
                </span>
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
            </div>

            {/* Main Pagination Controls - ALWAYS VISIBLE */}
            <div className="flex flex-col items-center gap-4 mb-4">
              {/* Page Info */}
              <div className="text-center">
                <div className="text-sm font-bold" style={{ color: colors.navy }}>
                  Page {currentPage} of {totalPages}
                </div>
                <div className="text-xs" style={{ color: colors.muted }}>
                  Showing paragraphs {startParagraph}-{endParagraph} of {paragraphs.length}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${(currentPage / totalPages) * 100}%` }}
                ></div>
              </div>

              {/* Navigation Buttons - BIG AND CLEAR */}
              <div className="flex items-center justify-center gap-3 w-full">
                {/* Previous Page Button */}
                <Button
                  variant={currentPage <= 1 ? "outline" : "default"}
                  size="lg"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  title="Previous page"
                  className="h-12 px-4 gap-2"
                  style={{ 
                    color: currentPage <= 1 ? colors.navy : 'white',
                    backgroundColor: currentPage <= 1 ? 'transparent' : colors.navy,
                    border: `2px solid ${colors.navyLight}`,
                    minWidth: '120px'
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </Button>

                {/* Current Page Display */}
                <div className="flex flex-col items-center min-w-[60px]">
                  <span className="text-xl font-bold" style={{ color: colors.navy }}>
                    {currentPage}
                  </span>
                  <span className="text-xs" style={{ color: colors.muted }}>
                    of {totalPages}
                  </span>
                </div>

                {/* Next Page Button */}
                <Button
                  variant={currentPage >= totalPages ? "outline" : "default"}
                  size="lg"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  title="Next page"
                  className="h-12 px-4 gap-2"
                  style={{ 
                    color: currentPage >= totalPages ? colors.navy : 'white',
                    backgroundColor: currentPage >= totalPages ? 'transparent' : colors.navy,
                    border: `2px solid ${colors.navyLight}`,
                    minWidth: '120px'
                  }}
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Quick Page Navigation */}
            <div className="flex justify-center items-center gap-1 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="h-7 w-7 text-xs"
                style={{ color: colors.navy, backgroundColor: 'transparent' }}
              >
                «
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-7 w-7 text-xs"
                style={{ color: colors.navy, backgroundColor: 'transparent' }}
              >
                ‹
              </Button>
              
              {visiblePages.map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  onClick={() => goToPage(page)}
                  className={`h-7 w-7 text-xs ${currentPage === page ? 'font-bold' : ''}`}
                  style={{
                    color: currentPage === page ? colors.navyForeground : colors.navy,
                    backgroundColor: currentPage === page ? colors.navyLight : 'transparent',
                  }}
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-7 w-7 text-xs"
                style={{ color: colors.navy, backgroundColor: 'transparent' }}
              >
                ›
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-7 w-7 text-xs"
                style={{ color: colors.navy, backgroundColor: 'transparent' }}
              >
                »
              </Button>
            </div>
            
            {/* Page Info Footer */}
            <div className="text-center mt-3 text-xs" style={{ color: colors.muted }}>
              Paragraphs {startParagraph} to {endParagraph} of {paragraphs.length} • 
              Page {currentPage} of {totalPages} • 
              Showing {visibleParagraphs.length} of {paragraphsPerPage} paragraphs per page
            </div>
          </div>
        </Card>
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
              Search in Judgment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter search term..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                style={{ 
                  backgroundColor: colors.navyDark, 
                  borderColor: colors.navyLight, 
                  color: colors.navyForeground 
                }}
              />
              <Button 
                onClick={() => {
                  // Search functionality
                  setShowSearch(false);
                }}
                style={{ 
                  backgroundColor: colors.navyLight, 
                  color: colors.navyForeground, 
                  borderColor: colors.navyLight 
                }}
              >
                Search
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <Button
          className="rounded-full w-12 h-12 shadow-lg border-2 border-white"
          size="icon"
          onClick={() => goToPage(1)}
          title="Go to first page"
          style={{ backgroundColor: colors.navy, color: colors.navyForeground }}
        >
          <ChevronLeft className="w-5 h-5 rotate-180" />
        </Button>
        
        <Button
          className="rounded-full w-12 h-12 shadow-lg border-2 border-white"
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
          className="rounded-full w-12 h-12 shadow-lg border-2 border-white"
          size="icon"
          onClick={toggleBookmark}
          title="Add bookmark"
          style={{ backgroundColor: colors.navy, color: colors.navyForeground }}
        >
          <Bookmark className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

// PDF Viewer Component
const PDFViewer = ({ fileUrl }: { fileUrl: string }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Configure pdfjs worker
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF');
    setLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber(prevPage => Math.max(prevPage - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prevPage => Math.min(prevPage + 1, numPages || prevPage));
  };

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <FileText className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to Load PDF</h3>
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-gray-600 mt-4">
            URL: {fileUrl.substring(0, 50)}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* PDF Viewer Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-100 border-b">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {pageNumber} of {numPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={pageNumber >= (numPages || 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              disabled={scale >= 3.0}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Open in new tab
          </a>
        </div>
      </div>
      
      {/* PDF Document */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="flex justify-center p-4">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
                <p className="text-gray-600">Loading PDF document...</p>
              </div>
            }
            error={
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to Load PDF</h3>
                <p className="text-red-600">The PDF file could not be loaded.</p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              className="shadow-lg"
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>
      </div>
    </div>
  );
};

// Professional Judgment Card Component
interface JudgmentCardProps {
  judgment: Judgment;
  getCoverImage: (judgment: Judgment) => string;
  handleImageError: (judgmentId: string, imageUrl: string) => void;
  getDefaultCoverImage: (judgment: Judgment) => string;
  getCategoryBadgeColor: (category: string) => string;
  truncateText: (text: string, maxLength: number) => string;
  handleReadText: (judgment: Judgment) => void;
  handleViewPDF: (judgment: Judgment) => void;
  handleCardClick: (judgment: Judgment) => void;
}

const JudgmentCard = ({ 
  judgment, 
  getCoverImage, 
  handleImageError, 
  getDefaultCoverImage,
  getCategoryBadgeColor,
  truncateText,
  handleReadText,
  handleViewPDF,
  handleCardClick
}: JudgmentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const coverImageUrl = getCoverImage(judgment);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const getCaseTypeIcon = (caseType: string) => {
    const icons: Record<string, any> = {
      "Civil": <Scale className="h-3.5 w-3.5" />,
      "Criminal": <Shield className="h-3.5 w-3.5" />,
      "Constitutional": <Award className="h-3.5 w-3.5" />,
      "Family": <User className="h-3.5 w-3.5" />,
      "Commercial": <FileCheck className="h-3.5 w-3.5" />,
      "Administrative": <Layers className="h-3.5 w-3.5" />,
      "Labor": <FileSearch className="h-3.5 w-3.5" />,
    };
    return icons[caseType] || <Scale className="h-3.5 w-3.5" />;
  };

  return (
    <div 
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#E8E2D6] hover:border-[#8B4513]/30 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => handleCardClick(judgment)}
      style={{ backgroundColor: COLOR_SCHEME.backgrounds.secondary }}
    >
      {/* Cover Image Container */}
      <div className="relative h-48 overflow-hidden">
        {/* Main Image with Gradient Overlay */}
        <img
          src={coverImageUrl}
          alt={`${judgment.citation} cover`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            handleImageError(judgment._id, target.src);
            target.src = getDefaultCoverImage(judgment);
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        
        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-tr from-[#8B4513]/20 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          {/* Case Type Badge */}
          <Badge className={`${getCategoryBadgeColor(judgment.caseType)} px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm`}>
            <div className="flex items-center gap-1.5">
              {getCaseTypeIcon(judgment.caseType)}
              <span>{judgment.caseType}</span>
            </div>
          </Badge>
          
          {/* Court Badge - Full court name */}
          <Badge className="bg-white/20 backdrop-blur-md text-white px-2.5 py-1.5 rounded-full text-xs font-semibold border border-white/30 shadow-lg max-w-[45%]">
            <div className="flex items-center gap-1.5 truncate">
              <Shield className="h-3 w-3 shrink-0" />
              <span className="truncate" title={judgment.court || 'Court'}>{judgment.court || 'Court'}</span>
            </div>
          </Badge>
        </div>
        
        {/* Year Badge */}
        <div className="absolute bottom-4 right-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] flex items-center justify-center shadow-2xl border-2 border-white/40">
            <span className="text-xs font-bold text-gray-900">{judgment.year}</span>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full max-w-[140px]">
              <User className="h-3.5 w-3.5 text-white/90 shrink-0" />
              <span className="text-xs font-medium text-white truncate" title={judgment.judge || "Judge"}>
                {judgment.judge?.split(',')[0]?.trim() || judgment.judge || "Judge"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
              <Calendar className="h-3.5 w-3.5 text-white/90" />
              <span className="text-xs font-medium text-white">
                {formatDate(judgment.createdAt)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Floating Action Button */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          <div className="flex items-center gap-2">
            {judgment.textFile && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReadText(judgment);
                }}
                className="bg-white hover:bg-white text-gray-800 font-medium rounded-full px-4 py-2.5 shadow-xl hover:scale-105 transition-transform"
              >
                <BookOpen className="h-4 w-4 mr-1.5" />
                Read Text
              </Button>
            )}
            {judgment.pdfFile && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewPDF(judgment);
                }}
                className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] hover:from-[#A0522D] hover:to-[#8B4513] text-white font-medium rounded-full px-4 py-2.5 shadow-xl hover:scale-105 transition-transform"
              >
                <FileText className="h-4 w-4 mr-1.5" />
                View PDF
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Case Citation */}
        <div className="mb-2">
          <h3 className="font-bold text-[#2C1810] text-lg leading-tight line-clamp-2 group-hover:text-[#8B4513] transition-colors duration-300">
            {judgment.citation}
          </h3>
        </div>

        {/* Judge name - full name below citation */}
        <div className="flex items-center gap-1.5 mb-3 text-sm text-[#4A3520]">
          <User className="h-3.5 w-3.5 shrink-0 text-[#7A6956]" />
          <span className="font-medium truncate" title={judgment.judge || "N/A"}>
            {judgment.judge?.split(',')[0]?.trim() || judgment.judge || "Judge name N/A"}
          </span>
        </div>
        
        {/* Case Title */}
        <p className="text-sm text-[#4A3520] mb-4 leading-relaxed line-clamp-2">
          {truncateText(judgment.caseTitle || judgment.parties, 100)}
        </p>
        
        {/* Action Buttons - Always Visible */}
        <div className="flex items-center gap-2 mb-4">
          {judgment.textFile && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleReadText(judgment);
              }}
              className="flex-1 border-[#E8E2D6] text-[#4A3520] hover:bg-[#F5F2EB] hover:text-[#8B4513] hover:border-[#8B4513] transition-all duration-300"
            >
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              Read
            </Button>
          )}
          {judgment.pdfFile && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleViewPDF(judgment);
              }}
              className="flex-1 bg-gradient-to-r from-[#8B4513] to-[#A0522D] hover:from-[#A0522D] hover:to-[#8B4513] text-white font-medium transition-all duration-300"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              PDF
            </Button>
          )}
        </div>
        
        {/* Metadata Footer */}
        <div className="pt-3 border-t border-[#E8E2D6]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-[#7A6956] font-medium">Available</span>
              </div>
              {judgment.caseNumber && (
                <span className="text-xs text-[#7A6956] font-medium">
                  • Case {judgment.caseNumber}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-[#7A6956]" />
              <span className="text-xs text-[#7A6956] font-medium">View</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-16 h-1 bg-gradient-to-r from-[#8B4513] to-[#D4AF37]"></div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B4513] to-[#D4AF37] transition-all duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
      
      {/* Hover Effect Border */}
      <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#8B4513]/20 transition-all duration-500 pointer-events-none`}></div>
      
      {/* File Indicators */}
      <div className="absolute top-2 left-2 flex items-center gap-1">
        {judgment.textFile && (
          <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <BookOpen className="h-3 w-3 text-white" />
          </div>
        )}
        {judgment.pdfFile && (
          <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <FileText className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

// Judgment Profile Modal Component
const JudgmentProfileModal = ({
  judgment,
  isOpen,
  onClose,
  onReadText,
  onViewPDF
}: {
  judgment: Judgment | null;
  isOpen: boolean;
  onClose: () => void;
  onReadText: (judgment: Judgment) => void;
  onViewPDF: (judgment: Judgment) => void;
}) => {
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [userRating, setUserRating] = useState(0);

  if (!judgment) return null;

  const formatCurrency = (amount: number, currency: string = 'PKR') => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      return `${currency} ${amount}`;
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      "Civil": "bg-gradient-to-r from-[#8B4513] to-[#A0522D]",
      "Criminal": "bg-gradient-to-r from-[#800020] to-[#8B4513]",
      "Constitutional": "bg-gradient-to-r from-[#1A365D] to-[#2E8B57]",
      "Family": "bg-gradient-to-r from-[#A0522D] to-[#800020]",
      "Commercial": "bg-gradient-to-r from-[#2C3E50] to-[#1A365D]",
      "Administrative": "bg-gradient-to-r from-[#2E8B57] to-[#1A365D]",
      "Labor": "bg-gradient-to-r from-[#5D4037] to-[#8B4513]",
    };
    return colors[category] || "bg-gradient-to-r from-[#8B4513] to-[#D4AF37]";
  };

  const getDefaultCoverImage = (judgment: Judgment): string => {
    const caseType = judgment.caseType || 'Case';
    const year = judgment.year || new Date().getFullYear();
    
    const colors: Record<string, string> = {
      "Civil": "#8B4513",
      "Criminal": "#800020",
      "Constitutional": "#1A365D",
      "Family": "#A0522D",
      "Commercial": "#2C3E50",
      "Administrative": "#2E8B57",
      "Labor": "#5D4037",
      "default": "#8B4513"
    };
    
    const bgColor = colors[caseType] || colors.default;
    
    const svgContent = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
        <rect width="400" height="300" fill="${bgColor}" opacity="0.9"/>
        <rect x="50" y="50" width="300" height="200" rx="8" fill="white" opacity="0.2"/>
        <rect x="170" y="100" width="60" height="100" rx="4" fill="white" opacity="0.3"/>
        <rect x="172" y="102" width="56" height="96" rx="3" fill="white" opacity="0.4"/>
        <g fill="white" text-anchor="middle" font-family="Arial, sans-serif">
          <text x="200" y="160" font-size="16" font-weight="bold" opacity="0.9">
            ${caseType}
          </text>
          <text x="200" y="190" font-size="14" font-weight="500" opacity="0.8">
            ${year}
          </text>
        </g>
        <rect x="40" y="40" width="320" height="220" rx="12" fill="none" stroke="white" stroke-width="2" stroke-opacity="0.3"/>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  };

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(judgment.citation);
    toast({
      title: "Citation Copied",
      description: "Judgment citation copied to clipboard",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: judgment.citation,
        text: judgment.caseTitle || judgment.parties,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Judgment link copied to clipboard",
      });
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      description: isWishlisted 
        ? "Judgment removed from your wishlist" 
        : "Judgment added to your wishlist",
    });
  };

  const handleRate = (rating: number) => {
    setUserRating(rating);
    toast({
      title: "Rating Submitted",
      description: `You rated this judgment ${rating} stars`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 rounded-lg">
        <div className="flex flex-col h-full" style={{ backgroundColor: COLOR_SCHEME.backgrounds.primary }}>
          
          {/* Header with Close Button */}
          <div className="flex items-center justify-between p-6 border-b border-[#E8E2D6]">
            <div>
              <DialogTitle className="text-2xl font-bold text-[#2C1810]">
                {judgment.citation}
              </DialogTitle>
              <DialogDescription className="text-[#4A3520] mt-1">
                {judgment.caseTitle || judgment.parties}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyCitation}
                className="hover:bg-[#F5F2EB] text-[#7A6956]"
                title="Copy Citation"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="hover:bg-[#F5F2EB] text-[#7A6956]"
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-[#F5F2EB] text-[#7A6956]"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
              
              {/* Left Column - Cover Image & Basic Info */}
              <div className="lg:col-span-1 space-y-6">
                {/* Cover Image */}
                <div className="relative">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-2 border-[#E8E2D6]">
                    <img
                      src={getDefaultCoverImage(judgment)}
                      alt={`${judgment.citation} cover`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Case Type Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className={`${getCategoryBadgeColor(judgment.caseType)} text-white px-4 py-2 rounded-full shadow-lg`}>
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        <span className="font-bold">{judgment.caseType}</span>
                      </div>
                    </Badge>
                  </div>
                  
                  {/* Year Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] flex items-center justify-center shadow-2xl border-2 border-white/40">
                      <span className="text-xs font-bold text-gray-900">{judgment.year}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-[#E8E2D6] text-center">
                    <div className="flex flex-col items-center">
                      <Eye className="h-5 w-5 text-[#8B4513] mb-2" />
                      <span className="text-2xl font-bold text-[#2C1810]">3</span>
                      <span className="text-sm text-[#7A6956] mt-1">Views</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-[#E8E2D6] text-center">
                    <div className="flex flex-col items-center">
                      <DownloadIcon className="h-5 w-5 text-[#8B4513] mb-2" />
                      <span className="text-2xl font-bold text-[#2C1810]">0</span>
                      <span className="text-sm text-[#7A6956] mt-1">Downloads</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-[#E8E2D6] text-center">
                    <div className="flex flex-col items-center">
                      <ShoppingCart className="h-5 w-5 text-[#8B4513] mb-2" />
                      <span className="text-2xl font-bold text-[#2C1810]">0</span>
                      <span className="text-sm text-[#7A6956] mt-1">Purchases</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-[#E8E2D6] text-center">
                    <div className="flex flex-col items-center">
                      <Calendar className="h-5 w-5 text-[#8B4513] mb-2" />
                      <span className="text-2xl font-bold text-[#2C1810]">{judgment.year}</span>
                      <span className="text-sm text-[#7A6956] mt-1">Year</span>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="bg-white rounded-xl border border-[#E8E2D6] p-6">
                  <h3 className="text-xl font-bold text-[#2C1810] mb-4">Details</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: COLOR_SCHEME.backgrounds.accent }}>
                        <BuildingIcon className="h-4 w-4" style={{ color: COLOR_SCHEME.accents.primary }} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: COLOR_SCHEME.text.primary }}>Court</p>
                        <p className="text-sm" style={{ color: COLOR_SCHEME.text.muted }}>
                          {judgment.court || 'Supreme Court of Pakistan'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: COLOR_SCHEME.backgrounds.accent }}>
                        <Calendar className="h-4 w-4" style={{ color: COLOR_SCHEME.accents.primary }} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: COLOR_SCHEME.text.primary }}>Year</p>
                        <p className="text-sm" style={{ color: COLOR_SCHEME.text.muted }}>
                          {judgment.year || '2024'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: COLOR_SCHEME.backgrounds.accent }}>
                        <FileTextIcon className="h-4 w-4" style={{ color: COLOR_SCHEME.accents.primary }} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: COLOR_SCHEME.text.primary }}>Pages</p>
                        <p className="text-sm" style={{ color: COLOR_SCHEME.text.muted }}>43</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-[#E8E2D6]">
                    <h4 className="font-semibold text-sm mb-3" style={{ color: COLOR_SCHEME.text.primary }}>Description</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: COLOR_SCHEME.backgrounds.accent }}>
                          <Globe className="h-4 w-4" style={{ color: COLOR_SCHEME.accents.primary }} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: COLOR_SCHEME.text.primary }}>Language</p>
                          <p className="text-sm capitalize" style={{ color: COLOR_SCHEME.text.muted }}>
                            English
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: COLOR_SCHEME.backgrounds.accent }}>
                          <BookOpen className="h-4 w-4" style={{ color: COLOR_SCHEME.accents.primary }} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: COLOR_SCHEME.text.primary }}>Category</p>
                          <Badge 
                            variant="secondary" 
                            className="mt-1 capitalize"
                            style={{ 
                              backgroundColor: COLOR_SCHEME.backgrounds.accent, 
                              color: COLOR_SCHEME.text.secondary,
                              borderColor: COLOR_SCHEME.accents.primary 
                            }}
                          >
                            Academic
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: COLOR_SCHEME.backgrounds.accent }}>
                          <FileTextIcon className="h-4 w-4" style={{ color: COLOR_SCHEME.accents.primary }} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: COLOR_SCHEME.text.primary }}>ISBN</p>
                          <p className="font-mono text-sm" style={{ color: COLOR_SCHEME.text.muted }}>
                            3333
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Actions & Formats */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Book Statistics */}
                <div className="bg-white rounded-xl border border-[#E8E2D6] p-6">
                  <h3 className="text-xl font-bold text-[#2C1810] mb-4">Book Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <Eye className="h-8 w-8 text-[#8B4513] mb-2" />
                        <span className="text-3xl font-bold text-[#2C1810]">3</span>
                        <span className="text-sm text-[#7A6956] mt-1">Views</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <DownloadIcon className="h-8 w-8 text-[#8B4513] mb-2" />
                        <span className="text-3xl font-bold text-[#2C1810]">0</span>
                        <span className="text-sm text-[#7A6956] mt-1">Downloads</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <ShoppingCart className="h-8 w-8 text-[#8B4513] mb-2" />
                        <span className="text-3xl font-bold text-[#2C1810]">0</span>
                        <span className="text-sm text-[#7A6956] mt-1">Purchases</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Available Formats Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#2C1810] border-b border-[#E8E2D6] pb-2">Available Formats</h3>
                  
                  <div className="space-y-4">
                    {/* Text Version */}
                    <div className="flex justify-between items-center p-4 border-2 border-[#E8E2D6] rounded-xl transition-colors hover:border-[#8B4513]"
                      style={{ backgroundColor: COLOR_SCHEME.backgrounds.secondary }}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: "#DCFCE7" }}>
                          <BookOpen className="h-4 w-4" style={{ color: "#166534" }} />
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: COLOR_SCHEME.text.primary }}>Text Version</p>
                          <p className="text-sm" style={{ color: COLOR_SCHEME.text.muted }}>Read online for free</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{ 
                            backgroundColor: "#DCFCE7",
                            color: "#166534",
                          }}>
                          FREE
                        </div>
                      </div>
                    </div>
                    
                    {/* PDF Version */}
                    <div className="flex justify-between items-center p-4 border-2 border-[#E8E2D6] rounded-xl transition-colors hover:border-[#8B4513]"
                      style={{ backgroundColor: COLOR_SCHEME.backgrounds.secondary }}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: COLOR_SCHEME.backgrounds.accent }}>
                          <FileTextIcon className="h-4 w-4" style={{ color: COLOR_SCHEME.accents.primary }} />
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: COLOR_SCHEME.text.primary }}>PDF Version</p>
                          <p className="text-sm" style={{ color: COLOR_SCHEME.text.muted }}>Download and keep</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium" style={{ color: COLOR_SCHEME.text.primary }}>
                          {formatCurrency(1000, 'PKR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  {/* Read Free Text Button */}
                  <Button 
                    className="w-full h-16 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    style={{ 
                      background: `linear-gradient(135deg, ${COLOR_SCHEME.accents.primary} 0%, ${COLOR_SCHEME.accents.secondary} 50%, ${COLOR_SCHEME.accents.primary} 100%)`,
                      color: 'white',
                    }}
                    onClick={() => onReadText(judgment)}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="p-2 rounded-lg bg-white/20">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div className="text-left flex-1">
                            <p className="font-bold text-lg">Read Free Text</p>
                            <p className="text-sm opacity-90">Instant access • No purchase required</p>
                      </div>
                    </div>
                  </Button>

                  {/* Buy PDF Button */}
                  <Button 
                    variant="outline"
                    className="w-full h-16 rounded-xl border-2 hover:border-[#8B4513] hover:bg-[#F5F2EB] transition-all"
                    onClick={() => onViewPDF(judgment)}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: COLOR_SCHEME.backgrounds.accent }}>
                        <ShoppingCart className="h-6 w-6" style={{ color: COLOR_SCHEME.accents.primary }} />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-lg" style={{ color: COLOR_SCHEME.text.primary }}>Buy PDF Version</p>
                        <p className="text-sm" style={{ color: COLOR_SCHEME.text.muted }}>
                          {formatCurrency(1000, 'PKR')} • One-time payment
                        </p>
                      </div>
                    </div>
                  </Button>
                </div>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="ghost"
                    className="h-12 rounded-lg hover:bg-[#FEF9E7] hover:text-[#D4AF37] transition-colors"
                    onClick={() => handleRate(userRating || 5)}
                  >
                    <Star className="h-4 w-4 mr-2" fill={userRating >= 1 ? "#D4AF37" : "none"} color="#D4AF37" />
                    Rate Judgment
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="h-12 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                    onClick={handleWishlist}
                  >
                    <Heart className="h-4 w-4 mr-2" fill={isWishlisted ? "#dc2626" : "none"} color="#dc2626" />
                    {isWishlisted ? "In Wishlist" : "Wishlist"}
                  </Button>
                </div>

                {/* Tags Section */}
                {judgment.tags && judgment.tags.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold" style={{ color: COLOR_SCHEME.text.primary }}>Legal Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {judgment.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="px-3 py-1.5 rounded-full transition-colors"
                          style={{
                            backgroundColor: COLOR_SCHEME.backgrounds.accent,
                            color: COLOR_SCHEME.text.secondary,
                            borderColor: COLOR_SCHEME.accents.primary,
                          }}
                        >
                          <span className="text-sm font-medium" style={{ color: COLOR_SCHEME.text.primary }}>
                            {tag}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div> {/* end right column */}
            </div> {/* end grid */}
          </div> {/* end main content */}
        </div> {/* end outer container */}
      </DialogContent>
    </Dialog>
  );
};

// Main JudgmentSection Component
const JudgmentSection = () => {
  const [judgments, setJudgments] = useState<Judgment[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [filePreviewOpen, setFilePreviewOpen] = useState(false);
  const [selectedJudgment, setSelectedJudgment] = useState<Judgment | null>(null);
  const [profileJudgment, setProfileJudgment] = useState<Judgment | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [textContent, setTextContent] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeFileType, setActiveFileType] = useState<"text" | "pdf" | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [judgmentCategoryNames, setJudgmentCategoryNames] = useState<string[]>([]);

  const { toast } = useToast();
  const navigate = useNavigate();

  const tabColors = [
    "from-[#8B4513] to-[#A0522D]", "from-[#800020] to-[#8B4513]", "from-[#1A365D] to-[#2E8B57]",
    "from-[#A0522D] to-[#800020]", "from-[#1A365D] to-[#D4AF37]", "from-[#2E8B57] to-[#1A365D]",
    "from-[#800020] to-[#D4AF37]", "from-[#8B4513] to-[#D4AF37]",
  ];
  const categories: { _id: string; name: string; color: string }[] = [
    { _id: "all", name: "All Judgments", color: "from-[#8B4513] to-[#D4AF37]" },
    ...judgmentCategoryNames.map((name, i) => ({ _id: name, name, color: tabColors[i % tabColors.length] })),
  ];

  useEffect(() => {
    judgmentCategoryService.getJudgmentCategories().then((res) => {
      if (res.success && res.data) setJudgmentCategoryNames(res.data);
    });
  }, []);

  // Listen for category filter from header nav
  useEffect(() => {
    const handler = (e: CustomEvent<string>) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener("judgment-filter", handler as EventListener);
    return () => window.removeEventListener("judgment-filter", handler as EventListener);
  }, []);

  // Fetch judgments
  const fetchJudgments = useCallback(async () => {
    try {
      setLoading(true);

      const filters: JudgmentFilters = {
        page: 1,
        limit: 8,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (activeTab !== "all") {
        filters.category = activeTab;
      }

      const response = await JudgmentService.getAllJudgments(filters);

      if (response.success && response.data) {
        setJudgments(response.data.judgments);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load judgments",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ Error fetching judgments:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load judgments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab, toast]);

  useEffect(() => {
    fetchJudgments();
  }, [fetchJudgments]);

  const handleImageError = useCallback((judgmentId: string, imageUrl: string) => {
    setImageErrors(prev => ({ ...prev, [judgmentId]: true }));
  }, []);

  const getCoverImage = useCallback((judgment: Judgment): string => {
    if (imageErrors[judgment._id]) {
      return getDefaultCoverImage(judgment);
    }

    if (!judgment.coverImages || !Array.isArray(judgment.coverImages) || judgment.coverImages.length === 0) {
      return getDefaultCoverImage(judgment);
    }

    const coverImage = judgment.coverImages[0];
    let imageUrl = coverImage;

    if (coverImage.startsWith('http')) {
      return coverImage;
    }

    if (coverImage.startsWith('/uploads/')) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      imageUrl = `${apiUrl}${coverImage}`;
      return imageUrl;
    }

    if (coverImage && !coverImage.includes('/')) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      imageUrl = `${apiUrl}/uploads/covers/${coverImage}`;
      return imageUrl;
    }

    return coverImage;
  }, [imageErrors]);

  const getDefaultCoverImage = (judgment: Judgment): string => {
    const caseType = judgment.caseType || 'Case';
    const year = judgment.year || new Date().getFullYear();
    
    const colors: Record<string, string> = {
      "Civil": "#8B4513",
      "Criminal": "#800020",
      "Constitutional": "#1A365D",
      "Family": "#A0522D",
      "Commercial": "#2C3E50",
      "Administrative": "#2E8B57",
      "Labor": "#5D4037",
      "default": "#8B4513"
    };
    
    const bgColor = colors[caseType] || colors.default;
    
    const svgContent = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
        <rect width="400" height="300" fill="${bgColor}" opacity="0.9"/>
        <rect x="50" y="50" width="300" height="200" rx="8" fill="white" opacity="0.2"/>
        <rect x="170" y="100" width="60" height="100" rx="4" fill="white" opacity="0.3"/>
        <rect x="172" y="102" width="56" height="96" rx="3" fill="white" opacity="0.4"/>
        <g fill="white" text-anchor="middle" font-family="Arial, sans-serif">
          <text x="200" y="160" font-size="16" font-weight="bold" opacity="0.9">
            ${caseType}
          </text>
          <text x="200" y="190" font-size="14" font-weight="500" opacity="0.8">
            ${year}
          </text>
        </g>
        <rect x="40" y="40" width="320" height="220" rx="12" fill="none" stroke="white" stroke-width="2" stroke-opacity="0.3"/>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  };

  const handleReadText = useCallback(
    async (judgment: Judgment) => {
      try {
        setLoadingFile(true);
        setSelectedJudgment(judgment);
        setTextContent("");
        setCurrentPage(1);
        setActiveFileType("text");
        setFilePreviewOpen(true);

        // Build a book-like text from the judgment fields (no external fetch)
        const headerParts: string[] = [];
        if (judgment.citation) headerParts.push(judgment.citation);
        const metaParts: string[] = [];
        if (judgment.caseTitle) metaParts.push(judgment.caseTitle);
        if (judgment.parties && !judgment.caseTitle) metaParts.push(judgment.parties);
        if (judgment.court) metaParts.push(judgment.court);
        if (judgment.year) metaParts.push(String(judgment.year));
        if (judgment.caseNumber) metaParts.push(`Case No: ${judgment.caseNumber}`);
        if (judgment.judge) metaParts.push(`Judge: ${judgment.judge}`);

        const header = headerParts.length ? headerParts.join(' • ') + '\n\n' : '';
        const meta = metaParts.length ? metaParts.join(' • ') + '\n\n' : '';

        // Prefer saved full text content when available
        let body = '';
        if (judgment.textContent && judgment.textContent.trim()) {
          body = judgment.textContent.trim();
          if (judgment.textFormat === 'html') {
            body = body.replace(/<[^>]+>/g, '');
          }
        } else if (judgment.description && judgment.description.trim()) {
          body = judgment.description.trim();
        } else if (judgment.summary && judgment.summary.trim()) {
          body = judgment.summary.trim();
        } else {
          body = 'Full text not available. This view shows the judgment metadata and description.';
        }

        // Include price info if present
        const priceLine = (typeof judgment.price === 'number') ? `\n\nPrice: ${judgment.price} ${judgment.currency || 'PKR'}` : '';
        const finalText = `${header}${meta}${body}${priceLine}`.trim();
        setTextContent(finalText);
      } catch (error: any) {
        console.error('❌ Error preparing judgment text:', error);
        toast({
          title: "Error",
          description: error?.message || "Failed to prepare judgment text",
          variant: "destructive",
        });
        setTextContent("Error: Could not load judgment content.");
      } finally {
        setLoadingFile(false);
      }
    },
    [toast]
  );

  const handleViewPDF = useCallback(
    (judgment: Judgment) => {
      if (!judgment.pdfFile) {
        toast({
          title: "Error",
          description: "No PDF file available",
          variant: "destructive",
        });
        return;
      }
      
      let pdfFileUrl = judgment.pdfFile;
      if (pdfFileUrl.startsWith('/uploads/')) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        pdfFileUrl = `${apiUrl}${pdfFileUrl}`;
      }
      
      setSelectedJudgment(judgment);
      setActiveFileType("pdf");
      setFilePreviewOpen(true);
    },
    [toast]
  );

  const handleCardClick = useCallback((judgment: Judgment) => {
    setProfileJudgment(judgment);
    setProfileModalOpen(true);
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  const downloadFile = useCallback((filePath: string, filename: string) => {
    let downloadUrl = filePath;
    if (filePath.startsWith('/uploads/')) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      downloadUrl = `${apiUrl}${filePath}`;
    }
    
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const truncateText = useCallback((text: string, maxLength: number): string => {
    if (!text) return "Legal judgment document";
    return text.length <= maxLength ? text : `${text.substring(0, maxLength)}...`;
  }, []);

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      "Civil": "bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white",
      "Criminal": "bg-gradient-to-r from-[#800020] to-[#DC2626] text-white",
      "Constitutional": "bg-gradient-to-r from-[#1A365D] to-[#2E8B57] text-white",
      "Family": "bg-gradient-to-r from-[#A0522D] to-[#800020] text-white",
      "Commercial": "bg-gradient-to-r from-[#2C3E50] to-[#1A365D] text-white",
      "Administrative": "bg-gradient-to-r from-[#2E8B57] to-[#1A365D] text-white",
      "Labor": "bg-gradient-to-r from-[#5D4037] to-[#8B4513] text-white",
    };
    return colors[category] || "bg-gradient-to-r from-[#8B4513] to-[#D4AF37] text-white";
  };

  // Calculate total pages dynamically based on content length (10 paragraphs per page)
  const calculateTotalPages = useCallback((content: string): number => {
    if (!content) return 1;
    
    // Split content into paragraphs properly
    const lines = content.split('\n');
    const paragraphs: string[] = [];
    let currentParagraph = '';

    // Process each line
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // If line is empty and we have content in current paragraph, save it
      if (trimmedLine === '' && currentParagraph) {
        paragraphs.push(currentParagraph.trim());
        currentParagraph = '';
      } 
      // If line starts with "Paragraph" or looks like a paragraph marker
      else if (trimmedLine.toLowerCase().startsWith('paragraph') || 
               /^\d+\.\s/.test(trimmedLine) || 
               /^[A-Z][a-z]+:\s/.test(trimmedLine)) {
        // Save current paragraph if exists
        if (currentParagraph) {
          paragraphs.push(currentParagraph.trim());
        }
        // Start new paragraph
        currentParagraph = trimmedLine;
      }
      // If line is not empty, add it to current paragraph
      else if (trimmedLine !== '') {
        if (currentParagraph) {
          currentParagraph += ' ' + trimmedLine;
        } else {
          currentParagraph = trimmedLine;
        }
      }
    });

    // Add the last paragraph if exists
    if (currentParagraph) {
      paragraphs.push(currentParagraph.trim());
    }

    // If no paragraphs were found using the above method, use simple split
    if (paragraphs.length === 0) {
      const simpleParagraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      return Math.max(1, Math.ceil(simpleParagraphs.length / 10));
    }
    
    return Math.max(1, Math.ceil(paragraphs.length / 10));
  }, []);

  const totalPages = calculateTotalPages(textContent);

  if (loading) {
    return (
      <section 
        className="min-h-screen py-20"
        style={{ background: COLOR_SCHEME.gradients.primary }}
      >
        <div className="container mx-auto px-4 text-center">
          <Scale className="h-20 w-20 mb-6 mx-auto text-[#8B4513]" />
          <h2 className="text-4xl font-bold mb-4 text-[#2C1810]">
            Legal Judgments
          </h2>
          <p className="text-lg text-[#4A3520] mb-8">
            Loading Court Rulings & Case Law
          </p>
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#8B4513] rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-[#7A6956]">
            Loading judgments...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="judgments"
      className="min-h-screen py-16"
      style={{ background: COLOR_SCHEME.gradients.primary }}
    >
      <div className="container mx-auto px-4">
        {/* Header Section with Design Theme */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#8B4513]/10 to-[#D4AF37]/10 rounded-full blur-xl"></div>
            <Scale className="h-16 w-16 relative z-10 text-[#8B4513]" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-[#2C1810]">
            Legal Judgments
          </h1>
          <p className="text-lg text-[#4A3520] max-w-2xl mx-auto">
            Explore comprehensive court rulings and case law across various legal categories.
          </p>
        </div>

        {/* Category Filter with Design Theme */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category._id}
              variant={activeTab === category._id ? "default" : "outline"}
              onClick={() => setActiveTab(category._id)}
              size="lg"
              className={`
                rounded-lg px-6 py-3 font-medium transition-all duration-300
                ${activeTab === category._id 
                  ? `bg-gradient-to-r ${category.color} text-white hover:opacity-90` 
                  : "border-[#E8E2D6] text-[#4A3520] hover:bg-[#F5F2EB] hover:border-[#8B4513]"
                }
              `}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Judgments Grid with Professional Card Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
          {judgments.map((judgment) => (
            <JudgmentCard
              key={judgment._id}
              judgment={judgment}
              getCoverImage={getCoverImage}
              handleImageError={handleImageError}
              getDefaultCoverImage={getDefaultCoverImage}
              getCategoryBadgeColor={getCategoryBadgeColor}
              truncateText={truncateText}
              handleReadText={handleReadText}
              handleViewPDF={handleViewPDF}
              handleCardClick={handleCardClick}
            />
          ))}
        </div>

        {/* Empty State with Design Theme */}
        {judgments.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg border border-[#E8E2D6] p-8 max-w-md mx-auto" style={{ backgroundColor: COLOR_SCHEME.backgrounds.secondary }}>
              <Scale className="h-16 w-16 mx-auto mb-4 text-[#7A6956]" />
              <h3 className="text-xl font-bold mb-3 text-[#2C1810]">
                No Judgments Found
              </h3>
              <p className="text-[#4A3520] mb-6">
                No judgments found for the selected category.
              </p>
              <Button 
                onClick={() => setActiveTab("all")}
                className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] hover:from-[#A0522D] hover:to-[#8B4513] text-white font-medium px-6 py-3 rounded-lg"
              >
                View All Judgments
              </Button>
            </div>
          </div>
        )}

        {/* File Preview Dialog with Design Theme */}
        <Dialog open={filePreviewOpen} onOpenChange={setFilePreviewOpen}>
          <DialogContent className="max-w-6xl w-[90vw] h-[80vh] p-0 overflow-hidden">
            <div className="flex flex-col h-full rounded-lg overflow-hidden border border-gray-200" style={{ backgroundColor: "#F8F6F2" }}>
              <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
                <div className="flex items-center gap-3">
                  {activeFileType === "text" ? (
                    <BookOpen className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                  <div>
                    <DialogTitle className="text-lg font-bold text-white">
                      {selectedJudgment?.citation}
                    </DialogTitle>
                    <DialogDescription className="text-white/90 text-sm">
                      {selectedJudgment?.court} • {selectedJudgment?.caseType}
                    </DialogDescription>
                  </div>
                </div>
                {/* Price display when viewing PDF */}
                {activeFileType === 'pdf' && selectedJudgment?.price != null && (
                  <div className="ml-4 text-sm font-semibold text-white/90">
                    Price: {selectedJudgment.price} {selectedJudgment.currency || 'PKR'}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {activeFileType === "text" && selectedJudgment?.textFile && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => downloadFile(selectedJudgment.textFile, `${selectedJudgment.citation}.txt`)}
                      className="bg-white/20 hover:bg-white/30 text-white border-0 font-medium px-3 py-2 rounded"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                  {activeFileType === "pdf" && selectedJudgment?.pdfFile && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => downloadFile(selectedJudgment.pdfFile, `${selectedJudgment.citation}.pdf`)}
                      className="bg-white/20 hover:bg-white/30 text-white border-0 font-medium px-3 py-2 rounded"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {selectedJudgment.price != null ? `Buy / Download — ${selectedJudgment.price} ${selectedJudgment.currency || 'PKR'}` : 'Download'}
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setFilePreviewOpen(false)}
                    className="bg-white/20 hover:bg-white/30 text-white border-0 rounded"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-hidden">
                  {activeFileType === "text" ? (
                    <BookTextViewer
                      content={textContent}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onNextPage={nextPage}
                      onPrevPage={prevPage}
                      judgment={selectedJudgment}
                    />
                  ) : activeFileType === "pdf" && selectedJudgment?.pdfFile ? (
                    (() => {
                      let pdfFileUrl = selectedJudgment.pdfFile;
                      if (pdfFileUrl.startsWith('/uploads/')) {
                        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                        pdfFileUrl = `${apiUrl}${pdfFileUrl}`;
                      }
                      return <PDFViewer fileUrl={pdfFileUrl} />;
                    })()
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                      <div className="text-center">
                        <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-bold mb-2 text-gray-900">
                          No File Available
                        </h3>
                        <p className="text-gray-600">
                          This judgment doesn't have a file to display.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Judgment Profile Modal */}
        <JudgmentProfileModal
          judgment={profileJudgment}
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          onReadText={handleReadText}
          onViewPDF={handleViewPDF}
        />
      </div>
    </section>
  );
};

export default JudgmentSection;