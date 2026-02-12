// components/book/BookDetailsTab.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Calendar, FileText, Globe, BookOpen } from "lucide-react";

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

interface BookDetailsTabProps {
  book: {
    publisher?: string;
    publicationYear?: number;
    totalPages?: number;
    language?: string;
    category?: string;
    subcategory?: string;
    isbn?: string;
    tags?: string[];
  };
}

const BookDetailsTab = ({ book }: BookDetailsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="border-2 hover:border-navy/30 transition-colors" style={{ 
            backgroundColor: colors.background, 
            borderColor: colors.navyLight 
          }}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: colors.navyMuted }}>
                    <Building className="w-4 h-4" style={{ color: colors.navy }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: colors.navy }}>Publisher</p>
                    <p style={{ color: colors.muted }}>
                      {book.publisher || 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: colors.navyMuted }}>
                    <Calendar className="w-4 h-4" style={{ color: colors.navy }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: colors.navy }}>Publication Year</p>
                    <p style={{ color: colors.muted }}>
                      {book.publicationYear || 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: colors.navyMuted }}>
                    <FileText className="w-4 h-4" style={{ color: colors.navy }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: colors.navy }}>Pages</p>
                    <p style={{ color: colors.muted }}>{book.totalPages || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card className="border-2 hover:border-navy/30 transition-colors" style={{ 
            backgroundColor: colors.background, 
            borderColor: colors.navyLight 
          }}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: colors.navyMuted }}>
                    <Globe className="w-4 h-4" style={{ color: colors.navy }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: colors.navy }}>Language</p>
                    <p style={{ color: colors.muted }} className="capitalize">
                      {book.language || 'English'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: colors.navyMuted }}>
                    <BookOpen className="w-4 h-4" style={{ color: colors.navy }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: colors.navy }}>Category</p>
                    <div className="flex gap-2 flex-wrap mt-1">
                      <Badge 
                        variant="secondary" 
                        className="capitalize"
                        style={{ 
                          backgroundColor: colors.navyMuted, 
                          color: colors.navy,
                          borderColor: colors.navyLight 
                        }}
                      >
                        {book.category || 'General'}
                      </Badge>
                      {book.subcategory && (
                        <Badge 
                          variant="outline" 
                          className="capitalize"
                          style={{ 
                            borderColor: colors.navyLight,
                            color: colors.navy 
                          }}
                        >
                          {book.subcategory}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {book.isbn && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: colors.navyMuted }}>
                      <FileText className="w-4 h-4" style={{ color: colors.navy }} />
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: colors.navy }}>ISBN</p>
                      <p className="font-mono text-sm" style={{ color: colors.muted }}>
                        {book.isbn}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tags */}
      {book.tags && book.tags.length > 0 && (
        <Card className="border-2" style={{ 
          backgroundColor: colors.background, 
          borderColor: colors.navyLight 
        }}>
          <CardContent className="p-4">
            <p className="font-semibold mb-3" style={{ color: colors.navy }}>Tags</p>
            <div className="flex flex-wrap gap-2">
              {book.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="px-3 py-1 rounded-full transition-colors cursor-default"
                  style={{ 
                    backgroundColor: colors.navyMuted,
                    color: colors.navy,
                    borderColor: colors.navyLight 
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookDetailsTab;