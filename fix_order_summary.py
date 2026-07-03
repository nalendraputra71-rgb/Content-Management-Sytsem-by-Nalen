import re

with open('src/OrderSummary.tsx', 'r') as f:
    content = f.read()

# Replace logic in OrderSummary.tsx
replacement = """
  const plan = searchParams.get('plan') || 'solo';
  const cycle = searchParams.get('cycle') || 'monthly';
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      localStorage.removeItem('pending_checkout');
      localStorage.removeItem('pending_checkout_cycle');
    }
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAnnual = cycle === 'annual';

  let planName = 'Free Starter';
  let originalPrice = 0;
  let finalPrice = 0;
  let features: string[] = [];

  if (plan === 'free') {
    planName = 'Free Starter';
    originalPrice = 0;
    finalPrice = 0;
    features = [
      "1 Workspace", 
      "3 Akun Sosmed", 
      "10x Generate AI / Bulan",
      "Analitik Dasar"
    ];
  } else if (plan === 'solo') {
    planName = 'Solo Creator';
    originalPrice = isAnnual ? 99000 * 12 : 99000;
    finalPrice = isAnnual ? 79000 * 12 : 99000;
    features = [
      "1 Workspace", 
      "10 Akun Sosmed", 
      "100x Generate AI / Bulan",
      "Auto-Publishing",
      "Analitik Lanjutan"
    ];
  } else if (plan === 'team') {
    planName = 'Team';
    originalPrice = isAnnual ? 299000 * 12 : 299000;
    finalPrice = isAnnual ? 239000 * 12 : 299000;
    features = [
      "3 Workspaces", 
      "30 Akun Sosmed", 
      "500x Generate AI / Bulan",
      "Alur Persetujuan Konten",
      "Kolaborasi 3 Anggota"
    ];
  } else if (plan === 'agency') {
    planName = 'Agency';
    originalPrice = isAnnual ? 899000 * 12 : 899000;
    finalPrice = isAnnual ? 749000 * 12 : 899000;
    features = [
      "Unlimited Workspaces", 
      "Unlimited Akun Sosmed", 
      "Unlimited Generate AI",
      "White-label Export",
      "Prioritas Dukungan 24/7"
    ];
  }

  const discount = originalPrice - finalPrice;

  const handleContinue = async () => {
    if (!user) {
      // Not logged in -> save intent & redirect to login
      localStorage.setItem('pending_checkout', plan);
      localStorage.setItem('pending_checkout_cycle', cycle);
      navigate('/login', { state: { mode: 'signup' } });
      return;
    }

    if (finalPrice === 0) {
      // Free plan - bypass payment
      setLoading(true);
      setTimeout(() => navigate('/'), 1000);
      return;
    }

    // Logged in -> Call Xendit API
"""

# Find the start and end to replace
content = re.sub(
    r'  const plan = searchParams.get\(\'plan\'\) \|\| \'monthly\';.*?// Logged in -> Call Xendit API',
    replacement.strip(),
    content,
    flags=re.DOTALL
)

with open('src/OrderSummary.tsx', 'w') as f:
    f.write(content)

