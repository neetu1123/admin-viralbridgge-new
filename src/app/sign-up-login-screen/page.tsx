import React from 'react';
import AuthFlow from './components/AuthFlow';

export default function SignUpLoginPage() {
  return (
    <div className="min-h-screen bg-[#F8F7FC] flex items-center justify-center p-4">
      <AuthFlow />
    </div>
  );
}