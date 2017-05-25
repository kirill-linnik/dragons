const express = require('express');
const router = express.Router();
const fight = require('../bin/fightEngine');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'BigBank Dragon fight', maximumNumberOfFights: fight.maximumNumberOfFights });
});

module.exports = router;
