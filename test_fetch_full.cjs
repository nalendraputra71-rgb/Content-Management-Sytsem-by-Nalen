const token = process.env.INSTAGRAM_MANUAL_TOKEN;
const accountId = "17841400358607807";
async function test() {
  try {
    const mediaRes = await fetch(`https://graph.instagram.com/v19.0/${accountId}/media?fields=id,caption,media_type,media_url,timestamp,like_count,comments_count,permalink&access_token=${token}`);
    const data = await mediaRes.json();
    console.log("Media:", data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
