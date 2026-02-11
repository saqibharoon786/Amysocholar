const cron = require('node-cron');
const PayoutService = require('../services/payout.service');

// Schedule auto-payouts
const setupCronJobs = () => {
  console.log('Setting up cron jobs...');
  
  // Daily auto-payouts at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running daily auto-payouts...');
    try {
      const results = await PayoutService.processAllAutoPayouts();
      console.log('Auto-payouts completed:', results);
    } catch (error) {
      console.error('Auto-payout cron job error:', error);
    }
  });
  
  // Weekly auto-payouts every Monday at 3:00 AM
  cron.schedule('0 3 * * 1', async () => {
    console.log('Running weekly auto-payouts...');
    // Additional weekly processing if needed
  });
  
  // Monthly auto-payouts on 1st of month at 4:00 AM
  cron.schedule('0 4 1 * *', async () => {
    console.log('Running monthly auto-payouts...');
    // Additional monthly processing if needed
  });
  
  console.log('Cron jobs scheduled');
};

module.exports = setupCronJobs;