import {ModuleTypeLvl2} from "../model/modules/types";
import {ModuleType} from "../model/modules/types";

export class Labels {
    public static readonly ModuleSubtypesLabels = new Map<ModuleTypeLvl2, string>([
        [ModuleTypeLvl2.SHELVES, "półki"],
        [ModuleTypeLvl2.DRAWERS, "szuflady"],
        [ModuleTypeLvl2.TABLETOP, "blat"],
        [ModuleTypeLvl2.SINK, "zlewozmywak"],
        [ModuleTypeLvl2.OVEN, "piekarnik"],
        [ModuleTypeLvl2.OVEN_TABLETOP, "palniki"],
        [ModuleTypeLvl2.WASHER, "pralka"],
        [ModuleTypeLvl2.FRIDGE, "lodówka"]
    ]);

    public static readonly ModuleTypesLabels = new Map<ModuleType, string>([
        [ModuleType.STANDING, "SZAFKI STOJĄCE"],
        [ModuleType.TABLETOP, "BLAT KUCHENNY"],
        [ModuleType.HANGING, "SZAFKI WISZĄCE"]
    ]);
}