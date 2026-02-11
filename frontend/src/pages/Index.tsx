import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import NewArrivals from "@/components/NewArrivals";
import BookFestival from "@/components/BookFestival";
import BestAuthor from "@/components/BestAuthor";
import SpecialOffers from "@/components/SpecialOffers";
import DailyDeals from "@/components/DailyDeals";
import LatestNews from "@/components/LatestNews";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import JudgmentSection from "@/components/judgment-section";

const Index = () => {
  return (
    <div className="min-h-screen">

        <HeroSection />
        <JudgmentSection/>

        <NewArrivals />
        <BookFestival />
        <BestAuthor />
        <SpecialOffers />
        <DailyDeals />
        <LatestNews />
        <Newsletter />

    </div>
  );
};

export default Index;
