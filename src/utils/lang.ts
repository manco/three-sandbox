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
}