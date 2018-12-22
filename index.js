module.exports = {
    Client: require('./lib/client/Client'),
    ...require('./lib/structures/index'),
    ...require('./lib/enum/index'),
    ...require('./lib/util/index')
};