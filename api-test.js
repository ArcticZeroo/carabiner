var log      = require('frozor-logger');
var token    = require('./token');
var slackAPI = require('./slack');
var slackBot = slackAPI.createBot(token);

slackBot.chat.postMessage({
    channel: 'general',
    text: 'Test Message!'
}, (response)=>{
    if(response.ok) log.info(`Successfully sent message to slack!`);
})