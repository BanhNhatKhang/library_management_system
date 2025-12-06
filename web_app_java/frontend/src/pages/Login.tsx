import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import styles from "../css/Login.module.css";

interface JwtResponse {
  token: string;
  role: string;
  name: string;
  trangThai?: string;
}

const Login = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setRole, setName } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post<JwtResponse>("/api/xacthuc/dangnhap", {
        emailOrDienThoai: emailOrPhone,
        matKhau: password,
      });

      const data = response.data;

      // Kiểm tra trạng thái tài khoản
      if (data.role === "DOCGIA") {
        if (data.trangThai === "CAM") {
          setError("Tài khoản của bạn đã bị cấm.");
          setLoading(false);
          return;
        }
      }

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("trangThai", data.trangThai ?? "");

      if (
        data.role === "ADMIN" ||
        data.role === "NHANVIEN" ||
        data.role === "THUTHU" ||
        data.role === "QUANLY"
      ) {
        setRole(data.role);
        localStorage.setItem("role", data.role);
        localStorage.setItem("name", data.name);
        setName(data.name); // Thêm dòng này
        navigate("/admin/dashboard");
      } else {
        setRole("DOCGIA");
        localStorage.setItem("role", data.role);
        localStorage.setItem("userName", data.name);
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Tài khoản hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["login-container"]}>
      <div className={styles["login-card"]}>
        {/* Logo */}
        <div className={styles["login-logo"]}>
          <svg
            height="48"
            aria-hidden="true"
            viewBox="0 0 16 16"
            version="1.1"
            width="48"
            data-view-component="true"
          >
            <path d="M8 0c4.42 0 8 3.58 8 8 0 3.54-2.29 6.53-5.47 7.59-.4-.07-.55-.17-.55-.38 0-.19.01-.82.01-1.49 2.01.37 2.53-.49 2.69-.94.09-.23.48-.94.82-1.13.28-.15.68-.52-.01-.53-.63-.01-1.08.58-1.23.82-.72 1.21-1.87.87-2.33.66-.07-.52-.28-.87-.51-1.07 1.78-.2 3.64-.89 3.64-3.95 0-.87-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.21-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.21.73.90.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.31-.55.38C2.29 14.53 0 11.54 0 8c0-4.42 3.58-8 8-8Z"></path>
          </svg>
        </div>

        {/* Tiêu đề */}
        <h1 className={styles["login-title"]}>Đăng nhập vào BookShare</h1>

        {/* Form */}
        <form className={styles["login-form"]} onSubmit={handleLogin}>
          <div className={styles["form-group"]}>
            <label htmlFor="login_field">Email hoặc số điện thoại</label>
            <input
              type="text"
              id="login_field"
              className={styles["form-control"]}
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className={styles["form-group"]}>
            <div className={styles["password-label"]}>
              <label htmlFor="password">Mật khẩu</label>
              <a href="/forgot-password" className={styles["forgot-link"]}>
                Quên mật khẩu?
              </a>
            </div>
            <input
              type="password"
              id="password"
              className={styles["form-control"]}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className={styles["error-message"]}>{error}</div>}

          <button
            type="submit"
            className={styles["btn-primary"]}
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className={styles["divider"]}>
          <span>hoặc</span>
        </div>

        {/* Google Login */}
        <button className={styles["btn-google"]} type="button">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Tiếp tục với Google
        </button>

        {/* Footer */}
        <div className={styles["login-footer"]}>
          <p>
            Mới với BookShare?{" "}
            <a href="/register" className={styles["register-link"]}>
              Tạo tài khoản
            </a>
          </p>
        </div>
      </div>

      {/* Footer links */}
      <div className={styles["page-footer"]}>
        <a href="/terms">Điều khoản</a>
        <a href="/privacy">Quyền riêng tư</a>
        <a href="/contact">Liên hệ hỗ trợ</a>
        <a href="/cookies">Quản lý cookies</a>
      </div>
    </div>
  );
};

export default Login;
