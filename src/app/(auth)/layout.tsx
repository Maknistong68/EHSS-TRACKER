export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            EHSS Tracker
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Construction EHSS Management System
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
