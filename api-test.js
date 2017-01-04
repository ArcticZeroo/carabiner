let SlackAPI = require('./lib/SlackAPI');

let token    = require('./token');
let slackBot = new SlackAPI(token);

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