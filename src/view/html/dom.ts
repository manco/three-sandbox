export class Html {
    static select(doc : Document, options: {value, text}[]): HTMLSelectElement {
        const element = doc.createElement("select") as HTMLSelectElement;
        options.map(o => {
            const option = doc.createElement("option") as HTMLOptionElement;
            option.value = o.value;
            option.text = o.text;
            return option;
        }).forEach(o => element.add(o));

        return element;
    }

    static listItem(id: string): HTMLLIElement {
        const li = document.createElement("li") as HTMLLIElement;
        li.id = id;
        return li;
    }
}