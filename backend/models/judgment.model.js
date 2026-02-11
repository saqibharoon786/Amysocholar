// models/judgment.model.js
const mongoose = require("mongoose");

const judgmentSchema = new mongoose.Schema(
  {
    // Case Information
    citation: {
      type: String,
      trim: true,
    },
    caseNumber: {
      type: String,
      trim: true,
    },
    parties: {
      type: String,
      trim: true,
    },
    caseTitle: {
      type: String,
      trim: true,
    },

    // Court Information
    court: {
      type: String,
    },
    judge: {
      type: String,
      trim: true,
    },

    // Case Details
    caseType: {
      type: String,
    },
    category: {
      type: String,
    },
    year: {
      type: Number,
    },
    decisionDate: {
      type: Date,
    },

    // Legal Information
    keywords: [String],
    summary: {
      type: String,
    },

    // File Information
    pdfFile: {
      type: String,
    },
    
    // ✅ CHANGED: Replaced textFile with textContent and textFormat
    textContent: {
      type: String,
    },
    textFormat: {
      type: String,
      enum: ["plain", "html", "markdown"],
      default: "plain"
    },
    
    // ✅ ADDED: Cover Images
    coverImages: [{
      type: String,
      trim: true
    }],

    // Pricing
    price: {
      type: Number,
    },
    currency: {
      type: String,
      default: "PKR",
    },

    // Upload Information (Only superadmin)
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Statistics
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    purchases: {
      type: Number,
      default: 0,
    },

    // Additional Info
    isFeatured: {
      type: Boolean,
      default: false,
    }
  },
  { 
    timestamps: true
  }
);

// Indexes
// judgmentSchema.index({ citation: 1 });
// judgmentSchema.index({ court: 1, year: -1 });
// judgmentSchema.index({ caseType: 1 });
// judgmentSchema.index({ category: 1 });
// judgmentSchema.index({ year: -1 });
// judgmentSchema.index({ uploader: 1 });
// judgmentSchema.index({ isFeatured: -1 });

// Virtual for full case info
judgmentSchema.virtual('fullCaseInfo').get(function() {
  return `${this.citation} - ${this.court} (${this.year})`;
});

// Method to get primary cover image
judgmentSchema.methods.getPrimaryCover = function() {
  return this.coverImages.length > 0 ? this.coverImages[0] : null;
};

// Method to increment views
judgmentSchema.methods.incrementView = function() {
  this.views += 1;
  return this.save();
};

// Method to increment purchases
judgmentSchema.methods.incrementPurchase = function() {
  this.purchases += 1;
  return this.save();
};

// Static method to get judgments by year range
judgmentSchema.statics.findByYearRange = function(startYear, endYear) {
  return this.find({
    year: { $gte: startYear, $lte: endYear }
  }).sort({ year: -1 });
};

// Static method to get featured judgments
judgmentSchema.statics.getFeatured = function() {
  return this.find({ isFeatured: true })
    .sort({ year: -1 })
    .limit(10);
};

module.exports = mongoose.model("Judgment", judgmentSchema);