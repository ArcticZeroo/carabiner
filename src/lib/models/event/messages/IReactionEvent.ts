import Message from '../../../structures/message/Message';
import User from '../../../structures/user/User';

export default interface IReactionEvent<T = Message> {
    reactingUser: User;
    itemUser?: User;
    item: T;
    reaction: string;
}