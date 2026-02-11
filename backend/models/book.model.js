// models/book.model.js
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },

    // Categorization
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    subcategory: {
      type: String,
      trim: true,
    },
    tags: [{ 
      type: String,
      trim: true 
    }],

    // Author Information
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    authorBio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters']
    },

    // Publisher Information
    publisher: {
      type: String,
      required: [true, 'Publisher is required'],
      trim: true,
    },
    publicationYear: { 
      type: Number,
      required: [true, 'Publication year is required'],
      min: [1000, 'Invalid publication year'],
      max: [new Date().getFullYear(), 'Publication year cannot be in future']
    },
    edition: {
      type: String,
      default: "First Edition"
    },

    // Pricing and Sales
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: "PKR",
      enum: ["PKR", "USD"]
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    // Book Details
    isbn: {
      type: String,
      trim: true,
      uppercase: true
    },
    language: { 
      type: String, 
      default: "English",
      enum: ["English", "Urdu", "Arabic"]
    },
    totalPages: {
      type: Number,
      required: [true, 'Total pages is required'],
      min: [1, 'Book must have at least 1 page']
    },

    // File Information
    coverImages: [{
      type: String,
      required: [true, 'Cover image is required']
    }],
    pdfFile: {
      type: String,
      required: [true, 'PDF file is required']
    },
    
    // Text Content (stored directly in database)
    textContent: {
      type: String,
      required: [true, 'Text content is required']
    },
    textFormat: {
      type: String,
      enum: ["plain", "html", "markdown"],
      default: "plain"
    },
    textLanguage: {
      type: String,
      default: "English"
    },

    // Ratings and Reviews
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    },

    // Sales and Popularity
    salesCount: {
      type: Number,
      default: 0
    },
    viewCount: {
      type: Number,
      default: 0
    },
    downloadCount: {
      type: Number,
      default: 0
    },

    // Approval System
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploaderType: {
      type: String,
      enum: ["admin", "superadmin"],
      required: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },

    // Features
    featured: {
      type: Boolean,
      default: false
    },
    bestseller: {
      type: Boolean,
      default: false
    },
    newRelease: {
      type: Boolean,
      default: true
    },

    // SEO
    slug: {
      type: String,
      lowercase: true
    },
    metaDescription: {
      type: String,
      maxlength: 160
    },

    // Text Content Statistics
    wordCount: {
      type: Number,
      default: 0
    },
    characterCount: {
      type: Number,
      default: 0
    },
    estimatedReadingTime: {
      type: Number, // in minutes
      default: 0
    },

    // Add a flag to prevent parallel saves
    _isCalculatingStats: {
      type: Boolean,
      default: false,
      select: false // Don't include in queries
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ==================== VIRTUAL PROPERTIES ====================

bookSchema.virtual('discountedPrice').get(function() {
  if (this.discountPercentage > 0) {
    return this.price - (this.price * this.discountPercentage / 100);
  }
  return this.price;
});

bookSchema.virtual('isOnSale').get(function() {
  return this.discountPercentage > 0;
});

bookSchema.virtual('isApproved').get(function() {
  return this.status === 'approved';
});

bookSchema.virtual('savingAmount').get(function() {
  if (this.discountPercentage > 0) {
    return this.price * this.discountPercentage / 100;
  }
  return 0;
});

// ==================== INDEXES ====================

bookSchema.index({ status: 1, createdAt: -1 });
bookSchema.index({ uploader: 1 });
bookSchema.index({ category: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ "averageRating": -1 });
bookSchema.index({ "salesCount": -1 });
bookSchema.index({ featured: -1 });
bookSchema.index({ bestseller: -1 });
bookSchema.index({ newRelease: -1 });
bookSchema.index({ slug: 1 });
bookSchema.index({ title: "text", description: "text", author: "text", textContent: "text" });

// ==================== METHODS ====================

// Text content methods - FIXED: Remove save() call to prevent parallel saves
bookSchema.methods.calculateTextStats = function() {
  if (this.textContent) {
    // Clean the text content for accurate counting
    const cleanText = this.textContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    this.wordCount = cleanText.split(/\s+/).filter(word => word.length > 0).length;
    this.characterCount = cleanText.length;
    this.estimatedReadingTime = Math.ceil(this.wordCount / 200); // 200 words per minute
  } else {
    this.wordCount = 0;
    this.characterCount = 0;
    this.estimatedReadingTime = 0;
  }
  
  // Don't call save() here - just update the fields
  return this;
};

bookSchema.methods.getPreview = function(characters = 500) {
  const plainText = this.textContent.replace(/<[^>]*>/g, '');
  return plainText.substring(0, characters) + (plainText.length > characters ? '...' : '');
};

// Approval methods - FIXED: Use updateOne to avoid parallel saves
bookSchema.methods.approve = async function(approvedByUserId) {
  return await this.constructor.updateOne(
    { _id: this._id },
    { 
      $set: { 
        status: 'approved',
        approvedBy: approvedByUserId,
        approvedAt: new Date(),
        rejectionReason: null
      }
    }
  );
};

bookSchema.methods.reject = async function(reason) {
  return await this.constructor.updateOne(
    { _id: this._id },
    { 
      $set: { 
        status: 'rejected',
        rejectionReason: reason,
        approvedBy: null,
        approvedAt: null
      }
    }
  );
};

// Statistics methods - FIXED: Use atomic updates
bookSchema.methods.incrementView = async function() {
  return await this.constructor.updateOne(
    { _id: this._id },
    { $inc: { viewCount: 1 } }
  );
};

bookSchema.methods.incrementDownload = async function() {
  return await this.constructor.updateOne(
    { _id: this._id },
    { $inc: { downloadCount: 1 } }
  );
};

bookSchema.methods.incrementPurchase = async function() {
  return await this.constructor.updateOne(
    { _id: this._id },
    { $inc: { salesCount: 1 } }
  );
};

// Rating methods - FIXED: Use atomic updates
bookSchema.methods.updateRating = async function(newRating) {
  const totalRating = (this.averageRating * this.reviewCount) + newRating;
  const newReviewCount = this.reviewCount + 1;
  const newAverageRating = totalRating / newReviewCount;
  
  return await this.constructor.updateOne(
    { _id: this._id },
    { 
      $set: { 
        averageRating: newAverageRating,
        reviewCount: newReviewCount
      }
    }
  );
};

// Safe save method to prevent parallel saves
bookSchema.methods.safeSave = async function(options = {}) {
  if (this._isCalculatingStats) {
    return this; // Skip if already calculating
  }
  
  this._isCalculatingStats = true;
  try {
    return await this.save(options);
  } finally {
    this._isCalculatingStats = false;
  }
};

// ==================== STATIC METHODS ====================

// Find approved books
bookSchema.statics.findApproved = function() {
  return this.find({ status: 'approved' });
};

// Find by uploader
bookSchema.statics.findByUploader = function(uploaderId) {
  return this.find({ uploader: uploaderId });
};

// Find bestsellers
bookSchema.statics.findBestsellers = function(limit = 10) {
  return this.find({ 
    status: 'approved', 
    bestseller: true 
  })
  .sort({ salesCount: -1 })
  .limit(limit);
};

// Find featured books
bookSchema.statics.findFeatured = function(limit = 10) {
  return this.find({ 
    status: 'approved', 
    featured: true 
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Search in text content
bookSchema.statics.searchInContent = function(query, limit = 10) {
  return this.find({
    status: 'approved',
    $text: { $search: query }
  })
  .sort({ score: { $meta: "textScore" } })
  .limit(limit);
};

// Bulk update text statistics for all books
bookSchema.statics.updateAllTextStats = async function() {
  const books = await this.find({});
  const updatePromises = books.map(async (book) => {
    book.calculateTextStats();
    return book.save();
  });
  
  return Promise.all(updatePromises);
};

// ==================== MIDDLEWARE ====================

// Generate slug before saving
bookSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Calculate text statistics before saving - FIXED: Remove the save() call
bookSchema.pre('save', function(next) {
  if (this.isModified('textContent') && !this._isCalculatingStats) {
    this.calculateTextStats();
  }
  next();
});

// Auto-approve if uploaded by superadmin
bookSchema.pre('save', function(next) {
  if (this.isNew && this.uploaderType === 'superadmin') {
    this.status = 'approved';
    this.approvedBy = this.uploader;
    this.approvedAt = new Date();
  }
  next();
});

// Post-save middleware to handle any post-processing
bookSchema.post('save', function(error, doc, next) {
  if (error && error.name === 'ParallelSaveError') {
    console.warn('Parallel save detected for book:', doc._id);
    // You can implement retry logic here if needed
  }
  next();
});

module.exports = mongoose.model("Book", bookSchema);