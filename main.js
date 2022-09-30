import { Lexer } from './lexer.js'
import { Parser } from './parser.js'
import { Eval } from './evaluator.js'
import { Environment } from './environment.js'


//const code = '(5 + 10 * 2 + 15 / 3) * 2 + -10;';
let code = `
let a = 50;
let b = fn(n){ return n + 1; }
let c = b(a);
let d = [5,6,7];
if(c > 100){ "100 over"; }
else{
    if(c > 50){ "50 over"; }
    else{ "50 less"; }
}

`

function Start(){
    console.log(code)

    const lexer   = new Lexer(code)
    const parser  = new Parser(lexer)
    const program = parser.parse()

    Lexer.dump(code)  // 文字列を返すべき
    console.log(program)
    for(const v of parser.errors){
        console.log(`[ERROR] ${v}`)
    }

    const env = new Environment(new Map())
    const result = Eval(program, env)
    console.log(result?.inspect())
}



Start()