import Client from '../client/Client';
import EventHandler from './handler';
import User from '../structures/user/User';

export default class TeamEventHandler extends EventHandler {
    constructor(client: Client, options = {}) {
        super(client, { ...options, name: 'team' });
    }

    listen() {
        /**
         * Emitted when a member joins a slack team
         * @event Client#teamMemberJoin
         * @param {User} user - The user that joined the team.
         */
        this.emitter.on('team_join', data => {
            const user = new User(this.client, data.user) ;

            this.client.users.set(user.id, user);

            this.emit('memberJoin', user);
        });

        /**
         * Emitted when this.client team's domain is changed.
         * @event Client#teamDomainChange
         * @param {object} data - Event data
         * @param {String} data.newDomain - The new team domain
         * @param {String} data.oldDomain - The old team domain
         */
        this.emitter.on('team_domain_change', data => {
            const oldDomain = this.client.team.domain;
            this.client.team.domain = data.domain;
            this.emit('domainChange', { oldDomain, newDomain: data.domain });
        });

        /**
         * Emitted when this.client team's name is renamed.
         * @event Client#teamRename
         * @param {object} data - Event data
         * @param {String} data.newName - The new team name
         * @param {String} data.oldName - The old team name
         */
        this.emitter.on('team_rename', data => {
            const oldName = this.client.team.name;
            this.client.team.name = data.name;
            this.emit('rename', { oldName, newName: data.name });
        });
    }
}