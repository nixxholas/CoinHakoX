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

bot.dialog('/', (session: any) => {
    //console.log(session.message.text);
    var msg = session.message.text;
    let finalResp: string = "";

    switch (msg) {
        case "/help":
            break;
        case "/price btc":
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

                    //session.send(data.BTCSGD.buy_price);

                    // Store the items for the card to render
                    let items: any;

                    for (let pair of data) {
                        //console.log(pair.buy_price);
                    }

                    let card = {
                        'contentType': 'application/vnd.microsoft.card.adaptive',
                        'content': {
                            'type': 'AdaptiveCard',
                            'body': [
                                {
                                    'type': 'Container',
                                    'items': items,
                                    // 'items': [
                                    //     {
                                    //         'type': 'TextBlock',
                                    //         'text': ' in ',
                                    //         'weight': 'bolder',
                                    //     },
                                    //     {
                                    //         'type': 'TextBlock',
                                    //         'text': 'hi',
                                    //     },
                                    //     {
                                    //         'type': 'Image',
                                    //         'size': 'auto',
                                    //         // 'url': hotel.image
                                    //     },
                                    //     {
                                    //         'type': 'ImageSet',
                                    //         'imageSize': 'medium',
                                    //         'separation': 'strong',
                                    //         // 'images': hotel.moreImages.map((img) => ({
                                    //         //     'type': 'Image',
                                    //         //     'url': img
                                    //         // }))
                                    //     }
                                    // ],
                                    // 'selectAction': {
                                    //     'type': 'Action.OpenUrl',
                                    //     'url': 'https://dev.botframework.com/'
                                    // }
                                }
                            ]
                        }
                    };

                    let msgReply = new builder.Message(session)
                                            .addAttachment(card);

                    //session.send(msgReply);

                    // finalResp += "BTCMYR"
                    //     + "  \n"
                    //     + "Current Buy Price: MYR" + JSON.parse(resp)["data"]["buy_price"]
                    //     + "  \n" // https://github.com/Microsoft/BotBuilder/issues/1112
                    //     + "Current Sell Price: MYR" + JSON.parse(resp)["data"]["sell_price"];

                    //console.log(finalResp);

                    //session.send(finalResp);
                })
                .catch((err: any) => {
                    console.log(err);
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
