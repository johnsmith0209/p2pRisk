const _ = require('lodash');
const {app, BrowserWindow, session} = require('electron');
const {urls, UA, api} = require('./config');
const {resolve} = require('path')

let window;
app.on('ready', () => {
  console.log('app on ready');
  // 同等作用 但没有下一个更加灵活 可以根据不同的url定制不同的header
  session.defaultSession.setUserAgent(UA);
  // session.defaultSession.webRequest.onBeforeSendHeaders({
  //   urls: [api.basic.url, api.broken.url]
  // }, function(details, callback) {
  //   let {requestHeaders, url} = details
  //   _.each(api, (item, key) => {
  //     if (url.match(item.url)) {
  //       requestHeaders = {...requestHeaders, ...item.customHeaders}
  //     }
  //   })
  //   console.log(requestHeaders);
  //   callback({cancel: false, requestHeaders})
  // })
  window = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      preload: resolve(__dirname, 'preload.js')
    },
    show: true,
  });
  const {webContents} = window;
  // 也能生效 但需要等待，不能马上loadURL
  // webContents.session.setUserAgent(UA);
  // webContents.session.webRequest.onBeforeSendHeaders(function(details, callback) {
  //   const headers = details.requestHeaders
  //   headers['User-Agent'] = UA
  //   console.log(headers)
  //   callback({cancel: false, requestHeaders: headers})
  // })
  // setTimeout(() => {
  // }, 5000)
  webContents.loadURL(urls.basicInfo);
  webContents.openDevTools();
})

app.on('window-all-closed', () => { app.quit() })