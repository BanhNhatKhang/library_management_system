import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/notification/TBAdd.module.css";

const TBAdd: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    noiDung: "",
    loaiThongBao: "DADUYET",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Kiểm tra quyền truy cập khi component mount
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    // Decode token để kiểm tra role
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("Current user role:", payload.role);
      if (!["ADMIN", "NHANVIEN", "THUTHU", "QUANLY"].includes(payload.role)) {
        alert("Bạn không có quyền truy cập chức năng này");
        navigate("/");
      }
    } catch {
      console.error("Invalid token format");
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Kiểm tra token trước khi gửi request
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        navigate("/admin/login");
        return;
      }

      // Gọi API tự động tạo thông báo dựa trên loại
      await axios.post(`/api/thongbao/auto/${form.loaiThongBao}`, {
        noiDung: form.noiDung,
      });

      alert("Tạo thông báo tự động thành công");
      navigate("/admin/thongbao");
    } catch (err: unknown) {
      console.error(err);
      // Type guard để kiểm tra error type
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as {
          response?: { status?: number; data?: string };
        };
        if (
          axiosError.response?.status === 403 ||
          axiosError.response?.status === 401
        ) {
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("authToken");
          navigate("/admin/login");
        } else {
          alert(
            "Có lỗi khi tạo thông báo: " +
              (axiosError.response?.data || "Unknown error")
          );
        }
      } else {
        alert("Có lỗi khi tạo thông báo: " + String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  // Mẫu nội dung tùy theo loại thông báo
  const getSampleContent = () => {
    switch (form.loaiThongBao) {
      case "DADUYET":
        return "Yêu cầu mượn sách đã được phê duyệt. Vui lòng đến thư viện để nhận sách trong vòng 3 ngày làm việc.";
      case "SAPTOIHAN":
        return "Sách bạn mượn sẽ đến hạn trả trong 2-3 ngày tới. Vui lòng chuẩn bị trả sách đúng hạn.";
      case "QUAHAN":
        return "Sách bạn mượn đã quá hạn trả. Vui lòng trả sách ngay và nộp phí phạt theo quy định.";
      case "DATRASACH":
        return "Bạn đã trả sách thành công. Cảm ơn bạn đã sử dụng dịch vụ thư viện đúng quy định.";
      default:
        return "";
    }
  };

  return (
    <div className={`${styles["tb-add"]} p-3`}>
      <Link to="/admin/thongbao" className="btn btn-secondary mb-3">
        ← Quay lại danh sách
      </Link>
      <h4>➕ Tự động tạo thông báo</h4>
      <form
        onSubmit={submit}
        className={`mt-3 ${styles["bg-white"]} p-3 rounded`}
      >
        <div className="row">
          <div className="col-md-6 mb-2">
            <label>Loại Thông báo</label>
            <select
              name="loaiThongBao"
              className="form-select"
              value={form.loaiThongBao}
              onChange={handleChange}
              required
            >
              <option value="DADUYET">
                Đã duyệt - Gửi cho phiếu vừa được duyệt
              </option>
              <option value="SAPTOIHAN">
                Sắp đến hạn - Gửi cho phiếu sắp tới hạn trả
              </option>
              <option value="QUAHAN">Quá hạn - Gửi cho phiếu đã quá hạn</option>
              <option value="DATRASACH">
                Đã trả sách - Gửi cho phiếu vừa trả
              </option>
            </select>
          </div>

          <div className="col-md-6 mb-2">
            <button
              type="button"
              className="btn btn-outline-info btn-sm"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  noiDung: getSampleContent(),
                }))
              }
            >
              Sử dụng mẫu nội dung
            </button>
          </div>

          <div className="col-12 mb-2">
            <label>Nội dung thông báo mẫu</label>
            <textarea
              name="noiDung"
              className="form-control"
              rows={5}
              value={form.noiDung}
              onChange={handleChange}
              required
              placeholder="Nhập nội dung thông báo hoặc click 'Sử dụng mẫu nội dung'"
            />
            <small className="text-muted">
              Hệ thống sẽ tự động thay thế tên sách và thông tin cụ thể khi gửi
              thông báo
            </small>
          </div>
        </div>

        <div className="mt-3">
          <button className="btn btn-primary me-2" disabled={loading}>
            {loading ? "Đang gửi..." : "Tạo thông báo tự động"}
          </button>
          <Link to="/admin/thongbao" className="btn btn-outline-secondary">
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
};

export default TBAdd;
