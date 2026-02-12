import { Button } from "./ui/button";
import { Calendar, User } from "lucide-react";
import blog1 from "@/assets/blog1.jpg";
import blog2 from "@/assets/blog2.jpg";
import blog3 from "@/assets/blog3.jpg";

const posts = [
  {
    id: 1,
    title: "Books changed my ideology",
    excerpt: "Adipiscing gravida, et turpis egestas pretium donec placerat. Ullamcorper magna nec. Eros ultrices vitae cursus leo augue ut lectus arcus bibendum. Elementum.",
    image: blog1,
    date: "April 4, 2020",
    author: "Ramamoorthi M"
  },
  {
    id: 2,
    title: "Best writers of 19th century",
    excerpt: "Accumsan lacus vel facilisis volutpat. Pharetra urna leo tincidunt praesentt tempus. Iaculis arrat in eu volutpat. Sapien nec, sagittis nisl nisl eget nesat nunc.",
    image: blog2,
    date: "April 4, 2020",
    author: "Ramamoorthi M"
  },
  {
    id: 3,
    title: "100 Best kids story books",
    excerpt: "Felis bibendum at tristique sit egestas justo quam. Imperdiet ultricies in mauris tempor nec feugiat nisl. Dui heum. Fusce sit id amet dictum.",
    image: blog3,
    date: "April 4, 2020",
    author: "Ramamoorthi M"
  },
];

const LatestNews = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-2">LATEST NEWS</h2>
          <div className="w-16 h-1 bg-primary mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {posts.map((post) => (
            <article key={post.id} className="group">
              <div className="mb-4 overflow-hidden rounded-lg">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {post.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {post.date}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              <Button 
                variant="default" 
                size="sm"
                className="bg-blue-900 hover:bg-blue-800 text-white"
              >
                Read More
              </Button>
            </article>
          ))}
        </div>

        {/* Partner Logos */}
        <div className="border-t pt-12">
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-40 grayscale">
            <div className="text-2xl font-bold tracking-wider text-muted-foreground">ALASKA</div>
            <div className="text-2xl font-bold tracking-wider text-muted-foreground">SUNSET</div>
            <div className="text-2xl font-bold tracking-wider text-muted-foreground">LINEBOX</div>
            <div className="text-2xl font-bold tracking-wider text-muted-foreground">LDE</div>
            <div className="text-2xl font-bold tracking-wider text-muted-foreground">BLAST</div>
            <div className="text-2xl font-bold tracking-wider text-muted-foreground">SIDEPLAIN</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestNews;