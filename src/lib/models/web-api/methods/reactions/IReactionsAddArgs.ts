import SlackTime from "../../../types/SlackTime";

export default interface IReactionsAddArgs  {
    name: string;
    channel: string;
    timestamp: SlackTime;
}