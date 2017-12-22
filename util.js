'use strict';

Number.prototype.times = function(f) {
    let ret = Array(this);
    for(let i = 0; i < this; i++) ret[i] = f(i);
    return ret;
};

String.prototype.scan = function(re) {
    if (!re.global) throw "re must be /g.";
    let m, r = [];
    while(m = re.exec(this)) {
        m.shift();
        r.push(m);
    }
    return r;
};
