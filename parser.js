import { T } from './token.js'
import { Program, LetStatement, ID, ReturnStatement, ExpressionStatement, IntegerLiteral, PrefixExpression, InfixExpression, Boolean, IfExpression, BlockStatement, FunctionLiteral, CallExpression, StringLiteral, ArrayLiteral, IndexExpression, HashLiteral } from './ast.js'


const Priority = {
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
        this.lexer  = lexer
        this.T      = this.lexer.generate()
        this.nT     = this.lexer.generate()
        this.errors = []

        this.prefixFn = {
            [T.ID]       : this.parseID,
            [T.STRING]   : this.parseString,
            [T.INT]      : this.parseInteger,
            [T.BANG]     : this.parsePrefix,
            [T.MINUS]    : this.parsePrefix,
            [T.TRUE]     : this.parseBoolean,
            [T.FALSE]    : this.parseBoolean,
            [T.IF]       : this.parseIf,
            [T.FUNCTION] : this.parseFunction,
            [T.LPAREN]   : this.parseGroupe,
            [T.LBRACKET] : this.parseArray,
            [T.LBRACE]   : this.parseHash,
        }

        this.infixFn = {
            [T.PLUS]     : this.parseInfix,
            [T.MINUS]    : this.parseInfix,
            [T.SLASH]    : this.parseInfix,
            [T.ASTERISK] : this.parseInfix,
            [T.EQ]       : this.parseInfix,
            [T.NOTEQ]    : this.parseInfix,
            [T.LT]       : this.parseInfix,
            [T.GT]       : this.parseInfix,
            [T.LBRACKET] : this.parseIndex,
            [T.LPAREN]   : this.parseCall,
        }
    }


    parse() {
        const program = new Program()

        while(this.T.type !== T.EOF){
            const stmt = this.parseStatement()
            if(stmt){
                program.statements.push(stmt)
            }
            this.next()
        }

        return program
    }


    next() {
        this.T  = this.nT
        this.nT = this.lexer.generate()
    }


    expect(type){
        if(this.nT.type === type){
            this.next()
            return true
        }
        else {
            this.errors.push(`expected next token to be ${type}, got ${this.nT.type} instead`)
            return false
        }
    }


    parseStatement() {
        switch(this.T.type){
            case T.LET:
                return this.parseLet()
            case T.RETURN:
                return this.parseReturn()
            default:
                return this.parseExpressionStatement()
        }
    }


    parseLet(){
        const stmt = new LetStatement(this.T)

        if(!this.expect(T.ID)){
            return stmt
        }

        stmt.id = new ID(this.T, this.T.literal)

        if(!this.expect(T.ASSIGN)){
            return stmt
        }

        this.next()
        stmt.value = this.parseExpression()

        if(this.nT.type === T.SEMICOLON){
            this.next()
        }

        return stmt
    }


    parseReturn() {
        const stmt = new ReturnStatement(this.T)
        this.next()
        stmt.returnValue = this.parseExpression()

        if (this.nT.type === T.SEMICOLON) {
            this.next()
        }

        return stmt
    }


    parseExpressionStatement() {
        const stmt = new ExpressionStatement(this.T)
        stmt.expression = this.parseExpression()

        if (this.nT.type === T.SEMICOLON) {
            this.next()
        }

        return stmt
    }


    parseExpression(priority = 1) {
        const prefix = this.prefixFn[this.T.type]

        if (prefix == null) {
            this.errors.push(`no prefix parse function for ${this.T.type} found`)
            return null
        }

        let left = prefix.bind(this)(this.T)

        while(this.T.type !== T.SEMICOLON && priority < (Priority[this.nT.type] || 1)){
            const infix = this.infixFn[this.nT.type]
            if (infix == null){
                return left
            }
            this.next()
            left = infix.bind(this)(this.T, left)
        }

        return left
    }


    parsePrefix(token) {
        const expression = new PrefixExpression(token, token.literal)
        this.next()
        expression.right = this.parseExpression(6)

        return expression
    }


    parseInfix(token, left) {
        const expression = new InfixExpression(token, token.literal, left)
        const priority = Priority[this.T.type] || 1
        this.next()
        expression.right = this.parseExpression(priority)

        return expression
    }


    parseGroupe() {
        this.next()
        const exp = this.parseExpression()

        if (!this.expect(T.RPAREN)) {
            return exp
        }

        return exp
    }


    parseID(token) {
        return new ID(token, token.literal)
    }


    parseString() {
        return new StringLiteral(this.T, this.T.literal)
    }


    parseInteger(token) {
        return new IntegerLiteral(token, Number(token.literal))
    }


    parseBoolean(token) {
        return new Boolean(token, this.T.type === T.TRUE)
    }


    parseIf(token) {
        const expression = new IfExpression(token)

        if (!this.expect(T.LPAREN)) {
            return expression
        }

        this.next()
        expression.condition = this.parseExpression()

        if (!this.expect(T.RPAREN)) {
            return expression
        }
        if (!this.expect(T.LBRACE)) {
            return expression
        }

        expression.consequence = this.parseBlockStatement(this.T)

        if (this.nT.type === T.ELSE) {
            this.next()
            if (!this.expect(T.LBRACE)) {
                return expression
            }
            expression.alternative = this.parseBlockStatement(this.T)
        }

        return expression
    }


    parseBlockStatement(token) {
        const block = new BlockStatement(token)
        block.statements = []
        this.next()

        while(this.T.type !== T.RBRACE && this.T.type !== T.EOF){
            const stmt = this.parseStatement()
            if (stmt != null) {
                block.statements.push(stmt)
            }
            this.next()
        }

        return block
    }


    parseFunction(token) {
        const lit = new FunctionLiteral(token)

        if (!this.expect(T.LPAREN)) {
            return lit
        }

        lit.parameters = this.parseFunctionArguments()

        if (!this.expect(T.LBRACE)) {
            return lit
        }

        lit.body = this.parseBlockStatement(token)

        return lit
    }


    parseFunctionArguments() {
        const args = []

        if (this.nT.type === T.RPAREN) {
            this.next()
            return args
        }

        this.next()
        args.push(new ID(this.T, this.T.literal))

        while(this.nT.type === T.COMMA){
            this.next()
            this.next()
            args.push(new ID(this.T, this.T.literal))
        }

        if (!this.expect(T.RPAREN)) {
            return args
        }

        return args
    }


    parseCall(token, fc) {
        const exp = new CallExpression(token, fc)
        exp.arguments = this.parseListExpression(T.RPAREN)

        return exp
    }


    parseArray() {
        const array = new ArrayLiteral(this.T)
        array.elements = this.parseListExpression(T.RBRACKET)

        return array
    }


    parseListExpression(end) {
        let list = []

        if (this.nT.type === end) {
            this.next()
            return list
        }

        this.next()
        list.push(this.parseExpression())

        while(this.nT.type === T.COMMA){
            this.next()
            this.next()
            list.push(this.parseExpression())
        }

        if (!this.expect(end)) {
            return null
        }

        return list
    }


    parseIndex(token, left) {
        const exp = new IndexExpression(this.T, left)
        this.next()
        exp.index = this.parseExpression()

        if (!this.expect(T.RBRACKET)) {
            return token
        }

        return exp
    }


    parseHash() {
        const hash = new HashLiteral(this.T)
        hash.pairs = new Map()

        while(this.nT.type !== T.RBRACE){
            this.next()
            const key = this.parseExpression()
            if (!this.expect(T.COLON)) {
                return null
            }
            this.next()
            const value = this.parseExpression()
            hash.pairs.set(key, value)
            if (this.nT.type !== T.RBRACE && !this.expect(T.COMMA)) {
                return null
            }
        }

        if (!this.expect(T.RBRACE)) {
            return null
        }

        return hash
    }
}
