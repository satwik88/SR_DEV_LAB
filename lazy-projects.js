// Below-the-fold projects section runs on React + Framer Motion (~87 KB + parse).
// Loading those eagerly blocked the main thread and delayed the hero LCP paint, so
// they are pulled in *after* first paint / load — in dependency order — instead.
// React → ReactDOM → Framer Motion → projects-component (which reads window.React /
// window.ReactDOM / window.Motion at module scope, so order matters).
(function () {
  var chain = [
    "https://unpkg.com/react@18/umd/react.production.min.js",
    "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js",
    "https://unpkg.com/framer-motion@10.12.16/dist/framer-motion.js",
    "projects-component.js",
  ];

  function loadNext(i) {
    if (i >= chain.length) return;
    var s = document.createElement("script");
    s.src = chain[i];
    s.async = false; // preserve execution order even though injected
    s.onload = function () { loadNext(i + 1); };
    s.onerror = function () { loadNext(i + 1); }; // don't stall the chain on a CDN miss
    document.body.appendChild(s);
  }

  function start() {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(function () { loadNext(0); }, { timeout: 1500 });
    } else {
      setTimeout(function () { loadNext(0); }, 150);
    }
  }

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
})();
