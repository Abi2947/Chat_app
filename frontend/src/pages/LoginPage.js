// frontend/src/pages/LoginPage.js
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false); // ← NEW STATE
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    if (user) navigate("/chat", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || "+977 98xxxxxxxx",
          address: form.address.trim() || "Kathmandu, Nepal",
        });
        setError("Account created! Please log in.");
        setIsLogin(true);
        setForm({
          ...form,
          password: "",
          phone: "",
          address: "",
          firstName: "",
          lastName: "",
          username: "",
        });
      }
    } catch (err) {
      console.error("Error:", err.response?.data);
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-purple-600 via-pink-500 to-red-500"
      } flex items-center justify-center p-4 relative`}
    >
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-6 right-6 z-50 p-4 bg-white/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-full text-white shadow-2xl hover:scale-110 transition-all duration-300"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM12 18.75a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V19.5a.75.75 0 01.75-.75zM12 7.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0112 7.5zM5.25 12a.75.75 0 01-.75.75H2.25a.75.75 0 011.5 0h2.25A.75.75 0 015.25 12zM18.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zM6.75 5.25a.75.75 0 011.5 0l1.5 1.5a.75.75 0 11-1.06 1.06l-1.5-1.5a.75.75 0 010-1.06zM17.25 18.75a.75.75 0 011.5 0l1.5 1.5a.75.75 0 11-1.06 1.06l-1.5-1.5a.75.75 0 010-1.06zM6.75 18.75a.75.75 0 011.5 0l1.5 1.5a.75.75 0 11-1.06 1.06l-1.5-1.5a.75.75 0 010-1.06zM17.25 5.25a.75.75 0 011.5 0l1.5 1.5a.75.75 0 11-1.06 1.06l-1.5-1.5a.75.75 0 010-1.06z" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.75 12.75c0 5.385-4.365 9.75-9.75 9.75-2.25 0-4.313-.75-5.963-2a.752.752 0 01-.337-1.012.752.752 0 011.012-.337c1.35.675 2.888 1.05 4.538 1.05 4.418 0 8.25-3.582 8.25-8 0-1.65-.375-3.188-1.05-4.538a.752.752 0 011.012-.337.752.752 0 01.337 1.012c1.25 1.65 2 3.713 2 5.962z" />
          </svg>
        )}
      </button>

      <div className="w-full max-w-md">
        <div
          className={`${
            darkMode ? "bg-gray-800/90 border border-gray-700" : "bg-white/95"
          } backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20`}
        >
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white text-5xl font-black shadow-2xl">
              F
            </div>
            <h1
              className={`text-5xl font-bold mt-6 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Fan Chat
            </h1>
            <p
              className={`mt-3 text-xl ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {isLogin ? "Welcome back" : "Join us today"}
            </p>
          </div>

          {error && (
            <div
              className={`p-4 rounded-2xl text-center font-bold mb-6 ${
                error.includes("created")
                  ? "bg-green-600/20 text-green-400"
                  : "bg-red-600/20 text-red-400"
              }`}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    required={!isLogin}
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                    className={`px-5 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 ${
                      darkMode ? "bg-gray-700 text-white" : "bg-gray-50"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    required={!isLogin}
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                    className={`px-5 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 ${
                      darkMode ? "bg-gray-700 text-white" : "bg-gray-50"
                    }`}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  required={!isLogin}
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  className={`w-full px-5 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 ${
                    darkMode ? "bg-gray-700 text-white" : "bg-gray-50"
                  }`}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  required={!isLogin}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={`w-full px-5 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 ${
                    darkMode ? "bg-gray-700 text-white" : "bg-gray-50"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Address"
                  required={!isLogin}
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className={`w-full px-5 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 ${
                    darkMode ? "bg-gray-700 text-white" : "bg-gray-50"
                  }`}
                />
              </>
            )}

            <input
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full px-5 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 ${
                darkMode ? "bg-gray-700 text-white" : "bg-gray-50"
              }`}
            />

            {/* PASSWORD FIELD WITH SHOW/HIDE TOGGLE */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`w-full px-5 py-4 pr-14 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 ${
                  darkMode ? "bg-gray-700 text-white" : "bg-gray-50"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-purple-600 transition"
              >
                {showPassword ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xl py-5 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-xl"
            >
              {isLogin ? "LOGIN" : "CREATE ACCOUNT"}
            </button>
          </form>

          <div className="text-center mt-8">
            <p
              className={`${
                darkMode ? "text-gray-400" : "text-gray-700"
              } text-lg`}
            >
              {isLogin ? "New here?" : "Already have an account?"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setShowPassword(false); // reset eye when switching
                }}
                className="ml-2 font-bold text-purple-400 hover:underline"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>

          <p
            className={`text-center mt-10 ${
              darkMode ? "text-gray-500" : "text-gray-500"
            }`}
          >
            © 2025 Fan Chat
          </p>
        </div>
      </div>
    </div>
  );
}
