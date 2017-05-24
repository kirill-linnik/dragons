const rp = require('request-promise');
const xml2js = require('xml2js');

const knightToDragonStats = {
  'attack': 'scaleThickness',
  'armor': 'clawSharpness',
  'agility': 'wingStrength',
  'endurance': 'fireBreath'
};

let gameStatistics = new Array();

function fight(numberOfFights){
  gameStatistics = new Array();
  let games = new Array();
  for ( let i = 0; i < numberOfFights; i++ ){
    let game = getGame();
    games.push(game);
  }

  Promise.all(games);
  return gameStatistics;
};

function getGame(){
  let options = {
    uri: 'http://www.dragonsofmugloar.com/api/game',
    json: true,
    async: false
  };

  return rp(options)
    .then(game => getWeather(game))
    .catch(err => console.log(err));
}

function getWeather(game){
  let options = {
    uri: `http://www.dragonsofmugloar.com/weather/api/report/${game.gameId}`,
    async: false
  };

  return rp(options)
    .then(xmlString =>
      xml2js.parseString(xmlString, (err, weather) =>
        performFight(game, weather)
      )
    )
    .catch(err => {
      console.log(err);
      return {
        game: game,
        err: err
      };
    });
}

function performFight(game, weather){
  let knight = game.knight;
  let weatherCode = weather.report.code[0];
  let dragon = getDragonStats(knight, weatherCode);
  let options = {
    method: 'PUT',
    uri: `http://www.dragonsofmugloar.com/api/game/${game.gameId}/solution`,
    body: {
      dragon: dragon
    },
    json: true,
    async: false
  };

  return rp(options)
    .then(gameResult => {
      gameStatistics.push({
        game: game,
        weather: weather,
        dragon: dragon,
        result: gameResult
      });
    })
    .catch(err => {
      console.log(err);
      gameStatistics.push({
        game: game,
        weather: weather,
        dragon: dragon,
        err: err
      });
    });
}

function getDragonStats(knight, weatherCode){
  let dragon = {
    scaleThickness: 5,
    clawSharpness: 5,
    wingStrength: 5,
    fireBreath: 5
  };
  switch (weatherCode) {
    case 'FUNDEFINEDG': // fog, an automatic win
      break;
    case 'HVA': // heavy rain, we need sharp claws
      dragon.fireBreath = 0;
      dragon.clawSharpness = 10;
      dragon.scaleThickness = 10;
      dragon.wingStrength = 0;
      break;
    case 'T E': // hot weather, we need zen... :)
      break;
    case 'SRO':  // storm, everyone dies and nothing we can do
      break;
    default:
      let knightStats = new Array();
      for (let i in knight) {
        if ( knightToDragonStats[i] ) {
          knightStats.push({name: i, value: knight[i]});
        }
      }
      knightStats.sort(knightStatsComparator);
      let dragonStatDeviation = 0;
      for (let i in knightStats) {
        let knightStat = knightStats[i];
        let knightStatValue = knightStat.value;
        let dragonStat = knightStatValue;
        if ( i == 1 || i == 2 ){ // 2nd and 3rd lowest - 1
          dragonStat = knightStatValue - 1;
          if ( dragonStat < 0 ){
            dragonStatDeviation += dragonStat;
            dragonStat = 0;
          }
        }
        else if ( i == 3 ){ // highest + 2
          dragonStat = knightStatValue + 2 - dragonStatDeviation;
          if ( dragonStat > 10 ){ //if dragon has stat more than 10, decrease previous highest stat by this overdose
            let overdose = dragonStat - 10;
            dragon[knightToDragonStats[knightStats[2].name]] -= overdose;
          }
        }
        dragon[knightToDragonStats[knightStat.name]] = dragonStat;
      }
  }
  return dragon;
}

function knightStatsComparator(a, b){
  return a.value > b.value ? 1 : -1;
}

module.exports = fight;