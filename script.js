// Hybrid Calculator (Math + String operations)
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

  function toJS(input) {
    let s = input;

    const illegal = s.split("").some(ch => 
      !("0123456789+-*/^().,%! eπ\"' ".includes(ch)) && !/[a-z]/i.test(ch)
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

    // String functions
    s = s.replaceAll("len(", "str_len(");
    s = s.replaceAll("substr(", "str_substr(");
    s = s.replaceAll("concat(", "str_concat(");
    s = s.replaceAll("upper(", "str_upper(");
    s = s.replaceAll("lower(", "str_lower(");

    s = s.replaceAll("__SIN__(", deg ? "sin_deg(" : "Math.sin(");
    s = s.replaceAll("__COS__(", deg ? "cos_deg(" : "Math.cos(");
    s = s.replaceAll("__TAN__(", deg ? "tan_deg(" : "Math.tan(");
    s = s.replaceAll("(__LOG10__(", "log10(");
    s = s.replaceAll("fact($$PAREN$$", "fact(");

    return s;
  }

  // Math helpers
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

  // String helpers
  function str_len(s){ return String(s).length; }
  function str_substr(s,start,len){ return String(s).substr(start,len); }
  function str_concat(a,b){ return String(a)+String(b); }
  function str_upper(s){ return String(s).toUpperCase(); }
  function str_lower(s){ return String(s).toLowerCase(); }

  function safeEval(transformed) {
    const fn = new Function('fact','log10','sin_deg','cos_deg','tan_deg','Math','str_len','str_substr','str_concat','str_upper','str_lower', `return (${transformed});`);
    return fn(fact, log10, sin_deg, cos_deg, tan_deg, Math, str_len, str_substr, str_concat, str_upper, str_lower);
  }

  function evaluate() {
    const raw = exprEl.value.trim();
    if (!raw){ resultEl.textContent = "= 0"; return 0; }
    try {
      const js = toJS(raw);
      const val = safeEval(js);
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
  exprEl.addEventListener('keydown', (e)=>{ if (e.key === 'Enter'){ e.preventDefault(); evaluate(); } });

  liveEval();
})();