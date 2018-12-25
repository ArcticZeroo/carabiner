import Message from '../../../structures/message/Message';
import User from '../../../structures/user/User';

export default interface IReactionData<T = Message> {
    reactingUser: User;
    itemUser?: User;
    item: T
}