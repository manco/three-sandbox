export class Observable {
    public subscribe: (observer) => number;
    public notify: (msg) => void;
    constructor() {
        const observers = [];
        this.subscribe = observer => observers.push(observer);
        this.notify = msg => observers.forEach(o => o(msg))
    }
}