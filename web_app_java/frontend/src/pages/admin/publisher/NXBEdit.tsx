import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import "../../../css/admins/publisher/NXBEdit.css";

interface NhaXuatBan {
  maNhaXuatBan: string;
  tenNhaXuatBan: string;
  diaChi: string;
}

const NXBEdit = () => {
  const navigate = useNavigate();
  const { maNhaXuatBan } = useParams<{ maNhaXuatBan: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState({
    maNhaXuatBan: "",
    tenNhaXuatBan: "",
    diaChi: "",
  });

  useEffect(() => {
    if (!maNhaXuatBan) {
      setError("Mã nhà xuất bản không hợp lệ");
      setLoadingData(false);
      return;
    }

    // Load dữ liệu nhà xuất bản
    axios
      .get(`/api/nhaxuatban/${maNhaXuatBan}`)
      .then((res) => {
        const nxbData: NhaXuatBan = res.data;
        setFormData({
          maNhaXuatBan: nxbData.maNhaXuatBan,
          tenNhaXuatBan: nxbData.tenNhaXuatBan,
          diaChi: nxbData.diaChi,
        });
      })
      .catch((error) => {
        console.error("Lỗi khi tải dữ liệu:", error);
        setError("Không thể tải thông tin nhà xuất bản");
      })
      .finally(() => {
        setLoadingData(false);
      });
  }, [maNhaXuatBan]);

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
      await axios.put(`/api/nhaxuatban/${maNhaXuatBan}`, {
        tenNhaXuatBan: formData.tenNhaXuatBan,
        diaChi: formData.diaChi,
      });

      alert("Cập nhật nhà xuất bản thành công!");
      navigate("/admin/nxb");
    } catch (error) {
      console.error("Lỗi khi cập nhật nhà xuất bản:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        alert(`Có lỗi xảy ra: ${errorMessage}`);
      } else {
        alert("Có lỗi xảy ra khi cập nhật nhà xuất bản!");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="edit-nxb">
        <div className="loading">⏳ Đang tải thông tin nhà xuất bản...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-nxb">
        <Link to="/admin/nxb" className="back-link">
          ← Quay lại danh sách
        </Link>
        <div className="error">❌ {error}</div>
      </div>
    );
  }

  return (
    <div className="edit-nxb">
      <Link to="/admin/nxb" className="back-link">
        ← Quay lại danh sách
      </Link>

      <h2>✏️ Chỉnh Sửa Nhà Xuất Bản</h2>

      <form onSubmit={handleSubmit} className="edit-nxb-form">
        <div className="form-container">
          <div className="form-main">
            <div className="form-row">
              <div className="form-group readonly">
                <label htmlFor="maNhaXuatBan">Mã nhà xuất bản</label>
                <input
                  type="text"
                  id="maNhaXuatBan"
                  name="maNhaXuatBan"
                  value={formData.maNhaXuatBan}
                  readOnly
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
            {loading ? "⏳ Đang cập nhật..." : "✓ Cập nhật"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NXBEdit;
