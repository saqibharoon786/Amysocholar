import { Button } from "./ui/button";
import languageBook from "@/assets/language-book.jpg";
import eventPoster from "@/assets/event-poster.jpg";

const SpecialOffers = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div>
            <img 
              src={languageBook} 
              alt="Language learning book" 
              className="w-full rounded-lg shadow-xl"
            />
          </div>
          
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground mb-4">Special Offers</p>
            <h2 className="text-4xl font-bold mb-6">
              <span className="text-primary">30% Discount</span> On Books<br />
              Learn Language
            </h2>
            <p className="text-muted-foreground mb-8">
              Curabitur eget rutis autiamor viverra mauris in aliquam sem. Dis parturient montes nascetur ridiculus mus. Ut consequat semper viverra nam.
            </p>
            <Button size="lg" variant="default">
              Shop Now
            </Button>
          </div>
        </div>

        {/* Event Banner */}
        <div className="mt-16 max-w-4xl mx-auto">
          <img 
            src={eventPoster} 
            alt="Art workshop event" 
            className="w-full rounded-lg shadow-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;
