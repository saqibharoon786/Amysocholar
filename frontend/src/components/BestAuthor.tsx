import { Facebook, Instagram } from "lucide-react";
import { FaTwitter } from "react-icons/fa";
import { useState, useEffect } from "react";
import { BookService, Author, Book } from "@/services/bookService";
import { Loader2 } from "lucide-react";

const BestAuthor = () => {
  const [author, setAuthor] = useState<Author | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthorData();
  }, []);

  const fetchAuthorData = async () => {
    try {
      setLoading(true);
      // Fetch featured author
      const authorResponse = await BookService.getFeaturedAuthor();
      if (authorResponse.success && authorResponse.data) {
        setAuthor(authorResponse.data);
        
        // Fetch author's books
        const booksResponse = await BookService.getBooksByAuthor(authorResponse.data._id, 2);
        if (booksResponse.success && booksResponse.data?.books) {
          setBooks(booksResponse.data.books);
        }
      }
    } catch (error) {
      console.error('Error fetching author data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/placeholder-author.jpg";
  };

  const handleBookImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/placeholder-book.png";
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-3 text-foreground">Best Author of the Week</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-10"></div>
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Discovering featured author...</p>
        </div>
      </section>
    );
  }

  if (!author) {
    return (
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-3 text-foreground">Best Author of the Week</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-10"></div>
          <p className="text-muted-foreground">No featured author available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-3 text-foreground">Best Author of the Week</h2>
          <p className="text-muted-foreground text-lg mb-4 max-w-2xl mx-auto">
            Celebrating outstanding literary talent
          </p>
          <div className="w-20 h-1 bg-primary mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-12 items-center max-w-6xl mx-auto">
          {/* Book 1 */}
          {books[0] && (
            <div className="text-center group cursor-pointer">
              <img 
                src={books[0].coverImages?.[0] || "/placeholder-book.png"} 
                alt={books[0].title}
                className="w-full max-w-[220px] mx-auto mb-5 rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
                onError={handleBookImageError}
                loading="lazy"
              />
              <p className="text-sm uppercase tracking-wide text-muted-foreground mb-2 font-medium">
                {books[0].author || author.name}
              </p>
              <h3 className="font-semibold text-foreground mb-3 line-clamp-2">{books[0].title}</h3>
              <div className="flex items-center justify-center gap-2">
                <span className="font-bold text-primary text-lg">
                  {books[0].currency || "Rs."} {(books[0].discountedPrice ?? books[0].price ?? 0).toFixed(2)}
                </span>
                {books[0].discountedPrice && books[0].discountedPrice < books[0].price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {books[0].currency || "Rs."} {(books[0].price ?? 0).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Book 2 */}
          {books[1] && (
            <div className="text-center group cursor-pointer">
              <img 
                src={books[1].coverImages?.[0] || "/placeholder-book.png"} 
                alt={books[1].title}
                className="w-full max-w-[220px] mx-auto mb-5 rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
                onError={handleBookImageError}
                loading="lazy"
              />
              <p className="text-sm uppercase tracking-wide text-muted-foreground mb-2 font-medium">
                {books[1].author || author.name}
              </p>
              <h3 className="font-semibold text-foreground mb-3 line-clamp-2">{books[1].title}</h3>
              <div className="flex items-center justify-center gap-2">
                <span className="font-bold text-primary text-lg">
                  {books[1].currency || "Rs."} {(books[1].discountedPrice ?? books[1].price ?? 0).toFixed(2)}
                </span>
                {books[1].discountedPrice && books[1].discountedPrice < books[1].price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {books[1].currency || "Rs."} {(books[1].price ?? 0).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Author */}
          <div className="text-center bg-background rounded-xl p-8 border border-border shadow-lg">
            <img 
              src={author.profileImage || "/placeholder-author.jpg"} 
              alt={author.name}
              className="w-full max-w-[280px] mx-auto mb-6 rounded-lg shadow-lg"
              onError={handleImageError}
              loading="lazy"
            />
            <h3 className="text-2xl font-bold mb-2 text-foreground">
              {author.name}
              <span className="text-base font-normal text-muted-foreground block mt-1">Featured Author</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              {author.bio || "An accomplished author with numerous literary achievements and awards."}
            </p>
            
            {author.awards && author.awards.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-4 text-foreground">Awards & Achievements</h4>
                <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                  {author.awards.slice(0, 6).map((award, index) => (
                    <div key={index} className="bg-amber-500/10 rounded-lg p-3">
                      <div className="w-12 h-12 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center text-xs font-bold text-amber-700">
                        #{index + 1}
                      </div>
                      <p className="text-xs mt-2 text-muted-foreground line-clamp-2">{award}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4 mt-6">
              {author.socialMedia?.twitter && (
                <a 
                  href={author.socialMedia.twitter} 
                  className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaTwitter className="w-4 h-4" />
                </a>
              )}
              {author.socialMedia?.facebook && (
                <a 
                  href={author.socialMedia.facebook} 
                  className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {author.socialMedia?.instagram && (
                <a 
                  href={author.socialMedia.instagram} 
                  className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center hover:bg-pink-500 transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Fallback if only one book is available */}
        {books.length === 1 && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground">More books from this author coming soon...</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BestAuthor;