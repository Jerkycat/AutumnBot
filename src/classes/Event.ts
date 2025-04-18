import YumuCore from './Core';

export default class Event {
    name: string;
    run: (Client: YumuCore, ...args: any[]) => void | any;
}
