import { T } from './token.js';
import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { Eval } from './evaluator.js';
import { Environment } from './environment.js';


const input = '(5 + 10 * 2 + 15 / 3) * 2 + -10';
export const StartLexer = ()=>{
    const l = new Lexer(input);
    while(true){
        const tok = l.NextToken();
        console.log(tok);
        if (tok.type == T.EOF) {
            break;
        }
    }
};
export const StartParser = ()=>{
    console.log(input);
    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.parseProgram();
    console.log(program);
    console.log(program.statements[0].expression.string());

    for(const v of p.Errors()){
        console.log(`\t${v}\n`)
    }

    const env = new Environment(new Map())
    const evaluated = Eval(program, env)
    console.log(evaluated?.inspect())
}
