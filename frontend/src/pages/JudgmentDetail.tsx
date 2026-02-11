// pages/JudgmentDetail.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, BookOpen, FileText, Eye } from "lucide-react";
import { toast } from "sonner";
import { JudgmentService, Judgment } from "@/services/JudgmentService";
import { useAuth } from "@/contexts/AuthContext";

// Reuse book components for consistent UI
import BookGallery from "@/components/book/BookGallery";
import BookActions from "@/components/book/BookActions";
import BookStats from "@/components/book/BookStats";
import LightboxModal from "@/components/book/LightboxModal";

const JudgmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [judgment, setJudgment] = useState<Judgment | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [reading, setReading] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseCheckLoading, setPurchaseCheckLoading] = useState(false);

  // gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    if (id) fetchJudgment(id);
  }, [id]);

  const fetchJudgment = async (judgmentId: string) => {
    try {
      setLoading(true);
      const res = await JudgmentService.getJudgmentById(judgmentId);
      if (res.success && res.data) {
        setJudgment(res.data.judgment);
        // optional: increment view on backend if available
      } else {
        toast.error(res.message || 'Failed to load judgment');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load judgment');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (paymentMethod: 'safepay' | 'bank' | 'jazzcash' | 'easypaisa' = 'bank') => {
    if (!isAuthenticated) return navigate('/auth');
    if (!judgment) return;
    try {
      setPurchasing(true);
      const res = await JudgmentService.purchaseJudgment(judgment._id, paymentMethod);
      if (res.success) {
        toast.success('Purchase successful');
        setHasPurchased(true);
      } else {
        toast.error(res.message || 'Purchase failed');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  const handleReadText = async () => {
    if (!judgment) return;
    try {
      setReading(true);
      const res = await JudgmentService.readJudgment(judgment._id);
      if (res.success && res.data) {
        // open textFile in new tab if available
        const fileUrl = res.data.textFile || res.data.judgment?.textFile;
        if (fileUrl) {
          const finalUrl = fileUrl.startsWith('/uploads/') ? `${import.meta.env.VITE_API_URL || ''}${fileUrl}` : fileUrl;
          window.open(finalUrl, '_blank');
        } else {
          toast.error('No text available for this judgment');
        }
      } else {
        toast.error(res.message || 'Unable to open judgment');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Unable to open judgment');
    } finally {
      setReading(false);
    }
  };

  const handleViewPDF = async () => {
    if (!judgment) return;
    try {
      const res = await JudgmentService.getJudgmentById(judgment._id);
      if (res.success && res.data) {
        const filePath = res.data.judgment.pdfFile;
        if (!filePath) return toast.error('No PDF available');
        const finalUrl = filePath.startsWith('/uploads/') ? `${import.meta.env.VITE_API_URL || ''}${filePath}` : filePath;
        window.open(finalUrl, '_blank');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to open PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading judgment...</span>
      </div>
    );
  }

  if (!judgment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Judgment not found</h2>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-primary text-white rounded-md">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 py-8">
      <div className="container mx-auto px-4">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">{judgment.citation}</h1>
          <div className="text-xl text-muted-foreground">{judgment.court} · {judgment.year}</div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Gallery & Actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-2 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-6">
                <div className="relative mb-6">
                  <BookGallery
                    images={(judgment as any).coverImages || []}
                    title={judgment.citation}
                    discountPercentage={0}
                    bestseller={false}
                    newRelease={false}
                    featured={false}
                    selectedImageIndex={selectedImageIndex}
                    onImageSelect={setSelectedImageIndex}
                    onLightboxOpen={() => setShowLightbox(true)}
                  />
                </div>

                <BookActions
                  book={{ _id: judgment._id, title: judgment.citation, price: judgment.price, currency: judgment.currency || 'PKR' }}
                  hasPurchased={hasPurchased}
                  purchasing={purchasing}
                  purchaseCheckLoading={purchaseCheckLoading}
                  reading={reading}
                  onPurchase={async (m) => handlePurchase(m)}
                  onReadTextBook={handleReadText}
                  onDownloadPDF={handleViewPDF}
                  onRateBook={() => toast('Rating not supported for judgments')}
                  isAuthenticated={isAuthenticated}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right - Details */}
          <div className="lg:col-span-2">
            <Card className="border-2 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{judgment.caseTitle || judgment.parties}</h2>
                    <p className="text-sm text-muted-foreground">Judge: {judgment.judge || 'N/A'} • Case#: {judgment.caseNumber || 'N/A'}</p>
                  </div>

                  <div className="bg-white p-6 rounded-lg border border-gray-100">
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <p className="text-sm text-muted-foreground">{judgment.summary || 'No summary available.'}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {(judgment.keywords || []).slice(0, 8).map((k) => (
                        <span key={k} className="px-3 py-1 rounded-full bg-gray-100 text-sm text-muted-foreground">{k}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <BookStats
              viewCount={judgment.viewCount || 0}
              downloadCount={0}
              purchaseCount={judgment.purchaseCount || 0}
              createdAt={judgment.createdAt}
              discountedPrice={judgment.price || 0}
              currency={judgment.currency || 'PKR'}
              hasPurchased={hasPurchased}
            />
          </div>
        </div>
      </div>

      <LightboxModal
        isOpen={showLightbox}
        images={(judgment as any).coverImages || []}
        title={judgment.citation}
        selectedImageIndex={selectedImageIndex}
        onClose={() => setShowLightbox(false)}
        onNextImage={() => setSelectedImageIndex((prev) => prev + 1)}
        onPrevImage={() => setSelectedImageIndex((prev) => Math.max(0, prev - 1))}
        onSelectImage={setSelectedImageIndex}
      />
    </div>
  );
};

export default JudgmentDetail;
