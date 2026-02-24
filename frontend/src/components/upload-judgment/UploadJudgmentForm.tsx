// components/upload-judgment/UploadJudgmentForm.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  File, 
  ChevronRight,
  ChevronLeft,
  Scale,
  Calendar,
  Tag,
  Gavel,
  CheckCircle,
  AlertCircle,
  Image,
  X,
  Eye,
  Download,
  Check,
  Search,
  Filter,
  Plus,
  Loader2,
  MoreVertical,
  Trash2,
  Edit,
  ExternalLink,
  AlertTriangle,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Undo,
  Redo,
  Type,
  FileEdit
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { JudgmentService, type Judgment as ApiJudgment, type JudgmentFilters } from "@/services/JudgmentService";
import { constructImageUrl } from "@/services/BookService";
import { categoryService } from "@/services/categoryService";

interface UploadJudgmentFormProps {
  isLoading: boolean;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  userRole?: string;
}

const COURTS = [
  "Supreme Court of Pakistan",
  "High Court",
  "District Court",
  "Session Court",
  "Special Court",
  "Federal Shariat Court",
];

const CASE_TYPES = [
  "Civil",
  "Criminal",
  "Constitutional",
  "Family",
  "Commercial",
  "Tax",
  "Labor",
  "Customs",
];

const CURRENCIES = ["PKR", "USD"];
const TEXT_FORMATS = ["plain", "html", "markdown"];

const STEPS = [
  { id: 'case-info', title: 'Case Information', icon: Scale },
  { id: 'details', title: 'Details', icon: Calendar },
  { id: 'pricing', title: 'Pricing', icon: Tag },
  { id: 'documents', title: 'Documents', icon: FileText },
  { id: 'content', title: 'Judgment Content', icon: FileEdit },
];

interface CoverImage {
  file: File;
  previewUrl: string;
  id: string;
}

interface FilePreview {
  file: File;
  previewUrl: string;
  type: 'pdf';
}

interface Judgment {
  _id: string;
  citation: string;
  caseNumber?: string;
  parties: string;
  caseTitle: string;
  court: string;
  judge?: string;
  caseType: string;
  category: string;
  year: number;
  decisionDate?: string;
  keywords: string[];
  summary?: string;
  content?: string;
  contentFormat?: string;
  price: number;
  currency: string;
  pdfFile?: string;
  coverImages?: string[];
  uploader: any;
  viewCount: number;
  purchaseCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

const UploadJudgmentForm = ({
  isLoading,
  onSubmit,
  onCancel,
  userRole,
}: UploadJudgmentFormProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    citation: "",
    caseNumber: "",
    parties: "",
    caseTitle: "",
    court: "",
    judge: "",
    caseType: "",
    category: "",
    year: new Date().getFullYear().toString(),
    decisionDate: "",
    keywords: "",
    summary: "",
    content: "",
    contentFormat: "plain" as "plain" | "html" | "markdown",
    price: "",
    currency: "PKR",
  });

  const [coverImages, setCoverImages] = useState<CoverImage[]>([]);
  const [pdfFile, setPdfFile] = useState<FilePreview | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    type: 'pdf' | 'image';
    url: string;
    name: string;
  }>({ open: false, type: 'image', url: '', name: '' });

  // Judgments Table State
  const [showForm, setShowForm] = useState(false);
  const [judgments, setJudgments] = useState<Judgment[]>([]);
  const [loadingJudgments, setLoadingJudgments] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableFilters, setTableFilters] = useState({
    court: "",
    caseType: "",
    category: "",
    year: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJudgment, setSelectedJudgment] = useState<Judgment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  useEffect(() => {
    categoryService.getCategories().then((res) => {
      if (res.success && res.data) setCategories(res.data);
    });
  }, []);

  const pdfFileRef = useRef<HTMLInputElement>(null);
  const coverImagesRef = useRef<HTMLInputElement>(null);
  const textEditorRef = useRef<HTMLDivElement>(null);

  // Normalize API judgment to table shape (backend sends views/purchases, coverImages)
  const normalizeJudgment = (j: ApiJudgment & { views?: number; purchases?: number; coverImages?: string[] }): Judgment => ({
    ...j,
    keywords: Array.isArray(j.keywords) ? j.keywords : [],
    viewCount: j.viewCount ?? (j as any).views ?? 0,
    purchaseCount: j.purchaseCount ?? (j as any).purchases ?? 0,
    coverImages: Array.isArray((j as any).coverImages) ? (j as any).coverImages : [],
  });

  const getJudgmentCoverUrl = (j: Judgment): string => {
    const first = j.coverImages?.[0];
    return first && String(first).trim() ? constructImageUrl(first) : "/placeholder-book.png";
  };

  // Fetch judgments from database
  const fetchJudgments = async () => {
    try {
      setLoadingJudgments(true);
      const params: JudgmentFilters = {
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      if (tableFilters.court) params.court = tableFilters.court;
      if (tableFilters.caseType) params.caseType = tableFilters.caseType;
      if (tableFilters.category) params.category = tableFilters.category;
      if (tableFilters.year) params.year = parseInt(tableFilters.year, 10) || undefined;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await JudgmentService.getAllJudgments(params);
      const list = res.success && res.data?.judgments ? res.data.judgments : [];
      const normalized = list.map(normalizeJudgment);

      // Client-side filter by search term if API doesn't support it or for extra filtering
      let filtered = normalized;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = normalized.filter(
          (j) =>
            j.citation.toLowerCase().includes(term) ||
            j.caseNumber?.toLowerCase().includes(term) ||
            j.parties.toLowerCase().includes(term) ||
            j.caseTitle.toLowerCase().includes(term) ||
            j.summary?.toLowerCase().includes(term)
        );
      }

      setJudgments(filtered);
    } catch (error) {
      console.error("Error fetching judgments:", error);
      toast({
        title: "Error",
        description: "Failed to load judgments",
        variant: "destructive",
      });
    } finally {
      setLoadingJudgments(false);
    }
  };

  useEffect(() => {
    if (!showForm) {
      fetchJudgments();
    }
  }, [tableFilters, searchTerm, showForm]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCoverImagesChange = (files: FileList | null) => {
    if (!files) return;

    const newImages: CoverImage[] = [];
    
    for (let i = 0; i < Math.min(files.length, 5 - coverImages.length); i++) {
      const file = files[i];
      if (file && file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        newImages.push({
          file,
          previewUrl,
          id: Math.random().toString(36).substr(2, 9)
        });
      }
    }

    setCoverImages(prev => [...prev, ...newImages]);
    setFormErrors(prev => ({ ...prev, coverImages: '' }));
  };

  const removeCoverImage = (id: string) => {
    setCoverImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const handlePdfFileChange = (file: File | null) => {
    if (pdfFile?.previewUrl) {
      URL.revokeObjectURL(pdfFile.previewUrl);
    }

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPdfFile({ file, previewUrl, type: 'pdf' });
    } else {
      setPdfFile(null);
    }
    setFormErrors(prev => ({ ...prev, pdfFile: '' }));
  };

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleCoverImagesChange(e.target.files);
    if (coverImagesRef.current) {
      coverImagesRef.current.value = '';
    }
  };

  // Rich text editor functions
  const executeCommand = useCallback((command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (textEditorRef.current) {
      const content = textEditorRef.current.innerHTML;
      setFormData(prev => ({ ...prev, content }));
    }
  }, []);

  const handleEditorChange = useCallback(() => {
    if (textEditorRef.current) {
      const content = textEditorRef.current.innerHTML;
      setFormData(prev => ({ ...prev, content }));
    }
  }, []);

  const clearFormatting = useCallback(() => {
    executeCommand('removeFormat');
    executeCommand('unlink');
  }, [executeCommand]);

  const validateStep = (_step: number): boolean => {
    setFormErrors({});
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Create FormData
    const formDataToSend = new FormData();
    
    // Add all form fields
    formDataToSend.append('citation', formData.citation.trim());
    formDataToSend.append('caseNumber', formData.caseNumber.trim());
    formDataToSend.append('parties', formData.parties.trim());
    formDataToSend.append('caseTitle', formData.caseTitle.trim());
    formDataToSend.append('court', formData.court);
    formDataToSend.append('judge', formData.judge.trim());
    formDataToSend.append('caseType', formData.caseType);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('year', formData.year.toString());
    formDataToSend.append('decisionDate', formData.decisionDate || '');
    formDataToSend.append('keywords', formData.keywords.trim());
    formDataToSend.append('summary', formData.summary.trim());
    formDataToSend.append('content', formData.content.trim());
    // Backend expects `textContent` field name for the judgment text
    formDataToSend.append('textContent', formData.content.trim());
    formDataToSend.append('contentFormat', formData.contentFormat);
    formDataToSend.append('price', formData.price.toString());
    formDataToSend.append('currency', formData.currency);

    // Add files
    if (pdfFile?.file) {
      formDataToSend.append('pdfFile', pdfFile.file, pdfFile.file.name);
    }
    
    // Add cover images
    coverImages.forEach((image) => {
      if (image.file) {
        formDataToSend.append('coverImages', image.file, image.file.name);
      }
    });

    console.log('Calling onSubmit with FormData');
    onSubmit(formDataToSend);
  };

  const getProgressPercentage = () => {
    return ((currentStep + 1) / STEPS.length) * 100;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const previewFile = (type: 'pdf' | 'image', url: string, name: string) => {
    setPreviewDialog({ open: true, type, url, name });
  };

  // Table functions
  const handleTableFilterChange = (key: string, value: string) => {
    setTableFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearTableFilters = () => {
    setTableFilters({
      court: "",
      caseType: "",
      category: "",
      year: "",
    });
    setSearchTerm("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (judgment: Judgment) => {
    if (judgment.isFeatured) {
      return (
        <Badge className="bg-purple-500 hover:bg-purple-600 text-white">
          Featured
        </Badge>
      );
    }
    if (judgment.price === 0) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          Free
        </Badge>
      );
    }
    return null;
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const res = await JudgmentService.deleteJudgment(id);
      if (res.success) {
        toast({
          title: "Success",
          description: "Judgment deleted successfully",
        });
        setDeleteDialogOpen(false);
        setSelectedJudgment(null);
        fetchJudgments();
      } else {
        toast({
          title: "Error",
          description: (res as any).message || "Failed to delete judgment",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error deleting judgment:", error);
      const msg = error?.response?.data?.message || error?.message || "Failed to delete judgment";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Fix: Handle cancel properly
  const handleCancel = () => {
    setShowForm(false);
    onCancel(); // Call the original onCancel prop if needed
  };

  // Render table view
  if (!showForm) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0f1729' }}>
        {/* Header */}
        <div className="px-4 sm:px-6 py-4" style={{ 
          backgroundColor: '#1a2234',
          borderBottom: '1px solid rgba(100, 116, 139, 0.15)'
        }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 ">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-xl"
                style={{ 
                  backgroundColor: '#2d3748',
                  border: '1px solid rgba(100, 116, 139, 0.2)'
                }}
              >
                <Gavel className="h-6 w-6" style={{ color: '#94a3b8' }} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#f1f5f9' }}>
                  All Judgments
                </h1>
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  Manage and view all judgments in the system
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowForm(true)}
              className="h-11 px-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              style={{
                backgroundColor: '#2d3748',
                color: '#f1f5f9',
                border: '1px solid rgba(100, 116, 139, 0.3)'
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Judgment
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="h-full w-full space-y-6">
            {/* Search and Filters */}
            <Card className="rounded-2xl" style={{
              backgroundColor: '#1a2234',
              border: '1px solid rgba(100, 116, 139, 0.15)'
            }}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4" style={{ color: '#94a3b8' }} />
                    <Input
                      placeholder="Search by citation, case number, parties..."
                      className="pl-9 h-11 rounded-lg"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        backgroundColor: '#1f2937',
                        borderColor: '#374151',
                        color: '#f1f5f9'
                      }}
                    />
                  </div>

                  {/* Filters - FIXED: Proper Select components */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Court Select */}
                    <Select
                      value={tableFilters.court}
                      onValueChange={(value) => handleTableFilterChange("court", value)}
                    >
                      <SelectTrigger className="h-11 rounded-lg" style={{
                        backgroundColor: '#1f2937',
                        borderColor: '#374151',
                        color: '#f1f5f9'
                      }}>
                        <SelectValue placeholder="Court" />
                      </SelectTrigger>
                      <SelectContent style={{
                        backgroundColor: '#1f2937',
                        borderColor: '#374151',
                        color: '#f1f5f9'
                      }}>
                        <SelectItem key="all-courts" value="all">All Courts</SelectItem>
                        {COURTS.map((court) => (
                          <SelectItem key={court} value={court}>
                            {court}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Case Type Select */}
                    <Select
                      value={tableFilters.caseType}
                      onValueChange={(value) => handleTableFilterChange("caseType", value)}
                    >
                      <SelectTrigger className="h-11 rounded-lg" style={{
                        backgroundColor: '#1f2937',
                        borderColor: '#374151',
                        color: '#f1f5f9'
                      }}>
                        <SelectValue placeholder="Case Type" />
                      </SelectTrigger>
                      <SelectContent style={{
                        backgroundColor: '#1f2937',
                        borderColor: '#374151',
                        color: '#f1f5f9'
                      }}>
                        <SelectItem key="all-types" value="all">All Types</SelectItem>
                        {CASE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Category Select */}
                    <Select
                      value={tableFilters.category}
                      onValueChange={(value) => handleTableFilterChange("category", value)}
                    >
                      <SelectTrigger className="h-11 rounded-lg placeholder:text-slate-400 [&>span]:text-slate-100" style={{
                        backgroundColor: '#1f2937',
                        borderColor: '#374151',
                        color: '#f1f5f9'
                      }}>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="text-slate-100" style={{
                        backgroundColor: '#1f2937',
                        borderColor: '#374151',
                        color: '#f1f5f9'
                      }}>
                        <SelectItem key="all-categories" value="all" className="text-slate-100 focus:bg-slate-600 focus:text-white">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category} className="text-slate-100 focus:bg-slate-600 focus:text-white">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Year Input */}
                    <Input
                      type="number"
                      placeholder="Year"
                      className="h-11 rounded-lg"
                      value={tableFilters.year}
                      onChange={(e) => handleTableFilterChange("year", e.target.value)}
                      min="1900"
                      max={new Date().getFullYear()}
                      style={{
                        backgroundColor: '#1f2937',
                        borderColor: '#374151',
                        color: '#f1f5f9'
                      }}
                    />

                    {/* Clear Filters Button */}
                    <Button
                      variant="outline"
                      onClick={clearTableFilters}
                      className="h-11 rounded-lg w-full"
                      style={{
                        backgroundColor: '#1f2937',
                        borderColor: '#374151',
                        color: '#cbd5e1'
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card className="rounded-2xl" style={{
              backgroundColor: '#1a2234',
              border: '1px solid rgba(100, 116, 139, 0.15)'
            }}>
              <CardContent className="p-0">
                <div className="relative overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow style={{ backgroundColor: '#1e293b' }}>
                        <TableHead style={{ color: '#cbd5e1', width: 72 }}>Cover</TableHead>
                        <TableHead style={{ color: '#cbd5e1' }}>Citation</TableHead>
                        <TableHead style={{ color: '#cbd5e1' }}>Case Details</TableHead>
                        <TableHead style={{ color: '#cbd5e1' }}>Court & Type</TableHead>
                        <TableHead style={{ color: '#cbd5e1' }}>Price</TableHead>
                        <TableHead style={{ color: '#cbd5e1' }}>Stats</TableHead>
                        <TableHead style={{ color: '#cbd5e1' }}>Uploaded</TableHead>
                        <TableHead style={{ color: '#cbd5e1' }} className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingJudgments ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex items-center justify-center space-x-2">
                              <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#94a3b8' }} />
                              <span style={{ color: '#94a3b8' }}>Loading judgments...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : judgments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <AlertTriangle className="h-12 w-12" style={{ color: '#94a3b8' }} />
                              <p style={{ color: '#94a3b8' }}>No judgments found</p>
                              <Button
                                variant="outline"
                                onClick={() => setShowForm(true)}
                                size="sm"
                                style={{
                                  backgroundColor: '#1f2937',
                                  borderColor: '#374151',
                                  color: '#cbd5e1'
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add First Judgment
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        judgments.map((judgment) => (
                          <TableRow key={judgment._id} style={{ borderColor: 'rgba(100, 116, 139, 0.15)' }}>
                            <TableCell className="w-[72px]">
                              <div
                                className="w-12 h-16 rounded overflow-hidden flex-shrink-0 border border-slate-600/50 bg-slate-800/50"
                                style={{ minWidth: 48, minHeight: 64 }}
                              >
                                <img
                                  src={getJudgmentCoverUrl(judgment)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder-book.png";
                                  }}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium" style={{ color: '#f1f5f9' }}>
                                  {judgment.citation}
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                  {judgment.caseNumber}
                                </div>
                                {getStatusBadge(judgment)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium" style={{ color: '#f1f5f9' }}>
                                  {judgment.parties}
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                  {judgment.caseTitle}
                                </div>
                                <div className="flex items-center" style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {judgment.year}
                                  {judgment.decisionDate && (
                                    <>
                                      <span className="mx-1">•</span>
                                      {formatDate(judgment.decisionDate)}
                                    </>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium" style={{ color: '#f1f5f9' }}>
                                  {judgment.court}
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                  {judgment.caseType}
                                </div>
                                <Badge variant="outline" className="text-xs" style={{
                                  backgroundColor: '#1f2937',
                                  borderColor: '#374151',
                                  color: '#cbd5e1'
                                }}>
                                  {judgment.category}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium" style={{ color: '#f1f5f9' }}>
                                {formatCurrency(judgment.price, judgment.currency)}
                              </div>
                              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                                {judgment.currency}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center" style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                  <Eye className="h-3 w-3 mr-1" />
                                  {judgment.viewCount || 0} views
                                </div>
                                <div className="flex items-center" style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                  <Download className="h-3 w-3 mr-1" />
                                  {judgment.purchaseCount || 0} purchases
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                {formatDate(judgment.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      style={{
                                        backgroundColor: 'transparent',
                                        color: '#cbd5e1'
                                      }}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" style={{
                                    backgroundColor: '#1a2234',
                                    borderColor: '#374151',
                                    color: '#f1f5f9'
                                  }}>
                                    <DropdownMenuLabel style={{ color: '#cbd5e1' }}>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem style={{ color: '#cbd5e1' }}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem style={{ color: '#cbd5e1' }}>
                                      <FileText className="h-4 w-4 mr-2" />
                                      Read Judgment
                                    </DropdownMenuItem>
                                    <DropdownMenuItem style={{ color: '#cbd5e1' }}>
                                      <Download className="h-4 w-4 mr-2" />
                                      Download PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {userRole === "superadmin" && (
                                      <>
                                        <DropdownMenuItem style={{ color: '#cbd5e1' }}>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="text-red-600"
                                          onClick={() => {
                                            setSelectedJudgment(judgment);
                                            setDeleteDialogOpen(true);
                                          }}
                                          style={{ color: '#ef4444' }}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent style={{
            backgroundColor: '#1a2234',
            borderColor: '#374151',
            color: '#f1f5f9'
          }}>
            <AlertDialogHeader>
              <AlertDialogTitle style={{ color: '#f1f5f9' }}>Delete Judgment</AlertDialogTitle>
              <AlertDialogDescription style={{ color: '#94a3b8' }}>
                Are you sure you want to delete "{selectedJudgment?.citation}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                disabled={deletingId === selectedJudgment?._id}
                style={{
                  backgroundColor: '#1f2937',
                  borderColor: '#374151',
                  color: '#cbd5e1'
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedJudgment && handleDelete(selectedJudgment._id)}
                disabled={deletingId === selectedJudgment?._id}
                style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
              >
                {deletingId === selectedJudgment?._id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Render upload form view
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0f1729' }}>
      {/* Header */}
      <div className="px-4 sm:px-6 py-4" style={{ 
        backgroundColor: '#1a2234',
        borderBottom: '1px solid rgba(100, 116, 139, 0.15)'
      }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-xl"
              style={{ 
                backgroundColor: '#2d3748',
                border: '1px solid rgba(100, 116, 139, 0.2)'
              }}
            >
              <Gavel className="h-6 w-6" style={{ color: '#94a3b8' }} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#f1f5f9' }}>
                Upload New Judgment
              </h1>
              <p className="text-sm" style={{ color: '#94a3b8' }}>
                {userRole === "superadmin" 
                  ? "Judgment will be automatically approved and published" 
                  : "Judgment will be sent for super admin approval"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide" style={{ color: '#94a3b8' }}>Progress</div>
              <div className="text-lg font-bold" style={{ color: '#f1f5f9' }}>{Math.round(getProgressPercentage())}%</div>
            </div>
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="h-11 px-6 rounded-lg transition-colors"
              style={{ 
                color: '#cbd5e1',
                borderColor: '#374151',
                backgroundColor: '#1f2937'
              }}
            >
              View All Judgments
            </Button>
          </div>
        </div>
      </div>

      {/* Rest of your existing upload form code */}
      <div className="flex-1 p-4 sm:p-6 overflow-hidden">
        <div className="h-full flex flex-col w-full">
          {/* Progress Steps */}
          <div className="mb-6">
            <div className="p-4 sm:p-6 rounded-2xl" style={{ 
              backgroundColor: '#1e293b',
              border: '1px solid rgba(100, 116, 139, 0.2)'
            }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <div className="text-sm font-medium" style={{ color: '#94a3b8' }}>
                  Step {currentStep + 1} of {STEPS.length}
                </div>
                <div className="text-sm font-semibold" style={{ color: '#f1f5f9' }}>
                  {Math.round(getProgressPercentage())}% Complete
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-2.5 mb-6 rounded-full" style={{ 
                backgroundColor: '#374151',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <div 
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${getProgressPercentage()}%`,
                    background: 'linear-gradient(90deg, #4b5563 0%, #6b7280 100%)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}
                ></div>
              </div>

              {/* Step Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div 
                        className={`flex items-center justify-center w-12 h-12 rounded-xl border-2 transition-all duration-300 ${isActive ? 'shadow-md scale-105' : isCompleted ? 'shadow-sm' : ''}`}
                        style={{
                          backgroundColor: isActive ? '#2d3748' : isCompleted ? '#374151' : '#1f2937',
                          borderColor: isActive ? '#4b5563' : isCompleted ? '#10b981' : '#374151',
                          color: isActive ? '#f1f5f9' : isCompleted ? '#10b981' : '#9ca3af'
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <span 
                        className="text-xs sm:text-sm mt-2 font-medium text-center"
                        style={{ 
                          color: isActive ? '#f1f5f9' : isCompleted ? '#d1d5db' : '#9ca3af'
                        }}
                      >
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Content - FIXED: Proper Select components */}
          <div className="flex-1 overflow-hidden">
            <Card className="h-full flex flex-col rounded-2xl" style={{
              backgroundColor: '#1a2234',
              border: '1px solid rgba(100, 116, 139, 0.15)'
            }}>
              <CardHeader className="border-b pb-4" style={{ 
                borderColor: 'rgba(100, 116, 139, 0.15)',
                background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.5) 0%, transparent 100%)'
              }}>
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ 
                      backgroundColor: '#2d3748',
                      border: '1px solid rgba(100, 116, 139, 0.2)'
                    }}
                  >
                    {React.createElement(STEPS[currentStep].icon, { 
                      className: "h-5 w-5",
                      style: { color: '#94a3b8' }
                    })}
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl" style={{ color: '#f1f5f9' }}>
                      {STEPS[currentStep].title}
                    </CardTitle>
                    <CardDescription style={{ color: '#94a3b8' }}>
                      Please provide the required information for this step
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 flex-1 overflow-y-auto">
                <form onSubmit={handleFormSubmit} className="space-y-6 h-full">
                  
                  {/* Step 1: Case Information */}
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="citation" className="font-medium flex items-center gap-1" style={{ color: '#cbd5e1' }}>
                              Citation <span style={{ color: '#ef4444' }}>*</span>
                            </Label>
                            <Input
                              id="citation"
                              value={formData.citation}
                              onChange={(e) => handleInputChange('citation', e.target.value)}
                              required
                              className="h-11 rounded-lg transition-colors"
                              placeholder="e.g., PLD 2024 SC 1"
                              style={{
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                color: '#f1f5f9'
                              }}
                            />
                            {formErrors.citation && (
                              <p className="text-sm flex items-center gap-1 mt-1" style={{ color: '#ef4444' }}>
                                <AlertCircle className="h-3 w-3" />
                                {formErrors.citation}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="caseNumber" className="font-medium flex items-center gap-1" style={{ color: '#cbd5e1' }}>
                              Case Number <span style={{ color: '#ef4444' }}>*</span>
                            </Label>
                            <Input
                              id="caseNumber"
                              value={formData.caseNumber}
                              onChange={(e) => handleInputChange('caseNumber', e.target.value)}
                              required
                              className="h-11 rounded-lg transition-colors"
                              placeholder="Enter case number"
                              style={{
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                color: '#f1f5f9'
                              }}
                            />
                            {formErrors.caseNumber && (
                              <p className="text-sm flex items-center gap-1 mt-1" style={{ color: '#ef4444' }}>
                                <AlertCircle className="h-3 w-3" />
                                {formErrors.caseNumber}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="parties" className="font-medium flex items-center gap-1" style={{ color: '#cbd5e1' }}>
                              Parties <span style={{ color: '#ef4444' }}>*</span>
                            </Label>
                            <Input
                              id="parties"
                              value={formData.parties}
                              onChange={(e) => handleInputChange('parties', e.target.value)}
                              required
                              className="h-11 rounded-lg transition-colors"
                              placeholder="e.g., Plaintiff vs Defendant"
                              style={{
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                color: '#f1f5f9'
                              }}
                            />
                            {formErrors.parties && (
                              <p className="text-sm flex items-center gap-1 mt-1" style={{ color: '#ef4444' }}>
                                <AlertCircle className="h-3 w-3" />
                                {formErrors.parties}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="caseTitle" className="font-medium" style={{ color: '#cbd5e1' }}>
                              Case Title
                            </Label>
                            <Input
                              id="caseTitle"
                              value={formData.caseTitle}
                              onChange={(e) => handleInputChange('caseTitle', e.target.value)}
                              className="h-11 rounded-lg transition-colors"
                              placeholder="Enter case title"
                              style={{
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                color: '#f1f5f9'
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          {/* Court Select - FIXED */}
                          <div className="space-y-2">
                            <Label htmlFor="court" className="font-medium flex items-center gap-1" style={{ color: '#cbd5e1' }}>
                              Court <span style={{ color: '#ef4444' }}>*</span>
                            </Label>
                            <Select value={formData.court} onValueChange={(v) => handleInputChange('court', v)}>
                              <SelectTrigger className="h-11 rounded-lg transition-colors" style={{
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                color: '#f1f5f9'
                              }}>
                                <SelectValue placeholder="Select court" />
                              </SelectTrigger>
                              <SelectContent style={{
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                color: '#f1f5f9'
                              }}>
                                {COURTS.map(court => (
                                  <SelectItem key={`court-${court}`} value={court}>
                                    {court}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {formErrors.court && (
                              <p className="text-sm flex items-center gap-1 mt-1" style={{ color: '#ef4444' }}>
                                <AlertCircle className="h-3 w-3" />
                                {formErrors.court}
                              </p>
                            )}
                          </div>

                          {/* Case Type Select - FIXED */}
                          <div className="space-y-2">
                            <Label htmlFor="caseType" className="font-medium flex items-center gap-1" style={{ color: '#cbd5e1' }}>
                              Case Type <span style={{ color: '#ef4444' }}>*</span>
                            </Label>
                            <Select value={formData.caseType} onValueChange={(v) => handleInputChange('caseType', v)}>
                              <SelectTrigger className="h-11 rounded-lg transition-colors" style={{
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                color: '#f1f5f9'
                              }}>
                                <SelectValue placeholder="Select case type" />
                              </SelectTrigger>
                              <SelectContent style={{
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                color: '#f1f5f9'
                              }}>
                                {CASE_TYPES.map(type => (
                                  <SelectItem key={`type-${type}`} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {formErrors.caseType && (
                              <p className="text-sm flex items-center gap-1 mt-1" style={{ color: '#ef4444' }}>
                                <AlertCircle className="h-3 w-3" />
                                {formErrors.caseType}
                              </p>
                            )}
                          </div>

                          {/* Category Select - from API, visible text */}
                          <div className="space-y-2">
                            <Label htmlFor="category" className="font-medium flex items-center gap-1" style={{ color: '#cbd5e1' }}>
                              Category <span style={{ color: '#ef4444' }}>*</span>
                            </Label>
                            <Select value={formData.category} onValueChange={(v) => handleInputChange('category', v)}>
                              <SelectTrigger className="h-11 rounded-lg transition-colors placeholder:text-slate-400 [&>span]:text-slate-100" style={{
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                color: '#f1f5f9'
                              }}>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent className="text-slate-100" style={{
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                color: '#f1f5f9'
                              }}>
                                {categories.map((category) => (
                                  <SelectItem key={`category-${category}`} value={category} className="text-slate-100 focus:bg-slate-600 focus:text-white">
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {formErrors.category && (
                              <p className="text-sm flex items-center gap-1 mt-1" style={{ color: '#ef4444' }}>
                                <AlertCircle className="h-3 w-3" />
                                {formErrors.category}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="judge" className="font-medium" style={{ color: '#cbd5e1' }}>
                              Judge
                            </Label>
                            <Input
                              id="judge"
                              value={formData.judge}
                              onChange={(e) => handleInputChange('judge', e.target.value)}
                              className="h-11 rounded-lg transition-colors"
                              placeholder="Enter judge name"
                              style={{
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                color: '#f1f5f9'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Additional Details */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 h-full">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="year" className="font-medium flex items-center gap-1" style={{ color: '#cbd5e1' }}>
                                Year <span style={{ color: '#ef4444' }}>*</span>
                              </Label>
                              <Input
                                id="year"
                                type="number"
                                value={formData.year}
                                onChange={(e) => handleInputChange('year', e.target.value)}
                                required
                                className="h-11 rounded-lg transition-colors"
                                placeholder="2024"
                                min="1900"
                                max={new Date().getFullYear()}
                                style={{
                                  backgroundColor: '#1f2937',
                                  borderColor: '#374151',
                                  color: '#f1f5f9'
                                }}
                              />
                              {formErrors.year && (
                                <p className="text-sm flex items-center gap-1 mt-1" style={{ color: '#ef4444' }}>
                                  <AlertCircle className="h-3 w-3" />
                                  {formErrors.year}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="decisionDate" className="font-medium" style={{ color: '#cbd5e1' }}>
                                Decision Date
                              </Label>
                              <Input
                                id="decisionDate"
                                type="date"
                                value={formData.decisionDate}
                                onChange={(e) => handleInputChange('decisionDate', e.target.value)}
                                className="h-11 rounded-lg transition-colors"
                                style={{
                                  backgroundColor: '#1f2937',
                                  borderColor: '#374151',
                                  color: '#f1f5f9'
                                }}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="keywords" className="font-medium" style={{ color: '#cbd5e1' }}>
                              Keywords
                            </Label>
                            <Input
                              id="keywords"
                              value={formData.keywords}
                              onChange={(e) => handleInputChange('keywords', e.target.value)}
                              className="h-11 rounded-lg transition-colors"
                              placeholder="Comma separated keywords"
                              style={{
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                color: '#f1f5f9'
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2 h-full">
                          <Label htmlFor="summary" className="font-medium flex items-center gap-1" style={{ color: '#cbd5e1' }}>
                            Summary <span style={{ color: '#ef4444' }}>*</span>
                          </Label>
                          <Textarea
                            id="summary"
                            value={formData.summary}
                            onChange={(e) => handleInputChange('summary', e.target.value)}
                            rows={12}
                            required
                            className="resize-none h-full min-h-[300px] rounded-lg transition-colors"
                            placeholder="Provide a detailed summary of the judgment..."
                            style={{
                              backgroundColor: '#1f2937',
                              borderColor: '#374151',
                              color: '#f1f5f9'
                            }}
                          />
                          {formErrors.summary && (
                            <p className="text-sm flex items-center gap-1 mt-1" style={{ color: '#ef4444' }}>
                              <AlertCircle className="h-3 w-3" />
                              {formErrors.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Pricing */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="max-w-md mx-auto rounded-2xl p-6" style={{ 
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(100, 116, 139, 0.2)'
                      }}>
                        <div className="text-center mb-6">
                          <div 
                            className="p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4"
                            style={{ 
                              backgroundColor: '#2d3748',
                              border: '1px solid rgba(100, 116, 139, 0.2)'
                            }}
                          >
                            <Tag className="h-8 w-8" style={{ color: '#94a3b8' }} />
                          </div>
                          <h3 className="text-lg font-semibold mb-2" style={{ color: '#f1f5f9' }}>Set Judgment Price</h3>
                          <p className="text-sm" style={{ color: '#94a3b8' }}>Set the price for accessing this judgment</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="price" className="font-medium flex items-center gap-1" style={{ color: '#cbd5e1' }}>
                              Price <span style={{ color: '#ef4444' }}>*</span>
                            </Label>
                            <Input
                              id="price"
                              type="number"
                              value={formData.price}
                              onChange={(e) => handleInputChange('price', e.target.value)}
                              required
                              className="h-11 rounded-lg transition-colors text-center text-lg font-semibold"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              style={{
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                color: '#f1f5f9'
                              }}
                            />
                            {formErrors.price && (
                              <p className="text-sm flex items-center gap-1 mt-1 justify-center" style={{ color: '#ef4444' }}>
                                <AlertCircle className="h-3 w-3" />
                                {formErrors.price}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="currency" className="font-medium" style={{ color: '#cbd5e1' }}>
                              Currency
                            </Label>
                            <Select value={formData.currency} onValueChange={(v) => handleInputChange('currency', v)}>
                              <SelectTrigger className="h-11 rounded-lg transition-colors" style={{
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                color: '#f1f5f9'
                              }}>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                              <SelectContent style={{
                                backgroundColor: '#1f2937',
                                borderColor: '#374151',
                                color: '#f1f5f9'
                              }}>
                                {CURRENCIES.map(currency => (
                                  <SelectItem key={`currency-${currency}`} value={currency}>
                                    {currency}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Documents */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      {/* Cover Images Section */}
                      <div className="space-y-4">
                        <Label className="font-medium flex items-center gap-2" style={{ color: '#cbd5e1' }}>
                          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#94a3b8' }}></div>
                          Cover Images (Optional)
                          <span className="text-sm font-normal" style={{ color: '#94a3b8' }}>
                            (Up to 5 images)
                          </span>
                        </Label>
                        
                        <p className="text-sm" style={{ color: '#94a3b8' }}>
                          Upload up to 5 cover images for the judgment. These will be displayed in the judgment gallery.
                        </p>
                        
                        <Input
                          ref={coverImagesRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleCoverImageSelect}
                          className="hidden"
                          id="cover-images"
                        />
                        
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                          {/* Cover Image Upload Box */}
                          {coverImages.length < 5 && (
                            <div className="rounded-xl p-4 cursor-pointer group transition-all duration-300" style={{ 
                              border: '2px dashed #4b5563',
                              backgroundColor: '#1f2937',
                              borderColor: '#4b5563'
                            }}>
                              <label htmlFor="cover-images" className="cursor-pointer block h-full">
                                <div className="flex flex-col items-center justify-center h-32 text-center space-y-2">
                                  <div 
                                    className="p-2 rounded-lg"
                                    style={{ 
                                      backgroundColor: '#2d3748',
                                      border: '1px solid rgba(100, 116, 139, 0.2)'
                                    }}
                                  >
                                    <Upload className="h-6 w-6" style={{ color: '#94a3b8' }} />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm" style={{ color: '#cbd5e1' }}>Add Cover</p>
                                    <p className="text-xs" style={{ color: '#94a3b8' }}>
                                      {coverImages.length}/5
                                    </p>
                                  </div>
                                </div>
                              </label>
                            </div>
                          )}

                          {/* Cover Image Previews */}
                          {coverImages.map((image) => (
                            <div key={image.id} className="relative group">
                              <div 
                                className="aspect-square rounded-lg overflow-hidden cursor-pointer"
                                onClick={() => previewFile('image', image.previewUrl, image.file.name)}
                                style={{
                                  border: '2px solid rgba(34, 197, 94, 0.3)',
                                  backgroundColor: 'rgba(34, 197, 94, 0.05)'
                                }}
                              >
                                <img 
                                  src={image.previewUrl} 
                                  alt="Cover preview" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeCoverImage(image.id)}
                                className="absolute -top-2 -right-2 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                style={{ 
                                  backgroundColor: '#ef4444',
                                  color: '#ffffff'
                                }}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        {formErrors.coverImages && (
                          <p className="text-sm flex items-center gap-1" style={{ color: '#ef4444' }}>
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.coverImages}
                          </p>
                        )}
                      </div>

                      {/* PDF File Upload */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold flex items-center gap-2" style={{ color: '#cbd5e1' }}>
                            <FileText className="h-4 w-4" style={{ color: '#94a3b8' }} />
                            PDF File *
                            <span className="text-sm font-normal" style={{ color: '#94a3b8' }}>
                              (PDF file up to 50MB)
                            </span>
                          </Label>
                          {formErrors.pdfFile && (
                            <span className="text-sm" style={{ color: '#ef4444' }}>
                              {formErrors.pdfFile}
                            </span>
                          )}
                        </div>

                        {!pdfFile ? (
                          <div
                            className="border-2 border-dashed rounded-xl p-6 transition-all duration-300 bg-[#1f2937] cursor-pointer hover:border-blue-500/50 border-[#374151]"
                          >
                            <Input
                              ref={pdfFileRef}
                              type="file"
                              accept=".pdf"
                              onChange={(e) => handlePdfFileChange(e.target.files?.[0] || null)}
                              className="hidden"
                              id="pdf-file"
                            />
                            <label htmlFor="pdf-file" className="cursor-pointer block">
                              <div className="text-center space-y-3">
                                <div
                                  className="p-3 rounded-lg w-12 h-12 mx-auto flex items-center justify-center transition-transform hover:scale-110"
                                  style={{ backgroundColor: 'rgba(100, 116, 139, 0.2)' }}
                                >
                                  <FileText className="h-6 w-6" style={{ color: '#94a3b8' }} />
                                </div>
                                <div>
                                  <p className="font-semibold text-white">Upload PDF File</p>
                                  <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>
                                    Click to upload PDF version of the judgment
                                  </p>
                                </div>
                              </div>
                            </label>
                          </div>
                        ) : (
                          <div
                            className="border-2 rounded-xl p-4 transition-all duration-300"
                            style={{
                              borderColor: 'rgba(34, 197, 94, 0.3)',
                              backgroundColor: 'rgba(34, 197, 94, 0.05)'
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                  className="p-2 rounded-lg"
                                  style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                                >
                                  <CheckCircle className="h-5 w-5" style={{ color: '#10b981' }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-white" />
                                    <p className="font-semibold text-white truncate">
                                      {pdfFile.file.name}
                                    </p>
                                  </div>
                                  <p className="text-sm" style={{ color: '#94a3b8' }}>
                                    {formatFileSize(pdfFile.file.size)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => previewFile('pdf', pdfFile.previewUrl, pdfFile.file.name)}
                                  className="flex items-center gap-1"
                                  style={{ 
                                    color: '#cbd5e1',
                                    borderColor: '#374151',
                                    backgroundColor: '#1f2937'
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                  Preview
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePdfFileChange(null)}
                                  style={{ color: '#ef4444' }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 5: Judgment Content (Rich Text Editor) */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: 'rgba(100, 116, 139, 0.15)' }}>
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: 'rgba(100, 116, 139, 0.2)' }}
                        >
                          <FileEdit className="h-5 w-5" style={{ color: '#94a3b8' }} />
                        </div>
                        <h3 className="text-xl font-semibold text-white">Judgment Content</h3>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label className="text-base font-semibold flex items-center gap-2" style={{ color: '#cbd5e1' }}>
                            <FileEdit className="h-4 w-4" style={{ color: '#94a3b8' }} />
                            Judgment Text Content *
                          </Label>

                          <Select 
                            value={formData.contentFormat} 
                            onValueChange={(v: "plain" | "html" | "markdown") => handleInputChange('contentFormat', v)}
                          >
                            <SelectTrigger className="w-32 h-9" style={{
                              backgroundColor: '#1f2937',
                              borderColor: '#374151',
                              color: '#f1f5f9'
                            }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent style={{
                              backgroundColor: '#1f2937',
                              borderColor: '#374151',
                              color: '#f1f5f9'
                            }}>
                              {TEXT_FORMATS.map(format => (
                                <SelectItem
                                  key={format}
                                  value={format}
                                  className="hover:bg-[#2d3748]"
                                >
                                  {format.toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="border-2 rounded-xl" style={{
                          backgroundColor: '#1f2937',
                          borderColor: '#374151'
                        }}>
                          {/* Toolbar */}
                          <div className="flex flex-wrap items-center gap-1 p-3 border-b" style={{
                            borderColor: '#374151',
                            backgroundColor: '#2d3748'
                          }}>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => executeCommand('undo')} 
                              className="h-8 w-8 p-0 text-white hover:bg-[#374151]"
                            >
                              <Undo className="h-4 w-4" />
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => executeCommand('redo')} 
                              className="h-8 w-8 p-0 text-white hover:bg-[#374151]"
                            >
                              <Redo className="h-4 w-4" />
                            </Button>

                            <div className="w-px h-6" style={{ backgroundColor: 'rgba(100, 116, 139, 0.3)' }}></div>

                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => executeCommand('bold')} 
                              className="h-8 w-8 p-0 text-white hover:bg-[#374151]"
                            >
                              <Bold className="h-4 w-4" />
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => executeCommand('italic')} 
                              className="h-8 w-8 p-0 text-white hover:bg-[#374151]"
                            >
                              <Italic className="h-4 w-4" />
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => executeCommand('underline')} 
                              className="h-8 w-8 p-0 text-white hover:bg-[#374151]"
                            >
                              <Underline className="h-4 w-4" />
                            </Button>

                            <div className="w-px h-6" style={{ backgroundColor: 'rgba(100, 116, 139, 0.3)' }}></div>

                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => executeCommand('justifyLeft')} 
                              className="h-8 w-8 p-0 text-white hover:bg-[#374151]"
                            >
                              <AlignLeft className="h-4 w-4" />
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => executeCommand('justifyCenter')} 
                              className="h-8 w-8 p-0 text-white hover:bg-[#374151]"
                            >
                              <AlignCenter className="h-4 w-4" />
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => executeCommand('justifyRight')} 
                              className="h-8 w-8 p-0 text-white hover:bg-[#374151]"
                            >
                              <AlignRight className="h-4 w-4" />
                            </Button>

                            <div className="w-px h-6" style={{ backgroundColor: 'rgba(100, 116, 139, 0.3)' }}></div>

                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => executeCommand('insertUnorderedList')} 
                              className="h-8 w-8 p-0 text-white hover:bg-[#374151]"
                            >
                              <List className="h-4 w-4" />
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => executeCommand('insertOrderedList')} 
                              className="h-8 w-8 p-0 text-white hover:bg-[#374151]"
                            >
                              <ListOrdered className="h-4 w-4" />
                            </Button>
                          </div>

                          <div
                            ref={textEditorRef}
                            contentEditable
                            onInput={handleEditorChange}
                            className="h-96 w-full overflow-auto p-6 focus:outline-none"
                            style={{
                              fontFamily: 'system-ui, -apple-system, sans-serif',
                              fontSize: '15px',
                              lineHeight: '1.6',
                              color: '#f1f5f9'
                            }}
                            placeholder="Start typing the judgment content here..."
                          />
                        </div>
                        {formErrors.content && (
                          <p className="text-sm flex items-center gap-1" style={{ color: '#ef4444' }}>
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.content}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between pt-6 gap-4" style={{ 
                    borderTop: '1px solid rgba(100, 116, 139, 0.15)',
                    marginTop: 'auto'
                  }}>
                    <div>
                      {currentStep > 0 && (
                        <Button
                          type="button"
                          onClick={prevStep}
                          variant="outline"
                          className="h-11 px-6 rounded-lg transition-colors w-full sm:w-auto"
                          style={{ 
                            color: '#cbd5e1',
                            borderColor: '#374151',
                            backgroundColor: '#1f2937'
                          }}
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Previous
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        type="button"
                        onClick={handleCancel}
                        variant="outline"
                        className="h-11 px-6 rounded-lg transition-colors w-full sm:w-auto"
                        style={{ 
                          color: '#cbd5e1',
                          borderColor: '#374151',
                          backgroundColor: '#1f2937'
                        }}
                      >
                        Cancel
                      </Button>
                      
                      {currentStep < STEPS.length - 1 ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="h-11 px-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto"
                          style={{
                            backgroundColor: '#2d3748',
                            color: '#f1f5f9',
                            border: '1px solid rgba(100, 116, 139, 0.3)'
                          }}
                        >
                          Next Step
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={isLoading || !pdfFile}
                          className="h-11 px-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: '#2d3748',
                            color: '#f1f5f9',
                            border: '1px solid rgba(100, 116, 139, 0.3)'
                          }}
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2" style={{ borderColor: '#f1f5f9' }}></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Judgment
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* File Preview Dialog */}
      <Dialog open={previewDialog.open} onOpenChange={(open) => setPreviewDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-4xl max-h-[80vh]" style={{
          backgroundColor: '#1a2234',
          border: '1px solid rgba(100, 116, 139, 0.15)',
          color: '#f1f5f9'
        }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" style={{ color: '#94a3b8' }} />
              Preview: {previewDialog.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {previewDialog.type === 'image' && (
              <img src={previewDialog.url} alt="Preview" className="w-full h-auto rounded-lg" />
            )}
            {previewDialog.type === 'pdf' && (
              <div className="w-full h-[60vh]">
                <iframe 
                  src={previewDialog.url} 
                  className="w-full h-full rounded-lg"
                  title="PDF Preview"
                  style={{ border: '1px solid #374151' }}
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => window.open(previewDialog.url, '_blank')}
              className="flex items-center gap-2"
              style={{ 
                color: '#cbd5e1',
                borderColor: '#374151',
                backgroundColor: '#1f2937'
              }}
            >
              <Download className="h-4 w-4" />
              Open in New Tab
            </Button>
            <Button 
              onClick={() => setPreviewDialog(prev => ({ ...prev, open: false }))}
              style={{
                backgroundColor: '#2d3748',
                color: '#f1f5f9',
                border: '1px solid rgba(100, 116, 139, 0.3)'
              }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadJudgmentForm;