module.exports = {
    Client: require('./lib/client/Client'),
    ...require('./lib/structures'),
    ...require('./lib/enum/index'),
    ...require('./lib/util')
};