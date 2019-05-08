import SlackWebApiMethod from './SlackWebApiMethod';
import IDeleteMessageArgs from "./methods/chat/IDeleteMessageArgs";
import IReactionsAddArgs from "./methods/reactions/IReactionsAddArgs";

export default interface ISlackWebApiMethods {
	api: {
		test: SlackWebApiMethod;
	}
	auth: {
		revoke: SlackWebApiMethod;
		test: SlackWebApiMethod;
	}
	bots: {
		info: SlackWebApiMethod;
		list: SlackWebApiMethod;
	}
	channels: {
		archive: SlackWebApiMethod;
		create: SlackWebApiMethod;
		history: SlackWebApiMethod;
		info: SlackWebApiMethod;
		invite: SlackWebApiMethod;
		join: SlackWebApiMethod;
		kick: SlackWebApiMethod;
		leave: SlackWebApiMethod;
		list: SlackWebApiMethod;
		mark: SlackWebApiMethod;
		rename: SlackWebApiMethod;
		setPurpose: SlackWebApiMethod;
		setTopic: SlackWebApiMethod;
		unarchive: SlackWebApiMethod;
	}
	chat: {
		command: SlackWebApiMethod;
		delete: SlackWebApiMethod<IDeleteMessageArgs>;
		postEphemeral: SlackWebApiMethod;
		postMessage: SlackWebApiMethod;
		unfurl: SlackWebApiMethod;
		update: SlackWebApiMethod;
	}
	conversations: {
		archive: SlackWebApiMethod;
		close: SlackWebApiMethod;
		create: SlackWebApiMethod;
		history: SlackWebApiMethod;
		info: SlackWebApiMethod;
		invite: SlackWebApiMethod;
		join: SlackWebApiMethod;
		kick: SlackWebApiMethod;
		leave: SlackWebApiMethod;
		list: SlackWebApiMethod;
		members: SlackWebApiMethod;
		open: SlackWebApiMethod;
		rename: SlackWebApiMethod;
		replies: SlackWebApiMethod;
		setPurpose: SlackWebApiMethod;
		setTopic: SlackWebApiMethod;
		unarchive: SlackWebApiMethod;
	}
	dnd: {
		endDnd: SlackWebApiMethod;
		endSnooze: SlackWebApiMethod;
		info: SlackWebApiMethod;
		setSnooze: SlackWebApiMethod;
		teamInfo: SlackWebApiMethod;
	}
	emoji: {
		list: SlackWebApiMethod;
	}
	files: {
		delete: SlackWebApiMethod;
		edit: SlackWebApiMethod;
		info: SlackWebApiMethod;
		list: SlackWebApiMethod;
		revokePublicURL: SlackWebApiMethod;
		share: SlackWebApiMethod;
		sharedPublicURL: SlackWebApiMethod;
		upload: SlackWebApiMethod;
	}
	groups: {
		archive: SlackWebApiMethod;
		close: SlackWebApiMethod;
		create: SlackWebApiMethod;
		createChild: SlackWebApiMethod;
		history: SlackWebApiMethod;
		info: SlackWebApiMethod;
		invite: SlackWebApiMethod;
		kick: SlackWebApiMethod;
		leave: SlackWebApiMethod;
		list: SlackWebApiMethod;
		mark: SlackWebApiMethod;
		open: SlackWebApiMethod;
		rename: SlackWebApiMethod;
		replies: SlackWebApiMethod;
		setPurpose: SlackWebApiMethod;
		setTopic: SlackWebApiMethod;
		unarchive: SlackWebApiMethod;
	}
	im: {
		close: SlackWebApiMethod;
		history: SlackWebApiMethod;
		list: SlackWebApiMethod;
		mark: SlackWebApiMethod;
		open: SlackWebApiMethod;
		replies: SlackWebApiMethod;
	}
	mpim: {
		close: SlackWebApiMethod;
		history: SlackWebApiMethod;
		list: SlackWebApiMethod;
		mark: SlackWebApiMethod;
		open: SlackWebApiMethod;
		replies: SlackWebApiMethod;
	}
	oauth: {
		access: SlackWebApiMethod;
	}
	pins: {
		add: SlackWebApiMethod;
		list: SlackWebApiMethod;
		remove: SlackWebApiMethod;
	}
	reactions: {
		add: SlackWebApiMethod<IReactionsAddArgs>;
		get: SlackWebApiMethod;
		list: SlackWebApiMethod;
		remove: SlackWebApiMethod;
	}
	reminders: {
		add: SlackWebApiMethod;
		complete: SlackWebApiMethod;
		delete: SlackWebApiMethod;
		info: SlackWebApiMethod;
		list: SlackWebApiMethod;
	}
	rtm: {
		connect: SlackWebApiMethod;
		start: SlackWebApiMethod;
	}
	search: {
		all: SlackWebApiMethod;
		files: SlackWebApiMethod;
		messages: SlackWebApiMethod;
	}
	stars: {
		add: SlackWebApiMethod;
		list: SlackWebApiMethod;
		remove: SlackWebApiMethod;
	}
	team: {
		accessLogs: SlackWebApiMethod;
		billableInfo: SlackWebApiMethod;
		info: SlackWebApiMethod;
		profile: {
			get: SlackWebApiMethod;
		}
	}
	teams: {
		integrationLogs: SlackWebApiMethod;
	}
	usergroups: {
		create: SlackWebApiMethod;
		disable: SlackWebApiMethod;
		enable: SlackWebApiMethod;
		list: SlackWebApiMethod;
		update: SlackWebApiMethod;
		users: {
			list: SlackWebApiMethod;
			update: SlackWebApiMethod;
		}
	}
	users: {
		admin: {
			invite: SlackWebApiMethod;
			setInactive: SlackWebApiMethod;
		}
		deletePhoto: SlackWebApiMethod;
		getPresence: SlackWebApiMethod;
		identity: SlackWebApiMethod;
		info: SlackWebApiMethod;
		list: SlackWebApiMethod;
		prefs: {
			get: SlackWebApiMethod;
		}
		profile: {
			get: SlackWebApiMethod;
			set: SlackWebApiMethod;
		}
		setActive: SlackWebApiMethod;
		setPhoto: SlackWebApiMethod;
		setPresence: SlackWebApiMethod;
	}
}