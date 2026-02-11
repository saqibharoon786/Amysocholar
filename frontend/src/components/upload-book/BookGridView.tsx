// components/upload-book/BookGridView.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book } from "@/types/book";

interface BookGridViewProps {
  books: Book[];
}

const BookGridView = ({ books }: BookGridViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
      {books.map((book) => (
        <Card key={book._id} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group cursor-pointer w-full">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-muted-foreground mt-1">{book.author}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  book.status === 'approved' 
                    ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                    : book.status === 'pending'
                    ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                    : 'bg-red-500/10 text-red-600 border border-red-500/20'
                }`}>
                  {book.status}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-semibold">{book.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-bold text-lg text-primary">
                    {book.currency} {book.discountedPrice || book.price}
                    {book.discountPercentage > 0 && (
                      <span className="text-sm line-through text-muted-foreground ml-2">
                        {book.currency} {book.price}
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pages</span>
                  <span>{book.totalPages}</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BookGridView;