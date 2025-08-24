# Scientific Calculator (HTML, CSS, JS)

A lightweight scientific calculator that evaluates typed expressions using **string functions** and a safe transformation step.

## ✨ Features
- Standard operations: `+ - * / % ( )`
- Power: `^` (e.g., `2^3`)
- Factorial: `!` (e.g., `5!`)
- Roots: `√(x)`
- Trigonometry: `sin(x)`, `cos(x)`, `tan(x)` with **RAD/DEG toggle**
- Logarithms: `log(x)` for log base 10, `ln(x)` for natural log
- Constants: `π`, `e`
- Live preview of result, ANS recall, backspace, AC, ±

## 🧠 How it works
The calculator uses **string parsing** to convert your input into JavaScript `Math.*` syntax:
- Replace tokens like `π` → `Math.PI`, `sin(` → `Math.sin(` (or degree variant)
- Convert `^` to `**`
- Insert implicit multiplication: `2(3)` → `2*(3)`
- Factorial `n!` → `fact(n)`
- Then evaluate the transformed string with a restricted function scope.

This demonstrates use of many **string functions**: `replace`, `replaceAll`, `slice`, `split`, `includes`, `startsWith`, `endsWith`, `match`.

## 🚀 Run locally
Just open `index.html` in your browser. No build step, no server needed.

## 🔢 Examples
- `sin(30) + 2^3` (switch to **DEG**)
- `√(9) + 3!`
- `(2+3)*(4-1)`
- `log(100) + ln(e)`

## ⚠️ Notes
- Factorial is defined for non-negative integers only.
- `tan(90)` in **DEG** approaches infinity and may throw "Math error".
