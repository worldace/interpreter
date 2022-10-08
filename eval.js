import { Integer, Boolean, Null, ReturnValue, Error, Function, String, Array, Hash } from './object.js'
import { Functions } from './functions.js'



function Eval(node, env = new Environment()){
    switch(node.constructor.name){
        case 'Program'    : return evalProgram(node, env)
        case 'ID'         : return evalID(node, env)
        case 'String値'   : return new String(node.value)
        case 'Integer値'  : return new Integer(node.value)
        case 'Boolean値'  : return new Boolean(node.value)
        case 'Array値'    : return evalArray(evalList(node.elements, env))
        case 'Hash値'     : return evalHash(node, env)
        case 'Function値' : return new Function(node.parameters, node.body, env)
        case 'Prefix式'   : return evalPrefix(node.operator, Eval(node.right, env))
        case 'Infix式'    : return evalInfix(node.operator, Eval(node.left, env), Eval(node.right, env))
        case 'Index式'    : return evalIndex(Eval(node.left, env), Eval(node.index, env))
        case 'Call式'     : return evalFunction(Eval(node.fc, env), evalList(node.arguments, env))
        case 'If式'       : return evalIf(node, env)
        case '式文'       : return Eval(node.expression, env)
        case 'Block文'    : return evalBlock(node, env)
        case 'Let文'      : return evalLet(node.id.value, Eval(node.value, env), env)
        case 'Return文'   : return evalReturn(Eval(node.returnValue, env))
    }
}



function evalProgram(program, env){
    let result

    for (const statement of program.statements){
        result = Eval(statement, env)

        switch(result.constructor.name){
            case 'ReturnValue':
                return result.value
            case 'Error':
                return result
        }
    }

    return result
}


function evalBlock(block, env){
    let result

    for (const v of block.statements){
        result = Eval(v, env)
        if (result?.type() === 'return' || result?.type() === 'error') {
            return result
        }
    }

    return result
}


function evalLet(id, value, env){
    if (isError(value)) {
        return value
    }

    return env.set(id, value)
}


function evalIf(ie, env){
    const condition = Eval(ie.condition, env)

    if (isTruthy(condition)) {
        return Eval(ie.ifBlock, env)
    }
    else if (ie.elseBlock) {
        return Eval(ie.elseBlock, env)
    }
    else {
        return new Null()
    }
}


function evalPrefix(operator, right){
    if (isError(right)) {
        return right
    }

    switch(operator){
        case '!':
            return evalBangOperatorExpression(right)
        case '-':
            return evalMinusOperatorExpression(right)
        default:
            return new Error(`unknown operator: ${operator}${right.type()}`)
    }
}


function evalBangOperatorExpression(right){
    switch(right.value){
        case false:
            return new Boolean(true)
        case null:
            return new Boolean(true)
        default:
            return new Boolean(false)
    }
}


function evalMinusOperatorExpression(right){
    if (right.type() !== 'integer') {
        return new Error(`unknown operator: -${right.type()}`)
    }

    return new Integer(-right.value)
}


function evalInfix(operator, left, right){
    if (isError(left)) {
        return left
    }
    if (isError(right)) {
        return right
    }

    if (operator == '==') {
        return new Boolean(left.value == right.value)
    }
    else if (operator == '!=') {
        return new Boolean(left.value != right.value)
    }
    else if (left.type() == 'integer' && right.type() == 'integer') {
        return evalIntegerInfixExpression(operator, left, right)
    }
    else if (left.type() == 'string' && right.type() == 'string') {
        return evalStringInfixExpression(operator, left, right)
    }
    else if (left.type() != right.type()) {
        return new Error(`type mismatch: ${left.type()} ${operator} ${right.type()}`)
    }

    return new Error(`unknown operator: ${left.type()} ${operator} ${right.type()}`)
}


function evalStringInfixExpression(operator, left, right){
    if (operator !== '+') {
        return new Error(`unknown operator: ${left.type()} ${operator} ${right.type()}`)
    }
    return new String(left.value + right.value)
}


function evalIntegerInfixExpression(operator, left, right){
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
            return new Error(`unknown operator: ${left.type()} ${operator} ${right.type()}`)
    }
}


function evalID(node, env){
    const val = env.get(node.value)
    const builtin = Functions[node.value]

    if (!val && !builtin) {
        return new Error(`id not found: ` + node.value)
    }
    if (val){
        return val
    }
    else if(builtin){
        return builtin
    }
}


function evalArray(elements){
    if (elements.length == 1 && isError(elements[0])) {
        return elements[0]
    }

    return new Array(elements)
}


function evalList(exps, env){
    let result = []

    for (const v of exps){
        const evaluated = Eval(v, env)
        if (isError(evaluated)) {
            return evaluated
        }
        result.push(evaluated)
    }

    return result
}


function evalIndex(left, index){
    if (isError(left)) {
        return left
    }
    if (isError(index)) {
        return index
    }

    if (left.type() == 'array' && index.type() == 'integer') {
        return evalArrayIndexExpression(left, index)
    }
    else if (left.type() == 'hash' && index.type() == 'string') {
        return evalHashKeyExpression(left, index)
    }
    else {
        return new Error(`index operator not supported: ${left.type()}`)
    }
}


function evalArrayIndexExpression(array, index){
    const idx = index.value
    const max = array.elements.length - 1
    if (idx < 0 || idx > max) {
        return null
    }
    return array.elements[idx]
}


function evalHash(node, env){
    const map = new Map()

    for (const [k, v] of node.map){
        const key = Eval(k, env)
        if (isError(key)) {
            return key
        }
        const value = Eval(v, env)
        if (isError(value)) {
            return value
        }
        map.set(key.value, value)
    }

    return new Hash(map)
}


function evalHashKeyExpression(hash, key){
    return hash.map.get(key.value)
}


function evalFunction(fn, args){
    if (isError(fn)) {
        return fn
    }
    if (args.length == 1 && isError(args[0])) {
        return args[0]
    }

    if(fn.constructor.name === 'Function'){
        const env = new Environment(new Map(), fn.env)

        for(const [i,v] of fn.parameters.entries()){
            env.set(v.value, args[i])
        }

        const result = Eval(fn.body, env)

        if (result.constructor.name == 'ReturnValue') {
            return result.value
        }

        return result
    }
    else if(fn.constructor.name === 'Builtin'){
        return fn.fn(...args)
    }
    else{
        return new Error(`not a function: ${fn.type()}`)
    }
}


function evalReturn(val){
    if (isError(val)) {
        return val
    }

    return new ReturnValue(val)
}



function isTruthy(obj){
    switch(obj.value){
        case null:
            return false
        case false:
            return false
        default:
            return true
    }
}


function isError(obj){
    if (obj != null) {
        return obj.type() === 'error'
    }
    return false
}


class Environment{
    constructor(store = new Map, outer = null){
        this.store = store
        this.outer = outer
    }

    get(key){
        const obj = this.store.get(key)
        if (!obj && this.outer != null) {
            return this.outer.get(key)
        }
        return obj
    }

    set(key, val){
        this.store.set(key, val)
        return val
    }
}


export {Eval}