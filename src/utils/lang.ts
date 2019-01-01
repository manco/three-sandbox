export class Lang {
    static flatten<T>(arr:T[][]):T[] {
        return [].concat(...arr)
    }

    static noop = () => {}
}

export class Coords {
    x: number;
    y: number;
}