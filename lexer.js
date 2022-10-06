import {T, Token, reserved} from './token.js'


class Lexer{

    constructor(input){
        this.input = input
        this.c     = ''
        this.index = 0
    }


    generate(){
        this.read()
        this.readWhitespace()

        switch(this.c){
            case '=':
                if(this.prefetch() === '=') {
                    this.read()
                    return new Token(T.EQ, '==')
                }
                else{
                    return new Token(T.ASSIGN, '=')
                }
            case '"': return new Token(T.STRING, this.readString())
            case ':': return new Token(T.COLON, ':')
            case ';': return new Token(T.SEMICOLON, ';')
            case '(': return new Token(T.LPAREN, '(')
            case ')': return new Token(T.RPAREN, ')')
            case ',': return new Token(T.COMMA, ',')
            case '+': return new Token(T.PLUS, '+')
            case '-': return new Token(T.MINUS, '-')
            case '!':
                if (this.prefetch() === '=') {
                    this.read()
                    return new Token(T.NOTEQ, '!=')
                }
                else {
                    return new Token(T.BANG, '!')
                }
            case '/': return new Token(T.SLASH, '/')
            case '*': return new Token(T.ASTERISK, '*')
            case '<': return new Token(T.LT, '<')
            case '>': return new Token(T.GT, '>')
            case '{': return new Token(T.LBRACE, '{')
            case '}': return new Token(T.RBRACE, '}')
            case '[': return new Token(T.LBRACKET, '[')
            case ']': return new Token(T.RBRACKET, ']')
            case 'EOF': return new Token(T.EOF, '')
            default:
                if(isLetter(this.c)){
                    const id = this.readID()
                    return new Token(reserved[id] || T.ID, id)
                }
                else if(isDigit(this.c)){
                    return new Token(T.INT, this.readNumber())
                }
                else{
                    return new Token(T.ILLEGAL, this.c)
                }
        }
    }


    read(){
        this.c = this.input[this.index] ?? 'EOF'
        this.index++
    }


    readID(){
        const start = this.index-1
        while(isLetter(this.c)){
            this.read()
        }
        this.index--
        return this.input.slice(start, this.index)
    }


    readNumber(){
        const start = this.index-1
        while(isDigit(this.c)){
            this.read()
        }
        this.index--
        return this.input.slice(start, this.index)
    }


    readString(){
        const start = this.index
        this.read()
        while(this.c !== '"'){
            this.read()
        }
        return this.input.slice(start, this.index-1)
    }


    readWhitespace(){
        while(isWhitespace(this.c)){
            this.read()
        }
    }


    prefetch(){
        return this.input[this.index]
    }


    static dump(code){
        const lexer = new Lexer(code)
        let result  = []

        while(true){
            const token = lexer.generate()
            result.push(token)
            if(token.type === T.EOF){
                return result
            }
        }
    }
}



function isLetter(c){
    return /[a-zA-Z]/.test(c)
}


function isDigit(c){
    return /[0-9]/.test(c)
}


function isWhitespace(c){
    return [' ', '\t', '\r', '\n'].includes(c)
}



export {Lexer}