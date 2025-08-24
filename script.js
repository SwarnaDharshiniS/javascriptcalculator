// Scientific Calculator with string parsing
(() => {
  const exprEl = document.getElementById('expr');
  const resultEl = document.getElementById('result');
  const angleToggle = document.getElementById('angleToggle');
  const angleLabel = document.getElementById('angleLabel');

  let lastAnswer = 0;

  angleToggle.addEventListener('change', () => {
    angleLabel.textContent = angleToggle.checked ? 'DEG' : 'RAD';
    liveEval();
  });

  function insertAtCursor(text) {
    const start = exprEl.selectionStart;
    const end = exprEl.selectionEnd;
    const before = exprEl.value.slice(0, start);
    const after = exprEl.value.slice(end);
    exprEl.value = before + text + after;
    const caret = start + text.length;
    exprEl.setSelectionRange(caret, caret);
    exprEl.focus();
    liveEval();
  }

  function backspace() {
    if (!exprEl.value) return;
    const i = exprEl.selectionStart;
    if (i > 0) {
      exprEl.value = exprEl.value.slice(0, i - 1) + exprEl.value.slice(exprEl.selectionEnd);
      exprEl.setSelectionRange(i - 1, i - 1);
    }
    exprEl.focus();
    liveEval();
  }

  function clearAll() {
    exprEl.value = "";
    resultEl.textContent = "= 0";
  }

  function swapSign() {
    if (!exprEl.value.trim()) return;
    if (exprEl.value.trim().startsWith("-(") && exprEl.value.trim().endsWith(")")) {
      exprEl.value = exprEl.value.trim().slice(2, -1);
    } else {
      exprEl.value = "-(" + exprEl.value + ")";
    }
    liveEval();
  }

  function setAns() {
    insertAtCursor(String(lastAnswer));
  }

  function toJS(input) {
    let s = input;

    const illegal = s.split("").some(ch => 
      !("0123456789+-*/^().,%! eπ".includes(ch)) && !/[a-z]/i.test(ch)
    );
    if (illegal) throw new Error("Invalid character");

    s = s.replace(/(\d+|\))\!/g, (m, g1) => `fact(${g1 === ')' ? '$$PAREN$$' : g1})`);
    s = s.replace(/(\d|\)|π|e)\s*(\()/g, "$1*$2");
    s = s.replace(/(\))\s*(\d)/g, "$1*$2");
    s = s.replace(/(π|e)\s*(\d|\()/g, "$1*$2");
    s = s.replaceAll("^", "**");
    s = s.replaceAll("π", "Math.PI");
    s = s.replace(/(?<![a-zA-Z])e(?![a-zA-Z])/g, "Math.E");

    const deg = angleToggle.checked;
    s = s.replaceAll("sin(", "__SIN__(");
    s = s.replaceAll("cos(", "__COS__(");
    s = s.replaceAll("tan(", "__TAN__(");
    s = s.replaceAll("√(", "Math.sqrt(");
    s = s.replaceAll("log(", "(__LOG10__(");
    s = s.replaceAll("ln(", "Math.log(");

    s = s.replaceAll("__SIN__(", deg ? "sin_deg(" : "Math.sin(");
    s = s.replaceAll("__COS__(", deg ? "cos_deg(" : "Math.cos(");
    s = s.replaceAll("__TAN__(", deg ? "tan_deg(" : "Math.tan(");
    s = s.replaceAll("(__LOG10__(", "log10(");

    s = s.replaceAll("fact($$PAREN$$", "fact(");

    return s;
  }

  function fact(n){
    n = Number(n);
    if (!Number.isInteger(n) || n < 0) throw new Error("Invalid factorial");
    let f = 1;
    for (let i=2;i<=n;i++) f *= i;
    return f;
  }
  function log10(x){ return Math.log10(x); }
  function sin_deg(x){ return Math.sin(x*Math.PI/180); }
  function cos_deg(x){ return Math.cos(x*Math.PI/180); }
  function tan_deg(x){ return Math.tan(x*Math.PI/180); }

  function safeEval(transformed) {
    const fn = new Function('fact','log10','sin_deg','cos_deg','tan_deg','Math', `return (${transformed});`);
    return fn(fact, log10, sin_deg, cos_deg, tan_deg, Math);
  }

  function evaluate() {
    const raw = exprEl.value.trim();
    if (!raw){ resultEl.textContent = "= 0"; return 0; }
    try {
      const js = toJS(raw);
      const val = safeEval(js);
      if (!isFinite(val)) throw new Error("Math error");
      lastAnswer = val;
      resultEl.textContent = "= " + String(val);
      return val;
    } catch (e) {
      resultEl.textContent = "Error: " + e.message;
      return NaN;
    }
  }

  function liveEval(){ evaluate(); }
  exprEl.addEventListener('input', liveEval);

  document.querySelectorAll('.keys [data-insert]').forEach(btn => {
    btn.addEventListener('click', () => insertAtCursor(btn.getAttribute('data-insert')));
  });
  document.querySelectorAll('.keys [data-fn]').forEach(btn => {
    const fn = btn.getAttribute('data-fn');
    btn.addEventListener('click', () => {
      if (fn === 'clear') clearAll();
      if (fn === 'back') backspace();
      if (fn === 'swap') swapSign();
      if (fn === 'equals') evaluate();
      if (fn === 'ans') setAns();
    });
  });

  exprEl.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter') {
      e.preventDefault();
      evaluate();
    }
  });

  liveEval();
})();