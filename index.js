require('babel-register')
require("babel-polyfill")
var actionSnapshot = require('./snapshot').actionSnapshot;
var getLastDraw = require('./snapshot').getLastDraw
var isDrawExist = require('./snapshot').isDrawExist
var execAirdrop = require('./eosnts').execAirdrop

var keyProvider = process.argv[2];
if (!keyProvider) {
  console.log("keyProvider must supply");
  process.exit();
}

var draw = process.argv[3];
if (!draw || isNaN(draw)) {
  getLastDraw().then((lastDraw) => {
    draw = lastDraw + 1;
  }).then(() => {
    // get the vote action snapshot
    console.log('begin to get vote action snapshot...');
    actionSnapshot(draw).then(() => {
      console.log("finished generate snapshot");
      execAirdrop(keyProvider, draw);
    }).then(() => process.exit())
  })
} else {
  isDrawExist(draw).then((result) => {
    if (result) {
      console.log("输入的期数已经存在");
      process.exit();
    }
  }).then(() => {
    // get the vote action snapshot
    console.log('begin to get vote action snapshot...');
    actionSnapshot(draw).then(() => {
      console.log("finished generate snapshot");
      execAirdrop(keyProvider, draw);
    }).then(() => process.exit())
  })
}

