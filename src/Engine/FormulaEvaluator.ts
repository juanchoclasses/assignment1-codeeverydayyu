import Cell from "./Cell"
import SheetMemory from "./SheetMemory"
import { ErrorMessages } from "./GlobalDefinitions";



export class FormulaEvaluator {
  // Define a function called update that takes a string parameter and returns a number
  private _errorOccured: boolean = false;
  private _errorMessage: string = "";
  private _currentFormula: FormulaType = [];
  private _lastResult: number = 0;
  private _sheetMemory: SheetMemory;
  private _result: number = 0;


  constructor(memory: SheetMemory) {
    this._sheetMemory = memory;
  }

  /**
    * place holder for the evaluator.   I am not sure what the type of the formula is yet 
    * I do know that there will be a list of tokens so i will return the length of the array
    * 
    * I also need to test the error display in the front end so i will set the error message to
    * the error messages found In GlobalDefinitions.ts
    * 
    * according to this formula.
    * 
    7 tokens partial: "#ERR",
    8 tokens divideByZero: "#DIV/0!",
    9 tokens invalidCell: "#REF!",
  10 tokens invalidFormula: "#ERR",
  11 tokens invalidNumber: "#ERR",
  12 tokens invalidOperator: "#ERR",
  13 missingParentheses: "#ERR",
  0 tokens emptyFormula: "#EMPTY!",

                    When i get back from my quest to save the world from the evil thing i will fix.
                      (if you are in a hurry you can fix it yourself)
                               Sincerely 
                               Bilbo
    * 
   */

  evaluate(formula: FormulaType) {
    try {
      this._result = this.parseExpression(formula);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this._errorMessage = error.message;
      }
    }
  }
/*
  private parseExpression: (tokens: FormulaType) => number = (tokens) => {
    let tokenIndex = 0;

    const parseTerm = (): number => {
      let factor1 = parseFactor();
      while (tokenIndex < tokens.length && (tokens[tokenIndex] === '*' || tokens[tokenIndex] === '/' || tokens[tokenIndex] === '+' || tokens[tokenIndex] === '-')) {
        const operator = tokens[tokenIndex];
        tokenIndex++;
        const factor2 = parseFactor();
        if (operator === '*') {
          factor1 *= factor2;
        } else if (operator === '/') {
          if (factor2 === 0) {
            throw new Error(ErrorMessages.divideByZero);
          }
          factor1 /= factor2;
        } else if (operator === '+') {
          factor1 += factor2;
        } else if (operator === '-') {
          factor1 -= factor2;
        }
      }
      return factor1;
    };

    const parseFactor = (): number => {
      let result = 0;
      if (tokens[tokenIndex] === '(') {
        tokenIndex++;
        result = parseExpression();
        if (tokens[tokenIndex] !== ')') {
          throw new Error(ErrorMessages.missingParentheses);
        }
        tokenIndex++;
      } else if (tokens[tokenIndex] === '-') {
        tokenIndex++;
        result = -parseFactor();
      } else if (tokens[tokenIndex] === '+') {
        tokenIndex++;
        result = parseFactor();
      } else if (!isNaN(Number(tokens[tokenIndex]))) {
        result = Number(tokens[tokenIndex]);
        tokenIndex++;
      } else if (Cell.isCellName(tokens[tokenIndex])) {
        const cell = this._sheetMemory.getCell(tokens[tokenIndex]);
        if (cell) {
          result = cell.getValue();
        } else {
          throw new Error(ErrorMessages.invalidCell);
        }
        tokenIndex++;
      } else {
        throw new Error(ErrorMessages.invalidNumber);
      }
      return result;
    };

    return parseTerm();
  };
*/


  private parseExpression: (tokens: FormulaType) => number = (tokens) => {
    let tokenIndex = 0;

    const parseTerm = (): number => {
      let factor1 = parseFactor();
      while (tokenIndex < tokens.length && (tokens[tokenIndex] === '*' || tokens[tokenIndex] === '/')) {
        const operator = tokens[tokenIndex];
        tokenIndex++;
        const factor2 = parseFactor();
        if (operator === '*') {
          factor1 *= factor2;
        } else if (operator === '/') {
          if (factor2 === 0) {
            this._result = Infinity;
            this._errorMessage = ErrorMessages.divideByZero;
            //throw new Error(ErrorMessages.divideByZero);
          }
          factor1 /= factor2;
        } 
      }
      return factor1;
    };

    const parseFactor = (): number => {
      if (tokenIndex < tokens.length) {
        const token = tokens[tokenIndex];
        tokenIndex++;
        if (/^\d+$/.test(token)) {
          return parseFloat(token);
        } else if (token === '(') {
          const result = this.parseExpression(tokens);
          if (tokens[tokenIndex] !== ')') {
            throw new Error("Unmatched parentheses");
          }
          tokenIndex++;
          return result;
        } else {
          throw new Error("Invalid token: " + token);
        }
      } else {
        throw new Error("Unexpected end of input");
      }
    };

    
    let result = parseTerm();
    while (tokenIndex < tokens.length && (tokens[tokenIndex] === '+' || tokens[tokenIndex] === '-')) {
      const operator = tokens[tokenIndex];
      tokenIndex++;
      const term = parseTerm();
      if (operator === '+') {
        result += term;
      } else if (operator === '-') {
        result -= term;
      }
    }
    return result;
  };
/*
private parseExpression: (tokens: FormulaType) => number = (tokens) => {
  let tokenIndex = 0;

  const parseTerm = (): number => {
    let factor1 = parseFactor();
    while (tokenIndex < tokens.length && (tokens[tokenIndex] === '*' || tokens[tokenIndex] === '/')) {
      const operator = tokens[tokenIndex];
      tokenIndex++;
      const factor2 = parseFactor();
      if (operator === '*') {
        factor1 *= factor2;
      } else if (operator === '/') {
        if (factor2 === 0) {
          throw new Error("Division by zero");
        }
        factor1 /= factor2;
      }
    }
    return factor1;
  };

  const parseFactor = (): number => {
    if (tokenIndex < tokens.length) {
      const token = tokens[tokenIndex];
      tokenIndex++;
      if (/^\d+$/.test(token)) {
        return parseFloat(token);
      } else if (token === '(') {
        const result = this.parseExpression(tokens);
        if (tokens[tokenIndex] !== ')') {
          throw new Error("Unmatched parentheses");
        }
        tokenIndex++;
        return result;
      } else {
        throw new Error("Invalid token: " + token);
      }
    } else {
      throw new Error("Unexpected end of input");
    }
  };

  let result = parseTerm();
  while (tokenIndex < tokens.length && (tokens[tokenIndex] === '+' || tokens[tokenIndex] === '-')) {
    const operator = tokens[tokenIndex];
    tokenIndex++;
    const term = parseTerm();
    if (operator === '+') {
      result += term;
    } else if (operator === '-') {
      result -= term;
    }
  }

  return result;
};
*/
  public get error(): string {
    return this._errorMessage
  }

  public get result(): number {
    return this._result;
  }




  /**
   * 
   * @param token 
   * @returns true if the toke can be parsed to a number
   */
  isNumber(token: TokenType): boolean {
    return !isNaN(Number(token));
  }

  /**
   * 
   * @param token
   * @returns true if the token is a cell reference
   * 
   */
  isCellReference(token: TokenType): boolean {

    return Cell.isValidCellLabel(token);
  }

  /**
   * 
   * @param token
   * @returns [value, ""] if the cell formula is not empty and has no error
   * @returns [0, error] if the cell has an error
   * @returns [0, ErrorMessages.invalidCell] if the cell formula is empty
   * 
   */
  getCellValue(token: TokenType): [number, string] {

    let cell = this._sheetMemory.getCellByLabel(token);
    let formula = cell.getFormula();
    let error = cell.getError();

    // if the cell has an error return 0
    if (error !== "" && error !== ErrorMessages.emptyFormula) {
      return [0, error];
    }

    // if the cell formula is empty return 0
    if (formula.length === 0) {
      return [0, ErrorMessages.invalidCell];
    }


    let value = cell.getValue();
    return [value, ""];

  }


}

export default FormulaEvaluator;