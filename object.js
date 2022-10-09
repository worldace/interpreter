
class String {
    type = 'string'
    value

    constructor(value){
        this.value = value
    }

    inspect() {
        return this.value
    }
}


class Integer {
    type = 'integer'
    value

    constructor(value){
        this.value = value
    }

    inspect() {
        return this.value
    }
}


class Boolean {
    type = 'boolean'
    value

    constructor(value){
        this.value = value
    }

    inspect() {
        return this.value
    }
}


class Null {
    type = 'null'

    inspect() {
        return 'null'
    }
}


class Array {
    type = 'array'
    elements

    constructor(elements){
        this.elements = elements
    }

    inspect() {
        const list = this.elements.map(v => v.inspect())
        return `[${list.join(', ')}]`
    }
}


class Hash {
    type = 'hash'
    map

    constructor(map){
        this.map = map
    }

    inspect() {
        const list = this.map.map((v,k) => k.inspect() + ':' + v.inspect())
        return `{${list.join(', ')}}`
    }
}


class Function {
    type = 'function'
    arguments
    body
    env

    constructor(args, body, env){
        this.arguments = args
        this.body = body
        this.env = env
    }

    inspect() {
        return `fn(${this.arguments.join(', ')}){\n${this.body}\n}`
    }
}


class Return {
    type = 'return'
    value

    constructor(value){
        this.value = value
    }

    inspect() {
        return this.value.inspect()
    }
}


class Builtin {
    type = 'builtin'
    fn

    constructor(fn){
        this.fn = fn
    }

    inspect() {
        return 'builtin function'
    }
}


class Error {
    type = 'error'
    message

    constructor(message){
        this.message = message
    }

    inspect() {
        return 'ERROR: ' + this.message
    }
}



export {String, Integer, Boolean, Null, Array, Hash, Function, Return, Builtin, Error}
