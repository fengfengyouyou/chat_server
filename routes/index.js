var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log(123123)
  res.render('index', { title: '这里没有东西哦！' });
  // res.sendFile(__dirname + '/index.html')
});

module.exports = router;