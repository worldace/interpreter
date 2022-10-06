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


class Parser {

    constructor(lexer){
        this.lexer  = lexer
        this.token  = this.lexer.generate()
        this.after  = this.lexer.generate()

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


    next(type) {
        if(type && this.after.type !== type){
            throw `[ParseError]`
        }
        this.token = this.after
        this.after = this.lexer.generate()
    }


    parse() {
        const program = new Program()

        while(this.token.type !== T.EOF){
            const stmt = this.parseStatement()
            if(stmt){
                program.statements.push(stmt)
            }
            this.next()
        }

        return program
    }


    parseStatement() {
        switch(this.token.type){
            case T.LET:
                return this.parseLet()
            case T.RETURN:
                return this.parseReturn()
            default:
                return this.parseExpressionStatement()
        }
    }


    parseLet(){ // LET ID = exp;
        const stmt = new LetStatement(this.token)

        this.next(T.ID)
        stmt.id = new ID(this.token, this.token.literal)
        this.next(T.ASSIGN)
        this.next()
        stmt.value = this.parseExpression()

        if(this.after.type === T.SEMICOLON){
            this.next()
        }

        return stmt
    }


    parseReturn() { // return exp;
        const stmt = new ReturnStatement(this.token)
        this.next()
        stmt.returnValue = this.parseExpression()

        if (this.after.type === T.SEMICOLON) {
            this.next()
        }

        return stmt
    }


    parseExpressionStatement() {
        const stmt = new ExpressionStatement(this.token)
        stmt.expression = this.parseExpression()

        if (this.after.type === T.SEMICOLON) {
            this.next()
        }

        return stmt
    }


    parsePrefix(token) {
        const expression = new PrefixExpression(token, token.literal)
        this.next()
        expression.right = this.parseExpression(6)

        return expression
    }


    parseInfix(token, left) {
        const expression = new InfixExpression(token, token.literal, left)
        const priority = Priority[this.token.type] || 1
        this.next()
        expression.right = this.parseExpression(priority)

        return expression
    }


    parseID(token) {
        return new ID(token, token.literal)
    }


    parseString() {
        return new StringLiteral(this.token, this.token.literal)
    }


    parseInteger(token) {
        return new IntegerLiteral(token, Number(token.literal))
    }


    parseBoolean(token) {
        return new Boolean(token, this.token.type === T.TRUE)
    }


    parseIf(token) { // if ( condition ) { block } else { block }
        const expression = new IfExpression(token)

        this.next(T.LPAREN)
        this.next()
        expression.condition = this.parseExpression()
        this.next(T.RPAREN)
        this.next(T.LBRACE)

        expression.consequence = this.parseBlock(this.token)

        if (this.after.type === T.ELSE) {
            this.next()
            this.next(T.LBRACE)
            expression.alternative = this.parseBlock(this.token)
        }

        return expression
    }


    parseBlock(token) {
        const block = new BlockStatement(token)
        block.statements = []
        this.next()

        while(this.token.type !== T.RBRACE && this.token.type !== T.EOF){
            const stmt = this.parseStatement()
            if (stmt != null) {
                block.statements.push(stmt)
            }
            this.next()
        }

        return block
    }


    parseFunction(token) { // fn ( arguments ) { block }
        const lit = new FunctionLiteral(token)

        this.next(T.LPAREN)
        lit.parameters = this.parseArguments()
        this.next(T.LBRACE)
        lit.body = this.parseBlock(token)

        return lit
    }


    parseCall(token, fc) { // a ( b , c )
        const exp = new CallExpression(token, fc)
        exp.arguments = this.parseList(T.RPAREN)

        return exp
    }


    parseArray() { // [ exp , exp ]
        const array = new ArrayLiteral(this.token)
        array.elements = this.parseList(T.RBRACKET)

        return array
    }


    parseIndex(token, left) { // [ 0 ]
        const exp = new IndexExpression(this.token, left)
        this.next()
        exp.index = this.parseExpression()
        this.next(T.RBRACKET)

        return exp
    }


    parseHash() { // { " key " : " value " ,  " key " : " value "  }
        const hash = new HashLiteral(this.token)
        hash.pairs = new Map()

        while(this.after.type !== T.RBRACE){
            this.next()
            const key = this.parseExpression()
            this.next(T.COLON)
            this.next()
            const value = this.parseExpression()
            hash.pairs.set(key, value)

            if (this.after.type !== T.RBRACE && this.next(T.COMMA)) {
                throw `[parse error]`
            }
        }

        this.next(T.RBRACE)

        return hash
    }


    parseExpression(priority = 1) {
        const prefix = this.prefixFn[this.token.type]

        if (prefix == null) {
            throw `[parse error]`
        }

        let left = prefix.bind(this)(this.token)

        while(this.token.type !== T.SEMICOLON && priority < (Priority[this.after.type] || 1)){
            const infix = this.infixFn[this.after.type]
            if (infix == null){
                return left
            }
            this.next()
            left = infix.bind(this)(this.token, left)
        }

        return left
    }


    parseGroupe() { // ( exp )
        this.next()
        const exp = this.parseExpression()
        this.next(T.RPAREN)

        return exp
    }


    parseArguments() { // ( a , b )
        const args = []

        if (this.after.type === T.RPAREN) {
            this.next()
            return args
        }

        this.next()
        args.push(new ID(this.token, this.token.literal))

        while(this.after.type === T.COMMA){
            this.next()
            this.next()
            args.push(new ID(this.token, this.token.literal))
        }

        this.next(T.RPAREN)

        return args
    }


    parseList(end) {
        let list = []

        if (this.after.type === end) {
            this.next()
            return list
        }

        this.next()
        list.push(this.parseExpression())

        while(this.after.type === T.COMMA){
            this.next()
            this.next()
            list.push(this.parseExpression())
        }

        this.next(end)

        return list
    }
}



export {Parser}