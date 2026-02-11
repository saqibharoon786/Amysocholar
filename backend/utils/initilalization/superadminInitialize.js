const User = require('../../models/user.model');

const initSuperAdmin = async () => {
  try {
    const existingSuperAdmin = await User.findOne({
      role: 'superadmin',
      email: process.env.SUPERADMIN_EMAIL,
    });

    if (existingSuperAdmin) return;

    await User.create({
      firstName: process.env.SUPERADMIN_FIRST_NAME,
      lastName: process.env.SUPERADMIN_LAST_NAME,
      email: process.env.SUPERADMIN_EMAIL,
      password: process.env.SUPERADMIN_PASSWORD,
      phone: process.env.SUPERADMIN_PHONE,
      role: process.env.SUPERADMIN_ROLE || 'superadmin',
      isActive: true,
      emailVerified: true,
      isVerified: true,
    });

  } catch (error) {
    console.error('SuperAdmin init failed:', error.message);
  }
};

module.exports = initSuperAdmin;
