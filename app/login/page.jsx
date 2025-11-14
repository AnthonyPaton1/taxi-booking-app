// app/login/page.jsx
import { Suspense } from 'react';
import LoginForm from '@/components/forms/LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto mt-20 p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}