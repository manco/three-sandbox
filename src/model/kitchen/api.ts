import {Observer} from "../../utils/observable";
import {Kitchen} from "./kitchen";

export class KitchenApi {

    constructor(private readonly kitchen: Kitchen) {}

    onAddModule(fun: Observer) {
        this.observe("ADD", fun);
    }

    onLoad(fun: Observer) {
        this.observe("LOADED", fun);
    }

    onRemoveAll(fun: Observer) {
        this.observe("REMOVEALL", fun);
    }

    private observe(type: string, fun: Observer) {
        this.kitchen.subscribe(msg => {
            if (msg.type === type) {
                fun(msg);
            }
        });
    }
}