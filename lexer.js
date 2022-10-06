import {T, Token, reserved} from './token.js'


class Lexer{

    constructor(input){
        this.input = input
        this.index = -1
    }


    generate(){
        let c = this.read()
        c = this.skipWhitespace(c)

        switch(c){
            case '"': return new Token(T.STRING, this.readString())
            case ':': return new Token(T.COLON, ':')
            case ';': return new Token(T.SEMICOLON, ';')
            case '(': return new Token(T.LPAREN, '(')
            case ')': return new Token(T.RPAREN, ')')
            case ',': return new Token(T.COMMA, ',')
            case '+': return new Token(T.PLUS, '+')
            case '-': return new Token(T.MINUS, '-')
            case '/': return new Token(T.SLASH, '/')
            case '*': return new Token(T.ASTERISK, '*')
            case '<': return new Token(T.LT, '<')
            case '>': return new Token(T.GT, '>')
            case '{': return new Token(T.LBRACE, '{')
            case '}': return new Token(T.RBRACE, '}')
            case '[': return new Token(T.LBRACKET, '[')
            case ']': return new Token(T.RBRACKET, ']')
            case 'EOF': return new Token(T.EOF, '')
            case '!':
                if (this.after() === '=') {
                    this.read()
                    return new Token(T.NOTEQ, '!=')
                }
                else {
                    return new Token(T.BANG, '!')
                }
            case '=':
                if(this.after() === '=') {
                    this.read()
                    return new Token(T.EQ, '==')
                }
                else{
                    return new Token(T.ASSIGN, '=')
                }
            default:
                if(isLetter(c)){
                    const id = this.readID(c)
                    return new Token(reserved[id] ?? T.ID, id)
                }
                else if(isNumber(c)){
                    return new Token(T.INT, this.readNumber(c))
                }
                else{
                    return new Token(T.ILLEGAL, c)
                }
        }
    }


    read(){
        this.index++
        return this.input[this.index] ?? 'EOF'
    }


    after(){
        return this.input[this.index+1]
    }


    readID(c){
        while(isLetter(this.after())){
            c += this.read()
        }
        return c
    }


    readNumber(c){
        while(isNumber(this.after())){
            c += this.read()
        }
        return c
    }


    readString(){
        let c = ''

        while(this.after() !== '"'){
            c += this.read()
        }

        this.read()
        return c
    }


    skipWhitespace(c){
        while(isWhitespace(c)){
            c = this.read()
        }
        return c
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


function isNumber(c){
    return /[0-9]/.test(c)
}


function isWhitespace(c){
    return [' ', '\t', '\r', '\n'].includes(c)
}



export {Lexer}