const fs = require('fs');
import { Price } from './objects/price';

const restify = require('restify');
const builder = require('botbuilder');
const request = require('request-promise-native');
const WebSocket = require('ws');
const ws = new WebSocket('wss://www.bitmex.com/realtime');
//const wsOKC = new WebSocket('wss://real.okcoin.com:10440/websocket');

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log("Server is up!");
});

ws.on('open', function open() {
    ws.send('{"op": "subscribe", "args": ["liquidation"]}');

    setTimeout(function() {
        ws.ping('', false, true)
    }, 1000);
});

ws.on('message', function incoming(data: any) {
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

bot.dialog('/', (session: any) => {
    //console.log(session.message.text);
    var msg = session.message.text;
    let finalResp: string = "";

    switch (msg) {
        case "/help":
            finalResp += "Hi, I am YushoBot. I can provide you information about Coinhako's prices live. \n\n"
            finalResp += "__/help__ Ask for help? \n\n";
            finalResp += "__/all__ Retrieve all the prices from Coinhako \n\n";
            finalResp += "__/price eth__ Retrieve ETH prices from Coinhako \n\n";
            break;
        case "/all":
            request({
                method: 'GET',
                url: apiUrl + "all_prices"
            })
                .then((resp: any) => {
                    //session.send("Done!");
                    //console.log("Response: " + resp);
                    //console.log("Response, variable data: " + resp["data"]);
                    //console.log("Response, variable data: " + JSON.parse(resp)["data"]);

                    let data = JSON.parse(resp)["data"];

                    // Iterate through the data object
                    for (let datum in data) {
                        //console.log(datum);
                        //console.log(data[datum]); // { buy_price: '9097.61', sell_price: '9019.86' }

                        finalResp += "**" + datum + "**  \n\n \n\n";
                        finalResp += "Buy Price: __" + data[datum].buy_price + "__  \n";
                        finalResp += "Sell Price: __" + data[datum].sell_price + "__  \n";
                        finalResp += "  \n\n";
                    }

                    var customMessage = new builder.Message(session)
                        .text(finalResp)
                        .textFormat("markdown")
                        .textLocale("en-us");

                    session.send(finalResp);
                })
                .catch((err: any) => {
                    console.log("Error: " + err);
                });
            break;
        case "/price eth":
            request({
                method: 'GET',
                url: apiUrl + "currency/ETHUSD"
            })
                .then((resp: any) => {
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
                        .then((resp: any) => {
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
                                .then((resp: any) => {
                                    //session.send("Done!");
                                    console.log("Response: " + resp);
                                    console.log("Response, variable data: " + resp["data"]);

                                    finalResp += "ETHMYR"
                                        + "  \n"
                                        + "Current Buy Price: MYR" + JSON.parse(resp)["data"]["buy_price"]
                                        + "  \n" // https://github.com/Microsoft/BotBuilder/issues/1112
                                        + "Current Sell Price: MYR" + JSON.parse(resp)["data"]["sell_price"];

                                    session.send(finalResp);
                                })
                                .catch((err: any) => {
                                    console.log(err);
                                });
                        })
                        .catch((err: any) => {
                            console.log(err);
                        });
                })
                .catch((err: any) => {
                    console.log(err);
                });
            break;
        default:
            // Ignore General Replies   
            //session.send("Sorry I don't get what you're saying!");
            break;
    }
});