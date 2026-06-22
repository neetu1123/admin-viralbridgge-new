import { Suspense } from 'react';
import SignUpLoginClient from './components/SignUpLoginClient';

export default function SignUpLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>}>
      <SignUpLoginClient />
    </Suspense>
  );
}