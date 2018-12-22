import ISlackWebApiArgs from './ISlackWebApiArgs';

type SlackWebApiMethod<TArgs = ISlackWebApiArgs, TReturn = any> = (args?: ISlackWebApiArgs) => Promise<TReturn>;

export default SlackWebApiMethod;