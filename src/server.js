require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const brandRoutes = require('./routes/brand.routes');
const adminRoutes = require('./routes/admin.routes');
const listingRoutes = require('./routes/listing.routes');
const auctionRoutes = require('./routes/auction.routes');
const watchlistRoutes = require('./routes/watchlist.routes');
const accountRoutes = require('./routes/account.routes');
const subscriptionPaymentRoutes = require('./routes/subscription-payment.routes');


//admins routes 
const adminPackageRoutes = require('./routes/admin/package.routes');
const packageRoutes = require('./routes/package.routes');

const adminSubscriptionRoutes = require('./routes/admin/subscription.routes');
const subscriptionRoutes = require('./routes/subscription.routes');



const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Admin API working',
  });
});

app.use('/api/device-tokens', require('./routes/device-token.routes'));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/notifications', require('./routes/notification.routes'));

app.get('/', (req, res) => {
  return res.json({
    success: true,
    message: 'Mawqed backend is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/auctions', watchlistRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/home-banners', require('./routes/home-banner.routes'));


app.use('/api/subscription-payments', subscriptionPaymentRoutes);


// admin routes
app.use('/api/admin',require('./routes/admin/listing.admin.routes'));

app.use('/api/admin/packages', adminPackageRoutes);
app.use('/api/packages', packageRoutes);

app.use('/api/admin/subscriptions', adminSubscriptionRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Mawqed backend running on port ${PORT}`);
});