import SlackTime from "../../../types/SlackTime";

export default interface ISlackDeleteMessageArgs {
    ts: SlackTime;
    channel: string;
}