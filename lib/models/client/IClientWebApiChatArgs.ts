import User from '../../structures/user/User';

export default interface IClientWebApiChatArgs {
    postEphemeral?: boolean;
    ephemeral?: boolean;
    invisible?: boolean;
    user?: User;
}