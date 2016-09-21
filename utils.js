class Chat{
    constructor(slack){
        this.api = slack;
    }

    postMessage(channel, message, as_user, other_args, callback){
        if(typeof as_user == "function"){
            callback = as_user;
            as_user  = true;
        }
        as_user = as_user || true;
        var args = {
            channel: channel,
            text: message,
            as_user: as_user
        }
        for(var arg in other_args){
            args[arg] = other_args[arg];
        }
        this.api.chat.postMessage(args, callback);
    }

    delete(message, callback){
        if(!message) return;
        this.api.chat.delete({
            ts: message.ts,
            channel: message.channel
        }, callback)
    }
}

class Users{
    constructor(slack){
        this.api = slack;
    }

    getUserFromID(id, callback){
        this.api.users.info({
            user: id
        }, (response)=>{callback(response)});
    }
    getNameFromID(id, callback){
        this.api.users.info({
            user: id
        }, (response)=>{
            if(response.ok){
                return callback(response.user.name);
            }
            return callback(false);
        });
    }
}

class UtilContainer{
    constructor(slack){
        this.api            = slack;
        this.chat           = new Chat(this.api);
        this.users          = new Users(this.api);
        this.getUserMention = function(id){return `<@${id}>`;}
    }
}

module.exports = {
    getUtils: function(slack){
        return new UtilContainer(slack);
    }
}