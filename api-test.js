let SlackAPI = require('./lib/SlackAPI');

let token    = require('./token');
let slackBot = new SlackAPI(token, 'TEST');

slackBot.rtm.start();

slackBot.on('hello', ()=>{
    console.log('Slack said hi!');
});

slackBot.methods.auth.test().then(console.log).catch(console.log);