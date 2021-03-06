import {SmartDoc} from "./html/smart-doc";
import {ModuleSubtype, ModuleType, ModuleTypesAll, ModuleTypeToSubtype} from "../model/modules/types";
import {Labels} from "./labels";
import {Events} from "./html/events";
import {ColorModal} from "./colorModal";
import {Actions} from "../controller/actions";
import {Module} from "../model/modules/module";
import {Html} from "./html/dom";
import {ObstacleSetup} from "./obstacleSetup";
import {Obstacle, PlacementInfo} from "../model/kitchen/obstacle";
import {KitchenSetup} from "./kitchenSetup";

export class GuiPanel {
    private readonly panel: HTMLElement = this.doc.getElementById("gui-panel");
    private readonly kitchenSetup = new KitchenSetup(this.doc);
    private readonly drawKitchenButton = this.doc.createButton("drawKitchenButton", "Rysuj");
    private readonly colorModal:ColorModal = new ColorModal(this.doc, this.actions);
    private readonly addObstacleButton = this.doc.createButton("addObstacleButton", "Dodaj przeszkodę");
    private readonly obstacleInput: ObstacleSetup[] = [];
    private readonly modulesLists: Map<ModuleType, HTMLElement> = new Map();
    private readonly obstaclesPanel: HTMLDivElement = this.doc.createDiv();

    constructor(private readonly doc: SmartDoc, private readonly actions: Actions) {

        this.panel.prepend(...this.kitchenSetup.html);

        this.panel.append(this.obstaclesPanel, this.doc.br());
        this.obstaclesPanel.append(this.addObstacleButton, this.doc.br());

        this.panel.append(this.drawKitchenButton, this.doc.br());

        ModuleTypesAll.forEach(t => this.modulesLists.set(t, this.createModulesListHtml(t)));

        Events.onClick(
            this.addObstacleButton,
            () => {
                const o = new ObstacleSetup(doc);
                this.obstacleInput.push(o);
                this.obstaclesPanel.appendChild(o.html);
            }
        );

        Events.onClick(
            this.drawKitchenButton,
            () => actions.loadKitchen(
                this.kitchenSetup.kitchenDimensions(),
                this.kitchenSetup.guiCheckboxesValues(),
                this.obstacleInput
                    .filter(panel => panel.isValid())
                    .map(
                    panel => new Obstacle(
                        new PlacementInfo(
                            panel.getDimensions(),
                            panel.getWall(),
                            panel.getDistance()
                        ),
                        panel.getType())
                )
            )
        );
    }

    public addModuleToModuleList([module, index]: [Module, number]) {
        const li = this.doc.createLi(`${module.id}`, index);

        const options = this.createOptions(module);

        const selectBox = Html.select(this.doc, options);
        Events.onInputChange(
            selectBox,
            (event) => {
                const inputValue = (event.target as HTMLSelectElement).value;
                this.actions.setModuleSubtype(module, ModuleSubtype[inputValue]);
            }
        );
        if (module.isCorner() || module.isResized()) selectBox.disabled = true;
        li.appendChild(selectBox);

        Events.onClick(li, () => this.actions.selectModuleById(li.id));
        const modulesList = this.getModulesList(module.type);
        const firstHigher = Array.from(modulesList.children).find(e => (e as HTMLLIElement).value >= li.value);

        if (firstHigher === undefined) modulesList.appendChild(li);
        else modulesList.insertBefore(li, firstHigher);
    }

    private createOptions(module:Module) {
        if (module.isCorner())
            return [GuiPanel.singleOption("corner", "narożnik", true)];

        if (module.isResized())
            return [GuiPanel.singleOption(`${module.resize.reason}`, Labels.ResizedLabels.get(module.resize.reason), true)];

        return ModuleTypeToSubtype.get(module.type)
            .map(stype => GuiPanel.singleOption(`${stype}`, Labels.ModuleSubtypesLabels.get(stype), module.subtype == stype));
    }

    private static singleOption(value:string, text:string, isSelected:boolean) {
        return {
            value: value,
            text: text,
            isSelected: isSelected
        };
    }

    private getModulesList(type: ModuleType): HTMLElement {
        return this.modulesLists.get(type);
    }
//TODO encapsulate in ModulesList
    private createModulesListHtml(moduleType: ModuleType) {
        const listId = `modulesList-${moduleType}`;

        const ul = this.doc.createUl(listId);

        const label = this.doc.createLabel(ul, Labels.ModuleTypesLabels.get(moduleType));

        const buttonChooseColor = this.doc.createButton(`${listId}-color`,"kolor");
        Events.onClick(buttonChooseColor, () => {
            this.colorModal.setContext(moduleType);
            this.colorModal.show();
        });

        this.panel.appendChild(label);
        this.panel.appendChild(buttonChooseColor);
        this.panel.appendChild(ul);

        return ul;
    }

    public remove(module: Module) {
        this.doc.getElementById(module.id).remove()
    }

    public clear() {
        Array.from(this.modulesLists.values()).forEach(ml => ml.innerHTML = '');
    }
}