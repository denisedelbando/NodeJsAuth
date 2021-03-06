var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (req.session.user) {
    res.render('users', { username: req.session.user.name  });
  } else {
    res.redirect('/login');
  }
});

module.exports = router;
