// components/book/BookPreviewTab.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Clock, Eye, Download, Loader2 } from "lucide-react";

interface BookPreviewTabProps {
  book: {
    _id: string;
    title: string;
    description?: string;
    textFormat?: string;
    textLanguage?: string;
  };
  bookPreview?: {
    previewContent?: string;
    wordCount?: number;
    estimatedReadingTime?: number;
  };
  isAuthenticated: boolean;
  purchasing: boolean;
  hasPurchased: boolean;
  onPurchase: () => void;
  onReadTextBook: () => void;
}

const BookPreviewTab = ({
  book,
  bookPreview,
  isAuthenticated,
  purchasing,
  hasPurchased,
  onPurchase,
  onReadTextBook
}: BookPreviewTabProps) => {
  const renderTextContent = () => {
    if (!book) {
      return <p className="text-muted-foreground">Book content not available</p>;
    }

    if (bookPreview?.previewContent) {
      return (
        <div className="whitespace-pre-line leading-relaxed">
          {bookPreview.previewContent}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Preview content is not available. Showing book description instead:
        </p>
        <div className="whitespace-pre-line leading-relaxed">
          {book.description || 'No content available for this book.'}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-2 border-blue-200/50">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-1 text-blue-900">Book Preview</h3>
              <p className="text-sm text-blue-700">
                Read the full text content uploaded by the publisher
              </p>
            </div>
            {bookPreview && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100/50 rounded-full text-blue-700">
                  <FileText className="w-4 h-4" />
                  <span>{bookPreview.wordCount?.toLocaleString() || 0} words</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100/50 rounded-full text-blue-700">
                  <Clock className="w-4 h-4" />
                  <span>{bookPreview.estimatedReadingTime || 0} min read</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Text Content Display */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 border-2 border-blue-200/50 rounded-xl overflow-hidden">
            <div className="border-b border-blue-200 p-4 bg-gradient-to-r from-blue-50 to-blue-100/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 gap-1">
                    <BookOpen className="w-3 h-3" />
                    Full Text
                  </Badge>
                  <Badge variant="secondary" className="capitalize bg-blue-50 text-blue-700 border-blue-200">
                    {book.textFormat || 'plain'} format
                  </Badge>
                  <Badge variant="secondary" className="capitalize bg-blue-50 text-blue-700 border-blue-200">
                    {book.textLanguage || 'English'}
                  </Badge>
                </div>
                <Button 
                  variant="default"
                  size="sm" 
                  onClick={onReadTextBook}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0"
                >
                  <Eye className="w-4 h-4" />
                  Read Full Screen
                </Button>
              </div>
            </div>
            
            {/* Actual Text Content */}
            <div className="p-6 max-h-[400px] overflow-y-auto">
              {renderTextContent()}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-blue-200/50 hover:border-blue-400 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">Want to read offline?</p>
                    <p className="text-sm text-blue-700">
                      Purchase the PDF version
                    </p>
                  </div>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={onPurchase}
                    disabled={purchasing}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0"
                  >
                    {purchasing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Buy PDF
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-blue-200/50 hover:border-blue-400 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">Better reading experience</p>
                    <p className="text-sm text-blue-700">
                      Use the reader view for comfort
                    </p>
                  </div>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => {
                      if (isAuthenticated) {
                        onReadTextBook();
                      }
                    }}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0"
                  >
                    <Eye className="w-4 h-4" />
                    Reader View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookPreviewTab;