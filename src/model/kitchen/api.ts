import {Observer} from "../../utils/observable";
import {Kitchen} from "./kitchen";
import {ModuleSelector} from "../module-selector";
import {Observable} from "../../utils/observable";

export class KitchenApi {

    constructor(
        private readonly kitchen: Kitchen,
        private readonly moduleSelector: ModuleSelector
    ) {}

    onAddModule(fun: Observer) {
        this.observeKitchen("ADD", fun);
    }

    onLoad(fun: Observer) {
        this.observeKitchen("LOADED", fun);
    }

    onRemoveAll(fun: Observer) {
        this.observeKitchen("REMOVEALL", fun);
    }

    onModuleSelected(fun: Observer) {
        this.observeSelector("SELECTED", fun);
    }

    onModuleDeselected(fun: Observer) {
        this.observeSelector("DESELECTED", fun);
    }

    private observeKitchen(type: string, fun: Observer) {
        KitchenApi.observe(this.kitchen, type, fun);
    }

    private observeSelector(type: string, fun: Observer) {
        KitchenApi.observe(this.moduleSelector, type, fun);
    }

    private static observe(emitter: Observable, type: string, fun: Observer) {
        emitter.subscribe(msg => {
            if (msg.type === type) {
                fun(msg);
            }
        });
    }
}