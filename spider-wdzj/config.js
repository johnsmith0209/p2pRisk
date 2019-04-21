const { resolve } = require('path');

module.exports = {
  urls: {
    'login': 'https://www.wdzj.com/',
    'basicInfo': 'https://shuju.wdzj.com/'
  },
  file: {
    basic: resolve(__dirname, 'datas', 'basic.json'),
    broken: resolve(__dirname, 'datas', 'broken.json')
  },
  api: {
    basic: {
      url: 'https://shuju.wdzj.com/plat-data-custom.html',
      method: 'post',
      data: {
        type: 0,
        shujuDate: undefined
      },
      responseType: 'text',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': '*/*'
      }
    },
    broken: {
      url: 'https://shuju.wdzj.com/problem-list-all.html',
      method: 'get',
      params: {
        year: ''
      },  
      responseType: 'json'
    }
  },
  monthFormat: 'YYYY-MM',
  dateFormat: 'YYYY-MM-DD',
  UA: "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36"
}