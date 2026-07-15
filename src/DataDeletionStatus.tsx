import { useI18n } from "./i18n";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export function DataDeletionStatus() {
  const { lang } = useI18n();
  const [code, setCode] = useState("");

  useEffect(() => {
    // HashRouter might put query string after the hash, e.g. #/data-deletion-status?code=123
    const hashSplit = window.location.hash.split("?");
    if (hashSplit.length > 1) {
      const params = new URLSearchParams(hashSplit[1]);
      setCode(params.get("code") || "");
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="p-8 max-w-md w-full bg-white border rounded-2xl shadow-sm text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Status Penghapusan Data</h1>
        <p className="text-gray-600 mb-6 text-sm">
          Permintaan penghapusan data Anda telah kami terima dan sedang diproses.
        </p>
        <div className="bg-gray-50 p-4 rounded-xl border mb-6 text-left">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Kode Konfirmasi</p>
          <p className="font-mono font-medium text-lg text-gray-900">{code || (lang === "id" ? "Tidak ada kode" : "No code")}</p>
        </div>
        <p className="text-xs text-gray-500 mb-8">
          Data yang berkaitan dengan akun Facebook/Meta Anda akan dihapus sepenuhnya dari sistem kami sesuai dengan kebijakan privasi.
        </p>
        <Link 
          to="/"
          className="inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-white bg-[var(--theme-primary)] hover:bg-blue-600 transition-colors rounded-lg"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
