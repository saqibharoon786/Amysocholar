// components/book/BookDescriptionTab.tsx
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

interface BookDescriptionTabProps {
  description?: string;
  authorBio?: string;
}

const BookDescriptionTab = ({ description, authorBio }: BookDescriptionTabProps) => {
  return (
    <Card className="border-2">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold mb-3">Book Description</h4>
            <p className="text-lg leading-relaxed whitespace-pre-line text-muted-foreground">
              {description || 'No description available.'}
            </p>
          </div>
          
          {authorBio && (
            <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                About the Author
              </h4>
              <p className="text-muted-foreground whitespace-pre-line">
                {authorBio}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookDescriptionTab;