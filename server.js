// server.js
// where your node app starts

// init project
var express = require('express');
var doRequest = require('request');
var app = express();
var trafik = require('trafikverket');

var notificationURL = 'https://maker.ifttt.com/trigger/NOTIFY/with/key/' + process.env.WEBHOOK_KEY;

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/trafik", function (request, response) {
  console.log('trafik')
  var from = request.query.from;
  var to = request.query.to;
  var offset = request.query.offset || '00:30:00';
  var expect = request.query.expect
  
  trafik.getDepartures(from, to, offset)
    .then(function (result) {
      console.log(result)
      var msg = createMessage(result)
      if (expect && msg !== expect) {
        msg = '⚠️ ' + msg + ' ⚠️'
      } else {
        msg = '✅ ' + msg
      }
      doRequest({
        url: notificationURL,
        method: 'POST',
        json: true,
        body: {'value1': msg}
      }, function(error, response, body){
        console.log(error, response, body);
      });
      response.send(msg);
    
    })
    .catch(function (err) {
    console.log('err', err)
      response.send(JSON.stringify(err));
    });
});


function createMessage(departures) {
  var departureMsgs = departures.map(departure => {
    // var train = departure.train;
    // var track = departure.track || '?';
    // var status = departure.canceled ? 'Canceled' :
    //   departure.delayed ? 'Delayed' : 'On time';

    var time = removeSecs(departure.time)
    if (departure.delayed) {
      time += ' DELAYED TO ' + departure.estimatedTime;
    }
    return time
  })
  return '[' + departureMsgs.join(' ; ') + ']'; 
}

function removeSecs(time) {
  let tokens = time.split(':')
  return tokens[0] + ':' + tokens[1]
  
}


app.get("/next", function (request, response) {
  response.send(dreams);
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream);
  response.sendStatus(200);
});

// Simple in-memory store for now
var dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
