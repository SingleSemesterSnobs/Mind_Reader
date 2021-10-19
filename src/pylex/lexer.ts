import { LineToken } from '.';
import { Symbol, EOFTOKEN, TabInfo } from './token';

type Rule = {
  pattern: RegExp,
  type: Symbol,
};

/**
 * List of recognition patterns, in order of priority
 * The first item is a recognition pattern, used to recognize the token
 * the second item is the token type
 */
const rules: Rule[] = [
  {
    pattern: /^\s*def\s+(?<attr>[a-zA-Z_][a-zA-Z0-9_]*)\(/,
    type: Symbol.FUNCTION
  },
  {
    pattern: /^\s*class\s+(?<attr>[a-zA-Z_][a-zA-Z0-9_]*)/,
    type: Symbol.CLASS
  },
  {
    pattern: /^\s*if\s+(?<attr>[^:]+):\s*/,
    type: Symbol.IF
  },
  {
    pattern: /^\s*elif\s+(?<attr>[^:]+):\s*$/,
    type: Symbol.ELIF
  },
  {
    pattern: /^\s*else\s*:/,
    type: Symbol.ELSE
  },
  {
    pattern: /^\s*for\s+(?<attr>[^:]+):\s*$/,
    type: Symbol.FOR
  },
  {
    pattern: /^\s*while\s+(?<attr>[^:]+):\s*$/,
    type: Symbol.WHILE
  },
  {
    pattern: /^\s*try\s*:/,
    type: Symbol.TRY
  },
  {
    pattern: /^\s*except(\s*(?<attr>[^:]+))?:\s*$/,
    type: Symbol.EXCEPT
  },
  {
    pattern: /^\s*finally\s*:\s*$/,
    type: Symbol.FINALLY
  },
  {
    pattern: /^\s*with\s+(?<attr>[^:]+):\s*$/,
    type: Symbol.WITH
  },
];

/**
 * Line-By-Line Lexer
 */
export default class Lexer {
  private textLines: string[] = []; // array of text lines
  private pos: number = 0;
  private _currToken: LineToken = EOFTOKEN;

  /**
   * Calculates indentation level for a line. If using soft tabs,
   * indent level rounds up (so, tabSize+1 spaces is 2 levels,
   * 2*tabSize+1 is 3, etc.)
   *
   * @param `text` The line of text.
   * @param `tabFmt` A tab information descriptor.
   * @return The indent of `text` with consideration for `tabFmt`.
   */
  static getIndent(text: string, tabFmt: TabInfo): number {
    let leadingSpace: number = text.length - text.trimLeft().length;
    let indent: number;
    if (tabFmt.hard) {
      // used tabs
      indent = leadingSpace;
    } else {
      // use spaces
      indent = Math.ceil(leadingSpace/tabFmt.size!);
    }

    return indent;
  }

  /**
   * @param `text` The text to lex.
   * @param `tabFmt` A tab information descriptor
   */
  constructor(text?: string, private tabFmt?: TabInfo) {
    // default is 4 wide expanded tabs
    this.tabFmt = {
      ...{size: 4, hard: false},
      ...tabFmt
    };

    if (text) {
      // normalize linefeeds
      text = text.replace('\r\n', '\n');
    }
    this.restart(text);
  }

  /**
   * Restart lexer with new text.
   *
   * @param `text` The new text to lex.
   */
  restart(text?: string): void {
    this.pos = 0;
    this._currToken = EOFTOKEN; // if no input, already on EOFTOKEN
    if (text) {
      this.textLines = text.split('\n');
      this.next(); // advance to the first token
    }
  }

  /**
   * @return the current {@link LineToken}.
   */
  currToken(): LineToken { return this._currToken; }

  /**
   * Advance the position in the token stream.
   *
   * @return The new current token, after advancing
   */
  next(): LineToken {
    if (this._currToken === EOFTOKEN && this.pos > this.textLines.length) {
      throw new Error('Cannot advance past end');
    }

    // Until a LineToken is found, or EOF
    while (this.pos < this.textLines.length) {
      let line: string = this.textLines[this.pos];
      let indent: number = Lexer.getIndent(line, this.tabFmt!);
      let token: LineToken;
      for (var r of rules) {
        // Does line match pattern?
        let match: RegExpMatchArray | null = line.match(r.pattern);
        if (match) {
          // Yes...
          if (match.groups) {
            token = new LineToken(r.type, this.pos, indent, match.groups["attr"]);
          } else {
            token = new LineToken(r.type, this.pos, indent);
          }

          this._currToken = token;
          this.pos++;
          return this.currToken();
        }
      }
      // No rules matched

      // Skip this line if it is whitespace, comment, or empty
      if (/^\s*(#.*)?$/.test(line)) {
        this.pos++;
        continue;
      }

      // This is an INDENT token
      token = new LineToken(Symbol.INDENT, this.pos, indent);
      this._currToken = token;
      this.pos++;
      return this.currToken();
    }

    // Didn't return, must be EOF
    this._currToken = EOFTOKEN;
    this.pos++;
    return this.currToken();
  }

  /**
   * Move backwards in the token stream
   *
   * @param `n` The number of positions to retract.
   * @return The new current token after retracting.
   */
  retract(n: number = 1): LineToken {
    if (this.pos - 1 - n < 0) {
      // -1 because this.pos is currently on the next token
      throw new RangeError('Cannot retract past start');
    }

    if (n <= 0) {
      throw new RangeError('Retract distance must be positive');
    }

    if (this.pos - n === 0) {
      // just restart
      this.pos = 0;
      return this.next();
    }

    let c = n + 1;
    while (c > 0) {
      this.pos--;
      while (/^\s*(#.*)?$/.test(this.textLines[this.pos])) {
        // Skip empty lines
        this.pos--;
      }
      c--;
    }
    return this.next();
  }
}
