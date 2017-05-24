var express = require('express');
var router = express.Router();
var fight = require('../bin/fight');

/* GET home page. */
router.get('/', function(req, res, next) {
  let numberOfFights = parseInt(req.param('numberOfFights'), 10);
  if ( numberOfFights > 0 && numberOfFights <= 100 ){
    let fightResults = fight(numberOfFights);
    console.log(JSON.stringify(fightResults));
  }
  else {
    res.render('index', {title: 'BigBank Dragon fight', error: 'Number of fights is from 1 to 100'});
  }
});

module.exports = router;
