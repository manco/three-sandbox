export class Events {
    static onClick(htmlElement: EventTarget, fun: (event) => void): void {
        htmlElement.addEventListener("click", fun, false);
    }
}
