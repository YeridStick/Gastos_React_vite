import { useEffect } from "react";

export default function Toast({ toast, setToast }) {
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', type: 'info' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show, setToast]);

  if (!toast.show) return null;

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
      toast.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
      'bg-blue-100 text-blue-800 border border-blue-200'
    }`}>
      <div className="flex items-center">
        {toast.type === 'success' && (
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <span className="text-sm font-medium">{toast.message}</span>
        <button
          onClick={() => setToast({ show: false, message: '', type: 'info' })}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
    </div>
  );
}