

export class Program {
    statements
    constructor(statements = []){
        this.statements = statements
    }
}


export class LetStatement {
    token
    name
    value
    constructor(token){
        this.token = token
    }
}
export class ReturnStatement {
    token
    returnValue
    constructor(token){
        this.token = token
    }
}
export class ExpressionStatement {
    token
    expression
    value
    constructor(token){
        this.token = token
    }
}
export class PrefixExpression {
    token
    operator
    right
    constructor(token, operator){
        this.token = token
        this.operator = operator
    }
}
export class InfixExpression {
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
export class Identifier {
    token
    value
    constructor(token, value){
        this.token = token
        this.value = value
    }
}
export class StringLiteral {
    token
    value
    constructor(token, value){
        this.token = token
        this.value = value
    }
}
export class IntegerLiteral {
    token
    value
    constructor(token){
        this.token = token
    }
}
export class Boolean {
    token
    value
    constructor(token, value){
        this.token = token
        this.value = value
    }
}
export class IfExpression {
    token
    condition
    consequence
    alternative
    constructor(token){
        this.token = token
    }
}
export class BlockStatement {
    token
    statements
    constructor(token){
        this.token = token
    }
}
export class FunctionLiteral {
    token
    parameters
    body
    constructor(token){
        this.token = token
    }
}
export class CallExpression {
    token
    fc
    arguments
    constructor(token, fc){
        this.token = token
        this.fc = fc
    }
}
export class ArrayLiteral {
    token
    elements
    constructor(token){
        this.token = token
    }
}
export class IndexExpression {
    token
    left
    index
    constructor(token, left){
        this.token = token
        this.left = left
    }
}
export class HashLiteral {
    token
    pairs
    constructor(token){
        this.token = token
    }
}
