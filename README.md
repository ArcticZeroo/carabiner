# Frozor-Slack
A slack API for node that isn't (completely) stupid.

Depdendencies:
* chalk
* frozor-logger
* request
* websocket

Usage:
```
var log          = require('frozor-logger');

//The API you can use to create infinite bots.
var slackAPI      = require('frozor-slack');
//The API Utils you can use for infinite bots.
var apiUtils      = slackAPI.utils;

//An actual slack bot you can manipulate.
var slackBot      = slackAPI.createBot(YOUR_TOKEN_HERE);

//Utils for the slackBot. Requires a slackBot as an argument for getUtils, and each separate slackBot you want a util for needs its own getUtils call. You could do it dynamically, but why would you want to do that to yourself?
var slackUtils    = apiUtils.getUtils(slackBot);
```

You can do everything without utils, but the utils make it slightly more user-friendly in my opinion. The best part is that it automatically adds the as_user and sets it to true for chat.postMessage!

API Methods are documented on slack's official API documentation; https://api.slack.com/methods
Everything is UNMODIFIED JSON. This means there are no user objects, channel objects, etc. and you'll have to create those yourself (or steal one from my Self-Bot project).

Usually, you will want to start a file by verifying your auth.

```
slackBot.auth.test((response)=>{
  if(response.ok){
    log.info('Successfully authenticated with the Slack API!');
  }else{
    log.error(`Unable to authenticate with Slack API: ${response.error}`);
    process.exit();
  }
});
```

Then you can do things like start RTM and respond to events:

```
slackBot.rtm.start();

//Hello is the first event fired on RTM connect.
slackBot.on('hello', ()=>{
  log.info(`Connected to RTM as ${log.chalk.cyan(slackBot.info.getUserName())}@${log.chalk.cyan(slackBot.info.getUserID())} to ${log.chalk.cyan(slackBot.info.getTeamName())}!`);
});

//Echoes message
slackBot.on('message', (message)=>{
  //Make sure you're not responding
  if(message.subtype || message.user == slackBot.info.getUserID()) return;
  slackUtils.chat.postMessage(message.channel, message.text);
});
```
