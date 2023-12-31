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
    // reset FormulaEvaluator for each cell
    this._errorMessage = "";
    this._currentFormula = [...formula];
    this._result = 0;

    // check for empty formula
    if (this._currentFormula.length === 0) {
      this._result = 0;
      this._errorMessage = ErrorMessages.emptyFormula;
      return;
    }

    // evaluate the formula in the cell
    this._result = this.parseExpression();

    // for input: 8 (
    if (this._currentFormula.length > 0) {
      this._errorMessage = ErrorMessages.invalidFormula;
    }
  }


  /**
   * Factor: cell, number, (expression)
   * @returns the value of factor.
   */
  private parseFactor(): number {
    let result = 0;
    // get the first token in the formula
    let token = this._currentFormula.shift();

    // if the token is a cell, return the cell value
    if (this.isCellReference(token)) {
      [result, this._errorMessage] = this.getCellValue(token);
      return result;

      // else if the token is a number, return the number
    } else if (this.isNumber(token)) {
      return Number(token);

      // else if the token is a (, return the expression
    } else if (token === '(') {
      // check for empty expression
      if (this._currentFormula.length === 0) { 
        this._errorMessage = ErrorMessages.invalidFormula;
        return result; // not sure about this;
      }
      // parse expression
      let a = this.parseExpression();
      // if the next token after parsing expression is a ")", return the expression
      token = this._currentFormula.shift();
      if (token === ')') {
        return a;

        // otherwise the expression is missing a ")"
      } else {
        this._errorMessage = ErrorMessages.missingParentheses;
        return a; // not sure about this, return a or result?
      }

      // else set error message
    } else {
      this._errorMessage = ErrorMessages.invalidFormula; // not sure about the error message
      return result;
    }
  }

  /**
   * Expression: term, term + term, term - term
   * @returns the value of expression.
   */
  private parseExpression(): number {
    let a = this.parseTerm();
    while (this._currentFormula.length > 0 && (this._currentFormula[0] === '+' || this._currentFormula[0] === '-')) {
      let operator = this._currentFormula.shift();
      let b = this.parseTerm();
      if (operator === '+') {
        a += b;
      } else if (operator === '-') {
        a -= b;
      } else {
        return a; // building "a" all the while.
      }
    }
    return a;
  }

  /**
   * term: factor, factor * factor, factor / factor
   * @returns  the value of term.
   */
  private parseTerm() : number {
    let a = this.parseFactor();
    while (this._currentFormula.length > 0 && (this._currentFormula[0] === '*' || this._currentFormula[0] === '/')) {
      let operator = this._currentFormula.shift();
      let b = this.parseFactor();
      if (operator === '*') {
        a *= b;
      } else if (operator === '/') {
        // if divided by zero, set error message and return Infinity
        if (b === 0) {
          this._errorMessage = ErrorMessages.divideByZero;
          a = Infinity; // not sure about this, a = Infinity or this._result = Infinity?
        }
        a /= b;
      } else {
        return a;
      }
    }
    return a;
  }



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