var nano = require('nano')('https://chrome.iriscouch.com/');

// clean up the database we created previously
nano.db.destroy('alice', function() {
  // create a new database
  nano.db.create('alice', function() {
    // specify the database we are going to use
    var alice = nano.use('alice');
    // and insert a document in it
    alice.insert({ crazy: true }, 'rabbit', function(err, body, header) {
      if (err) {
        console.log('[alice.insert] ', err.message);
        return;
      }
      console.log('you have inserted the rabbit.')
      console.log(body);

      alice.get('rabbit', { crazy: true }, function(err, body) {
        if (!err)
          console.log(body);
      });

    });
  });
});


// var express = require('express')
//    , nano    = require('nano')('https://chrome.iriscouch.com/')
//    , app     = module.exports = express()
//    , db_name = "chrome"
//    , db      = nano.use(db_name);

// app.get("/", function(request,response) {
//   nano.db.create(db_name, function (error, body, headers) {
//     if (error) { return response.send(error.message, error['status-code']); }
//     db.insert({foo: true}, "foo", function (error2, body2, headers2) {
//       if(error2) { return response.send(error2.message, error2['status-code']); }
//       response.send("Insert ok!", 200);
//     });
//   });
// });



// app.get("/get", function(request,response) {
//   console.log('requested get');
//   db.get('foo', { revs_info: true }, function(err, body) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(body);
//     }
//   });
// });


// app.listen(3333);
// console.log("server is running. check expressjs.org for more cool tricks");
