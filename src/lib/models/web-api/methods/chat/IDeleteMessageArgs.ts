import SlackTime from "../../../types/SlackTime";

export default interface IDeleteMessageArgs {
    ts: SlackTime;
    channel: string;
}