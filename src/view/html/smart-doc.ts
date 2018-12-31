export class SmartDoc {
    constructor(private readonly doc: Document) {}
    getElementById(elementId: string): HTMLElement | null {
        return this.doc.getElementById(elementId);
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

    createLabel(forElement: HTMLElement, text: string): HTMLLabelElement {
        const label = this.doc.createElement("label") as HTMLLabelElement;
        label.setAttribute("for", forElement.id);
        label.innerText = text;
        return label;
    }

    createButton(text: string) {
        const b = this.doc.createElement("button") as HTMLButtonElement;
        b.innerText = text;
        return b;
    }

    findByIdPrefix(idPrefix:string) {
        return SmartDoc.toArray(this.doc.querySelectorAll(`[id^=\"${idPrefix}\"]`));
    }

    private static toArray<T>(htmlCollection: NodeListOf<Element>) {
        return [].slice.call(htmlCollection);
    }
}