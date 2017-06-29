"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs');
var restify = require('restify');
var builder = require('botbuilder');
var request = require('request-promise-native');
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log("Server is up!");
});
// Create the chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var apiUrl = "https://coinhako.com/api/v1/price/currency/";
// Listen for messages from users 
server.post('/api/messages', connector.listen());
// Create your bot with a function to receive messages from the user
// var bot = new builder.UniversalBot(connector, function (session) {
//     // echo the user's message
//     //session.send("You said: %s", session.message.text);
//     var msg = session.message.text;
//     switch(msg) {
//         case "/price btc":
//                 request({
//                     method: 'GET',
//                     url: apiUrl + "BTCSGD"
//                 })
//                 .then((resp) => {
//                     //session.send("Done!");
//                     //console.log(resp);
//                     //session
//                 })
//                 .catch((err) => {
//                     console.log(err);
//                 });
//             break;
//         default:
//             break;
//     }
// });
var bot = new builder.UniversalBot(connector);
bot.dialog('/', function (session) {
    //console.log(session.message.text);
    var msg = session.message.text;
    var finalResp = "";
    switch (msg) {
        case "/price btc":
            request({
                method: 'GET',
                url: apiUrl + "BTCUSD"
            })
                .then(function (resp) {
                //session.send("Done!");
                //console.log("Response: " + resp);
                //console.log("Response, variable data: " + resp["data"]);
                finalResp += "BTCUSD".bold()
                    + "  \n"
                    + "Current Buy Price: US$" + JSON.parse(resp)["data"]["buy_price"]
                    + "  \n" // https://github.com/Microsoft/BotBuilder/issues/1112
                    + "Current Sell Price: US$" + JSON.parse(resp)["data"]["sell_price"]
                    + "  \n  \n";
                //console.log(finalResp);
                // Second request
                request({
                    method: 'GET',
                    url: apiUrl + "BTCSGD"
                })
                    .then(function (resp) {
                    //session.send("Done!");
                    console.log("Response: " + resp);
                    console.log("Response, variable data: " + resp["data"]);
                    finalResp += "BTCSGD".bold()
                        + "  \n"
                        + "Current Buy Price: SGD" + JSON.parse(resp)["data"]["buy_price"]
                        + "  \n" // https://github.com/Microsoft/BotBuilder/issues/1112
                        + "Current Sell Price: SGD" + JSON.parse(resp)["data"]["sell_price"];
                    //console.log(finalResp);
                    session.send(finalResp);
                })
                    .catch(function (err) {
                    console.log(err);
                });
            })
                .catch(function (err) {
                console.log(err);
            });
            break;
        case "/price eth":
            request({
                method: 'GET',
                url: apiUrl + "ETHSGD"
            })
                .then(function (resp) {
                //session.send("Done!");
                console.log("Response: " + resp);
                console.log("Response, variable data: " + resp["data"]);
                session.send("ETHSGD".bold()
                    + "  \n"
                    + "Current Buy Price: SGD" + JSON.parse(resp)["data"]["buy_price"]
                    + "  \n" // https://github.com/Microsoft/BotBuilder/issues/1112
                    + "Current Sell Price: SGD" + JSON.parse(resp)["data"]["sell_price"]);
            })
                .catch(function (err) {
                console.log(err);
            });
            break;
        default:
            // Ignore General Replies   
            //session.send("Sorry I don't get what you're saying!");
            break;
    }
});
