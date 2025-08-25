// ======= Utility: Shunting-yard parser with functions, constants, factorial, nPr/nCr =======
(() => {
  const display = document.getElementById('sci-display');
  const strA = document.getElementById('str-a');
  const strB = document.getElementById('str-b');
  const strDisplay = document.getElementById('str-display');
  const degToggle = document.getElementById('deg-toggle');
  const degLabel = document.getElementById('deg-label');

  const btnModeSci = document.getElementById('btn-mode-sci');
  const btnModeStr = document.getElementById('btn-mode-str');
  const sciMode = document.getElementById('sci-mode');
  const strMode = document.getElementById('str-mode');

  // Mode switching
  function setMode(mode) {
    const sci = mode === 'sci';
    sciMode.classList.toggle('hidden', !sci);
    strMode.classList.toggle('hidden', sci);
    btnModeSci.classList.toggle('active', sci);
    btnModeStr.classList.toggle('active', !sci);
    btnModeSci.setAttribute('aria-pressed', sci ? 'true':'false');
    btnModeStr.setAttribute('aria-pressed', !sci ? 'true':'false');
  }
  btnModeSci.addEventListener('click', () => setMode('sci'));
  btnModeStr.addEventListener('click', () => setMode('str'));

  // Degree/radian label
  function updateDegLabel(){ degLabel.textContent = degToggle.checked ? 'Degrees' : 'Radians'; }
  degToggle.addEventListener('change', updateDegLabel);
  updateDegLabel();

  // Memory + Ans
  let memory = 0;
  let Ans = 0;

  // Tokenizer
  const isDigit = c => /[0-9]/.test(c);
  const isLetter = c => /[a-zA-Z]/.test(c);

  const FUNCTIONS = {
    sin: x => trig(Math.sin, x),
    cos: x => trig(Math.cos, x),
    tan: x => trig(Math.tan, x),
    asin: x => invtrig(Math.asin, x),
    acos: x => invtrig(Math.acos, x),
    atan: x => invtrig(Math.atan, x),
    log: x => Math.log10(x),
    ln:  x => Math.log(x),
    sqrt: x => Math.sqrt(x),
    exp: x => Math.exp(x),
    abs: x => Math.abs(x),
  };

  function trig(fn, x){
    if (degToggle.checked) return fn(x * Math.PI/180);
    return fn(x);
  }
  function invtrig(fn, x){
    const v = fn(x);
    return degToggle.checked ? v * 180/Math.PI : v;
  }

  const CONSTANTS = {
    pi: Math.PI,
    e: Math.E,
    Ans: () => Ans,
  };

  // Operator precedence and associativity
  const OPERATORS = {
    '+': {prec:2, assoc:'L', args:2, fn:(a,b)=>a+b},
    '-': {prec:2, assoc:'L', args:2, fn:(a,b)=>a-b},
    '*': {prec:3, assoc:'L', args:2, fn:(a,b)=>a*b},
    '/': {prec:3, assoc:'L', args:2, fn:(a,b)=>a/b},
    '%': {prec:3, assoc:'L', args:2, fn:(a,b)=>a%b},
    '^': {prec:4, assoc:'R', args:2, fn:(a,b)=>Math.pow(a,b)},
    'u-': {prec:5, assoc:'R', args:1, fn:(a)=>-a}, // unary minus
    '!': {prec:6, assoc:'L', args:1, postfix:true, fn:fact},
  };

  function fact(n){
    if (n < 0 || !Number.isFinite(n)) throw new Error('Invalid factorial');
    if (Math.floor(n) !== n) throw new Error('n! requires integer n');
    let r = 1;
    for (let i=2;i<=n;i++) r *= i;
    return r;
  }

  function nPr(n,r){
    if (![n,r].every(x=>Number.isFinite(x))) throw new Error('nPr invalid');
    if (n<0 || r<0 || r>n) throw new Error('nPr range');
    return fact(n)/fact(n-r);
  }
  function nCr(n,r){
    if (![n,r].every(x=>Number.isFinite(x))) throw new Error('nCr invalid');
    if (n<0 || r<0 || r>n) throw new Error('nCr range');
    return fact(n)/(fact(r)*fact(n-r));
  }

  function tokenize(expr){
    const tokens = [];
    let i=0;
    while (i < expr.length){
      const c = expr[i];
      if (c === ' '){ i++; continue; }
      if (isDigit(c) || (c==='.' && isDigit(expr[i+1]))){
        // number
        let s = c; i++;
        while (i<expr.length && /[0-9.]/.test(expr[i])) { s+=expr[i++]; }
        tokens.push({type:'num', value: parseFloat(s)});
        continue;
      }
      if (isLetter(c)){
        // name: function or constant
        let s = c; i++;
        while (i<expr.length && /[a-zA-Z0-9_]/.test(expr[i])) { s+=expr[i++]; }
        tokens.push({type:'name', value: s});
        continue;
      }
      if ('+-*/^()%!,'.includes(c)){
        tokens.push({type:'op', value: c});
        i++; continue;
      }
      throw new Error('Invalid char: '+c);
    }
    return tokens;
  }

  function toRPN(tokens){
    const out = [];
    const stack = [];
    let prev = null;
    for (let t of tokens){
      if (t.type === 'num'){
        out.push(t);
      } else if (t.type === 'name'){
        // could be function or constant; handle at eval time, but push a marker
        out.push(t); // name pushed; if followed by '(' it will be treated as function call by adding a CALL marker later
      } else if (t.type === 'op'){
        if (t.value === ','){
          // function argument separator: pop until '('
          while (stack.length && stack[stack.length-1].value !== '(') out.push(stack.pop());
          if (!stack.length) throw new Error('Misplaced comma');
        } else if (t.value === '('){
          stack.push(t);
        } else if (t.value === ')'){
          while (stack.length && stack[stack.length-1].value !== '(') out.push(stack.pop());
          if (!stack.length) throw new Error('Mismatched )');
          stack.pop(); // pop '('
          // After closing paren, check if there is a function name before in output to convert to CALL
          // We'll convert: [name, arg1, CALL(name, argc)]
          // Count args by markers in a simpler way: we'll rely on explicit templates for nPr/nCr; for normal functions, assume 1 arg
          // Instead, we'll mark a special ')'-closure and resolve function arity later if needed.
          out.push({type:'close'});
        } else if (t.value === '!'){
          // postfix factorial
          while (stack.length && OPERATORS[stack[stack.length-1].value] && (
            (OPERATORS[stack[stack.length-1].value].prec > OPERATORS['!'].prec) ||
            (OPERATORS[stack[stack.length-1].value].prec === OPERATORS['!'].prec && OPERATORS['!'].assoc === 'L')
          )) out.push(stack.pop());
          stack.push({type:'op', value:'!'});
        } else {
          // operator; check unary minus
          let op = t.value;
          if (op === '-' && (!prev || (prev.type==='op' && prev.value !== ')') && prev.value !== '!' && prev.value !== ')')){
            op = 'u-';
          }
          while (stack.length && OPERATORS[stack[stack.length-1].value] && (
              (OPERATORS[stack[stack.length-1].value].prec > OPERATORS[op].prec) ||
              (OPERATORS[stack[stack.length-1].value].prec === OPERATORS[op].prec && OPERATORS[op].assoc === 'L')
          )){
            out.push(stack.pop());
          }
          stack.push({type:'op', value: op});
        }
      }
      prev = t;
    }
    while (stack.length){
      const s = stack.pop();
      if (s.value === '(') throw new Error('Mismatched (');
      out.push(s);
    }
    return out;
  }

  function evalRPN(rpn){
    // We handle functions using name+close pattern: [name, arg, close]
    const st = [];
    for (let i=0;i<rpn.length;i++){
      const t = rpn[i];
      if (t.type === 'num'){ st.push(t.value); continue; }
      if (t.type === 'name'){
        st.push(t); continue;
      }
      if (t.type === 'close'){
        // close means: check previous items to see if pattern [name, value]
        const val = st.pop();
        const maybeName = st.pop();
        if (!maybeName || maybeName.type !== 'name'){
          // ')' of just parentheses, push back val
          st.push(val);
          continue;
        }
        const name = maybeName.value;
        if (name in FUNCTIONS){
          const r = FUNCTIONS[name](val);
          if (!Number.isFinite(r)) throw new Error('Math domain error');
          st.push(r);
        } else if (name in CONSTANTS){
          // constant followed by ()? treat like error; but push val back with constant? not valid
          throw new Error('Invalid call');
        } else {
          throw new Error('Unknown function: '+name);
        }
        continue;
      }
      if (t.type === 'op'){
        const op = t.value;
        const spec = OPERATORS[op];
        if (!spec) throw new Error('Unknown op: '+op);
        if (spec.postfix){
          const a = st.pop();
          st.push(spec.fn(a));
        } else if (spec.args === 2){
          const b = st.pop(); const a = st.pop();
          st.push(spec.fn(a,b));
        } else if (spec.args === 1){
          const a = st.pop();
          st.push(spec.fn(a));
        }
      }
    }
    // Handle bare constants and names remaining
    const resolved = st.map(x => {
      if (x && x.type === 'name'){
        if (x.value in CONSTANTS){
          const v = CONSTANTS[x.value];
          return typeof v === 'function' ? v() : v;
        } else if (x.value in FUNCTIONS){
          throw new Error('Function missing parentheses');
        } else {
          throw new Error('Unknown identifier: '+x.value);
        }
      }
      return x;
    });
    if (resolved.length !== 1) throw new Error('Invalid expression');
    return resolved[0];
  }

  function evaluateExpression(expr){
    // Inject templates for nPr(a,b) and nCr(a,b) -> special handling using comma
    // We'll parse expressions like nPr(5,2)
    const handled = expr.replace(/\s+/g, '');
    if (!handled) return '';
    // Pre-validate characters
    if (!/^[0-9a-zA-Z_+\-*/^()%!,.]*$/.test(handled)) throw new Error('Invalid characters');
    // Quick process for nPr / nCr before generic parsing
    const npr = handled.match(/^nPr\(([^,]+),([^\)]+)\)$/);
    const ncr = handled.match(/^nCr\(([^,]+),([^\)]+)\)$/);
    if (npr){
      const n = evaluateExpression(npr[1]);
      const r = evaluateExpression(npr[2]);
      return nPr(n,r);
    }
    if (ncr){
      const n = evaluateExpression(ncr[1]);
      const r = evaluateExpression(ncr[2]);
      return nCr(n,r);
    }
    const tokens = tokenize(handled);
    const rpn = toRPN(tokens);
    return evalRPN(rpn);
  }

  // UI wiring: scientific
  document.querySelectorAll('.keys button').forEach(btn => {
    const insert = btn.getAttribute('data-insert');
    const fn = btn.getAttribute('data-fn');
    const action = btn.getAttribute('data-action');
    if (insert){
      btn.addEventListener('click', () => {
        display.value += insert;
        display.focus();
      });
    } else if (fn){
      btn.addEventListener('click', () => {
        if (fn === 'nPr' || fn === 'nCr'){
          display.value += fn + '('; // user completes as nPr(5,2)
        } else {
          display.value += fn + '(';
        }
        display.focus();
      });
    } else if (action){
      if (action === 'clear'){
        btn.addEventListener('click', () => display.value = '');
      } else if (action === 'back'){
        btn.addEventListener('click', () => display.value = display.value.slice(0,-1));
      } else if (action === 'equals'){
        btn.addEventListener('click', () => {
          try{
            const res = evaluateExpression(display.value);
            if (!Number.isFinite(res)) throw new Error('Result not finite');
            Ans = res;
            display.value = String(res);
          } catch(err){
            display.value = 'Error';
          }
        });
      } else if (action === 'ans'){
        btn.addEventListener('click', () => {
          display.value += 'Ans';
          display.focus();
        });
      }
    }
  });

  // Memory buttons
  document.querySelectorAll('.memory button').forEach(btn => {
    btn.addEventListener('click', () => {
      const op = btn.getAttribute('data-mem');
      if (op === 'MC') memory = 0;
      else if (op === 'MR') display.value += String(memory);
      else if (op === 'M+' ) {
        try { memory += Number(evaluateExpression(display.value||'0')); } catch(e){/* ignore */}
      }
      else if (op === 'M-' ) {
        try { memory -= Number(evaluateExpression(display.value||'0')); } catch(e){/* ignore */}
      }
    });
  });

  // Enter to evaluate
  display.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){
      e.preventDefault();
      const eqBtn = document.querySelector('[data-action="equals"]');
      eqBtn.click();
    }
  });

  // ======= String operations =======
  const argStart = document.getElementById('arg-start');
  const argEnd   = document.getElementById('arg-end');
  const argFind  = document.getElementById('arg-find');
  const argWith  = document.getElementById('arg-with');
  const argDelim = document.getElementById('arg-delim');

  function setResult(text){
    strDisplay.value = text;
  }

  function strLen(s){ return [...s].length; } // unicode-safe length
  function reverseStr(s){ return [...s].reverse().join(''); }

  document.getElementById('copy-result').addEventListener('click', async () => {
    try{
      await navigator.clipboard.writeText(strDisplay.value);
      const old = strDisplay.value;
      setResult('Copied!');
      setTimeout(()=> setResult(old), 700);
    }catch{}
  });

  document.querySelectorAll('[data-strop]').forEach(btn => {
    btn.addEventListener('click', () => {
      const op = btn.getAttribute('data-strop');
      const A = strA.value ?? '';
      const B = strB.value ?? '';
      try {
        switch(op){
          case 'concat': setResult(A + B); break;
          case 'lengthA': setResult(String(strLen(A))); break;
          case 'lengthB': setResult(String(strLen(B))); break;
          case 'upperA': setResult(A.toUpperCase()); break;
          case 'lowerA': setResult(A.toLowerCase()); break;
          case 'reverseA': setResult(reverseStr(A)); break;
          case 'substrA': {
            const s = Number(argStart.value||0);
            const e = argEnd.value===''? undefined : Number(argEnd.value);
            setResult(A.substring(s, e));
            break;
          }
          case 'replaceA': {
            const f = argFind.value ?? '';
            const w = argWith.value ?? '';
            setResult(A.split(f).join(w));
            break;
          }
          case 'trimA': setResult(A.trim()); break;
          case 'splitA': {
            const d = argDelim.value ?? '';
            setResult(JSON.stringify(A.split(d)));
            break;
          }
          case 'joinB': {
            const d = argDelim.value ?? '';
            let arr;
            try { arr = JSON.parse(B); }
            catch { arr = B.split(d); }
            setResult(arr.join(d));
            break;
          }
          default: setResult('Unknown op');
        }
      } catch (e){
        setResult('Error');
      }
    });
  });
})();