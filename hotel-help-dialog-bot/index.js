"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

// This is a Hotel reservation waterfall dialog example
var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

bot.dialog('/', [
    function (session) {
        session.send("Welcome to the Hotel California");
        session.beginDialog('hotelCheckIn');
    },
    function (session, results) {
        session.dialogData.reservationDate = builder.EntityRecognizer.resolveTime([results.response]);
        session.beginDialog('hotelGuests');
    },
    function (session, results) {
        session.dialogData.guestsNumber = results.response;
        session.beginDialog('hotelNights');
    },
    function (session, results) {
        session.dialogData.guestsNights = results.response;
        session.beginDialog('hotelBooking');
    },
    function (session, results) {
        session.dialogData.bookingName = results.response;

        session.send(`Your booking has been confirmed. Boooking details: <br/>Date/Check in time: ${session.dialogData.reservationDate} <br/>Number of guests: ${session.dialogData.guestsNumber} <br/>Number of nights: ${session.dialogData.guestsNights}<br/>Booking name: ${session.dialogData.bookingName}`);
        session.endDialog();
    }
]);

// Check in conversation dialog
bot.dialog('hotelCheckIn', [
    function (session) {
        builder.Prompts.time(session, "When would you like to check in and at what time? (e.g.: March 24th at 12pm)");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);

// Guest number conversation dialog
bot.dialog('hotelGuests', [
    function (session) {
        builder.Prompts.text(session, "How many guests will be staying?");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
])
.beginDialogAction('hotelGuestsHelpAction', 'hotelGuestsHelp', { matches: /^help$/i });

bot.dialog('hotelGuestsHelp', function(session, args, next) {
    var msg = "There's plenty of room at the Hotel California. Any time of year, you can have a room here.";
    session.endDialog(msg);
});

// Number of nights conversation dialog
bot.dialog('hotelNights', [
    function (session) {
        builder.Prompts.text(session, "and for how many nights?");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);

// Booking name conversation dialog
bot.dialog('hotelBooking', [
    function (session) {
        builder.Prompts.text(session, "Can I take a name to hold the booking under please?");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);


if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(XXXX, function() {
        console.log('test bot endpont at http://localhost:XXXX/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}