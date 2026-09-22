module.exports = {
  transaction: (req, res) => { console.log('BonusShop transaction:', req.body); res.json({ status: 'received', timestamp: new Date().toISOString() }); },
  affiliate: (req, res) => { console.log('BonusShop affiliate:', req.body); res.json({ status: 'received', timestamp: new Date().toISOString() }); },
  campaign: (req, res) => { console.log('BonusShop campaign:', req.body); res.json({ status: 'received', timestamp: new Date().toISOString() }); }
};
