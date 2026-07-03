import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Phone, Instagram, Twitter, Linkedin, Facebook, Mail, Heart, ChevronDown, MessageCircle, Sparkles, HelpCircle, CreditCard, Shield, Zap, BookOpen, Users, LayoutDashboard, Calendar, ArrowRight, CheckCircle2, PlayCircle, Plus, BarChart3, Settings, PenTool, Image as ImageIcon, Link2, Download, Globe, Target, TrendingUp, Lock, Server, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TiktokIcon, ThreadsIcon } from './components/social-icons';

const PublicHeader = ({ currentLang, onLangChange }: { currentLang?: 'id' | 'en', onLangChange?: (l: 'id' | 'en') => void }) => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-black/5 py-4 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
            <img src="/icon.png" alt="Hubify Social" className="w-full h-full object-cover scale-110" onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; e.currentTarget.parentElement.nextElementSibling.style.display = 'flex' }} />
          </div>
          <div className="hidden w-10 h-10 rounded-lg bg-gradient-to-tr from-[#1D4D7A] to-[#0B2A4A] flex items-center justify-center text-white font-bold text-xl">H</div>
          <span className="font-extrabold text-xl tracking-tight text-[#0B2A4A]">Hubify Social</span>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <button onClick={() => navigate('/login', { state: { mode: 'login' }})} className="text-sm font-bold text-[#1D4D7A] hover:text-[#0B2A4A] transition-colors">{currentLang === 'en' ? 'Login' : 'Masuk'}</button>
          <button onClick={() => navigate('/login', { state: { mode: 'signup' }})} className="bg-[#1D4D7A] text-white text-sm font-bold py-2.5 px-5 rounded-full hover:bg-[#0B2A4A] transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#1D4D7A]/20">{currentLang === 'en' ? 'Start for Free' : 'Mulai Gratis'}</button>
        </div>
      </div>
    </header>
  );
};

const PublicFooter = ({ currentLang, onLangChange }: { currentLang?: 'id' | 'en', onLangChange?: (l: 'id' | 'en') => void }) => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Social */}
          <div className="flex flex-col gap-8 lg:w-1/3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                <img src="/icon.png" alt="Hubify Social" className="w-full h-full object-cover scale-110" onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; e.currentTarget.parentElement.nextElementSibling.style.display = 'flex' }} />
              </div>
              <div className="hidden w-10 h-10 rounded-lg bg-gradient-to-tr from-[#1D4D7A] to-[#0B2A4A] flex items-center justify-center text-white font-bold text-xl">H</div>
              <span className="font-extrabold text-3xl tracking-tight text-slate-900">Hubify Social</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400 mt-4">
                <a href="https://www.instagram.com/hubify.social/" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="https://twitter.com/hubifysocial" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="https://www.facebook.com/hubifysocial" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="https://www.linkedin.com/company/hubifysocial" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
                  <Linkedin size={20} />
                </a>
                <a href="https://www.threads.net/@hubify.social" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
                  <ThreadsIcon size={20} />
                </a>
                <a href="https://www.tiktok.com/@hubify.social" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
                  <TiktokIcon size={20} />
                </a>
              </div>
            {onLangChange && currentLang && (
              <div className="relative inline-block w-fit">
                <select
                  value={currentLang}
                  onChange={(e) => onLangChange(e.target.value as 'id' | 'en')}
                  className="appearance-none flex items-center gap-2 py-2 pl-9 pr-8 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all w-fit cursor-pointer outline-none focus:border-slate-300 bg-transparent"
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                </select>
                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" />
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            )}
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex items-start gap-3 text-sm text-slate-500">
                   <div className="mt-0.5 shrink-0">
                     <MapPin size={16} className="text-slate-400" />
                   </div>
                   <div>
                     <p className="font-medium text-slate-700 mb-0.5">Hubify HQ</p>
                     <p className="leading-relaxed">Gupit, Nguter<br/>Sukoharjo, Jawa Tengah 57571</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                   <div className="shrink-0">
                     <Mail size={16} className="text-slate-400" />
                   </div>
                   <a href="mailto:support@hubifysocial.com" className="hover:text-slate-900 transition-colors">support@hubifysocial.com</a>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                   <div className="shrink-0">
                     <Phone size={16} className="text-slate-400" />
                   </div>
                   <a href="tel:+6281330242230" className="hover:text-slate-900 transition-colors">+62 813-3024-2230</a>
                </div>
              </div>
          </div>


          {/* Links - Company */}
          <div className="flex flex-col gap-4">
            <h4 className="font-medium text-slate-400 mb-4 text-sm">{currentLang === 'en' ? 'Product' : 'Produk'}</h4>
            <Link to="/" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">{currentLang === 'en' ? 'Home' : 'Beranda'}</Link>
            <a href="/#fitur" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">{currentLang === 'en' ? 'Features' : 'Fitur Unggulan'}</a>
            <a href="/#harga" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">{currentLang === 'en' ? 'Pricing' : 'Paket Harga'}</a>
            <Link to="/guides" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">{currentLang === 'en' ? 'Guides' : 'Panduan Penggunaan'}</Link>
            <Link to="/faq" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">FAQ</Link>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-medium text-slate-400 mb-4 text-sm">{currentLang === 'en' ? 'Company' : 'Perusahaan'}</h4>
            <Link to="/about" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">{currentLang === 'en' ? 'About Us' : 'Tentang Kami'}</Link>
            <a href="mailto:support@hubifysocial.com" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">{currentLang === 'en' ? 'Contact Us' : 'Hubungi Kami'}</a>
          </div>

          {/* Links - Legal */}
          <div className="flex flex-col gap-4">
            <h4 className="font-medium text-slate-400 mb-4 text-sm">Legal</h4>
            <Link to="/privacy" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">{currentLang === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}</Link>
            <Link to="/terms" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">{currentLang === 'id' ? 'Syarat & Ketentuan' : 'Terms of Service'}</Link>
            <Link to="/refund-policy" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">{currentLang === 'id' ? 'Kebijakan Pengembalian' : 'Refund Policy'}</Link>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-400 font-medium text-xs">&copy; {new Date().getFullYear()} PT Harapan Untuk Bangsa. All rights reserved.</div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            Made with <Heart size={14} className="text-red-500" /> in Indonesia
          </div>
        </div>
      </div>
    </footer>
  );
};

export function TermsOfService() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [lang, setLang] = useState<'id' | 'en'>(() => {
    return (localStorage.getItem('hubify_locale') as 'id' | 'en') || 'en';
  });

  const handleLangChange = (l: 'id' | 'en') => {
    setLang(l);
    localStorage.setItem('hubify_locale', l);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#2C2016] flex flex-col font-sans">
      <PublicHeader currentLang={lang} onLangChange={handleLangChange} />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        {lang === 'id' ? (
          <>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#0B2A4A] mb-8">Ketentuan Layanan</h1>
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed mb-12 space-y-6">
              <p className="font-medium text-slate-500">Terakhir Diperbarui: Juni 2026</p>
              
              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">1. Penerimaan Ketentuan</h2>
              <p>Dengan mendaftar, mengakses, atau menggunakan layanan Hubify Social (&quot;Layanan&quot;), Anda menyatakan telah berusia minimal 18 tahun dan sepakat untuk mengikatkan diri secara hukum pada seluruh ketentuan yang diatur di dalam Ketentuan Layanan ini. Apabila Anda tidak menyetujui salah satu pasal dalam dokumen ini, Anda tidak diperkenankan untuk mengakses atau menggunakan Layanan kami.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">2. Deskripsi Layanan</h2>
              <p>Hubify Social adalah platform manajemen media sosial komprehensif yang menyediakan fitur kalender kolaboratif multi-view, asisten kecerdasan buatan (AI Copilot) untuk bantuan penulisan salinan iklan dan pencarian ide konten, integrasi akun media sosial eksternal (OAuth), dan agregasi data analitik kinerja akun. Anda memahami bahwa fungsionalitas kami bergantung pada ketersediaan API pihak ketiga dari masing-masing platform media sosial eksternal.</p>
              
              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">3. Pendaftaran dan Keamanan Akun</h2>
              <p>Untuk menggunakan Layanan, Anda diwajibkan memberikan informasi pendaftaran yang akurat, lengkap, dan terkini. Anda bertanggung jawab penuh atas kerahasiaan kredensial login Anda serta atas segala tindakan dan aktivitas yang terjadi di bawah penguasaan akun Anda. Hubify Social tidak bertanggung jawab atas kerugian finansial atau moril yang disebabkan oleh akses tidak sah ke akun Anda akibat kelalaian Anda menjaga kerahasiaan kredensial tersebut.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">4. Kebijakan Penggunaan Kecerdasan Buatan (AI Copilot)</h2>
              <p>Fitur AI Copilot yang disediakan dalam Layanan ini dibangun di atas model bahasa besar (Large Language Model) pihak ketiga. Hasil keluaran (output) teks, ide, atau grafik bersifat sarana penunjang kreativitas. Anda sebagai pengguna memiliki hak milik penuh atas materi masukan (input) Anda, namun Anda bertanggung jawab penuh untuk meninjau secara mandiri keakuratan, kepatuhan hukum, hak cipta sekunder, dan etika operasional dari setiap keluaran sebelum mempublikasikannya ke ruang publik atau media sosial Anda.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">5. Hak Akses & Ketentuan Pihak Ketiga</h2>
              <p>Dengan menggunakan fitur integrasi media sosial di Hubify Social, Anda menyatakan setuju untuk terikat dan mematuhi Ketentuan Layanan masing-masing platform termasuk layanan pihak ketiga yang digunakan, seperti Ketentuan Layanan Meta (Facebook & Instagram) dan TikTok.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">6. Lisensi Konten Pengguna (UGC License)</h2>
              <p>Anda tetap memegang sepenuhnya hak cipta atas seluruh konten (teks, gambar, video) yang Anda unggah ke Hubify Social. Namun, dengan mengunggahnya, Anda memberikan lisensi non-eksklusif, bebas royalti, dan terbatas kepada Hubify Social secara murni untuk menyimpan, mengoptimasi (misalnya kompresi file), dan mentransmisikan konten tersebut ke platform tujuan demi kelancaran operasional Layanan kami.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">7. Ketentuan Pembayaran, Langganan, & Kebijakan Pengembalian Dana (Refund)</h2>
              <p>Hubify Social menawarkan akses gratis <strong>(7 Hari Free Trial) tanpa mengharuskan Anda memasukkan informasi kartu kredit</strong>, serta paket berbayar berulang bulanan maupun tahunan. Pembayaran akan dipotong secara otomatis pada setiap awal siklus tagihan sesuai skema yang Anda pilih. Pembatalan langganan dapat dilakukan kapan saja melalui menu pengaturan akun di dashboard Anda sebelum tanggal jatuh tempo berikutnya. Hubify Social menerapkan kebijakan <strong>tanpa pengembalian dana (non-refundable)</strong> secara prorata atau penuh untuk sisa masa aktif yang tidak digunakan setelah pembayaran berhasil diproses.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">8. Hak Kekayaan Intelektual</h2>
              <p>Seluruh kekayaan intelektual berupa merek dagang, desain antarmuka pengguna, aset visual, logo, grafis, kode sumber (source code), dan dokumentasi teknis Hubify Social adalah hak milik eksklusif milik Hubify Social. Pengguna dilarang merekayasa balik (reverse engineer), mendistribusikan ulang, menyalin, atau menduplikasi elemen branding kami tanpa izin tertulis formal dari manajemen Hubify Social.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">9. Batasan Tanggung Jawab & Penafian (Disclaimer)</h2>
              <p>
                Layanan dimaksud disediakan dalam kondisi &quot;sebagaimana adanya&quot; (as is) dan &quot;sebagaimana tersedia&quot; (as available). Hubify Social menolak semua jaminan baik tersurat maupun tersirat, termasuk pula jaminan kelayakan dagang atau ketepatan tujuan khusus. Dalam keadaan apa pun, Hubify Social tidak bertanggung jawab atas segala kerugian tidak langsung, insidental, khusus, atau konsekuensial, termasuk namun tidak terbatas pada hilangnya laba, data, atau citra baik, yang timbul dari atau sehubungan dengan penggunaan atau ketidakmampuan menggunakan layanan.
              </p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">10. Penghentian Layanan (Termination)</h2>
              <p>Kami berhak sepenuhnya untuk menangguhkan, memblokir, atau menghentikan akun Anda sewaktu-waktu secara sepihak tanpa pemberitahuan tertulis sebelumnya, apabila Anda terbukti secara sah melakukan pelanggaran hukum, penyebaran materi spam, tindakan manipulasi sistem, scraping ilegal, atau melanggar salah satu poin di dalam Ketentuan Layanan ini.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">11. Hukum Berlaku, Penyelesaian Sengketa, & Kontak</h2>
              <p>Ketentuan Layanan ini tunduk dan ditafsirkan berdasarkan hukum Republik Indonesia. Segala sengketa yang timbul akan diselesaikan secara eksklusif di pengadilan negeri domisili PT Harapan Untuk Bangsa. Apabila Anda memiliki pertanyaan, keluhan, atau memerlukan klarifikasi terkait ketentuan operasional platform kami, silakan menghubungi tim bantuan hukum kami di email resmi: <a href="mailto:support@hubifysocial.com" className="text-[#1D4D7A] font-semibold hover:underline">support@hubifysocial.com</a>. Platform Hubify Social dioperasikan secara resmi oleh <strong>PT Harapan Untuk Bangsa</strong>.</p>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#0B2A4A] mb-8">Terms of Service</h1>
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed mb-12 space-y-6">
              <p className="font-medium text-slate-500">Last Updated: June 2026</p>
              
              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">1. Acceptance of Terms</h2>
              <p>By registering for, accessing, or utilizing the Hubify Social services (&quot;Service&quot;), you warrant that you are at least 18 years of age and agree to be legally bound by all terms, conditions, and provisions set forth in these Terms of Service. If you do not agree to any part of this agreement, you must immediately cease all access and use of our Service.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">2. Description of Service</h2>
              <p>Hubify Social is a comprehensive social media management platform providing collaborative multi-view calendars, artificial intelligence capabilities (AI Copilot) to assist with copywriting and content ideation, third-party social account integration (OAuth), and consolidated performance data analytics. You recognize that our functionality is dependent on physical API availability provided by relevant external social networks.</p>
              
              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">3. Registration and Account Security</h2>
              <p>In order to use the Service, you are required to submit accurate, complete, and updated registration metadata. You assume sole and exclusive liability for the confidentiality of your credentials and all active operations executed on your account. Hubify Social shall not be liable for any pecuniary or non-pecuniary losses resulting from unauthorized account breaches arising out of your failure to secure login data.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">4. Artificial Intelligence Usage Policy (AI Copilot)</h2>
              <p>The AI Copilot services configured on this platform utilize external, third-party Large Language Models. All textual outputs, ideas, and generated graphics represent supplementary creative aids. Users maintain proprietary intellectual property rights over input assets; however, you bear absolute and sole responsibility to audit output accuracy, copyright claims, and legal adherence before publishing contents to external social media workspaces.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">5. Third-Party Integration and Terms</h2>
              <p>By utilizing social media integration features within Hubify Social, you explicitly agree to be bound by and comply with the respective Terms of Service of those platforms, including the specific Terms of Service maintained by Meta (Facebook & Instagram) and TikTok.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">6. User Generated Content (UGC) License</h2>
              <p>You retain full copyright ownership of all materials (text, images, video) you upload to Hubify Social. However, by submitting content, you grant Hubify Social a non-exclusive, royalty-free, limited license strictly to store, optimize (e.g., file compression), and transmit said content to target platforms to ensure the operational functionality of our Service.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">7. Billing, Subscription, & Refund Provisions</h2>
              <p>Hubify Social operates on a <strong>7-Day Free Trial model without requiring upfront credit card details</strong>, as well as auto-recurring subscription plans (billed monthly or annually). Payments are automatically processed in advance at the start of each billing cycle in accordance with your selected tier. Subscriptions may be terminated at any time through the setting panels inside your account dashboard prior to the subsequent billing anniversary. Hubify Social observes a strict <strong>non-refundable policy</strong> for both prorated and complete active terms once charges are successfully executed.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">8. Intellectual Property Rights</h2>
              <p>All intellectual property rights including registered trademarks, user interface structures, visual compositions, system logos, graphics, source codes, and technical documentation are the exclusive property of Hubify Social. Users are prohibited from reverse-engineering, redistributing, copying, or duplicating any branding identifiers without formal prior written authorization from the Hubify Social corporate board.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">9. Disclaimer of Warranties & Limitation of Liability</h2>
              <p>
                The service is provided on an &quot;as is&quot; and &quot;as available&quot; basis. Hubify Social disclaims all warranties, express or implied, including implied warranties of merchantability or fitness for a particular objective. In no event shall Hubify Social be subject to liability for any indirect, incidental, special, or consequential damages including but not limited to loss of revenues, data assets, or cooperative brand integrity arising directly or indirectly from service inability.
              </p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">10. Termination of Service</h2>
              <p>We reserve absolute, unilateral authority to block, suspend, or permanently terminate your user registration without prior written warning if we detect illicit activity, spamming behaviors, unauthorized scripting, abnormal data harvesting, or any structural violation of these Terms of Service.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">11. Governing Law, Dispute Resolution & Support</h2>
              <p>These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of Indonesia. Any disputes arising out of these Terms will be resolved exclusively in the district court of PT Harapan Untuk Bangsa's domicile. For any clarifying questions, legal reviews, or operations support, please consult our compliance office directly via our official email address: <a href="mailto:support@hubifysocial.com" className="text-[#1D4D7A] font-semibold hover:underline">support@hubifysocial.com</a>. The Hubify Social platform is officially operated by <strong>PT Harapan Untuk Bangsa</strong>.</p>
            </div>
          </>
        )}
      </main>
      <PublicFooter currentLang={lang} onLangChange={handleLangChange} />
    </div>
  );
}

export function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [lang, setLang] = useState<'id' | 'en'>(() => {
    return (localStorage.getItem('hubify_locale') as 'id' | 'en') || 'en';
  });

  const handleLangChange = (l: 'id' | 'en') => {
    setLang(l);
    localStorage.setItem('hubify_locale', l);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#2C2016] flex flex-col font-sans">
      <PublicHeader currentLang={lang} onLangChange={handleLangChange} />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        {lang === 'id' ? (
          <>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#0B2A4A] mb-8">Kebijakan Privasi</h1>
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed mb-12 space-y-6">
              <p className="font-medium text-slate-500">Terakhir Diperbarui: Juni 2026</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">1. Informasi yang Kami Kumpulkan</h2>
              <p>Hubify Social mengumpulkan data secara sadar untuk mengoperasikan platform secara memadai. Hal ini mencakup:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Informasi Identifikasi Pribadi:</strong> Nama lengkap, alamat email, kata sandi terenkripsi, data profiling organisasi, dan alamat pembayaran tagihan yang diisi secara suka rela saat registrasi atau pemutakhiran profile pengguna.</li>
                <li><strong>Data Akses Pihak Ketiga:</strong> Token akses OAuth yang diperoleh dari integrasi eksternal (Google, Meta, TikTok) untuk menjalankan operasional penjadwalan konten, pembacaan metrik analitik dasar, serta pembacaan isi pesan langsung (Direct Messages/DM) dan komentar untuk fitur Inbox terpadu.</li>
                <li><strong>Metadata Penggunaan:</strong> Alamat Protokol Internet (IP), karakteristik perangkat peramban, resolusi layar, tipe sistem operasi, dan log aktivitas operasional di dalam platform Hubify Social secara aman menggunakan kuki (cookies) fungsional.</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">2. Cara Penggunaan Informasi Anda</h2>
              <p>Kami merancang pemrosesan data murni berlandaskan kebutuhan operasional dan peningkatan mutu aplikasi:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Otentikasi, pengecekan validasi kredensial, dan perlindungan keamanan komputasi akun Anda.</li>
                <li>Menghubungkan integrasi OAuth dengan optimal sesuai masukan instruksi scheduling konten Anda.</li>
                <li>Pengembangan respons kustom visual dashboard, mempersonalisasi nama serta foto profil pada antarmuka kolaboratif, serta pendataan riwayat workspace.</li>
                <li>Pengiriman email transaksional resmi berupa invoice, perubahan kebijakan, otentikasi reset sandi sandi, serta notifikasi platform darurat.</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">3. Integrasi Media Sosial dan OAuth Pihak Ketiga</h2>
              <p>Dalam menjalankan modul analitik, penjadwalan, dan kotak masuk terpadu (Inbox), Hubify Social menghubungkan API resmi pihak ketiga (Facebook Graph API, Instagram Graph API, TikTok API, Twitter/X API). Akses kami mencakup metrik penayangan dasar (views/likes), pengunggahan konten, serta pengelolaan pesan masuk (Direct Messages) dan komentar secara real-time berdasarkan izin presisi Anda. Data pesan dan komentar tersebut kami proses di server kami hanya sebatas untuk ditampilkan kepada Anda dan memungkinkan Anda membalasnya melalui antarmuka kami. Semua token OAuth disimpan secara terenkripsi kuat menggunakan standar enkripsi industri. Anda dapat memutus hubungan integrasi ini kapan saja untuk membatalkan token secara instan dan menghentikan pengumpulan data.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">4. Kebijakan Kepatuhan Data Pengguna Google (Google User Data Policy)</h2>
              <p>Hubify Social sangat menjunjung tinggi integritas privasi data yang kami kumpulkan dari integrasi Google APIs. Berikut adalah rincian kepatuhan pengolahan data kami:</p>
              <ul className="list-disc pl-5 space-y-3 font-light">
                <li><strong>Data yang Kami Akses:</strong> Ketika Anda menautkan akun Google Anda melalui Google Sign-In atau integrasi Google, sistem kami hanya mengakses profil dasar Anda yang berupa nama lengkap, alamat email resmi, preferensi bahasa Anda, dan tautan gambar profil (avatar) Anda.</li>
                <li><strong>Tujuan Penggunaan & Akses Data:</strong> Data di atas diproses secara eksklusif untuk otentikasi identitas login Anda, verifikasi pendaftaran akun unik, menampilkan identitas nama profil/foto profil Anda pada workspace kolaboratif milik Anda, serta pengiriman email notifikasi transaksional yang mendesak. Kami tidak mengakses data di luar tujuan operasional ini.</li>
                <li><strong>Penyimpanan dan Keamanan Data:</strong> Informasi akun Google dan segala token akses OAuth yang diterima dienkripsi menggunakan standar industri tinggi (AES-256) selama transit dan selama disimpan di database server cloud aman kami yang memanfaatkan Google Cloud (Firebase Firestore dan Cloud SQL).</li>
                <li><strong>Kebijakan Non-Sharing (Pembagian Data):</strong> Kami <strong>tidak pernah menjual, menyewakan, mentransfer, mendistribusikan, atau membagikan</strong> data pribadi maupun data akun pengguna Google Anda kepada pihak ketiga mana pun termasuk untuk agen periklanan, broker data, atau platform pemasaran eksternal.</li>
                <li><strong>Kepatuhan Penggunaan Terbatas (Limited Use Compliance):</strong> Penggunaan dan pemindahan informasi yang dikumpulkan dari Google API oleh Hubify Social ke aplikasi lain akan mematuhi sepenuhnya <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-[#1D4D7A] underline font-semibold">Google API Services User Data Policy</a>, termasuk persyaratan Penggunaan Terbatas (Limited Use requirements) yang berlaku.</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">5. Keamanan Data Dan Basis Data</h2>
              <p>Kami mengambil langkah-langkah administratif, logis, dan teknis yang ketat untuk mengamankan data Anda pada database sistem (Firebase Firestore dan Cloud SQL). Enkripsi SSL/TLS selalu diaktifkan untuk transfer data saat transit. Namun, kami mengingatkan bahwa metode penyimpanan atau pengiriman elektronik di internet tidak pernah 100% aman tanpa celah. Oleh karena itu, kami menyarankan Anda untuk menjaga kredensial perangkat Anda dengan bijak.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">6. Pihak Ketiga & Pemrosesan Pembayaran</h2>
              <p>Untuk kenyamanan transaksi Anda, segala pengelolaan kartu kredit atau data tagihan perbankan dilakukan secara langsung melalui payment gateway bersertifikat kepatuhan PCI-DSS tinggi. Hubify Social tidak pernah mencatat atau menyimpan nomor kartu kredit penuh Anda langsung dalam basis data internal kami.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">7. Hak Pengguna & Instruksi Penghapusan Data (Data Deletion Instructions)</h2>
              <p>Kami meyakini bahwa Anda memegang kontrol penuh atas data Anda. Hak-hak Anda di dalam platform kami meliputi:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Mengakses, mengoreksi, atau mengubah metadata profil dan organisasi Anda secara langsung melalui panel dashboard akun.</li>
                <li>Memutus token integrasi media sosial dan mencabut akses otorisasi eksternal kapan saja.</li>
                <li>Menuntut penghapusan akun serta seluruh data terkait secara permanen dari server kami. Pengguna juga dapat melakukan penghapusan otomatis secara langsung mandiri melalui tombol 'Hapus Akun' di menu Pengaturan Aplikasi yang akan menghapus data Anda secara otomatis dari sistem Firebase kami. Jika Anda ingin melakukan penghapusan data dengan bantuan dari kami, Anda dapat mengirimkan permintaan tertulis secara formal melalui email ke tim perlindungan data kami di <a href="mailto:support@hubifysocial.com" className="text-[#1D4D7A] font-semibold hover:underline">support@hubifysocial.com</a>. Permintaan Anda akan segera kami verifikasi dan proses dalam waktu selambat-lambatnya 72 jam kerja setelah diterima.</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">8. Perubahan Kebijakan Privasi</h2>
              <p>Kebijakan privasi ini disusun dan tunduk pada hukum Republik Indonesia, termasuk Undang-Undang Perlindungan Data Pribadi (UU PDP). Kami dapat memperbarui Kebijakan Privasi ini secara berkala mengikuti dinamika regulasi hukum dan pembaruan struktur API platform. Kami akan memberitahukan perubahan signifikan melalui layar pembaruan dashboard atau via surel resmi ke alamat email terdaftar Anda sebelum perubahan tersebut berlaku efektif.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">9. Hubungi Kami</h2>
              <p>Apabila Anda memiliki pertanyaan, keluhan terkait enkripsi data, atau hak-hak privasi Anda dalam platform kami, silakan berkomunikasi secara langsung lewat email resmi: <a href="mailto:support@hubifysocial.com" className="text-[#1D4D7A] font-semibold hover:underline">support@hubifysocial.com</a>. Platform Hubify Social dioperasikan secara resmi oleh <strong>PT Harapan Untuk Bangsa</strong>.</p>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#0B2A4A] mb-8">Privacy Policy</h1>
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed mb-12 space-y-6">
              <p className="font-medium text-slate-500">Last Updated: June 2026</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">1. Information We Collect</h2>
              <p>Hubify Social consciously gathers specific metadata to operate our platform. This collection includes:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Personally Identifiable Information:</strong> Full name, email address, strongly encrypted passwords, workspace organization details, and invoice billing information entered voluntarily during account creation or profile update.</li>
                <li><strong>Third-Party Integration Data:</strong> OAuth access tokens fetched via external authorizations (Google, Meta, TikTok, etc.) necessary for executing scheduling workflows, collecting public analytics metrics, and retrieving Direct Messages (DMs) and comments for the unified Inbox features.</li>
                <li><strong>Technical Diagnostics Metadata:</strong> Internet Protocol (IP) addresses, native browser characteristics, screen configurations, active operating system types, and detailed usage log actions gathered securely via functional cookies.</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">2. How We Use Your Information</h2>
              <p>We process collected digital footprints exclusively to offer stable operational access and improve application utility:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Creating credentials, validating user status, and maintaining the computing security of your logged session.</li>
                <li>Processing robust content scheduling queues as connected precisely via your workspace instructions.</li>
                <li>Updating interactive visual responses, displaying your registered name and avatar on team workspace directories, and compiling historical audit entries.</li>
                <li>Dispatching official transactional alerts such as secure payment receipts, terms updates, password reset links, and critical uptime declarations.</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">3. Third-Party Social Connections and OAuth</h2>
              <p>To enable analytics display engines, secure post publishing, and centralized unified Inbox functions, Hubify Social integrates official third-party social APIs (Facebook Graph API, Instagram Graph API, TikTok API, Twitter/X API). Access encompasses basic engagement metrics, content scheduling, and the real-time retrieval and management of incoming Direct Messages (DMs) and comments. DM and comment data are processed by our servers solely to display them within your dashboard and facilitate your direct replies. OAuth tokens are fully encrypted utilizing industry-grade symmetric algorithms. You may terminate these integrations manually within the platform to instantly revoke underlying tokens and halt all data processing.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">4. Google User Data Policy Compliance Statement</h2>
              <p>Hubify Social maintains maximum standards regarding the privacy of information retrieved through Google API scopes. Below are the precise processing criteria:</p>
              <ul className="list-disc pl-5 space-y-3 font-light">
                <li><strong>Data Accessed:</strong> When linking your Google Identity via Google Sign-In or other authorized Google endpoints, our system retrieves your primary profile details: full name, active email, language preferences, and profile image link (avatar).</li>
                <li><strong>Purpose of Access:</strong> We utilize this profile data strictly to authenticate login sessions, register a unique user account, display your profile name/avatar inside your collaborative social media workspace, and send transactional administrative emails. We never scan information beyond these operational needs.</li>
                <li><strong>Data Storage and Security:</strong> Retained Google account details and authorized Google OAuth keys are fully encrypted (AES-256) during transmission and at rest within secure cloud database servers hosted on Google Cloud (Firebase Firestore and Cloud SQL cluster nodes).</li>
                <li><strong>Non-Disclosure Policy:</strong> We <strong>never sell, lease, commercialize, transfer, or share</strong> your Google user data with any advertising companies, list brokers, or third-party marketing syndicates.</li>
                <li><strong>Limited Use Compliance:</strong> Hubify Social&#39;s use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-[#1D4D7A] underline font-semibold">Google API Services User Data Policy</a>, including the Limited Use requirements.</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">5. Data Security Measures</h2>
              <p>We deploy strict administrative, logical, and physical security measures designed to safeguard your database assets (Firebase Firestore and Cloud SQL databases). SSL/TLS encryptions are actively configured for all data transiting web connections. However, please evaluate that no electronic storage design on the internet can claim absolute assurance. We advise keeping your local computing devices and passwords highly secure.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">6. Third-Party Credit and Payment Processing</h2>
              <p>To secure payment transactions, all credit card processing and billing operations are direct-channeled to high PCI-DSS compliant checkout integrations. Hubify Social never collects or saves raw credit card digits inside our internal database tables.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">7. User Rights and Data Deletion Instructions</h2>
              <p>We strongly commit to individual data sovereignty. Your structural platform capabilities include:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Accessing, correcting, or updating your user profile attributes and organization metadata through active dashboard menus.</li>
                <li>Severing your OAuth social channel linkages to invalidate authorization tokens instantly.</li>
                <li>Requesting permanent account dissolution along with corresponding stored historical metrics. Users can autonomously trigger instantaneous account deletion via the 'Delete Account' utility accessible within the Application Settings, which will systematically purge your data from our Firebase architecture. Alternatively, to request permanent deletion via our support staff, you can submit a formal written request to our data protection officer at <a href="mailto:support@hubifysocial.com" className="text-[#1D4D7A] font-semibold hover:underline">support@hubifysocial.com</a>. Your request will be verified and permanently processed within 72 business hours upon receipt.</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">8. Privacy Policy Revisions</h2>
              <p>This privacy policy is constructed in accordance with and subjected to the laws of the Republic of Indonesia, encompassing the Personal Data Protection Law (UU PDP). We reserves the right to modify this Privacy Policy at any time in response to evolving legislative environments and API shifts. Material updates will be communicated clearly through workspace dashboard notifications or via formal email messages sent to registered accounts before taking effect.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">9. Contact and Correspondence</h2>
              <p>For questions related to data encryption, general data rights, or identity protections, please contact our support department at: <a href="mailto:support@hubifysocial.com" className="text-[#1D4D7A] font-semibold hover:underline">support@hubifysocial.com</a>. The Hubify Social platform is officially operated by <strong>PT Harapan Untuk Bangsa</strong>.</p>
            </div>
          </>
        )}
      </main>
      <PublicFooter currentLang={lang} onLangChange={handleLangChange} />
    </div>
  );
}

export function FAQ() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [lang, setLang] = useState<'id' | 'en'>(() => {
    return (localStorage.getItem('hubify_locale') as 'id' | 'en') || 'en';
  });
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const handleLangChange = (l: 'id' | 'en') => {
    setLang(l);
    localStorage.setItem('hubify_locale', l);
  };

  const categories = [
    { id: 'all', icon: <Sparkles size={18} />, label: lang === 'id' ? 'Semua' : 'All' },
    { id: 'general', icon: <HelpCircle size={18} />, label: lang === 'id' ? 'Umum' : 'General' },
    { id: 'features', icon: <Zap size={18} />, label: lang === 'id' ? 'Fitur & AI' : 'Features' },
    { id: 'billing', icon: <CreditCard size={18} />, label: lang === 'id' ? 'Harga' : 'Pricing' },
    { id: 'security', icon: <Shield size={18} />, label: lang === 'id' ? 'Keamanan' : 'Security' },
  ];

  const faqsData = [
    { 
      id: '1', category: 'general', 
      qId: "Apa itu Hubify Social?", 
      aId: "Hubify Social adalah platform manajemen media sosial komprehensif yang dirancang untuk membantu kreator dan bisnis dalam merencanakan, menjadwalkan, menganalisis, dan berkolaborasi dalam satu markas pintar.",
      qEn: "What is Hubify Social?", 
      aEn: "Hubify Social is a comprehensive social media management platform designed to help creators and businesses plan, schedule, analyze, and collaborate in one smart hub." 
    },
    { 
      id: '2', category: 'general', 
      qId: "Platform media sosial apa saja yang didukung?", 
      aId: "Saat ini, Hubify Social mendukung integrasi dengan Instagram, Facebook, TikTok, dan Twitter/X. Kami akan terus menambahkan platform lainnya di masa depan.",
      qEn: "Which social media platforms are supported?", 
      aEn: "Currently, Hubify Social supports integrations with Instagram, Facebook, TikTok, and Twitter/X. We are continually working to add more platforms in the future." 
    },
    { 
      id: '3', category: 'general', 
      qId: "Apakah saya perlu mengunduh aplikasi?", 
      aId: "Tidak, Hubify Social berbasis cloud 100%. Anda dapat mengaksesnya dari browser web apa pun (Chrome, Safari, Edge) baik di desktop maupun perangkat seluler tanpa perlu instalasi.",
      qEn: "Do I need to download an app?", 
      aEn: "No, Hubify Social is 100% cloud-based. You can access it from any web browser (Chrome, Safari, Edge) on both desktop and mobile devices without any installation." 
    },
    { 
      id: '3b', category: 'general', 
      qId: "Bisakah saya mengelola beberapa brand atau klien?", 
      aId: "Ya, Anda dapat membuat Workspace terpisah untuk brand atau klien yang berbeda guna menjaga konten, aset, dan analitik mereka terisolasi sepenuhnya.",
      qEn: "Can I manage multiple brands or clients?", 
      aEn: "Yes, you can create separate Workspaces for different brands or clients to keep their content, assets, and analytics completely isolated." 
    },
    { 
      id: '3c', category: 'general', 
      qId: "Apa yang terjadi jika postingan gagal diterbitkan?", 
      aId: "Jika postingan gagal karena kesalahan API atau masalah jaringan, kami akan segera memberi tahu Anda melalui email dan peringatan dalam aplikasi, memungkinkan Anda mencoba lagi atau mengedit postingan dengan mudah.",
      qEn: "What happens if a post fails to publish?", 
      aEn: "If a post fails due to an API error or network issue, we will notify you immediately via email and in-app alert, allowing you to easily retry or edit the post." 
    },
    { 
      id: '4', category: 'features', 
      qId: "Bagaimana cara kerja AI Copilot?", 
      aId: "AI Copilot kami terintegrasi langsung di dalam editor konten. Cukup masukkan topik atau instruksi singkat, dan AI akan membantu menghasilkan ide konten, menulis caption menarik, menyarankan hashtag relevan, bahkan menerjemahkan teks ke bahasa lain dalam hitungan detik.",
      qEn: "How does the AI Copilot work?", 
      aEn: "Our AI Copilot is integrated directly into the content editor. Just enter a topic or brief instruction, and the AI will help generate content ideas, write engaging captions, suggest relevant hashtags, and even translate text in seconds." 
    },
    { 
      id: '5', category: 'features', 
      qId: "Apakah ada batasan jumlah posting yang dapat dijadwalkan?", 
      aId: "Itu bergantung pada paket yang Anda pilih. Paket dasar memiliki batas wajar per bulan, sedangkan paket Pro atau Enterprise memungkinkan penjadwalan konten hampir tak terbatas.",
      qEn: "Is there a limit to the number of scheduled posts?", 
      aEn: "It depends on the plan you choose. The basic plan has a reasonable monthly limit, while the Pro or Enterprise plans allow for virtually unlimited content scheduling." 
    },
    { 
      id: '5b', category: 'features', 
      qId: "Apakah mendukung posting otomatis ke Instagram Stories atau Reels?", 
      aId: "Ya, Hubify Social mendukung posting otomatis untuk postingan feed Instagram, Reels, dan Stories untuk akun bisnis.",
      qEn: "Does it auto-publish to Instagram Stories or Reels?", 
      aEn: "Yes, Hubify Social supports auto-publishing for Instagram feed posts, Reels, and Stories for business accounts." 
    },
    { 
      id: '5c', category: 'features', 
      qId: "Bisakah saya membalas komentar dan pesan dari Hubify?", 
      aId: "Ya, fitur Inbox Terpadu kami memungkinkan Anda mengelola komentar, DM, dan sebutan dari berbagai platform dalam satu tempat.",
      qEn: "Can I reply to comments and messages from Hubify?", 
      aEn: "Yes, our Unified Inbox feature allows you to manage comments, DMs, and mentions across platforms from one place." 
    },
    { 
      id: '5d', category: 'features', 
      qId: "Bisakah saya menjadwalkan postingan secara massal?", 
      aId: "Ya, Anda dapat mengunggah file CSV untuk menjadwalkan puluhan postingan sekaligus menggunakan fitur unggah massal kami.",
      qEn: "Can I schedule posts in bulk?", 
      aEn: "Yes, you can upload a CSV file to schedule dozens of posts at once using our bulk upload feature." 
    },
    { 
      id: '5e', category: 'features', 
      qId: "Apakah Hubify Social menyediakan analitik dan pelaporan?", 
      aId: "Ya, dashboard kami menyediakan analitik komprehensif tentang kinerja postingan, pertumbuhan audiens, dan metrik keterlibatan. Anda juga dapat mengekspor laporan ke PDF atau CSV.",
      qEn: "Does Hubify Social provide analytics and reporting?", 
      aEn: "Yes, our dashboard provides comprehensive analytics on post performance, audience growth, and engagement metrics. You can also export reports to PDF or CSV." 
    },
    { 
      id: '5f', category: 'features', 
      qId: "Bisakah saya menyesuaikan tautan di bio?", 
      aId: "Ya, Hubify menyediakan fitur 'Link in Bio' yang dapat disesuaikan di mana Anda dapat memamerkan beberapa tautan, produk, dan profil sosial dengan merek Anda sendiri.",
      qEn: "Can I customize the link in bio?", 
      aEn: "Yes, Hubify provides a customizable 'Link in Bio' page where you can showcase multiple links, products, and social profiles with your own branding." 
    },
    { 
      id: '6', category: 'features', 
      qId: "Bisakah saya berkolaborasi dengan tim saya?", 
      aId: "Tentu! Anda dapat mengundang anggota tim ke dalam Workspace Anda. Setiap anggota dapat diberi peran khusus (seperti Admin atau Editor) untuk memastikan alur kerja yang teratur dan aman.",
      qEn: "Can I collaborate with my team?", 
      aEn: "Absolutely! You can invite team members to your Workspace. Each member can be assigned specific roles (such as Admin or Editor) to ensure an organized and secure workflow." 
    },
    { 
      id: '7', category: 'billing', 
      qId: "Apakah ada uji coba gratis (free trial)?", 
      aId: "Ya, kami menawarkan uji coba gratis 14 hari dengan akses ke semua fitur premium (termasuk AI Copilot). Tidak memerlukan kartu kredit untuk memulai.",
      qEn: "Is there a free trial available?", 
      aEn: "Yes, we offer a 14-day free trial with access to all premium features (including the AI Copilot). No credit card is required to start." 
    },
    { 
      id: '8', category: 'billing', 
      qId: "Bagaimana cara mengubah paket berlangganan?", 
      aId: "Anda dapat mengubah (upgrade atau downgrade) paket kapan saja melalui menu Pengaturan Penagihan di dalam dashboard. Perubahan akan berlaku pada siklus tagihan berikutnya.",
      qEn: "How do I change my subscription plan?", 
      aEn: "You can change (upgrade or downgrade) your plan at any time through the Billing Settings menu in the dashboard. Changes will take effect on the next billing cycle." 
    },
    { 
      id: '8b', category: 'billing', 
      qId: "Bisakah saya membatalkan langganan kapan saja?", 
      aId: "Ya, Anda dapat membatalkan langganan Anda kapan saja melalui pengaturan penagihan Anda. Akses Anda akan berlanjut hingga akhir periode tagihan saat ini.",
      qEn: "Can I cancel my subscription at any time?", 
      aEn: "Yes, you can cancel your subscription at any time from your billing settings. Your access will continue until the end of your current billing period." 
    },
    { 
      id: '8c', category: 'billing', 
      qId: "Metode pembayaran apa yang Anda terima?", 
      aId: "Kami menerima semua kartu kredit utama, transfer bank, dan dompet digital (e-wallet) tertentu tergantung pada wilayah Anda.",
      qEn: "What payment methods do you accept?", 
      aEn: "We accept all major credit cards, bank transfers, and select e-wallets depending on your region." 
    },
    { 
      id: '8d', category: 'billing', 
      qId: "Apakah Anda menawarkan diskon untuk organisasi nirlaba atau pelajar?", 
      aId: "Ya, kami menawarkan diskon khusus untuk LSM terdaftar dan pelajar. Silakan hubungi tim dukungan kami dengan kredensial Anda untuk mengklaimnya.",
      qEn: "Do you offer a non-profit or student discount?", 
      aEn: "Yes, we offer special discounts for registered NGOs and students. Please contact our support team with your credentials to claim it." 
    },
    { 
      id: '9', category: 'security', 
      qId: "Apakah data dan akun media sosial saya aman?", 
      aId: "Sangat aman. Kami menggunakan standar enkripsi industri terkemuka (AES-256) untuk melindungi data. Kami tidak pernah menyimpan password media sosial Anda; kami menggunakan token OAuth resmi yang dienkripsi dengan aman.",
      qEn: "Are my data and social media accounts secure?", 
      aEn: "Absolutely secure. We use industry-leading encryption standards (AES-256) to protect data. We never store your social media passwords; we use official OAuth tokens that are securely encrypted." 
    },
    { 
      id: '9b', category: 'security', 
      qId: "Apakah informasi pembayaran saya aman?", 
      aId: "Ya, semua pembayaran diproses dengan aman melalui payment gateway yang mematuhi PCI (Payment Card Industry). Kami tidak menyimpan detail kartu kredit Anda di server kami.",
      qEn: "Is my payment information safe?", 
      aEn: "Yes, all payments are processed securely through PCI-compliant payment gateways. We do not store your credit card details on our servers." 
    },
    { 
      id: '10', category: 'security', 
      qId: "Apa yang terjadi jika saya menghapus akun Hubify?", 
      aId: "Semua data personal Anda, pengaturan workspace, posting terjadwal, dan koneksi akun akan dihapus secara permanen dari server kami demi melindungi privasi Anda. Kami tidak menyimpan sisa data apa pun.",
      qEn: "What happens if I delete my Hubify account?", 
      aEn: "All your personal data, workspace settings, scheduled posts, and account connections will be permanently deleted from our servers to protect your privacy. We do not keep any residual data." 
    }
  ];

  const filteredFaqs = activeCategory === 'all' 
    ? faqsData 
    : faqsData.filter(f => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#2C2016] flex flex-col font-sans selection:bg-blue-500/30">
      <PublicHeader currentLang={lang} onLangChange={handleLangChange} />
      
      {/* Hero Section */}
      <div className="bg-[#0B2A4A] text-white pt-24 pb-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent blur-3xl"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md text-blue-300 font-medium text-sm mb-8 border border-white/10 shadow-xl">
            <Sparkles size={16} className="text-blue-400" /> {lang === 'id' ? 'Pusat Bantuan & Edukasi' : 'Help & Education Center'}
          </motion.div>
          <motion.h1 initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
            {lang === 'id' ? 'Ada Pertanyaan?' : 'Got Questions?'} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Kami Siap Membantu.</span>
          </motion.h1>
          <motion.p initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className="text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto font-light">
            {lang === 'id' ? 'Jelajahi panduan kami atau temukan jawaban instan untuk pertanyaan yang sering diajukan oleh kreator.' : 'Explore our guides or find instant answers to questions frequently asked by creators.'}
          </motion.p>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 pb-24 w-full -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Categories Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-6">
            <motion.div 
              initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}}
              className="bg-white p-4 md:p-6 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-2"
            >
              <h3 className="text-lg font-bold text-[#0B2A4A] mb-2 px-3">{lang === 'id' ? 'Kategori Bantuan' : 'Help Categories'}</h3>
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setOpenIndex(null);
                    }}
                    className={`flex items-center gap-3 lg:gap-4 px-4 lg:px-5 py-3 lg:py-4 rounded-2xl text-sm lg:text-base font-semibold transition-all duration-300 whitespace-nowrap lg:whitespace-normal w-auto lg:w-full text-left shrink-0 ${
                      activeCategory === cat.id 
                        ? 'bg-[#0B2A4A] text-white shadow-md lg:scale-[1.02]' 
                        : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-[#0B2A4A]'
                    }`}
                  >
                    <div className={`p-2 rounded-xl transition-colors hidden lg:block ${activeCategory === cat.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                      {cat.icon}
                    </div>
                    {cat.label}
                  </button>
                ))}
              </div>
            </motion.div>
            
            {/* Quick Contact Card inside Sidebar */}
            <motion.div
              initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.4}}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100/50 shadow-sm hidden lg:block text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full blur-2xl"></div>
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm text-blue-500 relative z-10 rotate-3">
                <MessageCircle size={28} />
              </div>
              <h4 className="font-bold text-[#0B2A4A] text-xl mb-3 relative z-10">{lang === 'id' ? 'Butuh bantuan?' : 'Need help?'}</h4>
              <p className="text-base text-slate-600 mb-6 relative z-10">{lang === 'id' ? 'Tim support kami siap membalas dalam 24 jam.' : 'Our support team will reply within 24 hours.'}</p>
              <a href="mailto:support@hubifysocial.com" className="inline-block w-full text-center px-4 py-3.5 bg-white text-blue-600 border border-blue-200 rounded-xl font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm relative z-10">
                {lang === 'id' ? 'Email Kami' : 'Email Us'}
              </a>
            </motion.div>
          </div>

          {/* FAQs List */}
          <div className="lg:col-span-8 space-y-4 pt-2 lg:pt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {filteredFaqs.map((faq, index) => {
                  const isOpen = openIndex === index;
                  return (
                    <motion.div 
                      key={faq.id} 
                      className={`bg-white rounded-3xl overflow-hidden transition-all duration-300 border ${isOpen ? 'border-blue-200 shadow-lg shadow-blue-900/5 ring-4 ring-blue-50/50' : 'border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md'}`}
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="w-full text-left px-6 py-6 md:px-8 md:py-7 flex items-start justify-between gap-4 focus:outline-none group"
                      >
                        <span className={`font-bold text-lg md:text-xl transition-colors mt-0.5 ${isOpen ? 'text-blue-600' : 'text-[#0B2A4A] group-hover:text-slate-900'}`}>
                          {lang === 'id' ? faq.qId : faq.qEn}
                        </span>
                        <div className={`shrink-0 p-2.5 rounded-full transition-all duration-300 ${isOpen ? 'bg-blue-600 rotate-180 text-white shadow-md' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                          <ChevronDown size={20} />
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <div className="px-6 pb-6 md:px-8 md:pb-8 text-slate-600 leading-relaxed text-base md:text-lg">
                              <div className="pt-4 border-t border-slate-100">
                                {lang === 'id' ? faq.aId : faq.aEn}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
            
            {filteredFaqs.length === 0 && (
              <div className="text-center py-20 text-slate-400">
                <p>{lang === 'id' ? 'Belum ada pertanyaan di kategori ini.' : 'No questions in this category yet.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Call to action */}
        <motion.div 
          initial={{opacity:0, y:20}} 
          whileInView={{opacity:1, y:0}} 
          viewport={{once:true}}
          className="mt-24 text-center bg-gradient-to-br from-[#0B2A4A] to-blue-900 text-white rounded-[2.5rem] p-10 md:p-16 border border-blue-800 shadow-2xl relative overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner backdrop-blur-md text-blue-200 rotate-3 border border-white/20">
              <MessageCircle size={36} />
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
              {lang === 'id' ? 'Masih Butuh Bantuan?' : 'Still Need Help?'}
            </h3>
            <p className="text-blue-100/80 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              {lang === 'id' ? 'Tim support kami siap membantu Anda menyelesaikan masalah apa pun. Jangan ragu untuk menyapa kami!' : 'Our support team is ready to help you solve any problem. Don\'t hesitate to say hello!'}
            </p>
            <a href="mailto:support@hubifysocial.com" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#0B2A4A] rounded-full font-bold hover:bg-blue-50 transition-all hover:scale-105 shadow-xl shadow-black/20">
              {lang === 'id' ? 'Hubungi Support Kami' : 'Contact Our Support'}
              <Sparkles size={18} className="text-blue-500" />
            </a>
          </div>
        </motion.div>
      </main>
      <PublicFooter currentLang={lang} onLangChange={handleLangChange} />
    </div>
  );
}

export function Guides() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [lang, setLang] = useState<'id' | 'en'>(() => {
    return (localStorage.getItem('hubify_locale') as 'id' | 'en') || 'en';
  });
  const [activeGuideId, setActiveGuideId] = useState('workspace');

  const handleLangChange = (l: 'id' | 'en') => {
    setLang(l);
    localStorage.setItem('hubify_locale', l);
  };

  const guides = [
    {
      id: 'workspace',
      icon: <LayoutDashboard size={22} />,
      titleId: 'Membuat Workspace',
      titleEn: 'Creating a Workspace',
      descId: 'Langkah pertama memulai di Hubify.',
      descEn: 'First step to start in Hubify.',
      contentId: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-4">1. Membuat Workspace Baru</h2>
            <p className="text-lg text-slate-700">Workspace adalah ruang kerja utama Anda. Anda bisa membuat workspace terpisah untuk setiap merek atau klien yang Anda kelola agar semuanya tertata rapi.</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 flex items-center justify-center min-h-[300px]">
             {/* Visual mockup of creating workspace */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-5 w-full max-w-sm relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">1</div>
                <div>
                  <div className="h-5 bg-slate-800 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Workspace</div>
                  <div className="h-12 bg-slate-50 rounded-xl border border-slate-200 flex items-center px-4 text-slate-400 text-sm">Misal: Brand Fashionku</div>
                </div>
                <div className="h-12 bg-[#0B2A4A] rounded-xl text-white font-bold flex items-center justify-center text-sm gap-2 mt-2">
                  <Plus size={16} /> Buat Workspace
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <ol className="space-y-4">
              {[
                'Buka halaman Dashboard setelah Anda berhasil login.',
                'Klik tombol "Buat Workspace" di sidebar sebelah kiri.',
                'Masukkan nama workspace dan unggah logo (opsional).',
                'Klik Simpan. Workspace baru Anda sekarang siap digunakan!'
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mt-0.5">{i+1}</div>
                  <p className="text-slate-700 text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-4">1. Creating a New Workspace</h2>
            <p className="text-lg text-slate-700">A workspace is your primary working area. You can create a separate workspace for each brand or client you manage to keep things organized.</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 flex items-center justify-center min-h-[300px]">
             {/* Visual mockup of creating workspace */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-5 w-full max-w-sm relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">1</div>
                <div>
                  <div className="h-5 bg-slate-800 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Workspace Name</div>
                  <div className="h-12 bg-slate-50 rounded-xl border border-slate-200 flex items-center px-4 text-slate-400 text-sm">E.g., My Fashion Brand</div>
                </div>
                <div className="h-12 bg-[#0B2A4A] rounded-xl text-white font-bold flex items-center justify-center text-sm gap-2 mt-2">
                  <Plus size={16} /> Create Workspace
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <ol className="space-y-4">
              {[
                'Go to your Dashboard after logging in.',
                'Click the "Create Workspace" button on the left sidebar.',
                'Enter the workspace name and upload a logo (optional).',
                'Click Save. Your new workspace is now ready!'
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mt-0.5">{i+1}</div>
                  <p className="text-slate-700 text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'integration',
      icon: <Users size={22} />,
      titleId: 'Menghubungkan Akun',
      titleEn: 'Connecting Accounts',
      descId: 'Integrasi dengan IG, TikTok, dll.',
      descEn: 'Integrate with IG, TikTok, etc.',
      contentId: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-4">2. Menghubungkan Akun Media Sosial</h2>
            <p className="text-lg text-slate-700">Hubungkan akun media sosial Anda untuk mulai melakukan penjadwalan dan memantau analitik langsung dari Hubify.</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 flex items-center justify-center min-h-[300px]">
             {/* Visual mockup */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-4 w-full max-w-sm relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">2</div>
                <div className="font-bold text-[#0B2A4A] mb-2">Integrasi Platform</div>
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 flex items-center justify-center text-white"><Instagram size={20} /></div>
                    <span className="font-semibold text-sm">Instagram</span>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Terhubung</div>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white"><Twitter size={20} /></div>
                    <span className="font-semibold text-sm">X (Twitter)</span>
                  </div>
                  <div className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-200">Hubungkan</div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <ol className="space-y-4">
              {[
                'Masuk ke dalam workspace yang diinginkan.',
                'Buka menu "Integrasi" atau "Pengaturan Workspace".',
                'Pilih platform yang ingin dihubungkan (misal: Instagram, Facebook).',
                'Ikuti petunjuk login OAuth dari platform tersebut dan berikan izin akses yang diperlukan.'
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mt-0.5">{i+1}</div>
                  <p className="text-slate-700 text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-4">2. Connecting Social Media Accounts</h2>
            <p className="text-lg text-slate-700">Connect your social media accounts to start scheduling and monitoring analytics directly from Hubify.</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 flex items-center justify-center min-h-[300px]">
             {/* Visual mockup */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-4 w-full max-w-sm relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">2</div>
                <div className="font-bold text-[#0B2A4A] mb-2">Platform Integrations</div>
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 flex items-center justify-center text-white"><Instagram size={20} /></div>
                    <span className="font-semibold text-sm">Instagram</span>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Connected</div>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white"><Twitter size={20} /></div>
                    <span className="font-semibold text-sm">X (Twitter)</span>
                  </div>
                  <div className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-200">Connect</div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <ol className="space-y-4">
              {[
                'Enter your desired workspace.',
                'Go to the "Integrations" or "Workspace Settings" menu.',
                'Select the platform you want to connect (e.g., Instagram, Facebook).',
                'Follow the OAuth login instructions from the platform and grant the necessary permissions.'
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mt-0.5">{i+1}</div>
                  <p className="text-slate-700 text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'studio',
      icon: <Calendar size={22} />,
      titleId: 'Social Studio',
      titleEn: 'Social Studio',
      descId: 'Membuat & jadwalkan konten.',
      descEn: 'Create & schedule content.',
      contentId: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-4">3. Membuat dan Menjadwalkan Konten</h2>
            <p className="text-lg text-slate-700">Rencanakan konten Anda dengan mudah melalui antarmuka kalender Social Studio yang intuitif.</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 flex items-center justify-center min-h-[300px]">
             {/* Visual mockup */}
             <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 w-full max-w-md relative overflow-hidden flex flex-col">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md z-10">3</div>
                
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500"><Sparkles size={20} /></div>
                  <div>
                    <div className="font-bold text-sm text-[#0B2A4A]">Tulis dengan AI</div>
                    <div className="text-xs text-slate-500">Minta AI membuatkan caption</div>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="h-24 bg-slate-50 rounded-xl border border-slate-200 p-3 text-sm text-slate-400">
                    Ada ide konten hari ini? Mulai mengetik di sini...
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-20 bg-blue-100 rounded-full"></div>
                    <div className="h-8 w-24 bg-slate-100 rounded-full"></div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                    <div className="text-xs font-bold text-slate-500">Jadwal: Besok, 10:00</div>
                    <div className="h-8 w-24 bg-[#0B2A4A] rounded-lg text-white font-bold flex items-center justify-center text-xs">Jadwalkan</div>
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <ol className="space-y-4">
              {[
                'Buka menu "Social Studio" dari sidebar.',
                'Klik tombol "Tulis Draft Baru" atau pilih tanggal pada kalender.',
                'Unggah media (gambar/video) dan tulis caption. Gunakan tombol AI Copilot jika Anda butuh inspirasi!',
                'Pilih platform tujuan untuk publikasi.',
                'Atur jadwal tayang pada kolom Jadwal Post.',
                'Klik Jadwalkan.'
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mt-0.5">{i+1}</div>
                  <p className="text-slate-700 text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-4">3. Creating and Scheduling Content</h2>
            <p className="text-lg text-slate-700">Plan your content easily through the intuitive Social Studio calendar interface.</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 flex items-center justify-center min-h-[300px]">
             {/* Visual mockup */}
             <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 w-full max-w-md relative overflow-hidden flex flex-col">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md z-10">3</div>
                
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500"><Sparkles size={20} /></div>
                  <div>
                    <div className="font-bold text-sm text-[#0B2A4A]">Write with AI</div>
                    <div className="text-xs text-slate-500">Ask AI to generate a caption</div>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="h-24 bg-slate-50 rounded-xl border border-slate-200 p-3 text-sm text-slate-400">
                    Any content ideas today? Start typing here...
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-20 bg-blue-100 rounded-full"></div>
                    <div className="h-8 w-24 bg-slate-100 rounded-full"></div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                    <div className="text-xs font-bold text-slate-500">Schedule: Tomorrow, 10:00</div>
                    <div className="h-8 w-24 bg-[#0B2A4A] rounded-lg text-white font-bold flex items-center justify-center text-xs">Schedule</div>
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <ol className="space-y-4">
              {[
                'Open the "Social Studio" menu from the sidebar.',
                'Click the "Write New Draft" button or select a date on the calendar.',
                'Upload media (images/videos) and write your caption. Use the AI Copilot button if you need inspiration!',
                'Select the target platforms for publication.',
                'Set the publishing schedule in the Schedule Post section.',
                'Click Schedule.'
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mt-0.5">{i+1}</div>
                  <p className="text-slate-700 text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'team',
      icon: <Users size={22} />,
      titleId: 'Anggota Tim',
      titleEn: 'Team Members',
      descId: 'Undang rekan untuk kolaborasi.',
      descEn: 'Invite colleagues for collaboration.',
      contentId: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-4">4. Mengundang Anggota Tim</h2>
            <p className="text-lg text-slate-700">Berkolaborasi dengan tim Anda dalam satu workspace yang sama agar manajemen sosial media lebih efektif.</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 flex items-center justify-center min-h-[300px]">
             {/* Visual mockup */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-4 w-full max-w-sm relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md z-10">4</div>
                
                <div className="font-bold text-[#0B2A4A] mb-1">Undang Anggota</div>
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <div className="h-12 bg-slate-50 rounded-xl border border-slate-200 flex items-center pl-10 pr-4 text-slate-400 text-sm">rekan@perusahaan.com</div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-10 bg-blue-50 text-blue-600 rounded-lg flex-1 flex items-center justify-center font-bold text-xs border border-blue-100">Editor</div>
                    <div className="h-10 bg-slate-50 text-slate-500 rounded-lg flex-1 flex items-center justify-center font-bold text-xs border border-slate-200">Admin</div>
                  </div>
                  <div className="h-12 bg-[#0B2A4A] rounded-xl text-white font-bold flex items-center justify-center text-sm mt-2">Kirim Undangan</div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <ol className="space-y-4">
              {[
                'Buka menu "Anggota Tim" di pengaturan workspace.',
                'Masukkan alamat email rekan yang ingin Anda undang.',
                'Tentukan peran mereka (Admin atau Editor).',
                'Klik "Kirim Undangan". Rekan Anda akan menerima notifikasi email untuk bergabung.'
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mt-0.5">{i+1}</div>
                  <p className="text-slate-700 text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-4">4. Inviting Team Members</h2>
            <p className="text-lg text-slate-700">Collaborate with your team within the same workspace for more effective social media management.</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 flex items-center justify-center min-h-[300px]">
             {/* Visual mockup */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-4 w-full max-w-sm relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md z-10">4</div>
                
                <div className="font-bold text-[#0B2A4A] mb-1">Invite Member</div>
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <div className="h-12 bg-slate-50 rounded-xl border border-slate-200 flex items-center pl-10 pr-4 text-slate-400 text-sm">colleague@company.com</div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-10 bg-blue-50 text-blue-600 rounded-lg flex-1 flex items-center justify-center font-bold text-xs border border-blue-100">Editor</div>
                    <div className="h-10 bg-slate-50 text-slate-500 rounded-lg flex-1 flex items-center justify-center font-bold text-xs border border-slate-200">Admin</div>
                  </div>
                  <div className="h-12 bg-[#0B2A4A] rounded-xl text-white font-bold flex items-center justify-center text-sm mt-2">Send Invite</div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <ol className="space-y-4">
              {[
                'Open the "Team Members" menu in workspace settings.',
                'Enter the email address of the colleague you want to invite.',
                'Assign their role (Admin or Editor).',
                'Click "Send Invite". Your colleague will receive an email notification to join.'
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mt-0.5">{i+1}</div>
                  <p className="text-slate-700 text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'ai-copilot',
      icon: <Sparkles size={22} />,
      titleId: 'Menggunakan AI Copilot',
      titleEn: 'Using AI Copilot',
      descId: 'Buat caption & konten otomatis.',
      descEn: 'Generate captions & content.',
      contentId: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-4">5. Menggunakan AI Copilot</h2>
            <p className="text-lg text-slate-700">Manfaatkan AI Copilot untuk menghasilkan caption, ide konten, dan hashtag yang relevan dalam hitungan detik.</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 flex items-center justify-center min-h-[300px]">
             {/* Visual mockup */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-4 w-full max-w-sm relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md z-10">5</div>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Sparkles size={18} /></div>
                  <div className="font-bold text-[#0B2A4A]">AI Caption Generator</div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase">Topik Konten</div>
                  <div className="h-10 bg-slate-50 rounded-lg border border-slate-200 flex items-center px-3 text-slate-600 text-sm">Promo Akhir Tahun Fashion</div>
                  
                  <div className="text-xs font-bold text-slate-500 uppercase mt-2">Tone Bahasa</div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-[#0B2A4A] text-white rounded-full flex items-center justify-center px-4 font-bold text-xs">Profesional</div>
                    <div className="h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center px-4 font-bold text-xs border border-slate-200">Santai</div>
                  </div>
                  
                  <div className="h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 text-sm mt-2 shadow-md">
                    <Sparkles size={16} /> Generate Caption
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <ol className="space-y-4">
              {[
                'Buka tab "Draft Konten" atau saat membuat post baru.',
                'Klik tombol "AI Copilot" dengan ikon bintang/sparkle.',
                'Pilih jenis bantuan: Buat Caption, Ide Konten, atau Perbaiki Teks.',
                'Masukkan topik atau kata kunci, lalu pilih tone bahasa.',
                'Klik Generate dan AI akan memberikan beberapa pilihan teks untuk digunakan.'
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mt-0.5">{i+1}</div>
                  <p className="text-slate-700 text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-4">5. Using AI Copilot</h2>
            <p className="text-lg text-slate-700">Leverage AI Copilot to generate relevant captions, content ideas, and hashtags in seconds.</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 flex items-center justify-center min-h-[300px]">
             {/* Visual mockup */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-4 w-full max-w-sm relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md z-10">5</div>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Sparkles size={18} /></div>
                  <div className="font-bold text-[#0B2A4A]">AI Caption Generator</div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase">Topic</div>
                  <div className="h-10 bg-slate-50 rounded-lg border border-slate-200 flex items-center px-3 text-slate-600 text-sm">Year-End Fashion Promo</div>
                  
                  <div className="text-xs font-bold text-slate-500 uppercase mt-2">Tone</div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-[#0B2A4A] text-white rounded-full flex items-center justify-center px-4 font-bold text-xs">Professional</div>
                    <div className="h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center px-4 font-bold text-xs border border-slate-200">Casual</div>
                  </div>
                  
                  <div className="h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 text-sm mt-2 shadow-md">
                    <Sparkles size={16} /> Generate Caption
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <ol className="space-y-4">
              {[
                'Open the "Drafts" tab or start creating a new post.',
                'Click the "AI Copilot" button with the sparkle icon.',
                'Select the type of assistance: Generate Caption, Content Ideas, or Improve Text.',
                'Enter a topic or keywords, then select the tone.',
                'Click Generate and AI will provide several text options for you to use.'
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mt-0.5">{i+1}</div>
                  <p className="text-slate-700 text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'analytics',
      icon: <BarChart3 size={22} />,
      titleId: 'Pantau Analitik',
      titleEn: 'Monitor Analytics',
      descId: 'Lihat performa konten Anda.',
      descEn: 'Track your content performance.',
      contentId: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-4">6. Memantau Analitik</h2>
            <p className="text-lg text-slate-700">Lacak pertumbuhan audiens dan performa postingan Anda secara real-time melalui dashboard analitik.</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 flex items-center justify-center min-h-[300px]">
             {/* Visual mockup */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-5 w-full max-w-sm relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md z-10">6</div>
                
                <div className="flex justify-between items-center mb-1">
                  <div className="font-bold text-[#0B2A4A]">Overview Performa</div>
                  <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">Bulan Ini</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Total Reach</div>
                    <div className="text-xl font-black text-[#0B2A4A]">24.5K</div>
                    <div className="text-[10px] text-green-600 font-bold mt-1 flex items-center gap-1">↑ 12% vs last mo</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Engagement</div>
                    <div className="text-xl font-black text-[#0B2A4A]">8.2%</div>
                    <div className="text-[10px] text-green-600 font-bold mt-1 flex items-center gap-1">↑ 3.1% vs last mo</div>
                  </div>
                </div>
                
                <div className="h-24 bg-blue-50/50 border border-blue-100 rounded-xl relative overflow-hidden flex items-end">
                   {/* Mockup chart bars */}
                   <div className="w-full flex items-end justify-between px-4 pb-2 gap-2 h-full pt-4">
                     {[40, 70, 45, 90, 60, 80, 100].map((h, i) => (
                       <div key={i} className="w-full bg-blue-500 rounded-t-sm opacity-80" style={{height: `${h}%`}}></div>
                     ))}
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <ol className="space-y-4">
              {[
                'Pilih menu "Analitik" dari sidebar utama.',
                'Pilih rentang tanggal yang ingin Anda lihat datanya.',
                'Perhatikan grafik jangkauan (reach), interaksi (engagement), dan pertumbuhan pengikut (followers).',
                'Scroll ke bawah untuk melihat postingan dengan performa terbaik di bagian Top Posts.',
                'Gunakan data ini untuk mengevaluasi jenis konten apa yang paling disukai audiens Anda.'
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mt-0.5">{i+1}</div>
                  <p className="text-slate-700 text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-4">6. Monitoring Analytics</h2>
            <p className="text-lg text-slate-700">Track audience growth and your post performance in real-time through the analytics dashboard.</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 flex items-center justify-center min-h-[300px]">
             {/* Visual mockup */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-5 w-full max-w-sm relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md z-10">6</div>
                
                <div className="flex justify-between items-center mb-1">
                  <div className="font-bold text-[#0B2A4A]">Performance Overview</div>
                  <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">This Month</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Total Reach</div>
                    <div className="text-xl font-black text-[#0B2A4A]">24.5K</div>
                    <div className="text-[10px] text-green-600 font-bold mt-1 flex items-center gap-1">↑ 12% vs last mo</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Engagement</div>
                    <div className="text-xl font-black text-[#0B2A4A]">8.2%</div>
                    <div className="text-[10px] text-green-600 font-bold mt-1 flex items-center gap-1">↑ 3.1% vs last mo</div>
                  </div>
                </div>
                
                <div className="h-24 bg-blue-50/50 border border-blue-100 rounded-xl relative overflow-hidden flex items-end">
                   {/* Mockup chart bars */}
                   <div className="w-full flex items-end justify-between px-4 pb-2 gap-2 h-full pt-4">
                     {[40, 70, 45, 90, 60, 80, 100].map((h, i) => (
                       <div key={i} className="w-full bg-blue-500 rounded-t-sm opacity-80" style={{height: `${h}%`}}></div>
                     ))}
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <ol className="space-y-4">
              {[
                'Select the "Analytics" menu from the main sidebar.',
                'Choose the date range for the data you want to view.',
                'Observe the charts for reach, engagement, and follower growth.',
                'Scroll down to see your best performing posts in the Top Posts section.',
                'Use this data to evaluate what type of content your audience likes most.'
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mt-0.5">{i+1}</div>
                  <p className="text-slate-700 text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'billing',
      icon: <CreditCard size={22} />,
      titleId: 'Mengelola Langganan',
      titleEn: 'Managing Subscription',
      descId: 'Atur paket dan pembayaran.',
      descEn: 'Manage plans and billing.',
      contentId: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-4">7. Mengelola Langganan & Tagihan</h2>
            <p className="text-lg text-slate-700">Tingkatkan paket Anda ke Pro untuk membuka semua fitur canggih atau kelola metode pembayaran dengan mudah.</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 flex items-center justify-center min-h-[300px]">
             {/* Visual mockup */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-4 w-full max-w-sm relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md z-10">7</div>
                
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-[#0B2A4A]">Paket Saat Ini</div>
                  <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Starter</div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-[#0B2A4A] to-[#1a4a7a] rounded-xl text-white relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-10"><Zap size={80} /></div>
                  <div className="text-xs text-blue-200 mb-1">Tingkatkan ke</div>
                  <div className="text-xl font-bold flex items-center gap-2"><Sparkles size={18} className="text-yellow-400" /> Pro Plan</div>
                  <div className="text-xs text-blue-100 mt-2">Buka analitik tak terbatas & AI Copilot.</div>
                  <div className="mt-4 bg-white text-[#0B2A4A] text-xs font-bold text-center py-2 rounded-lg cursor-pointer">Upgrade Sekarang</div>
                </div>
                
                <div className="mt-2 space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase">Metode Pembayaran</div>
                  <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl">
                    <div className="w-10 h-6 bg-slate-100 rounded flex items-center justify-center"><CreditCard size={14} className="text-slate-500"/></div>
                    <div>
                      <div className="text-sm font-bold text-slate-700">•••• •••• •••• 4242</div>
                      <div className="text-xs text-slate-400">Kedaluwarsa 12/26</div>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <ol className="space-y-4">
              {[
                'Buka "Pengaturan Akun" dari menu profil di pojok kanan atas.',
                'Pilih tab "Tagihan & Paket".',
                'Untuk meningkatkan paket, klik tombol "Upgrade" pada paket yang diinginkan.',
                'Untuk memperbarui kartu kredit, klik "Edit Metode Pembayaran".',
                'Anda dapat melihat riwayat invoice pada bagian bawah halaman.'
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mt-0.5">{i+1}</div>
                  <p className="text-slate-700 text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-4">7. Managing Subscription & Billing</h2>
            <p className="text-lg text-slate-700">Upgrade your plan to Pro to unlock all advanced features or easily manage your payment methods.</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 flex items-center justify-center min-h-[300px]">
             {/* Visual mockup */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-4 w-full max-w-sm relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md z-10">7</div>
                
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-[#0B2A4A]">Current Plan</div>
                  <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Starter</div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-[#0B2A4A] to-[#1a4a7a] rounded-xl text-white relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-10"><Zap size={80} /></div>
                  <div className="text-xs text-blue-200 mb-1">Upgrade to</div>
                  <div className="text-xl font-bold flex items-center gap-2"><Sparkles size={18} className="text-yellow-400" /> Pro Plan</div>
                  <div className="text-xs text-blue-100 mt-2">Unlock unlimited analytics & AI Copilot.</div>
                  <div className="mt-4 bg-white text-[#0B2A4A] text-xs font-bold text-center py-2 rounded-lg cursor-pointer">Upgrade Now</div>
                </div>
                
                <div className="mt-2 space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase">Payment Method</div>
                  <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl">
                    <div className="w-10 h-6 bg-slate-100 rounded flex items-center justify-center"><CreditCard size={14} className="text-slate-500"/></div>
                    <div>
                      <div className="text-sm font-bold text-slate-700">•••• •••• •••• 4242</div>
                      <div className="text-xs text-slate-400">Expires 12/26</div>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <ol className="space-y-4">
              {[
                'Open "Account Settings" from the profile menu in the top right corner.',
                'Select the "Billing & Plans" tab.',
                'To upgrade your plan, click the "Upgrade" button on your desired plan.',
                'To update your credit card, click "Edit Payment Method".',
                'You can view your invoice history at the bottom of the page.'
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mt-0.5">{i+1}</div>
                  <p className="text-slate-700 text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'media-library',
      icon: <ImageIcon size={22} />,
      titleId: 'Manajemen Media Library',
      titleEn: 'Media Library Management',
      descId: 'Simpan aset foto dan video.',
      descEn: 'Store photo and video assets.',
      contentId: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-4">8. Manajemen Media Library</h2>
            <p className="text-lg text-slate-700">Simpan semua aset foto dan video Anda di satu tempat yang aman agar mudah diakses saat menjadwalkan konten.</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 flex items-center justify-center min-h-[300px]">
             {/* Visual mockup */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-4 w-full max-w-md relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md z-10">8</div>
                
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-[#0B2A4A]">Media Library</div>
                  <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Plus size={14} /> Unggah File</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="aspect-square bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center relative overflow-hidden group">
                    <ImageIcon className="text-slate-300" size={24} />
                    <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="aspect-square bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center relative overflow-hidden group">
                    <PlayCircle className="text-slate-300" size={24} />
                    <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="aspect-square bg-blue-50 border-2 border-blue-400 border-dashed rounded-xl flex flex-col items-center justify-center text-blue-500 cursor-pointer">
                    <Download size={20} className="mb-1" />
                    <span className="text-[10px] font-bold">Drop Here</span>
                  </div>
                </div>
                
                <div className="text-xs text-slate-500 mt-2">Penyimpanan Terpakai: 2.4 GB / 10 GB</div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[24%]"></div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <ol className="space-y-4">
              {[
                'Pilih menu "Media Library" di sidebar kiri.',
                'Klik tombol "Unggah File" atau cukup tarik (drag & drop) gambar/video Anda ke dalam area yang disediakan.',
                'Organisasikan file Anda ke dalam folder untuk memudahkan pencarian (tersedia untuk paket Pro).',
                'Anda juga bisa memilih file dari Media Library langsung saat membuat draft post di Social Studio.'
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mt-0.5">{i+1}</div>
                  <p className="text-slate-700 text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-4">8. Media Library Management</h2>
            <p className="text-lg text-slate-700">Keep all your photo and video assets in one secure place for easy access when scheduling content.</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 flex items-center justify-center min-h-[300px]">
             {/* Visual mockup */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-4 w-full max-w-md relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md z-10">8</div>
                
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-[#0B2A4A]">Media Library</div>
                  <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Plus size={14} /> Upload File</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="aspect-square bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center relative overflow-hidden group">
                    <ImageIcon className="text-slate-300" size={24} />
                    <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="aspect-square bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center relative overflow-hidden group">
                    <PlayCircle className="text-slate-300" size={24} />
                    <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="aspect-square bg-blue-50 border-2 border-blue-400 border-dashed rounded-xl flex flex-col items-center justify-center text-blue-500 cursor-pointer">
                    <Download size={20} className="mb-1" />
                    <span className="text-[10px] font-bold">Drop Here</span>
                  </div>
                </div>
                
                <div className="text-xs text-slate-500 mt-2">Storage Used: 2.4 GB / 10 GB</div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[24%]"></div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <ol className="space-y-4">
              {[
                'Select the "Media Library" menu on the left sidebar.',
                'Click "Upload File" or simply drag and drop your images/videos into the provided area.',
                'Organize your files into folders for easier searching (available on Pro plans).',
                'You can also select files from the Media Library directly when creating post drafts in Social Studio.'
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mt-0.5">{i+1}</div>
                  <p className="text-slate-700 text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'client-approval',
      icon: <Link2 size={22} />,
      titleId: 'Persetujuan Klien',
      titleEn: 'Client Approval',
      descId: 'Kirim link preview ke klien.',
      descEn: 'Send preview links to clients.',
      contentId: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-4">9. Persetujuan Klien (Client Approval)</h2>
            <p className="text-lg text-slate-700">Dapatkan persetujuan dari klien atau manajer dengan membagikan link preview rahasia tanpa perlu memberikan akses akun mereka.</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 flex items-center justify-center min-h-[300px]">
             {/* Visual mockup */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-4 w-full max-w-sm relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md z-10">9</div>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600"><CheckCircle2 size={18} /></div>
                  <div className="font-bold text-[#0B2A4A]">Share for Approval</div>
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-xs font-bold text-slate-500 mb-1">Status Konten</div>
                    <div className="flex gap-2 items-center">
                      <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                      <div className="text-sm font-semibold text-slate-700">Menunggu Persetujuan</div>
                    </div>
                  </div>
                  
                  <div className="text-xs font-bold text-slate-500 uppercase mt-2">Link Rahasia</div>
                  <div className="flex gap-2 items-center">
                    <div className="h-10 flex-1 bg-slate-50 rounded-lg border border-slate-200 flex items-center px-3 text-slate-400 text-xs truncate">
                      hubify.social/p/x89VbM
                    </div>
                    <div className="h-10 w-10 bg-[#0B2A4A] text-white rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-800 transition-colors">
                      <Link2 size={16} />
                    </div>
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <ol className="space-y-4">
              {[
                'Selesaikan draft konten Anda di Social Studio.',
                'Ubah status post dari "Draft" menjadi "Butuh Persetujuan" (Needs Approval).',
                'Klik tombol "Bagikan Link" untuk membuat tautan rahasia.',
                'Kirim link tersebut ke klien Anda. Mereka dapat melihat preview dan memberikan komentar tanpa harus login ke Hubify.',
                'Setelah disetujui, post akan otomatis masuk ke antrian publikasi sesuai jadwal.'
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mt-0.5">{i+1}</div>
                  <p className="text-slate-700 text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-4">9. Client Approval</h2>
            <p className="text-lg text-slate-700">Get approvals from clients or managers by sharing secret preview links without requiring them to log into Hubify.</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 flex items-center justify-center min-h-[300px]">
             {/* Visual mockup */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-4 w-full max-w-sm relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md z-10">9</div>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600"><CheckCircle2 size={18} /></div>
                  <div className="font-bold text-[#0B2A4A]">Share for Approval</div>
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-xs font-bold text-slate-500 mb-1">Content Status</div>
                    <div className="flex gap-2 items-center">
                      <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                      <div className="text-sm font-semibold text-slate-700">Needs Approval</div>
                    </div>
                  </div>
                  
                  <div className="text-xs font-bold text-slate-500 uppercase mt-2">Secret Link</div>
                  <div className="flex gap-2 items-center">
                    <div className="h-10 flex-1 bg-slate-50 rounded-lg border border-slate-200 flex items-center px-3 text-slate-400 text-xs truncate">
                      hubify.social/p/x89VbM
                    </div>
                    <div className="h-10 w-10 bg-[#0B2A4A] text-white rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-800 transition-colors">
                      <Link2 size={16} />
                    </div>
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <ol className="space-y-4">
              {[
                'Finish drafting your content in Social Studio.',
                'Change the post status from "Draft" to "Needs Approval".',
                'Click the "Share Link" button to generate a secret URL.',
                'Send the link to your client. They can view the preview and leave comments without logging in.',
                'Once approved, the post will automatically join the publishing queue according to its schedule.'
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mt-0.5">{i+1}</div>
                  <p className="text-slate-700 text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'export-reports',
      icon: <Download size={22} />,
      titleId: 'Export Laporan',
      titleEn: 'Export Reports',
      descId: 'Unduh laporan performa format PDF/CSV.',
      descEn: 'Download performance reports.',
      contentId: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-4">10. Export Laporan Analitik</h2>
            <p className="text-lg text-slate-700">Unduh data analitik Anda dalam format presentasi siap pakai atau file CSV untuk keperluan pelaporan akhir bulan.</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 flex items-center justify-center min-h-[300px]">
             {/* Visual mockup */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-4 w-full max-w-sm relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md z-10">10</div>
                
                <div className="font-bold text-[#0B2A4A] mb-2 flex items-center justify-between">
                  <span>Download Report</span>
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Download size={18} /></div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors">
                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-bold text-xs">PDF</div>
                    <div>
                      <div className="text-sm font-bold text-[#0B2A4A]">Laporan Presentasi</div>
                      <div className="text-xs text-slate-500">Berisi grafik & insight utama</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors">
                    <div className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold text-xs">CSV</div>
                    <div>
                      <div className="text-sm font-bold text-[#0B2A4A]">Data Mentah Excel</div>
                      <div className="text-xs text-slate-500">Semua metrik untuk diolah</div>
                    </div>
                  </div>
                </div>
                
                <button className="w-full mt-2 py-3 bg-[#0B2A4A] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-blue-800 transition-all">
                  Mulai Export
                </button>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <ol className="space-y-4">
              {[
                'Buka menu "Analitik" lalu pilih tab "Laporan".',
                'Atur rentang waktu untuk laporan Anda (misal: 1 Bulan Terakhir).',
                'Klik tombol "Export Report" di pojok kanan atas layar.',
                'Pilih format file yang diinginkan: PDF untuk dipresentasikan atau CSV untuk diolah lebih lanjut di Excel.',
                'Sistem akan memproses laporan Anda dan mengunduhnya secara otomatis dalam beberapa detik.'
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mt-0.5">{i+1}</div>
                  <p className="text-slate-700 text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-4">10. Exporting Reports</h2>
            <p className="text-lg text-slate-700">Download your analytics data in presentation-ready formats or CSV files for end-of-month reporting.</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50 flex items-center justify-center min-h-[300px]">
             {/* Visual mockup */}
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-4 w-full max-w-sm relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md z-10">10</div>
                
                <div className="font-bold text-[#0B2A4A] mb-2 flex items-center justify-between">
                  <span>Download Report</span>
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Download size={18} /></div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors">
                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-bold text-xs">PDF</div>
                    <div>
                      <div className="text-sm font-bold text-[#0B2A4A]">Presentation Report</div>
                      <div className="text-xs text-slate-500">Charts & key insights included</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors">
                    <div className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold text-xs">CSV</div>
                    <div>
                      <div className="text-sm font-bold text-[#0B2A4A]">Raw Excel Data</div>
                      <div className="text-xs text-slate-500">All metrics for custom processing</div>
                    </div>
                  </div>
                </div>
                
                <button className="w-full mt-2 py-3 bg-[#0B2A4A] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-blue-800 transition-all">
                  Start Export
                </button>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <ol className="space-y-4">
              {[
                'Open the "Analytics" menu and select the "Reports" tab.',
                'Set the date range for your report (e.g., Last 30 Days).',
                'Click the "Export Report" button in the top right corner of the screen.',
                'Choose the desired format: PDF for presentations or CSV for further processing in Excel.',
                'The system will process your report and download it automatically in a few seconds.'
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm mt-0.5">{i+1}</div>
                  <p className="text-slate-700 text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )
    }
  ];

  const activeGuide = guides.find(g => g.id === activeGuideId) || guides[0];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#2C2016] flex flex-col font-sans selection:bg-blue-500/30">
      <PublicHeader currentLang={lang} onLangChange={handleLangChange} />
      
      {/* Hero Section */}
      <div className="bg-[#0B2A4A] text-white pt-24 pb-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent blur-3xl"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md text-blue-300 font-medium text-sm mb-8 border border-white/10 shadow-xl">
            <BookOpen size={16} className="text-blue-400" /> {lang === 'id' ? 'Edukasi Hubify' : 'Hubify Education'}
          </motion.div>
          <motion.h1 initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
            {lang === 'id' ? 'Panduan Penggunaan' : 'User Guides'} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              {lang === 'id' ? 'Kuasai Hubify dalam Menit.' : 'Master Hubify in Minutes.'}
            </span>
          </motion.h1>
          <motion.p initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className="text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto font-light">
            {lang === 'id' ? 'Ikuti langkah-langkah interaktif ini untuk mulai memaksimalkan kehadiran sosial media Anda dengan AI.' : 'Follow these interactive steps to start maximizing your social media presence with AI.'}
          </motion.p>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 pb-24 w-full -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Guides Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-6">
            <motion.div 
              initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}}
              className="bg-white p-4 md:p-6 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-2"
            >
              <h3 className="text-lg font-bold text-[#0B2A4A] mb-2 px-3">{lang === 'id' ? 'Daftar Panduan' : 'Guide List'}</h3>
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                {guides.map((guide, idx) => (
                  <button
                    key={guide.id}
                    onClick={() => setActiveGuideId(guide.id)}
                    className={`flex items-center gap-4 px-4 lg:px-5 py-4 lg:py-5 rounded-2xl text-left transition-all duration-300 whitespace-nowrap lg:whitespace-normal w-auto lg:w-full shrink-0 group ${
                      activeGuideId === guide.id 
                        ? 'bg-[#0B2A4A] text-white shadow-md lg:scale-[1.02]' 
                        : 'bg-transparent text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-100'
                    }`}
                  >
                    <div className={`p-3 rounded-xl transition-colors shrink-0 ${activeGuideId === guide.id ? 'bg-white/20' : 'bg-slate-100 text-slate-400 group-hover:text-[#0B2A4A]'}`}>
                      {guide.icon}
                    </div>
                    <div>
                      <div className={`font-bold text-base mb-1 ${activeGuideId === guide.id ? 'text-white' : 'text-[#0B2A4A]'}`}>
                        {idx + 1}. {lang === 'id' ? guide.titleId : guide.titleEn}
                      </div>
                      <div className={`text-sm hidden lg:block ${activeGuideId === guide.id ? 'text-blue-200' : 'text-slate-400'}`}>
                        {lang === 'id' ? guide.descId : guide.descEn}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Guide Content */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden relative">
              
              {/* Header decoration inside content */}
              <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100 flex items-center px-10 relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10">
                  <PlayCircle size={150} className="-mt-10 -mr-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-[#0B2A4A] relative z-10 flex items-center gap-3">
                  <CheckCircle2 className="text-blue-500" />
                  {lang === 'id' ? 'Langkah Demi Langkah' : 'Step by Step'}
                </h3>
              </div>

              <div className="p-6 md:p-10 lg:p-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeGuideId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {lang === 'id' ? activeGuide.contentId : activeGuide.contentEn}
                  </motion.div>
                </AnimatePresence>
              </div>
              
            </div>
            
            <div className="mt-8 flex justify-end">
               {/* Next button logic if needed */}
               {guides.findIndex(g => g.id === activeGuideId) < guides.length - 1 && (
                  <button 
                    onClick={() => {
                      const nextIdx = guides.findIndex(g => g.id === activeGuideId) + 1;
                      setActiveGuideId(guides[nextIdx].id);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0B2A4A] border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    {lang === 'id' ? 'Langkah Selanjutnya' : 'Next Step'} <ArrowRight size={18} />
                  </button>
               )}
            </div>
          </div>
          
        </div>
      </main>
      <PublicFooter currentLang={lang} onLangChange={handleLangChange} />
    </div>
  );
}

export function AboutUs() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [lang, setLang] = useState<'id' | 'en'>(() => {
    return (localStorage.getItem('hubify_locale') as 'id' | 'en') || 'en';
  });

  const handleLangChange = (l: 'id' | 'en') => {
    setLang(l);
    localStorage.setItem('hubify_locale', l);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#2C2016] flex flex-col font-sans selection:bg-blue-500/30">
      <PublicHeader currentLang={lang} onLangChange={handleLangChange} />
      
      {/* Hero Section */}
      <div className="bg-[#0B2A4A] text-white pt-24 pb-32 px-6 relative overflow-hidden">
        {/* Immersive background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-b from-blue-500/20 to-transparent blur-[120px]"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-t from-indigo-500/20 to-transparent blur-[100px]"></div>
          
          {/* Abstract Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 mt-8 md:mt-16">
          <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md text-blue-300 font-medium text-sm mb-8 border border-white/10 shadow-xl">
            <Globe size={16} className="text-blue-400" /> {lang === 'id' ? 'Cerita Kami' : 'Our Story'}
          </motion.div>
          <motion.h1 initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
            {lang === 'id' ? 'Membangun Masa Depan' : 'Building the Future'} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              {lang === 'id' ? 'Manajemen Sosial Media' : 'of Social Media Management'}
            </span>
          </motion.h1>
          <motion.p initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className="text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto font-light leading-relaxed">
            {lang === 'id' ? 'Misi kami adalah menyederhanakan kompleksitas pengelolaan jejak digital, memberdayakan kreator dan brand untuk membangun komunitas yang lebih kuat dan bermakna.' : 'Our mission is to simplify the complexity of managing digital footprints, empowering creators and brands to build stronger, more meaningful communities.'}
          </motion.p>
        </div>
      </div>

      <main className="flex-1 w-full relative z-20 pb-24">
        
        {/* Core Vision - Negative Margin Overlap */}
        <div className="max-w-7xl mx-auto px-6 -mt-16">
          <motion.div 
            initial={{opacity:0, y:40}} animate={{opacity:1, y:0}} transition={{delay:0.3, duration: 0.6}}
            className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-slate-100 p-8 md:p-12 lg:p-16 relative overflow-hidden"
          >
            {/* Decorative background in card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
              <div className="space-y-6">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                  <Target size={28} />
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0B2A4A] leading-tight">
                  {lang === 'id' ? 'Berawal dari Sebuah Rasa Frustrasi' : 'Born from Frustration'}
                </h2>
                <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
                  <p>
                    {lang === 'id' ? 'Hubify Social lahir dari pengalaman nyata. Kami menyadari bahwa mengelola banyak akun media sosial secara bersamaan adalah tugas yang sangat kompleks dan rentan terhadap human error.' : 'Hubify Social was born from real experience. We realized that managing multiple social media accounts simultaneously is highly complex and prone to human error.'}
                  </p>
                  <p>
                    {lang === 'id' ? 'Tim marketing sering kali terjebak dalam rutinitas teknis yang melelahkan—memposting manual di akhir pekan, berpindah-pindah tab untuk memantau analitik, hingga kehabisan ide segar.' : 'Marketing teams often get bogged down in exhausting technical routines—posting manually on weekends, switching tabs to monitor analytics, and running out of fresh ideas.'}
                  </p>
                  <p className="font-semibold text-[#0B2A4A]">
                    {lang === 'id' ? 'Itulah sebabnya kami membangun Hubify. Satu markas cerdas untuk mengembalikan fokus Anda pada hal yang terpenting: Kreativitas.' : 'That is why we built Hubify. One smart hub to bring your focus back to what matters most: Creativity.'}
                  </p>
                </div>
              </div>
              
              {/* Abstract Visual / Collage */}
              <div className="relative">
                <div className="aspect-square max-w-md mx-auto relative">
                  {/* Central Hub */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-tr from-[#0B2A4A] to-blue-600 rounded-full flex items-center justify-center shadow-2xl z-20">
                    <Sparkles size={48} className="text-white" />
                  </div>
                  
                  {/* Orbits */}
                  <div className="absolute inset-4 rounded-full border border-slate-200 border-dashed animate-[spin_60s_linear_infinite]"></div>
                  <div className="absolute inset-16 rounded-full border border-slate-100 animate-[spin_40s_linear_infinite_reverse]"></div>
                  
                  {/* Orbiting Elements */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center text-pink-500 z-30 transform hover:scale-110 transition-transform">
                    <Instagram size={32} />
                  </div>
                  <div className="absolute bottom-1/4 right-0 translate-x-1/2 w-14 h-14 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center text-blue-400 z-30 transform hover:scale-110 transition-transform">
                    <Twitter size={28} />
                  </div>
                  <div className="absolute bottom-0 left-1/4 -translate-y-1/2 w-14 h-14 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center text-blue-700 z-30 transform hover:scale-110 transition-transform">
                    <Linkedin size={28} />
                  </div>
                  <div className="absolute top-1/4 left-0 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-blue-100 flex items-center justify-center text-blue-600 z-30 transform hover:scale-110 transition-transform">
                    <BarChart3 size={32} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Why Hubify - Bento Box Style */}
        <div className="max-w-7xl mx-auto px-6 mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B2A4A] mb-4">
              {lang === 'id' ? 'Filosofi Produk Kami' : 'Our Product Philosophy'}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {lang === 'id' ? 'Setiap fitur yang kami rancang berpusat pada efisiensi dan kolaborasi.' : 'Every feature we design is centered around efficiency and collaboration.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-8 rounded-3xl border border-blue-100/50 md:col-span-2 group hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Coffee size={24} />
              </div>
              <h3 className="text-2xl font-bold text-[#0B2A4A] mb-3">{lang === 'id' ? 'Efisiensi Tanpa Kompromi' : 'Uncompromising Efficiency'}</h3>
              <p className="text-slate-600 text-lg">
                {lang === 'id' ? 'Otomatisasi bukan berarti kehilangan sentuhan personal. Kami mendesain sistem penjadwalan pintar yang menghemat waktu berjam-jam setiap minggunya, sehingga Anda bisa menikmati kopi pagi Anda dengan tenang sambil melihat konten Anda terpublikasi tepat waktu.' : 'Automation doesn’t mean losing the personal touch. We designed a smart scheduling system that saves you hours every week, so you can enjoy your morning coffee peacefully while your content gets published on time.'}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-300 group hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#0B2A4A] mb-3">{lang === 'id' ? 'AI Sebagai Partner' : 'AI as a Partner'}</h3>
              <p className="text-slate-600">
                {lang === 'id' ? 'Kami tidak menggantikan posisi Anda. AI Copilot kami hadir sebagai asisten cerdas yang selalu siap memecahkan writer\'s block kapanpun Anda membutuhkannya.' : 'We don’t replace you. Our AI Copilot serves as a smart assistant always ready to cure your writer\'s block whenever you need it.'}
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-300 group hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#0B2A4A] mb-3">{lang === 'id' ? 'Kolaborasi Mulus' : 'Seamless Collaboration'}</h3>
              <p className="text-slate-600">
                {lang === 'id' ? 'Mulai dari draf pertama hingga persetujuan klien, semuanya terjadi dalam satu ruang kerja. Tidak ada lagi revisi yang hilang di email.' : 'From the first draft to client approval, everything happens in one workspace. No more revisions lost in email threads.'}
              </p>
            </div>

            <div className="bg-[#0B2A4A] text-white p-8 rounded-3xl border border-blue-800 shadow-sm md:col-span-2 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-400/30 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-blue-300 mb-6 backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-3">{lang === 'id' ? 'Keputusan Berbasis Data' : 'Data-Driven Decisions'}</h3>
                <p className="text-blue-100 text-lg max-w-xl">
                  {lang === 'id' ? 'Berhenti menebak-nebak apa yang disukai audiens Anda. Kami mengubah angka rumit menjadi insight visual yang jelas dan dapat langsung ditindaklanjuti.' : 'Stop guessing what your audience likes. We turn complex numbers into clear, actionable visual insights.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust & Security */}
        <div className="max-w-7xl mx-auto px-6 mt-24">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 lg:p-16 text-center">
            <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-12">
              {lang === 'id' ? 'Keamanan Sepelas Standar Enterprise' : 'Enterprise-Grade Security'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 border border-blue-100">
                  <Lock size={32} />
                </div>
                <h4 className="font-bold text-[#0B2A4A] text-lg mb-2">{lang === 'id' ? 'Enkripsi End-to-End' : 'End-to-End Encryption'}</h4>
                <p className="text-slate-500 text-sm">{lang === 'id' ? 'Kredensial dan data token Anda dienkripsi dengan standar industri tertinggi.' : 'Your credentials and token data are encrypted using the highest industry standards.'}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 border border-blue-100">
                  <Shield size={32} />
                </div>
                <h4 className="font-bold text-[#0B2A4A] text-lg mb-2">{lang === 'id' ? 'Resmi & Sesuai Kebijakan' : 'Official & Compliant'}</h4>
                <p className="text-slate-500 text-sm">{lang === 'id' ? 'Kami menggunakan API resmi yang mematuhi pedoman keamanan setiap platform sosial.' : 'We use official APIs that comply with the security guidelines of every social platform.'}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 border border-blue-100">
                  <Server size={32} />
                </div>
                <h4 className="font-bold text-[#0B2A4A] text-lg mb-2">{lang === 'id' ? '99.9% Uptime' : '99.9% Uptime'}</h4>
                <p className="text-slate-500 text-sm">{lang === 'id' ? 'Infrastruktur cloud kami dirancang untuk reliabilitas tinggi memastikan post Anda selalu tayang.' : 'Our cloud infrastructure is designed for high reliability, ensuring your posts always go live.'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Card */}
        <div className="max-w-4xl mx-auto px-6 mt-24">
          <div className="bg-gradient-to-r from-[#0B2A4A] to-indigo-900 rounded-[2rem] p-1 shadow-2xl">
            <div className="bg-white rounded-[1.8rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <div className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-2">{lang === 'id' ? 'Dikembangkan Oleh' : 'Developed By'}</div>
                <h3 className="text-2xl font-extrabold text-[#0B2A4A] mb-2">PT Harapan Untuk Bangsa</h3>
                <p className="text-slate-500 flex items-center gap-2">
                  <Globe size={16} /> Jakarta, Indonesia
                </p>
              </div>
              <div className="shrink-0">
                <a 
                  href="mailto:support@hubifysocial.com" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#0B2A4A] text-white rounded-xl font-bold hover:bg-blue-800 transition-all shadow-md hover:shadow-xl hover:-translate-y-1"
                >
                  <Mail size={18} /> {lang === 'id' ? 'Hubungi Tim Kami' : 'Contact Our Team'}
                </a>
              </div>
            </div>
          </div>
        </div>

      </main>
      <PublicFooter currentLang={lang} onLangChange={handleLangChange} />
    </div>
  );
}

export function RefundPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [lang, setLang] = useState<'id' | 'en'>(() => {
    return (localStorage.getItem('hubify_locale') as 'id' | 'en') || 'en';
  });

  const handleLangChange = (l: 'id' | 'en') => {
    setLang(l);
    localStorage.setItem('hubify_locale', l);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#2C2016] flex flex-col font-sans">
      <PublicHeader currentLang={lang} onLangChange={handleLangChange} />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        {lang === 'id' ? (
          <>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#0B2A4A] mb-8">Kebijakan Pengembalian Dana</h1>
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed mb-12 space-y-6">
              <p className="font-medium text-slate-500">Terakhir Diperbarui: Juni 2026</p>
              
              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">1. Kebijakan Umum</h2>
              <p>Hubify Social menyediakan layanan perangkat lunak berbasis langganan (SaaS). Kami berkomitmen untuk memberikan layanan terbaik. Sebelum memutuskan berlangganan, kami sarankan Anda memanfaatkan masa uji coba gratis (free trial) yang kami sediakan untuk memastikan layanan kami sesuai dengan kebutuhan Anda.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">2. Ketentuan Pengembalian Dana</h2>
              <p>Secara umum, semua pembayaran yang telah diproses bersifat final dan tidak dapat dikembalikan (non-refundable). Namun, pengembalian dana dapat dipertimbangkan dalam kondisi berikut:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Terjadi kesalahan sistem (bug/error) dari pihak Hubify Social yang menyebabkan pengguna tidak dapat mengakses layanan sama sekali selama lebih dari 3 (tiga) hari berturut-turut, dan tim teknis kami gagal memperbaikinya.</li>
                <li>Terjadi penagihan ganda (double billing) akibat kesalahan pada sistem pembayaran kami atau penyedia layanan pembayaran.</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">3. Proses Pengajuan Pengembalian Dana</h2>
              <p>Jika Anda memenuhi syarat di atas, Anda dapat mengajukan permintaan pengembalian dana dalam waktu maksimal 7 (tujuh) hari kalender sejak tanggal transaksi.</p>
              <p>Langkah-langkah pengajuan:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Kirimkan email ke <strong>support@hubifysocial.com</strong> dengan subjek "Permintaan Refund - [Alamat Email Akun Anda]".</li>
                <li>Sertakan bukti transaksi/invoice, kronologi kejadian, dan bukti pendukung (screenshot/rekaman layar).</li>
                <li>Tim kami akan meninjau pengajuan Anda dalam waktu 3-5 hari kerja.</li>
              </ol>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">4. Metode dan Waktu Pengembalian Dana</h2>
              <p>Jika permohonan pengembalian dana disetujui, dana akan dikembalikan ke metode pembayaran awal yang Anda gunakan. Proses pengembalian dana akan memakan waktu 7 hingga 14 hari kerja, tergantung pada kebijakan bank atau penyedia layanan pembayaran Anda.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">5. Pembatalan Langganan</h2>
              <p>Anda dapat membatalkan langganan kapan saja melalui menu pengaturan akun Anda. Pembatalan hanya akan menghentikan tagihan untuk siklus berikutnya, dan Anda tetap dapat mengakses layanan hingga akhir periode tagihan yang telah dibayar.</p>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#0B2A4A] mb-8">Refund Policy</h1>
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed mb-12 space-y-6">
              <p className="font-medium text-slate-500">Last Updated: June 2026</p>
              
              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">1. General Policy</h2>
              <p>Hubify Social provides a subscription-based software service (SaaS). We are committed to providing the best service. Before deciding to subscribe, we recommend taking advantage of our free trial to ensure our service meets your needs.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">2. Refund Conditions</h2>
              <p>In general, all processed payments are final and non-refundable. However, refunds may be considered under the following conditions:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>A system error (bug) on the part of Hubify Social causes the user to be unable to access the service entirely for more than 3 (three) consecutive days, and our technical team fails to resolve it.</li>
                <li>A double billing occurs due to an error in our payment system or the payment service provider.</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">3. Refund Request Process</h2>
              <p>If you meet the above conditions, you may submit a refund request within a maximum of 7 (seven) calendar days from the transaction date.</p>
              <p>Steps to request:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Send an email to <strong>support@hubifysocial.com</strong> with the subject "Refund Request - [Your Account Email Address]".</li>
                <li>Include proof of transaction/invoice, a chronology of the incident, and supporting evidence (screenshots/screen recordings).</li>
                <li>Our team will review your request within 3-5 business days.</li>
              </ol>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">4. Refund Method and Timeframe</h2>
              <p>If the refund request is approved, the funds will be returned to your original payment method. The refund process may take 7 to 14 business days, depending on your bank's or payment service provider's policy.</p>

              <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">5. Subscription Cancellation</h2>
              <p>You may cancel your subscription at any time through your account settings menu. Cancellation will only stop billing for the next cycle, and you will retain access to the service until the end of your paid billing period.</p>
            </div>
          </>
        )}
      </main>
      <PublicFooter currentLang={lang} onLangChange={handleLangChange} />
    </div>
  );
}


