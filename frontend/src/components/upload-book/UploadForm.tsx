// components/upload-book/UploadForm.tsx
import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Upload,
  X,
  FileText,
  Image,
  CheckCircle,
  Trash2,
  BookOpen,
  DollarSign,
  User,
  Building,
  Calendar,
  Hash,
  Globe,
  Eye,
  Download,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Undo,
  Redo,
  ArrowLeft,
  Save,
  Type,
  File,
  Layers,
  Tag,
  Percent,
  FileEdit,
  Shield,
  AlertCircle
} from "lucide-react";

interface UploadFormProps {
  isOpen: boolean;
  isLoading: boolean;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  userRole?: string;
}

const LANGUAGES = ["English", "Urdu", "Arabic", "French", "German", "Spanish"];
const CURRENCIES = ["PKR", "USD", "EUR", "GBP"];
const TEXT_FORMATS = ["plain", "html", "markdown"];
const CATEGORIES = [
  "Law Books", "Academic", "Reference", "Fiction",
  "Non-Fiction", "Science", "Technology", "History",
  "Biography", "Self-Help", "Business", "Religion"
];

const UploadForm = ({ isOpen, isLoading, onSubmit, onCancel, userRole }: UploadFormProps) => {
  const navigate = useNavigate();

  // Navy Blue Color Scheme
  const colors = {
    primary: '#0F172A',
    sidebar: '#0A192F',
    accent: '#1E40AF',
    accentLight: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#8B5CF6',
    darkBlue: '#1E293B',
    lightBlue: '#64748B',
    text: {
      primary: '#FFFFFF',
      secondary: '#94A3B8',
      muted: '#64748B'
    },
    gradients: {
      blue: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
      dark: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)'
    }
  };

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    price: "",
    category: "",
    subcategory: "",
    description: "",
    publisher: "",
    publicationYear: new Date().getFullYear().toString(),
    totalPages: "",
    language: "English",
    edition: "First Edition",
    isbn: "",
    authorBio: "",
    discountPercentage: "0",
    currency: "PKR",
    tags: "",
    metaDescription: "",
    textContent: "",
    textFormat: "plain" as "plain" | "html" | "markdown",
    textLanguage: "English"
  });

  const [coverImages, setCoverImages] = useState<Array<{ file: File; previewUrl: string; id: string }>>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    type: 'pdf' | 'image';
    url: string;
    name: string;
  }>({ open: false, type: 'image', url: '', name: '' });
  const [activeSection, setActiveSection] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const coverImageRef = useRef<HTMLInputElement>(null);
  const pdfFileRef = useRef<HTMLInputElement>(null);
  const textEditorRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) errors.title = "Book title is required";
    if (!formData.author.trim()) errors.author = "Author name is required";
    if (!formData.category.trim()) errors.category = "Category is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.price.trim()) errors.price = "Price is required";
    if (coverImages.length === 0) errors.coverImages = "At least one cover image is required";
    if (!pdfFile) errors.pdfFile = "PDF file is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCoverImagesChange = (files: FileList | null) => {
    if (!files) return;

    const newImages: Array<{ file: File; previewUrl: string; id: string }> = [];

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
    if (validationErrors.coverImages) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.coverImages;
        return newErrors;
      });
    }
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
    setPdfFile(file);
    if (validationErrors.pdfFile) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.pdfFile;
        return newErrors;
      });
    }
  };

  const executeCommand = useCallback((command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (textEditorRef.current) {
      const content = textEditorRef.current.innerHTML;
      setFormData(prev => ({ ...prev, textContent: content }));
    }
  }, []);

  const handleEditorChange = useCallback(() => {
    if (textEditorRef.current) {
      const content = textEditorRef.current.innerHTML;
      setFormData(prev => ({ ...prev, textContent: content }));
    }
  }, []);

  const clearFormatting = useCallback(() => {
    executeCommand('removeFormat');
    executeCommand('unlink');
  }, [executeCommand]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value) submitData.append(key, value);
    });

    coverImages.forEach((image) => {
      submitData.append('coverImages', image.file);
    });

    if (pdfFile) submitData.append('pdfFile', pdfFile);

    try {
      await onSubmit(submitData);

      // Navigate based on role
      if (userRole === "admin") {
        navigate("/admin/shop");
      } else {
        navigate("/superadmin/shop");
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      price: "",
      category: "",
      subcategory: "",
      description: "",
      publisher: "",
      publicationYear: new Date().getFullYear().toString(),
      totalPages: "",
      language: "English",
      edition: "First Edition",
      isbn: "",
      authorBio: "",
      discountPercentage: "0",
      currency: "PKR",
      tags: "",
      metaDescription: "",
      textContent: "",
      textFormat: "plain",
      textLanguage: "English"
    });

    coverImages.forEach(image => {
      URL.revokeObjectURL(image.previewUrl);
    });
    setCoverImages([]);

    setPdfFile(null);
    setValidationErrors({});

    if (coverImageRef.current) coverImageRef.current.value = "";
    if (pdfFileRef.current) pdfFileRef.current.value = "";
    if (textEditorRef.current) {
      textEditorRef.current.innerHTML = "";
    }

    onCancel();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const sections = [
    { id: 1, title: "Basic Info", icon: BookOpen, color: colors.accentLight },
    { id: 2, title: "Publishing", icon: Building, color: colors.success },
    { id: 3, title: "Pricing", icon: DollarSign, color: colors.warning },
    { id: 4, title: "Media", icon: Image, color: colors.info },
    { id: 5, title: "Additional", icon: FileEdit, color: colors.accent }
  ];

  if (!isOpen) return null;

  return (
    <div
      className="transition-all duration-500 opacity-100 scale-100 h-full animate-slide-down w-full"
      style={{ backgroundColor: colors.primary }}
    >
      <style>
        {`
          @keyframes slideDown {
            from { 
              opacity: 0;
              transform: translateY(-20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slide-down {
            animation: slideDown 0.5s ease-out;
          }
          .glass-card {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(100, 116, 139, 0.3);
          }
        `}
      </style>

      <Card className="h-full border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 glass-card relative overflow-hidden w-full">
        {/* Gradient Background Effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
        </div>

        <CardHeader className="relative z-10 border-b" style={{ borderColor: colors.lightBlue + '20' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-2xl shadow-lg flex items-center justify-center"
                style={{ background: colors.gradients.blue }}
              >
                <Upload className="h-7 w-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  Upload Book
                </CardTitle>
                <CardDescription className="text-base lg:text-lg flex items-center gap-2" style={{ color: colors.text.secondary }}>
                  {userRole === "superadmin" ? (
                    <>
                      <Shield className="h-4 w-4 text-green-400" />
                      <span>Books will be automatically approved and published</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                      <span>Books will be sent for super admin approval before publishing</span>
                    </>
                  )}
                </CardDescription>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={resetForm}
              className="text-white hover:bg-white/10 border border-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>

        {/* Progress Steps */}
        <div className="relative z-10 px-6 pt-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2" style={{ backgroundColor: colors.darkBlue }}></div>
            {sections.map((section, index) => (
              <div key={section.id} className="relative z-10">
                <button
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex flex-col items-center transition-all duration-300 ${activeSection >= section.id ? 'scale-110' : 'opacity-60'
                    }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${activeSection >= section.id ? 'shadow-lg' : ''
                      }`}
                    style={{
                      backgroundColor: activeSection >= section.id ? section.color : colors.darkBlue,
                      border: `2px solid ${activeSection >= section.id ? section.color : colors.lightBlue}`
                    }}
                  >
                    <section.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">{section.title}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <CardContent className="relative z-10 h-[calc(100%-180px)] overflow-y-auto py-8 px-6">
          <form onSubmit={handleSubmit} className="space-y-8 w-full">

            {/* Section 1: Basic Book Information */}
            {activeSection === 1 && (
              <div className="space-y-6 animate-slide-down">
                <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: colors.lightBlue + '20' }}>
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: colors.accentLight + '20' }}
                  >
                    <BookOpen className="h-5 w-5" style={{ color: colors.accentLight }} />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Basic Book Information</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="title" className="text-base font-semibold flex items-center gap-2 text-white">
                          <Type className="h-4 w-4" style={{ color: colors.accentLight }} />
                          Book Title *
                        </Label>
                        {validationErrors.title && (
                          <span className="text-sm" style={{ color: colors.danger }}>
                            {validationErrors.title}
                          </span>
                        )}
                      </div>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        required
                        className="h-12 text-lg transition-all duration-300 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                        placeholder="Enter book title"
                        style={{ color: colors.text.primary }}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="author" className="text-base font-semibold flex items-center gap-2 text-white">
                          <User className="h-4 w-4" style={{ color: colors.accentLight }} />
                          Author *
                        </Label>
                        {validationErrors.author && (
                          <span className="text-sm" style={{ color: colors.danger }}>
                            {validationErrors.author}
                          </span>
                        )}
                      </div>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => handleInputChange('author', e.target.value)}
                        required
                        className="h-12 text-lg transition-all duration-300 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                        placeholder="Enter author name"
                        style={{ color: colors.text.primary }}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="category" className="text-base font-semibold flex items-center gap-2 text-white">
                          <Layers className="h-4 w-4" style={{ color: colors.accentLight }} />
                          Category *
                        </Label>
                        {validationErrors.category && (
                          <span className="text-sm" style={{ color: colors.danger }}>
                            {validationErrors.category}
                          </span>
                        )}
                      </div>
                      <Select
                        value={formData.category}
                        onValueChange={(v) => handleInputChange('category', v)}
                      >
                        <SelectTrigger className="h-12 text-lg transition-all duration-300 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/20">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border border-slate-700">
                          {CATEGORIES.map(cat => (
                            <SelectItem
                              key={cat}
                              value={cat}
                              className="text-lg py-3 text-white hover:bg-slate-700"
                            >
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="description" className="text-base font-semibold flex items-center gap-2 text-white">
                          <FileEdit className="h-4 w-4" style={{ color: colors.accentLight }} />
                          Description *
                        </Label>
                        {validationErrors.description && (
                          <span className="text-sm" style={{ color: colors.danger }}>
                            {validationErrors.description}
                          </span>
                        )}
                      </div>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={5}
                        required
                        className="resize-none transition-all duration-300 text-lg rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                        placeholder="Provide a detailed description of the book..."
                        style={{ color: colors.text.primary }}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="subcategory" className="text-base font-semibold flex items-center gap-2 text-white">
                        <Tag className="h-4 w-4" style={{ color: colors.accentLight }} />
                        Subcategory
                      </Label>
                      <Input
                        id="subcategory"
                        value={formData.subcategory}
                        onChange={(e) => handleInputChange('subcategory', e.target.value)}
                        className="h-12 text-lg transition-all duration-300 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                        placeholder="Enter subcategory"
                        style={{ color: colors.text.primary }}
                      />
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-end pt-6">
                  <Button
                    type="button"
                    onClick={() => setActiveSection(2)}
                    style={{ background: colors.gradients.blue }}
                    className="text-white hover:opacity-90 transition-all duration-300 px-8 py-3 text-lg font-semibold rounded-xl"
                  >
                    Next: Publishing Details
                  </Button>
                </div>
              </div>
            )}

            {/* Section 2: Publishing Details */}
            {activeSection === 2 && (
              <div className="space-y-6 animate-slide-down">
                <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: colors.lightBlue + '20' }}>
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: colors.success + '20' }}
                  >
                    <Building className="h-5 w-5" style={{ color: colors.success }} />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Publishing Details</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <Label htmlFor="publisher" className="text-base font-semibold flex items-center gap-2 text-white">
                        <Building className="h-4 w-4" style={{ color: colors.success }} />
                        Publisher *
                      </Label>
                      <Input
                        id="publisher"
                        value={formData.publisher}
                        onChange={(e) => handleInputChange('publisher', e.target.value)}
                        required
                        className="h-12 text-lg transition-all duration-300 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                        placeholder="Publisher name"
                        style={{ color: colors.text.primary }}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="publicationYear" className="text-base font-semibold flex items-center gap-2 text-white">
                        <Calendar className="h-4 w-4" style={{ color: colors.success }} />
                        Publication Year *
                      </Label>
                      <Input
                        id="publicationYear"
                        type="number"
                        value={formData.publicationYear}
                        onChange={(e) => handleInputChange('publicationYear', e.target.value)}
                        required
                        className="h-12 text-lg transition-all duration-300 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                        placeholder="2024"
                        min="1000"
                        max={new Date().getFullYear()}
                        style={{ color: colors.text.primary }}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="totalPages" className="text-base font-semibold flex items-center gap-2 text-white">
                        <File className="h-4 w-4" style={{ color: colors.success }} />
                        Total Pages *
                      </Label>
                      <Input
                        id="totalPages"
                        type="number"
                        value={formData.totalPages}
                        onChange={(e) => handleInputChange('totalPages', e.target.value)}
                        required
                        className="h-12 text-lg transition-all duration-300 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                        placeholder="Number of pages"
                        min="1"
                        style={{ color: colors.text.primary }}
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="edition" className="text-base font-semibold text-white">
                          Edition
                        </Label>
                        <Input
                          id="edition"
                          value={formData.edition}
                          onChange={(e) => handleInputChange('edition', e.target.value)}
                          className="h-12 text-lg transition-all duration-300 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                          placeholder="First Edition"
                          style={{ color: colors.text.primary }}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="language" className="text-base font-semibold flex items-center gap-2 text-white">
                          <Globe className="h-4 w-4" style={{ color: colors.success }} />
                          Language *
                        </Label>
                        <Select value={formData.language} onValueChange={(v) => handleInputChange('language', v)}>
                          <SelectTrigger className="h-12 text-lg transition-all duration-300 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/20">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border border-slate-700">
                            {LANGUAGES.map(lang => (
                              <SelectItem
                                key={lang}
                                value={lang}
                                className="text-lg py-3 text-white hover:bg-slate-700"
                              >
                                {lang}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="isbn" className="text-base font-semibold text-white">
                        ISBN
                      </Label>
                      <Input
                        id="isbn"
                        value={formData.isbn}
                        onChange={(e) => handleInputChange('isbn', e.target.value)}
                        className="h-12 text-lg transition-all duration-300 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                        placeholder="ISBN number"
                        style={{ color: colors.text.primary }}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="tags" className="text-base font-semibold flex items-center gap-2 text-white">
                        <Hash className="h-4 w-4" style={{ color: colors.success }} />
                        Tags
                      </Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => handleInputChange('tags', e.target.value)}
                        className="h-12 text-lg transition-all duration-300 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                        placeholder="fiction, science, law, etc."
                        style={{ color: colors.text.primary }}
                      />
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveSection(1)}
                    className="border-slate-700 text-white hover:bg-slate-800 transition-all duration-300 px-8 py-3 text-lg font-semibold rounded-xl"
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveSection(3)}
                    style={{ background: colors.gradients.blue }}
                    className="text-white hover:opacity-90 transition-all duration-300 px-8 py-3 text-lg font-semibold rounded-xl"
                  >
                    Next: Pricing Information
                  </Button>
                </div>
              </div>
            )}

            {/* Section 3: Pricing Information */}
            {activeSection === 3 && (
              <div className="space-y-6 animate-slide-down">
                <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: colors.lightBlue + '20' }}>
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: colors.warning + '20' }}
                  >
                    <DollarSign className="h-5 w-5" style={{ color: colors.warning }} />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Pricing Information</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="price" className="text-base font-semibold flex items-center gap-2 text-white">
                        <DollarSign className="h-4 w-4" style={{ color: colors.warning }} />
                        Price *
                      </Label>
                      {validationErrors.price && (
                        <span className="text-sm" style={{ color: colors.danger }}>
                          {validationErrors.price}
                        </span>
                      )}
                    </div>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      required
                      className="h-12 text-lg transition-all duration-300 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      style={{ color: colors.text.primary }}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="currency" className="text-base font-semibold text-white">
                      Currency
                    </Label>
                    <Select value={formData.currency} onValueChange={(v) => handleInputChange('currency', v)}>
                      <SelectTrigger className="h-12 text-lg transition-all duration-300 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/20">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border border-slate-700">
                        {CURRENCIES.map(currency => (
                          <SelectItem
                            key={currency}
                            value={currency}
                            className="text-lg py-3 text-white hover:bg-slate-700"
                          >
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="discountPercentage" className="text-base font-semibold flex items-center gap-2 text-white">
                      <Percent className="h-4 w-4" style={{ color: colors.warning }} />
                      Discount %
                    </Label>
                    <Input
                      id="discountPercentage"
                      type="number"
                      value={formData.discountPercentage}
                      onChange={(e) => handleInputChange('discountPercentage', e.target.value)}
                      className="h-12 text-lg transition-all duration-300 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="0"
                      min="0"
                      max="100"
                      style={{ color: colors.text.primary }}
                    />
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveSection(2)}
                    className="border-slate-700 text-white hover:bg-slate-800 transition-all duration-300 px-8 py-3 text-lg font-semibold rounded-xl"
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveSection(4)}
                    style={{ background: colors.gradients.blue }}
                    className="text-white hover:opacity-90 transition-all duration-300 px-8 py-3 text-lg font-semibold rounded-xl"
                  >
                    Next: Media & Files
                  </Button>
                </div>
              </div>
            )}

            {/* Section 4: Media & Files */}
            {activeSection === 4 && (
              <div className="space-y-6 animate-slide-down">
                <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: colors.lightBlue + '20' }}>
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: colors.info + '20' }}
                  >
                    <Image className="h-5 w-5" style={{ color: colors.info }} />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Media & Files</h3>
                </div>

                {/* Cover Images Upload */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold flex items-center gap-2 text-white">
                      <Image className="h-4 w-4" style={{ color: colors.info }} />
                      Book Cover Images *
                      <span className="text-sm font-normal" style={{ color: colors.text.secondary }}>
                        (Up to 5 images)
                      </span>
                    </Label>
                    {validationErrors.coverImages && (
                      <span className="text-sm" style={{ color: colors.danger }}>
                        {validationErrors.coverImages}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Cover Image Upload Box */}
                    {coverImages.length < 5 && (
                      <div
                        className="border-2 border-dashed rounded-xl p-4 transition-all duration-300 bg-slate-800/30 cursor-pointer group hover:border-blue-500/50 border-slate-700"
                      >
                        <Input
                          ref={coverImageRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCoverImagesChange(e.target.files)}
                          className="hidden"
                          id="cover-images"
                          multiple
                        />
                        <label htmlFor="cover-images" className="cursor-pointer block h-full">
                          <div className="flex flex-col items-center justify-center h-32 text-center space-y-2">
                            <div
                              className="p-2 rounded-lg transition-transform group-hover:scale-110"
                              style={{ backgroundColor: colors.info + '20' }}
                            >
                              <Upload className="h-6 w-6" style={{ color: colors.info }} />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-white">Add Cover</p>
                              <p className="text-xs" style={{ color: colors.text.muted }}>
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
                          className="aspect-[3/4] rounded-lg overflow-hidden border-2 cursor-pointer transition-transform group-hover:scale-105"
                          style={{
                            borderColor: colors.success + '30',
                            backgroundColor: colors.success + '10'
                          }}
                          onClick={() => setPreviewDialog({
                            open: true,
                            type: 'image',
                            url: image.previewUrl,
                            name: image.file.name
                          })}
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
                          className="absolute -top-2 -right-2 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                          style={{ backgroundColor: colors.danger }}
                        >
                          <Trash2 className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PDF File Upload */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold flex items-center gap-2 text-white">
                      <FileText className="h-4 w-4" style={{ color: colors.info }} />
                      PDF File *
                      <span className="text-sm font-normal" style={{ color: colors.text.secondary }}>
                        (PDF file up to 50MB)
                      </span>
                    </Label>
                    {validationErrors.pdfFile && (
                      <span className="text-sm" style={{ color: colors.danger }}>
                        {validationErrors.pdfFile}
                      </span>
                    )}
                  </div>

                  {!pdfFile ? (
                    <div
                      className="border-2 border-dashed rounded-xl p-6 transition-all duration-300 bg-slate-800/30 cursor-pointer hover:border-blue-500/50 border-slate-700"
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
                            style={{ backgroundColor: colors.info + '20' }}
                          >
                            <FileText className="h-6 w-6" style={{ color: colors.info }} />
                          </div>
                          <div>
                            <p className="font-semibold text-white">Upload PDF File</p>
                            <p className="mt-1 text-sm" style={{ color: colors.text.secondary }}>
                              Click to upload PDF version of the book
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div
                      className="border-2 rounded-xl p-4 transition-all duration-300"
                      style={{
                        borderColor: colors.success + '30',
                        backgroundColor: colors.success + '10'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: colors.success + '20' }}
                          >
                            <CheckCircle className="h-5 w-5" style={{ color: colors.success }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-white" />
                              <p className="font-semibold text-white truncate">
                                {pdfFile.name}
                              </p>
                            </div>
                            <p className="text-sm" style={{ color: colors.text.secondary }}>
                              {formatFileSize(pdfFile.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = URL.createObjectURL(pdfFile);
                              setPreviewDialog({ open: true, type: 'pdf', url, name: pdfFile.name });
                            }}
                            className="flex items-center gap-1 border-slate-700 text-white hover:bg-slate-800"
                          >
                            <Eye className="h-3 w-3" />
                            Preview
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePdfFileChange(null)}
                            style={{ color: colors.danger }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveSection(3)}
                    className="border-slate-700 text-white hover:bg-slate-800 transition-all duration-300 px-8 py-3 text-lg font-semibold rounded-xl"
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveSection(5)}
                    style={{ background: colors.gradients.blue }}
                    className="text-white hover:opacity-90 transition-all duration-300 px-8 py-3 text-lg font-semibold rounded-xl"
                  >
                    Next: Additional Info
                  </Button>
                </div>
              </div>
            )}

            {/* Section 5: Additional Information */}
            {activeSection === 5 && (
              <div className="space-y-6 animate-slide-down">
                <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: colors.lightBlue + '20' }}>
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: colors.accent + '20' }}
                  >
                    <FileEdit className="h-5 w-5" style={{ color: colors.accent }} />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Additional Information</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="authorBio" className="text-base font-semibold text-white">
                      Author Biography
                    </Label>
                    <Textarea
                      id="authorBio"
                      value={formData.authorBio}
                      onChange={(e) => handleInputChange('authorBio', e.target.value)}
                      rows={4}
                      className="resize-none transition-all duration-300 text-lg rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="Tell readers about the author's background, achievements, and other published works..."
                      style={{ color: colors.text.primary }}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="metaDescription" className="text-base font-semibold text-white">
                      Meta Description
                    </Label>
                    <Textarea
                      id="metaDescription"
                      value={formData.metaDescription}
                      onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                      rows={2}
                      className="resize-none transition-all duration-300 text-lg rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="Brief description for SEO (max 160 characters)"
                      maxLength={160}
                      style={{ color: colors.text.primary }}
                    />
                    <div className="text-sm text-right" style={{ color: colors.text.muted }}>
                      {formData.metaDescription.length}/160
                    </div>
                  </div>
                </div>

                {/* Book Content Editor */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold flex items-center gap-2 text-white">
                      <FileEdit className="h-4 w-4" style={{ color: colors.accent }} />
                      Book Text Content
                    </Label>

                    <Select value={formData.textFormat} onValueChange={(v: "plain" | "html" | "markdown") => handleInputChange('textFormat', v)}>
                      <SelectTrigger className="w-32 h-9 bg-slate-800/50 border border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border border-slate-700">
                        {TEXT_FORMATS.map(format => (
                          <SelectItem
                            key={format}
                            value={format}
                            className="text-white hover:bg-slate-700"
                          >
                            {format.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-2 rounded-xl bg-slate-800/50 border-slate-700 overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-1 p-3 border-b bg-slate-800/80 border-slate-700">
                      <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand('undo')} className="h-8 w-8 p-0 text-white hover:bg-slate-700">
                        <Undo className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand('redo')} className="h-8 w-8 p-0 text-white hover:bg-slate-700">
                        <Redo className="h-4 w-4" />
                      </Button>

                      <div className="w-px h-6" style={{ backgroundColor: colors.lightBlue + '30' }}></div>

                      <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand('bold')} className="h-8 w-8 p-0 text-white hover:bg-slate-700">
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand('italic')} className="h-8 w-8 p-0 text-white hover:bg-slate-700">
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand('underline')} className="h-8 w-8 p-0 text-white hover:bg-slate-700">
                        <Underline className="h-4 w-4" />
                      </Button>

                      <div className="w-px h-6" style={{ backgroundColor: colors.lightBlue + '30' }}></div>

                      <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand('justifyLeft')} className="h-8 w-8 p-0 text-white hover:bg-slate-700">
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand('justifyCenter')} className="h-8 w-8 p-0 text-white hover:bg-slate-700">
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand('justifyRight')} className="h-8 w-8 p-0 text-white hover:bg-slate-700">
                        <AlignRight className="h-4 w-4" />
                      </Button>

                      <div className="w-px h-6" style={{ backgroundColor: colors.lightBlue + '30' }}></div>

                      <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand('insertUnorderedList')} className="h-8 w-8 p-0 text-white hover:bg-slate-700">
                        <List className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand('insertOrderedList')} className="h-8 w-8 p-0 text-white hover:bg-slate-700">
                        <ListOrdered className="h-4 w-4" />
                      </Button>
                    </div>

                    <div
                      ref={textEditorRef}
                      contentEditable
                      onInput={handleEditorChange}
                      className="h-96 w-full overflow-auto p-6 focus:outline-none text-white"
                      style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontSize: '15px',
                        lineHeight: '1.6',
                        color: colors.text.primary
                      }}
                      placeholder="Start typing your book content here..."
                    />
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveSection(4)}
                    className="border-slate-700 text-white hover:bg-slate-800 transition-all duration-300 px-8 py-3 text-lg font-semibold rounded-xl"
                  >
                    Previous
                  </Button>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      onClick={() => setActiveSection(1)}
                      variant="outline"
                      className="border-slate-700 text-white hover:bg-slate-800 transition-all duration-300 px-8 py-3 text-lg font-semibold rounded-xl"
                    >
                      Save Draft
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      style={{ background: colors.gradients.blue }}
                      className="text-white hover:opacity-90 transition-all duration-300 px-8 py-3 text-lg font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5" />
                          Publish Book
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* File Preview Dialog */}
      <Dialog open={previewDialog.open} onOpenChange={(open) => setPreviewDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-slate-800 border border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Eye className="h-5 w-5" style={{ color: colors.info }} />
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
                  className="w-full h-full rounded-lg border border-slate-700"
                  title="PDF Preview"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => window.open(previewDialog.url, '_blank')}
              className="flex items-center gap-2 border-slate-700 text-white hover:bg-slate-700"
            >
              <Download className="h-4 w-4" />
              Open in New Tab
            </Button>
            <Button
              onClick={() => setPreviewDialog(prev => ({ ...prev, open: false }))}
              style={{ background: colors.gradients.blue }}
              className="text-white hover:opacity-90"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadForm;