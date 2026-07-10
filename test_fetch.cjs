const token = process.env.INSTAGRAM_MANUAL_TOKEN;
if (!token) {
  console.log("No INSTAGRAM_MANUAL_TOKEN");
  process.exit(1);
}
async function test() {
  try {
    const res = await fetch(`https://graph.instagram.com/v19.0/me?fields=id,username&access_token=${token}`);
    console.log("Me:", await res.json());
    const mediaRes = await fetch(`https://graph.instagram.com/v19.0/me/media?fields=id,caption,media_type,media_url,timestamp,permalink&access_token=${token}`);
    console.log("Media:", await mediaRes.json());
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
