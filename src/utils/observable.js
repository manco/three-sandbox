export class Observable {
    constructor() {
        const observers = [];
        this.subscribe = observer => observers.push(observer);
        this.notify = msg => observers.forEach(o => o(msg))
    }
}