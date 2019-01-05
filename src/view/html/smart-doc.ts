import {Html} from "./dom";

export class SmartDoc {
    constructor(private readonly doc: Document) {}
    getElementById(elementId: string): HTMLElement | null {
        return this.doc.getElementById(elementId);
    }

    getInputNumberValue(elementId: string): number {
        return (this.getElementById(elementId) as HTMLInputElement).valueAsNumber;
    }

    createSelect(): HTMLSelectElement {
        return this.doc.createElement("select") as HTMLSelectElement;
    }

    createOption(): HTMLOptionElement {
        return this.doc.createElement("option") as HTMLOptionElement;
    }

    createUl(id: string): HTMLUListElement {
        const ul = this.doc.createElement("ul") as HTMLUListElement;
        ul.id = id;
        return ul;
    }

    createLi(id: string) {
        const li = this.doc.createElement("li") as HTMLLIElement;
        li.id = id;
        return li;
    }

    createLabel(forElement: HTMLElement, text: string): HTMLLabelElement {
        const label = this.doc.createElement("label") as HTMLLabelElement;
        label.setAttribute("for", forElement.id);
        label.innerText = text;
        return label;
    }

    createButton(text: string):HTMLButtonElement {
        const b = this.doc.createElement("button") as HTMLButtonElement;
        b.innerText = text;
        return b;
    }

    findByIdPrefix<T extends HTMLElement>(idPrefix:string) {
        return Html.toArray<T>(this.doc.querySelectorAll(`[id^=\"${idPrefix}\"]`));
    }
}