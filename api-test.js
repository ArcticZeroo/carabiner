let SlackAPI = require('./lib/SlackAPI');

let slackBot = new SlackAPI('xoxb-47049102661-4j7PIjq3o6cdhXKgilfABeVL');
slackBot.rtm.start();
slackBot.on('hello', ()=>{
    console.log('hi');
});