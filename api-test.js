var log        = require('frozor-logger');
var token      = require('./token');
var slackAPI   = require('./slack');
var slackBot   = slackAPI.createBot(token);
var apiUtils   = slackAPI.utils;
var slackUtils = apiUtils.getUtils(slackBot);

slackUtils.chat.postMessage('general', 'Hello World!', (response)=>{
    if(response.ok) log.info(`Successfully sent message to '${log.chalk.cyan('#general')}'!`);
});