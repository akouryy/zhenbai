'use strict';

Number.prototype.times = function times(f) {
  const ret = Array(this);
  for(let i = 0; i < this; i++) ret[i] = f(i);
  return ret;
};

String.prototype.scan = function scan(re) {
  if(!re.global) throw new Error(`re must be /g.`);
  const r = [];
  for(let m; (m = re.exec(this));) {
    m.shift();
    r.push(m);
  }
  return r;
};

window.jQuery.fn.tagName = function tagName() {
  return this.prop(`tagName`).toLowerCase();
};

window.jQuery.fn.buttonActions = function buttonActions({
  short, long, threshold = 1000,
}) {
  let touching = false;
  let long_touch = false;
  this.on(`touchstart mousedown`, e => {
    if(!touching) {
      touching = true;
      long_touch = false;
      this.longTimeout = setTimeout(() => {
        long_touch = true;
        long();
      }, threshold);
    }
    e.preventDefault();
  });
  this.on(`touchend mouseup mouseout`, e => {
    if(touching && !long_touch) short();
    touching = false;
    clearTimeout(this.longTimeout);
    e.preventDefault();
  });
};

window.NoCaseError = class NoCaseError extends Error {
  constructor(explanation, value) {
    super(`switch(${explanation} = ${value}) did not match any case.`);
    this.explanation = explanation;
    this.error_value = value;
    this.name = `NoCaseError`;
  }
};

window.yun = {
  frozen(x) {
    Object.freeze(x);
    return x;
  },

  unfrozen(x) {
    if(Object.isFrozen(x)) throw new Error(`frozen value: ${x}`);
    return x;
  },

  dig(obj, ...props) {
    let o = obj;
    for(const p of props) {
      if(o && o[p]) o = o[p];
    }
    return o;
  },
};

Object.prototype.dig = function dig(...props) {
  return window.yun.dig(this, ...props);
};

window.MInt = class MInt {
  constructor(val, mod) {
    this.val = val;
    this.mod = mod;
    this.adjust();
    Object.freeze(this);
  }

  adjust() {
    if(this.val >= this.mod) this.val %= this.mod;
    else if(this.val < 0) this.val = this.val % this.mod + this.mod;
  }

  add(d) { return new MInt(this.val + d, this.mod); }

  valueOf() { return this.val; }
};
