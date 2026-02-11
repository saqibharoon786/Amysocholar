// components/upload-book/UploadBook.tsx
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { BookService } from "@/services/bookService";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import UploadForm from "./UploadForm";
import {
  Upload,
  CheckCircle2,
  ArrowLeft,
  BookOpen
} from "lucide-react";

const UploadBook = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsLoading(true);

      const response = await BookService.uploadBook(formData);

      if (response.success) {
        const approvalMessage = user?.role === "superadmin"
          ? "Book uploaded and automatically approved!"
          : "Book uploaded successfully! Waiting for super admin approval.";

        toast({
          title: "🎉 Success",
          description: approvalMessage,
          variant: "default"
        });

        setIsFormOpen(false);

        if (user?.role === "superadmin") {
          setTimeout(() => {
            navigate("/superadmin/shop");
          }, 2000);
        }
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload book",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user?.role === "superadmin") {
      navigate("/superadmin/dashboard");
    } else {
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen p-6 w-full">
      {/* Main container with SuperAdmin layout colors */}
      <div
        className="w-full mx-auto space-y-6 animate-in fade-in duration-500"
        style={{
          maxWidth: '1400px',
          backgroundColor: '#0f1729',
          borderRadius: '12px'
        }}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleCancel}
              variant="ghost"
              size="sm"
              className="gap-2 hover:bg-slate-800/50"
              style={{
                color: '#cbd5e1',
                border: '1px solid rgba(100, 116, 139, 0.2)'
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>
                Upload New Book
              </h1>
              <p className="text-sm" style={{ color: '#94a3b8' }}>
                Add new legal books to the LawBooks Pro platform
              </p>
            </div>
          </div>

          {user?.role === "superadmin" && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(100, 116, 139, 0.2)'
              }}
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium" style={{ color: '#cbd5e1' }}>
                Super Admin Mode
              </span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid rgba(100, 116, 139, 0.2)'
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: '#2d3748',
                  border: '1px solid rgba(100, 116, 139, 0.2)'
                }}
              >
                <BookOpen className="h-5 w-5" style={{ color: '#94a3b8' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#94a3b8' }}>Total Books</p>
                <p className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>1,247</p>
              </div>
            </div>
          </div>

          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid rgba(100, 116, 139, 0.2)'
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: '#2d3748',
                  border: '1px solid rgba(100, 116, 139, 0.2)'
                }}
              >
                <Upload className="h-5 w-5" style={{ color: '#94a3b8' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#94a3b8' }}>Uploaded Today</p>
                <p className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>12</p>
              </div>
            </div>
          </div>

          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid rgba(100, 116, 139, 0.2)'
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: '#2d3748',
                  border: '1px solid rgba(100, 116, 139, 0.2)'
                }}
              >
                <CheckCircle2 className="h-5 w-5" style={{ color: '#94a3b8' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#94a3b8' }}>Approval Rate</p>
                <p className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>98.5%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Form Area */}
        <div
          className="rounded-xl p-6 transition-all duration-300"
          style={{
            backgroundColor: '#1a2234',
            border: '1px solid rgba(100, 116, 139, 0.15)',
            minHeight: '500px'
          }}
        >
          {isFormOpen ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: '#f1f5f9' }}>
                    Book Details
                  </h2>
                  <p className="text-sm" style={{ color: '#94a3b8' }}>
                    Fill in all required information about the book
                  </p>
                </div>
                <div
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: '#2d3748',
                    color: '#94a3b8',
                    border: '1px solid rgba(100, 116, 139, 0.2)'
                  }}
                >
                  All fields marked with * are required
                </div>
              </div>

              {/* Upload Form Component */}
              <UploadForm
                isOpen={isFormOpen}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                onCancel={() => setIsFormOpen(false)}
                userRole={user?.role}
              />
            </div>
          ) : (
            /* Success State */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="p-6 rounded-2xl mb-6"
                style={{
                  backgroundColor: '#2d3748',
                  border: '1px solid rgba(100, 116, 139, 0.2)'
                }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{
                    backgroundColor: '#334155',
                    border: '1px solid rgba(100, 116, 139, 0.3)'
                  }}
                >
                  <CheckCircle2 className="h-8 w-8" style={{ color: '#94a3b8' }} />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#f1f5f9' }}>
                  Book Uploaded Successfully!
                </h3>
                <p className="text-lg mb-6 max-w-md" style={{ color: '#94a3b8' }}>
                  {user?.role === "superadmin"
                    ? "Your book has been uploaded and is now available in the shop."
                    : "Your book has been submitted and is waiting for super admin approval."}
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setIsFormOpen(true)}
                  className="h-12 px-8 text-base font-semibold"
                  style={{
                    backgroundColor: '#2d3748',
                    color: '#f1f5f9',
                    border: '1px solid rgba(100, 116, 139, 0.3)'
                  }}
                >
                  Upload Another Book
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="h-12 px-8 text-base font-semibold"
                  style={{
                    color: '#cbd5e1',
                    borderColor: 'rgba(100, 116, 139, 0.3)'
                  }}
                >
                  Return to Dashboard
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t w-full max-w-md" style={{ borderColor: 'rgba(100, 116, 139, 0.15)' }}>
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  Next Steps: {user?.role === "superadmin"
                    ? "Your book will appear in the shop immediately."
                    : "You'll receive a notification once the book is approved."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        {isFormOpen && (
          <div
            className="rounded-xl p-6"
            style={{
              backgroundColor: '#1a2234',
              border: '1px solid rgba(100, 116, 139, 0.15)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#f1f5f9' }}>
              📚 Upload Guidelines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  <span className="font-medium" style={{ color: '#cbd5e1' }}>File Format:</span> PDF, DOCX, EPUB (Max 100MB)
                </p>
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  <span className="font-medium" style={{ color: '#cbd5e1' }}>Cover Image:</span> JPG, PNG (16:9 aspect ratio)
                </p>
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  <span className="font-medium" style={{ color: '#cbd5e1' }}>Metadata:</span> Fill all required fields accurately
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  <span className="font-medium" style={{ color: '#cbd5e1' }}>Categories:</span> Select appropriate legal categories
                </p>
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  <span className="font-medium" style={{ color: '#cbd5e1' }}>Pricing:</span> Set competitive pricing
                </p>
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  <span className="font-medium" style={{ color: '#cbd5e1' }}>Description:</span> Provide detailed description
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadBook;