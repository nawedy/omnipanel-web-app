import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-lg">Page not found</p>
        <p className="mt-4">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-8">
          <Link href="/" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md">
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
