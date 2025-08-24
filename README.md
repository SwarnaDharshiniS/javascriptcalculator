# Hybrid Calculator (Math + String)

A scientific calculator extended with **string operations**.

## Features
### Math
- Standard arithmetic `+ - * / %`
- Power `^`, factorial `!`, roots `√()`
- Trigonometry: `sin cos tan` (RAD/DEG)
- Logarithms: `log`, `ln`
- Constants: `π`, `e`

### String
- `len("hello")` → 5
- `substr("hello",1,3)` → "ell"
- `concat("abc","xyz")` → "abcxyz"
- `upper("hi")` → "HI"
- `lower("HI")` → "hi"

## How it works
Input string → transformed using string functions (`replace`, `slice`, etc.) → evaluated with Math + String helpers.

## Run
Open `index.html` in any browser.
