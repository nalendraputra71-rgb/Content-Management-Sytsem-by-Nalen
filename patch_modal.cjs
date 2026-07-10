const fs = require('fs');
let code = fs.readFileSync('src/PlatformIntegrationModal.tsx', 'utf8');

const target1 = `    } else if (step === 3) {
      onSuccess(platformId);`;

const replacement1 = `    } else if (step === 3) {
      onSuccess(platformId);`;

const target2 = `  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);`;

const replacement2 = `  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [manualToken, setManualToken] = useState("");`;

const target3 = `  const handleContinue = () => {
    if (step === 1) {
      if (platformId === "meta" || platformId === "instagram") {
        if (!workspaceId) {
          alert("Workspace ID required for OAuth.");
          return;
        }
        setLoading(true);
        // Open OAuth provider in a popup window
        const authWindow = window.open(
          \`/api/meta/auth?workspaceId=\${workspaceId}&platform=\${platformId}\`,
          'oauth_popup',
          'width=600,height=700'
        );
        
        if (!authWindow) {
          alert("Tolong izinkan popup (pop-ups blocker) untuk menghubungkan akun Anda.");
          setLoading(false);
        }
        return; // Execution waits for postMessage
      }`;

const replacement3 = `  const handleContinue = async () => {
    if (step === 1) {
      if (manualToken) {
         setLoading(true);
         try {
           // Simulate saving manual token via API
           const res = await fetch('/api/meta/manual-token', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ workspaceId, platform: platformId, token: manualToken })
           });
           
           if (!res.ok) {
              const err = await res.text();
              throw new Error(err);
           }
           
           setLoading(false);
           setStep(3); // Success
         } catch(e: any) {
           alert("Error saving manual token: " + e.message);
           setLoading(false);
         }
         return;
      }
      if (platformId === "meta" || platformId === "instagram") {
        if (!workspaceId) {
          alert("Workspace ID required for OAuth.");
          return;
        }
        setLoading(true);
        // Open OAuth provider in a popup window
        const authWindow = window.open(
          \`/api/meta/auth?workspaceId=\${workspaceId}&platform=\${platformId}\`,
          'oauth_popup',
          'width=600,height=700'
        );
        
        if (!authWindow) {
          alert("Tolong izinkan popup (pop-ups blocker) untuk menghubungkan akun Anda.");
          setLoading(false);
        }
        return; // Execution waits for postMessage
      }`;

const target4 = `                    <p>
                      Hubify's <a href="https://www.hubifysocial.com/#/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-primary)] hover:underline">Privacy Policy</a> and <a href="https://www.hubifysocial.com/#/terms" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-primary)] hover:underline">Terms of Service</a>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (`;

const replacement4 = `                    <p>
                      Hubify's <a href="https://www.hubifysocial.com/#/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-primary)] hover:underline">Privacy Policy</a> and <a href="https://www.hubifysocial.com/#/terms" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-primary)] hover:underline">Terms of Service</a>
                    </p>
                    
                    {(platformId === 'meta' || platformId === 'instagram') && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-left">
                        <label className="block text-xs font-bold text-blue-800 mb-1">Developer Mode: Manual Access Token</label>
                        <p className="text-[10px] text-blue-600 mb-2 leading-tight">
                          Jika OAuth error, Anda bisa klik tombol "Generate token" di dashboard Meta Developers, lalu paste hasilnya di bawah ini.
                        </p>
                        <input 
                          type="text" 
                          value={manualToken}
                          onChange={(e) => setManualToken(e.target.value)}
                          placeholder="Paste token dari Meta di sini..."
                          className="w-full text-xs px-2 py-1.5 border border-blue-200 rounded outline-none focus:border-blue-400 bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (`;

code = code.replace(target2, replacement2);
code = code.replace(target3, replacement3);
code = code.replace(target4, replacement4);

fs.writeFileSync('src/PlatformIntegrationModal.tsx', code);
