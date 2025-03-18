import { useState, useEffect, createContext, useContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Check auth status when component mounts
  useEffect(() => {
    checkAuth();
  }, []);

  // 🔹 Login function
  const login = async (email: string, password: string) => {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", // 🔥 Sends cookies with request
    });

    if (res.ok) {
      await checkAuth(); // Refresh user state
      return true;
    }
    return false;
  };

  // 🔹 Check authentication (gets user from backend)
  const checkAuth = async () => {
    const res = await fetch("/me", {
      method: "GET",
      credentials: "include", // 🔥 Sends cookies to backend
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  // 🔹 Logout function (clears cookie)
  const logout = async () => {
    await fetch("/logout", { method: "POST", credentials: "include" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🔹 Custom hook for easy access
export const useAuth = () => useContext(AuthContext);
