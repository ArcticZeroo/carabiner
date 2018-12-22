import Collection from '@arcticzeroo/collection';
import Client from '../client/Client';
import Conversation from './conversation/Conversation';
import User from './user/User';
const SlackUtil = require('../util/SlackUtil');
const Structure = require('./Structure');

export interface ITeamData {

}

export default class Team extends Structure<ITeamData> {
    readonly conversations: Collection<string, Conversation>;
    readonly users: Collection<string, User>;
    readonly members: Collection<string, User>;

    id: string;
    name: string;
    domain: string;
    emailDomain: string;
    icon: {
        image34: string;
        image44: string;
        image68: string;
        image88: string;
        image102: string;
        image132: string;
        imageDefault: boolean;
    };
    enterpriseId: string;
    enterpriseName: string;

    /**
     * This class represents a slack team.
     * @param client {Client} - The client to use.
     * @param {object} [data] - Slack data, if applicable.
     */
    constructor(client: Client, data?: ITeamData) {
        super(client, data);

        /**
         * All conversations in this team.
         * This is simply a reference to {@link Client#conversations}
         * @type {Collection}
         */
        this.conversations = this.client.conversations;

        /**
         * @namespace Team
         * All users in this team.
         * This is simply a reference to {@link Client#users}
         * @type {Collection}
         * @property Team.users
         * @property Team.members
         */
        this.users = this.client.users;
        this.members = this.users;
    }

    /**
     * Set up this Team with slack data.
     * @param data
     */
    setup(data: ITeamData) {
        /**
         * @namespace Team
         * @property {string} Team.id - This team's identifier (id)
         * @property {string} Team.name - This team's name
         * @property {string} Team.domain - This team's slack subdomain (e.g. example.slack.com has a domain of example)
         * @property {string} Team.emailDomain - This team's email domain, if they have one.
         * @property {object} icon - This team's icon data.
         * @property {string} icon.image34 - The 34x version of the team's icon
         * @property {string} icon.image44 - The 44x version of the team's icon
         * @property {string} icon.image68 - The 68x version of the team's icon
         * @property {string} icon.image88 - The 88x version of the team's icon
         * @property {string} icon.image102 - The 102x version of the team's icon
         * @property {string} icon.image132 - The 132x version of the team's icon
         * @property {boolean} icon.imageDefault - Whether the team's image is the default one (i.e. unset)
         * @property {string} enterpriseId - This team's enterprise ID, if it exists
         * @property {string} enterpriseName - This team's enterprise name, if it exists
         */
        Object.assign(this, SlackUtil.convertProperties(data));
    }

    /**
     * Whether this team is enterprise or not
     * @return {boolean}
     * @type {boolean}
     * @readonly
     */
    get isEnterprise() {
        return !!this.enterpriseId;
    }

    /**
     * This team's full slack URL
     * @return {string}
     * @type {string}
     * @readonly
     */
    get slackUrl() {
        return `${this.domain}.slack.com`;
    }
}