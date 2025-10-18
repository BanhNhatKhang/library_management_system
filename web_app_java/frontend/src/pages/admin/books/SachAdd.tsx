import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../css/admins/books/SachAdd.css";

interface TheLoai {
  maTheLoai: string;
  tenTheLoai: string;
}

interface NhaXuatBan {
  maNhaXuatBan: string;
  tenNhaXuatBan: string;
}

const SachAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [theLoais, setTheLoais] = useState<TheLoai[]>([]);
  const [nhaXuatBans, setNhaXuatBans] = useState<NhaXuatBan[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");

  const [formData, setFormData] = useState({
    maSach: "",
    tenSach: "",
    soQuyen: 1,
    donGia: "",
    soLuong: 0,
    namXuatBan: "",
    tacGia: "",
    moTa: "",
    nhaXuatBan: "",
    theLoais: [] as string[],
  });

  useEffect(() => {
    // Load thể loại và nhà xuất bản
    Promise.all([axios.get("/api/theloai"), axios.get("/api/nhaxuatban")])
      .then(([theLoaiRes, nxbRes]) => {
        setTheLoais(theLoaiRes.data);
        setNhaXuatBans(nxbRes.data);
      })
      .catch((error) => {
        console.error("Lỗi khi tải dữ liệu:", error);
      });
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTheLoaiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({
      ...prev,
      theLoais: selectedOptions,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Vui lòng chọn ảnh bìa!");
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();

      // Thêm dữ liệu sách
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "theLoais") {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, value.toString());
        }
      });

      // Thêm file ảnh
      submitData.append("anhBia", selectedFile);

      await axios.post("/api/sach", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Thêm sách thành công!");
      navigate("/admin/sach");
    } catch (error) {
      console.error("Lỗi khi thêm sách:", error);
      alert("Có lỗi xảy ra khi thêm sách!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-sach">
      <h2>📚 Thêm Sách Mới</h2>

      <form onSubmit={handleSubmit} className="add-sach-form">
        <div className="form-container">
          {/* Cột trái - Thông tin chính */}
          <div className="form-left">
            {/* Dòng 1: Mã sách, Tên sách, Tác giả, Nhà xuất bản */}
            <div className="form-row-1">
              <div className="form-group">
                <label htmlFor="maSach">Mã sách</label>
                <input
                  type="text"
                  id="maSach"
                  name="maSach"
                  value={formData.maSach}
                  onChange={handleInputChange}
                  required
                  maxLength={30}
                  placeholder="Nhập mã sách"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tenSach">Tên sách</label>
                <input
                  type="text"
                  id="tenSach"
                  name="tenSach"
                  value={formData.tenSach}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                  placeholder="Nhập tên sách"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tacGia">Tác giả</label>
                <input
                  type="text"
                  id="tacGia"
                  name="tacGia"
                  value={formData.tacGia}
                  onChange={handleInputChange}
                  required
                  maxLength={25}
                  placeholder="Nhập tên tác giả"
                />
              </div>

              <div className="form-group">
                <label htmlFor="nhaXuatBan">Nhà xuất bản</label>
                <select
                  id="nhaXuatBan"
                  name="nhaXuatBan"
                  value={formData.nhaXuatBan}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn nhà xuất bản</option>
                  {nhaXuatBans.map((nxb) => (
                    <option key={nxb.maNhaXuatBan} value={nxb.maNhaXuatBan}>
                      {nxb.tenNhaXuatBan}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dòng 2: Đơn giá, Số quyển, Số lượng, Năm xuất bản */}
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="donGia">Đơn giá (VNĐ)</label>
                <input
                  type="number"
                  id="donGia"
                  name="donGia"
                  value={formData.donGia}
                  onChange={handleInputChange}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="soQuyen">Số quyển</label>
                <input
                  type="number"
                  id="soQuyen"
                  name="soQuyen"
                  value={formData.soQuyen}
                  onChange={handleInputChange}
                  required
                  min="1"
                  placeholder="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="soLuong">Số lượng</label>
                <input
                  type="number"
                  id="soLuong"
                  name="soLuong"
                  value={formData.soLuong}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="namXuatBan">Năm xuất bản</label>
                <input
                  type="date"
                  id="namXuatBan"
                  name="namXuatBan"
                  value={formData.namXuatBan}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Dòng 3: Thể loại và Mô tả */}
            <div className="form-row-3">
              {/* Thể loại */}
              <div className="form-group">
                <label htmlFor="theLoais">Thể loại</label>
                <select
                  id="theLoais"
                  name="theLoais"
                  multiple
                  value={formData.theLoais}
                  onChange={handleTheLoaiChange}
                  required
                  className="theloai-select"
                >
                  {theLoais.map((tl) => (
                    <option key={tl.maTheLoai} value={tl.maTheLoai}>
                      {tl.tenTheLoai}
                    </option>
                  ))}
                </select>
                <div className="theloai-help">
                  Giữ Ctrl và click để chọn nhiều thể loại
                </div>
              </div>

              {/* Mô tả */}
              <div className="form-group optional">
                <label htmlFor="moTa">Mô tả</label>
                <textarea
                  id="moTa"
                  name="moTa"
                  value={formData.moTa}
                  onChange={handleInputChange}
                  className="mota-textarea"
                  placeholder="Nhập mô tả chi tiết về sách..."
                />
              </div>
            </div>
          </div>

          {/* Cột phải - Ảnh bìa */}
          <div className="form-right">
            <div className="form-group">
              <label htmlFor="anhBia">Ảnh bìa</label>
              <div className="image-upload-section">
                <input
                  type="file"
                  id="anhBia"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                {previewImage ? (
                  <div className="image-preview">
                    <img src={previewImage} alt="Preview" />
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <p>Chọn ảnh bìa sách</p>
                    <small>Hỗ trợ: JPG, PNG, GIF</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/admin/sach")}
            className="cancel-btn"
          >
            ✖ Hủy
          </button>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "⏳ Đang thêm..." : "✓ Thêm sách"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SachAdd;
