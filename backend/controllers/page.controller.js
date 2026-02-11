const Page = require('../models/page.model');
const AppError = require('../utils/appError');

// Create page (Superadmin only)
const createPage = async (req, res, next) => {
  try {
    const { title, content, type, metaTitle, metaDescription, sortOrder = 0 } = req.body;

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const page = await Page.create({
      title,
      slug,
      content,
      type,
      metaTitle: metaTitle || title,
      metaDescription,
      sortOrder,
    });

    res.status(201).json({
      success: true,
      message: 'Page created successfully',
      data: { page },
    });
  } catch (error) {
    next(error);
  }
};

// Update page (Superadmin only)
const updatePage = async (req, res, next) => {
  try {
    const { title, content, type, metaTitle, metaDescription, isActive, sortOrder } = req.body;

    const updateData = {};
    if (title) {
      updateData.title = title;
      // Regenerate slug if title changes
      updateData.slug = title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }
    if (content !== undefined) updateData.content = content;
    if (type) updateData.type = type;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const page = await Page.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!page) {
      return next(new AppError('Page not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Page updated successfully',
      data: { page },
    });
  } catch (error) {
    next(error);
  }
};

// Delete page (Superadmin only)
const deletePage = async (req, res, next) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);

    if (!page) {
      return next(new AppError('Page not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Page deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get all pages
const getAllPages = async (req, res, next) => {
  try {
    const { type, isActive, page = 1, limit = 10 } = req.query;

    const query = {};
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const pages = await Page.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ sortOrder: 1, createdAt: -1 });

    const total = await Page.countDocuments(query);

    res.status(200).json({
      success: true,
      data: { pages },
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

// Get page by ID
const getPageById = async (req, res, next) => {
  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      return next(new AppError('Page not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { page },
    });
  } catch (error) {
    next(error);
  }
};

// Get page by slug
const getPageBySlug = async (req, res, next) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug, isActive: true });

    if (!page) {
      return next(new AppError('Page not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { page },
    });
  } catch (error) {
    next(error);
  }
};

// Get pages by type
const getPagesByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const pages = await Page.find({ type, isActive: true }).sort({ sortOrder: 1 });

    res.status(200).json({
      success: true,
      data: { pages },
    });
  } catch (error) {
    next(error);
  }
};

// Toggle page status (Superadmin only)
const togglePageStatus = async (req, res, next) => {
  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      return next(new AppError('Page not found', 404));
    }

    page.isActive = !page.isActive;
    await page.save();

    res.status(200).json({
      success: true,
      message: `Page ${page.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { page },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPage,
  updatePage,
  deletePage,
  getAllPages,
  getPageById,
  getPageBySlug,
  getPagesByType,
  togglePageStatus,
};