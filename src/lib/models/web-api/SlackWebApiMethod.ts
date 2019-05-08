import ISlackWebApiArgs from './ISlackWebApiArgs';

type SlackWebApiMethod<TArgs = any, TReturn = any> = (args?: ISlackWebApiArgs & TArgs) => Promise<TReturn>;

export default SlackWebApiMethod;