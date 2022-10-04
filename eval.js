import { Functions } from './functions.js'
import { Integer, Boolean, Null, ReturnValue, Error, Function, String, Array, Hash } from './object.js'


function Eval(node, env = new Environment(new Map)){
    switch(node.constructor.name){
        case 'Program':
            return evalProgram(node, env);
        case 'ExpressionStatement':
            return Eval(node.expression, env);
        case 'StringLiteral':
            return new String(node.value);
        case 'IntegerLiteral':
            return new Integer(node.value);
        case 'Boolean':
            return new Boolean(node.value);
        case 'PrefixExpression':
            {
                const right = Eval(node.right, env);
                if (isError(right)) {
                    return right;
                }
                return evalPrefixExpression(node.operator, right);
            }
        case 'InfixExpression':
            {
                const left = Eval(node.left, env);
                if (isError(left)) {
                    return left;
                }
                const right1 = Eval(node.right, env);
                if (isError(right1)) {
                    return right1;
                }
                return evalInfixExpression(node.operator, left, right1);
            }
        case 'BlockStatement':
            return evalBlockStatement(node, env);
        case 'IfExpression':
            return evalIfExpression(node, env);
        case 'ReturnStatement':
            {
                const val = Eval(node.returnValue, env);
                if (isError(val)) {
                    return val;
                }
                return new ReturnValue(val);
            }
        case 'Identifier':
            return evalIdentifier(node, env);
        case 'LetStatement':
            {
                const val1 = Eval(node.value, env);
                if (isError(val1)) {
                    return val1;
                }
                return env.set(node.name.value, val1);
            }
        case 'FunctionLiteral':
            {
                const params = node.parameters;
                const body = node.body;
                return new Function(params, body, env);
            }
        case 'CallExpression':
            {
                const objectFunction = Eval(node.fc, env);
                if (isError(objectFunction)) {
                    return objectFunction;
                }
                const args = evalExpressions(node.arguments, env);
                if (args.length == 1 && isError(args[0])) {
                    return args[0];
                }
                return applyFunction(objectFunction, args);
            }
        case 'ArrayLiteral':
            {
                const elements = evalExpressions(node.elements, env);
                if (elements.length == 1 && isError(elements[0])) {
                    return elements[0];
                }
                return new Array(elements);
            }
        case 'IndexExpression':
            {
                const left1 = Eval(node.left, env);
                if (isError(left1)) {
                    return left1;
                }
                const index = Eval(node.index, env);
                if (isError(index)) {
                    return index;
                }
                return evalIndexExpression(left1, index);
            }
        case 'HashLiteral':
            {
                return evalHashLiteral(node, env);
            }
    }
    return null;
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


function evalBlockStatement(block, env){
    let result

    for (const v of block.statements){
        result = Eval(v, env)
        if (result?.type() == 'return' || result?.type() == 'error') {
            return result
        }
    }

    return result
}


function evalExpressions(exps, env){
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


function applyFunction(fn, args){
    switch(fn.constructor.name){
        case 'Function':
            return evalFunction(fn, args)
        case 'Builtin':
            return fn.fn(...args)
        default:
            return new Error(`not a function: ${fn.type()}`)
    }
}


function evalFunction(fn, args){
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


function evalPrefixExpression(operator, right){
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
    if (right.type() != 'integer') {
        return new Error(`unknown operator: -${right.type()}`)
    }

    return new Integer(-right.value)
}


function evalInfixExpression(operator, left, right){
    if (left.type() == 'integer' && right.type() == 'integer') {
        return evalIntegerInfixExpression(operator, left, right)
    }
    else if (operator == '==') {
        return new Boolean(left.value == right.value)
    }
    else if (operator == '!=') {
        return new Boolean(left.value != right.value)
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
    if (operator != '+') {
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


function evalIfExpression(ie, env){
    const condition = Eval(ie.condition, env)

    if (isError(condition)) {
        return condition
    }
    if (isTruthy(condition)) {
        return Eval(ie.consequence, env)
    }
    else if (ie.alternative != null) {
        return Eval(ie.alternative, env)
    }
    else {
        return new Null()
    }
}


function evalIdentifier(node, env){
    const val = env.get(node.value)
    const builtin = Functions[node.value]

    if (!val && !builtin) {
        return new Error(`identifier not found: ` + node.value)
    }
    if (val){
        return val
    }
    else if(builtin){
        return builtin
    }
}


function evalIndexExpression(left, index){
    if (left.type() == 'array' && index.type() == 'integer') {
        return evalArrayIndexExpression(left, index)
    }
    else if (left.type() == 'hash') {
        return evalHashIndexExpression(left, index)
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


function evalHashLiteral(node, env){
    const pairs = new Map()

    for (const [k, v] of node.pairs){
        const key = Eval(k, env)
        if (isError(key)) {
            return key
        }
        const value = Eval(v, env)
        if (isError(value)) {
            return value
        }
        const hashed = key.hashKey()
        pairs.set(hashed, {key, value})
    }

    return new Hash(pairs)
}


function evalHashIndexExpression(hash, index){
    const pair = hash.paris.get(index.hashKey())
    return pair?.value
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
        return obj.type() == 'error'
    }
    return false
}


class Environment{
    constructor(store, outer = null){
        this.store = store
        this.outer = outer
    }

    get(name){
        const obj = this.store.get(name)
        if (!obj && this.outer != null) {
            return this.outer.get(name)
        }
        return obj
    }

    set(name, val){
        this.store.set(name, val)
        return val
    }
}


export {Eval}