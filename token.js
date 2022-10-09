const T = {}

T.DEFAULT   = 'DEFAULT'
T.ILLEGAL   = 'ILLEGAL'
T.EOF       = 'EOF'
T.STRING    = 'STRING'
T.ID        = 'ID'
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
T.FUNCTION  = 'FUNCTION'
T.LET       = 'LET'
T.TRUE      = 'TRUE'
T.FALSE     = 'FALSE'
T.IF        = 'IF'
T.ELSE      = 'ELSE'
T.RETURN    = 'RETURN'


class Token{
    constructor(type, literal){
        this.type    = type
        this.literal = literal
    }
}


export {T, Token}