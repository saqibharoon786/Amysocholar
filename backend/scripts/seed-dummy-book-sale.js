/**
 * Dummy book sale seed – Superadmin ko admin ki payment details verify karne ke liye.
 * Run from backend: node -r dotenv/config scripts/seed-dummy-book-sale.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Purchase = require('../models/purchases.model');
const Book = require('../models/book.model');
const User = require('../models/user.model');

const MONGO_URI = process.env.MONGO;
if (!MONGO_URI) {
  console.error('❌ MONGO missing in .env');
  process.exit(1);
}

async function seedDummyBookSale() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ DB connected\n');

  const admin = await User.findOne({ role: 'admin' }).select('+password');
  if (!admin) {
    console.error('❌ Koi admin user nahi mila. Pehle admin create karo.');
    await mongoose.disconnect();
    process.exit(1);
  }

  const book = await Book.findOne({ uploader: admin._id });
  if (!book) {
    console.error('❌ Is admin ki koi book nahi mili. Pehle admin se koi book upload karwao.');
    await mongoose.disconnect();
    process.exit(1);
  }

  let customer = await User.findOne({ role: 'customer' });
  if (!customer) {
    customer = await User.findOne({ role: { $ne: 'superadmin' } });
  }
  if (!customer) {
    console.error('❌ Koi customer/user nahi mila.');
    await mongoose.disconnect();
    process.exit(1);
  }

  const hasPaymentInfo =
    (admin.wallet?.paymentInfo?.jazzcashNumber) ||
    (admin.wallet?.paymentInfo?.easypaisaNumber) ||
    (admin.wallet?.paymentInfo?.bankAccount?.accountNumber) ||
    (admin.wallet?.paymentInfo?.bankAccount?.iban);

  if (!hasPaymentInfo) {
    if (!admin.wallet) admin.wallet = {};
    if (!admin.wallet.paymentInfo) admin.wallet.paymentInfo = {};
    if (!admin.wallet.paymentInfo.bankAccount) admin.wallet.paymentInfo.bankAccount = {};
    admin.wallet.paymentInfo.jazzcashNumber = '03001234567';
    admin.wallet.paymentInfo.bankAccount.accountTitle = 'Test Admin';
    admin.wallet.paymentInfo.bankAccount.accountNumber = '1234567890';
    admin.wallet.paymentInfo.bankAccount.bankName = 'HBL';
    admin.wallet.paymentInfo.bankAccount.iban = 'PK00HBL0001234567890123';
    await admin.save();
    console.log('✅ Admin par dummy payment details set ki (JazzCash + Bank) – ab superadmin ko dikhengi.\n');
  } else {
    console.log('✅ Admin ke paas pehle se payment details hain – wohi superadmin ko dikhengi.\n');
  }

  const amount = 500;
  const commissionPct = 10;
  const superadminAmount = Math.round((amount * commissionPct) / 100);
  const sellerAmount = amount - superadminAmount;

  const purchase = await Purchase.create({
    user: customer._id,
    book: book._id,
    type: 'book',
    format: 'pdf',
    amount,
    paymentMethod: 'safepay',
    paymentStatus: 'completed',
    seller: admin._id,
    sellerType: 'admin',
    transactionId: `DUMMY_BOOK_${Date.now()}_${customer._id}`,
    commission: {
      sellerAmount,
      superadminAmount,
      commissionPercentage: commissionPct,
    },
    paymentDetails: {
      method: 'safepay',
      amount,
      currency: 'PKR',
      status: 'completed',
      timestamp: new Date(),
    },
    earningsStatus: 'processed',
  });

  console.log('✅ Dummy book sale create ho gayi:');
  console.log('   Purchase ID:', purchase._id);
  console.log('   Book:', book.title);
  console.log('   Admin (seller):', admin.firstName, admin.lastName);
  console.log('   Buyer:', customer.firstName, customer.lastName);
  console.log('   Amount:', amount, 'PKR\n');

  const purchases = await Purchase.find({ _id: purchase._id })
    .populate('user', 'firstName lastName email')
    .populate('book judgment')
    .populate('seller', 'firstName lastName email role wallet')
    .populate('payment')
    .lean();

  const p = purchases[0];
  const seller = p?.seller;
  const wallet = seller?.wallet;
  const paymentInfo = wallet?.paymentInfo;

  console.log('--- VERIFICATION: Kya superadmin ko admin ki payment details ja rahi hain? ---');
  if (!seller) {
    console.log('❌ Seller populate nahi hua.');
  } else {
    console.log('✅ Seller populated:', seller.firstName, seller.lastName, seller.email);
    if (!wallet) {
      console.log('❌ seller.wallet nahi aaya – API mein wallet include karo.');
    } else {
      console.log('✅ seller.wallet aaya.');
      if (!paymentInfo) {
        console.log('⚠️ seller.wallet.paymentInfo empty (admin ne abhi save nahi ki thi).');
      } else {
        console.log('✅ seller.wallet.paymentInfo aaya:');
        if (paymentInfo.jazzcashNumber) console.log('   JazzCash:', paymentInfo.jazzcashNumber);
        if (paymentInfo.easypaisaNumber) console.log('   EasyPaisa:', paymentInfo.easypaisaNumber);
        const ba = paymentInfo.bankAccount;
        if (ba && (ba.accountNumber || ba.iban)) {
          console.log('   Bank:', ba.accountTitle, ba.accountNumber, ba.bankName, ba.iban);
        }
        console.log('\n✅ Confirm: Superadmin ko admin ki payment details ja rahi hain.\n');
      }
    }
  }

  await mongoose.disconnect();
  console.log('Done. Ab superadmin panel → Admin Book Sales pe jao, dummy sale aur Bank details dikhni chahiye.');
  process.exit(0);
}

seedDummyBookSale().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
