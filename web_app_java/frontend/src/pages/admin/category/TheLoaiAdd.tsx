import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../css/admins/category/TheLoaiAdd.css";

const TheLoaiAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    maTheLoai: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await axios.post("/api/theloai", formData);

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
    <div className="add-theloai">
      <h2>🏷️ Thêm Thể Loại Mới</h2>

      <form onSubmit={handleSubmit} className="add-theloai-form">
        <div className="form-container">
          {/* Form chính */}
          <div className="form-main">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="maTheLoai">Mã thể loại</label>
                <input
                  type="text"
                  id="maTheLoai"
                  name="maTheLoai"
                  value={formData.maTheLoai}
                  onChange={handleInputChange}
                  required
                  maxLength={30}
                  placeholder="Nhập mã thể loại"
                />
              </div>

              <div className="form-group">
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
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/admin/theloai")}
            className="cancel-btn"
          >
            ✖ Hủy
          </button>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "⏳ Đang thêm..." : "✓ Thêm thể loại"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TheLoaiAdd;
