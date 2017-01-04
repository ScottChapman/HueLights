/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var mqtt = require('mqtt')
var _ = require('lodash');
// var client  = mqtt.connect('mqtt:192.168.86.10')
var client  = mqtt.connect('mqtt:scottchapman.no-ip.org')

// colors
// bri	uint8	The brightness value to set the light to.
// Brightness is a scale from 1 (the minimum the light is capable of) to 254 (the maximum). Note: a brightness of 1 is not off.
//
// e.g. “brightness”: 60 will set the light to a specific brightness
//
// Optional
// hue	uint16	The hue value to set light to.
// The hue value is a wrapping value between 0 and 65535. Both 0 and 65535 are red, 25500 is green and 46920 is blue.
//
// e.g. “hue”: 50000 will set the light to a specific hue.
var colors = {
  red: {bri: 254, hue: 0, sat: 254},
  green: {bri: 254, hue: 25500, sat: 254},
  blue: {bri: 254, hue: 46920, sat: 254},
}

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// body parser
app.use(bodyParser.json());

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

app.post('/SetColor', function (req,res) {
  var body = req.body;
  var required = ['color','light'];
  console.log("Yay!");
  console.dir(body);
  if (required.length == _.intersection(required,_.keys(body)).length) {
    if (colors.hasOwnProperty(body.color)) {
      var color = colors[body.color];
      color.on = true;
      client.publish(body.light,JSON.stringify(color));
      color.light = body.light;
      client.publish('lights',JSON.stringify(color));
      res.status(200).send({status: "All set!"}).end();
    }
    else {
      res.status(400).send({status: "color not supported"}).end();
    }
  }
  else {
    res.status(400).send({status: "missing required fields (color, light)"}).end();
  }
})

// start server on the specified port and binding host
var httpServer = http.createServer(app).listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
