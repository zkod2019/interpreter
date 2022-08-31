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
    typ : 'expr',
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
    typ : 'stmt',
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

function parse(code) {
  let cursor = 0;

  function parse_expr() {
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
        typ: "expr",
        expr_typ: "string",
        value: stringValue,
      };
    } else if (isDigit(code[cursor])) {
      //number
      let numberBeginIdx = cursor;
      while (isDigit(code[cursor])) {
        cursor++;
      }
      let numberEndIdx = cursor;
      let numberString = code.substring(numberBeginIdx, numberEndIdx);
      let numberValue = parseInt(numberString);

      return {
        typ: "number",
        expr_typ: "number",
        value: numberValue,
      };
    }
  }

  function parse_error_at_cursor(msg) {
    throw msg;
  }

  function parse_ident() {
    if (!isAlpha(code[cursor])) {
      parse_error_at_cursor("Expected Identifier");
    }
    let identBeginIdx = cursor;
    while (isAlpha(code[cursor]) || isDigit(code[cursor])) {
      cursor++;
    }
    let identEndIdx = cursor;
    return code.substring(identBeginIdx, identEndIdx);
  }

  function parse_stmt() {
    if (code.substring(cursor, cursor + 4) === "let ") {
      // let --> first 4 char dont matter when we know its a lets stmt
      cursor += 4;

      let name = parse_ident();
      cursor++; // skip the space (only 1 until tokenization is added)
      if (code[cursor] !== "=") {
        parse_error_at_cursor("Expected '='.");
      }
      cursor += 2; //skip the '='
      let expr = parse_expr();
      return {
        typ: "stmt",
        expr_typ: "ver_decl",
        name: name,
        value: expr,
      };
    }
  }

  let stmts = [];
  while (cursor < code.length) {
    stmts.push(parse_stmt()); //parse stmt and push it to the array
    if (code[cursor] !== ";") {
      parse_error_at_cursor("Expected ';'.");
    }
    cursor++; //skip the semicolon
  }

  return stmts;
}

console.log(parse(`let foo = 23;let bar = 'hi';`));
