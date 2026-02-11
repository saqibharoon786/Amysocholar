// components/upload-book/BookTableView.tsx
import { Button } from "@/components/ui/button";
import { Book } from "@/types/book";

interface BookTableViewProps {
  books: Book[];
}

const BookTableView = ({ books }: BookTableViewProps) => {
  return (
    <div className="rounded-xl border-2 border-muted-foreground/10 overflow-hidden w-full">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-4 font-semibold">Title</th>
            <th className="text-left p-4 font-semibold">Author</th>
            <th className="text-left p-4 font-semibold">Category</th>
            <th className="text-left p-4 font-semibold">Price</th>
            <th className="text-left p-4 font-semibold">Status</th>
            <th className="text-left p-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book._id} className="border-b border-muted-foreground/10 hover:bg-muted/30 transition-colors">
              <td className="p-4 font-semibold">{book.title}</td>
              <td className="p-4">{book.author}</td>
              <td className="p-4">{book.category}</td>
              <td className="p-4 font-bold text-primary">
                {book.currency} {book.discountedPrice || book.price}
                {book.discountPercentage > 0 && (
                  <span className="text-sm line-through text-muted-foreground ml-2">
                    {book.currency} {book.price}
                  </span>
                )}
              </td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  book.status === 'approved' 
                    ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                    : book.status === 'pending'
                    ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                    : 'bg-red-500/10 text-red-600 border border-red-500/20'
                }`}>
                  {book.status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookTableView;