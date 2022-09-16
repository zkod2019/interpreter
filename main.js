/*
 23; --> expression
 let a = 23; --> statement (expression goes on the right of an equal sign)
 a program is a list of statements

 expr = number | string | variable | call
 stmt = car_decl | expr
 program = (stmt ';')[]

 ^ thats called a grammar

 'hello string'

 {
    type : 'expr',
    expr_typ: 'string',
    value: 'hello string'
 }

 ^ converting the expr into that is called a parser

 let a = 'hello world'
 --> tokenize is
 ^ token: keyword let, token: identifier a, token: symbol =, token: literal string
 --> parsed
 ^ becomes a tree that looks like -->
 {
    type : 'stmt',
    stmt_typ: 'string',
    value: 'hello world'
 }

*/
function isDigit(str) {
  return /^\d+$/.test(str);
}

function isAlpha(str) {
  return /[a-z]/i.test(str);
}

function isWhitespace(str) {
  return /\s/.test(str);
}

// old: code --> AST (tree)
// new: old --> token (this is gonna be a flat list)

/*
let foo = 23;

-- lexing (lexical) or tokenizing
// has no concept of invalid syntax
// only exists to make white space irrelevant 
tokens: [
  {type: 'keyword', keyword: 'let'}
  {type: 'identifier', name: 'foo'}
  {type: 'symbol', symbol: '='}
  {type: 'number_literal', value: '23'}
  {type: 'symbol', symbol: ';'}
]

-- parsing
tree: {
  type: 'stmt',
  stmt_type: 'let',
  name: {type: 'identifier', name: 'foo'}, // a token
  initializer:{
    type: 'expr',
    expr_type: 'literal',
    token: {type: 'number_literal', value: 23},
  }
}

*/

function tokenize(code) {
  // state machine
  let cursor = 0;

  let keywords = ["let"];
  let symbols = [";", "="];

  function lex_token() {
    // function w/in function cuz we need it to maintain state across calls (cursor should be accessible)
    // keywords: (let, if, while, etc.)
    // identifiers: (names)
    // symbols: (+, -, =, ', ", ., (, ), ;)
    // literals: (24, "hello")

    if (isWhitespace(code[cursor])) {
      cursor++;
      return null;
    }

    if (symbols.includes(code[cursor])) {
      cursor++;
      return {
        type: "token",
        token_type: "symbol",
        symbol: code[cursor - 1],
      };
    }

    if (isDigit(code[cursor])) {
      //number
      let numberBeginIdx = cursor;
      while (isDigit(code[cursor])) {
        cursor++;
      }
      let numberEndIdx = cursor;
      let numberString = code.substring(numberBeginIdx, numberEndIdx);
      let numberValue = parseInt(numberString);

      return {
        type: "token",
        token_type: "number",
        value: numberValue,
      };
    }

    if (code[cursor] === `"` || code[cursor] === `'`) {
      let quote = code[cursor];
      cursor++;
      let stringBeginIdx = cursor;
      while (code[cursor] !== quote) {
        cursor++;
      }
      let stringEndIdx = cursor;
      let stringValue = code.substring(stringBeginIdx, stringEndIdx);
      cursor++;
      return {
        type: "token",
        token_type: "string",
        value: stringValue,
      };
    }
    if (isAlpha(code[cursor])) {
      let identBeginIdx = cursor;

      while (isAlpha(code[cursor]) || isDigit(code[cursor])) {
        cursor++;
      }

      let identEndIdx = cursor;

      let name = code.substring(identBeginIdx, identEndIdx);
      if (keywords.includes(name)) {
        return {
          type: "token",
          token_type: "keyword",
          keyword: name,
        };
      } else {
        return {
          type: "token",
          token_type: "identifier",
          name: name,
        };
      }
    }
  }

  let tokens = [];
  while (cursor < code.length) {
    let token = lex_token();
    if (token !== null) {
      tokens.push(token);
    }
  }

  return tokens;
}

function parse(tokens) {
  let cursor = 0;

  function parse_expr() {
    if (
      tokens[cursor].token_type === "number" ||
      tokens[cursor].token_type === "string"
    ) {
      cursor++;
      return {
        type: "expr",
        expr_type: "literal",
        token: tokens[cursor - 1],
      };
    } else if (tokens[cursor].token_type === "identifier") {
      cursor++;
      return {
        type: "expr",
        expr_type: "identifier",
        name: tokens[cursor - 1],
      };
    } else {
      parse_error_at_cursor("Expected expression.");
    }
  }

  function parse_error_at_cursor(msg) {
    console.error(`${cursor}:${msg}`);
    throw msg;
  }

  function expect(expected_type, error_msg) {
    if (tokens[cursor].token_type === expected_type) {
      // we got expected type
      cursor++;
      return tokens[cursor - 1];
    } else {
      parse_error_at_cursor(error_msg);
    }
  }

  function parse_stmt() {
    if (
      tokens[cursor].token_type === "keyword" &&
      tokens[cursor].token_type === "keyword"
    ) {
      cursor++;
      let name = expect("identifier", "Expected variable name.");
      if (
        tokens[cursor].token_type === "symbol" &&
        tokens[cursor].symbol === "="
      ) {
        cursor++;
      } else {
        parse_error_at_cursor("Expected = pls");
      }
      let initializer = parse_expr();
      return {
        type: "stmt",
        stmt_type: "binding",
        name: name,
        initializer: initializer,
      };
    } else {
      parse_error_at_cursor("Only let statements allowed.");
    }
  }

  let stmts = [];
  while (cursor < tokens.length) {
    stmts.push(parse_stmt()); // parse stmt and push it to the array

    // if not a symbol or if symbol but not semi
    if (
      tokens[cursor].token_type !== "symbol" ||
      (tokens[cursor].symbol && tokens[cursor].symbol !== ";")
    ) {
      parse_error_at_cursor("Expected ';'.");
    }
    cursor++; // skip the semicolon
  }

  return stmts;
}

let code = `let foo = 24; let banana = banana;`;
let tokens = tokenize(code);
console.log(tokens);
let ast = parse(tokens);
console.log(ast);
