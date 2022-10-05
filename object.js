
export class String {
    value
    constructor(value){
        this.value = value
    }
    inspect() {
        return this.value
    }
    type() {
        return 'string'
    }
}
export class Integer {
    value
    constructor(value){
        this.value = value
    }
    inspect() {
        return this.value
    }
    type() {
        return 'integer'
    }
    hashKey() {
        return {
            type: this.type(),
            value: this.value
        }
    }
}
export class Boolean {
    value
    constructor(value){
        this.value = value
    }
    inspect() {
        return this.value
    }
    type() {
        return 'boolean'
    }
}
export class Null {
    inspect() {
        return 'null'
    }
    type() {
        return 'null'
    }
}
export class ReturnValue {
    value
    constructor(value){
        this.value = value
    }
    inspect() {
        return this.value.inspect()
    }
    type() {
        return 'return'
    }
}
export class Function {
    parameters
    body
    env
    constructor(parameters, body, env){
        this.parameters = parameters
        this.body = body
        this.env = env
    }
    inspect() {
        let out = []
        let params = []
        for (const p of this.parameters){
            params.push(p)
        }
        out.push('fn')
        out.push('(')
        out.push(params.join(', '))
        out.push(') {\n')
        out.push(this.body)
        out.push('\n}')
        return out.join('')
    }
    type() {
        return 'function'
    }
}
export class Builtin {
    fn
    constructor(fn){
        this.fn = fn
    }
    inspect() {
        return 'builtin function'
    }
    type() {
        return 'builtin'
    }
}
export class Array {
    elements
    constructor(elements){
        this.elements = elements
    }
    inspect() {
        let out = []
        let elements = []
        for (const e of this.elements){
            elements.push(e.inspect())
        }
        out.push('[')
        out.push(elements.join(','))
        out.push(']')
        return out.join('')
    }
    type() {
        return 'array'
    }
}
export class Hash {
    pairs
    constructor(pairs){
        this.pairs = pairs
    }
    inspect() {
        let out = []
        let pairs = []
        for (const [key, value] of this.pairs){
            pairs.push(key.inspect() + ':' + value.inspect())
        }
        out.push('{')
        out.push(pairs.join(''))
        out.push('}')
        return out.join('')
    }
    type(){
        return 'hash'
    }
}
export class Error {
    message
    constructor(message){
        this.message = message
    }
    inspect() {
        return 'ERROR: ' + this.message
    }
    type() {
        return 'error'
    }
}
