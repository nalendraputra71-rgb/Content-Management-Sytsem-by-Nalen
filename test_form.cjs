const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const dom = new JSDOM(`
  <form id="myform">
    <input type="checkbox" name="cap_autoPublishing" checked />
  </form>
`);

const form = dom.window.document.getElementById("myform");
const fd = new dom.window.FormData(form);
console.log(fd.get("cap_autoPublishing"));
