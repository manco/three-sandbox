export class Observable {
    private readonly observers: Observer[] = [];
    subscribe(observer: Observer): void {
        this.observers.push(observer);
    }
    notify(msg:Message):void {
        this.observers.forEach(o => o(msg));
    }
}
export interface Observer {
    (msg: Message):void
}
export class Message {
    constructor(readonly type:string, readonly obj?:any){}
}