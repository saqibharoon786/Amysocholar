// components/ProfileSettings.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Upload, 
  Camera, 
  CreditCard, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Wallet, 
  DollarSign,
  Shield,
  CheckCircle,
  AlertCircle,
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countriesWithCodes, parsePhone, buildPhone } from "@/data/countriesWithCodes";

// Bank / payment method options for dropdown (EasyPaisa, JazzCash, banks, Custom)
const PAYMENT_BANK_OPTIONS = [
  { value: "EasyPaisa", label: "EasyPaisa" },
  { value: "JazzCash", label: "JazzCash" },
  { value: "Alfalah", label: "Bank Alfalah" },
  { value: "Meezan", label: "Meezan Bank" },
  { value: "HBL", label: "HBL" },
  { value: "UBL", label: "UBL" },
  { value: "MCB", label: "MCB" },
  { value: "ABL", label: "Allied Bank" },
  { value: "Askari", label: "Askari Bank" },
  { value: "Faysal", label: "Faysal Bank" },
  { value: "Soneri", label: "Soneri Bank" },
  { value: "Custom", label: "Other / Custom (add name below)" },
] as const;

// Define the user profile type
interface UserProfile {
  id: string;
  email: string;
  role: string;
  profileImage?: string;
  fullName?: string;
  phone?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  accountTitle?: string;
  bankName?: string;
  accountNumber?: string;
  easyPaisaNumber?: string;
  jazzCashNumber?: string;
  idCardFront?: string;
  idCardBack?: string;
  isVerified?: boolean;
}

const ProfileSettings = () => {
  const { toast } = useToast();
  const { user, userQuery } = useAuth();
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  
  // Initialize form state with user data
  const [formData, setFormData] = useState<UserProfile>({
    id: '',
    email: '',
    role: 'user',
    profileImage: '',
    fullName: '',
    phone: '',
    phoneCountryCode: '+92',
    phoneNumber: '',
    address: '',
    city: '',
    country: '',
    accountTitle: '',
    bankName: '',
    accountNumber: '',
    easyPaisaNumber: '',
    jazzCashNumber: '',
    idCardFront: '',
    idCardBack: '',
    isVerified: false
  });

  const [showAccountNumber, setShowAccountNumber] = useState(false);
  // Bank dropdown: selected option (or "Custom"); when Custom, customBankName is the typed name
  const [bankSelect, setBankSelect] = useState<string>("");
  const [customBankName, setCustomBankName] = useState("");

  // Fetch full profile (includes wallet) and sync to form
  useEffect(() => {
    const syncProfile = async () => {
      if (!user?.id) return;
      try {
        const res = await userService.getProfile();
        const u = res.data?.user as any;
        if (!u) return;
        const wallet = u.wallet?.paymentInfo;
        const bank = wallet?.bankAccount;
        setFormData(prev => ({
          ...prev,
          id: u._id || user.id || '',
          email: u.email || user.email || '',
          role: u.role || user.role || 'user',
          profileImage: u.profileImage?.url || user.profileImage || '',
          fullName: u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : user.fullName || '',
          phone: u.phone || user.phone || '',
          ...((): { phoneCountryCode: string; phoneNumber: string } => {
            const { dialCode, number } = parsePhone(u.phone || user.phone);
            return { phoneCountryCode: dialCode, phoneNumber: number };
          })(),
          address: u.address?.street || user.address || '',
          city: u.address?.city || user.city || '',
          country: u.address?.country || user.country || '',
          accountTitle: bank?.accountTitle || (u as any).accountTitle || '',
          bankName: bank?.bankName || u.bankName || '',
          accountNumber: bank?.accountNumber || u.accountNumber || '',
          easyPaisaNumber: wallet?.easypaisaNumber || u.easyPaisaNumber || '',
          jazzCashNumber: wallet?.jazzcashNumber || u.jazzCashNumber || '',
          idCardFront: u.idCardFront || user.idCardFront || '',
          idCardBack: u.idCardBack || user.idCardBack || '',
          isVerified: u.isVerified ?? user.isVerified ?? false
        }));
        const bn = (bank?.bankName || u.bankName || '').trim();
        const option = PAYMENT_BANK_OPTIONS.find((o) => o.value === bn);
        setBankSelect(option ? option.value : (bn ? 'Custom' : ''));
        setCustomBankName(option ? '' : bn);
      } catch {
        if (user) {
          const fallbackBank = (user as any).bankName || '';
          setFormData(prev => ({
            ...prev,
            id: user.id || '',
            email: user.email || '',
            role: user.role || 'user',
            profileImage: user.profileImage || '',
            fullName: user.fullName || '',
            phone: user.phone || '',
            phoneCountryCode: parsePhone(user.phone).dialCode,
            phoneNumber: parsePhone(user.phone).number,
            address: user.address || '',
            city: user.city || '',
            country: user.country || '',
            accountTitle: (user as any).accountTitle || '',
            bankName: fallbackBank,
            accountNumber: (user as any).accountNumber || '',
            easyPaisaNumber: (user as any).easyPaisaNumber || '',
            jazzCashNumber: (user as any).jazzCashNumber || '',
            idCardFront: user.idCardFront || '',
            idCardBack: user.idCardBack || '',
            isVerified: user.isVerified ?? false
          }));
          const bn = (fallbackBank || '').trim();
          const opt = PAYMENT_BANK_OPTIONS.find((o) => o.value === bn);
          setBankSelect(opt ? opt.value : (bn ? 'Custom' : ''));
          setCustomBankName(opt ? '' : bn);
        }
      }
    };
    syncProfile();
  }, [user?.id]);

  // Handle file uploads
  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Profile image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setFormData(prev => ({ ...prev, profileImage: imageUrl }));
        toast({ 
          title: "Success", 
          description: "Profile image uploaded!",
          variant: "default",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdCardFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setFormData(prev => ({ ...prev, idCardFront: imageUrl }));
        toast({ 
          title: "Success", 
          description: "ID card front uploaded!",
          variant: "default",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdCardBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setFormData(prev => ({ ...prev, idCardBack: imageUrl }));
        toast({ 
          title: "Success", 
          description: "ID card back uploaded!",
          variant: "default",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save all changes (profile + payment details)
  const handleSave = async () => {
    setIsUpdatingUser(true);
    try {
      await userService.updateProfile({
        firstName: formData.fullName?.split(' ')[0] || '',
        lastName: formData.fullName?.split(' ').slice(1).join(' ') || '',
        phone: buildPhone(formData.phoneCountryCode || '+92', formData.phoneNumber || '') || formData.phone,
        address: formData.address ? { street: formData.address, city: formData.city, country: formData.country } : undefined,
      });
      const resolvedBank = bankSelect === 'Custom' ? (customBankName || '').trim() : (bankSelect || '');
      await userService.updatePaymentInfo({
        jazzcashNumber: '',
        easypaisaNumber: '',
        bankAccount: {
          accountTitle: formData.accountTitle || '',
          bankName: resolvedBank,
          accountNumber: formData.accountNumber || '',
        },
      });
      toast({
        title: "Saved",
        description: "Profile and payment details have been saved successfully.",
        variant: "default",
      });
      userQuery?.refetch?.();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Update failed",
        description: error?.response?.data?.message || "Could not save. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // Save only payment details (from Payment tab) – works for admin & superadmin
  const handleSavePaymentDetails = async () => {
    const resolvedBankName = bankSelect === 'Custom' ? (customBankName || '').trim() : (bankSelect || '');
    setIsUpdatingUser(true);
    try {
      await userService.updatePaymentInfo({
        jazzcashNumber: '',
        easypaisaNumber: '',
        bankAccount: {
          accountTitle: formData.accountTitle || '',
          bankName: resolvedBankName,
          accountNumber: formData.accountNumber || '',
        },
      });
      setFormData(prev => ({ ...prev, bankName: resolvedBankName }));
      toast({
        title: "Payment details saved",
        description: "Your payment details have been saved successfully.",
        variant: "default",
      });
      userQuery?.refetch?.();
    } catch (error: any) {
      toast({
        title: "Could not save",
        description: error?.response?.data?.message || "Please check the fields and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // If user data is still loading, show loading state
  if (!user) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0f1729' }}>
        <div className="px-4 sm:px-6 py-4" style={{ 
          backgroundColor: '#1a2234',
          borderBottom: '1px solid rgba(100, 116, 139, 0.15)'
        }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-xl"
                style={{ 
                  backgroundColor: '#2d3748',
                  border: '1px solid rgba(100, 116, 139, 0.2)'
                }}
              >
                <User className="h-6 w-6" style={{ color: '#94a3b8' }} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#f1f5f9' }}>
                  Profile Settings
                </h1>
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  Loading your profile...
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#94a3b8' }}></div>
              <p className="mt-4 text-sm" style={{ color: '#94a3b8' }}>Loading your profile information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0f1729' }}>
      {/* Header */}
      <div className="px-4 sm:px-6 py-4" style={{ 
        backgroundColor: '#1a2234',
        borderBottom: '1px solid rgba(100, 116, 139, 0.15)'
      }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-xl"
                style={{ 
                  backgroundColor: '#2d3748',
                  border: '1px solid rgba(100, 116, 139, 0.2)'
                }}
              >
                <User className="h-6 w-6" style={{ color: '#94a3b8' }} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#f1f5f9' }}>
                  Profile Settings
                </h1>
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  Manage your profile information and verification documents
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleSave} 
              disabled={isUpdatingUser}
              className="h-11 px-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              style={{
                backgroundColor: '#2d3748',
                color: '#f1f5f9',
                border: '1px solid rgba(100, 116, 139, 0.3)'
              }}
            >
              {isUpdatingUser ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2" style={{ borderColor: '#f1f5f9' }}></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save All Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-12 rounded-xl" style={{ 
              backgroundColor: '#1a2234',
              border: '1px solid rgba(100, 116, 139, 0.15)'
            }}>
              <TabsTrigger 
                value="profile" 
                className="text-sm font-medium rounded-lg data-[state=active]:shadow-sm transition-all"
                style={{ 
                  color: '#cbd5e1',
                  backgroundColor: 'transparent'
                }}
                data-state-active-style={{
                  backgroundColor: '#2d3748',
                  color: '#f1f5f9',
                  border: '1px solid rgba(100, 116, 139, 0.3)'
                }}
              >
                <User className="h-4 w-4 mr-2" />
                Profile Info
              </TabsTrigger>
              <TabsTrigger 
                value="verification" 
                className="text-sm font-medium rounded-lg data-[state=active]:shadow-sm transition-all"
                style={{ 
                  color: '#cbd5e1',
                  backgroundColor: 'transparent'
                }}
                data-state-active-style={{
                  backgroundColor: '#2d3748',
                  color: '#f1f5f9',
                  border: '1px solid rgba(100, 116, 139, 0.3)'
                }}
              >
                <Shield className="h-4 w-4 mr-2" />
                Verification
              </TabsTrigger>
              <TabsTrigger 
                value="payment" 
                className="text-sm font-medium rounded-lg data-[state=active]:shadow-sm transition-all"
                style={{ 
                  color: '#cbd5e1',
                  backgroundColor: 'transparent'
                }}
                data-state-active-style={{
                  backgroundColor: '#2d3748',
                  color: '#f1f5f9',
                  border: '1px solid rgba(100, 116, 139, 0.3)'
                }}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Payment Details
              </TabsTrigger>
            </TabsList>

            {/* Profile Info Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Profile Image Card */}
                <Card className="rounded-2xl" style={{
                  backgroundColor: '#1a2234',
                  border: '1px solid rgba(100, 116, 139, 0.15)'
                }}>
                  <CardHeader className="pb-4" style={{ 
                    borderBottom: '1px solid rgba(100, 116, 139, 0.15)'
                  }}>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold" style={{ color: '#f1f5f9' }}>
                      <Camera className="h-5 w-5" style={{ color: '#94a3b8' }} />
                      Profile Picture
                    </CardTitle>
                    <CardDescription style={{ color: '#94a3b8' }}>
                      Upload your photo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-40 w-40 ring-4" style={{ 
                        ringColor: 'rgba(100, 116, 139, 0.2)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
                      }}>
                        <AvatarImage src={formData.profileImage} alt="Profile" />
                        <AvatarFallback className="text-4xl font-bold" style={{ 
                          backgroundColor: '#2d3748',
                          color: '#94a3b8'
                        }}>
                          {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="w-full space-y-2">
                        <Label htmlFor="profile-image" className="cursor-pointer">
                          <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-105" style={{ 
                            backgroundColor: 'rgba(30, 41, 59, 0.5)',
                            borderColor: '#4b5563',
                            color: '#cbd5e1'
                          }}>
                            <Upload className="h-4 w-4" />
                            <span className="font-medium">Choose Image</span>
                          </div>
                        </Label>
                        <Input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageUpload}
                          className="hidden"
                        />
                        <p className="text-xs text-center" style={{ color: '#94a3b8' }}>
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Information Card */}
                <Card className="lg:col-span-2 rounded-2xl" style={{
                  backgroundColor: '#1a2234',
                  border: '1px solid rgba(100, 116, 139, 0.15)'
                }}>
                  <CardHeader className="pb-4" style={{ 
                    borderBottom: '1px solid rgba(100, 116, 139, 0.15)'
                  }}>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold" style={{ color: '#f1f5f9' }}>
                      <User className="h-5 w-5" style={{ color: '#94a3b8' }} />
                      Personal Information
                    </CardTitle>
                    <CardDescription style={{ color: '#94a3b8' }}>
                      Your basic details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#cbd5e1' }}>
                          <User className="h-4 w-4" style={{ color: '#94a3b8' }} />
                          Full Name
                        </Label>
                        <Input 
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          placeholder="John Doe"
                          className="h-11 rounded-lg transition-colors"
                          style={{
                            backgroundColor: '#1f2937',
                            borderColor: '#374151',
                            color: '#f1f5f9'
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#cbd5e1' }}>
                          <Mail className="h-4 w-4" style={{ color: '#94a3b8' }} />
                          Email
                        </Label>
                        <Input 
                          id="email"
                          value={formData.email} 
                          disabled 
                          className="h-11 rounded-lg"
                          style={{
                            backgroundColor: '#1f2937',
                            borderColor: '#374151',
                            color: '#94a3b8'
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium" style={{ color: '#cbd5e1' }}>
                          <Phone className="h-4 w-4" style={{ color: '#94a3b8' }} />
                          Phone Number (Country + Code)
                        </Label>
                        <div className="flex gap-2">
                          <Select
                            value={formData.phoneCountryCode || '+92'}
                            onValueChange={(v) => handleInputChange('phoneCountryCode', v)}
                          >
                            <SelectTrigger
                              className="h-11 w-[140px] rounded-lg shrink-0"
                              style={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f1f5f9' }}
                            >
                              <SelectValue placeholder="Code" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[280px] bg-slate-800 border-slate-600">
                              {countriesWithCodes.map((c) => (
                                <SelectItem key={c.code} value={c.dialCode} className="text-slate-200 focus:bg-slate-700 focus:text-white">
                                  {c.name} {c.dialCode}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phoneNumber ?? ''}
                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                            placeholder="300 1234567"
                            className="h-11 rounded-lg flex-1 transition-colors"
                            style={{
                              backgroundColor: '#1f2937',
                              borderColor: '#374151',
                              color: '#f1f5f9'
                            }}
                          />
                        </div>
                        <p className="text-xs" style={{ color: '#94a3b8' }}>All countries with dial code shown in dropdown</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#cbd5e1' }}>
                          <Building2 className="h-4 w-4" style={{ color: '#94a3b8' }} />
                          Role
                        </Label>
                        <Input 
                          id="role"
                          value={formData.role === "superadmin" ? "Super Admin" : formData.role === "admin" ? "Admin" : "User"} 
                          disabled 
                          className="h-11 rounded-lg capitalize"
                          style={{
                            backgroundColor: '#1f2937',
                            borderColor: '#374151',
                            color: '#94a3b8'
                          }}
                        />
                      </div>
                    </div>

                    <Separator style={{ backgroundColor: '#374151' }} />

                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2" style={{ color: '#f1f5f9' }}>
                        <MapPin className="h-5 w-5" style={{ color: '#94a3b8' }} />
                        Address Information
                      </h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm font-medium" style={{ color: '#cbd5e1' }}>
                          Street Address
                        </Label>
                        <Input 
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          placeholder="123 Main Street"
                          className="h-11 rounded-lg transition-colors"
                          style={{
                            backgroundColor: '#1f2937',
                            borderColor: '#374151',
                            color: '#f1f5f9'
                          }}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm font-medium" style={{ color: '#cbd5e1' }}>
                            City
                          </Label>
                          <Input 
                            id="city"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            placeholder="Lahore"
                            className="h-11 rounded-lg transition-colors"
                            style={{
                              backgroundColor: '#1f2937',
                              borderColor: '#374151',
                              color: '#f1f5f9'
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country" className="text-sm font-medium" style={{ color: '#cbd5e1' }}>
                            Country
                          </Label>
                          <Input 
                            id="country"
                            value={formData.country}
                            onChange={(e) => handleInputChange('country', e.target.value)}
                            placeholder="Pakistan"
                            className="h-11 rounded-lg transition-colors"
                            style={{
                              backgroundColor: '#1f2937',
                              borderColor: '#374151',
                              color: '#f1f5f9'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Verification Tab */}
            <TabsContent value="verification" className="space-y-6">
              <Card className="rounded-2xl" style={{
                backgroundColor: '#1a2234',
                border: '1px solid rgba(100, 116, 139, 0.15)'
              }}>
                <CardHeader className="pb-4" style={{ 
                  borderBottom: '1px solid rgba(100, 116, 139, 0.15)'
                }}>
                  <CardTitle className="flex items-center gap-2 text-base font-semibold" style={{ color: '#f1f5f9' }}>
                    <Shield className="h-5 w-5" style={{ color: '#94a3b8' }} />
                    Identity Verification
                    {formData.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full" style={{ 
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        color: '#10b981',
                        border: '1px solid rgba(34, 197, 94, 0.2)'
                      }}>
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription style={{ color: '#94a3b8' }}>
                    Upload both sides of your government-issued ID
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* ID Card Front */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-base flex items-center gap-2" style={{ color: '#f1f5f9' }}>
                        <CreditCard className="h-5 w-5" style={{ color: '#94a3b8' }} />
                        ID Card - Front Side
                      </h3>
                      <div className="relative group">
                        {formData.idCardFront ? (
                          <>
                            <div className="aspect-video rounded-lg overflow-hidden border-2" style={{ 
                              borderColor: '#4b5563',
                              backgroundColor: '#1f2937'
                            }}>
                              <img src={formData.idCardFront} alt="ID Card Front" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                              <Label htmlFor="id-card-front" className="cursor-pointer">
                                <Button 
                                  size="sm" 
                                  className="rounded-lg px-4"
                                  style={{
                                    backgroundColor: '#2d3748',
                                    color: '#f1f5f9',
                                    border: '1px solid rgba(100, 116, 139, 0.3)'
                                  }}
                                >
                                  <Upload className="h-3 w-3 mr-2" />
                                  Change
                                </Button>
                              </Label>
                            </div>
                          </>
                        ) : (
                          <div className="aspect-video rounded-lg flex flex-col items-center justify-center border-2 border-dashed" style={{ 
                            backgroundColor: '#1f2937',
                            borderColor: '#4b5563'
                          }}>
                            <CreditCard className="h-12 w-12 mb-3" style={{ color: '#4b5563' }} />
                            <p className="text-sm" style={{ color: '#94a3b8' }}>No front image uploaded</p>
                          </div>
                        )}
                      </div>
                      
                      <Label htmlFor="id-card-front" className="cursor-pointer">
                        <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed transition-all duration-200" style={{ 
                          backgroundColor: 'rgba(30, 41, 59, 0.5)',
                          borderColor: '#4b5563',
                          color: '#cbd5e1'
                        }}>
                          <Upload className="h-4 w-4" />
                          <span className="font-medium">Upload Front Side</span>
                        </div>
                      </Label>
                      <Input
                        id="id-card-front"
                        type="file"
                        accept="image/*"
                        onChange={handleIdCardFrontUpload}
                        className="hidden"
                      />
                      <p className="text-xs" style={{ color: '#94a3b8' }}>
                        Clear image of the front side with all details visible
                      </p>
                    </div>

                    {/* ID Card Back */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-base flex items-center gap-2" style={{ color: '#f1f5f9' }}>
                        <CreditCard className="h-5 w-5" style={{ color: '#94a3b8' }} />
                        ID Card - Back Side
                      </h3>
                      <div className="relative group">
                        {formData.idCardBack ? (
                          <>
                            <div className="aspect-video rounded-lg overflow-hidden border-2" style={{ 
                              borderColor: '#4b5563',
                              backgroundColor: '#1f2937'
                            }}>
                              <img src={formData.idCardBack} alt="ID Card Back" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                              <Label htmlFor="id-card-back" className="cursor-pointer">
                                <Button 
                                  size="sm" 
                                  className="rounded-lg px-4"
                                  style={{
                                    backgroundColor: '#2d3748',
                                    color: '#f1f5f9',
                                    border: '1px solid rgba(100, 116, 139, 0.3)'
                                  }}
                                >
                                  <Upload className="h-3 w-3 mr-2" />
                                  Change
                                </Button>
                              </Label>
                            </div>
                          </>
                        ) : (
                          <div className="aspect-video rounded-lg flex flex-col items-center justify-center border-2 border-dashed" style={{ 
                            backgroundColor: '#1f2937',
                            borderColor: '#4b5563'
                          }}>
                            <CreditCard className="h-12 w-12 mb-3" style={{ color: '#4b5563' }} />
                            <p className="text-sm" style={{ color: '#94a3b8' }}>No back image uploaded</p>
                          </div>
                        )}
                      </div>
                      
                      <Label htmlFor="id-card-back" className="cursor-pointer">
                        <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed transition-all duration-200" style={{ 
                          backgroundColor: 'rgba(30, 41, 59, 0.5)',
                          borderColor: '#4b5563',
                          color: '#cbd5e1'
                        }}>
                          <Upload className="h-4 w-4" />
                          <span className="font-medium">Upload Back Side</span>
                        </div>
                      </Label>
                      <Input
                        id="id-card-back"
                        type="file"
                        accept="image/*"
                        onChange={handleIdCardBackUpload}
                        className="hidden"
                      />
                      <p className="text-xs" style={{ color: '#94a3b8' }}>
                        Clear image of the back side with all details visible
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-lg" style={{ 
                    backgroundColor: 'rgba(30, 64, 175, 0.1)',
                    border: '1px solid rgba(30, 64, 175, 0.3)'
                  }}>
                    <p className="text-sm flex items-start gap-2" style={{ color: '#93c5fd' }}>
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Accepted Documents:</strong> National ID Card, Driver's License, Passport, or any government-issued identification document.
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Tab – layout like reference: For Payments, method card, form fields, Save button */}
            <TabsContent value="payment" className="space-y-6">
              <div className="space-y-5">
                <h3 className="text-lg font-semibold" style={{ color: '#f1f5f9' }}>
                  For Payments
                </h3>

                {/* Selected method card (Bank Account) */}
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3 border-2"
                  style={{
                    backgroundColor: '#1e293b',
                    borderColor: 'rgba(59, 130, 246, 0.5)',
                    color: '#f1f5f9'
                  }}
                >
                  <div className="p-2 rounded-lg bg-slate-700/50">
                    <Building2 className="h-5 w-5" style={{ color: '#94a3b8' }} />
                  </div>
                  <span className="font-medium">Bank Account</span>
                  <span className="text-sm ml-auto" style={{ color: '#94a3b8' }}>For payouts</span>
                </div>

                {/* Form card – all banking fields */}
                <Card className="rounded-2xl overflow-hidden" style={{
                  backgroundColor: '#1a2234',
                  border: '1px solid rgba(100, 116, 139, 0.2)'
                }}>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="accountTitle" className="text-sm font-medium" style={{ color: '#cbd5e1' }}>
                        Account holder name
                      </Label>
                      <Input
                        id="accountTitle"
                        value={formData.accountTitle || ''}
                        onChange={(e) => handleInputChange('accountTitle', e.target.value)}
                        placeholder="Full Name"
                        className="h-11 rounded-lg bg-slate-800/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName" className="text-sm font-medium" style={{ color: '#cbd5e1' }}>
                        Bank / Payment method
                      </Label>
                      <Select value={bankSelect || undefined} onValueChange={(v) => setBankSelect(v || '')}>
                        <SelectTrigger className="h-11 rounded-lg bg-slate-800/50 border-slate-600 text-slate-100">
                          <SelectValue placeholder="Select bank or method" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {PAYMENT_BANK_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-slate-200 focus:bg-slate-700">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {bankSelect === 'Custom' && (
                        <Input
                          value={customBankName}
                          onChange={(e) => setCustomBankName(e.target.value)}
                          placeholder="Type custom bank or method name"
                          className="mt-2 h-11 rounded-lg bg-slate-800/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber" className="text-sm font-medium flex items-center justify-between" style={{ color: '#cbd5e1' }}>
                        Account / Number
                        <button
                          type="button"
                          onClick={() => setShowAccountNumber(!showAccountNumber)}
                          className="text-xs hover:underline"
                          style={{ color: '#94a3b8' }}
                        >
                          {showAccountNumber ? <EyeOff className="h-3 w-3 inline mr-1" /> : <Eye className="h-3 w-3 inline mr-1" />}
                          {showAccountNumber ? 'Hide' : 'Show'}
                        </button>
                      </Label>
                      <Input
                        id="accountNumber"
                        type={showAccountNumber ? 'text' : 'password'}
                        value={formData.accountNumber || ''}
                        onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                        placeholder="Account number or 03XX for EasyPaisa/JazzCash"
                        className="h-11 rounded-lg bg-slate-800/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={handleSavePaymentDetails}
                      disabled={isUpdatingUser}
                      className="w-full h-12 rounded-xl font-semibold text-base bg-blue-600 hover:bg-blue-700 text-white border-0"
                    >
                      {isUpdatingUser ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          Saving...
                        </span>
                      ) : (
                        <>Save Payment Details</>
                      )}
                    </Button>

                    <p className="text-xs text-center" style={{ color: '#94a3b8' }}>
                      We will use these details for payouts. Make sure all details are accurate.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;