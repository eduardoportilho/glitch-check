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
  
  trafik.getDepartures(from, to, '00:10:00')
    .then(function (result) {
      var msg = createMessage(result)
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
 return departures.map(departure => {
  var train = departure.train;
  var status = departure.canceled ? 'Canceled' :
    departure.delayed ? 'Delayed' : 'On time';

  var time = departure.time
  if (departure.delayed) {
    time += ' => ' + departure.estimatedTime;
  }

  var track = departure.track || '?';
   return ['train:' + train, time, status, 'track: ' + track].join(' - ')
 }).join('\n'); 
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
