import ISlackWebApiArgs from './ISlackWebApiArgs';

export default interface ISlackWebApiMethods {
	api: {
		test: (args?: ISlackWebApiArgs) => Promise<any>;
	}
	auth: {
		revoke: (args?: ISlackWebApiArgs) => Promise<any>;
		test: (args?: ISlackWebApiArgs) => Promise<any>;
	}
	bots: {
		info: (args?: ISlackWebApiArgs) => Promise<any>;
		list: (args?: ISlackWebApiArgs) => Promise<any>;
	}
	channels: {
		archive: (args?: ISlackWebApiArgs) => Promise<any>;
		create: (args?: ISlackWebApiArgs) => Promise<any>;
		history: (args?: ISlackWebApiArgs) => Promise<any>;
		info: (args?: ISlackWebApiArgs) => Promise<any>;
		invite: (args?: ISlackWebApiArgs) => Promise<any>;
		join: (args?: ISlackWebApiArgs) => Promise<any>;
		kick: (args?: ISlackWebApiArgs) => Promise<any>;
		leave: (args?: ISlackWebApiArgs) => Promise<any>;
		list: (args?: ISlackWebApiArgs) => Promise<any>;
		mark: (args?: ISlackWebApiArgs) => Promise<any>;
		rename: (args?: ISlackWebApiArgs) => Promise<any>;
		setPurpose: (args?: ISlackWebApiArgs) => Promise<any>;
		setTopic: (args?: ISlackWebApiArgs) => Promise<any>;
		unarchive: (args?: ISlackWebApiArgs) => Promise<any>;
	}
	chat: {
		command: (args?: ISlackWebApiArgs) => Promise<any>;
		delete: (args?: ISlackWebApiArgs) => Promise<any>;
		postEphemeral: (args?: ISlackWebApiArgs) => Promise<any>;
		postMessage: (args?: ISlackWebApiArgs) => Promise<any>;
		unfurl: (args?: ISlackWebApiArgs) => Promise<any>;
		update: (args?: ISlackWebApiArgs) => Promise<any>;
	}
	conversations: {
		archive: (args?: ISlackWebApiArgs) => Promise<any>;
		close: (args?: ISlackWebApiArgs) => Promise<any>;
		create: (args?: ISlackWebApiArgs) => Promise<any>;
		history: (args?: ISlackWebApiArgs) => Promise<any>;
		info: (args?: ISlackWebApiArgs) => Promise<any>;
		invite: (args?: ISlackWebApiArgs) => Promise<any>;
		join: (args?: ISlackWebApiArgs) => Promise<any>;
		kick: (args?: ISlackWebApiArgs) => Promise<any>;
		leave: (args?: ISlackWebApiArgs) => Promise<any>;
		list: (args?: ISlackWebApiArgs) => Promise<any>;
		members: (args?: ISlackWebApiArgs) => Promise<any>;
		open: (args?: ISlackWebApiArgs) => Promise<any>;
		rename: (args?: ISlackWebApiArgs) => Promise<any>;
		replies: (args?: ISlackWebApiArgs) => Promise<any>;
		setPurpose: (args?: ISlackWebApiArgs) => Promise<any>;
		setTopic: (args?: ISlackWebApiArgs) => Promise<any>;
		unarchive: (args?: ISlackWebApiArgs) => Promise<any>;
	}
	dnd: {
		endDnd: (args?: ISlackWebApiArgs) => Promise<any>;
		endSnooze: (args?: ISlackWebApiArgs) => Promise<any>;
		info: (args?: ISlackWebApiArgs) => Promise<any>;
		setSnooze: (args?: ISlackWebApiArgs) => Promise<any>;
		teamInfo: (args?: ISlackWebApiArgs) => Promise<any>;
	}
	emoji: {
		list: (args?: ISlackWebApiArgs) => Promise<any>;
	}
	files: {
		delete: (args?: ISlackWebApiArgs) => Promise<any>;
		edit: (args?: ISlackWebApiArgs) => Promise<any>;
		info: (args?: ISlackWebApiArgs) => Promise<any>;
		list: (args?: ISlackWebApiArgs) => Promise<any>;
		revokePublicURL: (args?: ISlackWebApiArgs) => Promise<any>;
		share: (args?: ISlackWebApiArgs) => Promise<any>;
		sharedPublicURL: (args?: ISlackWebApiArgs) => Promise<any>;
		upload: (args?: ISlackWebApiArgs) => Promise<any>;
	}
	groups: {
		archive: (args?: ISlackWebApiArgs) => Promise<any>;
		close: (args?: ISlackWebApiArgs) => Promise<any>;
		create: (args?: ISlackWebApiArgs) => Promise<any>;
		createChild: (args?: ISlackWebApiArgs) => Promise<any>;
		history: (args?: ISlackWebApiArgs) => Promise<any>;
		info: (args?: ISlackWebApiArgs) => Promise<any>;
		invite: (args?: ISlackWebApiArgs) => Promise<any>;
		kick: (args?: ISlackWebApiArgs) => Promise<any>;
		leave: (args?: ISlackWebApiArgs) => Promise<any>;
		list: (args?: ISlackWebApiArgs) => Promise<any>;
		mark: (args?: ISlackWebApiArgs) => Promise<any>;
		open: (args?: ISlackWebApiArgs) => Promise<any>;
		rename: (args?: ISlackWebApiArgs) => Promise<any>;
		replies: (args?: ISlackWebApiArgs) => Promise<any>;
		setPurpose: (args?: ISlackWebApiArgs) => Promise<any>;
		setTopic: (args?: ISlackWebApiArgs) => Promise<any>;
		unarchive: (args?: ISlackWebApiArgs) => Promise<any>;
	}
	im: {
		close: (args?: ISlackWebApiArgs) => Promise<any>;
		history: (args?: ISlackWebApiArgs) => Promise<any>;
		list: (args?: ISlackWebApiArgs) => Promise<any>;
		mark: (args?: ISlackWebApiArgs) => Promise<any>;
		open: (args?: ISlackWebApiArgs) => Promise<any>;
		replies: (args?: ISlackWebApiArgs) => Promise<any>;
	}
	mpim: {
		close: (args?: ISlackWebApiArgs) => Promise<any>;
		history: (args?: ISlackWebApiArgs) => Promise<any>;
		list: (args?: ISlackWebApiArgs) => Promise<any>;
		mark: (args?: ISlackWebApiArgs) => Promise<any>;
		open: (args?: ISlackWebApiArgs) => Promise<any>;
		replies: (args?: ISlackWebApiArgs) => Promise<any>;
	}
	oauth: {
		access: (args?: ISlackWebApiArgs) => Promise<any>;
	}
	pins: {
		add: (args?: ISlackWebApiArgs) => Promise<any>;
		list: (args?: ISlackWebApiArgs) => Promise<any>;
		remove: (args?: ISlackWebApiArgs) => Promise<any>;
	}
	reactions: {
		add: (args?: ISlackWebApiArgs) => Promise<any>;
		get: (args?: ISlackWebApiArgs) => Promise<any>;
		list: (args?: ISlackWebApiArgs) => Promise<any>;
		remove: (args?: ISlackWebApiArgs) => Promise<any>;
	}
	reminders: {
		add: (args?: ISlackWebApiArgs) => Promise<any>;
		complete: (args?: ISlackWebApiArgs) => Promise<any>;
		delete: (args?: ISlackWebApiArgs) => Promise<any>;
		info: (args?: ISlackWebApiArgs) => Promise<any>;
		list: (args?: ISlackWebApiArgs) => Promise<any>;
	}
	rtm: {
		connect: (args?: ISlackWebApiArgs) => Promise<any>;
		start: (args?: ISlackWebApiArgs) => Promise<any>;
	}
	search: {
		all: (args?: ISlackWebApiArgs) => Promise<any>;
		files: (args?: ISlackWebApiArgs) => Promise<any>;
		messages: (args?: ISlackWebApiArgs) => Promise<any>;
	}
	stars: {
		add: (args?: ISlackWebApiArgs) => Promise<any>;
		list: (args?: ISlackWebApiArgs) => Promise<any>;
		remove: (args?: ISlackWebApiArgs) => Promise<any>;
	}
	team: {
		accessLogs: (args?: ISlackWebApiArgs) => Promise<any>;
		billableInfo: (args?: ISlackWebApiArgs) => Promise<any>;
		info: (args?: ISlackWebApiArgs) => Promise<any>;
		profile: {
			get: (args?: ISlackWebApiArgs) => Promise<any>;
		}
	}
	teams: {
		integrationLogs: (args?: ISlackWebApiArgs) => Promise<any>;
	}
	usergroups: {
		create: (args?: ISlackWebApiArgs) => Promise<any>;
		disable: (args?: ISlackWebApiArgs) => Promise<any>;
		enable: (args?: ISlackWebApiArgs) => Promise<any>;
		list: (args?: ISlackWebApiArgs) => Promise<any>;
		update: (args?: ISlackWebApiArgs) => Promise<any>;
		users: {
			list: (args?: ISlackWebApiArgs) => Promise<any>;
			update: (args?: ISlackWebApiArgs) => Promise<any>;
		}
	}
	users: {
		admin: {
			invite: (args?: ISlackWebApiArgs) => Promise<any>;
			setInactive: (args?: ISlackWebApiArgs) => Promise<any>;
		}
		deletePhoto: (args?: ISlackWebApiArgs) => Promise<any>;
		getPresence: (args?: ISlackWebApiArgs) => Promise<any>;
		identity: (args?: ISlackWebApiArgs) => Promise<any>;
		info: (args?: ISlackWebApiArgs) => Promise<any>;
		list: (args?: ISlackWebApiArgs) => Promise<any>;
		prefs: {
			get: (args?: ISlackWebApiArgs) => Promise<any>;
		}
		profile: {
			get: (args?: ISlackWebApiArgs) => Promise<any>;
			set: (args?: ISlackWebApiArgs) => Promise<any>;
		}
		setActive: (args?: ISlackWebApiArgs) => Promise<any>;
		setPhoto: (args?: ISlackWebApiArgs) => Promise<any>;
		setPresence: (args?: ISlackWebApiArgs) => Promise<any>;
	}
}