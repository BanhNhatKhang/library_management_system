import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import styles from "../../css/Login.module.css";

const Register = () => {
  const [formData, setFormData] = useState({
    hoLot: "",
    ten: "",
    gioiTinh: "",
    ngaySinh: "",
    diaChi: "",
    dienThoai: "",
    email: "",
    matKhau: "",
    xacNhanMatKhau: "",
  });

  const [errors, setErrors] = useState<string[] | null>(null);
  const [success, setSuccess] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);
    setSuccess([]);

    if (formData.matKhau !== formData.xacNhanMatKhau) {
      setErrors(["Mật khẩu xác nhận không khớp."]);
      return;
    }

    setLoading(true);

    try {
      await axios.post("/api/xacthuc/dangky", {
        hoLot: formData.hoLot,
        ten: formData.ten,
        gioiTinh: formData.gioiTinh,
        ngaySinh: formData.ngaySinh,
        diaChi: formData.diaChi,
        dienThoai: formData.dienThoai,
        email: formData.email,
        matKhau: formData.matKhau,
        vaiTro: "DOCGIA",
      });

      setSuccess(["Đăng ký thành công! Vui lòng đăng nhập."]);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;

      if (
        axiosError.response?.data &&
        Array.isArray(axiosError.response.data)
      ) {
        setErrors(axiosError.response.data);
      } else {
        setErrors(["Đăng ký thất bại. Vui lòng thử lại."]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["login-container"]}>
      <div className={styles["register-card"]}>
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
        <h1 className={styles["login-title"]}>Tạo tài khoản BookShare</h1>

        {/* Form */}
        <form className={styles["register-form"]} onSubmit={handleRegister}>
          {/* Họ lót - Tên */}
          <div className={styles["form-row"]}>
            <div className={styles["form-group"]}>
              <label htmlFor="hoLot">Họ lót</label>
              <input
                type="text"
                id="hoLot"
                name="hoLot"
                className={styles["form-control"]}
                value={formData.hoLot}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles["form-group"]}>
              <label htmlFor="ten">Tên</label>
              <input
                type="text"
                id="ten"
                name="ten"
                className={styles["form-control"]}
                value={formData.ten}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Giới tính - Ngày sinh */}
          <div className={styles["form-row"]}>
            <div className={styles["form-group"]}>
              <label htmlFor="gioiTinh">Giới tính</label>
              <select
                id="gioiTinh"
                name="gioiTinh"
                className={styles["form-control"]}
                value={formData.gioiTinh}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="NAM">Nam</option>
                <option value="NU">Nữ</option>
                <option value="KHAC">Khác</option>
              </select>
            </div>
            <div className={styles["form-group"]}>
              <label htmlFor="ngaySinh">Ngày sinh</label>
              <input
                type="date"
                id="ngaySinh"
                name="ngaySinh"
                className={styles["form-control"]}
                value={formData.ngaySinh}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email - Điện thoại */}
          <div className={styles["form-row"]}>
            <div className={styles["form-group"]}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className={styles["form-control"]}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles["form-group"]}>
              <label htmlFor="dienThoai">Điện thoại</label>
              <input
                type="text"
                id="dienThoai"
                name="dienThoai"
                className={styles["form-control"]}
                value={formData.dienThoai}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Địa chỉ */}
          <div className={styles["form-group"]}>
            <label htmlFor="diaChi">Địa chỉ</label>
            <input
              type="text"
              id="diaChi"
              name="diaChi"
              className={styles["form-control"]}
              value={formData.diaChi}
              onChange={handleChange}
              required
            />
          </div>

          {/* Mật khẩu - Xác nhận mật khẩu */}
          <div className={styles["form-row"]}>
            <div className={styles["form-group"]}>
              <label htmlFor="matKhau">Mật khẩu</label>
              <input
                type="password"
                id="matKhau"
                name="matKhau"
                className={styles["form-control"]}
                value={formData.matKhau}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles["form-group"]}>
              <label htmlFor="xacNhanMatKhau">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="xacNhanMatKhau"
                name="xacNhanMatKhau"
                className={styles["form-control"]}
                value={formData.xacNhanMatKhau}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Messages */}
          {errors && (
            <div className={styles["error-message"]}>
              {errors.map((err, idx) => (
                <div key={idx}>{err}</div>
              ))}
            </div>
          )}

          {success.length > 0 && (
            <div className={styles["success-message"]}>
              {success.map((msg, idx) => (
                <div key={idx}>{msg}</div>
              ))}
            </div>
          )}

          <button
            type="submit"
            className={styles["btn-primary"]}
            disabled={loading}
          >
            {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </button>
        </form>

        {/* Footer */}
        <div className={styles["login-footer"]}>
          <p>
            Đã có tài khoản?{" "}
            <a href="/login" className={styles["register-link"]}>
              Đăng nhập
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

export default Register;
