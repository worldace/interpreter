import { Integer, Array, Null, Builtin } from './object.js'


function len(...args){
    if (args.length != 1) {
        throw `wrong number of arguments. got=${args.length}, want=1`
    }
    switch(args[0].constructor.name){
        case 'String':
            return new Integer(args[0].value.length)
        case 'Array':
            return new Integer(args[0].elements.length)
        default:
            throw `argument to \`len\` not supported, got ${args[0].type}`
    }
}


function first(...args){
    if (args.length != 1) {
        throw`wrong number of arguments. got=${args.length}, want=1`
    }
    if (args[0].constructor.name != 'Array') {
        throw `argument to \`first\` must be ARRAY, got ${args[0].type}`
    }
    if (args[0].elements.length > 0) {
        return args[0].elements[0]
    }

    return new Null()
}


function last(...args){
    if (args.length != 1) {
        throw `wrong number of arguments. got=${args.length}, want=1`
    }
    if (args[0].constructor.name != 'Array') {
        throw `argument to \`last\` must be ARRAY, got ${args[0].type}`
    }
    const length = args[0].elements.length

    if (length > 0) {
        return args[0].elements[length - 1]
    }

    return new Null()
}


function rest(...args){
    if (args.length != 1) {
        throw `wrong number of arguments. got=${args.length}, want=1`
    }
    if (args[0].constructor.name != 'Array') {
        throw `argument to \`rest\` must be ARRAY, got ${args[0].type}`
    }
    const length = args[0].elements.length

    if (length > 0) {
        const newElements = args[0].elements.slice(1, length)
        return new Array(newElements)
    }

    return new Null()
}


function push(...args){
    if (args.length != 2) {
        throw `wrong number of arguments. got=${args.length}, want=2`
    }
    if (args[0].constructor.name != 'Array') {
        throw `argument to \`rest\` must be ARRAY, got ${args[0].type}`
    }

    const length = args[0].elements.length
    args[0].elements[length] = args[1]

    return new Array(args[0].elements)
}



function print(...args){
    if (args.length != 1) {
        throw `wrong number of arguments. got=${args.length}, want=1`
    }

    $output.append(args[0]?.inspect(), document.createElement('br'))

    return new Null()
}



export const Functions = {
    len   : new Builtin(len),
    first : new Builtin(first),
    last  : new Builtin(last),
    rest  : new Builtin(rest),
    push  : new Builtin(push),
    print : new Builtin(print),
}
