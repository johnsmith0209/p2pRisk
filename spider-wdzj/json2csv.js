const _ = require('lodash');
const fs = require('fs');
const datas = require('./datas/basic.json');

let totalDatas = []
let latestDatas = []

/**
 * test/train potion for both broken/healthy platforms
 */
const testPortion = 0.2
const trainPortion = 1 - testPortion;

const colArr = [
  'wdzjPlatId', 'platName', 'isBroken', 'amount', 'avgBidMoney', 'avgBorrowMoney',
  'bidderNum', 'borrowerNum', 'currentLeverageAmount', 'fullloanTime', 
  'netInflowOfThirty', // 资金净流入
  'incomeRate', 'loanPeriod', 'stayStillOfTotal', 'top10DueInProportion',
  'top10StayStillProportion', 'totalLoanNum'
]
const arrangeLine = (line) => _.map(colArr, (idx) => line[idx]).join(',')

const headLine = colArr.join(',')

const writeFile = (line, type = 'test', append = true) => {
  const filepath = `./datas/${type}.csv`;
  if (_.isString(line)) {
    fs.writeFileSync(filepath, line + '\n', {encoding: 'utf8'});
    return;
  }
  if (_.isArray(line)) {
    line = _.map(line, i => arrangeLine(i)).join('\n')
  } else if (_.isObject(line)) {
    line = arrangeLine(line)
  }
  const func = `${append ? 'append' : 'write'}FileSync`;
  fs[func](filepath, line, {encoding: 'utf8'})
}

_.each(datas, ({basic, broken, ...info}, wdzjPlatId) => {
  // 去掉最后一个月的数据 用来预测新的可能爆雷的平台
  const isBroken = !_.isEmpty(broken) ? 1 : 0;
  const pushData = (isLatest = false, i) => {
    const datas = isLatest ? latestDatas : totalDatas;
    datas.push({
      ...i,
      ...info,
      ...broken,
      isBroken
    })
  };
  _.each(basic.slice(0, -1), pushData.bind(null, false))
  pushData(true, _.last(basic));
})

console.log(totalDatas.length)
console.log(latestDatas.length)
console.log(_.filter(latestDatas, i => i.isBroken).length / latestDatas.length)
console.log(colArr.length)

writeFile(headLine, 'total', false)
writeFile(headLine, 'latest', false)

writeFile(totalDatas, 'total')
writeFile(latestDatas , 'latest')
