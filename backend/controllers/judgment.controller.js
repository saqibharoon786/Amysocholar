const fs = require('fs');
const path = require('path');
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
      currency = 'PKR',
      textContent
    } = req.body;

    // Check if judgment already exists
    const existingJudgment = await Judgment.findOne({ citation });
    if (existingJudgment) {
      return next(new AppError('Judgment with this citation already exists', 409));
    }

    // PDF is required
    const pdfPath = req.files?.pdfFile?.[0] ? `/uploads/pdfs/${req.files.pdfFile[0].filename}` : null;
    if (!pdfPath) {
      return next(new AppError('PDF file is required', 400));
    }

    // Resolve textFile: either uploaded file or create from textContent
    let textFilePath = req.files?.textFile?.[0] ? `/uploads/texts/${req.files.textFile[0].filename}` : null;
    if (!textFilePath && textContent && String(textContent).trim()) {
      const textsDir = path.join(__dirname, '../uploads/texts');
      if (!fs.existsSync(textsDir)) {
        fs.mkdirSync(textsDir, { recursive: true });
      }
      const safeCitation = (citation || 'judgment').replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 50);
      const filename = `text-${safeCitation}-${Date.now()}.txt`;
      const filePath = path.join(textsDir, filename);
      fs.writeFileSync(filePath, String(textContent).trim(), 'utf8');
      textFilePath = `/uploads/texts/${filename}`;
    }
    if (!textFilePath) {
      return next(new AppError('Text content or text file is required. Add judgment text in the content field or upload a text file.', 400));
    }

    // ✅ UPDATED: Process cover images with relative paths like book controller
    const coverImages = req.files?.coverImages ?
      req.files.coverImages.map(file => `/uploads/covers/${file.filename}`) : [];

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
      pdfFile: pdfPath,
      textFile: textFilePath,
      coverImages,
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
      'keywords', 'summary', 'price', 'currency', 'isFeatured'
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

    // ✅ UPDATED: Handle file updates with relative paths
    if (req.files?.pdfFile) {
      updateData.pdfFile = `/uploads/pdfs/${req.files.pdfFile[0].filename}`;
    }
    if (req.files?.textFile) {
      updateData.textFile = `/uploads/texts/${req.files.textFile[0].filename}`;
    }

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

    // Only SafePay is supported
    const paymentMethod = req.body.paymentMethod || 'safepay';
    if (paymentMethod !== 'safepay') {
      return next(new AppError('Only SafePay is accepted for payment', 400));
    }

    // Create purchase record
    const purchase = await Purchase.create({
      user: req.user.id,
      judgment: judgment._id,
      type: 'judgment',
      format: 'pdf',
      amount: judgment.price,
      paymentMethod: 'safepay',
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
    // Just return the text file path or content

    res.status(200).json({
      success: true,
      data: {
        judgment,
        textFile: judgment.textFile,
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