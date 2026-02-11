// routes/publicRoutes.tsx
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import BookDetail from "@/pages/BookDetail";
import JudgmentDetail from "@/pages/JudgmentDetail";
import BookReader from "@/pages/BookReader"; 
import BooksCatalog from "@/pages/BooksCatalog";
import NotFound from "@/pages/NotFound";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PublicRoutes = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Index />} />
          
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/judgment/:id" element={<JudgmentDetail />} />
          <Route path="/book/:id/read" element={<BookReader />} />
          <Route path="/catalog" element={<BooksCatalog />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default PublicRoutes;