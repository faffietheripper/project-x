export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Page not found</h1>

        <p className="text-gray-500">
          The page you're looking for doesn't exist.
        </p>
      </div>
    </div>
  );
}
