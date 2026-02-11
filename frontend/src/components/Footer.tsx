import { Facebook, Instagram, Twitter } from "lucide-react";
import { FaTwitter, FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover, FaCcPaypal } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-shop-dark text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">BOOK SHOP</h3>
            <address className="text-sm not-italic space-y-1 text-muted">
              <p>1203 Town Center</p>
              <p>Drive FL 33458 USA</p>
              <p className="mt-3">+0000 123 456 789</p>
              <p>info@example.com</p>
            </address>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold mb-4 text-background">Help</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="#" className="hover:text-primary">Search</a></li>
              <li><a href="#" className="hover:text-primary">Help</a></li>
              <li><a href="#" className="hover:text-primary">Information</a></li>
              <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary">Shipping Information</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-background">Support</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="#" className="hover:text-primary">Search Terms</a></li>
              <li><a href="#" className="hover:text-primary">Advanced Search</a></li>
              <li><a href="#" className="hover:text-primary">Helps & Faqs</a></li>
              <li><a href="#" className="hover:text-primary">Store Location</a></li>
              <li><a href="#" className="hover:text-primary">Orders & Returns</a></li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-semibold mb-4 text-background">Information</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="#" className="hover:text-primary">Contact</a></li>
              <li><a href="#" className="hover:text-primary">About</a></li>
              <li><a href="#" className="hover:text-primary">Careers</a></li>
              <li><a href="#" className="hover:text-primary">Refund & Returns</a></li>
              <li><a href="#" className="hover:text-primary">Deliveries</a></li>
            </ul>
          </div>
        </div>

        {/* Social & Payment */}
        <div className="border-t border-muted/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-muted/10 hover:bg-primary rounded flex items-center justify-center transition-colors">
                <FaTwitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-muted/10 hover:bg-primary rounded flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-muted/10 hover:bg-primary rounded flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>

            <div className="text-sm text-muted">
              All Right Reserved © 2025. Bookly-theme (powered: lovable)
            </div>

            <div className="flex gap-2">
              <FaCcVisa className="text-3xl text-muted" />
              <FaCcMastercard className="text-3xl text-muted" />
              <FaCcAmex className="text-3xl text-muted" />
              <FaCcDiscover className="text-3xl text-muted" />
              <FaCcPaypal className="text-3xl text-muted" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
