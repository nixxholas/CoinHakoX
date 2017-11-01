"use strict";
exports.__esModule = true;
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
var apiUrl = "https://coinhako.com/api/v1/price/";
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
        case "/help":
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
                    finalResp += "### " + datum + "  \n  \n";
                    finalResp += "__Buy Price:" + data[datum].buy_price + "__  \n";
                    finalResp += "__Sell Price:" + data[datum].sell_price + "__  \n";
                    finalResp += "  \n\r";
                }
                session.send(finalResp);
            })["catch"](function (err) {
                console.log("Error: " + err);
            });
            // request({
            //         method: 'GET',
            //         url: apiUrl + "BTCUSD"
            //     })
            //     .then((resp: any) => {
            //         //session.send("Done!");
            //         //console.log("Response: " + resp);
            //         //console.log("Response, variable data: " + resp["data"]);
            //         finalResp += "BTCUSD"
            //         + "  \n"
            //         + "Current Buy Price: US$" + JSON.parse(resp)["data"]["buy_price"]
            //         + "  \n" // https://github.com/Microsoft/BotBuilder/issues/1112
            //         + "Current Sell Price: US$" + JSON.parse(resp)["data"]["sell_price"]
            //         + "  \n" 
            //         + "  \n";
            //         //console.log(finalResp);
            //         // Second request
            //         request({
            //                 method: 'GET',
            //                 url: apiUrl + "BTCSGD"
            //             })
            //             .then((resp: any) => {
            //                 //session.send("Done!");
            //                 console.log("Response: " + resp);
            //                 console.log("Response, variable data: " + resp["data"]);
            //                 finalResp += "BTCSGD"
            //                 + "  \n"
            //                 + "Current Buy Price: SGD" + JSON.parse(resp)["data"]["buy_price"]
            //                 + "  \n" // https://github.com/Microsoft/BotBuilder/issues/1112
            //                 + "Current Sell Price: SGD" + JSON.parse(resp)["data"]["sell_price"]
            //                 + "  \n" 
            //                 + "  \n";
            //                 //console.log(finalResp);
            //                 // Third request
            //                 request({
            //                         method: 'GET',
            //                         url: apiUrl + "BTCMYR"
            //                     })
            //                     .then((resp: any) => {
            //                         //session.send("Done!");
            //                         console.log("Response: " + resp);
            //                         console.log("Response, variable data: " + resp["data"]);
            //                         finalResp += "BTCMYR"
            //                         + "  \n"
            //                         + "Current Buy Price: MYR" + JSON.parse(resp)["data"]["buy_price"]
            //                         + "  \n" // https://github.com/Microsoft/BotBuilder/issues/1112
            //                         + "Current Sell Price: MYR" + JSON.parse(resp)["data"]["sell_price"];
            //                         //console.log(finalResp);
            //                         session.send(finalResp);
            //                     })
            //                     .catch((err: any) => {
            //                         console.log(err);
            //                     });
            //             })
            //             .catch((err: any) => {
            //                 console.log(err);
            //             });
            //     })
            //     .catch((err: any) => {
            //         console.log(err);
            //     });
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
        default:
            // Ignore General Replies   
            //session.send("Sorry I don't get what you're saying!");
            break;
    }
});
