import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import "../../../css/admins/category/TheLoaiEdit.css";

interface TheLoai {
  maTheLoai: string;
  tenTheLoai: string;
}

const TheLoaiEdit = () => {
  const navigate = useNavigate();
  const { maTheLoai } = useParams<{ maTheLoai: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState({
    maTheLoai: "",
    tenTheLoai: "",
  });

  useEffect(() => {
    if (!maTheLoai) {
      setError("Mã thể loại không hợp lệ");
      setLoadingData(false);
      return;
    }

    // Load dữ liệu thể loại
    axios
      .get(`/api/theloai/${maTheLoai}`)
      .then((res) => {
        const theLoaiData: TheLoai = res.data;
        setFormData({
          maTheLoai: theLoaiData.maTheLoai,
          tenTheLoai: theLoaiData.tenTheLoai,
        });
      })
      .catch((error) => {
        console.error("Lỗi khi tải dữ liệu:", error);
        setError("Không thể tải thông tin thể loại");
      })
      .finally(() => {
        setLoadingData(false);
      });
  }, [maTheLoai]);

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
      await axios.put(`/api/theloai/${maTheLoai}`, {
        tenTheLoai: formData.tenTheLoai,
      });

      alert("Cập nhật thể loại thành công!");
      navigate("/admin/theloai");
    } catch (error) {
      console.error("Lỗi khi cập nhật thể loại:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        alert(`Có lỗi xảy ra: ${errorMessage}`);
      } else {
        alert("Có lỗi xảy ra khi cập nhật thể loại!");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="edit-theloai">
        <div className="loading">⏳ Đang tải thông tin thể loại...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-theloai">
        <Link to="/admin/theloai" className="back-link">
          ← Quay lại danh sách
        </Link>
        <div className="error">❌ {error}</div>
      </div>
    );
  }

  return (
    <div className="edit-theloai">
      <Link to="/admin/theloai" className="back-link">
        ← Quay lại danh sách
      </Link>

      <h2>✏️ Chỉnh Sửa Thể Loại</h2>

      <form onSubmit={handleSubmit} className="edit-theloai-form">
        <div className="form-container">
          <div className="form-main">
            <div className="form-row">
              <div className="form-group readonly">
                <label htmlFor="maTheLoai">Mã thể loại</label>
                <input
                  type="text"
                  id="maTheLoai"
                  name="maTheLoai"
                  value={formData.maTheLoai}
                  readOnly
                  placeholder="Mã thể loại không thể thay đổi"
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
            {loading ? "⏳ Đang cập nhật..." : "💾 Cập nhật thể loại"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TheLoaiEdit;
