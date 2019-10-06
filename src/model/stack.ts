export class Stack<T> {
    private readonly removed: T[] = [];

    pop():T | undefined {
        return this.removed.pop();
    }

    push(item:T):void {
        this.removed.push(item);
    }

}