let config = require('../config/');

function createRequestUrl(method, properties = {}){
    let base_url = config.base_url+method;
    let args     = [];

    for(let property of Object.keys(properties)){
        args.push(`${property}=${properties[property]}`);
    }

    return `${base_url}?${args.join('&')}`;
}

