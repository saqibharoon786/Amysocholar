import { Button } from "./ui/button";
import festivalBg from "@/assets/festival-bg.jpg";
import reader from "@/assets/reader.jpg";

const BookFestival = () => {
  return (
    <section className="py-16 relative overflow-hidden" style={{
      backgroundImage: `url(${festivalBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img 
              src={reader} 
              alt="Happy reader" 
              className="rounded-lg shadow-xl w-full max-w-md mx-auto"
            />
          </div>
          
          <div className="text-center md:text-left">
            <p className="text-sm uppercase tracking-wide text-muted-foreground mb-4">Shop wide range of collections</p>
            <h2 className="text-5xl font-bold mb-6 text-blue-900 dark:text-blue-800">BOOK FESTIVAL</h2>
            <p className="text-lg mb-2">ALL BOOKS ARE FLAT <span className="font-bold text-2xl">50% OFF</span></p>
            <Button 
              size="lg" 
              className="mt-6 bg-blue-900 hover:bg-blue-800 text-white dark:bg-blue-800 dark:hover:bg-blue-700"
            >
              Shop Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookFestival;