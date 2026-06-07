import React from 'react';
import { useNavigate } from 'react-router-dom';

const PublicHeader = () => {
  const navigate = useNavigate();
  return (
    <header className="bg-white border-b border-black/5 py-4 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center">
            <img src="/icon.png" alt="Hubify" className="w-full h-full object-cover scale-110" onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; e.currentTarget.parentElement!.nextElementSibling!.style.display = 'flex' }} />
          </div>
          <div className="hidden w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1D4D7A] to-[#0B2A4A] items-center justify-center text-white font-bold">H</div>
          <div className="font-extrabold text-xl tracking-tight text-[#0B2A4A]">Hubify</div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login', { state: { mode: 'login' }})} className="text-sm font-bold text-[#1D4D7A] hover:text-[#0B2A4A] transition-colors">Masuk</button>
          <button onClick={() => navigate('/login', { state: { mode: 'signup' }})} className="bg-[#1D4D7A] text-white text-sm font-bold py-2.5 px-5 rounded-full hover:bg-[#0B2A4A] transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#1D4D7A]/20">Mulai Gratis</button>
        </div>
      </div>
    </header>
  );
};

const PublicFooter = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-black text-white py-12 px-6 text-sm text-center">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-extrabold text-xl tracking-tight">Hubify</div>
        <div className="text-slate-400">&copy; 2026 Hubify. All rights reserved.</div>
        <div className="flex gap-6">
          <button onClick={() => navigate('/privacy')} className="text-slate-400 hover:text-white transition-colors">Privacy Policy</button>
          <button onClick={() => navigate('/terms')} className="text-slate-400 hover:text-white transition-colors">Terms of Service</button>
        </div>
      </div>
    </footer>
  );
};

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#2C2016] flex flex-col font-sans">
      <PublicHeader />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#0B2A4A] mb-8">Terms of Service</h1>
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed mb-12 space-y-6">
          <p className="font-medium text-slate-500">Terakhir Diperbarui: Juni 2026</p>
          
          <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">1. Penerimaan Syarat</h2>
          <p>Dengan membuat akun dan menggunakan layanan Hubify ("Layanan"), Anda menyetujui semua persyaratan yang tercantum dalam Terms of Service ini. Jika Anda tidak setuju, mohon untuk tidak menggunakan layanan kami.</p>

          <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">2. Deskripsi Layanan</h2>
          <p>Hubify adalah platform manajemen media sosial komprehensif yang menyediakan fitur kalender multi-view, asisten AI (Artificial Intelligence) untuk copywriting dan ideasi, integrasi platform, dan fitur analitik terkait kinerja konten.</p>
          
          <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">3. Penggunaan Platform dan Akun</h2>
          <p>Anda bertanggung jawab penuh atas segala aktivitas yang terjadi di bawah akun Anda. Anda juga wajib memastikan keamanan kredensial akun dan tidak menyalahgunakan platform untuk tujuan yang melanggar hukum, mendistribusikan spam, atau merugikan pihak lain. Segala kerugian yang timbul akibat kelalaian Anda menjadi tanggung jawab Anda sendiri.</p>

          <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">4. Penggunaan AI Copilot</h2>
          <p>Layanan kami mencakup fitur berbasis AI (AI Copilot) yang menghasilkan ide konten, caption, atau teks lainnya. Output yang dihasilkan berdasarkan model pihak ketiga (misalnya OpenAI, Google AI). Pengguna menyadari bahwa output AI mungkin terkadang tidak akurat atau memerlukan tinjauan manusia. Pengguna bertanggung jawab penuh atas semua konten yang akhirnya mereka siarkan atau publikasikan.</p>

          <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">5. Kebijakan Berlangganan & Pembayaran</h2>
          <p>Hubify menawarkan paket gratis (Trial) dan paket berbayar bulanan serta tahunan. Layanan akan otomatis berlanjut mengikuti siklus berlangganan yang Anda pilih kecuali jika Anda membatalkannya sebelum tanggal jatuh tempo berikutnya. Hubify tidak melayani pengembalian dana prorata apabila Anda membatalkan di tengah periode aktif berlangganan.</p>

          <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">6. Pemutusan Layanan</h2>
          <p>Kami berhak memblokir, menangguhkan, maupun menghapus akun pengguna tanpa pemberitahuan sebelumnya jika terindikasi adanya pelanggaran yang membahayakan reputasi atau infrastruktur Hubify, termasuk melakukan tindakan scraping tidak wajar atau pelanggaran sistematis dari Aturan Layanan ini.</p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#2C2016] flex flex-col font-sans">
      <PublicHeader />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#0B2A4A] mb-8">Privacy Policy</h1>
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed mb-12 space-y-6">
          <p className="font-medium text-slate-500">Terakhir Diperbarui: Juni 2026</p>

          <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">Pengumpulan Data</h2>
          <p>Dalam menjalankan Hubify, kami mengumpulkan berbagai informasi. Mulai dari data pribadi (nama, alamat email, dsb) saat Anda melakukan registrasi, hingga data metrik analitik aplikasi (seperti IP Address, jenis perangkat, dan penggunaan layanan kami) secara otomatis menggunakan cookies maupun mekanisme tracking lainnya.</p>

          <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">Penggunaan Fitur AI & Riwayat Konten</h2>
          <p>Ketika Anda memasukkan tulisan, brief, ide, atau menggunakan fitur AI Copilot di Hubify, kami menyimpannya sesuai dengan kebutuhan layanan guna memfasilitasi sinkronisasi di workspace Anda. Konten ini diproses oleh partner penyedia layanan Artificial Intelligence kami dengan jaminan komitmen agar data tidak disalahgunakan untuk tujuan yang melanggar hukum.</p>
          
          <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">Penggunaan Data Media Sosial</h2>
          <p>Dalam mengelola analitik, Hubify menghubungkan API pihak ketiga (misalnya Facebook, Instagram, Twitter/X). Kami mengadopsi standar OAuth dan akan hanya memperoleh akses atas metrik "views/likes/comments" maupun penerbitan konten. Token akses selalu dienkripsi dan kami patuh mengelola data Anda mengikuti pedoman platform bersangkutan.</p>

          <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">Keamanan Data</h2>
          <p>Seluruh basis data Hubify diamankan menggunakan standar industri yang layak dengan enkripsi yang andal pada database sistem kami, termasuk Firebase & Cloud SQL. Namun, tidak ada pengiriman elektronik melalui internet yang 100% aman, oleh karena itu kami tidak berani memberikan jaminan perlindungan secara multak. Harap laporkan jika Anda melihat ada kelainan interaksi aplikasi.</p>

          <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">Pihak Ketiga & Pemrosesan Pembayaran</h2>
          <p>Data pembayaran Anda diproses oleh provider eksternal kami (payment gateway) dengan standar keamanan PCI-DSS, sehingga pihak internal Hubify tidak pernah menyimpan informasi atau nomor kartu kredit utuh Anda langsung di dalam basis data hubify secara terbuka. Hanya ada beberapa token validasi yang ditautkan untuk validasi layanan aktif.</p>

          <h2 className="text-2xl font-bold text-[#0B2A4A] mt-8 mb-4">Perubahan Kebijakan</h2>
          <p>Privacy Policy (Kebijakan Privasi) bisa kami rubah secara sepihak sewaktu-waktu sesuai penyesuaian layanan terbaru. Kami akan mengusahakan sebaik mungkin untuk memberitahukan update ini, baik itu di dalam aplikasi maupun lewat notifikasi Email ke member yang tercatat.</p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
