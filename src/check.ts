export function notNull<T>(value: T, message?: string): T {
    if (value === null || value === undefined) {
        throw error(`value is null: '${message || 'value'}'`);
    }
    return value;
}

function nonNullNotZero(value: number, message: string): number {
    if (value === null || value === undefined || value === 0) {
        throw error(`nonNullNotZero ${message}: ${value}`);
    }
    return value;
}

export function stringNotNullNotEmpty(value: string, message?: string): string {
    if (value === null || value === undefined) {
        throw error(`string is null: '${message || 'value'}'`);
    }
    if (!value.trim().length) {
        throw error(`string is empty: '${message || 'value'}'`);
    }
    return value;
}

export function arrayNotNullNotEmpty<T>(value: T[], message?: string): T[] {
    if (value === null || value === undefined) {
        throw error(`array is null: '${message || 'value'}'`);
    }
    if (!value.length) {
        throw error(`array empty: '${message || 'value'}'`);
    }
    return value;
}

function isOneOf<T>(value: T, values: T[], message: string): T {
    if (value === null && !values.includes(null)) {
        throw error(`${message} is null for non-nullable type`);
    }
    if (!values.includes(value)) {
        throw error(`${message} '${value}' is not a valid value (valid values are: '${values}'`);
    }
    return value;
}

export function error(message: string): Error {
    const error = new Error(stringNotNullNotEmpty(message, "errorMessage"));
    console.error(error, error.stack);
    return error;
}
