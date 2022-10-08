
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
        const list = this.elements.map(v => v.inspect())
        return `[${list.join(', ')}]`
    }
}


class Hash {
    map

    constructor(map){
        this.map = map
    }

    type(){
        return 'hash'
    }

    inspect() {
        const list = this.map.map((v,k) => k.inspect() + ':' + v.inspect())
        return `{${list.join(', ')}}`
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
        return `fn(${this.parameters.join(', ')}){\n${this.body}\n}`
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
