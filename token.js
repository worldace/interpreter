const T = {}

T.ID        = 'ID'
T.STRING    = 'STRING'
T.INT       = 'INT'
T.ASSIGN    = '='
T.PLUS      = '+'
T.MINUS     = '-'
T.BANG      = '!'
T.ASTERISK  = '*'
T.SLASH     = '/'
T.LT        = '<'
T.GT        = '>'
T.EQ        = '=='
T.NOTEQ     = '!='
T.COMMA     = ','
T.COLON     = ':'
T.SEMICOLON = ';'
T.LPAREN    = '('
T.RPAREN    = ')'
T.LBRACE    = '{'
T.RBRACE    = '}'
T.LBRACKET  = '['
T.RBRACKET  = ']'
T.LET       = 'LET'
T.TRUE      = 'TRUE'
T.FALSE     = 'FALSE'
T.IF        = 'IF'
T.ELSE      = 'ELSE'
T.FUNCTION  = 'FUNCTION'
T.RETURN    = 'RETURN'
T.EOF       = 'EOF'

T.RESERVED  = {
    true   : T.TRUE,
    false  : T.FALSE,
    let    : T.LET,
    if     : T.IF,
    else   : T.ELSE,
    fn     : T.FUNCTION,
    return : T.RETURN,
}


class Token{
    constructor(type, word){
        this.type = type
        this.word = word
    }
}


export {T, Token}