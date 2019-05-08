export default {
    url: 'https://slack.com/api/',
    rtm: {
        migrationRetryBase: 2500,
        migrationRetryIncrement: 1000,
        goodbyeWaitTime: 1000
    }
};