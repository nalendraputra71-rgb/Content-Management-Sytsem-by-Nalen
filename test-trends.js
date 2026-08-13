async function test() {
  const gRes = await fetch("https://trends.google.com/trending/rss?geo=ID");
  console.log("Status:", gRes.status);
  const text = await gRes.text();
  console.log("Body:", text.substring(0, 100));
}
test();
