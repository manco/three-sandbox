import {Observer} from "../../utils/observable";
import {Kitchen} from "./kitchen";
import {ModuleSelector} from "../module-selector";
import {Observable} from "../../utils/observable";
import {Module} from "../modules/module";
import {Dimensions} from "./kitchen";

export class KitchenApi {

    constructor(
        private readonly kitchen: Kitchen,
        private readonly moduleSelector: ModuleSelector
    ) {}

    onAddModule(fun: Observer<Module>) {
        this.observeKitchen("ADD", fun);
    }

    onLoad(fun: Observer<Dimensions>) {
        this.observeKitchen("LOADED", fun);
    }

    onRemoveAll(fun: Observer<void>) {
        this.observeKitchen("REMOVEALL", fun);
    }

    onModuleSelected(fun: Observer<Module>) {
        this.observeSelector("SELECTED", fun);
    }

    onModuleDeselected(fun: Observer<Module>) {
        this.observeSelector("DESELECTED", fun);
    }

    onModuleRemoved(fun: Observer<Module>) {
        this.observeKitchen("REMOVE", fun);
    }

    onModuleChanged(fun: Observer<Module>) {
        this.observeKitchen("MODULE_CHANGED", fun);
    }

    private observeKitchen(type: string, fun: Observer<any>) {
        KitchenApi.observe(this.kitchen, type, fun);
    }

    private observeSelector(type: string, fun: Observer<Module>) {
        KitchenApi.observe(this.moduleSelector, type, fun);
    }

    private static observe(emitter: Observable, type: string, fun: Observer<any>) {
        emitter.subscribe(msg => {
            if (msg.type === type) {
                fun(msg);
            }
        });
    }
}