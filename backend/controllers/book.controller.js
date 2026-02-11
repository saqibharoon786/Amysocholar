const Book = require('../models/book.model');
const Purchase = require('../models/purchases.model');
const AppError = require('../utils/appError');

// Upload book (Admin and SuperAdmin)
const uploadBook = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      tags,
      author,
      authorBio,
      publisher,
      publicationYear,
      edition,
      price,
      currency,
      discountPercentage,
      isbn,
      language,
      totalPages,
      metaDescription,
      textContent,
      textFormat = 'plain',
      textLanguage = 'English'
    } = req.body;
    
    // Check if book with same title already exists
    const existingBook = await Book.findOne({ title });
    if (existingBook) {
      return next(new AppError('Book with this title already exists', 400));
    }

    // Parse tags if provided
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()) : [];

    // Handle cover images
    const coverImages = req.files?.coverImages ? 
      req.files.coverImages.map(file => `/uploads/covers/${file.filename}`) : [];

    if (coverImages.length === 0) {
      return next(new AppError('At least one cover image is required', 400));
    }

    // Check if PDF file is provided
    if (!req.files?.pdfFile) {
      return next(new AppError('PDF file is required', 400));
    }

    // Check if text content is provided
    if (!textContent) {
      return next(new AppError('Text content is required', 400));
    }

    const book = await Book.create({
      title,
      description,
      category,
      subcategory,
      tags: parsedTags,
      author,
      authorBio,
      publisher,
      publicationYear,
      edition,
      price,
      currency,
      discountPercentage,
      isbn,
      language,
      totalPages,
      metaDescription,
      textContent,
      textFormat,
      textLanguage,
      coverImages,
      pdfFile: `/uploads/pdfs/${req.files.pdfFile[0].filename}`,
      uploader: req.user.id,
      uploaderType: req.user.role === 'superadmin' ? 'superadmin' : 'admin'
    });

    // Calculate text statistics
    await book.calculateTextStats();

    res.status(201).json({
      success: true,
      message: 'Book uploaded successfully',
      data: { book },
    });
  } catch (error) {
    next(error);
  }
};

// Get all books (with filtering and pagination)
const getAllBooks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      author,
      language,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = 'approved'
    } = req.query;

    const query = { status };
    
    // Filtering
    if (category) query.category = category;
    if (author) query.author = { $regex: author, $options: 'i' };
    if (language) query.language = language;
    
    // Price range filtering
    if (minPrice || maxPrice) {
      query.$or = [
        { discountedPrice: {} },
        { price: {} }
      ];
      if (minPrice) {
        query.$or[0].discountedPrice.$gte = parseFloat(minPrice);
        query.$or[1].price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query.$or[0].discountedPrice.$lte = parseFloat(maxPrice);
        query.$or[1].price.$lte = parseFloat(maxPrice);
      }
    }
    
    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { textContent: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const books = await Book.find(query)
      .populate('uploader', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .select('-textContent') // Exclude large text content by default
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Book.countDocuments(query);

    res.status(200).json({
      success: true,
      data: { books },
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        results: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get approved books only
const getApprovedBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const books = await Book.find({ status: 'approved' })
      .populate('uploader', 'firstName lastName')
      .select('-textContent')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments({ status: 'approved' });

    res.status(200).json({
      success: true,
      data: { books },
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        results: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get book by ID
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('uploader', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    if (!book) {
      return next(new AppError('Book not found', 404));
    }

    // Only return approved books to public, or user's own books
    if (book.status !== 'approved' && 
        (!req.user || book.uploader._id.toString() !== req.user.id)) {
      return next(new AppError('Book not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { book },
    });
  } catch (error) {
    next(error);
  }
};

// Get my books (Admin only)
const getMyBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { uploader: req.user.id };
    if (status) query.status = status;

    const books = await Book.find(query)
      .populate('approvedBy', 'firstName lastName')
      .select('-textContent')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.status(200).json({
      success: true,
      data: { books },
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        results: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get pending books (Superadmin only)
const getPendingBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const books = await Book.find({ status: 'pending' })
      .populate('uploader', 'firstName lastName email')
      .select('-textContent')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      data: { books },
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        results: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update book (Admin only - only their own books, Superadmin only - only their own books)
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; 


console.log("The body is", updateData )
    
    
    
    const existingBook = await Book.findOne({
      _id: id,
      uploader: req.user.id,
      isDeleted: false
    });

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found or access denied',
      });
    }

    // Process specific fields that need transformation
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    // Convert number fields
    const numberFields = ['price', 'discountPercentage', 'totalPages', 'publicationYear'];
    numberFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateData[field] = Number(updateData[field]);
      }
    });

    // Convert boolean fields
    const booleanFields = ['featured', 'bestseller', 'newRelease'];
    booleanFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateData[field] = updateData[field] === 'true' || updateData[field] === true || updateData[field] === '1';
      }
    });

    // Handle file updates
    if (req.files?.coverImages) {
      updateData.coverImages = req.files.coverImages.map(file => `/uploads/covers/${file.filename}`);
    }
    if (req.files?.pdfFile) {
      updateData.pdfFile = `/uploads/pdfs/${req.files.pdfFile[0].filename}`;
    }

    // 2. Perform the actual update
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      updateData, // This applies the updates
      { new: true, runValidators: true } // Returns updated doc + validates data
    ).populate('uploader', 'firstName lastName');

    // Recalculate text statistics if text content was updated
    if (updateData.textContent) {
      await updatedBook.calculateTextStats();
      await updatedBook.save();
    }

    // 3. Return the properly updated book
    return res.status(200).json({
      success: true,
      updatedBook, // Consistent with frontend expectation
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// Delete book (Admin only - only their own books, Superadmin only - only their own books)
const deleteBook = async (req, res, next) => {
  try {
    // Find the book first to check ownership
    const existingBook = await Book.findById(req.params.id);
    
    if (!existingBook) {
      return next(new AppError('Book not found', 404));
    }

    // Check ownership - users can only delete their own books
    if (existingBook.uploader.toString() !== req.user.id) {
      return next(new AppError('You can only delete books uploaded by you', 403));
    }

    // Superadmin cannot delete admin's books - only their own
    if (req.user.role === 'superadmin' && existingBook.uploaderType === 'admin') {
      return next(new AppError('Superadmin cannot delete books uploaded by admin', 403));
    }

    const book = await Book.findOneAndDelete({
      _id: req.params.id,
      uploader: req.user.id
    });

    if (!book) {
      return next(new AppError('Book not found or access denied', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Approve book (Superadmin only) - Can approve any pending book
const approveBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return next(new AppError('Book not found', 404));
    }

    // Superadmin can approve any pending book (both admin and superadmin uploaded books)
    if (book.status !== 'pending') {
      return next(new AppError('Book is not pending approval', 400));
    }

    await book.approve(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Book approved successfully',
      data: { book },
    });
  } catch (error) {
    next(error);
  }
};

// Reject book (Superadmin only) - Can reject any pending book
const rejectBook = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return next(new AppError('Rejection reason is required', 400));
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return next(new AppError('Book not found', 404));
    }

    // Superadmin can reject any pending book (both admin and superadmin uploaded books)
    if (book.status !== 'pending') {
      return next(new AppError('Book is not pending approval', 400));
    }

    await book.reject(reason);

    res.status(200).json({
      success: true,
      message: 'Book rejected successfully',
      data: { book },
    });
  } catch (error) {
    next(error);
  }
};

// Get book preview
const getBookPreview = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).select('title author coverImages description price discountedPrice currency textContent');

    if (!book) {
      return next(new AppError('Book not found', 404));
    }

    // Return preview of text content
    const previewContent = book.getPreview(1000); // Get first 1000 characters

    const previewData = {
      book: {
        _id: book._id,
        title: book.title,
        author: book.author,
        coverImages: book.coverImages,
        description: book.description,
        price: book.price,
        discountedPrice: book.discountedPrice,
        currency: book.currency
      },
      previewContent,
      wordCount: book.wordCount,
      estimatedReadingTime: book.estimatedReadingTime
    };

    res.status(200).json({
      success: true,
      data: previewData,
    });
  } catch (error) {
    next(error);
  }
};

// Purchase book
const purchaseBook = async (req, res, next) => {
  try {
    const { format = 'pdf', paymentMethod } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) {
      return next(new AppError('Book not found', 404));
    }

    if (book.status !== 'approved') {
      return next(new AppError('This book is not available for purchase', 400));
    }

    // Check if already purchased
    const existingPurchase = await Purchase.findOne({
      user: req.user.id,
      book: book._id,
      paymentStatus: 'completed'
    });
    if (existingPurchase) {
      return next(new AppError('You have already purchased this book', 400));
    }

    // Calculate amount - text format is free, PDF is paid
    let amount = 0;
    if (format === 'pdf') {
      amount = book.discountedPrice || book.price;
    }

    // Create purchase record
    const purchase = await Purchase.create({
      user: req.user.id,
      book: book._id,
      type: 'book',
      format,
      amount,
      paymentMethod: paymentMethod || 'bank',
      paymentStatus: 'pending',
      transactionId: `BOOK_${Date.now()}_${req.user.id}`,
      paymentDetails: {
        method: paymentMethod || 'bank',
        amount,
        currency: book.currency,
        status: 'pending',
        timestamp: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Book purchase initiated',
      data: { purchase },
    });
  } catch (error) {
    next(error);
  }
};

const readFullBook = async (req, res, next) => {
  try {
    const { format = 'text' } = req.query;
    
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return next(new AppError('Book not found', 404));
    }

    // Check if user has purchased the book for PDF format
    if (format === 'pdf') {
      // For PDF, check if user is authenticated
      if (!req.user) {
        return next(new AppError('Authentication required for PDF format', 401));
      }
      
      const purchase = await Purchase.findOne({
        user: req.user.id,
        book: book._id,
        paymentStatus: 'completed'
      });

      if (!purchase) {
        return next(new AppError('Please purchase this book to access PDF format', 403));
      }

      await book.incrementDownload();
    }

    // Text format is always accessible (no authentication required)
    const responseData = {
      book: {
        _id: book._id,
        title: book.title,
        author: book.author
      },
      format,
      isFree: format === 'text',
      totalPages: book.totalPages,
      wordCount: book.wordCount,
      estimatedReadingTime: book.estimatedReadingTime
    };

    // Include appropriate content based on format
    if (format === 'text') {
      responseData.textContent = book.textContent;
      responseData.textFormat = book.textFormat;
    } else if (format === 'pdf') {
      responseData.filePath = book.pdfFile;
    }

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('Error in readFullBook:', error);
    next(error);
  }
};

// Check purchase status
const checkPurchaseStatus = async (req, res, next) => {
  try {
    const purchase = await Purchase.findOne({
      user: req.user.id,
      book: req.params.id,
      paymentStatus: 'completed'
    });

    res.status(200).json({
      success: true,
      data: {
        hasPurchased: !!purchase,
        purchase,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get my purchased books
const getMyPurchasedBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const purchases = await Purchase.find({
      user: req.user.id,
      type: 'book',
      paymentStatus: 'completed'
    })
      .populate({
        path: 'book',
        select: '-textContent' // Exclude large text content
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Purchase.countDocuments({
      user: req.user.id,
      type: 'book',
      paymentStatus: 'completed'
    });

    res.status(200).json({
      success: true,
      data: { purchases },
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        results: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Search books with full-text search
const searchBooks = async (req, res, next) => {
  try {
    const { q, category, author, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    const query = { status: 'approved' };
    
    if (q) {
      query.$text = { $search: q };
    }
    if (category) query.category = category;
    if (author) query.author = { $regex: author, $options: 'i' };
    
    if (minPrice || maxPrice) {
      query.$or = [
        { discountedPrice: {} },
        { price: {} }
      ];
      if (minPrice) {
        query.$or[0].discountedPrice.$gte = parseFloat(minPrice);
        query.$or[1].price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query.$or[0].discountedPrice.$lte = parseFloat(maxPrice);
        query.$or[1].price.$lte = parseFloat(maxPrice);
      }
    }

    const books = await Book.find(query)
      .select('-textContent')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.status(200).json({
      success: true,
      data: { books },
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        results: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get books by category
const getBooksByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const books = await Book.find({ 
      category, 
      status: 'approved' 
    })
      .select('-textContent')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments({ category, status: 'approved' });

    res.status(200).json({
      success: true,
      data: { books },
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        results: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get featured books
const getFeaturedBooks = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const books = await Book.find({ 
      status: 'approved', 
      featured: true 
    })
      .select('-textContent')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { books },
    });
  } catch (error) {
    next(error);
  }
};

// Get bestseller books
const getBestsellerBooks = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const books = await Book.find({ 
      status: 'approved', 
      bestseller: true 
    })
      .select('-textContent')
      .sort({ salesCount: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: { books },
    });
  } catch (error) {
    next(error);
  }
};

// Get new releases
const getNewReleases = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const books = await Book.find({ 
      status: 'approved', 
      newRelease: true 
    })
      .select('-textContent')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { books },
    });
  } catch (error) {
    next(error);
  }
};

// Increment view count
const incrementViewCount = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return next(new AppError('Book not found', 404));
    }

    await book.incrementView();

    res.status(200).json({
      success: true,
      message: 'View count updated',
    });
  } catch (error) {
    next(error);
  }
};

// Update book rating
const updateBookRating = async (req, res, next) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError('Please provide a valid rating between 1 and 5', 400));
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return next(new AppError('Book not found', 404));
    }

    // Check if user has purchased the book
    const purchase = await Purchase.findOne({
      user: req.user.id,
      book: book._id,
      paymentStatus: 'completed'
    });

    if (!purchase) {
      return next(new AppError('You must purchase the book before rating', 403));
    }

    await book.updateRating(parseFloat(rating));

    res.status(200).json({
      success: true,
      message: 'Rating updated successfully',
      data: { 
        averageRating: book.averageRating,
        reviewCount: book.reviewCount 
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all available categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Book.distinct("category", { status: "approved" });
    
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message
    });
  }
};

// Get popular categories with book counts
const getPopularCategories = async (req, res) => {
  try {
    const popularCategories = await Book.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: "$category",
          bookCount: { $sum: 1 },
          totalViews: { $sum: "$viewCount" }
        }
      },
      { $sort: { bookCount: -1, totalViews: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: popularCategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching popular categories",
      error: error.message
    });
  }
};

module.exports = {
  uploadBook,
  approveBook,
  rejectBook,
  getAllBooks,
  getApprovedBooks,
  getBookById,
  getMyBooks,
  getPendingBooks,
  updateBook,
  deleteBook,
  getBookPreview,
  purchaseBook,
  getMyPurchasedBooks,
  readFullBook,
  checkPurchaseStatus,
  searchBooks,
  getBooksByCategory,
  getFeaturedBooks,
  getBestsellerBooks,
  getNewReleases,
  incrementViewCount,
  updateBookRating,
  getAllCategories,
  getPopularCategories
};