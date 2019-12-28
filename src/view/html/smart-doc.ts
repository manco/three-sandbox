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

    createLi(id: string, index:number) {
        const li = this.doc.createElement("li") as HTMLLIElement;
        li.id = id;
        li.value = index;
        return li;
    }

    createLabel(forElement: HTMLElement, text: string): HTMLLabelElement {
        const label = this.doc.createElement("label") as HTMLLabelElement;
        label.setAttribute("for", forElement.id);
        label.innerText = text;
        return label;
    }

    createButton(id: string, text: string):HTMLButtonElement {
        const b = this.doc.createElement("button") as HTMLButtonElement;
        b.id = id;
        b.innerText = text;
        return b;
    }

    createImageInput(imageSrc: string) {
        const elem = this.createInput("image");
        elem.src = imageSrc;
        return elem;
    }

    createInput(type: string) {
        const elem = this.doc.createElement("input") as HTMLInputElement;
        elem.type = type;
        return elem;
    }

    createInputOfId(id:string, type: string) {
        const elem = this.createInput(type);
        elem.id = id;
        return elem;
    }

    createDiv(): HTMLDivElement {
        return this.doc.createElement("div") as HTMLDivElement;
    }

    br(): HTMLBRElement {
        return this.doc.createElement("br") as HTMLBRElement;
    }
}