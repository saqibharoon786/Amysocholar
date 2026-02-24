// UploadJudgment.tsx
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { JudgmentService, type Judgment } from "@/services/JudgmentService";
import UploadJudgmentForm from "./UploadJudgmentForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const UploadJudgment = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [judgments, setJudgments] = useState<Judgment[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const fetchJudgments = async () => {
    try {
      setLoadingList(true);
      const res = await JudgmentService.getAllJudgments({ limit: 50, sortBy: "createdAt", sortOrder: "desc" });
      if (res.success && res.data?.judgments) {
        setJudgments(res.data.judgments);
      }
    } catch {
      toast({
        title: "Failed to load judgments",
        description: "Could not fetch judgments from the database.",
        variant: "destructive",
      });
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchJudgments();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsLoading(true);
      const response = await JudgmentService.uploadJudgment(formData);

      if (response.success) {
        toast({
          title: "Judgment uploaded",
          description: "The judgment has been uploaded successfully.",
          variant: "default",
        });
        fetchJudgments();
      } else {
        toast({
          title: "Upload failed",
          description: (response as any).message || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      const serverMessage = error?.response?.data?.message;
      const message =
        serverMessage ||
        error?.message ||
        "Failed to upload judgment. Please try again.";
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-PK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-blue-900/80 to-purple-900/60 dark:from-navy-950 dark:via-blue-950/80 dark:to-purple-950/60 p-4 sm:p-6 animate-in fade-in duration-500 w-full">
      <div className="w-full space-y-6 sm:space-y-8">
        <div className="w-full">
          <UploadJudgmentForm
            isLoading={isLoading}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
            userRole={user?.role}
          />
        </div>

        <div className="w-full rounded-lg border border-blue-700/30 bg-navy-800/50 backdrop-blur-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-blue-700/30">
            <h3 className="text-lg font-semibold text-white">Judgments from database</h3>
            <p className="text-sm text-blue-200/80 mt-0.5">
              All judgments stored in the system (newest first)
            </p>
          </div>
          {loadingList ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-transparent" />
            </div>
          ) : judgments.length === 0 ? (
            <div className="py-12 text-center text-blue-200/80">
              No judgments found. Upload one above to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-blue-700/30 hover:bg-transparent">
                  <TableHead className="font-semibold text-white">Citation</TableHead>
                  <TableHead className="font-semibold text-white">Case Title</TableHead>
                  <TableHead className="font-semibold text-white">Court</TableHead>
                  <TableHead className="font-semibold text-white">Year</TableHead>
                  <TableHead className="font-semibold text-white">Category</TableHead>
                  <TableHead className="font-semibold text-white">Price</TableHead>
                  <TableHead className="font-semibold text-white">Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {judgments.map((j) => (
                  <TableRow key={j._id} className="border-blue-700/30 hover:bg-white/5">
                    <TableCell className="font-mono text-sm text-blue-100">{j.citation}</TableCell>
                    <TableCell className="text-white max-w-[200px] truncate" title={j.caseTitle}>
                      {j.caseTitle}
                    </TableCell>
                    <TableCell className="text-blue-200">{j.court}</TableCell>
                    <TableCell className="text-blue-200">{j.year}</TableCell>
                    <TableCell className="text-blue-200">{j.category}</TableCell>
                    <TableCell className="text-white">
                      {j.currency} {j.price}
                    </TableCell>
                    <TableCell className="text-blue-200/80 text-sm">{formatDate(j.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadJudgment;