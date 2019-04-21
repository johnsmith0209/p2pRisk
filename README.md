# Breif

> This `REPO` is for the homework of BIT's MEM course, and has no intention for business usage.

This is a project that collects peer to peer loaning platforms' data and analysis the risk of it.

## Web Spider

* Tool: `Node.js`, `Electron`
* Folder: ./spider-wdzj
* source: [网贷之家(wdzj)](https://shuju.wdzj.com)
* Main API:
  1. `Platforms' Basic Data`: `https://shuju.wdzj.com/plat-data-custom.html`
  2. `Platforms' Broken/Failure Data`: `https://shuju.wdzj.com/problem-list-all.html`
* Run:
  1. `cd ./spider-wdzj && npm start`
  2. `Login` manually, cause it could be a complicated work if I implements a method do it programmatically, could do it in the future.
  3. Electron will open `dev tool` automatically, 
  4. Then type `getAllBasic()`, this will fetch data of platforms which dates ranges from `2017-01-01` to `now()`. It will generate a JSON file, `./datas/basics.json`.
  5. Then type `getBroken()`, this will fetch data of all the platforms which are/were malfunctioning. This fetching will ignore date ranges and return all dates' data.
  6. Finally, call `attachBroken()`, this function will attach the data from `getBroken` into the `basics` data. then get our finall data structure as below;

```javascript
{
  "$wdzjPlatId": {
    "wdzjPlatId": int, // wdzj platform id: 40 
    "platName": string, // platform name: 人人贷
    "background": string,
    "newbackgroud": string, // 国资
    "onlineTime": Date, // YYYY-MM-DD
    "businessTypes": string[],
    "businessTypeIdS": int[],
    "source": "API",
    "basic": [
      {
        "amount": decimal(,2),
        "avgBidMoney": decimal(,2),
        "avgBorrowMoney": decimal(,2),
        "bidderNum": int,
        "borrowerNum": int,
        "currentLeverageAmount": decimal(,2),
        "dataStatus": int,
        "developZhishu": int,
        "differStatus": int,
        "endDate": Date, // YYYY-MM-DD
        "fullloanTime": decimal(,2),
        "incomeRate": decimal(,2),
        "loanPeriod": decimal(,2),
        "netInflowOfThirty": decimal(,2),
        "prizeTypeDetail": string,
        "regCapital": int,
        "startDate": Date, // YYYY-MM-DD
        "status": int,
        "stayStillOfNextSixty": decimal(,2),
        "stayStillOfTotal": decimal(,2),
        "timeOperation": int,
        "top10DueInProportion": decimal(,2),
        "top10StayStillProportion": decimal(,2),
        "totalLoanNum": int,
        "weightedAmount": int,
        "month": Date, // YYYY-MM-DD
      }
    ...],
    // if it borken, then this field will not be empty
    "broken": {
      "proTime": Date, // YYYY-MM
      "problemTime": Date, // YYYY-MM-DD
      "type": string, // 刑侦介入 broken type
      "regCapital": int, // registration capital amount
    }
  }
}
```

## TODO

* Use python to implement `Few-shot learnning` to do the classification & risk evaluation.
