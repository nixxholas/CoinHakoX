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

var mongoDb: any;
let liquidations: any;
// https://docs.mongodb.com/getting-started/node/insert/
// https://medium.com/ibm-watson-data-lab/environment-variables-or-keeping-your-secrets-secret-in-a-node-js-app-99019dfff716
MongoClient.connect('mongodb://' + process.env.dbUser + ':' + process.env.dbPass + '@' + process.env.dbURL, function (err: any, db: any) {
    assert.equal(null, err);
    console.log("Connected correctly to database server.");

    // Bind to the local variable
    mongoDb = db;
});

ws.on('open', function open() {
    //console.log("Sending subscription packet for liquidation");
    ws.send('{"op": "subscribe", "args": ["liquidation"]}');
});

ws.on('message', function incoming(data: any) {
    console.log("ws data: " + data);

    let parsedData = JSON.parse(data);

    // Sample Liquidation data
    // ws data: {"table":"liquidation","action":"insert","data":[{"orderID":"36f6774a-71ba-96c3-ef6c-87c2e597b327","symbol":"XBTUSD","side":"Buy","price":7228,"leavesQty":1000}]}
    // ws data: {"table":"liquidation","action":"delete","data":[{"orderID":"36f6774a-71ba-96c3-ef6c-87c2e597b327","symbol":"XBTUSD"}]}
    // ws data: {"table":"liquidation","action":"insert","data":[{"orderID":"c6be5050-82cb-3701-0559-dd9c756754a7","symbol":"XBTUSD","side":"Buy","price":7234.3,"leavesQty":1}]}
    // ws data: {"table":"liquidation","action":"insert","data":[{"orderID":"ce4aad3f-34d2-8ccb-cbfc-57602bbb81e6","symbol":"XBTUSD","side":"Buy","price":7234.3,"leavesQty":30000}]}
    // ws data: {"table":"liquidation","action":"delete","data":[{"orderID":"c6be5050-82cb-3701-0559-dd9c756754a7","symbol":"XBTUSD"},{"orderID":"ce4aad3f-34d2-8ccb-cbfc-57602bbb81e6","symbol":"XBTUSD"}]}
    // ws data: {"table":"liquidation","action":"insert","data":[{"orderID":"80a5edc2-a9e1-50a6-44e8-c5a43a6b9ec2","symbol":"XBTUSD","side":"Buy","price":7236.9,"leavesQty":56830}]}
    // ws data: {"table":"liquidation","action":"delete","data":[{"orderID":"80a5edc2-a9e1-50a6-44e8-c5a43a6b9ec2","symbol":"XBTUSD"}]}
    // ws data: {"table":"liquidation","action":"insert","data":[{"orderID":"80a5edc2-a9e1-50a6-44e8-c5a43a6b9ec2","symbol":"XBTUSD","side":"Buy","price":7259,"leavesQty":56830}]}
    // ws data: {"table":"liquidation","action":"delete","data":[{"orderID":"80a5edc2-a9e1-50a6-44e8-c5a43a6b9ec2","symbol":"XBTUSD"}]}
    // ws data: {"table":"liquidation","action":"insert","data":[{"orderID":"80a5edc2-a9e1-50a6-44e8-c5a43a6b9ec2","symbol":"XBTUSD","side":"Buy","price":7259,"leavesQty":56830}]}
    // ws data: {"table":"liquidation","action":"delete","data":[{"orderID":"80a5edc2-a9e1-50a6-44e8-c5a43a6b9ec2","symbol":"XBTUSD"}]}
    // ws data: {"table":"liquidation","action":"insert","data":[{"orderID":"e0975e55-44f9-8c45-f6a6-947656b5ef09","symbol":"XBTUSD","side":"Buy","price":7243.8,"leavesQty":8964}]}
    // ws data: {"table":"liquidation","action":"insert","data":[{"orderID":"14cee53c-fde4-a909-a9f5-ab28b43996e3","symbol":"XBTUSD","side":"Buy","price":7244.8,"leavesQty":11800}]}
    // ws data: {"table":"liquidation","action":"delete","data":[{"orderID":"e0975e55-44f9-8c45-f6a6-947656b5ef09","symbol":"XBTUSD"},{"orderID":"14cee53c-fde4-a909-a9f5-ab28b43996e3","symbol":"XBTUSD"}]}
    // ws data: {"table":"liquidation","action":"insert","data":[{"orderID":"8314cb69-4055-f409-a229-c2900a662f85","symbol":"XBTUSD","side":"Buy","price":7246.8,"leavesQty":3054}]}
    // ws data: {"table":"liquidation","action":"insert","data":[{"orderID":"fbaafcdb-9a51-e636-16cb-6e604991168c","symbol":"XBTUSD","side":"Buy","price":7245.8,"leavesQty":490348}]}
    // ws data: {"table":"liquidation","action":"delete","data":[{"orderID":"8314cb69-4055-f409-a229-c2900a662f85","symbol":"XBTUSD"},{"orderID":"fbaafcdb-9a51-e636-16cb-6e604991168c","symbol":"XBTUSD"}]}

    // Let's test some post-parsed properties...
    //console.log("ws data table type: " + parsedData["table"]);

    // Dynamic code first, worry later.
    switch (parsedData.table) {
        case "liquidation":
            // Data to handle:
            //
            // "data":[{"orderID":"8314cb69-4055-f409-a229-c2900a662f85","symbol":"XBTUSD"},
            // {"orderID":"fbaafcdb-9a51-e636-16cb-6e604991168c","symbol":"XBTUSD"}]
            //
            // Basically, we have an array of orders that are being filled. Some datums
            // would contain additional information such as "side", "price" and "leavesQty".
            // Only insert contains those.
            var innerData = parsedData.data;

            switch (parsedData.action) {
                case "insert":
                    for (let datum of parsedData.data) {
                        //console.log("Current datum orderID: " + datum.orderID); // works

                    }
                    break;
                case "partial":
                    // No action needed. 
                    break;
                case "update":
                    // No action needed. Either a position reduced notification or price changes.
                    break;
                case "delete":
                    break;
            }
            break;
        default:
            break;
    }
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

    // Retrieve the user's id
    // https://docs.microsoft.com/en-us/bot-framework/resources-identifiers-guide
    // https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-state
    let uid = session.message.address.user.id; // found you here => https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-request-payment
    let username = session.message.user.name;

    switch (msg) {
        case "/help":
            finalResp += "Hi, I am YushoBot. I can provide you information about crypto prices live. \n\n"
            finalResp += "  \n\n";
            finalResp += "> __/help__ Ask for help? \n\n";
            finalResp += "> __/all__ Retrieve all the prices from Coinhako \n\n";

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
        case "/subrektschannel":
            break;
        case "/subrekts":
            session.send("Hang on, let me sub you...");

            if (!uid) {
                session.send("I'm unable to subscribe you =(");
                break;
            } else {
                let user = new User(uid, username);
                let collection = mongoDb.collection("liquidsubs");

                // Perform database exists checks
                // https://stackoverflow.com/questions/29355134/mongodb-check-to-see-if-values-existnode-js
                collection.find({ _id: uid, _username: username }, { $exists: true }).toArray(function (err: any, doc: any) //find if a value exists
                {
                    // https://stackoverflow.com/questions/17769714/how-to-loop-through-an-array-in-mongodb
                    if (doc && doc.length > 0) //if it does
                    {
                        session.send("You're already subscribed.");
                    }
                    else if (!doc || doc.length == 0) // if it does not 
                    {
                        // Add this user to the subscription
                        collection.insertOne(user, function (err: any, res: any) {
                            if (err) session.send("An error has occured, ask nic to fix it: " + err);
                            //console.log("1 document inserted");
                            session.send("All done!");
                        });
                    }
                });
            }
            break;
        case "/unsubrekt":
            session.send("Hang on, let me unsub you...");

            if (!uid) {
                session.send("I'm unable to unsubscribe you =(");
                break;
            } else {
                let user = new User(uid, username);
                let collection = mongoDb.collection("liquidsubs");

                // Perform database exists checks
                // https://stackoverflow.com/questions/29355134/mongodb-check-to-see-if-values-existnode-js
                collection.find({ _id: uid, _username: username }, { $exists: true }).toArray(function (err: any, doc: any) //find if a value exists
                {
                    // https://stackoverflow.com/questions/17769714/how-to-loop-through-an-array-in-mongodb
                    if (doc && doc.length > 0) //if it does
                    {
                        // Add this user to the subscription
                        collection.deleteOne(user, function (err: any, res: any) {
                            if (err) session.send("An error has occured, ask nic to fix it: " + err);
                            //console.log("1 document inserted");
                            session.send("All done!");
                        });
                    }
                    else if (!doc || doc.length == 0) // if it does not 
                    {
                        session.send("You didn't even suscribe lol.");
                    }
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

function broadcastToLiquidSubs() {

}