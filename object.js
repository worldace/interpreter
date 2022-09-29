export const STRING_OBJ = 'STRING';
export const INTEGER_OBJ = 'INTEGER';
export const BOOLEAN_OBJ = 'BOOLEAN';
export const NULL_OBJ = 'NULL';
export const RETURN_VALUE_OBJ = 'RETURN_VALUE';
export const FUNCTION_OBJ = 'FUNCTION';
export const BUILTIN_OBJ = 'BUILTIN';
export const ARRAY_OBJ = 'ARRAY';
export const HASH_OBJ = 'HASH';
export const ERROR_OBJ = 'ERROR';
export class String {
    value;
    constructor(value){
        this.value = value;
    }
    inspect() {
        return this.value;
    }
    type() {
        return STRING_OBJ;
    }
}
export class Integer {
    value;
    constructor(value){
        this.value = value;
    }
    inspect() {
        console.log(this.value);
    }
    type() {
        return INTEGER_OBJ;
    }
    hashKey() {
        return {
            type: this.type(),
            value: this.value
        };
    }
}
export class Boolean {
    value;
    constructor(value){
        this.value = value;
    }
    inspect() {
        console.log(this.value);
    }
    type() {
        return BOOLEAN_OBJ;
    }
}
export class Null {
    inspect() {
        console.log('null');
    }
    type() {
        return NULL_OBJ;
    }
}
export class ReturnValue {
    value;
    constructor(value){
        this.value = value;
    }
    inspect() {
        console.log(this.value.inspect());
    }
    type() {
        return RETURN_VALUE_OBJ;
    }
}
export class Function {
    parameters;
    body;
    env;
    constructor(parameters, body, env){
        this.parameters = parameters;
        this.body = body;
        this.env = env;
    }
    inspect() {
        let out = [];
        let params = [];
        for (const p of this.parameters){
            params.push(p.string());
        }
        out.push('fn');
        out.push('(');
        out.push(params.join(', '));
        out.push(') {\n');
        out.push(this.body.string());
        out.push('\n}');
        return out.join('');
    }
    type() {
        return FUNCTION_OBJ;
    }
}
export class Builtin {
    fn;
    constructor(fn){
        this.fn = fn;
    }
    inspect() {
        return 'builtin function';
    }
    type() {
        return BUILTIN_OBJ;
    }
}
export class Array {
    elements;
    constructor(elements){
        this.elements = elements;
    }
    inspect() {
        let out = [];
        let elements = [];
        for (const e of this.elements){
            elements.push(e.inspect());
        }
        out.push('[');
        out.push(elements.join(''));
        out.push(']');
        return out.join('');
    }
    type() {
        return ARRAY_OBJ;
    }
}
export class Hash {
    pairs;
    constructor(pairs){
        this.pairs = pairs;
    }
    inspect() {
        let out = [];
        let pairs = [];
        for (const [key, value] of this.pairs){
            pairs.push(key.inspect() + ':' + value.inspect());
        }
        out.push('{');
        out.push(pairs.join(''));
        out.push('}');
        return out.join('');
    }
}
export class Error {
    message;
    constructor(message){
        this.message = message;
    }
    inspect() {
        return 'ERROR: ' + this.message;
    }
    type() {
        return ERROR_OBJ;
    }
}
