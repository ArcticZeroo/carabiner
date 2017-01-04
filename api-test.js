let SlackAPI = require('./lib/SlackAPI');

let slackBot = new SlackAPI('xoxb-47049102661-4j7PIjq3o6cdhXKgilfABeVL');

/*slackBot.methods.auth.test({}, (success, res)=>{
    console.log(success);
    console.log(JSON.stringify(res));
});*/

//slackBot.rtm.start();

slackBot.methods.chat.postMessage({channel: 'chat', text: `Long text here`}, (success, res)=>{
    console.log(success);
    console.log(res);
});

slackBot.on('hello', ()=>{

});