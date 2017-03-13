# Frozor-Slack
A slack API for node that isn't (completely) stupid.


Dependencies:
* request
* frozor-websocket
    * frozor-logger
    
If you aren't a fan of frozor-logger (which is understandable, it needs a rewrite and I made it specifically for my own uses), just modify frozor-websocket to use a different module, or have frozor-logger return a different module's exports.

Usage:
```$xslt
const log = new (require('frozor-logger'))('SLACK');
const SlackAPI = require('frozor-slack');

let bot = new SlackAPI(process.env.SLACK_TOKEN);

bot.rtm.start();

bot.rtm.start();

bot.methods.chat.postMessage({channel: 'chat', text: `Seven cats meow meow meow`, as_user: true}, (err, res)=>{
    log.debug(err);
    log.debug(res);
});

bot.on('hello', ()=>{
    log.info('Slack said hi!');

    bot.storage.self.get((err, res)=>{
        if(err) log.error('could not get self storage');
        else log.info(JSON.stringify(res));
    });
});
```

Features:

* Full slack Web API and RTM API support
* User, channel, group storage with a callback that will look up the information if it can be obtained and does not exist.