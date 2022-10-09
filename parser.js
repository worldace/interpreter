import { T } from './token.js'
import { Program, ID, String値, Integer値, Boolean値, Array値, Hash値, Function値, Prefix式, Infix式, Index式, Call式, If式, 式文, Block文, Let文, Return文} from './ast.js'


class Parser {

    constructor(lexer){
        this.lexer = lexer
        this.token = this.lexer.generate()
        this.after = this.lexer.generate()
    }


    next(type) {
        this.token = this.after
        this.after = this.lexer.generate()

        if(type && this.token.type !== type){
            throw `[ParseError]`
        }
    }


    parse() {
        const program = new Program()

        while(this.token.type !== T.EOF){
            program.statements.push(this.parseStatement())
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
        const node = new Let文(this.token)

        this.next(T.ID)
        node.id = new ID(this.token, this.token.literal)
        this.next(T.ASSIGN)
        this.next()
        node.value = this.parseExpression()

        if(this.after.type === T.SEMICOLON){
            this.next()
        }

        return node
    }


    parseReturn() { // return exp;
        const node = new Return文(this.token)
        this.next()
        node.value = this.parseExpression()

        if (this.after.type === T.SEMICOLON) {
            this.next()
        }

        return node
    }


    parseExpressionStatement() {
        const node = new 式文(this.token, this.parseExpression())

        if (this.after.type === T.SEMICOLON) {
            this.next()
        }

        return node
    }


    parseBlock(token) {
        const node = new Block文(token)
        this.next()

        while(this.token.type !== T.RBRACE && this.token.type !== T.EOF){
            node.statements.push(this.parseStatement())
            this.next()
        }

        return node
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


    parsePrefix(token) {
        const node = new Prefix式(token, token.literal)
        this.next()
        node.right = this.parseExpression(6)

        return node
    }


    parseInfix(token, left) {
        const node = new Infix式(token, token.literal, left)
        const priority = getPriority(this.token.type)
        this.next()
        node.right = this.parseExpression(priority)

        return node
    }


    parseIndex(token, left) { // [ index ]
        const node = new Index式(this.token, left)
        this.next()
        node.index = this.parseExpression()
        this.next(T.RBRACKET)

        return node
    }


    parseCall(token, id) { // a ( b , c )
        return new Call式(token, id, this.parseList(T.RPAREN))
    }


    parseIf(token) { // if ( condition ) { block } else { block }
        const node = new If式(token)

        this.next(T.LPAREN)
        this.next()
        node.condition = this.parseExpression()
        this.next(T.RPAREN)
        this.next(T.LBRACE)
        node.ifBlock = this.parseBlock(this.token)

        if (this.after.type === T.ELSE) {
            this.next()
            this.next(T.LBRACE)
            node.elseBlock = this.parseBlock(this.token)
        }

        return node
    }


    parseID(token) {
        return new ID(token, token.literal)
    }


    parseString(token) {
        return new String値(token, token.literal)
    }


    parseInteger(token) {
        return new Integer値(token, Number(token.literal))
    }


    parseBoolean(token) {
        return new Boolean値(token, this.token.type === T.TRUE)
    }


    parseArray() { // [ exp , exp ]
        return new Array値(this.token, this.parseList(T.RBRACKET))
    }


    parseHash() { // { " key " : " value " ,  " key " : " value "  }
        const node = new Hash値(this.token)

        while(this.after.type !== T.RBRACE){
            this.next()
            const key = this.parseExpression()
            this.next(T.COLON)
            this.next()
            node.map.set(key, this.parseExpression())

            if (this.after.type !== T.RBRACE && this.next(T.COMMA)) {
                throw `[parse error]`
            }
        }

        this.next(T.RBRACE)

        return node
    }


    parseFunction(token) { // fn ( arguments ) { block }
        const node = new Function値(token)

        this.next(T.LPAREN)
        node.arguments = this.parseArguments()
        this.next(T.LBRACE)
        node.body = this.parseBlock(token)

        return node
    }


    parseGroupe() { // ( exp )
        this.next()
        const node = this.parseExpression()
        this.next(T.RPAREN)

        return node
    }


    parseArguments() { // ( a , b )
        const list = []

        if(this.after.type === T.RPAREN) {
            this.next()
            return list
        }

        this.next()
        list.push(new ID(this.token, this.token.literal))

        while(this.after.type === T.COMMA){
            this.next()
            this.next()
            list.push(new ID(this.token, this.token.literal))
        }

        this.next(T.RPAREN)

        return list
    }


    parseList(end) { // ( exp , exp )
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