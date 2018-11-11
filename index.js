const fs = require('fs');
const path = require('path');
const URL = require('url');
// const requestHandler = (request, response) => {
//     console.log(request.url);
//     if(request.url.indexOf('/resources/') == 0){
//         response.download(path.join(__dirname, request.url));
//     }
// }
var express = require("express");
var app = express();
var server = require('http').createServer(app);
var socket = require('./socket').init(server);
app.set('port', 14332);

server.listen(app.get('port'), function () {
    console.log('server is running');
});

// server.listen(3000, function () {
//     console.log('server is running');
// });


// app.use((request, response, next) => {
//     console.log('111');
//     next()
//   })
  
//   app.use((request, response, next) => {
//     console.log('222');
//     request.chance = Math.random()
//     next()
//   })
  
app.get('/resources/*', (request, response) => {
    let url = URL.parse(request.url);
    // console.log(url);
    response.download(path.join(__dirname, url.pathname));
})