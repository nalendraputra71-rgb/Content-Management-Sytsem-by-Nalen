import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { auth } from './firebase';
import { 
  verifyPasswordResetCode, 
  confirmPasswordReset, 
  applyActionCode, 
  checkActionCode 
} from 'firebase/auth';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function AuthActionScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Try to get params from searchParams first, then fallback to window.location.search
  // This helps when using HashRouter and Firebase puts params before the hash
  const getParam = (key: string) => {
    let val = searchParams.get(key);
    if (!val) {
      const urlParams = new URLSearchParams(window.location.search);
      val = urlParams.get(key);
    }
    return val;
  };

  const mode = getParam('mode');
  const oobCode = getParam('oobCode');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!mode || !oobCode) {
      setStatus('error');
      setMessage('Link tidak valid atau telah kedaluwarsa. Pastikan Anda menyalin URL lengkap dari email Anda.');
      return;
    }

    const handleAction = async () => {
      try {
        switch (mode) {
          case 'resetPassword':
            // Verify the code and get the user's email
            const resetEmail = await verifyPasswordResetCode(auth, oobCode);
            setEmail(resetEmail);
            setStatus('idle'); // Ready for user to enter new password
            break;
          case 'recoverEmail':
            // Check code to get the restored email
            const actionInfo = await checkActionCode(auth, oobCode);
            const restoredEmail = actionInfo.data.email;
            if (restoredEmail) {
                setEmail(restoredEmail);
            }
            await applyActionCode(auth, oobCode);
            setStatus('success');
            setMessage(`Email Anda telah berhasil dipulihkan menjadi ${restoredEmail || 'email sebelumnya'}.`);
            break;
          case 'verifyEmail':
            await applyActionCode(auth, oobCode);
            setStatus('success');
            setMessage('Email Anda berhasil diverifikasi! Sekarang Anda dapat login menggunakan email ini.');
            break;
          default:
            setStatus('error');
            setMessage('Tindakan tidak dikenal.');
        }
      } catch (error: any) {
        console.error('Action error:', error);
        setStatus('error');
        setMessage(error.message || 'Terjadi kesalahan saat memproses permintaan Anda. Link mungkin sudah kedaluwarsa atau telah digunakan.');
      }
    };

    handleAction();
  }, [mode, oobCode]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Password tidak cocok.');
      return;
    }
    if (newPassword.length < 6) {
      setStatus('error');
      setMessage('Password harus terdiri dari minimal 6 karakter.');
      return;
    }
    if (!oobCode) return;

    setStatus('loading');
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus('success');
      setMessage('Password Anda telah berhasil direset. Silakan login dengan password baru Anda.');
    } catch (error: any) {
      console.error('Reset error:', error);
      setStatus('error');
      setMessage(error.message || 'Gagal mereset password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4 font-sans text-[#111827]">
      <div className="w-full max-w-md shadow-sm border border-[rgba(0,0,0,0.05)] bg-white rounded-xl overflow-hidden flex flex-col">
        <div className="text-center space-y-2 p-8 pb-4">
          {mode === 'resetPassword' && <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>}
          {mode === 'verifyEmail' && <h1 className="text-2xl font-bold tracking-tight">Verifikasi Email</h1>}
          {mode === 'recoverEmail' && <h1 className="text-2xl font-bold tracking-tight">Pemulihan Email</h1>}
          {(!mode || !['resetPassword', 'verifyEmail', 'recoverEmail'].includes(mode)) && (
            <h1 className="text-2xl font-bold tracking-tight">Autentikasi</h1>
          )}
          {email && mode === 'resetPassword' && status === 'idle' && (
            <p className="text-gray-500 font-medium text-sm">
              Buat password baru untuk {email}
            </p>
          )}
        </div>
        
        <div className="flex flex-col gap-4 p-8 pt-0 flex-grow">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--theme-primary, #3b82f6)' }} />
              <p className="text-sm font-medium">Memproses permintaan Anda...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <XCircle className="w-12 h-12 text-red-500" />
              <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-md border border-red-100 w-full font-medium">
                {message}
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="text-sm text-green-700 bg-green-50 px-4 py-3 rounded-md border border-green-100 w-full font-medium">
                {message}
              </p>
            </div>
          )}

          {status === 'idle' && mode === 'resetPassword' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2 flex flex-col">
                <label htmlFor="new-password" className="font-medium text-sm">Password Baru</label>
                <input
                  id="new-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[rgba(0,0,0,0.03)] border-transparent hover:bg-[rgba(0,0,0,0.05)] focus:bg-white focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)] transition-all px-3 py-2 rounded-md outline-none"
                />
              </div>
              <div className="space-y-2 flex flex-col">
                <label htmlFor="confirm-password" className="font-medium text-sm">Konfirmasi Password Baru</label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[rgba(0,0,0,0.03)] border-transparent hover:bg-[rgba(0,0,0,0.05)] focus:bg-white focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary)] transition-all px-3 py-2 rounded-md outline-none"
                />
              </div>
              <button 
                type="submit" 
                className="w-full text-white mt-2 font-bold py-3 rounded-lg transition-all shadow-sm hover:shadow-md"
                style={{ backgroundColor: 'var(--theme-primary, #3b82f6)' }}
              >
                Simpan Password Baru
              </button>
            </form>
          )}
        </div>

        <div className="flex flex-col border-t border-[rgba(0,0,0,0.05)] p-6 space-y-4">
          <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-[#111827] transition-colors w-full text-center block">
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    </div>
  );
}
