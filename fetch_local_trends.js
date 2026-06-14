const run = async () => {
    let r = await fetch("https://trends.google.com/trending/rss?geo=ID");
    console.log(r.status, r.statusText);
}
run();
