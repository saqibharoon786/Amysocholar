import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Youtube,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  ExternalLink,
  Scale,
  FileText,
  Shield,
  Share2,
  Music2,
} from "lucide-react";
import { FaTwitter, FaPinterestP, FaWhatsapp, FaTelegram } from "react-icons/fa";

const PRIVACY_POLICY = {
  title: "Privacy Policy",
  effectiveDate: "Effective Date: App Launching Date",
  content: `At AMY ScholarNest, your privacy is our priority. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services. By accessing or using AMY ScholarNest, you agree to the terms outlined below.

1. Information We Collect
When you use our app, we may collect the following personal information:
• Name
• Email address
• Phone number
• Location data
• Other information you provide during account registration or use of services

2. How We Use Your Information
We use the collected information for the following purposes:
• To create and manage your account
• To personalize your experience on the app
• To improve security and prevent unauthorized access
• To provide customer support and respond to inquiries

3. Data Sharing
We respect your privacy and do not share your personal data with third parties, including advertisers, analytics providers, or external payment processors.

4. Data Protection
We take appropriate technical and organizational measures to protect your information, including:
• Encryption of sensitive data
• Limited access to authorized personnel only
• Regular monitoring of our systems to ensure data safety
However, while we take strong measures to protect your data, no system is 100% secure, and we cannot guarantee absolute security.

5. Your Rights
As a user, you have the right to:
• Access the personal data we hold about you
• Request correction of inaccurate information
• Request deletion of your data, subject to legal and regulatory requirements

6. Children's Privacy
AMY ScholarNest is intended for users 18 years and older. We do not knowingly collect personal information from children under 18.

7. Changes to This Privacy Policy
We may update this Privacy Policy from time to time. Any significant changes will be communicated through the app or official communication channels.

8. Contact Us
If you have questions or concerns regarding this Privacy Policy or the handling of your data, please contact us at:
📧 info@amyscholarnest.com`,
};

const ABOUT_US = {
  title: "About Us",
  content: `AMY ScholarNest is a modern digital platform designed to make knowledge and books more accessible than ever before. We provide students, professionals, and book lovers with a seamless experience in reading, buying, selling, and distributing digital materials such as eBooks, PDFs, and academic content.

Our app empowers users to:
• Access a wide range of digital reading materials.
• Create accounts to upload and sell their authored works.
• Purchase and receive books through our logistics, warehousing, packaging, and delivery services.
• Explore an evolving marketplace that will soon include physical books and international shipments.

Our Mission
AMY ScholarNest was created with students in mind—especially law students in Pakistan—who often struggle to find the academic resources they need. By providing law books and court judgments, we aim to make research, case preparation, and study more convenient. At the same time, we are solving the challenges of book sale and purchase by connecting buyers and sellers through one trusted platform.

Our Vision
We envision a world where every student and professional has access to the books they need—anytime, anywhere. Starting with legal education, our goal is to expand into all fields of study and build an international online marketplace for books.

What Makes Us Unique
In the near future, AMY ScholarNest will introduce special features tailored for lawyers, making legal research and practice even more efficient. By blending technology with education, we are building not just a marketplace, but a hub for knowledge sharing and learning.`,
};

const TERMS_AND_CONDITIONS = {
  title: "Terms and Conditions",
  effectiveDate: "Effective Date: App Launching Date",
  content: `Welcome to AMY ScholarNest. By accessing or using our platform, you agree to comply with and be bound by these Terms and Conditions. Please read them carefully before using our services.

1. Company Information
This application, AMY ScholarNest, is owned and operated by AMY SCHOLARNEST (SMC-PRIVATE) LIMITED, under the ownership of Advocate Muhammad Younas. The company is registered in Pakistan and may expand its operations to other countries in the future.

2. Eligibility
• Users must be 18 years of age or older to register and use the platform.
• By using AMY ScholarNest, you confirm that you meet this age requirement.

3. User Responsibilities
When using our services, you agree that you will not:
• Upload, sell, or distribute illegal books or materials.
• Post or distribute content that promotes hate speech, violence, or discrimination against any race, nation (Qoum), religion (Mazhab), or state.
• Engage in spamming, fraudulent activity, or any unlawful conduct.
Violation of these rules may result in suspension or permanent termination of your account.

4. Services
AMY ScholarNest provides:
• Access to digital reading materials, including eBooks, PDFs, and academic content.
• A marketplace for users to buy and sell books (digital and physical).
• Logistics, warehousing, packaging, and delivery services for purchased items.

5. Payment and Refund Policy
• All payments on AMY ScholarNest are processed securely.
• Refunds will only be issued after full proof is provided by both parties (seller and purchaser) regarding the dispute.
• The platform reserves the right to review each case individually and make the final decision.
• Our payment system and refund policies are designed to be strict, secure, and fair, similar to global e-commerce standards.

6. Intellectual Property
All content, trademarks, and materials available on AMY ScholarNest are the property of AMY SCHOLARNEST (SMC-PRIVATE) LIMITED and are protected under applicable intellectual property laws. Users may not copy, distribute, or reproduce content without permission.

7. Limitation of Liability
• AMY ScholarNest is not liable for any direct or indirect damages arising from the misuse of the platform.
• The platform acts as a facilitator between buyers and sellers and does not guarantee the authenticity of third-party content uploaded by users.

8. Termination of Service
We reserve the right to suspend or terminate accounts that violate these Terms & Conditions or engage in unlawful activity.

9. Changes to Terms
AMY ScholarNest may update these Terms & Conditions from time to time. Users will be notified of significant changes through the app or official communication channels.

10. Contact Information
For any questions or concerns regarding these Terms & Conditions, please contact us at:
📧 info@amyscholarnest.com`,
};

const SOCIAL_LINKS = [
  { name: "YouTube", href: "https://www.youtube.com/@AMYScholarNest/", Icon: Youtube },
  { name: "Twitter (X)", href: "https://x.com/AMYScholarNest/", Icon: FaTwitter },
  { name: "Instagram", href: "https://www.instagram.com/amyscholarnest/", Icon: Instagram },
  { name: "Threads", href: "https://www.threads.com/@amyscholarnest/", Icon: Share2 },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/amyscholarnest/", Icon: Linkedin },
  { name: "Pinterest", href: "https://www.pinterest.com/amyscholarnest/", Icon: FaPinterestP },
  { name: "Facebook", href: "https://www.facebook.com/amyscholarnest/", Icon: Facebook },
  { name: "WhatsApp Channel", href: "https://whatsapp.com/channel/0029Vb5wxBh4tRs2KFFIu02I", Icon: FaWhatsapp },
  { name: "Telegram", href: "https://t.me/amyscholarnest/", Icon: FaTelegram },
  { name: "TikTok", href: "https://www.tiktok.com/@amyscholarnest/", Icon: Music2 },
  { name: "Website", href: "https://www.amyscholarnest.com/", Icon: ExternalLink },
];

function PolicyDialog({
  open,
  onOpenChange,
  title,
  effectiveDate,
  content,
  icon: Icon,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  effectiveDate?: string;
  content: string;
  icon: React.ElementType;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-2 border-b bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">{title}</DialogTitle>
              {effectiveDate && (
                <p className="text-sm text-muted-foreground mt-0.5">{effectiveDate}</p>
              )}
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6 py-4 min-h-[200px] max-h-[60vh]">
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-foreground">
            {content}
          </div>
        </ScrollArea>
        <div className="px-6 py-3 border-t bg-muted/20 shrink-0 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const Footer = () => {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <>
      <footer className="bg-shop-dark text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-primary">AMY ScholarNest</h3>
              <address className="text-sm not-italic space-y-1 text-muted">
                <p>Pakistan</p>
                <p className="mt-3 flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <a href="mailto:info@amyscholarnest.com" className="hover:text-primary">
                    info@amyscholarnest.com
                  </a>
                </p>
              </address>
            </div>

            {/* Legal & Info */}
            <div>
              <h4 className="font-semibold mb-4 text-background">Legal</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <button
                    type="button"
                    onClick={() => setPrivacyOpen(true)}
                    className="hover:text-primary transition-colors text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setTermsOpen(true)}
                    className="hover:text-primary transition-colors text-left"
                  >
                    Terms and Conditions
                  </button>
                </li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h4 className="font-semibold mb-4 text-background">Information</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <button
                    type="button"
                    onClick={() => setAboutOpen(true)}
                    className="hover:text-primary transition-colors text-left"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <a
                    href="mailto:info@amyscholarnest.com"
                    className="hover:text-primary transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold mb-4 text-background">Follow Us</h4>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_LINKS.map(({ name, href, Icon }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-muted/10 hover:bg-primary rounded flex items-center justify-center transition-colors"
                    title={name}
                    aria-label={name}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-muted/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-muted text-center md:text-left">
                © {new Date().getFullYear()} AMY ScholarNest. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>

      <PolicyDialog
        open={privacyOpen}
        onOpenChange={setPrivacyOpen}
        title={PRIVACY_POLICY.title}
        effectiveDate={PRIVACY_POLICY.effectiveDate}
        content={PRIVACY_POLICY.content}
        icon={Shield}
      />
      <PolicyDialog
        open={aboutOpen}
        onOpenChange={setAboutOpen}
        title={ABOUT_US.title}
        content={ABOUT_US.content}
        icon={Scale}
      />
      <PolicyDialog
        open={termsOpen}
        onOpenChange={setTermsOpen}
        title={TERMS_AND_CONDITIONS.title}
        effectiveDate={TERMS_AND_CONDITIONS.effectiveDate}
        content={TERMS_AND_CONDITIONS.content}
        icon={FileText}
      />
    </>
  );
};

export default Footer;
