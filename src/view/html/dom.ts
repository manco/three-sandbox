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
        const [ilabel, input] = Html.inputWithLabel(doc, id, "number", label);
        input.className = "dimensionInput";
        return [ilabel, input];
    }

    static inputWithLabel(doc: SmartDoc, id:string, type: string, label:string): [HTMLLabelElement, HTMLInputElement] {
        const input = doc.createInput(type);
        input.id = id;
        const inputLabel = doc.createLabel(input, label);
        return [inputLabel, input];
    }

    static toArray<T extends Node>(htmlCollection: NodeListOf<T>):T[] {
        return [].slice.call(htmlCollection);
    }
}