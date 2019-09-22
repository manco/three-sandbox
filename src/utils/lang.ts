export class Lang {
    static noop = () => {}
}

export class Coords {
    x: number;
    y: number;
}

export class Maps {
    static getOrDefault<K, V>(map: Map<K, V>, key: K, defaultValue: V): V {
        if (!map.has(key)) {
            map.set(key, defaultValue);
        }
        return map.get(key);
    }

    static mapValues<K, V, T>(map: Map<K, V>, fun: (x:V) => T): Map<K, T> {
        return new Map(Array.from(map, ([k, v]) => [k, fun(v)] as [K, T]));
    }

    static filterKeys<K, V>(map: Map<K, V>, predicate: (V) => boolean): Map<K, V> {
        return new Map(Array.from(map).filter(([k, ]) => predicate(k)));
    }
}

export class MultiMaps {
    static set<K, V>(map: Map<K, V[]>, key: K, value: V): void {
        Maps.getOrDefault(map, key, []).push(value);
    }
    static remove<K, V>(map: Map<K, V[]>, key: K, value: V): void {
        Arrays.remove(Maps.getOrDefault(map, key, []), value);
    }
}

export class Arrays {
    static remove<T>(arr: T[], item: T): void {
        const index = arr.indexOf(item);
        if (index > -1) {
            arr.splice(index, 1);
        }
    }

    static flatten(arr) {
        return [].concat(...arr)
    }
}