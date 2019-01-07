export class Observable {
    private readonly observers: Observer<any>[] = [];
    subscribe(observer: Observer<any>): void {
        this.observers.push(observer);
    }
    notify(msg:Message<any>):void {
        this.observers.forEach(o => o(msg));
    }
}
export interface Observer<T> {
    (msg: Message<T>):void
}
export class Message<T> {
    constructor(readonly type:string, readonly obj?:T){}
}