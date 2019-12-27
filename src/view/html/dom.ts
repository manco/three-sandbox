import {SmartDoc} from "./smart-doc";

export class Html {
    static select(doc : SmartDoc, options: {value, text, isSelected?}[]): HTMLSelectElement {
        const element = doc.createSelect();
        options.map(o => {
            const option = doc.createOption();
            option.value = o.value;
            option.text = o.text;
            if (o.isSelected) option.selected = true;
            return option;
        }).forEach(o => element.add(o));

        return element;
    }

    static toArray<T extends Element>(htmlCollection: NodeListOf<T>):T[] {
        return [].slice.call(htmlCollection);
    }
}