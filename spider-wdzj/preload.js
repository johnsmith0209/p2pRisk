const _ = require('lodash');
const fs = require('fs');
const Async = require('async');
const moment = require('moment');
const axios = require('axios');
const querystring = require('querystring');
const config = require('./config');

const readJSON = (path) => {
  let data = {}
  try {
    data = JSON.parse(fs.readFileSync(path, {encoding: "utf8"}));
  } catch (e) {
    console.error('parsing json file error', e)
  } finally {
    return data
  }
}

const businessTypes = {
  "1":"个人信贷",
  "2":"车贷",
  "3":"房贷",
  "6":"供应链金融",
  "7":"融资租赁",
  "9":"农村金融",
  "10":"艺术品质押",
  "11":"票据",
  "12":"消费金融",
  "13":"企业信贷",
}

const basicInfoFields = [
  'businessTypeIdS', 'newbackground', 'platName', 'source',
  'onlineTime', 'businessTypes', 'background', 'wdzjPlatId'
]

Object.defineProperty(window.navigator, 'appVersion', {
  value: "5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36"
})
// Object.defineProperty(window.navigator, 'userAgent', {
//   value: config.UA
// })

/**
* 获取页面所有列表内容 basic 第一列
  */
window.getBasic = (month) => {
  const opts = _.cloneDeep(config.api.basic);
  const start = moment(month, config.monthFormat).format('YYYY-MM-01');
  const end = moment(month, config.monthFormat).add(1, 'month').subtract(1, 'days').format(config.dateFormat);
  const data = {
    type: 0,
    shujuDate: `${start}${end}`
  }
  opts.data = querystring.stringify(data);
  console.log('get basic opts', opts);
  return axios(opts).then((res) => {
    res = _.chain(res.data).map((i) => {
      i.month = moment(start, config.dateFormat).format(config.monthFormat)
      if (i.businessTypeIds) {
        i.businessTypeIds = i.businessTypeIds.split(',')
        i.businessTypes = _.compact(_.map(i.businessTypeIds, _id => businessTypes[_id] || ''));
      } else {
        i.businessTypeIds = []
        i.businessTypes = []
      }
      // 剔除不需要的字段
      return _.omit(i, [
        'search', 'logUrl', 'flUrl', 
        'activityTips', 'firstLetter', 'platId'
      ])
    }).keyBy('wdzjPlatId').value()
    // 以wdzjPlatId为key的对象，每个value都是按月分的数组
    // {[wdzjPlatId]: [{month: xx, ...}, {month:xx, ...}]}
    console.time(`insert into data ${month}`);
    let datas = readJSON(config.file.basic);
    _.each(res, (data, wdzjPlatId) => {
      let dataArr = _.get(datas, wdzjPlatId, []);
      const existIndex = _.findIndex(dataArr, (i) => i.wdzjPlatId === data.wdzjPlatId && i.month === data.month)
      if (existIndex !== -1) {
        dataArr.splice(existIndex, 1, data)
      } else {
        dataArr.push(data)
      }
      dataArr = _.sortBy(dataArr, ['month']);
      _.set(datas, wdzjPlatId, dataArr);
    })
    fs.writeFileSync(config.file.basic, JSON.stringify(datas, null, 2))
    console.timeEnd(`insert into data ${month}`);
    return datas;
  });
}

const monthes = []
const currMonth = moment()
const minData = moment('2017-01-01');
while(currMonth.isSameOrAfter(minData)) {
  monthes.push(currMonth.format(config.monthFormat))
  currMonth.subtract(1, 'month');
}
// 翻转 从小开始
monthes.reverse();
window.getAllBasic = () => {
  Async.eachSeries(monthes, (month, cb) => {
    console.time(`Start get ${month} basic`);
    window.getBasic(month).then((data) => {
      console.timeEnd(`Start get ${month} basic`);
      console.log(`After fetch ${month} data, length: ${data.length}`)
      setTimeout(() => {cb()}, 3000 + Math.random() *1000)
    }).catch((e) => {
      console.log(`Get basic ${month} error:`, e);
    })
  }, () => {
    console.log('all done');
  })
}

window.checkAllBasic = (wdzjPlatId = false) => {
  const data = readJSON(config.file.basic);
  if (!wdzjPlatId) {
    wdzjPlatId = data[_.keys(data)[_.random(220, false)]].wdzjPlatId;
  }
  const dataArr = data[wdzjPlatId];
  const first = dataArr[0];
  console.log(`${first.platName}`, dataArr)
  console.table(dataArr)
  return dataArr
}

window.getBroken = () => {
  const opts = _.cloneDeep(config.api.broken);
  console.log('get broken opts', opts);
  axios(opts).then((res) => {
    let {problemList} = res.data;
    problemList = _.chain(problemList).map((i) => {
      return _.omit(i, [
        'allLetter', 'search', 'status1', 'status2',
        'platId', 'autoPin', 'firstLetter'
      ])
    }).keyBy('wdzjPlatId').value();
    fs.writeFileSync(config.file.broken, JSON.stringify(problemList, null, 2))
  })
}

window.attachBorken = () => {
  let basics = readJSON(config.file.basic);
  const brokenDatas = readJSON(config.file.broken);
  console.log('attach broken');
  basics = _.map(basics, (i, wdzjPlatId) => {
    i = {
      ..._.pick(i[0], basicInfoFields),
      basic: _.map(i, v => _.omit(v, basicInfoFields)),
      broken: _.omit(_.get(brokenDatas, wdzjPlatId, {}), basicInfoFields)
    }
    if (!_.isEmpty(i.broken)) {
      console.log(`${wdzjPlatId}:${i.platName} broken at ${i.broken.problemTime}, type: ${i.broken.type}`)
    }
    return i;
  })
  fs.writeFileSync(config.file.basic, JSON.stringify(_.keyBy(basics, 'wdzjPlatId'), null, 2))
}

window.fixBusinessTypes = () => {
  const datas = readJSON(config.file.basic);
  _.each(datas, (i) => {
    if (!_.isEmpty(i.businessTypeIdS)) {
      i.businessTypeIds = i.businessTypeIdS.split(',')
      i.businessTypes = _.compact(_.map(i.businessTypeIds, _id => businessTypes[_id] || ''));
      delete i.businessTypeIdS;
    } else {
      i.businessTypeIds = []
      i.businessTypes = []
    }
  })
  fs.writeFileSync(config.file.basic, JSON.stringify(datas, null, 2))
}