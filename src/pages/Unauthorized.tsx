const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl">
          !
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Access Denied
        </h1>

        <p className="mt-2 text-slate-600">
          You don't have permission to access this page.
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;