export class Events {
    static onClick<T extends EventTarget>(htmlElement: T, fun: (event: Event) => void): void {
        htmlElement.addEventListener("click", fun, false);
    }

    static onInputChange<T extends EventTarget>(htmlElement: T, fun: (event: Event) => void): void {
        htmlElement.addEventListener("input", fun, false);
    }

    static onKeyDown<T extends EventTarget>(htmlElement: T, fun: (event: KeyboardEvent) => void): void {
        htmlElement.addEventListener("keydown", fun, false);
    }
}
