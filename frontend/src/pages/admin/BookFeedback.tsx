// BookFeedback.tsx – Admin/Superadmin: customer feedback on their books
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { BookService } from "@/services/BookService";
import { MessageSquare, Loader2, Star, BookOpen, User } from "lucide-react";

interface Review {
  _id: string;
  user?: { firstName?: string; lastName?: string; email?: string };
  book?: { title?: string };
  rating: number;
  comment?: string;
  createdAt: string;
}

export default function BookFeedback() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BookService.getMyBookReviews()
      .then((res) => {
        const list = res?.data?.reviews ?? (Array.isArray(res?.data) ? res.data : []);
        setReviews(Array.isArray(list) ? list : []);
      })
      .catch((e: unknown) => {
        const err = e as { response?: { data?: { message?: string } } };
        toast({
          title: "Error",
          description: err?.response?.data?.message || "Failed to load feedback",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const customerName = (r: Review) =>
    r.user
      ? [r.user.firstName, r.user.lastName].filter(Boolean).join(" ") || r.user.email || "—"
      : "—";
  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" }) : "—";

  return (
    <div className="p-6 space-y-6" style={{ backgroundColor: "#0f1729", minHeight: "100vh" }}>
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <MessageSquare className="h-7 w-7" />
          Book Feedback
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Customer ratings and comments on your books (read ke baad diya hua feedback)
        </p>
      </div>

      <Card className="border-slate-700/50 bg-slate-900/30">
        <CardHeader>
          <CardTitle className="text-slate-100">Reviews</CardTitle>
          <CardDescription className="text-slate-400">
            Jis customer ne aap ki book read ki aur rating/comment diya
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-slate-400 text-center py-12">Abhi koi feedback nahi aaya.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700/50">
                  <TableHead className="text-slate-300">Book</TableHead>
                  <TableHead className="text-slate-300">Customer name</TableHead>
                  <TableHead className="text-slate-300">Email (Gmail)</TableHead>
                  <TableHead className="text-slate-300">Rating</TableHead>
                  <TableHead className="text-slate-300">Comment / Review</TableHead>
                  <TableHead className="text-slate-300">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((r) => (
                  <TableRow key={r._id} className="border-slate-700/50 hover:bg-slate-800/30 align-top">
                    <TableCell className="font-medium text-slate-100">
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        {r.book?.title || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        {customerName(r)}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-200 font-medium">
                      {r.user?.email || "—"}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star className="h-4 w-4 fill-current" />
                        {r.rating}/5
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-300 max-w-md whitespace-pre-wrap break-words">
                      {r.comment?.trim() || "—"}
                    </TableCell>
                    <TableCell className="text-slate-400 whitespace-nowrap">{formatDate(r.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
