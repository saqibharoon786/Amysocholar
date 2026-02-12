// UploadJudgment.tsx
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { JudgmentService } from "@/services/JudgmentService";
import UploadJudgmentForm from "./UploadJudgmentForm";
import { Button } from "@/components/ui/button";

const UploadJudgment = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false); // Changed to false to show table first
  const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (formData: FormData) => {
  try {
    setIsLoading(true);
    
    // ... [existing code for DEBUG logging]

    const response = await JudgmentService.uploadJudgment(formData);
    
    console.log("DEBUG: API Response:", response);
    
    if (response.success) {
      // ... [existing success handling code]
    } else {
      // ... [existing error handling for non-success response]
    }
  } catch (error: any) {
    console.error('Full upload error details:', error);
    
    // Enhanced error logging - SAFE VERSION
    console.error("DEBUG: Error type:", error?.name);
    console.error("DEBUG: Error code:", error?.code);
    console.error("DEBUG: Error message:", error?.message);
    
    if (error?.config) {
      console.error("DEBUG: Request config:");
      console.error("  URL:", error.config.url);
      console.error("  Method:", error.config.method);
      console.error("  BaseURL:", error.config.baseURL);
      console.error("  Headers:", error.config.headers);
    }
    
    if (error?.response) {
      console.error("DEBUG: Response status:", error.response.status);
      console.error("DEBUG: Response data:", error.response.data);
      console.error(
        "DEBUG: Response headers:",
        error.response.headers?.toJSON ? error.response.headers.toJSON() : error.response.headers
      );
    } else if (error?.request) {
      console.error("DEBUG: No response received. Request:", error.request);
      console.error("DEBUG: This usually means:");
      console.error("  1. Network error (CORS, offline)");
      console.error("  2. Wrong URL");
      console.error("  3. Server not running");
    } else {
      console.error("DEBUG: Error setting up request:", error?.message);
    }
    
    // Handle specific error cases
    if (error?.response?.data?.message?.includes('citation already exists')) {
      // ... [existing duplicate citation handling]
    } else if (error?.response?.status === 404) {
      // ... [existing 404 handling]
    } else if (error?.response?.data?.message) {
      // ... [existing error message handling]
    } else if (error?.message) {
      // ... [existing error message handling]
    } else {
      // ... [existing generic error handling]
    }
  } finally {
    setIsLoading(false);
  }
};

  // If form is open, show the form
  if (isFormOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-blue-900/80 to-purple-900/60 dark:from-navy-950 dark:via-blue-950/80 dark:to-purple-950/60 p-4 sm:p-6 animate-in fade-in duration-500 w-full">
        <div className="w-full space-y-6 sm:space-y-8">
          {/* Upload Form */}
          <div className="w-full">
            <UploadJudgmentForm
              isLoading={isLoading}
              onSubmit={handleSubmit}
              onCancel={() => setIsFormOpen(false)}
              userRole={user?.role}
            />
          </div>
        </div>
      </div>
    );
  }

  // If form is not open, show the table view
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-blue-900/70 to-purple-900/50 dark:from-navy-950 dark:via-blue-950/70 dark:to-purple-950/50 p-4 sm:p-6 animate-in fade-in duration-500 w-full">
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Table View with Upload Button */}
        <div className="w-full">
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center bg-navy-800/80 dark:bg-navy-900/90 rounded-2xl shadow-2xl border border-blue-700/30 dark:border-blue-800/40 p-6 sm:p-8 mx-auto backdrop-blur-sm">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-800/40 to-purple-800/40 dark:from-blue-900/50 dark:to-purple-900/50 rounded-2xl mb-4 sm:mb-6 shadow-inner border border-blue-600/20">
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 text-blue-300 dark:text-blue-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">
              Manage Judgments
            </h3>
            <p className="text-blue-100/80 dark:text-blue-200/80 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 max-w-md leading-relaxed">
              View all uploaded judgments or add new judgments to the system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => setIsFormOpen(true)}
                className="h-11 sm:h-12 px-6 sm:px-8 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-700 hover:via-blue-600 hover:to-purple-700 border-0 text-white rounded-xl hover:scale-105"
                size="lg"
              >
                Upload New Judgment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadJudgment;