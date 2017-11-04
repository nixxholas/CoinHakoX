const fs = require('fs');
const f = require('util').format;
import { Price } from './objects/price';
import { User } from './objects/user';

const restify = require('restify');
const builder = require('botbuilder');
const request = require('request-promise-native');
const WebSocket = require('ws');
const ws = new WebSocket('wss://www.bitmex.com/realtime');
//const wsOKC = new WebSocket('wss://real.okcoin.com:10440/websocket');

const MongoClient = require('mongodb').MongoClient;
const MongoObjectId = require('mongodb').ObjectID;
const assert = require('assert');

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log("Server is up!");
});

// https://docs.mongodb.com/getting-started/node/insert/
// https://medium.com/ibm-watson-data-lab/environment-variables-or-keeping-your-secrets-secret-in-a-node-js-app-99019dfff716
let MongoDb = MongoClient.connect('mongodb://' + process.env.dbUser + ':' + process.env.dbPass + '@' + process.env.dbURL, function(err: any, db: any) {
    assert.equal(null, err);
    console.log("Connected correctly to database server.");

    return db;
});

ws.on('open', function open() {
    console.log("Sending subscription packet for liquidation");
    ws.send('{"op": "subscribe", "args": ["liquidation"]}');
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
    
    // Text formatting
    // https://docs.microsoft.com/en-us/bot-framework/portal-channel-inspector#text-formatting

    var msg = session.message.text;
    let finalResp: string = "";

    switch (msg) {
        case "/help":
            finalResp += "Hi, I am YushoBot. I can provide you information about Coinhako's prices live. \n\n"
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
                        finalResp += "- Buy Price: __" + data[datum].buy_price + "__  \n";
                        finalResp += "- Sell Price: __" + data[datum].sell_price + "__  \n";
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
        case "/subrekts":
            session.send("Hang on, let me sub you...");

            // Retrieve the user's id
            let uid = session.message.address.user.id; // found you here => https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-request-payment

            if (!uid) {
                session.send("I'm unable to subscribe you =(");
                break;
            } else {
                let user = new User(uid);
                MongoClient.collection("liquidsubs").insertOne(user, function(err: any, res: any) {
                  if (err) session.send("An error has occured, ask nic to fix it: " + err);
                  console.log("1 document inserted");
                });
            }
            break;
        // case "/username":
        //     session.send(session.message.user.name);
        // case "/uid":
        //     session.send(session.message.address.user.id);
        default:
            // Ignore General Replies   
            //session.send("Sorry I don't get what you're saying!");
            break;
    }
});