let config  = require('../config/');
let request = require('request');

function createSlackRequestUrl(method, properties = {}){
    let base_url = config.base_url+method;
    let args     = [];

    for(let property of Object.keys(properties)){
        args.push(`${property}=${properties[property]}`);
    }

    return `${base_url}?${args.join('&')}`;
}

function makeSlackRequest(url, args = {}, callback = ()=>{}){
    //Callback is (<Boolean>success, <?>result)
    request({url: createSlackRequestUrl(url, args), json: true}, (err, res, body)=>{
        //If there's a request error/response statusCode that isn't 200, callback(false, [err])
        if(err)                   return callback(false, err);
        if(res.statusCode != 200) return callback(false, body);

        //If body.ok is false then it means that the request was unsuccessful,
        //BUT going to pass this off to the user as success = true because
        //the request itself was a success, and they need to do the
        //error handling.

        //if(!body.ok)              return callback(false, body.error);

        //Otherwise it's good to go
        callback(true, body);
    });
}

exports.makeRequest = makeSlackRequest;