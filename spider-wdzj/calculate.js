const _ = require('lodash');
const datas = require('./datas/basic.json');
const moment = require('moment');
const config = require('./config');

// 获取每个有问题的平台数据，看出问题的时间和最后一个数据的时间差距
const results = _.map(datas, (i, id) => {
  const lastMonth = moment(_.last(i.basic).month);
  const brokenMonth = !_.isEmpty(i.broken) ? moment(i.broken.proTime) : false;
  const basicDiff = moment().diff(lastMonth, 'month')
  return {
    id,
    ..._.pick(i, ['platName']),
    proTime: i.broken.proTime,
    lastMonth: _.last(i.basic).month,
    basicDiff,
    brokenDiff: brokenMonth ? brokenMonth.diff(lastMonth, 'months') : false
  }
})

// console.table(results);
const hasBroken = _.filter(results, i => i.brokenDiff !== false)
console.table(hasBroken);
const avgBrokenTimeDrag = _.sumBy(hasBroken, 'brokenDiff') / hasBroken.length
console.log(`Average broken-basic month diff: ${avgBrokenTimeDrag}`);

const avgBasicDrag = _.sumBy(results, 'basicDiff') / _.values(results).length
console.log(`Average basic month diff: ${avgBasicDrag}`);

const basicCounts = _.chain(datas)
  .map(i => !_.isEmpty(i.broken) ? null : i.basic)
  .compact().flatten().value().length;

const brokenCounts = _.chain(datas)
  .map(i => !_.isEmpty(i.broken) ? i.basic : null)
  .compact().flatten().value().length;

console.log(`Basic month datas: ${basicCounts}, broken: ${brokenCounts}`);