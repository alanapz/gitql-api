import { as } from "src/utils/utils";

export interface Check {
    nonNull: <T>(value: T, message?: string) => T;
    nonNullNotZero: (value: number, message: string) => number;
    stringNonNullNotEmpty: (value: string, message?: string) => string;
    arrayNonNullNotEmpty: <T> (value: T[], message: string) => T[];
    isOneOf: <T>(value: T, values: T[], message?: string) => T;
    error: (message: string) => Error;
}

function nonNull<T>(value: T, message?: string): T {
    if (value === null || value === undefined) {
        throw error(`nonNull: '${message || 'value'}'`);
    }
    return value;
}

function nonNullNotZero(value: number, message: string): number {
    if (value === null || value === undefined || value === 0) {
        throw error(`nonNullNotZero ${message}: ${value}`);
    }
    return value;
}

function stringNonNullNotEmpty(value: string, message?: string): string {
    if (!value || !value.trim().length) {
        throw error(`stringNonNullNotEmpty: '${message || 'value'}'`)
    }
    return value;
}

function arrayNonNullNotEmpty<T>(value: T[], message: string, ... args: unknown[]): T[] {
    if (!value || !value.length) {
        console.error(message, value, ... args);
        throw message;
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

function error(message: string): Error {
    const error = new Error(message);
    console.error(error, error.stack);
    return error;
}

module.exports = as<Check>({ nonNull, nonNullNotZero, stringNonNullNotEmpty, arrayNonNullNotEmpty, isOneOf, error });
