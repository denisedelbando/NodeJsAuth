var express = require('express');
var router = express.Router();
var bkfd2Password = require("pbkdf2-password");
var hash = bkfd2Password();

// dummy database

var users = {
    tj: { name: 'tj' }
};

// when you create a user, generate a salt
// and hash the password ('foobar' is the pass here)

hash({ password: 'foobar' }, function (err, pass, salt, hash) {
    if (err) throw err;
    // store the salt & hash in the "db"
    users.tj.salt = salt;
    users.tj.hash = hash;
});
  
  
// Authenticate using our plain-object database of doom!
  
function authenticate(name, pass, fn) {
    if (!module.parent) console.log('authenticating %s:%s', name, pass);
    var user = users[name];
    // query the db for the given username
    if (!user) return fn(new Error('cannot find user'));
    // apply the same algorithm to the POSTed password, applying
    // the hash against the pass / salt, if there is a match we
    // found the user
    hash({ password: pass, salt: user.salt }, function (err, pass, salt, hash) {
        if (err) return fn(err);
        if (hash === user.hash) return fn(null, user)
        fn(new Error('invalid password'));
    });
}



router.get('/', function(req, res){
    res.render('login', { message: null });
});

router.post('/', function(req, res){
    authenticate(req.body.username, req.body.password, function(err, user){
      if (user) {
        // Regenerate session when signing in
        // to prevent fixation
        req.session.regenerate(function(){
          // Store the user's primary key
          // in the session store to be retrieved,
          // or in this case the entire user object
          req.session.user = user;
          res.redirect('/');
        });
      } else {
        var message = 'Authentication failed, please check your '
          + ' username and password.'
          + ' (use "tj" and "foobar")';
          res.render('login', { message });
        
      }
    });
  });


  

module.exports = router;
