// layouts/SuperAdminLayout.tsx
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

import {
  BookOpen,
  LogOut,
  LayoutDashboard,
  Upload,
  ShoppingCart,
  Book,
  User,
  ShieldCheck,
  Gavel,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const SuperAdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", href: "/superadmin/dashboard", icon: LayoutDashboard },
    { name: "Upload Book", href: "/superadmin/upload", icon: Upload },
    { name: "Upload Judgment", href: "/superadmin/upload-judgment", icon: Gavel },
    { name: "Book Shop", href: "/superadmin/shop", icon: ShoppingCart },
    { name: "Approve Books", href: "/superadmin/approve", icon: ShieldCheck },
    { name: "Profile", href: "/superadmin/profile", icon: User },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0F1729' }}>
      {/* Sidebar - Refined Professional Theme */}
      <div 
        className="w-64 fixed h-full flex flex-col"
        style={{ 
          background: '#1a2234',
          borderRight: '1px solid rgba(100, 116, 139, 0.15)'
        }}
      >
        {/* Logo/Header Section */}
        <div className="p-5 border-b" style={{ borderColor: 'rgba(100, 116, 139, 0.15)' }}>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ 
                backgroundColor: '#2d3748',
                border: '1px solid rgba(100, 116, 139, 0.2)'
              }}
            >
              <BookOpen className="h-5 w-5" style={{ color: '#94a3b8' }} />
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight" style={{ color: '#f1f5f9' }}>
                LawBooks Pro
              </div>
              <div className="text-xs" style={{ color: '#94a3b8' }}>
                Super Admin Panel
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4">
          <div 
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-slate-800/30"
            style={{ 
              backgroundColor: '#1e293b',
              border: '1px solid rgba(100, 116, 139, 0.2)'
            }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: '#334155',
                border: '1px solid rgba(100, 116, 139, 0.3)'
              }}
            >
              <User className="h-5 w-5" style={{ color: '#cbd5e1' }} />
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: '#f1f5f9' }}>
                Younas Khan
              </div>
              <div className="text-xs" style={{ color: '#94a3b8' }}>
                Administrator
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Title */}
        <div className="px-5 pt-2 pb-3">
          <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#94a3b8' }}>
            Navigation
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-sm transition-all duration-200 group relative",
                  active && "shadow-sm"
                )}
                style={{
                  backgroundColor: active 
                    ? '#2d3748' 
                    : 'transparent',
                  color: active 
                    ? '#f8fafc' 
                    : '#cbd5e1',
                  border: active 
                    ? '1px solid rgba(148, 163, 184, 0.2)' 
                    : '1px solid transparent',
                }}
              >
                {/* Active indicator */}
                {active && (
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2">
                    <div 
                      className="w-1 h-5 rounded-full"
                      style={{ backgroundColor: '#94a3b8' }}
                    />
                  </div>
                )}

                <div 
                  className={cn(
                    "p-2 rounded-md flex-shrink-0 transition-all duration-200",
                    active 
                      ? "bg-slate-700/50" 
                      : "bg-slate-800/30 group-hover:bg-slate-700/50"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-all duration-200",
                      active 
                        ? "text-slate-300" 
                        : "text-slate-400 group-hover:text-slate-300"
                    )}
                  />
                </div>
                
                <span className="font-medium tracking-wide">
                  {item.name}
                </span>

                {/* Active indicator dot */}
                {active && (
                  <div className="ml-auto">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 mt-auto border-t" style={{ borderColor: 'rgba(100, 116, 139, 0.15)' }}>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 px-4 py-3 h-auto rounded-lg hover:bg-slate-800/30 transition-all duration-200 group"
            style={{
              color: '#f87171',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.1)'
            }}
          >
            <div 
              className="p-2 rounded-md"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
            >
              <LogOut className="h-4 w-4" style={{ color: '#f87171' }} />
            </div>
            <span className="font-semibold text-sm">
              Logout
            </span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div 
        className="flex-1 ml-64 min-h-screen"
        style={{ 
          backgroundColor: '#0f1729',
          backgroundImage: 'linear-gradient(180deg, rgba(30, 41, 59, 0.1) 0%, transparent 50px)'
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default SuperAdminLayout;