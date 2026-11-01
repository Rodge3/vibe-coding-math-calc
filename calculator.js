(function () {
  "use strict";

  const MAX_LENGTH = 200;

  function tokenize(expression) {
    const tokens = [];
    let index = 0;

    while (index < expression.length) {
      const character = expression[index];
      if (/\s/.test(character)) {
        index += 1;
        continue;
      }

      const numberMatch = expression.slice(index).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i);
      if (numberMatch) {
        const value = Number(numberMatch[0]);
        if (!Number.isFinite(value)) throw new Error("That number is too large to calculate.");
        tokens.push({ type: "number", value });
        index += numberMatch[0].length;
        continue;
      }

      if ("+-*/()%".includes(character)) {
        tokens.push({ type: character, value: character });
        index += 1;
        continue;
      }

      throw new Error("I can only calculate numbers and basic arithmetic signs.");
    }

    return tokens;
  }

  function calculate(expression) {
    if (typeof expression !== "string" || !expression.trim()) {
      throw new Error("Type a calculation and I’ll work it out.");
    }
    if (expression.length > MAX_LENGTH) {
      throw new Error("That calculation is too long. Try a shorter expression.");
    }

    const tokens = tokenize(expression);
    let position = 0;

    function peek(type) {
      return tokens[position] && tokens[position].type === type;
    }

    function consume(type) {
      if (!peek(type)) throw new Error("That expression doesn’t look complete. Check the operators and parentheses.");
      return tokens[position++];
    }

    function parsePrimary() {
      if (peek("+")) {
        position += 1;
        return parsePrimary();
      }
      if (peek("-")) {
        position += 1;
        return -parsePrimary();
      }
      if (peek("(")) {
        position += 1;
        const value = parseSum();
        consume(")");
        return value;
      }
      return consume("number").value;
    }

    function parsePostfix() {
      let value = parsePrimary();
      while (peek("%")) {
        position += 1;
        value /= 100;
      }
      return value;
    }

    function parseProduct() {
      let value = parsePostfix();
      while (peek("*") || peek("/")) {
        const operator = tokens[position++].type;
        const right = parsePostfix();
        if (operator === "/" && right === 0) throw new Error("Division by zero isn’t defined. Try a different divisor.");
        value = operator === "*" ? value * right : value / right;
      }
      return value;
    }

    function parseSum() {
      let value = parseProduct();
      while (peek("+") || peek("-")) {
        const operator = tokens[position++].type;
        const right = parseProduct();
        value = operator === "+" ? value + right : value - right;
      }
      return value;
    }

    const result = parseSum();
    if (position !== tokens.length) throw new Error("There’s an extra operator or number. Check your expression.");
    if (!Number.isFinite(result)) throw new Error("That result is outside the range I can calculate.");
    return result;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { calculate };
  } else {
    window.SumwiseCalculator = { calculate };
  }
})();