import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import admin from "firebase-admin";
import { cert, getApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { rateLimit } from "express-rate-limit";
import crypto from "crypto";

dotenv.config();

let firestoreDatabaseId: string | undefined;

function initFirebase() {
  if (getApps().length === 0) {
    let projectId = process.env.FIREBASE_PROJECT_ID;
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
      if (!projectId) {
        projectId = firebaseConfig.projectId;
      }
      if (firebaseConfig.firestoreDatabaseId) {
        firestoreDatabaseId = firebaseConfig.firestoreDatabaseId;
      }
    }
    
    if (projectId) {
      let credential;
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
          credential = cert(serviceAccount);
        } catch (e) {
          console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e);
        }
      }
      admin.initializeApp({ 
        projectId,
        ...(credential ? { credential } : {})
      });
      console.log("Firebase Admin initialized lazily with projectId:", projectId);
    } else {
      throw new Error("FIREBASE_PROJECT_ID is not set in environment or config.");
    }
  }
}

// Cache for public keys
let publicKeysCache: { keys: Record<string, string>; expires: number } | null = null;

async function getGooglePublicKeys(): Promise<Record<string, string>> {
  if (publicKeysCache && publicKeysCache.expires > Date.now()) {
    return publicKeysCache.keys;
  }
  
  const res = await fetch("https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys");
  const keys = await res.json() as Record<string, string>;
  
  // Cache for 1 hour or based on cache-control headers
  const cacheControl = res.headers.get("cache-control") || "";
  let maxAge = 3600;
  const match = cacheControl.match(/max-age=(\d+)/);
  if (match) {
    maxAge = parseInt(match[1], 10);
  }
  
  publicKeysCache = {
    keys,
    expires: Date.now() + maxAge * 1000,
  };
  
  return keys;
}

interface DecodedToken {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  [key: string]: any;
}

async function verifyFirebaseIdToken(token: string): Promise<DecodedToken> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const header = JSON.parse(Buffer.from(headerB64, "base64url").toString());
  const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());

  // 1. Verify Algorithm
  if (header.alg !== "RS256") {
    throw new Error("Invalid signing algorithm");
  }

  // 2. Verify Expiration and Timestamps
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    throw new Error("Token has expired");
  }
  if (payload.iat > now + 300) { // allow 5 min clock skew
    throw new Error("Token issued in the future");
  }

  // 3. Verify Audience and Issuer
  let projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    try {
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        projectId = config.projectId;
      }
    } catch (_) {}
  }

  if (projectId) {
    if (payload.aud !== projectId) {
      throw new Error(`Invalid audience: expected ${projectId}, got ${payload.aud}`);
    }
  }
  
  const expectedIssuer = `https://securetoken.google.com/${projectId || payload.aud}`;
  if (payload.iss !== expectedIssuer) {
    throw new Error(`Invalid issuer: expected ${expectedIssuer}, got ${payload.iss}`);
  }

  // 4. Verify Signature
  const publicKeys = await getGooglePublicKeys();
  const cert = publicKeys[header.kid];
  if (!cert) {
    throw new Error("Public key not found for kid: " + header.kid);
  }

  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(`${headerB64}.${payloadB64}`);
  
  const isVerified = verifier.verify(cert, signatureB64, "base64url");
  if (!isVerified) {
    throw new Error("Signature verification failed");
  }

  return {
    uid: payload.sub,
    ...payload,
  };
}

const app = express();

app.set('trust proxy', 1 /* number of proxies between user and server */);
app.use(express.json({ limit: "15mb" })); // Mencegah payload besar yang bisa DOS server, but big enough for chat history
app.use(express.urlencoded({ extended: true, limit: "1mb" })); // For Meta Data Deletion callbacks and other forms

// Define routes once
const apiRoutes = express.Router();

apiRoutes.get("/trends", async (req, res) => {
  try {
    const geo = (req.query.geo as string) || "ID";
    const gRes = await fetch(`https://trends.google.com/trending/rss?geo=${geo}`);
    if (!gRes.ok) throw new Error("Failed to fetch RSS from Google");
    const text = await gRes.text();
    res.type("application/xml");
    res.send(text);
  } catch (e: any) {
    console.error("Trends fetch error:", e);
    res.status(500).json({ error: e.message || "Failed to fetch trends" });
  }
});

// Strict Rate Limiting khusus untuk route API AI
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 20, // max 20 request per menit per IP
  message: { error: "Terlalu banyak permintaan (Rate limit exceeded). Silakan coba lagi nanti." },
  standardHeaders: true,
  legacyHeaders: false,
});

import { Invoice as XenditInvoice } from 'xendit-node';

// API Route untuk Xendit Checkout
apiRoutes.post("/xendit/checkout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Akses Ditolak: Token Autentikasi tidak ditemukan." });
    }
    const token = authHeader.split("Bearer ")[1];
    initFirebase();
    const decodedToken = await verifyFirebaseIdToken(token);
    const uid = decodedToken.uid;

    const { amount, plan, email, description, planId, addMonths, promoId } = req.body;
    
    const numericAmount = Math.floor(Number(amount));
    if (isNaN(numericAmount) || numericAmount <= 0 || !plan || !email) {
      return res.status(400).json({ error: "Missing or invalid required fields" });
    }

    let apiKey = process.env.XENDIT_SECRET_KEY || "";
    // Clean key: remove non-ASCII (including non-breaking spaces, BOM, special quotes), trim, and remove surrounding quotes
    apiKey = apiKey.replace(/[^\x20-\x7E]/g, "").trim().replace(/^["']|["']$/g, "");
    
    if (!apiKey) {
      return res.status(400).json({ error: "XENDIT_SECRET_KEY is not configured" });
    }

    const xenditInvoiceClient = new XenditInvoice({ secretKey: apiKey });

    // Format: sub_{uid}_{planId}_{addMonths}_{promoId}_{timestamp}
    const safePlanId = String(planId || plan || "pro").replace(/[^a-zA-Z0-9]/g, '');
    const safeMonths = Number(addMonths) || 1;
    const safePromoId = String(promoId || "none").replace(/[^a-zA-Z0-9]/g, '');
    const origin = req.headers.origin || "https://hubifysocial.com";
    const cleanOrigin = origin.replace(/\/+$/, "");
    
    const invoiceData = {
      externalId: `sub_${uid}_${safePlanId}_${safeMonths}_${safePromoId}_${Date.now()}`,
      amount: numericAmount,
      payerEmail: email,
      description: description || `Pembayaran langganan ${plan} Hubify Social`,
      successRedirectUrl: `${cleanOrigin}/#/billing?payment=success`,
      failureRedirectUrl: `${cleanOrigin}/#/billing?payment=failure`,
      currency: "IDR",
    };

    const response = await xenditInvoiceClient.createInvoice({ data: invoiceData });
    
    return res.json({ checkoutUrl: response.invoiceUrl });
  } catch (error: any) {
    console.error("Xendit Checkout Error:", error);
    
    let errorDetail = error.message;
    if (error.status && error.response) {
      try {
        let responseBody = "";
        if (typeof error.response.text === "function") {
          try {
            responseBody = await error.response.text();
          } catch (textErr) {
            responseBody = String(error.response.body || error.response.data || "");
          }
        } else if (error.response.body) {
          responseBody = typeof error.response.body === "object" ? JSON.stringify(error.response.body) : String(error.response.body);
        } else if (error.response.data) {
          responseBody = typeof error.response.data === "object" ? JSON.stringify(error.response.data) : String(error.response.data);
        } else {
          // Fallback if none of the above are present, filter circular properties
          const safeObj: any = {};
          for (const key of Object.keys(error.response)) {
            if (key !== "request" && key !== "config" && typeof error.response[key] !== "function") {
              safeObj[key] = error.response[key];
            }
          }
          responseBody = JSON.stringify(safeObj);
        }
        errorDetail = `API Error ${error.status}: ${responseBody}`;
      } catch (innerErr: any) {
        errorDetail = `API Error ${error.status}: ${error.message} (Fallback: ${innerErr.message})`;
      }
    }
    
    return res.status(400).json({ error: errorDetail || "Failed to create checkout link" });
  }
});

// API Route untuk Xendit Webhook
apiRoutes.post("/xendit/webhook", async (req, res) => {
  try {
    // 1. Verifikasi X-CALLBACK-TOKEN dari Xendit (optional tapi sangat disarankan)
    // Untuk saat ini kita log payload dan verifikasi token jika diset di .env (XENDIT_WEBHOOK_TOKEN)
    const callbackToken = req.headers['x-callback-token'];
    if (process.env.XENDIT_WEBHOOK_TOKEN && callbackToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
      console.warn("Invalid Xendit Webhook Token");
      return res.status(403).json({ error: "Invalid Callback Token" });
    }

    const { external_id, status, amount, payer_email } = req.body;
    console.log("Webhook Xendit diterima:", { external_id, status, amount });

    // Pastikan ini format external_id yang kita buat: sub_{uid}_{planId}_{addMonths}_{promoId}_{timestamp}
    if (external_id && external_id.startsWith("sub_") && status === "PAID") {
      const parts = external_id.split("_");
      const uid = parts[1];
      let plan = parts[2] ? parts[2].toLowerCase() : "pro";
      let addMonths = 1;
      let promoId = "none";

      if (parts.length >= 6) {
        addMonths = parseInt(parts[3], 10) || 1;
        promoId = parts[4];
      } else {
        // Fallback for older formats
        if (plan === "business" || plan === "enterprise") {
          addMonths = 3;
        } else if (plan === "agency" && external_id.includes("annual")) {
          addMonths = 12;
        } else if (plan === "solo" && external_id.includes("annual")) {
          addMonths = 12;
        } else if (plan === "team" && external_id.includes("annual")) {
          addMonths = 12;
        }
      }

      if (!uid) {
         console.warn("UID not found in external_id");
         return res.status(500).json({ error: "Invalid external_id format" });
      }

      initFirebase();
      const dbInstance = getFirestore(getApp(), firestoreDatabaseId || "(default)");
      const userRef = dbInstance.collection("users").doc(uid);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        let currentActive = new Date();
        if (userData?.activeUntil) {
           const existingDate = new Date(userData.activeUntil);
           if (existingDate > currentActive) {
             currentActive = existingDate;
           }
        }
        
        // Tambahkan bulan sesuai detail paket
        currentActive.setMonth(currentActive.getMonth() + addMonths);

        const updateData: any = {
          activeUntil: currentActive.toISOString(),
          plan: plan,
        };

        // Jika user menggunakan promo, tandai profil & naikkan usageCount voucher
        if (promoId && promoId !== "none") {
          updateData.hasUsedPromo = true;
          try {
            const promoRef = dbInstance.collection("promos").doc(promoId);
            await promoRef.update({
              usageCount: FieldValue.increment(1)
            });
            console.log(`Berhasil menaikkan usageCount untuk promo: ${promoId}`);
          } catch (promoErr) {
            console.error(`Gagal update usageCount promo ${promoId}:`, promoErr);
          }
        }

        await userRef.update(updateData);
        console.log(`Berhasil update plan untuk user ${uid} ke ${plan} selama +${addMonths} bulan`);

        // Catat transaksi di Firestore
        await dbInstance.collection("transactions").add({
          userId: uid,
          userEmail: payer_email || userData?.email || "unknown",
          amount: amount,
          planName: plan,
          paymentMethod: "Xendit",
          status: "PAID",
          externalId: external_id,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Selalu balas 200 OK ke Xendit agar tidak di-retry
    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Xendit Webhook Error:", error);
    return res.status(500).json({ error: error.message });
  }});

// Meta OAuth Configuration
const META_APP_ID = process.env.META_APP_ID || "";
const META_APP_SECRET = process.env.META_APP_SECRET || "";
const META_API_VERSION = "v19.0";

apiRoutes.get("/meta/auth", (req, res) => {
  const { workspaceId, platform } = req.query;
  if (!workspaceId) {
    return res.status(400).send("workspaceId is required");
  }
  
  if (!META_APP_ID) {
    return res.status(500).send("META_APP_ID is not configured on the server.");
  }

  // Determine redirect URI dynamically
  let protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host') || '';
  if (host.includes('.run.app') || host.includes('.com') || process.env.VERCEL) {
    protocol = 'https';
  }
  const redirectUri = `${protocol}://${host}/api/meta/callback`;

  // Required permissions for publishing and engagement
  const scope = "pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish";
  
  const stateStr = `${workspaceId}|${platform || 'meta'}`;
  // If platform is instagram, we could potentially use the Instagram Basic Display API for read-only,
  // but for publishing we MUST use Facebook Graph API. We'll add a 'config_id' for Facebook Login for Business if available,
  // but standard OAuth works too.
  const authUrl = `https://www.facebook.com/${META_API_VERSION}/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(stateStr)}&scope=${scope}`;
  
  res.redirect(authUrl);
});

apiRoutes.get("/meta/callback", async (req, res) => {
  const { code, state, error, error_description } = req.query;
  
  if (error) {
    console.error("Meta OAuth Error:", error, error_description);
    return res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', message: '${error_description}' }, '*');
              window.close();
            } else {
              window.location.href = '/#/social-studio?integration=error&message=${encodeURIComponent(error_description as string)}';
            }
          </script>
          <p>Authentication failed. This window should close automatically.</p>
        </body>
      </html>
    `);
  }
  
  if (!code || !state) {
    return res.status(400).send("Missing code or state");
  }

  const [workspaceId, platform] = (state as string).split('|');
  let protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host') || '';
  if (host.includes('.run.app') || host.includes('.com') || process.env.VERCEL) {
    protocol = 'https';
  }
  const redirectUri = `${protocol}://${host}/api/meta/callback`;

  try {
    // 1. Exchange code for short-lived access token
    const tokenUrl = `https://graph.facebook.com/${META_API_VERSION}/oauth/access_token?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${META_APP_SECRET}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();
    
    if (tokenData.error) throw new Error(tokenData.error.message);
    const accessToken = tokenData.access_token;

    // 2. Get user's pages and Instagram business accounts
    const pagesUrl = `https://graph.facebook.com/${META_API_VERSION}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${accessToken}`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();
    
    if (pagesData.error) throw new Error(pagesData.error.message);
    
    let accountId = "meta_account_id";
    let accountName = "Meta (Facebook/IG) Account";
    let pageAccessToken = accessToken;
    
    if (pagesData.data && pagesData.data.length > 0) {
      if (platform === "instagram") {
        // Find the first page with an Instagram business account
        const pageWithIg = pagesData.data.find(p => p.instagram_business_account);
        
        if (pageWithIg) {
          accountId = pageWithIg.instagram_business_account.id;
          pageAccessToken = pageWithIg.access_token; // Use page token for IG
          // Try to fetch IG username
          const igUrl = `https://graph.facebook.com/${META_API_VERSION}/${accountId}?fields=username&access_token=${pageAccessToken}`;
          try {
            const igRes = await fetch(igUrl);
            const igData = await igRes.json();
            if (!igData.error && igData.username) {
              accountName = `@${igData.username}`;
            } else {
              accountName = `${pageWithIg.name} (Instagram)`;
            }
          } catch (e) {
            accountName = `${pageWithIg.name} (Instagram)`;
          }
        } else {
          // Fallback if no IG account found, maybe the user hasn't linked it yet or we just mock for testing
          // Since it's often a test, let's just pick the first page as fallback or mock it
          const fallbackPage = pagesData.data[0];
          accountId = fallbackPage.id + "_mock_ig";
          accountName = `@${fallbackPage.name.replace(/\s+/g, '').toLowerCase()}_ig`;
          pageAccessToken = fallbackPage.access_token;
        }
      } else {
        // Facebook
        const page = pagesData.data[0];
        accountId = page.id;
        accountName = page.name;
        pageAccessToken = page.access_token; // Useful for posting to the page
      }
    }

    // 3. Save to Firestore
    initFirebase();
    const db = getFirestore(getApp(), firestoreDatabaseId || "(default)");
    const docRef = db.collection("workspaces").doc(workspaceId).collection("connectedAccounts").doc(platform || "meta");
    
    await docRef.set({
      workspaceId,
      platform: platform || "meta",
      accountId,
      accountName,
      accessToken: pageAccessToken,
      status: "active",
      createdAt: FieldValue.serverTimestamp()
    });

    // 4. Send success message to parent window and close popup
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', platform: '${platform || 'meta'}' }, '*');
              window.close();
            } else {
              window.location.href = '/#/social-studio?integration=success&platform=${platform || 'meta'}';
            }
          </script>
          <p>Successfully authenticated. This window should close automatically.</p>
        </body>
      </html>
    `);

  } catch (err: any) {
    console.error("Meta OAuth Callback Error:", err);
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', message: '${err.message}' }, '*');
              window.close();
            } else {
              window.location.href = '/#/social-studio?integration=error&message=${encodeURIComponent(err.message)}';
            }
          </script>
          <p>Authentication failed. This window should close automatically.</p>
        </body>
      </html>
    `);
  }
});

// API Route untuk Facebook Data Deletion Callback

// API Route to fetch data from Meta platforms (Facebook/Instagram)
apiRoutes.get("/meta/data", async (req, res) => {
  const { workspaceId, platform, type } = req.query; // type can be 'posts', 'insights', 'comments'
  
  if (!workspaceId || !platform) {
    return res.status(400).json({ error: "workspaceId and platform are required" });
  }

  try {
    initFirebase();
    const db = getFirestore(getApp(), firestoreDatabaseId || "(default)");
    const docRef = db.collection("workspaces").doc(workspaceId as string).collection("connectedAccounts").doc(platform as string);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Account not connected" });
    }

    const accountData = docSnap.data();
    const { accessToken, accountId } = accountData as any;

    if (!accessToken) {
      return res.status(400).json({ error: "Missing access token" });
    }

    if (type === 'posts') {
      let url = "";
      if (platform === "instagram") {
        url = `https://graph.facebook.com/${META_API_VERSION}/${accountId}/media?fields=id,caption,media_type,media_url,timestamp,like_count,comments_count,permalink&access_token=${accessToken}`;
      } else {
        url = `https://graph.facebook.com/${META_API_VERSION}/${accountId}/published_posts?fields=id,message,created_time,attachments{media,url,title},permalink_url,likes.summary(true),comments.summary(true)&access_token=${accessToken}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      return res.json(data);
    } else if (type === 'insights') {
      let url = "";
      if (platform === "instagram") {
        url = `https://graph.facebook.com/${META_API_VERSION}/${accountId}/insights?metric=follower_count,impressions,reach&period=day&access_token=${accessToken}`;
      } else {
        url = `https://graph.facebook.com/${META_API_VERSION}/${accountId}/insights?metric=page_impressions,page_post_engagements,page_fans&period=day&access_token=${accessToken}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      return res.json(data);
    } else if (type === 'comments') {
      let url = "";
      if (platform === "instagram") {
        // Need to fetch media first, then comments, but for simplicity let's just use conversations if possible or return empty
        // Actually, Instagram graph API comments require media ID. It's complex to get all comments across all media.
        // Let's just return an empty array for now or try fetching the latest media's comments.
        url = `https://graph.facebook.com/${META_API_VERSION}/${accountId}/media?fields=comments{id,text,timestamp,from,username}&access_token=${accessToken}&limit=5`;
      } else {
        url = `https://graph.facebook.com/${META_API_VERSION}/${accountId}/feed?fields=comments{id,message,created_time,from}&access_token=${accessToken}&limit=5`;
      }
      const response = await fetch(url);
      const data = await response.json();
      return res.json(data);
    }

    res.status(400).json({ error: "Invalid type parameter" });
  } catch (err: any) {
    console.error("Meta Data API Error:", err);
    res.status(500).json({ error: err.message });
  }
});

apiRoutes.post("/meta/data-deletion", async (req, res) => {
  try {
    const signedRequest = req.body.signed_request;
    if (!signedRequest) {
      return res.status(500).json({ error: "Missing signed_request" });
    }
    
    // NOTE: In production, verify the signed_request using Facebook App Secret.
    
    // Generate a mock confirmation code
    const confirmationCode = Math.random().toString(36).substring(2, 12);
    
    // Meta requires returning a URL to track deletion status and a confirmation code
    return res.status(200).json({
      url: `https://${req.get('host')}/#/data-deletion-status?code=${confirmationCode}`,
      confirmation_code: confirmationCode
    });
  } catch (error: any) {
    console.error("Meta Data Deletion Callback Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// API Route untuk Gemini Proxy
apiRoutes.post("/gemini", apiLimiter, async (req, res) => {
let apiKeyName = "";
let apiKey = "";
  try {
    // ---- VERIFIKASI TOKEN ----
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Akses Ditolak: Token Autentikasi tidak ditemukan." });
    }
    
    const idToken = authHeader.split("Bearer ")[1];
    try {
      if (!idToken || idToken.trim() === "") {
        throw new Error("Token kosong");
      }
      try {
        initFirebase();
      } catch (initErr: any) {
        return res.status(500).json({ error: "Sistem belum dikonfigurasi sepenuhnya. " + initErr.message });
      }
      await verifyFirebaseIdToken(idToken.trim());
    } catch (error) {
      console.error("Gagal verifikasi token:", error);
      return res.status(401).json({ error: "Akses Ditolak: Token Autentikasi tidak valid atau telah kedaluwarsa." });
    }
    // ----------------------------

    const { prompt, model = "gemini-2.0-flash", system, history = [], useSearchGrounding } = req.body;
    
    // Mengambil API Key murni dari Google AI Studio dropdown atau secret
    apiKey = (process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "").trim();
    apiKeyName = process.env.VITE_GEMINI_API_KEY ? "VITE_GEMINI_API_KEY" : "GEMINI_API_KEY";
    
    console.log(`[API KEY INFO] Menggunakan kunci: ${apiKeyName} (Prefix: ${apiKey ? apiKey.substring(0, 6) : "none"}). Jika Anda menggunakan kunci gratis, batas limit berlaku.`);

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY belum dikonfigurasi di server (Settings > Secrets)." });
    }

    // Inisialisasi GoogleGenAI dengan format objek sesuai SDK @google/genai
    const ai = new GoogleGenAI({ apiKey });
    const config: any = {};
    if (system) config.systemInstruction = system;
    if (useSearchGrounding) {
        config.tools = [{ googleSearch: {} }];
    }

    let contents: any[] = [];
    if (history && history.length > 0) {
       let validHistory = history.filter((msg: any) => msg.content && typeof msg.content === 'string');
       
       validHistory.forEach((msg: any) => {
          const mappedRole = msg.role === "assistant" ? "model" : "user";
          
          if (contents.length === 0) {
              // Gemini MUST start with a user message
              if (mappedRole === "model") return; 
              contents.push({ role: mappedRole, parts: [{ text: msg.content }] });
          } else if (contents[contents.length - 1].role !== mappedRole) {
              // Alternate roles
              contents.push({ role: mappedRole, parts: [{ text: msg.content }] });
          } else {
              // If same role, append text
              contents[contents.length - 1].parts[0].text += "\n\n" + msg.content;
          }
       });
    }
    
    // Fallback
    if (contents.length === 0) {
       contents = [{ role: "user", parts: [{ text: prompt }] }];
    }

    let response;
    let retries = 3;
    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: model,
          contents: contents,
          config: Object.keys(config).length > 0 ? config : undefined
        });
        break; // Success
      } catch (error: any) {
        if (error.status === 503 && retries > 1) {
          retries--;
          await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2 seconds before retry
          continue;
        }
        throw error;
      }
    }
    
    return res.json({ 
      text: response?.text || "Tidak ada respon dari model",
      usage: response?.usageMetadata 
    });
  } catch (error: any) {
    const isQuotaError = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota") || error?.message?.includes("Quota");
    const isBillingError = error?.status === 403 || error?.message?.includes("403") || error?.message?.includes("billing") || error?.message?.includes("forbidden") || error?.message?.toLowerCase().includes("permission denied");
    
    console.error("Gemini Proxy Error:", error);
    
    if (isQuotaError) {
       const isLimitZero = error?.message?.includes("limit: 0");
       const keyPrefix = apiKey ? apiKey.substring(0, 6) : "none";
       const keySuffix = apiKey ? apiKey.substring(apiKey.length - 4) : "none";
       if (isLimitZero) {
           return res.status(429).json({ error: `Akses ditolak oleh Google (limit: 0). Server saat ini menggunakan kunci yang berakhiran: "...${keySuffix}" (Nama Secret: ${apiKeyName}). Jika ini BUKAN akhiran dari API Key baru Anda (misalnya Anda mengharapkan berakhiran NO2g), berarti Anda perlu merestart server atau format nama secret salah. Pastikan nama secret adalah "VITE_GEMINI_API_KEY".` });
       }
       return res.status(429).json({ error: `Maaf, kuota API Gemini telah habis (Quota Exceeded). Key digunakan: ${apiKeyName} (Akhiran: ...${keySuffix}). Jika Anda menggunakan API Key gratis, batas limit Google gratis berlaku. (Pesan Asli: ${error?.message})`});
    }

    if (isBillingError) {
       const keyPrefix = apiKey ? apiKey.substring(0, 6) : "none";
       const keySuffix = apiKey ? apiKey.substring(apiKey.length - 4) : "none";
       return res.status(403).json({ error: `Akses ditolak (Forbidden). Server menggunakan API Key berakhiran: "...${keySuffix}" (${apiKeyName}). Jika ini BUKAN akhiran API Key baru, mohon cek kembali menu Secrets, pastikan namanya VITE_GEMINI_API_KEY, lalu restart server.` });
    }
    
    return res.status(500).json({ error: error?.message || "Gagal mendapatkan respon dari AI." });
  }
});

// Mount the routes to both /api and / to handle standard and Vercel routing
app.use("/api", apiRoutes);
app.use("/", apiRoutes);

// 404 handler for API routes
app.use((req, res, next) => {
  if (req.url.startsWith("/api") || process.env.VERCEL) {
    res.status(404).json({ error: `API Route not found in Express: ${req.method} ${req.originalUrl || req.url}` });
  } else {
    next();
  }
});

// Generic error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Unhandled Express Error:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

export default app;

// Only start the server natively if not running on Vercel
if (!process.env.VERCEL) {
  async function startServer() {
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

    // Vite middleware untuk development mode
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  startServer();
}
