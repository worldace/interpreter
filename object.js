
class String {
    value

    constructor(value){
        this.value = value
    }

    type() {
        return 'string'
    }

    inspect() {
        return this.value
    }
}


class Integer {
    value

    constructor(value){
        this.value = value
    }

    type() {
        return 'integer'
    }

    inspect() {
        return this.value
    }
}


class Boolean {
    value

    constructor(value){
        this.value = value
    }

    type() {
        return 'boolean'
    }

    inspect() {
        return this.value
    }
}


class Null {

    type() {
        return 'null'
    }

    inspect() {
        return 'null'
    }
}


class Array {
    elements

    constructor(elements){
        this.elements = elements
    }

    type() {
        return 'array'
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
}


class Hash {
    pairs

    constructor(pairs){
        this.pairs = pairs
    }

    type(){
        return 'hash'
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
}


class Function {
    parameters
    body
    env

    constructor(parameters, body, env){
        this.parameters = parameters
        this.body = body
        this.env = env
    }

    type() {
        return 'function'
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
}


class ReturnValue {
    value

    constructor(value){
        this.value = value
    }

    type() {
        return 'return'
    }

    inspect() {
        return this.value.inspect()
    }
}


class Builtin {
    fn

    constructor(fn){
        this.fn = fn
    }

    type() {
        return 'builtin'
    }

    inspect() {
        return 'builtin function'
    }
}


class Error {
    message

    constructor(message){
        this.message = message
    }

    type() {
        return 'error'
    }

    inspect() {
        return 'ERROR: ' + this.message
    }
}



export {String, Integer, Boolean, Null, Array, Hash, Function, ReturnValue, Builtin, Error}
