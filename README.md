# Pro Scientific + String Calculator

A single-page app that works as a **full scientific calculator** and also provides a **String mode** with common text utilities — all in the same UI.

## Features

### Scientific Mode
- Operators: `+  -  *  /  %  ^  !  ( )`
- Functions: `sin, cos, tan, asin, acos, atan, log (base-10), ln, sqrt, exp, abs`
- Combinatorics: `nPr(n, r)`, `nCr(n, r)`
- Constants: `pi`, `e`, and `Ans` (previous result)
- Degrees/Radians toggle for trig and inverse trig
- Memory keys: `MC, MR, M+, M-`
- Robust parsing (no `eval`) via a custom **shunting-yard** implementation
- Keyboard: press **Enter** to evaluate

**Examples**
```
2*sin(pi/6) + log(100)
sqrt(9) + 3^2 - 4!
exp(1) + ln(e)
nCr(5,2) + nPr(5,2)
-3^2   // unary minus correctly handled
```

### String Mode
- Inputs: **String A** and **String B**
- Operations:
  - `Concat` (A + B)
  - `len(A)`, `len(B)` (Unicode-safe)
  - `A→UPPER`, `A→lower`, `reverse(A)`, `trim(A)`
  - `substr(A, start, end)`
  - `replace(A, find, with)` (global replace)
  - `split(A, delim)` → shows JSON array
  - `join(B as array, delim)` → joins an array in B (JSON or delimited text)

**Examples**
```
A = "Hello", B = "World"  -> Concat => "HelloWorld"
A = "  Café  "            -> trim(A) => "Café"
A = "mañana"              -> reverse(A) => "anañam"
A = "a,a,a", delim=","    -> split(A, delim) => ["a","a","a"]
B = ["a","b"], delim="-"  -> join(B, "-") => "a-b"
```

## How to Run
1. Extract the ZIP.
2. Open `index.html` in any modern browser. No build step required.

## Notes & Limitations
- Factorial supports only non‑negative integers.
- `nPr`/`nCr` should be used as `nPr(5,2)`, `nCr(5,2)`.
- Division by zero and out-of-domain inputs will show `Error`.
- For very large factorials/combinatorics, numbers may overflow JavaScript's safe range.
