const fs = require('fs');
import { Price } from './objects/price';

const restify = require('restify');
const builder = require('botbuilder');
const request = require('request-promise-native');

const server = restify.createServer();
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

bot.dialog('/', (session: any) => {
    //console.log(session.message.text);
    var msg = session.message.text;

    switch (msg) {
        case "/price btc":
            request({
                    method: 'GET',
                    url: apiUrl + "BTCSGD"
                })
                .then((resp: any) => {
                    //session.send("Done!");
                    console.log("Response: " + resp);
                    console.log("Response, variable data: " + resp["data"]);

                    session.send("Current: SGD" + JSON.parse(resp)["data"]["buy_price"]);
                })
                .catch((err: any) => {
                    console.log(err);
                });
        break;
        default:
            session.send("Sorry I don't get what you're saying!");
        break;
    }
});