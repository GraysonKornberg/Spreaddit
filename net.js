var net;
console.log('asdasd');
(function () {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = 'function' == typeof reqqq && reqqq;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw ((a.code = 'MODULE_NOT_FOUND'), a);
        }
        var p = (n[i] = {exports: {}});
        e[i][0].call(
          p.exports,
          function (r) {
            var n = e[i][1][r];
            return o(n || r);
          },
          p,
          p.exports,
          r,
          e,
          n,
          t,
        );
      }
      return n[i].exports;
    }
    for (var u = 'function' == typeof reqqq && reqqq, i = 0; i < t.length; i++)
      o(t[i]);
    return o;
  }
  return r;
})()(
  {
    1: [function (reqqq, module, exports) {}, {}],
    2: [
      function (reqqq, module, exports) {
        net = reqqq('net');
      },
      {net: 1},
    ],
  },
  {},
  [2],
);
module.exports = net;
