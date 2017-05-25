//nothing fancy here: some maths and filtering magic
function getStatistics(fightResults){
  let battlesTotal = fightResults.length;
  let victories = fightResults.filter(value => {return value.result.status == "Victory"}).length;
  let loses = battlesTotal - victories;
  let victoryPercent = Math.round(100 * victories/battlesTotal);
  let losesPercent = 100 - victoryPercent;

  return {
    battlesTotal: battlesTotal,
    victories: victories,
    loses: loses,
    victoryPercent: victoryPercent,
    losesPercent: losesPercent
  };
}

module.exports = getStatistics;