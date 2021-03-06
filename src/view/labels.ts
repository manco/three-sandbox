import {ModuleSubtype} from "../model/modules/types";
import {ModuleType} from "../model/modules/types";
import {ResizeReason} from "../model/modules/resizing";
import {ObstacleType} from "../model/kitchen/obstacle";

export class Labels {

    public static readonly ResizedLabels = new Map<ResizeReason, string>([
        [ResizeReason.EXPANSION, "niestandardowy"],
        [ResizeReason.BLENDE, "blenda"]
    ]);

    public static readonly ModuleSubtypesLabels = new Map<ModuleSubtype, string>([
        [ModuleSubtype.SHELVES, "półki"],
        [ModuleSubtype.DRAWERS, "szuflady"],
        [ModuleSubtype.TABLETOP, "blat"],
        [ModuleSubtype.SINK, "zlewozmywak"],
        [ModuleSubtype.UNDER_SINK, "zlewozmywak"],
        [ModuleSubtype.OVEN, "piekarnik"],
        [ModuleSubtype.OVEN_TABLETOP, "palniki"],
        [ModuleSubtype.WASHER, "pralka"],
        [ModuleSubtype.DISHWASHER, "zmywarka"],
        [ModuleSubtype.FRIDGE, "lodówka"]
    ]);

    public static readonly ModuleTypesLabels = new Map<ModuleType, string>([
        [ModuleType.STANDING, "SZAFKI STOJĄCE"],
        [ModuleType.TABLETOP, "BLAT KUCHENNY"],
        [ModuleType.HANGING, "SZAFKI WISZĄCE"]
    ]);

    public static readonly ObstacleTypesLabels = new Map<ObstacleType, string>([
        [ObstacleType.DOOR, "DRZWI"],
        [ObstacleType.WINDOW, "OKNO"],
        [ObstacleType.RADIATOR, "KALORYFER"]
    ]);
}