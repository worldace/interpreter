
class Program {
    statements
    constructor(statements = []){
        this.statements = statements
    }
}

class LetStatement {
    token
    id
    value
    constructor(token){
        this.token = token
    }
}

class ReturnStatement {
    token
    returnValue
    constructor(token){
        this.token = token
    }
}

class ExpressionStatement {
    token
    expression
    value
    constructor(token){
        this.token = token
    }
}

class PrefixExpression {
    token
    operator
    right
    constructor(token, operator){
        this.token = token
        this.operator = operator
    }
}

class InfixExpression {
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

class ID {
    token
    value
    constructor(token, value){
        this.token = token
        this.value = value
    }
}

class StringLiteral {
    token
    value
    constructor(token, value){
        this.token = token
        this.value = value
    }
}

class IntegerLiteral {
    token
    value
    constructor(token, value){
        this.token = token
        this.value = value
    }
}

class Boolean {
    token
    value
    constructor(token, value){
        this.token = token
        this.value = value
    }
}

class IfExpression {
    token
    condition
    ifBlock
    elseBlock
    constructor(token){
        this.token = token
    }
}

class BlockStatement {
    token
    statements
    constructor(token){
        this.token = token
        this.statements = []
    }
}

class FunctionLiteral {
    token
    parameters
    body
    constructor(token){
        this.token = token
    }
}

class CallExpression {
    token
    fc
    arguments
    constructor(token, fc){
        this.token = token
        this.fc = fc
    }
}

class ArrayLiteral {
    token
    elements
    constructor(token){
        this.token = token
    }
}

class IndexExpression {
    token
    left
    index
    constructor(token, left){
        this.token = token
        this.left = left
    }
}

class HashLiteral {
    token
    pairs
    constructor(token){
        this.token = token
    }
}


export {Program, LetStatement, ReturnStatement, ExpressionStatement, PrefixExpression, InfixExpression, ID, StringLiteral, IntegerLiteral, Boolean, IfExpression, BlockStatement, FunctionLiteral, CallExpression, ArrayLiteral, IndexExpression, HashLiteral}