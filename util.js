window.times = (n, f) => {
  let ret = Array(n);
  for(let i = 0; i < n; i++) ret[i] = f(i);
  return ret;
};
