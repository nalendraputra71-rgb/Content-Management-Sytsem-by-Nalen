import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const PublicHeader = ({ currentLang, onLangChange }: { currentLang?: 'id' | 'en', onLangChange?: (l: 'id' | 'en') => void }) => {
  const navigate = useNavigate();
  return (
    <header className="bg-white border-b border-black/5 py-4 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center">
            <img src="/icon.png" alt="Hubify Social" className="w-full h-full object-cover scale-110" onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; e.currentTarget.parentElement!.nextElementSibling!.style.display = 'flex' }} />
          </div>
          <div className="hidden w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1D4D7A] to-[#0B2A4A] items-center justify-center text-white font-bold">H</div>
          <div className="font-extrabold text-xl tracking-tight text-[#0B2A4A]">Hubify Social</div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          {onLangChange && currentLang && (
            <div className="flex bg-slate-100 p-1.5 rounded-full items-center border border-slate-200">
              <button 
                onClick={() => onLangChange('id')} 
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${currentLang === 'id' ? 'bg-[#1D4D7A] text-white shadow' : 'text-slate-600 hover:text-slate-900 bg-transparent'}`}
              >
                ID
              </button>
              <button 
                onClick={() => onLangChange('en')} 
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${currentLang === 'en' ? 'bg-[#1D4D7A] text-white shadow' : 'text-slate-600 hover:text-slate-900 bg-transparent'}`}
              >
                EN
              </button>
            </div>
          )}
          <button onClick={() => navigate('/login', { state: { mode: 'login' }})} className="text-sm font-bold text-[#1D4D7A] hover:text-[#0B2A4A] transition-colors">Masuk</button>
          <button onClick={() => navigate('/login', { state: { mode: 'signup' }})} className="bg-[#1D4D7A] text-white text-sm font-bold py-2.5 px-5 rounded-full hover:bg-[#0B2A4A] transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#1D4D7A]/20">Mulai Gratis</button>
        </div>
      </div>
    </header>
  );
};

const PublicFooter = ({ currentLang, onLangChange }: { currentLang?: 'id' | 'en', onLangChange?: (l: 'id' | 'en') => void }) => {
  const navigate = useNavigate();
  return (
    <footer className="bg-black text-white py-12 px-6 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="font-extrabold text-xl tracking-tight">Hubify Social</div>
          {onLangChange && currentLang && (
            <div className="flex bg-neutral-800 p-1 rounded-full items-center border border-neutral-700">
              <button 
                onClick={() => onLangChange('id')} 
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${currentLang === 'id' ? 'bg-white text-black shadow' : 'text-slate-400 hover:text-white bg-transparent'}`}
              >
                ID (Bahasa Indonesia)
              </button>
              <button 
                onClick={() => onLangChange('en')} 
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${currentLang === 'en' ? 'bg-white text-black shadow' : 'text-slate-400 hover:text-white bg-transparent'}`}
              >
                EN (English)
              </button>
            </div>
          )}
        </div>
        <div className="text-slate-400">&copy; 2026 Hubify Social. All rights reserved.</div>
        <div className="flex gap-6">
          <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">{currentLang === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}</Link>
          <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">{currentLang === 'id' ? 'Syarat & Ketentuan' : 'Terms of Service'}</Link>
        </div>
      </div>
    </footer>
  );
};

export function TermsOfService() {
  const [lang, setLang] = useState<'id' | 'en'>(() => {
    return (localStorage.getItem('hubify_locale') as 'id' | 'en') || 'id';
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
              <p className="uppercase text-xs font-bold text-slate-800 bg-slate-100 p-4 border-l-4 border-slate-400 rounded-r-lg my-4">
                LAYANAN DIMAKSUD DISEDIAKAN DALAM KONDISI &quot;SEBAGAIMANA ADANYA&quot; (AS IS) DAN &quot;SEBAGAIMANA TERSEDIA&quot; (AS AVAILABLE). HUBIFY SOCIAL MENOLAK SEMUA JAMINAN BAIK TERSURAT MAUPUN TERSIRAT, TERMASUK PULA JAMINAN KELAYAKAN DAGANG ATAU KETEPATAN TUJUAN KHUSUS. DALAM KEADAAN APA PUN, HUBIFY SOCIAL TIDAK BERTANGGUNG JAWAB ATAS SEGALA KERUGIAN TIDAK LANGSUNG, INSIDENTAL, KHUSUS, ATAU KONSEKUENSIAL, TERMASUK NAMUN TIDAK TERBATAS PADA HILANGNYA LABA, DATA, ATAU CITRA BAIK, YANG TIMBUL DARI ATAU SEHUBUNGAN DENGAN PENGGUNAAN ATAU KETIDAKMAMPUAN MENGGUNAKAN LAYANAN.
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
              <p className="uppercase text-xs font-bold text-slate-800 bg-slate-100 p-4 border-l-4 border-slate-400 rounded-r-lg my-4 font-mono">
                THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS. HUBIFY SOCIAL DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR OBJECTIVE. IN NO EVENT SHALL HUBIFY SOCIAL BE SUBJECT TO LIABILITY FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES INCLUDING BUT NOT LIMITED TO LOSS OF REVENUES, DATA ASSETS, OR COOPERATIVE BRAND INTEGRITY ARISING DIRECTLY OR INDIRECTLY FROM SERVICE INABILITY.
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
  const [lang, setLang] = useState<'id' | 'en'>(() => {
    return (localStorage.getItem('hubify_locale') as 'id' | 'en') || 'id';
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


