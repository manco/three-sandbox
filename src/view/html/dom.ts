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

    static dimInputWithLabel(doc: SmartDoc, id:string, label:string): [HTMLLabelElement, HTMLInputElement] {
        const input = doc.createInputOfId(id, "number");
        input.className = "dimensionInput";
        return [
            doc.createLabel(input, label),
            input
        ];
    }
}