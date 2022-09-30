import { Token, T } from './token.js'
import { Program, LetStatement, Identifier, ReturnStatement, ExpressionStatement, IntegerLiteral, PrefixExpression, InfixExpression, Boolean, IfExpression, BlockStatement, FunctionLiteral, CallExpression, StringLiteral, ArrayLiteral, IndexExpression, HashLiteral } from './ast.js'


const priority = {
    [T.EQ]       : 2,
    [T.NOTEQ]    : 2,
    [T.LT]       : 3,
    [T.GT]       : 3,
    [T.PLUS]     : 4,
    [T.MINUS]    : 4,
    [T.SLASH]    : 5,
    [T.ASTERISK] : 5,
    [T.LPAREN]   : 7,
    [T.LBRACKET] : 8,
}


export class Parser {
    constructor(lexer){
        this.lexer     = lexer
        this.errors    = []
        this.curToken  = new Token(T.DEFAULT, 'DEFAULT')
        this.peekToken = new Token(T.DEFAULT, 'DEFAULT')
        this.next()
        this.next()

        this.prefixFn = {
            [T.IDENT]    : this.parseIdentifier,
            [T.STRING]   : this.parseStringLiteral,
            [T.INT]      : this.parseIntegerLiteral,
            [T.BANG]     : this.parsePrefixExpression,
            [T.MINUS]    : this.parsePrefixExpression,
            [T.TRUE]     : this.parseBoolean,
            [T.FALSE]    : this.parseBoolean,
            [T.IF]       : this.parseIfExpression,
            [T.FUNCTION] : this.parseFunctionLiteral,
            [T.LPAREN]   : this.parseGroupedExpression,
            [T.LBRACKET] : this.parseArrayLiteral,
            [T.LBRACE]   : this.parseHashLiteral,
        }

        this.infixFn = {
            [T.PLUS]     : this.parseInfixExpression,
            [T.MINUS]    : this.parseInfixExpression,
            [T.SLASH]    : this.parseInfixExpression,
            [T.ASTERISK] : this.parseInfixExpression,
            [T.EQ]       : this.parseInfixExpression,
            [T.NOTEQ]    : this.parseInfixExpression,
            [T.LT]       : this.parseInfixExpression,
            [T.GT]       : this.parseInfixExpression,
            [T.LBRACKET] : this.parseIndexExpression,
            [T.LPAREN]   : this.parseCallExpression,
        }
    }


    next() {
        this.curToken = this.peekToken;
        this.peekToken = this.lexer.generate();
    }


    curTokenIs(t) {
        return this.curToken.type == t;
    }


    peekTokenIs(t) {
        return this.peekToken.type == t;
    }


    expect(type){
        if(this.peekTokenIs(type)){
            this.next()
            return true
        }
        else {
            this.errors.push(`expected next token to be ${type}, got ${this.peekToken.type} instead`)
            return false
        }
    }


    parse() {
        const program = new Program();
        while(this.curToken.type != T.EOF){
            const stmt = this.parseStatement();
            if (stmt != null) {
                program.statements.push(stmt);
            }
            this.next();
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
        if (!this.expect(T.IDENT)) {
            return stmt;
        }
        stmt.name = new Identifier(this.curToken, this.curToken.literal);
        if (!this.expect(T.ASSIGN)) {
            return stmt;
        }
        this.next();
        stmt.value = this.parseExpression();
        if (this.peekTokenIs(T.SEMICOLON)) {
            this.next();
        }
        return stmt;
    }
    parseReturnStatement() {
        const stmt = new ReturnStatement(this.curToken);
        this.next();
        stmt.returnValue = this.parseExpression();
        if (this.peekTokenIs(T.SEMICOLON)) {
            this.next();
        }
        return stmt;
    }
    parseExpressionStatement() {
        const stmt = new ExpressionStatement(this.curToken);
        stmt.expression = this.parseExpression();
        if (this.peekTokenIs(T.SEMICOLON)) {
            this.next();
        }
        return stmt;
    }


    parseExpression(precedence = 1) {
        const prefix = this.prefixFn[this.curToken.type]
        if (prefix == null) {
            this.errors.push(`no prefix parse function for ${this.curToken.type} found`)
            return null
        }
        let leftExp = prefix.bind(this)(this.curToken)
        while(!this.curTokenIs(T.SEMICOLON) && precedence < (priority[this.peekToken.type] || 1)){
            const infix = this.infixFn[this.peekToken.type]
            if (infix == null) {
                return leftExp;
            }
            this.next();
            leftExp = infix.bind(this)(this.curToken, leftExp);
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
        this.next();
        expression.right = this.parseExpression(6);
        return expression;
    }
    parseInfixExpression(curToken, left) {
        const expression = new InfixExpression(curToken, curToken.literal, left);
        const precedence = priority[this.curToken.type] || 1
        this.next();
        expression.right = this.parseExpression(precedence);
        return expression;
    }
    parseGroupedExpression() {
        this.next();
        const exp = this.parseExpression();
        if (!this.expect(T.RPAREN)) {
            return exp;
        }
        return exp;
    }
    parseIfExpression(curToken) {
        const expression = new IfExpression(curToken);
        if (!this.expect(T.LPAREN)) {
            return expression;
        }
        this.next();
        expression.condition = this.parseExpression();
        if (!this.expect(T.RPAREN)) {
            return expression;
        }
        if (!this.expect(T.LBRACE)) {
            return expression;
        }
        expression.consequence = this.parseBlockStatement(this.curToken);
        if (this.peekTokenIs(T.ELSE)) {
            this.next();
            if (!this.expect(T.LBRACE)) {
                return expression;
            }
            expression.alternative = this.parseBlockStatement(this.curToken);
        }
        return expression;
    }
    parseBlockStatement(curToken) {
        const block = new BlockStatement(curToken);
        block.statements = [];
        this.next();
        while(!this.curTokenIs(T.RBRACE) && !this.curTokenIs(T.EOF)){
            const stmt = this.parseStatement();
            if (stmt != null) {
                block.statements.push(stmt);
            }
            this.next();
        }
        return block;
    }
    parseFunctionLiteral(curToken) {
        const lit = new FunctionLiteral(curToken);
        if (!this.expect(T.LPAREN)) {
            return lit;
        }
        lit.parameters = this.parseFunctionParameters();
        if (!this.expect(T.LBRACE)) {
            return lit;
        }
        lit.body = this.parseBlockStatement(curToken);
        return lit;
    }
    parseFunctionParameters() {
        let identifiers = [];
        if (this.peekTokenIs(T.RPAREN)) {
            this.next();
            return identifiers;
        }
        this.next();
        const ident = new Identifier(this.curToken, this.curToken.literal);
        identifiers.push(ident);
        while(this.peekTokenIs(T.COMMA)){
            this.next();
            this.next();
            const ident1 = new Identifier(this.curToken, this.curToken.literal);
            identifiers.push(ident1);
        }
        if (!this.expect(T.RPAREN)) {
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
            this.next();
            return args;
        }
        this.next();
        args.push(this.parseExpression());
        while(this.peekTokenIs(T.COMMA)){
            this.next();
            this.next();
            args.push(this.parseExpression());
        }
        if (!this.expect(T.RPAREN)) {
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
            this.next();
            return list;
        }
        this.next();
        list.push(this.parseExpression());
        while(this.peekTokenIs(T.COMMA)){
            this.next();
            this.next();
            list.push(this.parseExpression());
        }
        if (!this.expect(end)) {
            return null;
        }
        return list;
    }
    parseIndexExpression(t, left) {
        const exp = new IndexExpression(this.curToken, left);
        this.next();
        exp.index = this.parseExpression();
        if (!this.expect(T.RBRACKET)) {
            return t;
        }
        return exp;
    }
    parseHashLiteral() {
        const hash = new HashLiteral(this.curToken);
        hash.pairs = new Map();
        while(!this.peekTokenIs(T.RBRACE)){
            this.next();
            const key = this.parseExpression();
            if (!this.expect(T.COLON)) {
                return null;
            }
            this.next();
            const value = this.parseExpression();
            hash.pairs.set(key, value);
            if (!this.peekTokenIs(T.RBRACE) && !this.expect(T.COMMA)) {
                return null;
            }
        }
        if (!this.expect(T.RBRACE)) {
            return null;
        }
        return hash;
    }
}
