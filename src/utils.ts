import * as Debug from 'debug';
import opts from './commandOptions';

const debug = Debug('dtsgen');

export function toTSType(type: string, debugSource?: any): string {
    switch (type) {
        case 'integer':
            return 'number';
        case 'any':
        case 'null':
        case 'undefined':
        case 'string':
        case 'number':
        case 'boolean':
            return type;
        case 'object':
        case 'array':
            return null;
        default:
            if (debugSource) {
                console.error('  debugSource=' + debugSource);
            }
            throw new Error('unknown type: ' + type);
    }
}

export function reduceTypes(types: JsonSchemaOrg.Schema.Definitions.SimpleTypes[]): JsonSchemaOrg.Schema.Definitions.SimpleTypes[] {
    if (types.length < 2) {
        return types;
    }
    const set = new Set<JsonSchemaOrg.Schema.Definitions.SimpleTypes>(types);
    if (opts.target === 'v1') {
        set.delete('null');
    }
    if (set.delete('integer')) {
        set.add('number');
    }
    return Array.from(set.values());
}

export function toTypeName(str: string): string {
    if (!str) return str;
    str = str.trim();
    return str.split('$').map(s => s.replace(/(?:^|[^A-Za-z0-9])([A-Za-z0-9])/g, function(_, m) {
        return m.toUpperCase();
    })).join('$');
}

export function mergeSchema(a: any, b: any): any {
    Object.keys(b).forEach((key: string) => {
        if (a[key] == null) {
            a[key] = b[key];
        } else {
            const value = b[key];
            if (typeof value !== typeof a[key]) {
                debug(`mergeSchema warning: type is missmatched, key=${key}`);
                a[key] = value;
            } else if (Array.isArray(value)) {
                Array.prototype.push.apply(a[key], value);
            } else if (typeof value === 'object') {
                Object.assign(a[key], value);
            } else {
                a[key] = value;
            }
        }
    });
    return a;
}

