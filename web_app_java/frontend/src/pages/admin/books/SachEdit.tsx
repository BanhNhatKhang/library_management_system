import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/books/SachEdit.module.css";

interface TheLoai {
  maTheLoai: string;
  tenTheLoai: string;
}

interface NhaXuatBan {
  maNhaXuatBan: string;
  tenNhaXuatBan: string;
}

interface Sach {
  maSach: string;
  tenSach: string;
  tacGia: string;
  nhaXuatBan: string;
  namXuatBan: string;
  soLuong: number;
  soQuyen: number;
  donGia: number;
  moTa: string;
  anhBia: string;
  theLoais: string[];
}

const SachEdit = () => {
  const navigate = useNavigate();
  const { maSach } = useParams<{ maSach: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string>("");
  const [theLoais, setTheLoais] = useState<TheLoai[]>([]);
  const [nhaXuatBans, setNhaXuatBans] = useState<NhaXuatBan[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");

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
    if (!maSach) {
      setError("Mã sách không hợp lệ");
      setLoadingData(false);
      return;
    }

    // Load dữ liệu ban đầu
    Promise.all([
      axios.get("/api/theloai"),
      axios.get("/api/nhaxuatban"),
      axios.get(`/api/sach/id/${maSach}`),
    ])
      .then(([theLoaiRes, nxbRes, sachRes]) => {
        setTheLoais(theLoaiRes.data);
        setNhaXuatBans(nxbRes.data);

        const sachData: Sach = sachRes.data;

        // Chuyển đổi tên thể loại thành mã thể loại
        const theLoaiIds =
          sachData.theLoais
            ?.map((tenTheLoai) => {
              const theLoai = theLoaiRes.data.find(
                (tl: TheLoai) => tl.tenTheLoai === tenTheLoai
              );
              return theLoai?.maTheLoai || "";
            })
            .filter((id) => id !== "") || [];

        // Tìm mã nhà xuất bản
        const nxbId =
          nxbRes.data.find(
            (nxb: NhaXuatBan) => nxb.tenNhaXuatBan === sachData.nhaXuatBan
          )?.maNhaXuatBan || "";

        setFormData({
          maSach: sachData.maSach,
          tenSach: sachData.tenSach,
          soQuyen: sachData.soQuyen,
          donGia: sachData.donGia.toString(),
          soLuong: sachData.soLuong,
          namXuatBan: sachData.namXuatBan,
          tacGia: sachData.tacGia,
          moTa: sachData.moTa || "",
          nhaXuatBan: nxbId,
          theLoais: theLoaiIds,
        });

        if (sachData.anhBia) {
          // Tách folder và filename từ database value
          const pathParts = sachData.anhBia.split("/");
          const folder = pathParts[0];
          const filename = pathParts[1];

          // Sử dụng API endpoint
          const imageUrl = `http://localhost:8080/api/sach/image/${folder}/${filename}`;

          setCurrentImageUrl(imageUrl);
        } else {
          console.log("No anhBia field found");
        }
      })
      .catch((error) => {
        console.error("Lỗi khi tải dữ liệu:", error);
        setError("Không thể tải thông tin sách");
      })
      .finally(() => {
        setLoadingData(false);
      });
  }, [maSach]);

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

    setLoading(true);
    try {
      const submitData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "maSach") {
          // Bỏ qua maSach
          if (key === "theLoais") {
            submitData.append(key, JSON.stringify(value));
          } else {
            submitData.append(key, value.toString());
          }
        }
      });

      // Thêm file ảnh nếu có
      if (selectedFile) {
        submitData.append("anhBia", selectedFile);
      }

      console.log("Updating sach with maSach:", maSach);

      await axios.put(`/api/sach/${maSach}`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Cập nhật sách thành công!");
      navigate("/admin/sach");
    } catch (error) {
      console.error("Lỗi khi cập nhật sách:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        alert(`Có lỗi xảy ra: ${errorMessage}`);
      } else {
        alert("Có lỗi xảy ra khi cập nhật sách!");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className={styles["edit-sach"]}>
        <div className={styles["loading"]}>⏳ Đang tải thông tin sách...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles["edit-sach"]}>
        <Link to="/admin/sach" className={styles["back-link"]}>
          ← Quay lại danh sách
        </Link>
        <div className={styles["error"]}>❌ {error}</div>
      </div>
    );
  }

  return (
    <div className={styles["edit-sach"]}>
      <Link to="/admin/sach" className={styles["back-link"]}>
        ← Quay lại danh sách
      </Link>

      <h2>✏️ Chỉnh Sửa Sách</h2>

      <form onSubmit={handleSubmit} className={styles["edit-sach-form"]}>
        <div className={styles["form-container"]}>
          {/* Cột trái - Thông tin chính */}
          <div className={styles["form-left"]}>
            {/* Dòng 1: Mã sách, Tên sách, Tác giả, Nhà xuất bản */}
            <div className={styles["form-row-1"]}>
              <div className={`${styles["form-group"]} ${styles["readonly"]}`}>
                <label htmlFor="maSach">Mã sách</label>
                <input
                  type="text"
                  id="maSach"
                  name="maSach"
                  value={formData.maSach}
                  readOnly
                  placeholder="Mã sách không thể thay đổi"
                />
              </div>

              <div className={styles["form-group"]}>
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

              <div className={styles["form-group"]}>
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

              <div className={styles["form-group"]}>
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
            <div className={styles["form-row-2"]}>
              <div className={styles["form-group"]}>
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

              <div className={styles["form-group"]}>
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

              <div className={styles["form-group"]}>
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

              <div className={styles["form-group"]}>
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
            <div className={styles["form-row-3"]}>
              {/* Thể loại */}
              <div className={styles["form-group"]}>
                <label htmlFor="theLoais">Thể loại</label>
                <select
                  id="theLoais"
                  name="theLoais"
                  multiple
                  value={formData.theLoais}
                  onChange={handleTheLoaiChange}
                  required
                  className={styles["theloai-select"]}
                >
                  {theLoais.map((tl) => (
                    <option key={tl.maTheLoai} value={tl.maTheLoai}>
                      {tl.tenTheLoai}
                    </option>
                  ))}
                </select>
                <div className={styles["theloai-help"]}>
                  Giữ Ctrl và click để chọn nhiều thể loại
                </div>
              </div>

              {/* Mô tả */}
              <div className={`${styles["form-group"]} ${styles["optional"]}`}>
                <label htmlFor="moTa">Mô tả</label>
                <textarea
                  id="moTa"
                  name="moTa"
                  value={formData.moTa}
                  onChange={handleInputChange}
                  className={styles["mota-textarea"]}
                  placeholder="Nhập mô tả chi tiết về sách..."
                />
              </div>
            </div>
          </div>

          {/* Cột phải - Ảnh bìa */}
          <div className={styles["form-right"]}>
            <div className={`${styles["form-group"]} ${styles["optional"]}`}>
              <label htmlFor="anhBia">Ảnh bìa</label>
              <div className={styles["image-upload-section"]}>
                <input
                  type="file"
                  id="anhBia"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {previewImage ? (
                  <div className={styles["image-preview"]}>
                    <img
                      src={previewImage}
                      alt="New Preview"
                      className={styles["preview-image"]}
                    />
                    <div className={styles["image-change-note"]}>Ảnh mới</div>
                  </div>
                ) : currentImageUrl ? (
                  <div className={styles["image-preview"]}>
                    <img
                      src={currentImageUrl}
                      alt="Current"
                      className={styles["current-image"]}
                      onLoad={() => {
                        console.log(
                          "Image loaded successfully:",
                          currentImageUrl
                        );
                      }}
                    />
                    <div className={styles["current-image-note"]}>
                      Ảnh hiện tại
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginTop: "5px",
                      }}
                    ></div>
                  </div>
                ) : (
                  <div className={styles["upload-placeholder"]}>
                    <p>Chọn ảnh bìa mới</p>
                    <small>Hỗ trợ: JPG, PNG, GIF</small>
                    <small>(Để trống nếu không muốn thay đổi)</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form actions */}
        <div className={styles["form-actions"]}>
          <button
            type="button"
            onClick={() => navigate("/admin/sach")}
            className={styles["cancel-btn"]}
          >
            ✖ Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className={styles["submit-btn"]}
          >
            {loading ? "⏳ Đang cập nhật..." : "💾 Cập nhật sách"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SachEdit;
