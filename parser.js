import { T } from './token.js'
import { AST, ID, String値, Integer値, Boolean値, Array値, Hash値, Function値, Prefix式, Infix式, Index式, Call式, If式, 式文, Block文, Let文, Return文} from './ast.js'


class Parser {

    constructor(lexer){
        this.lexer = lexer
        this.token = this.lexer.generate()
        this.after = this.lexer.generate()
    }


    next(type) {
        this.token = this.after
        this.after = this.lexer.generate()

        if(type && type !== this.token.type){
            throw `[ParseError]`
        }
    }


    parse() {
        const ast = new AST()

        while(this.token.type !== T.EOF){
            ast.statements.push(this.parseStatement())
            this.next()
        }

        return ast
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


    parseLet(){ // let ID = exp;
        const node = new Let文(this.token)

        this.next(T.ID)
        node.id = new ID(this.token, this.token.word)
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


    parseBlock() {
        const node = new Block文(this.token)
        this.next()

        while(this.token.type !== T.RBRACE && this.token.type !== T.EOF){
            node.statements.push(this.parseStatement())
            this.next()
        }

        return node
    }


    parseExpression(priority = 1) {
        let node = this.prefixFn()

        while(this.token.type !== T.SEMICOLON && priority < getPriority(this.after.type)){
            this.next()
            node = this.infixFn(node)
        }

        return node
    }


    prefixFn(){ // 前置式
        switch(this.token.type){
            case T.BANG     : return this.parsePrefix()
            case T.MINUS    : return this.parsePrefix()
            case T.ID       : return this.parseID()
            case T.STRING   : return this.parseString()
            case T.INT      : return this.parseInteger()
            case T.TRUE     : return this.parseBoolean()
            case T.FALSE    : return this.parseBoolean()
            case T.LPAREN   : return this.parseGroupe()
            case T.LBRACKET : return this.parseArray()
            case T.LBRACE   : return this.parseHash()
            case T.IF       : return this.parseIf()
            case T.FUNCTION : return this.parseFunction()
        }
    }


    parsePrefix() {
        const node = new Prefix式(this.token, this.token.word)
        this.next()
        node.right = this.parseExpression(6)

        return node
    }


    parseID() {
        return new ID(this.token, this.token.word)
    }


    parseString() {
        return new String値(this.token, this.token.word)
    }


    parseInteger() {
        return new Integer値(this.token, Number(this.token.word))
    }


    parseBoolean() {
        return new Boolean値(this.token, this.token.type === T.TRUE)
    }


    parseGroupe() { // ( exp )
        this.next()
        const node = this.parseExpression()
        this.next(T.RPAREN)

        return node
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


    parseIf() { // if ( condition ) { block } else { block }
        const node = new If式(this.token)

        this.next(T.LPAREN)
        this.next()
        node.condition = this.parseExpression()
        this.next(T.RPAREN)
        this.next(T.LBRACE)
        node.ifBlock = this.parseBlock()

        if (this.after.type === T.ELSE) {
            this.next()
            this.next(T.LBRACE)
            node.elseBlock = this.parseBlock()
        }

        return node
    }


    parseFunction() { // fn ( arguments ) { block }
        const node = new Function値(this.token)

        this.next(T.LPAREN)
        node.arguments = this.parseArguments()
        this.next(T.LBRACE)
        node.body = this.parseBlock()

        return node
    }


    infixFn(left){ // 中置式
        switch(this.token.type){
            case T.LBRACKET : return this.parseIndex(left)
            case T.LPAREN   : return this.parseCall(left)
            case T.ASTERISK : return this.parseInfix(left)
            case T.SLASH    : return this.parseInfix(left)
            case T.PLUS     : return this.parseInfix(left)
            case T.MINUS    : return this.parseInfix(left)
            case T.LT       : return this.parseInfix(left)
            case T.GT       : return this.parseInfix(left)
            case T.EQ       : return this.parseInfix(left)
            case T.NOTEQ    : return this.parseInfix(left)
        }
    }


    parseInfix(left) {
        const node = new Infix式(this.token, this.token.word, left)
        this.next()
        node.right = this.parseExpression( getPriority(node.token.type) )

        return node
    }


    parseIndex(left) { // [ index ]
        const node = new Index式(this.token, left)
        this.next()
        node.index = this.parseExpression()
        this.next(T.RBRACKET)

        return node
    }


    parseCall(left) { // exp ( exp , exp )
        return new Call式(this.token, left, this.parseList(T.RPAREN))
    }


    parseArguments() { // ( ID , ID )
        const list = []

        if(this.after.type === T.RPAREN) {
            this.next()
            return list
        }

        this.next()
        list.push(new ID(this.token, this.token.word))

        while(this.after.type === T.COMMA){
            this.next()
            this.next()
            list.push(new ID(this.token, this.token.word))
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
        case T.LBRACKET : return 8
        case T.LPAREN   : return 7
        case T.ASTERISK : return 5
        case T.SLASH    : return 5
        case T.PLUS     : return 4
        case T.MINUS    : return 4
        case T.LT       : return 3
        case T.GT       : return 3
        case T.EQ       : return 2
        case T.NOTEQ    : return 2
        default         : return 1
    }
}


export {Parser}