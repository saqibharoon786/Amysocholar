const Judgment = require('../models/judgment.model');
const Purchase = require('../models/purchases.model');
const AppError = require('../utils/appError');

// Upload judgment (Superadmin only)
const uploadJudgment = async (req, res, next) => {
  try {
    const {
      citation,
      caseNumber,
      parties,
      caseTitle,
      court,
      judge,
      caseType,
      category,
      year,
      decisionDate,
      keywords,
      summary,
      price,
      textContent,
      textFormat = 'plain',
      currency = 'PKR'
    } = req.body;

    // Check if judgment already exists
    const existingJudgment = await Judgment.findOne({ citation });
    if (existingJudgment) {
      return next(new AppError('Judgment with this citation already exists', 400));
    }

    // ✅ UPDATED: Process cover images with relative paths
    const coverImages = req.files?.coverImages ? 
      req.files.coverImages.map(file => `/uploads/covers/${file.filename}`) : [];

    // Create judgment
    const judgment = await Judgment.create({
      citation,
      caseNumber,
      parties,
      caseTitle,
      court,
      judge,
      caseType,
      category,
      year,
      decisionDate,
      keywords: keywords ? keywords.split(',').map(k => k.trim()).filter(k => k) : [],
      summary,
      price,
      currency,
      // ✅ UPDATED: Use textContent and textFormat instead of textFile
      textContent,
      textFormat,
      pdfFile: req.files?.pdfFile?.[0] ? `/uploads/pdfs/${req.files.pdfFile[0].filename}` : null,
      coverImages, // ✅ UPDATED: Save cover images with relative paths
      uploader: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Judgment uploaded successfully',
      data: { judgment },
    });
  } catch (error) {
    next(error);
  }
};

// Get all judgments
const getAllJudgments = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      court,
      caseType,
      category,
      year,
      search,
      sortBy = 'year',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    // Filtering
    if (court) query.court = court;
    if (caseType) query.caseType = caseType;
    if (category) query.category = category;
    if (year) query.year = parseInt(year);
    
    // Search
    if (search) {
      query.$or = [
        { citation: { $regex: search, $options: 'i' } },
        { caseTitle: { $regex: search, $options: 'i' } },
        { parties: { $regex: search, $options: 'i' } },
        { judge: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const judgments = await Judgment.find(query)
      .populate('uploader', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Judgment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: { judgments },
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

// Get judgment by ID
const getJudgmentById = async (req, res, next) => {
  try {
    const judgment = await Judgment.findById(req.params.id)
      .populate('uploader', 'firstName lastName');

    if (!judgment) {
      return next(new AppError('Judgment not found', 404));
    }

    // Increment view count
    await judgment.incrementView();

    res.status(200).json({
      success: true,
      data: { judgment },
    });
  } catch (error) {
    next(error);
  }
};

// Update judgment (Superadmin only)
const updateJudgment = async (req, res, next) => {
  try {
    const allowedFields = [
      'citation', 'caseNumber', 'parties', 'caseTitle', 'court',
      'judge', 'caseType', 'category', 'year', 'decisionDate',
      'keywords', 'summary', 'price', 'currency', 'textContent',
      'textFormat', 'isFeatured'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'keywords' && typeof req.body[field] === 'string') {
          updateData[field] = req.body[field].split(',').map(k => k.trim()).filter(k => k);
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    // ✅ UPDATED: Handle cover images update with relative paths
    if (req.files?.coverImages) {
      updateData.coverImages = req.files.coverImages.map(file => `/uploads/covers/${file.filename}`);
    }

    // ✅ UPDATED: Handle PDF file update with relative paths
    if (req.files?.pdfFile) {
      updateData.pdfFile = `/uploads/pdfs/${req.files.pdfFile[0].filename}`;
    }
    // Note: No textFile handling since we now use textContent and textFormat

    const judgment = await Judgment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!judgment) {
      return next(new AppError('Judgment not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Judgment updated successfully',
      data: { judgment },
    });
  } catch (error) {
    next(error);
  }
};

// Delete judgment (Superadmin only)
const deleteJudgment = async (req, res, next) => {
  try {
    const judgment = await Judgment.findByIdAndDelete(req.params.id);

    if (!judgment) {
      return next(new AppError('Judgment not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Judgment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get judgments by court
const getJudgmentsByCourt = async (req, res, next) => {
  try {
    const { court } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const judgments = await Judgment.find({ court })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ year: -1 });

    const total = await Judgment.countDocuments({ court });

    res.status(200).json({
      success: true,
      data: { judgments },
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

// Get judgments by year
const getJudgmentsByYear = async (req, res, next) => {
  try {
    const { year } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const judgments = await Judgment.find({ year: parseInt(year) })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Judgment.countDocuments({ year: parseInt(year) });

    res.status(200).json({
      success: true,
      data: { judgments },
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

// Get judgments by category
const getJudgmentsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const judgments = await Judgment.find({ category })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ year: -1 });

    const total = await Judgment.countDocuments({ category });

    res.status(200).json({
      success: true,
      data: { judgments },
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

// Search judgments
const searchJudgments = async (req, res, next) => {
  try {
    const { q, court, category, yearFrom, yearTo } = req.query;
    const { page = 1, limit = 10 } = req.query;

    const query = {};
    
    if (q) {
      query.$or = [
        { citation: { $regex: q, $options: 'i' } },
        { caseTitle: { $regex: q, $options: 'i' } },
        { parties: { $regex: q, $options: 'i' } },
        { judge: { $regex: q, $options: 'i' } },
        { summary: { $regex: q, $options: 'i' } },
        { textContent: { $regex: q, $options: 'i' } }, // ✅ ADDED: Search in textContent
      ];
    }

    if (court) query.court = court;
    if (category) query.category = category;
    if (yearFrom || yearTo) {
      query.year = {};
      if (yearFrom) query.year.$gte = parseInt(yearFrom);
      if (yearTo) query.year.$lte = parseInt(yearTo);
    }

    const judgments = await Judgment.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ year: -1 });

    const total = await Judgment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: { judgments },
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

// Get featured judgments
const getFeaturedJudgments = async (req, res, next) => {
  try {
    const judgments = await Judgment.getFeatured();

    res.status(200).json({
      success: true,
      data: { judgments },
    });
  } catch (error) {
    next(error);
  }
};

// Purchase judgment
const purchaseJudgment = async (req, res, next) => {
  try {
    const judgment = await Judgment.findById(req.params.id);
    
    if (!judgment) {
      return next(new AppError('Judgment not found', 404));
    }

    // Check if already purchased
    const existingPurchase = await Purchase.findOne({
      user: req.user.id,
      judgment: judgment._id,
      paymentStatus: 'completed'
    });

    if (existingPurchase) {
      return next(new AppError('You have already purchased this judgment', 400));
    }

    // Create purchase record
    const purchase = await Purchase.create({
      user: req.user.id,
      judgment: judgment._id,
      type: 'judgment',
      format: 'pdf', // PDF format is paid
      amount: judgment.price,
      paymentMethod: req.body.paymentMethod || 'bank',
      paymentStatus: 'pending',
      transactionId: `JUD_${Date.now()}_${req.user.id}`,
    });

    // Increment judgment purchase count
    await judgment.incrementPurchase();

    res.status(201).json({
      success: true,
      message: 'Judgment purchase initiated',
      data: { purchase },
    });
  } catch (error) {
    next(error);
  }
};

// Read judgment (text format - free)
const readJudgment = async (req, res, next) => {
  try {
    const judgment = await Judgment.findById(req.params.id);
    
    if (!judgment) {
      return next(new AppError('Judgment not found', 404));
    }

    // For text format, it's free - no purchase required
    // Return the text content directly
    res.status(200).json({
      success: true,
      data: {
        judgment: {
          ...judgment.toObject(),
          // Include only text content and format for reading
          textContent: judgment.textContent,
          textFormat: judgment.textFormat
        },
        format: 'text',
        isFree: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get my purchased judgments
const getMyPurchasedJudgments = async (req, res, next) => {
  try {
    const purchases = await Purchase.find({
      user: req.user.id,
      type: 'judgment',
      paymentStatus: 'completed'
    }).populate('judgment');

    res.status(200).json({
      success: true,
      data: { purchases },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadJudgment,
  getAllJudgments,
  getJudgmentById,
  updateJudgment,
  deleteJudgment,
  getJudgmentsByCourt,
  getJudgmentsByYear,
  getJudgmentsByCategory,
  searchJudgments,
  getFeaturedJudgments,
  purchaseJudgment,
  readJudgment,
  getMyPurchasedJudgments,
};