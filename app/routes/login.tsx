const LoginPage = () => {
  return (
    <div className="max-w-lg mx-auto w-full px-4 mt-20">
      <p>Login</p>
      <form action="" className="space-y-3 mt-5">
        <input
          className="px-2 py-1 rounded block w-full"
          placeholder="username"
          type="text"
        />
        <input
          className="px-2 py-1 rounded block w-full"
          placeholder="password"
          type="password"
        />
        <button
          className="bg-zinc-100 text-zinc-600 text-base font-medium rounded px-3 py-1 w-full"
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
