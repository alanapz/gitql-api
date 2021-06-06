import { Check } from "src/check";

const check: Check = require.main.require("./check");

export function lazyValue<T>(): LazyValue<T> {
    return new LazyValue<T>();
}

export class LazyValue<T> {

    private _value: Promise<T>;

    set(value: T): void {
        this._value = Promise.resolve(value);
    }

    setIfNotNull(value: T): void {
        if (value !== null && value !== undefined) {
            this._value = Promise.resolve(value);
        }
    }

    fetch(resolver: () => Promise<T>): Promise<T> {
        check.nonNull(resolver, "resolver");

        if (this._value) {
            return this._value;
        }
        this._value = resolver();
        return this._value;
    }

    async then<R>(resolver: () => Promise<T>, onFulfilled?: ((value: T) => (R | PromiseLike<R>))): Promise<R> {
        return this.fetch(resolver).then(onFulfilled);
    }
}
