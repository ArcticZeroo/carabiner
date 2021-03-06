import Client from '../../client/Client';
import SlackUtil from '../../util/SlackUtil';
import DoNotDisturb from './DoNotDisturb';
import Structure from '../Structure';
import Message from "../message/Message";

export interface IUserData {

}

interface IUserProfile {
    firstName: string;
    lastName: string;
    realName: string;
    tz: string;
    tzLabel: string;
    tzOffset: string;
}

export default class User extends Structure<IUserData> {
    public deleted: boolean;
    public name: string;
    public id: string;
    public color: string;
    public dnd: DoNotDisturb;
    public isRestricted: boolean;
    public isUltraRestricted: boolean;
    public isOwner: boolean;
    public isBot: boolean;
    public has2fa?: boolean;
    public isAdmin: boolean;
    public profile: IUserProfile;
    public prefs?: any;

    /**
     * This class represents a slack user.
     * @param client {Client} - The Slack Client to use when sending messages and pulling data.
     * @param {object} [data] - The 'raw' data provided by slack if applicable.
     */
    constructor(client: Client, data?: IUserData) {
        super(client, data);
    }

    /**
     * Sets up the {User} with data provided from slack.
     * @param data {object} - The data from slack to use.
     */
    setup(data: IUserData) {
        super.setup();

        /**
         * @namespace
         * @property {string} User.id - The ID of this user.
         * @property {string} User.name - THe username of this user.
         * @property {string} User.color - The color of this user, mostly used in compact mode.
         * @property {boolean} User.isAdmin - Whether the user is an admin in this team.
         * @property {boolean} User.isOwner - Whether the user is the owner of this team.
         * @property {boolean} User.has2fa - Whether the user has 2fa enabled. This may not be available to all clients.
         * @property {boolean} User.isBot - Whether the user is a bot
         * @property {boolean} User.deleted - Whether the user is deleted.
         * @property {object} User.profile - The user's profile, which contains information about them.
         * @property {string} User.profile.firstName - The user's first name.
         * @property {string} User.profile.lastName - The user's last name.
         * @property {string} User.profile.realName - The user's first and last name.
         * @property {string} User.profile.tz - The user's timezone.
         * @property {string} User.profile.tz_label - The display name of the user's timezone. Use this with Date#toLocaleDateString as the timeZone option.
         * @property {number} User.profile.tz_offset - The amount of seconds to remove from GMT.
         * @property {boolean} User.isRestricted - Whether the user's account is "restricted" (i.e. a multi-channel guest)
         * @property {boolean} User.isUltraRestricted - Whether the user's account is "ultra restricted" (i.e. a single-channel guest).
         * @property {object} User.prefs - An object of user preferences that will only exist if this user is the authenticated one.
         */
        Object.assign(this, SlackUtil.convertProperties(data));

        this.isDisabled = this.deleted;

        /**
         * This user's DND status. This starts as being
         * 'empty', you should call {@Link DoNotDisturb#update}
         * on this.
         * @type {DoNotDisturb}
         */
        this.dnd = new DoNotDisturb(this);
    }

    /**
     * Send a message to the user directly.
     * If you'd like the functionality offered
     * in the Message class, use {@link Message#send}
     * and set the channel to this user's ID.
     * @param text {string} - The message to send.
     * @param {object} [args={}] - Additional args to send.
     * @return {Promise}
     */
    send(text: string, args: any = {}): Promise<Message> {
        return this.client.chat(this, text, args);
    }

    /**
     * Whether the user is a full user in this org.
     * This is determined
     * @type {boolean}
     * @return {boolean}
     */
    get isFullUser(): boolean {
        return !(this.isRestricted || this.isUltraRestricted);
    }

    /**
     * The user's mention.
     * @type {string}
     * @return {string}
     * @readonly
     */
    get mention(): string {
        return User.getMention(this.id);
    }

    /**
     * Whether this user is disabled.
     * @type {boolean}
     * @return {boolean}
     * @readonly
     */
    get isDeleted(): boolean {
        return this.deleted;
    }

    /**
     * Set whether this user is disabled/deleted.
     * @param {boolean} v
     */
    set isDeleted(v) {
        this.deleted = v;
    }

    /**
     * Whether this user is disabled.
     * @type {boolean}
     * @return {boolean}
     * @readonly
     */
    get isDisabled(): boolean {
        return this.isDeleted;
    }

    /**
     * Same as setter for User.isDeleted
     * @param v
     */
    set isDisabled(v) {
        this.isDeleted = v;
    }

    /**
     * Whether this is THE slackbot.
     * @type {boolean}
     * @return {boolean}
     * @readonly
     */
    get isSlackbot(): boolean {
        return this.id === 'USLACKBOT';
    }

    /**
     * Disables this user (sets them as inactive).
     * <p>
     * This call will not work on free tier teams.
     * @returns {Promise.<void>}
     */
    async disable() {
        return this.client.api.methods.users.admin.setInactive({ user: this.id })
            .then(() => {
                this.isDisabled = true;
            });
    }

    /**
     * Retrieve info about this user and update it.
     * This is usually not going to be necessary to call.
     * @return {Promise.<void>}
     */
    async update(): Promise<void> {
        return this.client.api.methods.users.info({ user: this.id })
            .then(data => {
                this.setup(data.user);
                return this.dnd.update();
            });
    }

    /**
     * Get a mention from any slack ID.
     * @param id {string} - The user's slack ID.
     * @return {string}
     */
    static getMention(id: string): string {
        return `<@${id}>`;
    }

    /**
     * Return whether another user equals this one
     * @param {User} other - The other user to check
     * @returns {boolean}
     */
    equals(other: User): boolean {
        return this.id === other.id;
    }

    /**
     * This user as a string, <@id|username>
     * @returns {string}
     */
    toString(): string {
        return `<@${this.id}|${this.name}>`;
    }
}