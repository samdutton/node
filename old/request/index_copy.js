var request = require('request'),
    jsdom = require('jsdom');

request({ uri:'http://simpl.info' }, function (error, response, body) {
  if (error && response.statusCode !== 200) {
    console.log('Error')
  }

  jsdom.env({
    html: body,
    scripts: [
      'http://code.jquery.com/jquery-2.0.0.min.js'
    ]
  }, function (err, window) {
    var $ = window.jQuery;

    // jQuery is now loaded on the jsdom window created from 'agent.body'
    console.log($('body').html());
  });
});


// var request = require('request'),
//     sys = require('sys');

// request({ uri:'http://simpl.info' }, function (error, response, body) {
//   if (error && response.statusCode !== 200) {
//     console.log('Error')
//   }
//   sys.puts(body);
// });



// var httpAgent = require('http-agent'),
//     util = require('util');

// var agent = httpAgent.create('www.simpl.info', ['video', 'gum']);

// agent.addListener('next', function (err, agent) {
//   console.log('Body of the current page: ' + agent.body);
//   console.log('Response we saw for this page: ' + util.inspect(agent.response));

//   // Go to the next page in the sequence
//   agent.next();
// });

// agent.addListener('stop', function (err, agent) {
//   console.log('the agent has stopped');
// });

// agent.start();
