import {SmartDoc} from "./smart-doc";

export class Html {
    static select(doc : SmartDoc, options: {value, text}[]): HTMLSelectElement {
        const element = doc.createSelect();
        options.map(o => {
            const option = doc.createOption();
            option.value = o.value;
            option.text = o.text;
            return option;
        }).forEach(o => element.add(o));

        return element;
    }
}