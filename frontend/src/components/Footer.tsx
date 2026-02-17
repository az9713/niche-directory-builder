import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="mb-6 md:mb-0">
            <Link href="/" className="text-lg font-bold text-gray-900">
              PawPatrol<span className="text-emerald-600"> Groomers</span>
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              Find trusted mobile pet grooming services near you.
            </p>
          </div>
          <nav className="flex gap-6">
            <Link
              href="/"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              Home
            </Link>
            <Link
              href="/groomers"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              Find a Groomer
            </Link>
          </nav>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-sm text-gray-400">
          &copy; 2026 PawPatrol Groomers. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
