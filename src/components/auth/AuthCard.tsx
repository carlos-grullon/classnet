'use client';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  error?: string;
  success?: string;
}

export function AuthCard({ children, title, error, success }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <div 
        className="max-w-md w-full rounded-xl p-8" 
        style={{ 
          background: 'var(--background-soft)', 
          border: '1px solid var(--border-default)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)'
        }}
      >
        <h2 
          className="text-2xl font-bold text-center mb-8" 
          style={{ 
            color: 'var(--foreground)',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}
        >
          {title}
        </h2>

        {success && (
          <div className="mb-4 p-4 rounded-lg text-sm flex items-center" style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            color: '#16a34a'
          }}>
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 rounded-lg text-sm flex items-center" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#dc2626'
          }}>
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
