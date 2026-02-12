import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  ShoppingCart, 
  Upload, 
  Users, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  PieChart,
  LineChart,
  Activity,
  Eye,
  Download,
  Filter,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Settings,
  FileText,
  Target,
  Clock,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Zap,
  Star
} from "lucide-react";

const Dashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<'cards' | 'graphs'>('cards');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('year');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Navy Blue Color Scheme
  const colors = {
    primary: '#0F172A',
    sidebar: '#0A192F',
    accent: '#1E40AF',
    accentLight: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#8B5CF6',
    text: {
      primary: '#FFFFFF',
      secondary: '#94A3B8',
      muted: '#64748B'
    },
    gradients: {
      blue: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
      purple: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
      green: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      orange: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
      dark: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)'
    }
  };

  // Enhanced stats data with navy blue theme
  const stats = [
    { 
      id: 'total-books',
      title: "Total Books", 
      value: "1,234", 
      icon: BookOpen, 
      color: colors.accentLight,
      bgColor: colors.accent,
      change: "+12%",
      trend: "up",
      description: "Across all categories",
      revenue: "₹2,45,670",
      gradient: colors.gradients.blue
    },
    { 
      id: 'total-orders',
      title: "Total Orders", 
      value: "567", 
      icon: ShoppingCart, 
      color: colors.success,
      bgColor: '#059669',
      change: "+8%",
      trend: "up",
      description: "This month",
      revenue: "₹1,89,450",
      gradient: colors.gradients.green
    },
    { 
      id: 'uploaded-today',
      title: "Uploaded Today", 
      value: "12", 
      icon: Upload, 
      color: colors.info,
      bgColor: '#7C3AED',
      change: "+23%",
      trend: "up",
      description: "New additions",
      revenue: "₹45,230",
      gradient: colors.gradients.purple
    },
    { 
      id: 'active-users',
      title: "Active Users", 
      value: "890", 
      icon: Users, 
      color: colors.warning,
      bgColor: '#D97706',
      change: "+5%",
      trend: "up",
      description: "Currently online",
      revenue: "₹3,12,890",
      gradient: colors.gradients.orange
    },
  ];

  // Enhanced sales data with realistic numbers
  const salesData = {
    month: [
      { period: 'Week 1', sales: 45, revenue: 32000, profit: 8500, orders: 56 },
      { period: 'Week 2', sales: 52, revenue: 38000, profit: 9800, orders: 61 },
      { period: 'Week 3', sales: 68, revenue: 48000, profit: 12500, orders: 72 },
      { period: 'Week 4', sales: 74, revenue: 52000, profit: 13800, orders: 79 },
    ],
    quarter: [
      { period: 'Jan', sales: 65, revenue: 45000, profit: 12000, orders: 70 },
      { period: 'Feb', sales: 78, revenue: 52000, profit: 15000, orders: 82 },
      { period: 'Mar', sales: 90, revenue: 68000, profit: 21000, orders: 95 },
    ],
    year: [
      { period: 'Jan', sales: 65, revenue: 45000, profit: 12000, orders: 70 },
      { period: 'Feb', sales: 78, revenue: 52000, profit: 15000, orders: 82 },
      { period: 'Mar', sales: 90, revenue: 68000, profit: 21000, orders: 95 },
      { period: 'Apr', sales: 81, revenue: 61000, profit: 18000, orders: 86 },
      { period: 'May', sales: 56, revenue: 42000, profit: 11000, orders: 62 },
      { period: 'Jun', sales: 55, revenue: 41000, profit: 10000, orders: 60 },
      { period: 'Jul', sales: 40, revenue: 35000, profit: 8000, orders: 48 },
      { period: 'Aug', sales: 85, revenue: 72000, profit: 22000, orders: 89 },
      { period: 'Sep', sales: 92, revenue: 78000, profit: 25000, orders: 96 },
      { period: 'Oct', sales: 88, revenue: 75000, profit: 23000, orders: 92 },
      { period: 'Nov', sales: 95, revenue: 82000, profit: 28000, orders: 98 },
      { period: 'Dec', sales: 98, revenue: 85000, profit: 30000, orders: 102 },
    ]
  };

  const currentData = salesData[selectedPeriod];

  const categoryData = [
    { name: 'Law Books', value: 35, color: 'bg-blue-500', sales: 432, growth: 12, revenue: '₹4.2L' },
    { name: 'Academic', value: 25, color: 'bg-green-500', sales: 308, growth: 8, revenue: '₹3.1L' },
    { name: 'Reference', value: 20, color: 'bg-purple-500', sales: 247, growth: 15, revenue: '₹2.8L' },
    { name: 'Others', value: 20, color: 'bg-orange-500', sales: 247, growth: 5, revenue: '₹2.4L' },
  ];

  const recentActivities = [
    { 
      action: "New book uploaded", 
      details: "Constitutional Law Principles", 
      time: "2 min ago", 
      type: "upload",
      user: "Admin User",
      amount: "₹2,499",
      status: "success"
    },
    { 
      action: "Order completed", 
      details: "Order #12345", 
      time: "1 hour ago", 
      type: "order",
      user: "John Doe",
      amount: "₹1,299",
      status: "success"
    },
    { 
      action: "Payment failed", 
      details: "Order #12346", 
      time: "2 hours ago", 
      type: "payment",
      user: "Sarah Wilson",
      amount: "₹899",
      status: "error"
    },
    { 
      action: "User registered", 
      details: "New premium member", 
      time: "3 hours ago", 
      type: "user",
      user: "Law Firm Inc.",
      amount: "",
      status: "success"
    },
  ];

  const performanceMetrics = [
    { metric: "Page Views", value: "12.4K", change: "+12%", progress: 75, target: "15K", icon: Eye },
    { metric: "Conversion Rate", value: "3.2%", change: "+5%", progress: 60, target: "4%", icon: Target },
    { metric: "Bounce Rate", value: "42%", change: "-8%", progress: 42, target: "35%", icon: TrendingDown },
    { metric: "Avg. Session", value: "4m 12s", change: "+15%", progress: 55, target: "5m", icon: Clock },
  ];

  const revenueMetrics = {
    totalRevenue: "₹10,45,670",
    growth: "+18.5%",
    averageOrder: "₹1,845",
    totalOrders: currentData.reduce((sum, item) => sum + item.orders, 0),
    totalProfit: currentData.reduce((sum, item) => sum + item.profit, 0),
    peakMonth: currentData.reduce((max, item) => item.revenue > max.revenue ? item : max, currentData[0])
  };

  const topProducts = [
    { name: "Criminal Law Handbook", sales: 234, revenue: "₹3.2L", growth: "+24%" },
    { name: "Corporate Law Guide", sales: 189, revenue: "₹2.8L", growth: "+18%" },
    { name: "Constitution Basics", sales: 167, revenue: "₹2.1L", growth: "+12%" },
    { name: "Legal Terminology", sales: 145, revenue: "₹1.9L", growth: "+8%" },
  ];

  // Enhanced Bar Chart Component with Navy Blue Theme
  const RevenueBarChart = () => {
    const maxRevenue = Math.max(...currentData.map(item => item.revenue));
    const maxProfit = Math.max(...currentData.map(item => item.profit));

    return (
      <div className="h-80 relative">
        <div className="absolute inset-0 flex items-end justify-between pt-10 pb-8 px-4">
          {currentData.map((item, index) => {
            const revenueHeight = (item.revenue / maxRevenue) * 70;
            const profitHeight = (item.profit / maxProfit) * 70;
            
            return (
              <div key={item.period} className="flex flex-col items-center flex-1 relative group">
                <div className="flex items-end gap-1.5 w-full justify-center mb-2">
                  {/* Revenue Bar */}
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-6 rounded-t-lg transition-all duration-500 hover:from-blue-400 hover:to-blue-300 cursor-pointer relative group/bar min-h-[20px]"
                      style={{ 
                        height: `${revenueHeight}%`,
                        background: 'linear-gradient(to top, #1E40AF, #3B82F6)'
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        Revenue: ₹{item.revenue.toLocaleString()}
                      </div>
                      <div className="absolute -top-2 -left-2 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300 animate-ping" />
                    </div>
                    <div className="text-xs text-blue-400 font-semibold mt-1">₹{(item.revenue/1000).toFixed(0)}K</div>
                  </div>
                  
                  {/* Profit Bar */}
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-6 rounded-t-lg transition-all duration-500 hover:from-green-400 hover:to-green-300 cursor-pointer relative group/bar min-h-[20px]"
                      style={{ 
                        height: `${profitHeight}%`,
                        background: 'linear-gradient(to top, #059669, #10B981)'
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        Profit: ₹{item.profit.toLocaleString()}
                      </div>
                      <div className="absolute -top-2 -left-2 w-3 h-3 bg-green-500 rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300 animate-ping" />
                    </div>
                    <div className="text-xs text-green-400 font-semibold mt-1">₹{(item.profit/1000).toFixed(0)}K</div>
                  </div>
                </div>
                
                <span className="text-xs text-slate-400 font-medium absolute -bottom-6 text-center w-full">
                  {item.period}
                </span>
                
                {/* Enhanced Tooltip */}
                <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white p-3 rounded-lg shadow-2xl border border-slate-700 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 min-w-40 backdrop-blur-sm">
                  <div className="text-sm font-bold text-center mb-2 text-blue-300">{item.period}</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-400">Revenue:</span>
                      <span className="font-semibold">₹{item.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-400">Profit:</span>
                      <span className="font-semibold">₹{item.profit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Sales:</span>
                      <span className="font-semibold">{item.sales}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Orders:</span>
                      <span className="font-semibold">{item.orders}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-10 bottom-8 flex flex-col justify-between text-xs text-slate-400 pl-2">
          <span>₹{(maxRevenue/1000).toFixed(0)}K</span>
          <span>₹{((maxRevenue/1000)*0.75).toFixed(0)}K</span>
          <span>₹{((maxRevenue/1000)*0.5).toFixed(0)}K</span>
          <span>₹{((maxRevenue/1000)*0.25).toFixed(0)}K</span>
          <span>₹0</span>
        </div>
      </div>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen p-6 space-y-6 animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-64"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-slate-800 rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6" style={{ backgroundColor: colors.primary }}>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }
            50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.4); }
          }
          @keyframes slideIn {
            from { 
              opacity: 0;
              transform: translateY(30px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          .animate-float { animation: float 6s ease-in-out infinite; }
          .animate-glow { animation: glow 4s ease-in-out infinite; }
          .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
          .animate-slide-in { animation: slideIn 0.6s ease-out; }
          .glass-card {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(100, 116, 139, 0.3);
          }
          .gradient-border {
            position: relative;
            background: linear-gradient(135deg, #1E293B, #334155);
          }
          .gradient-border::before {
            content: '';
            position: absolute;
            top: -1px;
            left: -1px;
            right: -1px;
            bottom: -1px;
            background: linear-gradient(135deg, #3B82F6, #8B5CF6);
            border-radius: inherit;
            z-index: -1;
            opacity: 0;
            transition: opacity 0.3s;
          }
          .gradient-border:hover::before {
            opacity: 1;
          }
        `}
      </style>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: colors.gradients.blue }}>
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">
              Dashboard Overview
            </h2>
          </div>
          <p className="text-slate-400">Welcome back! Here's what's happening today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <Button
              variant={activeView === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('cards')}
              className="flex items-center gap-2 transition-all duration-300 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <BarChart3 className="h-4 w-4" />
              Cards View
            </Button>
            <Button
              variant={activeView === 'graphs' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('graphs')}
              className="flex items-center gap-2 transition-all duration-300 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <LineChart className="h-4 w-4" />
              Graphs View
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Calendar className="h-4 w-4" />
            {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card 
            key={stat.id}
            className="glass-card gradient-border hover:shadow-2xl transition-all duration-500 group cursor-pointer animate-slide-in"
            style={{ animationDelay: `${index * 150}ms` }}
            onMouseEnter={() => setHoveredCard(stat.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <CardContent className="p-5 relative">
              {/* Icon with gradient background */}
              <div className="absolute top-4 right-4">
                <div 
                  className="p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                  style={{ background: stat.gradient }}
                >
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              
              {/* Stat Value */}
              <div className="mb-6">
                <div className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.title}</div>
              </div>
              
              {/* Growth Indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    stat.trend === 'up' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {stat.trend === 'up' ? 
                      <ArrowUpRight className="h-3 w-3" /> : 
                      <ArrowDownRight className="h-3 w-3" />
                    }
                  </div>
                  <span className={`text-sm font-semibold ${
                    stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-300">{stat.revenue}</div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-2 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${Math.min(100, parseInt(stat.value.replace(',', '')) / 15)}%`,
                      background: stat.gradient
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Analytics Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chart */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="border-b border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <div className="p-2 rounded-lg" style={{ background: colors.gradients.blue }}>
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                Revenue Analytics
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                  <Button
                    variant={selectedPeriod === 'month' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedPeriod('month')}
                    className="text-xs px-2 h-7 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={selectedPeriod === 'quarter' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedPeriod('quarter')}
                    className="text-xs px-2 h-7 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    Quarterly
                  </Button>
                  <Button
                    variant={selectedPeriod === 'year' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedPeriod('year')}
                    className="text-xs px-2 h-7 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    Yearly
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <RevenueBarChart />
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">Total Revenue</div>
                <div className="text-2xl font-bold text-white">{revenueMetrics.totalRevenue}</div>
                <div className="text-sm text-green-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  {revenueMetrics.growth}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">Peak Month</div>
                <div className="text-xl font-bold text-white">{revenueMetrics.peakMonth.period}</div>
                <div className="text-sm text-blue-400">₹{revenueMetrics.peakMonth.revenue.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <div className="p-2 rounded-lg" style={{ background: colors.gradients.purple }}>
                <Activity className="h-5 w-5 text-white" />
              </div>
              Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {performanceMetrics.map((metric, index) => (
                <div key={metric.metric} className="space-y-3 group cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-800">
                        <metric.icon className="h-4 w-4 text-slate-300" />
                      </div>
                      <span className="text-sm font-medium text-slate-300">{metric.metric}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{metric.value}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        metric.change.startsWith('+') 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Progress</span>
                      <span>Target: {metric.target}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 relative overflow-hidden">
                      <div 
                        className="h-2 rounded-full transition-all duration-1000 ease-out group-hover:animate-pulse relative overflow-hidden"
                        style={{ 
                          width: `${metric.progress}%`,
                          background: colors.gradients.purple
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Overall Score */}
              <div className="mt-8 p-4 rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">87%</div>
                    <div className="text-sm text-slate-400">Overall Performance</div>
                  </div>
                  <div className="text-green-400 font-semibold flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +12%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <div className="p-2 rounded-lg" style={{ background: colors.gradients.orange }}>
                <Eye className="h-5 w-5 text-white" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-all duration-300 group cursor-pointer border border-transparent hover:border-slate-700"
                >
                  <div className={`p-2 rounded-xl relative ${
                    activity.status === 'success' 
                      ? 'bg-green-500/10 text-green-400' 
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {activity.type === 'upload' && <Upload className="h-4 w-4" />}
                    {activity.type === 'order' && <ShoppingCart className="h-4 w-4" />}
                    {activity.type === 'user' && <Users className="h-4 w-4" />}
                    {activity.type === 'payment' && <DollarSign className="h-4 w-4" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">{activity.action}</p>
                      {activity.status === 'success' ? 
                        <CheckCircle className="h-3 w-3 text-green-400" /> : 
                        <AlertCircle className="h-3 w-3 text-red-400" />
                      }
                    </div>
                    <p className="text-sm text-slate-400 truncate">{activity.details}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.user}</p>
                  </div>
                  
                  <div className="text-right">
                    {activity.amount && (
                      <p className="text-sm font-semibold text-green-400">{activity.amount}</p>
                    )}
                    <span className="text-xs text-slate-500">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white group"
            >
              <span>View All Activities</span>
              <ArrowUpRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <div className="p-2 rounded-lg" style={{ background: colors.gradients.green }}>
                <Star className="h-5 w-5 text-white" />
              </div>
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div 
                  key={product.name}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{product.revenue}</p>
                    <p className="text-xs text-green-400">{product.growth}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-400">Total Revenue</div>
                  <div className="text-xl font-bold text-white">₹10.2L</div>
                </div>
                <div className="text-green-400 font-semibold flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +24%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <div className="p-2 rounded-lg" style={{ background: colors.gradients.dark }}>
                <Zap className="h-5 w-5 text-white" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Upload, label: "Upload Book", color: "blue", count: "12 new" },
                { icon: Users, label: "Users", color: "green", count: "890 active" },
                { icon: FileText, label: "Reports", color: "purple", count: "24 pending" },
                { icon: Settings, label: "Settings", color: "orange", count: "5 updates" },
              ].map((action, index) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300 group"
                >
                  <div className={`p-2 rounded-lg ${
                    action.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                    action.color === 'green' ? 'bg-green-500/20 text-green-400' :
                    action.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-orange-500/20 text-orange-400'
                  } group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-white">{action.label}</span>
                  <span className="text-xs text-slate-400">{action.count}</span>
                </Button>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400 mb-2">Last Updated: Just now</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-green-400">System Status: All systems operational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;