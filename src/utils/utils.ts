export function as<T>(obj: T): T {
    return obj;
}

export function of<T>(... obj: T[]): T[] {
    return obj;
}

export function aggregate<T>(input: T[][]): T[] {
    const buffer: T[] = [];
    for (const inputItem of input) {
        buffer.push(... inputItem);
    }
    return buffer;
}

export function xxx_todo_fixme(): Error {
    throw new Error("XXX_TODO_FIXME");
}

export function map_values<K, V>(map: Promise<Map<K, V>>): Promise<V[]> {
    return map.then(value => Array.from(value.values()));
}

export function map_reducer<K, V>(idMapper: (value: V) => K): (previousValue: Map<K, V>, currentValue: V) => Map<K, V> {
    return (prev, current) => {
        prev.set(idMapper(current), current);
        return prev;
    }
}

export function record_to_map<K extends string, V>(obj: Record<K, V>): Map<K, V> {
    const map = new Map<K, V>();
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            map.set(key, obj[key]);
        }
    }
    return map;
}

export type IfNotFound = 'throw' | 'warn' | 'null';

export function if_not_found<T>(params: {value: IfNotFound, result: T, error: () => Error}): T|never {
    if (!params.result && params.value === 'throw') {
        throw params.error();
    }
    if (!params.result && params.value === 'warn') {
        console.warn(params.error().message);
        return null;
    }
    return params.result;
}
