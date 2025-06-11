var express = require('express');
var router = express.Router();
const pool = require('../config/database');
const { getAWSStats } = require('../services/aws');

/* GET home page with database test */
router.get('/', async function(req, res, next) {
  try {
    const result = await pool.query('SELECT name, content FROM sections ORDER BY id');

    res.render('index', {
      title: 'NestEgg',
      sections: result.rows
    });
  } catch (err) {
    console.error('Database error:', err);
    res.render('index', {
      title: 'NestEgg',
      sections: []
    });
  }
});

router.get('/aws-stats', async (req, res) => {
  try {
    const stats = await getAWSStats();
    res.json(stats);
  } catch (error) {
    console.error('AWS Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch AWS stats' });
  }
});

module.exports = router;
