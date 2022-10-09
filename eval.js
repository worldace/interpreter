import { Integer, Boolean, Null, ReturnValue, Function, String, Array, Hash } from './object.js'
import { Functions } from './functions.js'



function Eval(node, env = new Environment()){
    switch(node.constructor.name){
        case 'Program'    : return evalProgram(node, env)
        case 'ID'         : return evalID(node, env)
        case 'String値'   : return new String(node.value)
        case 'Integer値'  : return new Integer(node.value)
        case 'Boolean値'  : return new Boolean(node.value)
        case 'Array値'    : return new Array( evalList(node.elements, env) )
        case 'Hash値'     : return evalHash(node, env)
        case 'Function値' : return new Function(node.parameters, node.body, env)
        case 'Prefix式'   : return evalPrefix(node.operator, Eval(node.right, env))
        case 'Infix式'    : return evalInfix(node.operator, Eval(node.left, env), Eval(node.right, env))
        case 'Index式'    : return evalIndex(Eval(node.left, env), Eval(node.index, env))
        case 'Call式'     : return evalCall(Eval(node.fc, env), evalList(node.arguments, env))
        case 'If式'       : return evalIf(node, env)
        case '式文'       : return Eval(node.expression, env)
        case 'Block文'    : return evalBlock(node, env)
        case 'Let文'      : return env.set(node.id.value, Eval(node.value, env))
        case 'Return文'   : return new ReturnValue( Eval(node.value, env) )
    }
}



function evalProgram(program, env){
    let result

    for (const v of program.statements){
        result = Eval(v, env)

        if(result.constructor.name == "ReturnValue"){
            return result.value
        }
    }

    return result
}


function evalID(node, env){
    const value = env.get(node.value)

    if(value){
        return value
    }
    else if(Functions[node.value]){
        return Functions[node.value]
    }
    else{
        throw `id not found: ${node.value}`
    }
}


function evalHash(node, env){
    const map = new Map()

    for (const [k, v] of node.map){
        map.set(Eval(k, env).value, Eval(v, env))
    }

    return new Hash(map)
}


function evalPrefix(operator, right){
    if(operator == '!'){
        switch(right.value){
            case false:
                return new Boolean(true)
            case null:
                return new Boolean(true)
            default:
                return new Boolean(false)
        }
    }
    else if(operator == '-' && right.type() == 'integer'){
        return new Integer(-right.value)
    }
    else{
        throw `unknown operator: ${operator}${right.type()}`
    }
}


function evalInfix(operator, left, right){
    if(operator == '=='){
        return new Boolean(left.value == right.value)
    }
    else if(operator == '!='){
        return new Boolean(left.value != right.value)
    }
    else if(left.type() == 'integer' && right.type() == 'integer'){
        return evalCalc(operator, left, right)
    }
    else if(operator == '+' && left.type() == 'string' && right.type() == 'string'){
        return new String(left.value + right.value)
    }
    else if(left.type() != right.type()){
        throw `type mismatch: ${left.type()} ${operator} ${right.type()}`
    }
    else{
        throw `unknown operator: ${left.type()} ${operator} ${right.type()}`
    }
}


function evalCalc(operator, left, right){
    switch(operator){
        case '+':
            return new Integer(left.value + right.value)
        case '-':
            return new Integer(left.value - right.value)
        case '*':
            return new Integer(left.value * right.value)
        case '/':
            return new Integer(left.value / right.value)
        case '<':
            return new Boolean(left.value < right.value)
        case '>':
            return new Boolean(left.value > right.value)
        case '==':
            return new Boolean(left.value == right.value)
        case '!=':
            return new Boolean(left.value != right.value)
        default:
            throw `unknown operator: ${left.type()} ${operator} ${right.type()}`
    }
}


function evalIndex(left, index){
    if(left.type() == 'array' && index.type() == 'integer'){
        if(index.value < 0 || index.value > left.elements.length-1){
            throw `index error`
        }
        return left.elements[index.value]
    }
    else if(left.type() == 'hash' && index.type() == 'string'){
        return left.map.get(index.value)
    }
    else{
        throw `index operator not supported: ${left.type()}`
    }
}


function evalCall(node, args){
    if(node.constructor.name === 'Function'){
        const env = new Environment(new Map(), node.env)

        for(const [i,v] of node.parameters.entries()){
            env.set(v.value, args[i])
        }

        const result = Eval(node.body, env)

        if(result.constructor.name == 'ReturnValue'){
            return result.value
        }

        return result
    }
    else if(node.constructor.name === 'Builtin'){
        return node.fn(...args)
    }
    else{
        throw `not a function: ${node.type()}`
    }
}


function evalIf(node, env){
    if(isTruthy( Eval(node.condition, env).value )){
        return Eval(node.ifBlock, env)
    }
    else if(node.elseBlock){
        return Eval(node.elseBlock, env)
    }
    else{
        return new Null()
    }
}


function evalBlock(node, env){
    let result

    for(const v of node.statements){
        result = Eval(v, env)
        if(result.type() == 'return'){
            return result
        }
    }

    return result
}


function evalList(list, env){
    return list.map(v => Eval(v, env) )
}


function isTruthy(value){
    switch(value){
        case null:
            return false
        case false:
            return false
        default:
            return true
    }
}


class Environment{
    constructor(store = new Map, outer = null){
        this.store = store
        this.outer = outer
    }

    get(key){
        const value = this.store.get(key)
        if (value === undefined && this.outer) {
            return this.outer.get(key)
        }
        return value
    }

    set(key, value){
        this.store.set(key, value)
        return value
    }
}


export {Eval}