const fetch = require('node-fetch');
async function run() {
  const res = await fetch('http://localhost:3000/api/meta/data?workspaceId=default&platform=instagram&type=posts');
  console.log(await res.text());
}
run();
