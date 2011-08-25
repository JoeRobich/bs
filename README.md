# BS

A BASIC-like grammar for use in scripting on web pages.

## Includes

- bs_grammar.txt: The grammar used by PEG (http://pegjs.majda.cz/) to generate the bs_parser. 
- bs_parser.js: The generated parser with ast functions removed.
- ast.js: The ast function definitions removed from the generated bs_parser.
- ast_interpreter.js: Walks the ast interpreting each node.
             