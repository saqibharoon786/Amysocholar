// UserManagement.tsx – Superadmin: all users, their details, purchases, uploaded books
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { userService, UserProfile } from "@/services/userService";
import { purchaseService, Purchase } from "@/services/purchaseService";
import { BookService, Book } from "@/services/BookService";
import {
  Users,
  Search,
  Loader2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  ShoppingBag,
  Mail,
  Phone,
  Calendar,
  User,
} from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  customer: "Customer",
  admin: "Admin",
  superadmin: "Super Admin",
};

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const limit = 10;

  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [detailUser, setDetailUser] = useState<UserProfile | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [uploadedBooks, setUploadedBooks] = useState<Book[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: { page: number; limit: number; role?: string; search?: string } = {
        page,
        limit,
      };
      if (roleFilter && roleFilter !== "all") params.role = roleFilter;
      if (search.trim()) params.search = search.trim();
      const res = await userService.getAllUsers(params);
      if (res.success && res.data?.users) {
        setUsers(res.data.users);
        setTotalPages(res.pagination?.total ?? 1);
        setTotalResults(res.pagination?.results ?? 0);
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.response?.data?.message || "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (page === 1) fetchUsers();
      else setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const openDetail = async (user: UserProfile) => {
    setDetailUserId(user._id);
    setDetailUser(user);
    setPurchases([]);
    setUploadedBooks([]);
    setDetailLoading(true);
    try {
      const [purchasesRes, booksRes] = await Promise.all([
        purchaseService.getPurchasesByUserId(user._id, { limit: 50 }),
        (user.role === "admin" || user.role === "superadmin")
          ? BookService.getBooksByUploader(user._id, 1, 50)
          : Promise.resolve({ success: false, data: { books: [] } }),
      ]);
      if (purchasesRes.success && purchasesRes.data?.purchases) {
        setPurchases(purchasesRes.data.purchases);
      }
      if (booksRes.success && booksRes.data?.books) {
        setUploadedBooks(booksRes.data.books);
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.response?.data?.message || "Failed to load user details",
        variant: "destructive",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailUserId(null);
    setDetailUser(null);
    setPurchases([]);
    setUploadedBooks([]);
  };

  const fullName = (u: UserProfile) =>
    [u.firstName, u.lastName].filter(Boolean).join(" ") || "—";
  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-PK", { dateStyle: "medium" }) : "—";

  return (
    <div className="p-6 space-y-6" style={{ backgroundColor: "#0f1729", minHeight: "100vh" }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="h-7 w-7" />
            Users
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            All customers and admins – view details, purchases, and uploaded books
          </p>
        </div>
      </div>

      <Card className="border-slate-700/50 bg-slate-900/30">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-800/50 border-slate-600 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[160px] bg-slate-800/50 border-slate-600 text-slate-100">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-slate-400 text-center py-12">No users found.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700/50 hover:bg-slate-800/30">
                    <TableHead className="text-slate-300">Name</TableHead>
                    <TableHead className="text-slate-300">Email</TableHead>
                    <TableHead className="text-slate-300">Role</TableHead>
                    <TableHead className="text-slate-300">Phone</TableHead>
                    <TableHead className="text-slate-300">Joined</TableHead>
                    <TableHead className="text-slate-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow
                      key={u._id}
                      className="border-slate-700/50 hover:bg-slate-800/30"
                    >
                      <TableCell className="font-medium text-slate-100">
                        {fullName(u)}
                      </TableCell>
                      <TableCell className="text-slate-300">{u.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            u.role === "superadmin"
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              : u.role === "admin"
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : "bg-slate-500/20 text-slate-300 border-slate-500/30"
                          }
                        >
                          {ROLE_LABELS[u.role] || u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400">{u.phone || "—"}</TableCell>
                      <TableCell className="text-slate-400">{formatDate(u.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-500 bg-slate-700 text-slate-100 hover:bg-slate-600 font-medium"
                          onClick={() => openDetail(u)}
                        >
                          View details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between mt-4 text-sm">
                <span className="text-slate-300">
                  Total: {totalResults} user{totalResults !== 1 ? "s" : ""}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="border-slate-500 bg-slate-800 text-slate-100 hover:bg-slate-700 disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  <span className="text-slate-200 font-medium px-2">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="border-slate-500 bg-slate-800 text-slate-100 hover:bg-slate-700 disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detailUserId} onOpenChange={(open) => !open && closeDetail()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-slate-700 bg-slate-900 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-100">
              <User className="h-5 w-5" />
              User details
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Name, email, purchases, and uploaded books
            </DialogDescription>
          </DialogHeader>
          {detailUser && (
            <div className="space-y-6">
              <div className="grid gap-2 text-sm">
                <p className="flex items-center gap-2">
                  <span className="text-slate-500 w-24">Name</span>
                  <span className="text-slate-100">{fullName(detailUser)}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-100">{detailUser.email}</span>
                </p>
                {detailUser.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-100">{detailUser.phone}</span>
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <span className="text-slate-500 w-24">Role</span>
                  <Badge
                    variant="secondary"
                    className={
                      detailUser.role === "superadmin"
                        ? "bg-amber-500/20 text-amber-400"
                        : detailUser.role === "admin"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-slate-500/20 text-slate-300"
                    }
                  >
                    {ROLE_LABELS[detailUser.role] || detailUser.role}
                  </Badge>
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-400">Joined {formatDate(detailUser.createdAt)}</span>
                </p>
              </div>

              {detailLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : (
                <>
                  <div>
                    <h4 className="font-semibold text-slate-200 flex items-center gap-2 mb-2">
                      <ShoppingBag className="h-4 w-4" />
                      Purchases ({purchases.length})
                    </h4>
                    {purchases.length === 0 ? (
                      <p className="text-slate-500 text-sm">No purchases</p>
                    ) : (
                      <ul className="space-y-2 text-sm border border-slate-700 rounded-lg p-3 max-h-48 overflow-y-auto">
                        {purchases.map((p) => (
                          <li
                            key={p._id}
                            className="flex justify-between items-center text-slate-300"
                          >
                            <span>
                              {p.type === "book"
                                ? (p.book as any)?.title || "Book"
                                : (p.judgment as any)?.title || "Judgment"}
                            </span>
                            <span className="text-slate-400">
                              {p.paymentStatus} · {p.amount} PKR
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {(detailUser.role === "admin" || detailUser.role === "superadmin") && (
                    <div>
                      <h4 className="font-semibold text-slate-200 flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4" />
                        Uploaded books ({uploadedBooks.length})
                      </h4>
                      {uploadedBooks.length === 0 ? (
                        <p className="text-slate-500 text-sm">No books uploaded</p>
                      ) : (
                        <ul className="space-y-2 text-sm border border-slate-700 rounded-lg p-3 max-h-48 overflow-y-auto">
                          {uploadedBooks.map((b) => (
                            <li
                              key={b._id}
                              className="flex justify-between items-center text-slate-300"
                            >
                              <span>{b.title}</span>
                              <span className="text-slate-400">
                                {b.category} · {b.status}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
