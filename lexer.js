import {T, Token, keyword} from './token.js'


class Lexer{

    constructor(input){
        this.input = input
        this.c     = ''
        this.index = 0
        this.pos   = 0
        this.read()
    }


    read(){
        this.c = this.index < this.input.length ? this.input[this.index] : 'EOF'
        this.pos = this.index
        this.index += 1
    }


    readIdent(){
        const start = this.pos
        while(isLetter(this.c)){
            this.read()
        }
        return this.input.slice(start, this.pos)
    }


    readString(){
        const start = this.pos + 1
        while(true){
            this.read()
            if (this.c == '"' || this.c == 'EOF') {
                break
            }
        }
        return this.input.slice(start, this.pos)
    }


    readNumber(){
        const start = this.pos
        while(isDigit(this.c)){
            this.read()
        }
        return this.input.slice(start, this.pos)
    }


    readWhitespace(){
        while(isWhitespace(this.c)){
            this.read()
        }
    }


    prefetch(){
        return this.input[this.pos+1]
    }


    generate(){
        let tok

        this.readWhitespace()

        switch(this.c){
            case '=':
                if(this.prefetch() === '=') {
                    const c = this.c
                    this.read()
                    tok = new Token(T.EQ, c + this.c)
                }
                else{
                    tok = new Token(T.ASSIGN, this.c)
                }
                break
            case '"':
                tok = new Token(T.STRING, this.readString())
                break
            case ':':
                tok = new Token(T.COLON, this.c)
                break
            case ';':
                tok = new Token(T.SEMICOLON, this.c)
                break
            case '(':
                tok = new Token(T.LPAREN, this.c)
                break
            case ')':
                tok = new Token(T.RPAREN, this.c)
                break
            case ',':
                tok = new Token(T.COMMA, this.c)
                break
            case '+':
                tok = new Token(T.PLUS, this.c)
                break
            case '-':
                tok = new Token(T.MINUS, this.c)
                break
            case '!':
                if (this.prefetch() === '=') {
                    const c = this.c
                    this.read()
                    tok = new Token(T.NOTEQ, c + this.c)
                }
                else {
                    tok = new Token(T.BANG, this.c)
                }
                break
            case '/':
                tok = new Token(T.SLASH, this.c)
                break
            case '*':
                tok = new Token(T.ASTERISK, this.c)
                break
            case '<':
                tok = new Token(T.LT, this.c)
                break
            case '>':
                tok = new Token(T.GT, this.c)
                break
            case '{':
                tok = new Token(T.LBRACE, this.c)
                break
            case '}':
                tok = new Token(T.RBRACE, this.c)
                break
            case '[':
                tok = new Token(T.LBRACKET, this.c)
                break
            case ']':
                tok = new Token(T.RBRACKET, this.c)
                break
            case 'EOF':
                tok = new Token(T.EOF, '')
                break
            default:
                if(isLetter(this.c)){
                    const ident = this.readIdent()
                    tok = new Token(keyword[ident] || T.IDENT, ident)
                    return tok
                }
                else if(isDigit(this.c)){
                    tok = new Token(T.INT, this.readNumber())
                    return tok
                }
                else{
                    tok = new Token(T.ILLEGAL, this.c)
                }
        }

        this.read()
        return tok
    }


    static dump(code){
        let result  = []
        const lexer = new Lexer(code)
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