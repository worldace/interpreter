
class Program {
    statements
    constructor(statements = []){
        this.statements = statements
    }
}

class ID {
    token
    value
    constructor(token, value){
        this.token = token
        this.value = value
    }
}

class String値 {
    token
    value
    constructor(token, value){
        this.token = token
        this.value = value
    }
}

class Integer値 {
    token
    value
    constructor(token, value){
        this.token = token
        this.value = value
    }
}

class Boolean値 {
    token
    value
    constructor(token, value){
        this.token = token
        this.value = value
    }
}

class Array値 {
    token
    elements
    constructor(token){
        this.token = token
    }
}

class Hash値 {
    token
    map
    constructor(token){
        this.token = token
        this.map = new Map
    }
}

class Function値 {
    token
    parameters
    body
    constructor(token){
        this.token = token
    }
}

class Prefix式 {
    token
    operator
    right
    constructor(token, operator){
        this.token = token
        this.operator = operator
    }
}

class Infix式 {
    token
    operator
    left
    right
    constructor(token, operator, left){
        this.token = token
        this.operator = operator
        this.left = left
    }
}

class Index式 {
    token
    left
    index
    constructor(token, left){
        this.token = token
        this.left = left
    }
}

class Call式 {
    token
    fc
    arguments
    constructor(token, fc){
        this.token = token
        this.fc = fc
    }
}

class If式 {
    token
    condition
    ifBlock
    elseBlock
    constructor(token){
        this.token = token
    }
}

class 式文 {
    token
    expression
    value
    constructor(token){
        this.token = token
    }
}

class Block文 {
    token
    statements
    constructor(token){
        this.token = token
        this.statements = []
    }
}

class Let文 {
    token
    id
    value
    constructor(token){
        this.token = token
    }
}

class Return文 {
    token
    returnValue
    constructor(token){
        this.token = token
    }
}



export {Program, ID, String値, Integer値, Boolean値, Array値, Hash値, Function値, Prefix式, Infix式, Index式, Call式, If式, 式文, Block文, Let文, Return文}