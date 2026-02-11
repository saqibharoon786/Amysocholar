import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Package, Lock, Tag, RotateCcw, ChevronLeft, ChevronRight, Star } from "lucide-react";
import lawHero1 from "@/assets/law1.jpg";
import lawHero2 from "@/assets/law2.jpg";
import lawHero3 from "@/assets/law3.jpg";

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Parallax transforms
  const backgroundY = useTransform(smoothProgress, [0, 1], ["0%", "20%"]);
  const imageScale = useTransform(smoothProgress, [0, 0.5], [1, 1.1]);
  const textY = useTransform(smoothProgress, [0, 0.5], ["0%", "15%"]);
  const overlayOpacity = useTransform(smoothProgress, [0, 0.3], [0.2, 0.4]);

  const slides = [
    {
      badge: "Legal Expertise",
      title: "Professional",
      highlight: "Law Books",
      subtitle: "Collection",
      description:
        "Comprehensive legal resources including constitutional law, case studies, and legal proceedings. Essential reading for legal professionals and students.",
      image: lawHero1,
      imageAlt: "Professional law books with scales of justice and gavel",
    },
    {
      badge: "Legal Education",
      title: "Constitutional",
      highlight: "& Statute",
      subtitle: "Law",
      description:
        "Explore our extensive collection of constitutional law books, legal documents, and authoritative legal references for your practice or studies.",
      image: lawHero2,
      imageAlt: "Constitutional law books with judge's gavel and legal documents",
    },
    {
      badge: "Legal Library",
      title: "Complete",
      highlight: "Legal Reference",
      subtitle: "Collection",
      description:
        "From legal textbooks to statute books, build your comprehensive legal library with our prestigious collection of law resources.",
      image: lawHero3,
      imageAlt: "Legal textbooks with Lady Justice statue in law library",
    },
  ];

  const features = [
    {
      icon: Package,
      title: "Free Shipping",
      description: "Order over $100",
      color: "from-blue-500/20 to-blue-600/20"
    },
    {
      icon: Lock,
      title: "Secure Payment",
      description: "100% Secure Payment",
      color: "from-green-500/20 to-green-600/20"
    },
    {
      icon: Tag,
      title: "Best Price",
      description: "Guaranteed Price",
      color: "from-amber-500/20 to-amber-600/20"
    },
    {
      icon: RotateCcw,
      title: "Free Returns",
      description: "Within 30 Days returns",
      color: "from-purple-500/20 to-purple-600/20"
    },
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentSlide(index);
  };

  return (
    <section ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Background Images with Parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: backgroundY }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <motion.img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].imageAlt}
              className="h-full w-full object-cover"
              style={{ scale: imageScale }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Subtle Dark Overlay */}
        <motion.div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
        
        {/* Gradient Overlays (Very Subtle) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <motion.div
          className="container mx-auto px-4 flex-1 flex items-center py-20 lg:py-32"
          style={{ y: textY }}
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
            {/* Text Content - Semi-transparent */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-8"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
                  </span>
                  <p className="text-sm uppercase tracking-widest font-semibold text-white">
                    {slides[currentSlide].badge}
                  </p>
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                  className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] text-white"
                >
                  {slides[currentSlide].title}
                  <br />
                  <span className="text-amber-300">
                    {slides[currentSlide].highlight}
                  </span>
                  <br />
                  <span className="text-white/90">
                    {slides[currentSlide].subtitle}
                  </span>
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-lg lg:text-xl text-white/90 max-w-lg leading-relaxed"
                >
                  {slides[currentSlide].description}
                </motion.p>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 pt-4"
                >
                  <Button
                    size="lg"
                    className="relative overflow-hidden rounded-lg text-base min-w-[180px] px-8 py-6 font-semibold bg-amber-500 text-white hover:bg-amber-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Shop Now
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-lg text-base min-w-[180px] px-8 py-6 font-semibold border-2 border-white/30 text-white bg-transparent hover:bg-white/20 transition-all duration-300"
                  >
                    Browse Collection
                  </Button>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Decorative Side - Transparent Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative hidden lg:block"
            >
              {/* Floating decorative elements */}
              <motion.div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber-400/10 blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Stats Card - Transparent */}
              <motion.div
                className="absolute bottom-10 left-0 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <p className="text-4xl font-bold text-white">10,000+</p>
                <p className="text-white/70 text-sm mt-1">Legal Books Available</p>
              </motion.div>

              {/* Rating Card - Transparent */}
              <motion.div
                className="absolute top-20 right-0 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-white">4.9</span>
                </div>
                <p className="text-xs text-white/70 mt-1">Trusted by 50,000+ customers</p>
              </motion.div>

              {/* Floating Book Icon */}
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="w-20 h-20 rounded-full bg-amber-500/10 backdrop-blur-sm flex items-center justify-center border border-amber-400/20">
                  <svg className="w-10 h-10 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Slide Navigation - Transparent */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative h-2 rounded-full transition-all duration-500 ${
                  index === currentSlide
                    ? "w-12 bg-amber-400"
                    : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                {index === currentSlide && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-amber-300"
                    layoutId="activeSlide"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Features Bar - Glass Morphism */}
      <motion.div
        className="relative z-20 py-10"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
              >
                <div className={`bg-gradient-to-br ${feature.color} backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-500`}>
                  <div className="flex items-center gap-5">
                    <div className="relative p-4 rounded-xl bg-white/10 border border-white/20 group-hover:bg-white/20 transition-all duration-500">
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    className="h-0.5 w-8 mt-4 rounded-full bg-white/30 group-hover:bg-amber-400 transition-colors duration-300"
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator - Minimal */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2 text-white/60"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;