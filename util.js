'use strict';

Number.prototype.times = function times(f) {
  const ret = Array(this);
  for(let i = 0; i < this; i++) ret[i] = f(i);
  return ret;
};

String.prototype.scan = function scan(re) {
  if(!re.global) throw new Error("re must be /g.");
  const r = [];
  for(let m; (m = re.exec(this)); ) {
    m.shift();
    r.push(m);
  }
  return r;
};

window.jQuery.fn.tagName = function tagName() {
  return this.prop("tagName").toLowerCase();
};

window.NoCaseError = class NoCaseError extends Error {
  constructor(explanation, value) {
    super(`switch(${explanation} = ${value}) did not match any case.`);
    this.explanation = explanation;
    this.error_value = value;
    this.name = 'NoCaseError';
  }
};

window.frozen = x => {
  Object.freeze(x);
  return x;
};

window.unfrozen = x => {
  if(Object.isFrozen(x)) throw new Error(`frozen value: ${x}`);
  return x;
};
