export class Events {
    static onClick(htmlElement: HTMLElement, fun: () => void): void {
        htmlElement.addEventListener("click", fun, false);
    }
}
