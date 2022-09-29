import { builtins } from './builtins.js';
import { Integer, Boolean, Null, ReturnValue, Error, INTEGER_OBJ, RETURN_VALUE_OBJ, ERROR_OBJ, Function, String, STRING_OBJ, Array, ARRAY_OBJ, Hash, HASH_OBJ } from './object.js';


export const Eval = (node, env)=>{
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
};
const evalProgram = (program, env)=>{
    let result;
    for (const statement of program.statements){
        result = Eval(statement, env);
        switch(result.constructor.name){
            case 'ReturnValue':
                return result.value;
            case 'Error':
                return result;
        }
    }
    return result;
};
const evalBlockStatement = (block, env)=>{
    let result;
    for (const statement of block.statements){
        result = Eval(statement, env);
        if (result != null) {
            const rt = result.type();
            if (rt == RETURN_VALUE_OBJ || rt == ERROR_OBJ) {
                return result;
            }
        }
    }
    return result;
};
const evalExpressions = (exps, env)=>{
    let result = [];
    for (const e of exps){
        const evaluated = Eval(e, env);
        if (isError(evaluated)) {
            return evaluated;
        }
        result.push(evaluated);
    }
    return result;
};
const applyFunction = (fn, args)=>{
    switch(fn.constructor.name){
        case 'Function':
            {
                const extendedEnv = extendFunctionEnv(fn, args);
                const evaluated = Eval(fn.body, extendedEnv);
                return unwrapReturnValue(evaluated);
            }
        case 'Builtin':
            {
                return fn.fn(...args);
            }
        default:
            return new Error(`not a function: ${fn.type()}`);
    }
};
const extendFunctionEnv = (fn, args)=>{
    const env = fn.env.newEnclosedEnvironment(fn.env);
    fn.parameters.forEach((param, paramIdx)=>{
        env.set(param.value, args[paramIdx]);
    });
    return env;
};
const unwrapReturnValue = (obj)=>{
    if (obj.constructor.name == 'ReturnValue') {
        return obj.value;
    }
    return obj;
};
const evalPrefixExpression = (operator, right)=>{
    switch(operator){
        case '!':
            return evalBangOperatorExpression(right);
        case '-':
            return evalMinusPrefixOperatorExpression(right);
        default:
            return new Error(`unknown operator: ${operator}${right.type}`);
    }
};
const evalBangOperatorExpression = (right)=>{
    switch(right.value){
        case true:
            return new Boolean(false);
        case false:
            return new Boolean(true);
        case null:
            return new Boolean(true);
        default:
            return new Boolean(false);
    }
};
const evalMinusPrefixOperatorExpression = (right)=>{
    if (right.type() != INTEGER_OBJ) {
        return new Error(`unknown operator: -${right.type()}`);
    }
    const value = right.value;
    return new Integer(-value);
};
const evalInfixExpression = (operator, left, right)=>{
    if (left.type() == INTEGER_OBJ && right.type() == INTEGER_OBJ) {
        return evalIntegerInfixExpression(operator, left, right);
    }
    if (operator == '==') {
        return new Boolean(left.value == right.value);
    }
    if (operator == '!=') {
        return new Boolean(left.value != right.value);
    }
    if (left.type() != right.type()) {
        return new Error(`type mismatch: ${left.type()} ${operator} ${right.type()}`);
    }
    if (left.type() == STRING_OBJ && right.type() == STRING_OBJ) {
        return evalStringInfixExpression(operator, left, right);
    }
    return new Error(`unknown operator: ${left.type()} ${operator} ${right.type()}`);
};
const evalStringInfixExpression = (operator, left, right)=>{
    if (operator != '+') {
        return new Error(`unknown operator: ${left.type()} ${operator} ${right.type()}`);
    }
    const leftVal = left.value;
    const rightVal = right.value;
    return new String(leftVal + rightVal);
};
const evalIntegerInfixExpression = (operator, left, right)=>{
    const leftVal = left.value;
    const rightVal = right.value;
    switch(operator){
        case '+':
            return new Integer(leftVal + rightVal);
        case '-':
            return new Integer(leftVal - rightVal);
        case '*':
            return new Integer(leftVal * rightVal);
        case '/':
            return new Integer(leftVal / rightVal);
        case '<':
            return new Boolean(leftVal < rightVal);
        case '>':
            return new Boolean(leftVal > rightVal);
        case '==':
            return new Boolean(leftVal == rightVal);
        case '!=':
            return new Boolean(leftVal != rightVal);
        default:
            return new Error(`unknown operator: ${left.type()} ${operator} ${right.type()}`);
    }
};
const evalIfExpression = (ie, env)=>{
    const condition = Eval(ie.condition, env);
    if (isError(condition)) {
        return condition;
    }
    if (isTruthy(condition)) {
        return Eval(ie.consequence, env);
    } else if (ie.alternative != null) {
        return Eval(ie.alternative, env);
    } else {
        return new Null();
    }
};
const evalIdentifier = (node, env)=>{
    const val = env.get(node.value);
    const builtin = builtins[node.value];
    if (!val && !builtin) {
        return new Error(`identifier not found: ` + node.value);
    }
    if (val) return val;
    if (builtin) return builtin;
};
const evalIndexExpression = (left, index)=>{
    if (left.type() == ARRAY_OBJ && index.type() == INTEGER_OBJ) {
        return evalArrayIndexExpression(left, index);
    } else if (left.type() == HASH_OBJ) {
        return evalHashIndexExpression(left, index);
    } else {
        return new Error(`index operator not supported: ${left.type()}`);
    }
};
const evalArrayIndexExpression = (array, index)=>{
    const idx = index.value;
    const max = array.elements.length - 1;
    if (idx < 0 || idx > max) {
        return null;
    }
    return array.elements[idx];
};
const evalHashLiteral = (node, env)=>{
    const pairs = new Map();
    for (const [keyNode, valueNode] of node.pairs){
        const key = Eval(keyNode, env);
        if (isError(key)) {
            return key;
        }
        const value = Eval(valueNode, env);
        if (isError(value)) {
            return value;
        }
        const hashed = key.hashKey();
        pairs.set(hashed, {
            key: key,
            value: value
        });
    }
    return new Hash(pairs);
};
const evalHashIndexExpression = (hash, index)=>{
    const pair = hash.paris.get(index.hashKey());
    if (!pair) {
        return null;
    }
    return pair.value;
};
const isTruthy = (obj)=>{
    switch(obj.value){
        case null:
            return false;
        case true:
            return true;
        case false:
            return false;
        default:
            return true;
    }
};
const isError = (obj)=>{
    if (obj != null) {
        return obj.type() == ERROR_OBJ;
    }
    return false;
};
