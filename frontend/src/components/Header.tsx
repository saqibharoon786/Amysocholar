import { User, LogOut, BookOpen, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const { user, isAuthenticated, signout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAuthClick = () => {
    if (isAuthenticated) {
      signout();
      navigate("/");
    } else {
      navigate("/auth");
    }
  };

  const handleUserClick = () => {
    if (isAuthenticated && user?.role === "admin") {
      navigate("/admin/dashboard");
    } else if (!isAuthenticated) {
      navigate("/auth");
    }
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Categories", path: "/categories" },
    { label: "Judgments", path: "/judgments" },
    { label: "Authors", path: "/authors" },
    { label: "Best Sellers", path: "/bestsellers" },
    { label: "New Releases", path: "/new-releases" },
  ];

  return (
    <>
      {/* Single Line Header - Professional Bookstore Theme */}
      <header className="fixed top-0 w-full bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 border-b border-slate-800/80 shadow-xl z-50 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">

          {/* Left: Logo */}
          <div
            className="cursor-pointer flex items-center gap-3 group"
            onClick={() => navigate("/")}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full"></div>
              <BookOpen className="h-8 w-8 text-white relative z-10 group-hover:text-blue-300 transition-colors duration-300" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                AMYSCHOLAR
                <span className="text-blue-400 ml-1 font-black">Net</span>
              </h1>
              <div className="text-[10px] text-blue-300/70 font-medium tracking-wider uppercase mt-[-2px]">
                Legal Publications & Resources
              </div>
            </div>
          </div>

          {/* Center: Navigation - Desktop */}
          <nav className="hidden lg:block absolute left-1/2 transform -translate-x-1/2">
            <ul className="flex items-center gap-1 bg-slate-800/50 backdrop-blur-sm px-3 py-2 rounded-2xl border border-slate-700/50">
              {navItems.map((item) => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    className="text-sm text-white/80 hover:text-white hover:bg-slate-700/50 px-4 py-2 rounded-xl transition-all duration-300 font-medium relative group"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-400 group-hover:w-3/4 transition-all duration-300"></span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right: User Actions */}
          <div className="flex items-center gap-3">
            {/* User Profile */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUserClick}
                className="rounded-xl text-white hover:bg-slate-700/50 border border-slate-700/50 group"
                title={isAuthenticated ? "My Account" : "Sign In"}
              >
                <div className="relative">
                  <User className="h-4 w-4" />
                  {isAuthenticated && (
                    <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full ring-2 ring-slate-900"></div>
                  )}
                </div>
              </Button>
            </div>

            {/* Auth Button */}
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAuthClick}
                className="rounded-xl text-white hover:bg-slate-700/50 border border-slate-700/50 hidden sm:flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleAuthClick}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/20 hidden sm:flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden rounded-xl text-white hover:bg-slate-700/50 border border-slate-700/50"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-gradient-to-b from-slate-900/95 to-navy-900/95 backdrop-blur-lg border-t border-slate-800/80 mt-4 py-6">
            <div className="container mx-auto px-4">
              <div className="flex flex-col gap-4">
                {/* Navigation Items */}
                <div className="grid grid-cols-2 gap-2">
                  {navItems.map((item) => (
                    <a
                      key={item.path}
                      href={item.path}
                      className="text-white/80 hover:text-white hover:bg-slate-800/50 rounded-xl px-4 py-3 transition-all duration-300 text-sm font-medium border border-slate-700/30"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>

                {/* Auth Buttons - Mobile */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-3">
                  {isAuthenticated ? (
                    <>
                      <div className="text-center text-white/60 text-sm">
                        Logged in as <span className="text-blue-300">{user?.email}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleAuthClick();
                          setIsMenuOpen(false);
                        }}
                        className="w-full rounded-xl text-white hover:bg-slate-800/50 border border-slate-700/50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        handleAuthClick();
                        setIsMenuOpen(false);
                      }}
                      className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/20"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Sign In / Register
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>
    </>
  );
};

export default Header;