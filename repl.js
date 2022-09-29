import { Lexer } from './lexer.js';
import { T } from './token.js';
import { Parser } from './parser.js';
import { Eval } from './evaluator.js';
import { Environment } from './environment.js';


const input = '(5 + 10 * 2 + 15 / 3) * 2 + -10';
export const StartLexer = ()=>{
    const l = new Lexer(input);
    while(true){
        const tok = l.NextToken();
        if (tok.type == T.EOF) {
            break;
        }
        console.log(tok);
    }
};
export const StartParser = ()=>{
    console.log(input);
    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.parseProgram();
    console.log(program);
    console.log(program.statements[0].expression.string());
    if (p.Errors().length != 0) {
        printParseErrors(p.Errors());
    }
    const store = new Map();
    const env = new Environment(store);
    const evaluated = Eval(program, env);
    if (evaluated != null) {
        console.log(evaluated.inspect());
    }
};
const printParseErrors = (errors)=>{
    for (const error of errors){
        console.log('\t' + error + '\n');
    }
};
