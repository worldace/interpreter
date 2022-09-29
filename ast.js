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
    tokenLiteral() {
        return this.token.literal;
    }
    string() {
        let statements = [];
        statements.push(this.tokenLiteral() + ' ');
        statements.push(this.name.string());
        statements.push(' = ');
        if (this.value != null) {
            statements.push(this.value.string());
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
    tokenLiteral() {
        return this.token.literal;
    }
    string() {
        let statements = [];
        statements.push(this.tokenLiteral() + ' ');
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
    tokenLiteral() {
        return this.token.literal;
    }
    string() {
        if (this.expression != null) {
            return this.expression.string();
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
    tokenLiteral() {
        return this.token.literal;
    }
    string() {
        let statements = [];
        statements.push('(');
        statements.push(this.operator);
        statements.push(this.right.string());
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
    tokenLiteral() {
        return this.token.literal;
    }
    string() {
        let statements = [];
        statements.push('(');
        try {
            statements.push(this.left.string());
        } catch  {
            statements.push(this.left.value);
        }
        statements.push(' ' + this.operator + ' ');
        try {
            statements.push(this.right.string());
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
    tokenLiteral() {
        return this.token.literal;
    }
    string() {
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
    tokenLiteral() {
        return this.token.literal;
    }
    string() {
        return this.token.literal;
    }
}
export class IntegerLiteral {
    token;
    value;
    constructor(token){
        this.token = token;
    }
    tokenLiteral() {
        return this.token.literal;
    }
    string() {
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
    tokenLiteral() {
        return this.token.literal;
    }
    string() {
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
    tokenLiteral() {
        return this.token.literal;
    }
    string() {
        let statements = [];
        statements.push('if');
        statements.push(this.condition.string());
        statements.push(' ');
        statements.push(this.consequence.string());
        if (this.alternative != null) {
            statements.push('else');
            statements.push(this.alternative.string());
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
    tokenLiteral() {
        return this.token.literal;
    }
    string() {
        let statements = [];
        for (const statement of this.statements){
            statements.push(statement.string());
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
    tokenLiteral() {
        return this.token.literal;
    }
    string() {
        let statements = [];
        let params = [];
        for (const parameter of this.parameters){
            params.push(parameter.string());
        }
        statements.push(this.tokenLiteral());
        statements.push('(');
        statements.push(params.join(', '));
        statements.push(') ');
        statements.push(this.body.string());
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
    tokenLiteral() {
        return this.token.literal;
    }
    string() {
        let statements = [];
        let args = [];
        for (const arg of this.arguments){
            args.push(arg.string());
        }
        statements.push(this.fc.string());
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
    tokenLiteral() {
        return this.token.literal;
    }
    string() {
        let statements = [];
        let elements = [];
        for (const el of this.elements){
            elements.push(el.string());
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
    tokenLiteral() {
        return this.token.literal;
    }
    string() {
        let statements = [];
        statements.push('(');
        statements.push(this.left.string());
        statements.push('[');
        statements.push(this.index.string());
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
    tokenLiteral() {
        return this.token.literal;
    }
    string() {
        let statements = [];
        let pairs = [];
        for (const [key, value] of this.pairs){
            pairs.push(key.string() + ':' + value.string());
        }
        statements.push('{');
        statements.push(pairs.join(', '));
        statements.push('}');
        return statements.join('');
    }
}
