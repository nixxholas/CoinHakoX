"use strict";
exports.__esModule = true;
var fs = require('fs');
var restify = require('restify');
var builder = require('botbuilder');
var request = require('request-promise-native');
var WebSocket = require('ws');
var ws = new WebSocket('wss://www.bitmex.com/realtime');
//const wsOKC = new WebSocket('wss://real.okcoin.com:10440/websocket');
var MongoClient = require('mongodb').MongoClient;
var MongoObjectId = require('mongodb').ObjectID;
var assert = require('assert');
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log("Server is up!");
});
// https://docs.mongodb.com/getting-started/node/insert/
// https://medium.com/ibm-watson-data-lab/environment-variables-or-keeping-your-secrets-secret-in-a-node-js-app-99019dfff716
MongoClient.connect(process.env.dbURL, function (err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to database server.");
    db.close();
});
ws.on('open', function open() {
    console.log("Sending subscription packet for liquidation");
    ws.send('{"op": "subscribe", "args": ["liquidation"]}');
});
ws.on('message', function incoming(data) {
    console.log("ws data: " + data);
});
// Create the chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var apiUrl = "https://coinhako.com/api/v1/price/";
// Listen for messages from users 
server.post('/api/messages', connector.listen());
var bot = new builder.UniversalBot(connector);
bot.dialog('/', function (session) {
    //console.log(session.message.text);
    // Text formatting
    // https://docs.microsoft.com/en-us/bot-framework/portal-channel-inspector#text-formatting
    var msg = session.message.text;
    var finalResp = "";
    switch (msg) {
        case "/help":
            finalResp += "Hi, I am YushoBot. I can provide you information about Coinhako's prices live. \n\n";
            finalResp += "  \n\n";
            finalResp += "> __/help__ Ask for help? \n\n";
            finalResp += "> __/all__ Retrieve all the prices from Coinhako \n\n";
            finalResp += "> __/price eth__ Retrieve ETH prices from Coinhako \n\n";
            // Dispatch the reply
            session.send(finalResp);
            break;
        case "/all":
            request({
                method: 'GET',
                url: apiUrl + "all_prices"
            })
                .then(function (resp) {
                //session.send("Done!");
                //console.log("Response: " + resp);
                //console.log("Response, variable data: " + resp["data"]);
                //console.log("Response, variable data: " + JSON.parse(resp)["data"]);
                var data = JSON.parse(resp)["data"];
                // Iterate through the data object
                for (var datum in data) {
                    //console.log(datum);
                    //console.log(data[datum]); // { buy_price: '9097.61', sell_price: '9019.86' }
                    finalResp += "**" + datum + "**  \n\n \n\n";
                    finalResp += "- Buy Price: __" + data[datum].buy_price + "__  \n";
                    finalResp += "- Sell Price: __" + data[datum].sell_price + "__  \n";
                    finalResp += "  \n\n";
                }
                var customMessage = new builder.Message(session)
                    .text(finalResp)
                    .textFormat("markdown")
                    .textLocale("en-us");
                session.send(finalResp);
            })["catch"](function (err) {
                console.log("Error: " + err);
            });
            break;
        case "/price eth":
            request({
                method: 'GET',
                url: apiUrl + "currency/ETHUSD"
            })
                .then(function (resp) {
                //session.send("Done!");
                console.log("Response: " + resp);
                console.log("Response, variable data: " + resp["data"]);
                finalResp += "ETHUSD"
                    + "  \n"
                    + "Current Buy Price: US$" + JSON.parse(resp)["data"]["buy_price"]
                    + "  \n" // https://github.com/Microsoft/BotBuilder/issues/1112
                    + "Current Sell Price: US$" + JSON.parse(resp)["data"]["sell_price"]
                    + "  \n"
                    + "  \n";
                request({
                    method: 'GET',
                    url: apiUrl + "currency/ETHSGD"
                })
                    .then(function (resp) {
                    //session.send("Done!");
                    console.log("Response: " + resp);
                    console.log("Response, variable data: " + resp["data"]);
                    finalResp += "ETHSGD"
                        + "  \n"
                        + "Current Buy Price: SGD" + JSON.parse(resp)["data"]["buy_price"]
                        + "  \n" // https://github.com/Microsoft/BotBuilder/issues/1112
                        + "Current Sell Price: SGD" + JSON.parse(resp)["data"]["sell_price"]
                        + "  \n"
                        + "  \n";
                    request({
                        method: 'GET',
                        url: apiUrl + "currency/ETHMYR"
                    })
                        .then(function (resp) {
                        //session.send("Done!");
                        console.log("Response: " + resp);
                        console.log("Response, variable data: " + resp["data"]);
                        finalResp += "ETHMYR"
                            + "  \n"
                            + "Current Buy Price: MYR" + JSON.parse(resp)["data"]["buy_price"]
                            + "  \n" // https://github.com/Microsoft/BotBuilder/issues/1112
                            + "Current Sell Price: MYR" + JSON.parse(resp)["data"]["sell_price"];
                        session.send(finalResp);
                    })["catch"](function (err) {
                        console.log(err);
                    });
                })["catch"](function (err) {
                    console.log(err);
                });
            })["catch"](function (err) {
                console.log(err);
            });
            break;
        case "/username":
            session.send(session.message.user.name);
        case "/uid":
            session.send(session.message.address.user.id);
        default:
            // Ignore General Replies   
            //session.send("Sorry I don't get what you're saying!");
            break;
    }
});
