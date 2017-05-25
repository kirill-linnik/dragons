const express = require('express');
const router = express.Router();
const fight = require('../bin/fightEngine');
const fightStatistics = require('../bin/fightStatistics');

router.get('/', function(req, res, next) {
  let numberOfFights = parseInt(req.query.numberOfFights, 10);
  if ( numberOfFights > 0 && numberOfFights <= fight.maximumNumberOfFights ){
    fight.fight(numberOfFights).then(fightResults => {
      let statistics = fightStatistics(fightResults);
      res.render('fight', {title: 'BigBank Dragon fight results', fightResults: fightResults, fightStatistics: statistics});
    }).catch(err => {
      res.render('index', {title: 'BigBank Dragon fight', error: JSON.stringify(err), maximumNumberOfFights: fight.maximumNumberOfFights});
    });
  }
  else {
    res.render('index', {title: 'BigBank Dragon fight', error: 'Number of fights is from 1 to', maximumNumberOfFights: fight.maximumNumberOfFights});
  }
});

module.exports = router;
