import { T, Token, LookupIdent } from './token.js';


export class Lexer {
    input;
    position;
    readPosition;
    ch;
    constructor(input, position = 0, readPosition = 0, ch = ''){
        this.input = input;
        this.position = position;
        this.readPosition = readPosition;
        this.ch = ch;
        this.readChar();
    }
    readChar() {
        if (this.readPosition >= this.input.length) {
            this.ch = 'EOF';
        } else {
            this.ch = this.input[this.readPosition];
        }
        this.position = this.readPosition;
        this.readPosition += 1;
    }
    peekChar() {
        if (this.readPosition >= this.input.length) {
            return 0;
        } else {
            return this.input[this.readPosition];
        }
    }
    readIdentifier() {
        const position = this.position;
        while(this.isLetter(this.ch)){
            this.readChar();
        }
        return this.input.slice(position, this.position);
    }
    readString() {
        const position = this.position + 1;
        while(true){
            this.readChar();
            if (this.ch == '"' || this.ch == 'EOF') {
                break;
            }
        }
        return this.input.slice(position, this.position);
    }
    isLetter(ch) {
        let flag;
        if (typeof ch === 'number') {
            flag = false;
        } else if (ch.match(/[A-Z|a-z]/g)) {
            flag = true;
        } else {
            flag = false;
        }
        return flag;
    }
    readNumber() {
        const position = this.position;
        while(this.isDigit(this.ch)){
            this.readChar();
        }
        return this.input.slice(position, this.position);
    }
    isDigit(ch) {
        let flag;
        if (typeof ch === 'number') {
            flag = false;
        } else if (ch.match(/[0-9]/g)) {
            flag = true;
        } else {
            flag = false;
        }
        return flag;
    }
    skipWhitespace() {
        while(this.ch == ' ' || this.ch == '\t' || this.ch == '\n' || this.ch == '\r'){
            this.readChar();
        }
    }
    NextToken() {
        let tok;
        this.skipWhitespace();
        switch(this.ch){
            case '=':
                if (this.peekChar() == '=') {
                    const ch = this.ch;
                    this.readChar();
                    const literal = String(ch) + String(this.ch);
                    tok = this.newToken(T.EQ, literal);
                } else {
                    tok = this.newToken(T.ASSIGN, this.ch);
                }
                break;
            case '"':
                tok = this.newToken(T.STRING, this.readString());
                break;
            case ':':
                tok = this.newToken(T.COLON, this.ch);
                break;
            case ';':
                tok = this.newToken(T.SEMICOLON, this.ch);
                break;
            case '(':
                tok = this.newToken(T.LPAREN, this.ch);
                break;
            case ')':
                tok = this.newToken(T.RPAREN, this.ch);
                break;
            case ',':
                tok = this.newToken(T.COMMA, this.ch);
                break;
            case '+':
                tok = this.newToken(T.PLUS, this.ch);
                break;
            case '-':
                tok = this.newToken(T.MINUS, this.ch);
                break;
            case '!':
                if (this.peekChar() == '=') {
                    const ch1 = this.ch;
                    this.readChar();
                    const literal1 = String(ch1) + String(this.ch);
                    tok = this.newToken(T.NOT_EQ, literal1);
                } else {
                    tok = this.newToken(T.BANG, this.ch);
                }
                break;
            case '/':
                tok = this.newToken(T.SLASH, this.ch);
                break;
            case '*':
                tok = this.newToken(T.ASTERISK, this.ch);
                break;
            case '<':
                tok = this.newToken(T.LT, this.ch);
                break;
            case '>':
                tok = this.newToken(T.GT, this.ch);
                break;
            case '{':
                tok = this.newToken(T.LBRACE, this.ch);
                break;
            case '}':
                tok = this.newToken(T.RBRACE, this.ch);
                break;
            case '[':
                tok = this.newToken(T.LBRACKET, this.ch);
                break;
            case ']':
                tok = this.newToken(T.RBRACKET, this.ch);
                break;
            case 'EOF':
                tok = this.newToken(T.EOF, '');
                break;
            default:
                if (this.isLetter(this.ch)) {
                    const literal2 = this.readIdentifier();
                    tok = this.newToken(LookupIdent(literal2), literal2);
                    return tok; // readIdentifierでreadCharが呼び出されreadPositionが進んでいる
                } else if (this.isDigit(this.ch)) {
                    tok = this.newToken(T.INT, this.readNumber());
                    return tok;
                } else {
                    tok = this.newToken(T.ILLEGAL, this.ch);
                }
        }
        this.readChar();
        return tok;
    }
    newToken(tokenType, ch) {
        return new Token(tokenType, ch);
    }
}
