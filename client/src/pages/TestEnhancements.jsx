import React from 'react';
import toast from '../utils/toast';
import { SkeletonList, SkeletonProductGrid, SkeletonStats } from '../components/ui/SkeletonLoader';

const TestEnhancements = () => {
  const testToasts = () => {
    toast.success('This is a success message!');
    setTimeout(() => toast.error('This is an error message!'), 500);
    setTimeout(() => toast.info('This is an info message!'), 1000);
    setTimeout(() => toast.warning('This is a warning message!'), 1500);
  };

  const testPromiseToast = () => {
    const fakeApiCall = new Promise((resolve) => {
      setTimeout(() => resolve('Data loaded!'), 2000);
    });

    toast.promise(fakeApiCall, {
      loading: 'Loading data...',
      success: 'Data loaded successfully!',
      error: 'Failed to load data'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Enhancement Tests</h1>

      {/* Toast Tests */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Toast Notifications</h2>
        <div className="space-x-4">
          <button
            onClick={testToasts}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Test All Toasts
          </button>
          <button
            onClick={testPromiseToast}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Test Promise Toast
          </button>
        </div>
      </section>

      {/* Skeleton Loaders */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Skeleton Loaders</h2>
        
        <h3 className="text-xl font-semibold mb-3">Stats Skeleton</h3>
        <SkeletonStats />

        <h3 className="text-xl font-semibold mb-3 mt-8">List Skeleton</h3>
        <SkeletonList count={3} />

        <h3 className="text-xl font-semibold mb-3 mt-8">Product Grid Skeleton</h3>
        <SkeletonProductGrid count={6} />
      </section>

      {/* Security Info */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Security Features (Backend)</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              <span>Rate Limiting: Auth endpoints limited to 5 attempts per 15 min</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              <span>Helmet Security Headers: XSS, Clickjacking protection</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              <span>Input Validation: All forms validated with express-validator</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              <span>Compression: Response size reduced by ~70%</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              <span>Request Size Limits: 10MB max payload</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Validation Test */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Form Validation</h2>
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
          <form onSubmit={(e) => {
            e.preventDefault();
            toast.success('Form submitted successfully!');
          }}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Enter valid email"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                minLength={6}
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Min 6 chars, uppercase, lowercase, number"
              />
              <p className="text-sm text-gray-500 mt-1">
                Must contain uppercase, lowercase, and number
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Test Validation
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default TestEnhancements;
