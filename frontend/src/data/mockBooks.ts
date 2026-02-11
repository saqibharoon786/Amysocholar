import book1 from "@/assets/book1.jpg";
import book2 from "@/assets/book2.jpg";
import book3 from "@/assets/book3.jpg";
import book4 from "@/assets/book4.jpg";
import book5 from "@/assets/book5.jpg";
import book6 from "@/assets/book6.jpg";

export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  language: string;
  publicationDate: string;
  pages: number;
  isbn: string;
  publisher: string;
  formats: string[];
  description: string;
  inStock: boolean;
  quantity: number;
  rating: number;
  reviews: number;
  approved?: boolean;
  uploadedBy?: string;
}

export const mockBooks: Book[] = [
  {
    id: 1,
    title: "Constitutional Law Principles",
    author: "Robert Johnson",
    price: 2199.99,
    originalPrice: 2499.99,
    image: book1,
    category: "Constitutional Law",
    language: "English",
    publicationDate: "15 June 2023",
    pages: 892,
    isbn: "978-0-123456-78-9",
    publisher: "Legal Press",
    formats: ["Hardcover", "Kindle edition", "Audiobook"],
    description: "This landmark book takes us on a comprehensive journey through constitutional law. From the foundational principles to modern interpretations, the author skillfully weaves historical context with contemporary legal challenges. An essential resource for law students, practitioners, and anyone interested in understanding the framework of constitutional governance.",
    inStock: true,
    quantity: 250,
    rating: 4.8,
    reviews: 342,
    approved: true
  },
  {
    id: 2,
    title: "Criminal Law and Procedure",
    author: "Sarah Mitchell",
    price: 1899.99,
    image: book2,
    category: "Criminal Law",
    language: "English",
    publicationDate: "22 March 2023",
    pages: 756,
    isbn: "978-0-234567-89-0",
    publisher: "Justice Publications",
    formats: ["Paperback", "Kindle edition"],
    description: "A thorough examination of criminal law and procedure. This book covers everything from basic principles to complex case studies, making it an invaluable resource for legal professionals and students alike.",
    inStock: true,
    quantity: 180,
    rating: 4.6,
    reviews: 218,
    approved: true
  },
  {
    id: 3,
    title: "Contract Law Essentials",
    author: "Michael Davis",
    price: 1699.99,
    originalPrice: 1899.99,
    image: book3,
    category: "Contract Law",
    language: "English",
    publicationDate: "10 January 2023",
    pages: 624,
    isbn: "978-0-345678-90-1",
    publisher: "Legal Education Press",
    formats: ["Hardcover", "Paperback"],
    description: "Master the fundamentals of contract law with this comprehensive guide. Perfect for students and practitioners who need a solid foundation in contractual principles and their practical applications.",
    inStock: true,
    quantity: 320,
    rating: 4.7,
    reviews: 156,
    approved: true
  },
  {
    id: 4,
    title: "Family Law Handbook",
    author: "Jennifer Williams",
    price: 1599.99,
    image: book4,
    category: "Family Law",
    language: "English",
    publicationDate: "5 September 2022",
    pages: 548,
    isbn: "978-0-456789-01-2",
    publisher: "Family Legal Press",
    formats: ["Paperback", "Kindle edition"],
    description: "Navigate the complexities of family law with this practical handbook. Covers divorce, custody, adoption, and domestic relations with clear explanations and case examples.",
    inStock: true,
    quantity: 145,
    rating: 4.5,
    reviews: 98,
    approved: true
  },
  {
    id: 5,
    title: "Property Law Fundamentals",
    author: "David Anderson",
    price: 2099.99,
    image: book5,
    category: "Property Law",
    language: "English",
    publicationDate: "18 November 2022",
    pages: 712,
    isbn: "978-0-567890-12-3",
    publisher: "Real Estate Legal",
    formats: ["Hardcover", "Kindle edition", "Audiobook"],
    description: "Comprehensive coverage of property law including ownership, transfers, easements, and modern real estate transactions. Essential for property lawyers and real estate professionals.",
    inStock: true,
    quantity: 200,
    rating: 4.9,
    reviews: 275,
    approved: true
  },
  {
    id: 6,
    title: "Corporate Law Guide",
    author: "Lisa Thompson",
    price: 2399.99,
    originalPrice: 2699.99,
    image: book6,
    category: "Corporate Law",
    language: "English",
    publicationDate: "30 August 2023",
    pages: 968,
    isbn: "978-0-678901-23-4",
    publisher: "Business Legal Press",
    formats: ["Hardcover", "Paperback", "Kindle edition"],
    description: "The definitive guide to corporate law covering formation, governance, mergers, acquisitions, and compliance. Written by a leading corporate law expert with decades of experience.",
    inStock: true,
    quantity: 95,
    rating: 4.8,
    reviews: 412,
    approved: true
  }
];

export const categories = [
  "All Categories",
  "Constitutional Law",
  "Criminal Law",
  "Contract Law",
  "Family Law",
  "Property Law",
  "Corporate Law"
];
