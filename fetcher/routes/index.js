const express = require('express');
const router = express.Router();

const twitter = require('./twitter');
const registration = require('./registration');

router.get('/', function(req, res, next) {
  res.send({text: 'OK'});
});

router.use(registration);
router.use(twitter);

module.exports = router;