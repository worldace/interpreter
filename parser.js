import { Token, T } from './token.js';
import { Program, LetStatement, Identifier, ReturnStatement, ExpressionStatement, IntegerLiteral, PrefixExpression, InfixExpression, Boolean, IfExpression, BlockStatement, FunctionLiteral, CallExpression, StringLiteral, ArrayLiteral, IndexExpression, HashLiteral } from './ast.js';


const LOWEST = 1;
const EQUALS = 2;
const LESSGREATER = 3;
const SUM = 4;
const PRODUCT = 5;
const PREFIX = 6;
const CALL = 7;
const INDEX = 8;
const precedences = {
    [T.EQ]: EQUALS,
    [T.NOT_EQ]: EQUALS,
    [T.LT]: LESSGREATER,
    [T.GT]: LESSGREATER,
    [T.PLUS]: SUM,
    [T.MINUS]: SUM,
    [T.SLASH]: PRODUCT,
    [T.ASTERISK]: PRODUCT,
    [T.LPAREN]: CALL,
    [T.LBRACKET]: INDEX
};
export class Parser {
    l;
    curToken;
    peekToken;
    errors = [];
    prefixParseFns;
    infixParseFns;
    constructor(l, curToken = new Token(T.DEFAULT, 'DEFAULT'), peekToken = new Token(T.DEFAULT, 'DEFAULT'), errors = [], prefixParseFns = new Map(), infixParseFns = new Map()){
        this.l = l;
        this.curToken = curToken;
        this.peekToken = peekToken;
        this.errors = errors;
        this.prefixParseFns = prefixParseFns;
        this.infixParseFns = infixParseFns;
        this.nextToken();
        this.nextToken();
        this.registerPrefix(T.IDENT, this.parseIdentifier);
        this.registerPrefix(T.STRING, this.parseStringLiteral);
        this.registerPrefix(T.INT, this.parseIntegerLiteral);
        this.registerPrefix(T.BANG, this.parsePrefixExpression);
        this.registerPrefix(T.MINUS, this.parsePrefixExpression);
        this.registerPrefix(T.TRUE, this.parseBoolean);
        this.registerPrefix(T.FALSE, this.parseBoolean);
        this.registerPrefix(T.LPAREN, this.parseGroupedExpression);
        this.registerPrefix(T.IF, this.parseIfExpression);
        this.registerPrefix(T.FUNCTION, this.parseFunctionLiteral);
        this.registerPrefix(T.LBRACKET, this.parseArrayLiteral);
        this.registerPrefix(T.LBRACE, this.parseHashLiteral);
        this.registerInfix(T.PLUS, this.parseInfixExpression);
        this.registerInfix(T.MINUS, this.parseInfixExpression);
        this.registerInfix(T.SLASH, this.parseInfixExpression);
        this.registerInfix(T.ASTERISK, this.parseInfixExpression);
        this.registerInfix(T.EQ, this.parseInfixExpression);
        this.registerInfix(T.NOT_EQ, this.parseInfixExpression);
        this.registerInfix(T.LT, this.parseInfixExpression);
        this.registerInfix(T.GT, this.parseInfixExpression);
        this.registerInfix(T.LPAREN, this.parseCallExpression);
        this.registerInfix(T.LBRACKET, this.parseIndexExpression);
    }
    nextToken() {
        this.curToken = this.peekToken;
        this.peekToken = this.l.NextToken();
    }
    registerPrefix(tokenType, fn) {
        this.prefixParseFns.set(tokenType, fn);
    }
    registerInfix(tokenType, fn) {
        this.infixParseFns.set(tokenType, fn);
    }
    parseProgram() {
        const program = new Program();
        while(this.curToken.type != T.EOF){
            const stmt = this.parseStatement();
            if (stmt != null) {
                program.statements.push(stmt);
            }
            this.nextToken();
        }
        return program;
    }
    parseStatement() {
        switch(this.curToken.type){
            case T.LET:
                return this.parseLetStatement();
            case T.RETURN:
                return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    }
    parseLetStatement() {
        const stmt = new LetStatement(this.curToken);
        if (!this.expectPeek(T.IDENT)) {
            return stmt;
        }
        stmt.name = new Identifier(this.curToken, this.curToken.literal);
        if (!this.expectPeek(T.ASSIGN)) {
            return stmt;
        }
        this.nextToken();
        stmt.value = this.parseExpression(LOWEST);
        if (this.peekTokenIs(T.SEMICOLON)) {
            this.nextToken();
        }
        return stmt;
    }
    parseReturnStatement() {
        const stmt = new ReturnStatement(this.curToken);
        this.nextToken();
        stmt.returnValue = this.parseExpression(LOWEST);
        if (this.peekTokenIs(T.SEMICOLON)) {
            this.nextToken();
        }
        return stmt;
    }
    parseExpressionStatement() {
        const stmt = new ExpressionStatement(this.curToken);
        stmt.expression = this.parseExpression(LOWEST);
        if (this.peekTokenIs(T.SEMICOLON)) {
            this.nextToken();
        }
        return stmt;
    }
    noPrefixParseFnError(t) {
        const msg = 'no prefix parse function for ' + t + ' found';
        this.errors.push(msg);
    }
    parseExpression(precedence) {
        const prefix = this.prefixParseFns.get(this.curToken.type).bind(this); //  [Function: parseIdentifier]
        if (prefix == null) {
            this.noPrefixParseFnError(this.curToken.type);
            return null;
        }
        let leftExp = prefix(this.curToken);
        while(!this.curTokenIs(T.SEMICOLON) && precedence < this.peekPrecedence()){
            const infix = this.infixParseFns.get(this.peekToken.type).bind(this);
            if (infix == null) {
                return leftExp;
            }
            this.nextToken();
            leftExp = infix(this.curToken, leftExp);
        }
        return leftExp;
    }
    parseIdentifier(curToken) {
        return new Identifier(curToken, curToken.literal);
    }
    parseStringLiteral() {
        return new StringLiteral(this.curToken, this.curToken.literal);
    }
    parseIntegerLiteral(curToken) {
        const lit = new IntegerLiteral(curToken);
        const value = Number(curToken.literal);
        lit.value = value;
        return lit;
    }
    parsePrefixExpression(curToken) {
        const expression = new PrefixExpression(curToken, curToken.literal);
        this.nextToken();
        expression.right = this.parseExpression(PREFIX);
        return expression;
    }
    parseInfixExpression(curToken, left) {
        const expression = new InfixExpression(curToken, curToken.literal, left);
        const precedence = this.curPrecedence();
        this.nextToken();
        expression.right = this.parseExpression(precedence);
        return expression;
    }
    parseGroupedExpression() {
        this.nextToken();
        const exp = this.parseExpression(LOWEST);
        if (!this.expectPeek(T.RPAREN)) {
            return exp;
        }
        return exp;
    }
    parseIfExpression(curToken) {
        const expression = new IfExpression(curToken);
        if (!this.expectPeek(T.LPAREN)) {
            return expression;
        }
        this.nextToken();
        expression.condition = this.parseExpression(LOWEST);
        if (!this.expectPeek(T.RPAREN)) {
            return expression;
        }
        if (!this.expectPeek(T.LBRACE)) {
            return expression;
        }
        expression.consequence = this.parseBlockStatement(this.curToken);
        if (this.peekTokenIs(T.ELSE)) {
            this.nextToken();
            if (!this.expectPeek(T.LBRACE)) {
                return expression;
            }
            expression.alternative = this.parseBlockStatement(this.curToken);
        }
        return expression;
    }
    parseBlockStatement(curToken) {
        const block = new BlockStatement(curToken);
        block.statements = [];
        this.nextToken();
        while(!this.curTokenIs(T.RBRACE) && !this.curTokenIs(T.EOF)){
            const stmt = this.parseStatement();
            if (stmt != null) {
                block.statements.push(stmt);
            }
            this.nextToken();
        }
        return block;
    }
    parseFunctionLiteral(curToken) {
        const lit = new FunctionLiteral(curToken);
        if (!this.expectPeek(T.LPAREN)) {
            return lit;
        }
        lit.parameters = this.parseFunctionParameters();
        if (!this.expectPeek(T.LBRACE)) {
            return lit;
        }
        lit.body = this.parseBlockStatement(curToken);
        return lit;
    }
    parseFunctionParameters() {
        let identifiers = [];
        if (this.peekTokenIs(T.RPAREN)) {
            this.nextToken();
            return identifiers;
        }
        this.nextToken();
        const ident = new Identifier(this.curToken, this.curToken.literal);
        identifiers.push(ident);
        while(this.peekTokenIs(T.COMMA)){
            this.nextToken();
            this.nextToken();
            const ident1 = new Identifier(this.curToken, this.curToken.literal);
            identifiers.push(ident1);
        }
        if (!this.expectPeek(T.RPAREN)) {
            return identifiers;
        }
        return identifiers;
    }
    parseBoolean(curToken) {
        return new Boolean(curToken, this.curTokenIs(T.TRUE));
    }
    parseCallExpression(curToken, fc) {
        const exp = new CallExpression(curToken, fc);
        exp.arguments = this.parseExpressionList(T.RPAREN);
        return exp;
    }
    parseCallArguments() {
        let args = [];
        if (this.peekTokenIs(T.LPAREN)) {
            this.nextToken();
            return args;
        }
        this.nextToken();
        args.push(this.parseExpression(LOWEST));
        while(this.peekTokenIs(T.COMMA)){
            this.nextToken();
            this.nextToken();
            args.push(this.parseExpression(LOWEST));
        }
        if (!this.expectPeek(T.RPAREN)) {
            return args;
        }
        return args;
    }
    parseArrayLiteral() {
        const array = new ArrayLiteral(this.curToken);
        array.elements = this.parseExpressionList(T.RBRACKET);
        return array;
    }
    parseExpressionList(end) {
        let list = [];
        if (this.peekTokenIs(end)) {
            this.nextToken();
            return list;
        }
        this.nextToken();
        list.push(this.parseExpression(LOWEST));
        while(this.peekTokenIs(T.COMMA)){
            this.nextToken();
            this.nextToken();
            list.push(this.parseExpression(LOWEST));
        }
        if (!this.expectPeek(end)) {
            return null;
        }
        return list;
    }
    parseIndexExpression(t, left) {
        const exp = new IndexExpression(this.curToken, left);
        this.nextToken();
        exp.index = this.parseExpression(LOWEST);
        if (!this.expectPeek(T.RBRACKET)) {
            return t;
        }
        return exp;
    }
    parseHashLiteral() {
        const hash = new HashLiteral(this.curToken);
        hash.pairs = new Map();
        while(!this.peekTokenIs(T.RBRACE)){
            this.nextToken();
            const key = this.parseExpression(LOWEST);
            if (!this.expectPeek(T.COLON)) {
                return null;
            }
            this.nextToken();
            const value = this.parseExpression(LOWEST);
            hash.pairs.set(key, value);
            if (!this.peekTokenIs(T.RBRACE) && !this.expectPeek(T.COMMA)) {
                return null;
            }
        }
        if (!this.expectPeek(T.RBRACE)) {
            return null;
        }
        return hash;
    }
    peekPrecedence() {
        const precedence = precedences[this.peekToken.type];
        return precedence || LOWEST;
    }
    curPrecedence() {
        const precedence = precedences[this.curToken.type];
        return precedence || LOWEST;
    }
    curTokenIs(t) {
        return this.curToken.type == t;
    }
    peekTokenIs(t) {
        return this.peekToken.type == t;
    }
    expectPeek(t) {
        if (this.peekTokenIs(t)) {
            this.nextToken();
            return true;
        } else {
            this.peekError(t);
            return false;
        }
    }
    Errors() {
        return this.errors;
    }
    peekError(t) {
        const msg = 'expected next token to be ' + t + ' , got ' + this.peekToken.type + ' instead';
        this.errors.push(msg);
    }
}
