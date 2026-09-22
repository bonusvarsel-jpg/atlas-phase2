module.exports = {
  announce: (req, res) => { console.log('BonusVarsel announce:', req.body); res.json({ status: 'received', timestamp: new Date().toISOString() }); },
  metrics: (req, res) => { console.log('BonusVarsel metrics:', req.body); res.json({ status: 'received', timestamp: new Date().toISOString() }); },
  alert: (req, res) => { console.log('BonusVarsel alert:', req.body); res.json({ status: 'received', timestamp: new Date().toISOString() }); }
};
