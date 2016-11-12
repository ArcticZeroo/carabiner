var Logger     = require('frozor-logger');
var log        = new Logger('API TEST');
var token      = require('./token');
var slackAPI   = require('./slack');
var slackBot   = slackAPI.createBot(token);
var apiUtils   = slackAPI.utils;
var slackUtils = apiUtils.getUtils(slackBot);

slackBot.auth.test((response)=>{
    if(response.ok){
        log.info('Successfully authenticated with the Slack API!');
    }else{
        log.error(`Unable to authenticate with Slack API: ${response.error}`);
        process.exit();
    }
});

slackBot.rtm.start();