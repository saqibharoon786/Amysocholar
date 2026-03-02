import { User, LogOut, BookOpen, Menu, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { categoryService } from "@/services/categoryService";
import { judgmentCategoryService } from "@/services/judgmentCategoryService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const Header = () => {
  const { user, isAuthenticated, signout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [judgmentCategories, setJudgmentCategories] = useState<string[]>([]);

  useEffect(() => {
    categoryService.getCategories().then((res) => {
      if (res.success && res.data) setCategories(res.data);
    });
  }, []);
  useEffect(() => {
    judgmentCategoryService.getJudgmentCategories().then((res) => {
      if (res.success && res.data) setJudgmentCategories(res.data);
    });
  }, []);

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

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/") {
      document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const navItems = [
    { label: "Home", path: "/", isHome: true },
    { label: "Judgments", path: "/#judgments" },
    { label: "Best Sellers", path: "/#bestsellers" },
  ];

  return (
    <>
      <header className="fixed top-0 w-full bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 border-b border-slate-800/80 shadow-xl z-50 py-4">
        <div className="container mx-auto px-4 grid grid-cols-[minmax(0,auto)_1fr_minmax(0,auto)] items-center gap-6 lg:gap-10 min-h-0">
          {/* Logo + name: left side only, separate from center bar */}
          <div className="flex items-center justify-start min-w-0 pr-2">
            <div
              className="cursor-pointer flex items-center gap-4 group flex-shrink-0"
              onClick={() => navigate("/")}
            >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-slate-600/50 bg-slate-800/50 shadow-lg flex-none">
              <img
                src="/logo.png"
                alt="AMY ScholarNest"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div
                className="absolute inset-0 hidden items-center justify-center bg-slate-800 text-amber-400"
                style={{ display: "none" }}
              >
                <BookOpen className="w-10 h-10" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans leading-tight">
                AMY <span className="text-amber-400">Scholar</span>
                <span className="text-blue-400 font-black">Nest</span>
              </h1>
              <div className="text-xs sm:text-sm text-blue-300/70 font-medium tracking-wider uppercase mt-0.5">
                Legal Publications & Resources
              </div>
            </div>
          </div>
          </div>

          {/* Center: Navigation bar (separate from logo) */}
          <nav className="hidden lg:flex justify-center items-center min-w-0">
            <ul className="flex items-center gap-1 bg-slate-800/50 backdrop-blur-sm px-3 py-2 rounded-2xl border border-slate-700/50 shadow-inner">
              {navItems.map((item) => (
                <li key={item.path}>
                  {item.isHome ? (
                    <a
                      href="/"
                      onClick={handleHomeClick}
                      className="text-sm text-white/80 hover:text-white hover:bg-slate-700/50 px-4 py-2 rounded-xl transition-all duration-300 font-medium relative group block"
                    >
                      {item.label}
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-400 group-hover:w-3/4 transition-all duration-300"></span>
                    </a>
                  ) : (
                    <a
                      href={item.path}
                      onClick={(e) => {
                        if (item.path.startsWith("/#")) {
                          e.preventDefault();
                          navigate("/");
                          setTimeout(() => document.getElementById(item.path.slice(2))?.scrollIntoView({ behavior: "smooth" }), 100);
                        }
                      }}
                      className="text-sm text-white/80 hover:text-white hover:bg-slate-700/50 px-4 py-2 rounded-xl transition-all duration-300 font-medium relative group block"
                    >
                      {item.label}
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-400 group-hover:w-3/4 transition-all duration-300"></span>
                    </a>
                  )}
                </li>
              ))}
              {/* Categories dropdown: Book + Judgment sub-menus */}
              <li>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-sm text-white/80 hover:text-white hover:bg-slate-700/50 px-4 py-2 rounded-xl transition-all duration-300 font-medium inline-flex items-center gap-1 outline-none">
                      Categories
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56 bg-slate-900 border-slate-700 text-white">
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="text-white/90 focus:bg-slate-700 focus:text-white data-[state=open]:bg-slate-700">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Book
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="bg-slate-900 border-slate-700">
                        {categories.map((cat) => (
                          <DropdownMenuItem
                            key={cat}
                            className="text-white/90 focus:bg-slate-700 focus:text-white cursor-pointer"
                            onClick={() => navigate(`/catalog?category=${encodeURIComponent(cat)}`)}
                          >
                            {cat}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="text-white/90 focus:bg-slate-700 focus:text-white data-[state=open]:bg-slate-700">
                        <span className="mr-2 text-amber-400 font-semibold">⚖</span>
                        Judgment
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="bg-slate-900 border-slate-700">
                        {judgmentCategories.map((cat) => (
                          <DropdownMenuItem
                            key={cat}
                            className="text-white/90 focus:bg-slate-700 focus:text-white cursor-pointer"
                            onClick={() => {
                              navigate("/");
                              setTimeout(() => {
                                const el = document.getElementById("judgments");
                                el?.scrollIntoView({ behavior: "smooth" });
                                window.dispatchEvent(new CustomEvent("judgment-filter", { detail: cat }));
                              }, 150);
                            }}
                          >
                            {cat}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            </ul>
          </nav>

          {/* Right: User Actions */}
          <div className="flex items-center justify-end gap-3 flex-shrink-0">
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-gradient-to-b from-slate-900/95 to-navy-900/95 backdrop-blur-lg border-t border-slate-800/80 mt-4 py-6">
            <div className="container mx-auto px-4">
              <div className="flex flex-col gap-4">
                <a href="/" onClick={(e) => { handleHomeClick(e); setIsMenuOpen(false); }} className="text-white/80 hover:text-white hover:bg-slate-800/50 rounded-xl px-4 py-3 transition-all duration-300 text-sm font-medium border border-slate-700/30">
                  Home
                </a>
                <div className="text-white/80 text-sm font-medium px-4 py-2">Categories</div>
                <div className="pl-6 space-y-1">
                  <div className="text-blue-300/90 text-xs font-semibold mb-2">Book</div>
                  {categories.map((cat) => (
                    <a
                      key={cat}
                      href={`/catalog?category=${encodeURIComponent(cat)}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-white/70 hover:text-white hover:bg-slate-800/50 rounded-lg px-4 py-2 text-sm"
                    >
                      {cat}
                    </a>
                  ))}
                  <div className="text-amber-400/90 text-xs font-semibold mt-4 mb-2">Judgment</div>
                  {judgmentCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/");
                        setTimeout(() => {
                          document.getElementById("judgments")?.scrollIntoView({ behavior: "smooth" });
                          window.dispatchEvent(new CustomEvent("judgment-filter", { detail: cat }));
                        }, 150);
                      }}
                      className="block w-full text-left text-white/70 hover:text-white hover:bg-slate-800/50 rounded-lg px-4 py-2 text-sm"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <a href="/#judgments" onClick={() => { setIsMenuOpen(false); navigate("/"); setTimeout(() => document.getElementById("judgments")?.scrollIntoView({ behavior: "smooth" }), 100); }} className="text-white/80 hover:text-white hover:bg-slate-800/50 rounded-xl px-4 py-3 transition-all duration-300 text-sm font-medium border border-slate-700/30">
                  Judgments
                </a>
                <a href="/#bestsellers" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); navigate("/"); setTimeout(() => document.getElementById("bestsellers")?.scrollIntoView({ behavior: "smooth" }), 100); }} className="text-white/80 hover:text-white hover:bg-slate-800/50 rounded-xl px-4 py-3 transition-all duration-300 text-sm font-medium border border-slate-700/30">
                  Best Sellers
                </a>
                <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-3">
                  {isAuthenticated ? (
                    <>
                      <div className="text-center text-white/60 text-sm">
                        Logged in as <span className="text-blue-300">{user?.email}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { handleAuthClick(); setIsMenuOpen(false); }} className="w-full rounded-xl text-white hover:bg-slate-800/50 border border-slate-700/50">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Button variant="default" size="sm" onClick={() => { handleAuthClick(); setIsMenuOpen(false); }} className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
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
      <div className="h-20" />
    </>
  );
};

export default Header;
