import {SmartDoc} from "./html/smart-doc";
import {ModuleType} from "../model/modules/types";
import {ModuleTypesAll} from "../model/modules/types";
import {ModuleTypeToSubtype} from "../model/modules/types";
import {ModuleSubtype} from "../model/modules/types";
import {Labels} from "./labels";
import {Events} from "./html/events";
import {ColorModal} from "./colorModal";
import {Actions} from "../controller/actions";
import {Module} from "../model/modules/module";
import {Html} from "./html/dom";

export class GuiPanel {
    private readonly panel: HTMLElement;
    private readonly colorModal:ColorModal;
    private readonly modulesLists: Map<ModuleType, HTMLElement> = new Map();

    constructor(private readonly doc: SmartDoc, private readonly actions: Actions) {
        this.panel = doc.getElementById("gui-panel");
        this.colorModal = new ColorModal(this.doc, actions);

        ModuleTypesAll.forEach(t => this.modulesLists.set(t, this.createModulesListHtml(t)));
    }

    public addModuleToModuleList(module: Module) {
        const li = this.doc.createLi(`${module.id}`);

        const options = ModuleTypeToSubtype.get(module.type)
            .map(stype => {
                return {
                    value: `${stype}`,
                    text: Labels.ModuleSubtypesLabels.get(stype)
                }
            });

        const selectBox = Html.select(this.doc, options);
        Events.onInputChange(
            selectBox,
            (event) => {
                const inputValue = Number.parseInt((event.target as HTMLSelectElement).value);
                this.actions.setModuleSubtype(module, ModuleSubtype[ModuleSubtype[inputValue]]);
            }
        );
        li.appendChild(selectBox);

        Events.onClick(li, () => this.actions.selectModuleById(li.id));
        this.getModulesList(module.type).appendChild(li);
    }

    public guiCheckboxesValues(): string[] {
        return this.doc.findByIdPrefix<HTMLInputElement>('checkbox-wall')
            .filter(c => c.checked)
            .map(w => w.value);
    }

    private getModulesList(type: ModuleType): HTMLElement {
        return this.modulesLists.get(type);
    }

    private createModulesListHtml(moduleType: ModuleType) {
        const ul = this.doc.createUl(`modulesList-${moduleType}`);

        const label = this.doc.createLabel(ul, Labels.ModuleTypesLabels.get(moduleType));

        const buttonChooseColor = this.doc.createButton("kolor");
        Events.onClick(buttonChooseColor, () => {
            this.colorModal.setContext(moduleType);
            this.colorModal.show();
        });

        this.panel.appendChild(label);
        this.panel.appendChild(buttonChooseColor);
        this.panel.appendChild(ul);

        return ul;
    }

    public kitchenDimensions():{width:number, depth:number, height:number} {
        return {
            width: this.doc.getInputNumberValue("kitchen-width"),
            depth: this.doc.getInputNumberValue("kitchen-depth"),
            height: this.doc.getInputNumberValue("kitchen-height")
        };
    }

    clear() {
        Array.from(this.modulesLists.values()).forEach(ml => ml.innerHTML = '');
    }
}