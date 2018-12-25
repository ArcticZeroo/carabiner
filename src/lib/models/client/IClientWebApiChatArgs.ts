import User from '../../structures/user/User';
import SlackTime from '../SlackTime';

export default interface IClientWebApiChatArgs {
    postEphemeral?: boolean;
    ephemeral?: boolean;
    invisible?: boolean;
    user?: User | string;
    thread_ts?: SlackTime;
}