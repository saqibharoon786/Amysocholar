// AdminBookSales.tsx – Superadmin: Admin ki book sales + seller (admin) bank details
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { purchaseService, Purchase } from "@/services/purchaseService";
import {
  Receipt,
  Loader2,
  Building2,
  CreditCard,
  Wallet,
  User,
  BookOpen,
  ChevronDown,
} from "lucide-react";

// Seller (admin) with wallet/paymentInfo from populated purchase
interface SellerWithWallet {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  wallet?: {
    paymentInfo?: {
      jazzcashNumber?: string;
      jazzcashVerified?: boolean;
      easypaisaNumber?: string;
      easypaisaVerified?: boolean;
      bankAccount?: {
        accountTitle?: string;
        accountNumber?: string;
        bankName?: string;
        iban?: string;
        verified?: boolean;
      };
    };
  };
}

type PurchaseWithSeller = Purchase & {
  seller?: SellerWithWallet;
  book?: { _id: string; title?: string };
  user?: { _id: string; firstName?: string; lastName?: string; email?: string };
};

export default function AdminBookSales() {
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<PurchaseWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const limit = 15;

  const [bankDetailPurchase, setBankDetailPurchase] = useState<PurchaseWithSeller | null>(null);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const params: {
        page: number;
        limit: number;
        type: "book";
        paymentStatus?: string;
      } = { page, limit, type: "book" };
      if (paymentFilter && paymentFilter !== "all") params.paymentStatus = paymentFilter;
      const res = await purchaseService.getAllPurchases(params);
      if (res.success && res.data?.purchases) {
        setPurchases(res.data.purchases as PurchaseWithSeller[]);
        setTotalPages(res.pagination?.total ?? 1);
        setTotalResults(res.pagination?.results ?? 0);
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to load admin book sales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [page, paymentFilter]);

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" }) : "—";

  const sellerName = (s?: SellerWithWallet) =>
    s ? [s.firstName, s.lastName].filter(Boolean).join(" ") || s.email || "—" : "—";

  const buyerName = (u?: { firstName?: string; lastName?: string; email?: string }) =>
    u ? [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "—" : "—";

  const bookTitle = (p: PurchaseWithSeller) =>
    (p.book as { title?: string } | undefined)?.title || "—";

  return (
    <div
      className="p-6 space-y-6"
      style={{ backgroundColor: "#0f1729", minHeight: "100vh" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Receipt className="h-7 w-7" />
            Admin Book Sales
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Jis admin ki book sell hui hai aur uski profile se save ki hui bank details
          </p>
        </div>
      </div>

      <Card className="border-slate-700/50 bg-slate-900/30">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-slate-800/50 border-slate-600 text-slate-100">
                <SelectValue placeholder="Payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : purchases.length === 0 ? (
            <p className="text-slate-400 text-center py-12">
              Koi admin book sale nahi mili.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700/50 hover:bg-slate-800/30">
                    <TableHead className="text-slate-300">Book</TableHead>
                    <TableHead className="text-slate-300">Admin (Seller)</TableHead>
                    <TableHead className="text-slate-300">Buyer</TableHead>
                    <TableHead className="text-slate-300">Amount</TableHead>
                    <TableHead className="text-slate-300">Date</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300 text-right">Bank Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((p) => (
                    <TableRow
                      key={p._id}
                      className="border-slate-700/50 hover:bg-slate-800/30"
                    >
                      <TableCell className="font-medium text-slate-100">
                        <span className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-slate-500" />
                          {bookTitle(p)}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <span className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-500" />
                          {sellerName(p.seller)}
                        </span>
                        {p.seller?.email && (
                          <div className="text-xs text-slate-500 mt-0.5">{p.seller.email}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-300">{buyerName(p.user)}</TableCell>
                      <TableCell className="text-slate-200 font-medium">
                        {p.amount ?? 0} PKR
                      </TableCell>
                      <TableCell className="text-slate-400">{formatDate(p.createdAt)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            p.paymentStatus === "completed"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : p.paymentStatus === "pending"
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              : "bg-slate-500/20 text-slate-300 border-slate-500/30"
                          }
                        >
                          {p.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-500 bg-slate-700 text-slate-100 hover:bg-slate-600 font-medium"
                          onClick={() => setBankDetailPurchase(p)}
                        >
                          <Wallet className="h-4 w-4 mr-1" />
                          Bank details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between mt-4 text-sm">
                <span className="text-slate-300">
                  Total: {totalResults} sale{totalResults !== 1 ? "s" : ""}
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

      <Dialog
        open={!!bankDetailPurchase}
        onOpenChange={(open) => !open && setBankDetailPurchase(null)}
      >
        <DialogContent className="max-w-md border-slate-700 bg-slate-900 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-100">
              <Wallet className="h-5 w-5" />
              Admin bank details (profile se saved)
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {bankDetailPurchase && (
                <>
                  <strong className="text-slate-300">{sellerName(bankDetailPurchase.seller)}</strong>
                  {" – "}
                  Book: {bookTitle(bankDetailPurchase)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {bankDetailPurchase?.seller && (
            <div className="space-y-4">
              {bankDetailPurchase.seller.email && (
                <p className="text-sm text-slate-400">
                  Email: {bankDetailPurchase.seller.email}
                </p>
              )}
              <div className="space-y-3 text-sm">
                {bankDetailPurchase.seller.wallet?.paymentInfo?.jazzcashNumber && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                    <CreditCard className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-slate-300">JazzCash</div>
                      <div className="text-slate-100">
                        {bankDetailPurchase.seller.wallet.paymentInfo.jazzcashNumber}
                      </div>
                      {bankDetailPurchase.seller.wallet.paymentInfo.jazzcashVerified && (
                        <Badge className="mt-1 bg-emerald-500/20 text-emerald-400 text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                {bankDetailPurchase.seller.wallet?.paymentInfo?.easypaisaNumber && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                    <CreditCard className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-slate-300">EasyPaisa</div>
                      <div className="text-slate-100">
                        {bankDetailPurchase.seller.wallet.paymentInfo.easypaisaNumber}
                      </div>
                      {bankDetailPurchase.seller.wallet.paymentInfo.easypaisaVerified && (
                        <Badge className="mt-1 bg-emerald-500/20 text-emerald-400 text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                {bankDetailPurchase.seller.wallet?.paymentInfo?.bankAccount &&
                  (bankDetailPurchase.seller.wallet.paymentInfo.bankAccount.accountNumber ||
                    bankDetailPurchase.seller.wallet.paymentInfo.bankAccount.iban) && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                      <Building2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <div className="font-medium text-slate-300">Bank account</div>
                        {bankDetailPurchase.seller.wallet.paymentInfo.bankAccount.accountTitle && (
                          <div className="text-slate-100">
                            Title: {bankDetailPurchase.seller.wallet.paymentInfo.bankAccount.accountTitle}
                          </div>
                        )}
                        {bankDetailPurchase.seller.wallet.paymentInfo.bankAccount.accountNumber && (
                          <div className="text-slate-100">
                            Account: {bankDetailPurchase.seller.wallet.paymentInfo.bankAccount.accountNumber}
                          </div>
                        )}
                        {bankDetailPurchase.seller.wallet.paymentInfo.bankAccount.bankName && (
                          <div className="text-slate-100">
                            Bank: {bankDetailPurchase.seller.wallet.paymentInfo.bankAccount.bankName}
                          </div>
                        )}
                        {bankDetailPurchase.seller.wallet.paymentInfo.bankAccount.iban && (
                          <div className="text-slate-100">
                            IBAN: {bankDetailPurchase.seller.wallet.paymentInfo.bankAccount.iban}
                          </div>
                        )}
                        {bankDetailPurchase.seller.wallet.paymentInfo.bankAccount.verified && (
                          <Badge className="mt-1 bg-emerald-500/20 text-emerald-400 text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                {!bankDetailPurchase.seller.wallet?.paymentInfo?.jazzcashNumber &&
                  !bankDetailPurchase.seller.wallet?.paymentInfo?.easypaisaNumber &&
                  (!bankDetailPurchase.seller.wallet?.paymentInfo?.bankAccount?.accountNumber &&
                    !bankDetailPurchase.seller.wallet?.paymentInfo?.bankAccount?.iban) && (
                    <p className="text-slate-500 text-sm py-2">
                      Is admin ne abhi profile mein koi bank/payment details save nahi ki.
                    </p>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
