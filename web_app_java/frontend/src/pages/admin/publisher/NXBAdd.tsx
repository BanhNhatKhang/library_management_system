import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../css/admins/publisher/NXBAdd.css";

const NXBAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    maNhaXuatBan: "",
    tenNhaXuatBan: "",
    diaChi: "",
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
      await axios.post("/api/nhaxuatban", formData);

      alert("Thêm nhà xuất bản thành công!");
      navigate("/admin/nxb");
    } catch (error) {
      console.error("Lỗi khi thêm nhà xuất bản:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        alert(`Có lỗi xảy ra: ${errorMessage}`);
      } else {
        alert("Có lỗi xảy ra khi thêm nhà xuất bản!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-nxb">
      <h2>🏢 Thêm Nhà Xuất Bản Mới</h2>

      <form onSubmit={handleSubmit} className="add-nxb-form">
        <div className="form-container">
          {/* Form chính */}
          <div className="form-main">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="maNhaXuatBan">Mã nhà xuất bản</label>
                <input
                  type="text"
                  id="maNhaXuatBan"
                  name="maNhaXuatBan"
                  value={formData.maNhaXuatBan}
                  onChange={handleInputChange}
                  required
                  maxLength={30}
                  placeholder="Nhập mã nhà xuất bản"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tenNhaXuatBan">Tên nhà xuất bản</label>
                <input
                  type="text"
                  id="tenNhaXuatBan"
                  name="tenNhaXuatBan"
                  value={formData.tenNhaXuatBan}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                  placeholder="Nhập tên nhà xuất bản"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="diaChi">Địa chỉ</label>
                <input
                  type="text"
                  id="diaChi"
                  name="diaChi"
                  value={formData.diaChi}
                  onChange={handleInputChange}
                  required
                  maxLength={200}
                  placeholder="Nhập địa chỉ nhà xuất bản"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/admin/nxb")}
            className="cancel-btn"
          >
            ✖ Hủy
          </button>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "⏳ Đang thêm..." : "✓ Thêm nhà xuất bản"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NXBAdd;
