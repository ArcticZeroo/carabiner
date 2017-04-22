let config  = require('../config/');
let request = require('request');

function createSlackRequestUrl(method, properties = {}){
    let base_url = config.base_url+method;
    let args     = [];

    for(let property of Object.keys(properties)){
        let value = properties[property];
        if(typeof value != 'string'){
            value = JSON.stringify(value);
        }
        args.push(`${property}=${encodeURIComponent(value)}`);
    }

    return `${base_url}?${args.join('&')}`;
}

function makeSlackRequest(url, args = {}, callback = ()=>{}){
    // Callback is (<Boolean>success, <?>result)
    request({url: createSlackRequestUrl(url, args), json: true}, (err, res, body)=>{
        // If there's a request error/response statusCode that isn't 200, callback(false, [err])
        if(err){
            return callback(err);
        }

        if(res.statusCode !== 200){
            if(body.error){
                return callback(body.error);
            }else{
                return callback(res.statusCode);
            }
        }

        // If body.ok is false then we tell them that all is not ok
        // and give them the error in the body.
        if(!body.ok){
            return callback(body.error);
        }

        // Otherwise it's good to go
        callback(null, body);
    });
}

exports.makeRequest = makeSlackRequest;