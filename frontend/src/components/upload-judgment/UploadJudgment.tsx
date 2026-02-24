// UploadJudgment.tsx
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { JudgmentService } from "@/services/JudgmentService";
import UploadJudgmentForm from "./UploadJudgmentForm";

const UploadJudgment = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (formData: FormData) => {
  try {
    setIsLoading(true);
    
    // ... [existing code for DEBUG logging]

    const response = await JudgmentService.uploadJudgment(formData);
    
    
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
      </div>
    </div>
  );
};

export default UploadJudgment;