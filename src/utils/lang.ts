export class Lang {
    static noop = () => {}
}

export class Coords {
    x: number;
    y: number;
}

export class Maps {
    static getOrDefault<K, V>(map: Map<K, V>, key: K, defaultValue: V) {
        if (!map.has(key)) {
            map.set(key, defaultValue);
        }
        return map.get(key);
    }
}

export class MultiMaps {
    static set<K, V>(map: Map<K, V[]>, key: K, value: V) {
        Maps.getOrDefault(map, key, []).push(value);
    }
    static remove<K, V>(map: Map<K, V[]>, key: K, value: V) {
        Arrays.remove(Maps.getOrDefault(map, key, []), value);
    }
}

export class Arrays {
    static remove<T>(arr: T[], item: T) {
        const index = arr.indexOf(item);
        if (index > -1) {
            arr.splice(index, 1);
        }
    }
}