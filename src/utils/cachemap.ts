import { notNull } from "src/check";

export function cacheMap<K, V>(): CacheMap<K, V> {
    return new CacheMap<K, V>();
}

export class CacheMap<K, V> extends Map<K, V> {

    fetch(key: K, resolver: (key: K) => V): V {
        notNull(key, "key");
        notNull(resolver, "resolver");

        if (this.has(key)) {
            return this.get(key);
        }

        const value: V = resolver(key);
        this.set(key, value);
        return value;
    }

    async fetchAsync(key: K, resolver: (key: K) => Promise<V>): Promise<V> {
        notNull(key, "key");
        notNull(resolver, "resolver");

        if (this.has(key)) {
            return Promise.resolve(this.get(key));
        }

        const value: V = await resolver(key);
        this.set(key, value);
        return value;
    }

}
