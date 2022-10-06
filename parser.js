import { T } from './token.js'
import { Program, LetStatement, ID, ReturnStatement, ExpressionStatement, IntegerLiteral, PrefixExpression, InfixExpression, Boolean, IfExpression, BlockStatement, FunctionLiteral, CallExpression, StringLiteral, ArrayLiteral, IndexExpression, HashLiteral } from './ast.js'


class Parser {

    constructor(lexer){
        this.lexer  = lexer
        this.token  = this.lexer.generate()
        this.after  = this.lexer.generate()
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
        const priority   = getPriority(this.token.type)
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


    parseExpression(priority = 1) {
        let left = this.prefixFn(this.token)

        while(this.token.type !== T.SEMICOLON && priority < getPriority(this.after.type)){
            this.next()
            left = this.infixFn(this.token, left)
        }

        return left
    }


    prefixFn(token){
        switch(token.type){
            case T.ID       : return this.parseID(token)
            case T.STRING   : return this.parseString(token)
            case T.INT      : return this.parseInteger(token)
            case T.BANG     : return this.parsePrefix(token)
            case T.MINUS    : return this.parsePrefix(token)
            case T.TRUE     : return this.parseBoolean(token)
            case T.FALSE    : return this.parseBoolean(token)
            case T.IF       : return this.parseIf(token)
            case T.FUNCTION : return this.parseFunction(token)
            case T.LPAREN   : return this.parseGroupe(token)
            case T.LBRACKET : return this.parseArray(token)
            case T.LBRACE   : return this.parseHash(token)
        }
    }


    infixFn(token, left){
        switch(token.type){
            case T.PLUS     : return this.parseInfix(token, left)
            case T.MINUS    : return this.parseInfix(token, left)
            case T.ASTERISK : return this.parseInfix(token, left)
            case T.SLASH    : return this.parseInfix(token, left)
            case T.EQ       : return this.parseInfix(token, left)
            case T.NOTEQ    : return this.parseInfix(token, left)
            case T.LT       : return this.parseInfix(token, left)
            case T.GT       : return this.parseInfix(token, left)
            case T.LBRACKET : return this.parseIndex(token, left)
            case T.LPAREN   : return this.parseCall(token, left)
        }
    }


}


function getPriority(type){
    switch(type){
        case T.EQ       : return 2
        case T.NOTEQ    : return 2
        case T.LT       : return 3
        case T.GT       : return 3
        case T.PLUS     : return 4
        case T.MINUS    : return 4
        case T.SLASH    : return 5
        case T.ASTERISK : return 5
        case T.LPAREN   : return 7
        case T.LBRACKET : return 8
        default         : return 1
    }
}


export {Parser}