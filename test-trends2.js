async function test() {
  try {
    const geo = "ID";
    const gRes = await fetch(`https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`, {
       headers: {
         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
       }
    });
    console.log("Status daily:", gRes.status);
    console.log("Body daily:", (await gRes.text()).substring(0, 50));
  } catch(e) {
    console.error(e);
  }
}
test();
