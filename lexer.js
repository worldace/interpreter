import {T, Token, reserved} from './token.js'


class Lexer{

    constructor(input){
        this.input = input
        this.c     = ''
        this.index = 0
        this.pos   = 0
        this.read()
    }


    generate(){
        let token

        this.readWhitespace()

        switch(this.c){
            case '=':
                if(this.prefetch() === '=') {
                    const c = this.c
                    this.read()
                    token = new Token(T.EQ, c + this.c)
                }
                else{
                    token = new Token(T.ASSIGN, this.c)
                }
                break
            case '"':
                token = new Token(T.STRING, this.readString())
                break
            case ':':
                token = new Token(T.COLON, this.c)
                break
            case ';':
                token = new Token(T.SEMICOLON, this.c)
                break
            case '(':
                token = new Token(T.LPAREN, this.c)
                break
            case ')':
                token = new Token(T.RPAREN, this.c)
                break
            case ',':
                token = new Token(T.COMMA, this.c)
                break
            case '+':
                token = new Token(T.PLUS, this.c)
                break
            case '-':
                token = new Token(T.MINUS, this.c)
                break
            case '!':
                if (this.prefetch() === '=') {
                    const c = this.c
                    this.read()
                    token = new Token(T.NOTEQ, c + this.c)
                }
                else {
                    token = new Token(T.BANG, this.c)
                }
                break
            case '/':
                token = new Token(T.SLASH, this.c)
                break
            case '*':
                token = new Token(T.ASTERISK, this.c)
                break
            case '<':
                token = new Token(T.LT, this.c)
                break
            case '>':
                token = new Token(T.GT, this.c)
                break
            case '{':
                token = new Token(T.LBRACE, this.c)
                break
            case '}':
                token = new Token(T.RBRACE, this.c)
                break
            case '[':
                token = new Token(T.LBRACKET, this.c)
                break
            case ']':
                token = new Token(T.RBRACKET, this.c)
                break
            case 'EOF':
                token = new Token(T.EOF, '')
                break
            default:
                if(isLetter(this.c)){
                    const id = this.readID()
                    token = new Token(reserved[id] || T.ID, id)
                    return token
                }
                else if(isDigit(this.c)){
                    token = new Token(T.INT, this.readNumber())
                    return token
                }
                else{
                    token = new Token(T.ILLEGAL, this.c)
                }
        }

        this.read()
        return token
    }


    read(){
        this.c = this.index < this.input.length ? this.input[this.index] : 'EOF'
        this.pos = this.index
        this.index += 1
    }


    readID(){
        const start = this.pos
        while(isLetter(this.c)){
            this.read()
        }
        return this.input.slice(start, this.pos)
    }


    readString(){
        const start = this.pos + 1
        this.read()
        while(this.c != '"'){
            this.read()
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