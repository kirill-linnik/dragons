const rp = require('request-promise');
const xml2js = require('xml2js-es6-promise');

const knightToDragonStats = {
  'attack': 'scaleThickness',
  'armor': 'clawSharpness',
  'agility': 'wingStrength',
  'endurance': 'fireBreath'
};

const maximumNumberOfFights = 100;

//you will see lot of promises here as HTTP calls are asynchronous but we need to get a result prior page render.
//therefore, all games are started in an asynchronous way, but joined with Promise.all in order wait for them to complete.
//it means, fight is a promise itself and, for example, in case of the render, have to be called in a way:
//fight(numberOfFights).then(results => { res.render(...); });
function fight(numberOfFights){
  let games = new Array();
  for ( let i = 0; i < numberOfFights; i++ ){
    games.push(getGame());
  }

  return Promise.all(games)
    .then(results => {
      return results;
    })
    .catch(err => {
      console.log(err);
      return err;
    });
};

//let's play a game...
function getGame(){
  const options = {
    uri: 'http://www.dragonsofmugloar.com/api/game',
    json: true,
    async: false
  };

  return rp(options)
    .then(game => getWeather(game))
    .catch(err => {
      console.log(err);
      return {err: err};
    });
}

//load the weather
function getWeather(game){
  const options = {
    uri: `http://www.dragonsofmugloar.com/weather/api/report/${game.gameId}`,
    async: false
  };

  return rp(options)
    .then(xmlString => weatherToJS(game, xmlString))
    .catch(err => {
      console.log(err);
      return err;
    });
}

//cast weather XML to JSON
function weatherToJS(game, weatherXml){
  return xml2js(weatherXml)
    .then(weather => performFight(game, weather))
    .catch(err => {
      console.log(err);
      return err;
    });
}

//and fight the knight
function performFight(game, weather){
  const knight = game.knight;
  const weatherCode = weather.report.code[0];
  const dragon = getDragonStats(knight, weatherCode);
  const options = {
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
      return {
        game: game,
        weather: weather,
        dragon: dragon,
        result: gameResult
      };
    })
    .catch(err => {
      console.log(err);
      return err;
    });
}

//in order to win the game, we have to train our dragon; this heavily depends on the weather and knight
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
    default: // normal weather, let's use knight's skills as a base
      // sort knight's skills from weakest to strongest
      let knightStats = new Array();
      for (let i in knight) {
        if ( knightToDragonStats[i] ) {
          knightStats.push({name: i, value: knight[i]});
        }
      }
      knightStats.sort(knightStatsComparator);
      let dragonStatDeviation = 0;
      for (let i in knightStats) {
        const knightStat = knightStats[i];
        const knightStatValue = knightStat.value;
        let dragonStat = knightStatValue;
        if ( i == 1 || i == 2 ){ // 2nd and 3rd lowest - 1
          dragonStat = knightStatValue - 1;
          if ( dragonStat < 0 ){ // dragon skill cannot go into minus; we have to set it to 0 and compensate later on
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

module.exports = { fight, maximumNumberOfFights };