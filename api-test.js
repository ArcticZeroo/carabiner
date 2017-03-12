let SlackAPI = require('./lib/SlackAPI');

let token    = require('./token');
let slackBot = new SlackAPI(token);

/*slackBot.methods.auth.test({}, (success, res)=>{
    console.log(success);
    console.log(JSON.stringify(res));
});*/

slackBot.rtm.start();

slackBot.methods.chat.postMessage({channel: 'chat', text: `Seven cats meow meow meow`, as_user: true}, (err, res)=>{
    console.log(err);
    console.log(res);
});

slackBot.on('hello', ()=>{
    console.log('Slack said hi!');

    slackBot.storage.self.get((err, res)=>{
        if(err) console.log('could not get self storage');
        else console.log(JSON.stringify(res));
    });
});

