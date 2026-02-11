// layouts/AdminLayout.tsx
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useAuth as useAuthMutation } from "@/hooks/useAuth";
import { 
  BookOpen, 
  LogOut, 
  LayoutDashboard, 
  Upload, 
  ShoppingCart, 
  Book, 
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

const AdminLayout = () => {
  const { user } = useAuth();
  const { logout } = useAuthMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Upload Book', href: '/admin/upload', icon: Upload },
    { name: 'Book Shop', href: '/admin/shop', icon: ShoppingCart },
    { name: 'Book List', href: '/admin/books', icon: Book },
    { name: 'Profile', href: '/admin/profile', icon: User },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r fixed h-full">
        <div className="p-4 border-b">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <div>
              <div className="font-semibold">Admin Panel</div>
              <div className="text-xs text-gray-500">Book Management</div>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive(item.href)
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button onClick={() => logout().then(() => navigate("/"))} variant="outline" className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="flex-1 ml-64">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;