import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/category/TheLoaiAdd.module.css";

const TheLoaiAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [prefix, setPrefix] = useState<"TL" | "FB">("TL");

  const [formData, setFormData] = useState({
    tenTheLoai: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePrefixChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPrefix(e.target.value as "TL" | "FB");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      // send tenTheLoai in body and prefix as query param; backend will generate maTheLoai
      await axios.post(`/api/theloai?prefix=${prefix}`, {
        tenTheLoai: formData.tenTheLoai,
      });

      alert("Thêm thể loại thành công!");
      navigate("/admin/theloai");
    } catch (error) {
      console.error("Lỗi khi thêm thể loại:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        alert(`Có lỗi xảy ra: ${errorMessage}`);
      } else {
        alert("Có lỗi xảy ra khi thêm thể loại!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["add-theloai"]}>
      <h2>🏷️ Thêm Thể Loại Mới</h2>

      <form onSubmit={handleSubmit} className={styles["add-theloai-form"]}>
        <div className={styles["form-container"]}>
          {/* Form chính */}
          <div className={styles["form-main"]}>
            <div className={styles["form-row"]}>
              <div className={styles["form-group"]}>
                <label htmlFor="loai">Loại</label>
                <select
                  id="loai"
                  name="loai"
                  value={prefix}
                  onChange={handlePrefixChange}
                  style={{ padding: 10, borderRadius: 8 }}
                >
                  <option value="TL">Trong nước (TL)</option>
                  <option value="FB">Ngoài nước (FB)</option>
                </select>
              </div>

              <div className={styles["form-group"]}>
                <label htmlFor="tenTheLoai">Tên thể loại</label>
                <input
                  type="text"
                  id="tenTheLoai"
                  name="tenTheLoai"
                  value={formData.tenTheLoai}
                  onChange={handleInputChange}
                  required
                  maxLength={30}
                  placeholder="Nhập tên thể loại"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form actions */}
        <div className={styles["form-actions"]}>
          <button
            type="button"
            onClick={() => navigate("/admin/theloai")}
            className={styles["cancel-btn"]}
          >
            ✖ Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className={styles["submit-btn"]}
          >
            {loading ? "⏳ Đang thêm..." : "✓ Thêm thể loại"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TheLoaiAdd;
