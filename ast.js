

export class Program {
    statements;
    constructor(statements = []){
        this.statements = statements;
    }
}


export class LetStatement {
    token;
    name;
    value;
    constructor(token){
        this.token = token;
    }
    toString() {
        let statements = [];
        statements.push(this.token.literal + ' ');
        statements.push(this.name);
        statements.push(' = ');
        if (this.value != null) {
            statements.push(this.value);
        }
        statements.push(';');
        return statements.join('');
    }
}
export class ReturnStatement {
    token;
    returnValue;
    constructor(token){
        this.token = token;
    }
    toString() {
        let statements = [];
        statements.push(this.token.literal + ' ');
        if (this.returnValue != null) {
            statements.push(this.returnValue);
        }
        statements.push(';');
        return statements.join('');
    }
}
export class ExpressionStatement {
    token;
    expression;
    value;
    constructor(token){
        this.token = token;
    }
    toString() {
        if (this.expression != null) {
            return this.expression;
        }
        return '';
    }
}
export class PrefixExpression {
    token;
    operator;
    right;
    constructor(token, operator){
        this.token = token;
        this.operator = operator;
    }
    toString() {
        let statements = [];
        statements.push('(');
        statements.push(this.operator);
        statements.push(this.right);
        statements.push(')');
        return statements.join('');
    }
}
export class InfixExpression {
    token;
    operator;
    left;
    right;
    constructor(token, operator, left){
        this.token = token;
        this.operator = operator;
        this.left = left;
    }
    toString() {
        let statements = [];
        statements.push('(');
        try {
            statements.push(this.left);
        } catch  {
            statements.push(this.left.value);
        }
        statements.push(' ' + this.operator + ' ');
        try {
            statements.push(this.right);
        } catch  {
            statements.push(this.right.value);
        }
        statements.push(')');
        return statements.join('');
    }
}
export class Identifier {
    token;
    value;
    constructor(token, value){
        this.token = token;
        this.value = value;
    }
    toString() {
        return this.value;
    }
}
export class StringLiteral {
    token;
    value;
    constructor(token, value){
        this.token = token;
        this.value = value;
    }
    toString() {
        return this.token.literal;
    }
}
export class IntegerLiteral {
    token;
    value;
    constructor(token){
        this.token = token;
    }
    toString() {
        return this.token.literal;
    }
}
export class Boolean {
    token;
    value;
    constructor(token, value){
        this.token = token;
        this.value = value;
    }
    toString() {
        return this.token.literal;
    }
}
export class IfExpression {
    token;
    condition;
    consequence;
    alternative;
    constructor(token){
        this.token = token;
    }
    toString() {
        let statements = [];
        statements.push('if');
        statements.push(this.condition);
        statements.push(' ');
        statements.push(this.consequence);
        if (this.alternative != null) {
            statements.push('else');
            statements.push(this.alternative);
        }
        return statements.join('');
    }
}
export class BlockStatement {
    token;
    statements;
    constructor(token){
        this.token = token;
    }
    toString() {
        let statements = [];
        for (const statement of this.statements){
            statements.push(statement);
        }
        return statements.join('');
    }
}
export class FunctionLiteral {
    token;
    parameters;
    body;
    constructor(token){
        this.token = token;
    }
    toString() {
        let statements = [];
        let params = [];
        for (const parameter of this.parameters){
            params.push(parameter);
        }
        statements.push(this.token.literal);
        statements.push('(');
        statements.push(params.join(', '));
        statements.push(') ');
        statements.push(this.body);
        return statements.join('');
    }
}
export class CallExpression {
    token;
    fc;
    arguments;
    constructor(token, fc){
        this.token = token;
        this.fc = fc;
    }
    toString() {
        let statements = [];
        let args = [];
        for (const arg of this.arguments){
            args.push(arg);
        }
        statements.push(this.fc);
        statements.push('(');
        statements.push(args.join(', '));
        statements.push(')');
        return statements.join('');
    }
}
export class ArrayLiteral {
    token;
    elements;
    constructor(token){
        this.token = token;
    }
    toString() {
        let statements = [];
        let elements = [];
        for (const el of this.elements){
            elements.push(el);
        }
        statements.push('[');
        statements.push(elements.join(', '));
        statements.push(']');
        return statements.join('');
    }
}
export class IndexExpression {
    token;
    left;
    index;
    constructor(token, left){
        this.token = token;
        this.left = left;
    }
    toString() {
        let statements = [];
        statements.push('(');
        statements.push(this.left);
        statements.push('[');
        statements.push(this.index);
        statements.push('])');
        return statements.join('');
    }
}
export class HashLiteral {
    token;
    pairs;
    constructor(token){
        this.token = token;
    }
    toString() {
        let statements = [];
        let pairs = [];
        for (const [key, value] of this.pairs){
            pairs.push(key + ':' + value);
        }
        statements.push('{');
        statements.push(pairs.join(', '));
        statements.push('}');
        return statements.join('');
    }
}
