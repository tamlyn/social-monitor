const express = require('express');
const router = express.Router();

const twitter = require('./twitter');
const registration = require('./registration');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/registration', registration);
router.use('/twitter', twitter);

module.exports = router;