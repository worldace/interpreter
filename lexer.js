import {T, Token} from './token.js'


class Lexer{

    constructor(code){
        this.code  = code
        this.index = -1
    }


    generate(){
        const c = this.skipWhiteSpace(this.read())

        switch(c){
            case ':': return new Token(T.COLON, ':')
            case ';': return new Token(T.SEMICOLON, ';')
            case ',': return new Token(T.COMMA, ',')
            case '+': return new Token(T.PLUS, '+')
            case '-': return new Token(T.MINUS, '-')
            case '*': return new Token(T.ASTERISK, '*')
            case '/': return new Token(T.SLASH, '/')
            case '<': return new Token(T.LT, '<')
            case '>': return new Token(T.GT, '>')
            case '(': return new Token(T.LPAREN, '(')
            case ')': return new Token(T.RPAREN, ')')
            case '{': return new Token(T.LBRACE, '{')
            case '}': return new Token(T.RBRACE, '}')
            case '[': return new Token(T.LBRACKET, '[')
            case ']': return new Token(T.RBRACKET, ']')
            case '"': return new Token(T.STRING, this.readString())
            case '!': return this.read2('=') ? new Token(T.NOTEQ, '!=') : new Token(T.BANG, '!')
            case '=': return this.read2('=') ? new Token(T.EQ, '==') : new Token(T.ASSIGN, '=')
            case 'EOF': return new Token(T.EOF, '')
            default:
                if(isLetter(c)){
                    const id = this.readID(c)
                    return new Token(reserved[id] ?? T.ID, id)
                }
                else if(isNumber(c)){
                    return new Token(T.INT, this.readNumber(c))
                }
                else{
                    throw `[LexerError] ${c}`
                }
        }
    }


    read(){
        this.index++
        this.after = this.code[this.index+1]

        return this.code[this.index] ?? 'EOF'
    }


    read2(c){
        if(this.after === c){
            this.read()
            return true
        }
        return false
    }


    readID(c){
        while(isLetter(this.after)){
            c += this.read()
        }
        return c
    }


    readNumber(c){
        while(isNumber(this.after)){
            c += this.read()
        }
        return c
    }


    readString(){
        let c = ''

        while(this.after !== '"'){
            c += this.read()
        }

        this.read()
        return c
    }


    skipWhiteSpace(c){
        while(isWhiteSpace(c)){
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


function isWhiteSpace(c){
    return [' ', '\t', '\r', '\n'].includes(c)
}


const reserved = {
    true   : T.TRUE,
    false  : T.FALSE,
    let    : T.LET,
    if     : T.IF,
    else   : T.ELSE,
    fn     : T.FUNCTION,
    return : T.RETURN,
}



export {Lexer}