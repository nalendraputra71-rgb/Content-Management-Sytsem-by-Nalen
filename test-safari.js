const { JSDOM } = require('jsdom');
const dom = new JSDOM();
try { dom.window.btoa('hello™'); } catch(e) { console.log(e.name, e.message); }
