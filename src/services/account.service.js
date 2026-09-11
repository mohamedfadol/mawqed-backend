const { serializeBigInt } = require('../utils/serializer');
const AccountRepository = require('../repositories/account.repository');

class AccountService {
  static format(data) {
    return serializeBigInt(data);
  }

  static async getMyBids(userId) {
    const bids = await AccountRepository.findMyBids(userId);

    return this.format(bids);
  }

  static async getWonAuctions(userId) {
    const auctions = await AccountRepository.findWonAuctions(userId);

    return this.format(auctions);
  }

  static async getSelling(userId) {
    const listings = await AccountRepository.findSelling(userId);

    return this.format(listings);
  }
}

module.exports = AccountService;