import { Check } from "src/check";

const check: Check = require.main.require("./check");

export function asyncMap<K, V>(): AsyncMap<K, V> {
    return new AsyncMap<K, V>();
}

export class AsyncMap<K, V> {

    private readonly values = new Map<K, Promise<V>>();

    get size() {
        return this.values.size;
    }

    get(key: K) {
        check.nonNull(key, "key");
        return this.values.get(key);
    }

    set(key: K, value: V) {
        this.values.set(key, Promise.resolve(value));
    }

    async fetch(key: K, resolver: (key: K) => Promise<V>): Promise<V> {
        check.nonNull(key, "key");
        check.nonNull(resolver, "resolver");

        if (this.values.has(key)) {
            return this.values.get(key);
        }

        const promise = resolver(key);
        this.values.set(key, promise);
        return promise;
    }
}
