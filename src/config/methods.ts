const methodNames: string[] = [
    'api.test',
    'auth.test',
    'auth.revoke',
    'bots.info',
    'oauth.access',
    'channels.archive',
    'channels.create',
    'channels.history',
    'channels.info',
    'channels.invite',
    'channels.join',
    'channels.kick',
    'channels.leave',
    'channels.list',
    'channels.mark',
    'channels.rename',
    'channels.setPurpose',
    'channels.setTopic',
    'channels.unarchive',
    'chat.delete',
    'chat.postMessage',
    'chat.postEphemeral',
    'chat.update',
    'chat.unfurl',
    'conversations.archive',
    'conversations.close',
    'conversations.create',
    'conversations.history',
    'conversations.info',
    'conversations.invite',
    'conversations.join',
    'conversations.kick',
    'conversations.leave',
    'conversations.list',
    'conversations.members',
    'conversations.open',
    'conversations.rename',
    'conversations.replies',
    'conversations.setPurpose',
    'conversations.setTopic',
    'conversations.unarchive',
    'dnd.endDnd',
    'dnd.endSnooze',
    'dnd.info',
    'dnd.setSnooze',
    'dnd.teamInfo',
    'emoji.list',
    'files.delete',
    'files.info',
    'files.list',
    'files.upload',
    'files.revokePublicURL',
    'files.sharedPublicURL',
    'groups.archive',
    'groups.close',
    'groups.create',
    'groups.createChild',
    'groups.history',
    'groups.info',
    'groups.invite',
    'groups.kick',
    'groups.leave',
    'groups.list',
    'groups.mark',
    'groups.open',
    'groups.rename',
    'groups.replies',
    'groups.setPurpose',
    'groups.setTopic',
    'groups.unarchive',
    'im.close',
    'im.history',
    'im.list',
    'im.mark',
    'im.open',
    'im.replies',
    'mpim.close',
    'mpim.history',
    'mpim.list',
    'mpim.mark',
    'mpim.open',
    'mpim.replies',
    'pins.add',
    'pins.list',
    'pins.remove',
    'reactions.add',
    'reactions.get',
    'reactions.list',
    'reactions.remove',
    'reminders.add',
    'reminders.complete',
    'reminders.delete',
    'reminders.info',
    'reminders.list',
    'rtm.connect',
    'rtm.start',
    'search.all',
    'search.files',
    'search.messages',
    'stars.add',
    'stars.list',
    'stars.remove',
    'team.accessLogs',
    'team.billableInfo',
    'team.accessLogs',
    'team.info',
    'teams.integrationLogs',
    'team.profile.get',
    'usergroups.create',
    'usergroups.disable',
    'usergroups.enable',
    'usergroups.list',
    'usergroups.update',
    'usergroups.users.list',
    'usergroups.users.update',
    'users.getPresence',
    'users.info',
    'users.identity',
    'users.deletePhoto',
    'users.list',
    'users.setActive',
    'users.setPresence',
    'users.setPhoto',
    'users.profile.get',
    'users.profile.set',

    // Undocumented API methods
    // See https://github.com/ErikKalkoken/slackApiDoc
    // These may become inaccessible at any time.
    'bots.list',
    'chat.command',
    'files.edit',
    'files.delete',
    'files.share',
    'users.admin.invite',
    'users.admin.setInactive',
    'users.prefs.get',
    'users.profile.set'
];

export default methodNames;