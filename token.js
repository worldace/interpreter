export class Token {
    type;
    literal;
    constructor(type, literal){
        this.type = type;
        this.literal = literal;
    }
}
export var TokenDef;
(function(TokenDef) {
    var DEFAULT = TokenDef.DEFAULT = 'DEFAULT';
    var ILLEGAL = TokenDef.ILLEGAL = 'ILLEGAL';
    var EOF = TokenDef.EOF = 'EOF';
    var STRING = TokenDef.STRING = 'STRING';
    var IDENT = TokenDef.IDENT = 'IDENT';
    var INT = TokenDef.INT = 'INT';
    var ASSIGN = TokenDef.ASSIGN = '=';
    var PLUS = TokenDef.PLUS = '+';
    var MINUS = TokenDef.MINUS = '-';
    var BANG = TokenDef.BANG = '!';
    var ASTERISK = TokenDef.ASTERISK = '*';
    var SLASH = TokenDef.SLASH = '/';
    var LT = TokenDef.LT = '<';
    var GT = TokenDef.GT = '>';
    var EQ = TokenDef.EQ = '==';
    var NOT_EQ = TokenDef.NOT_EQ = '!=';
    var COMMA = TokenDef.COMMA = ',';
    var COLON = TokenDef.COLON = ':';
    var SEMICOLON = TokenDef.SEMICOLON = ';';
    var LPAREN = TokenDef.LPAREN = '(';
    var RPAREN = TokenDef.RPAREN = ')';
    var LBRACE = TokenDef.LBRACE = '{';
    var RBRACE = TokenDef.RBRACE = '}';
    var LBRACKET = TokenDef.LBRACKET = '[';
    var RBRACKET = TokenDef.RBRACKET = ']';
    var FUNCTION = TokenDef.FUNCTION = 'FUNCTION';
    var LET = TokenDef.LET = 'LET';
    var TRUE = TokenDef.TRUE = 'TRUE';
    var FALSE = TokenDef.FALSE = 'FALSE';
    var IF = TokenDef.IF = 'IF';
    var ELSE = TokenDef.ELSE = 'ELSE';
    var RETURN = TokenDef.RETURN = 'RETURN';
})(TokenDef || (TokenDef = {}));
export const keywords = {
    fn: TokenDef.FUNCTION,
    let: TokenDef.LET,
    true: TokenDef.TRUE,
    false: TokenDef.FALSE,
    if: TokenDef.IF,
    else: TokenDef.ELSE,
    return: TokenDef.RETURN
};
export const LookupIdent = (ident)=>{
    if (keywords[ident]) {
        return keywords[ident];
    }
    return TokenDef.IDENT;
};
