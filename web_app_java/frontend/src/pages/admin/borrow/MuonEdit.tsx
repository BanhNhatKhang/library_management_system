import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/borrow/MuonEdit.module.css";

interface LoanRequest {
  maDocGia: string;
  maSach: string;
  ngayMuon: string;
  ngayTra?: string;
  trangThaiMuon: string;
  maNhanVien?: string;
}

/* Thêm các kiểu cho response từ backend để tránh `any` */
interface DocGiaApi {
  maDocGia: string;
  hoLot?: string;
  ten?: string;
  dienThoai?: string;
  email?: string;
  diaChi?: string;
}

interface NhanVienApi {
  maNhanVien?: string;
  hoTenNV?: string;
  diaChi?: string;
  dienThoai?: string;
  email?: string;
}

interface SachApi {
  maSach?: string;
  tenSach?: string;
  anhBia?: string;
  tacGia?: string;
  theLoais?: Array<{ ten?: string }>;
}

type DateLike =
  | string
  | number
  | Array<number | string>
  | {
      year?: number;
      month?: number;
      day?: number;
      monthValue?: number;
      dayOfMonth?: number;
    }
  | null
  | undefined;

interface TheoDoiMuonApi {
  id?: { maDocGia?: string; maSach?: string; ngayMuon?: DateLike };
  maDocGia?: string;
  maSach?: string;
  ngayMuon?: DateLike;
  ngayTra?: DateLike;
  docGia?: DocGiaApi;
  nhanVien?: NhanVienApi;
  sach?: SachApi;
  maNhanVien?: string;
  trangThaiMuon?: string;
  trangThai?: string; // thêm để tránh lỗi truy cập
}

const MuonEdit: React.FC = () => {
  const { maDocGia, maSach, ngayMuon } = useParams<{
    maDocGia: string;
    maSach: string;
    ngayMuon: string;
  }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<LoanRequest>({
    maDocGia: "",
    maSach: "",
    ngayMuon: "",
    ngayTra: "",
    trangThaiMuon: "",
    maNhanVien: "",
  });

  useEffect(() => {
    if (!maDocGia || !maSach || !ngayMuon) return;

    const fetchItem = async () => {
      try {
        const url = `/api/theodoimuonsach/item?maDocGia=${encodeURIComponent(
          maDocGia
        )}&maSach=${encodeURIComponent(maSach)}&ngayMuon=${encodeURIComponent(
          ngayMuon
        )}`;

        // Sử dụng generic để axios trả về kiểu đã định
        const res = await axios.get<TheoDoiMuonApi>(url);
        console.log("DEBUG /api/theodoimuonsach/item response:", res.data);

        const data = res.data ?? ({} as TheoDoiMuonApi);
        const id = data.id ?? {};

        const rawMaDocGia =
          data.maDocGia ?? id.maDocGia ?? data.docGia?.maDocGia ?? "";
        const rawMaSach = data.maSach ?? id.maSach ?? data.sach?.maSach ?? "";
        const rawNgayMuon =
          data.ngayMuon && data.ngayMuon !== ""
            ? data.ngayMuon
            : id.ngayMuon ?? data.id?.ngayMuon;
        const rawNgayTra = data.ngayTra ?? data.ngayTra;
        const rawMaNhanVien =
          data.maNhanVien ??
          data.nhanVien?.maNhanVien ??
          data.nhanVien?.maNhanVien ??
          "";
        const rawTrangThai =
          data.trangThaiMuon ?? data.trangThai ?? data.trangThaiMuon ?? "";

        setForm((prev) => ({
          ...prev,
          maDocGia: String(rawMaDocGia),
          maSach: String(rawMaSach),
          ngayMuon: toDateInputString(rawNgayMuon),
          ngayTra: toDateInputString(rawNgayTra),
          maNhanVien: String(rawMaNhanVien),
          trangThaiMuon: String(rawTrangThai),
        }));
      } catch (err) {
        console.error("GET /api/theodoimuonsach/item failed:", err);
      }
    };

    fetchItem();
  }, [maDocGia, maSach, ngayMuon]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`/api/theodoimuonsach`, form);
      alert("Cập nhật phiếu mượn thành công!");
      navigate("/admin/muontra");
    } catch (err) {
      console.error(err);
      alert("Lưu thất bại!");
    }
  };

  function toDateInputString(dateVal: DateLike): string {
    if (dateVal === undefined || dateVal === null || dateVal === "") return "";

    // string "yyyy-MM-dd" or ISO
    if (typeof dateVal === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) return dateVal;
      const isoMatch = dateVal.match(/^\d{4}-\d{2}-\d{2}/);
      if (isoMatch) return isoMatch[0];
      const dm = dateVal.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (dm) return `${dm[3]}-${dm[2]}-${dm[1]}`;
      const parsed = new Date(dateVal);
      if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
      return "";
    }

    // array [yyyy, MM, dd] or mixed strings
    if (Array.isArray(dateVal) && dateVal.length >= 3) {
      const [yRaw, mRaw, dRaw] = dateVal;
      const y = Number(yRaw);
      const m = Number(mRaw);
      const d = Number(dRaw);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return `${String(y)}-${String(m).padStart(2, "0")}-${String(d).padStart(
          2,
          "0"
        )}`;
      }
      return "";
    }

    // object { year, month, day } or { year, monthValue, dayOfMonth }
    if (typeof dateVal === "object") {
      const obj = dateVal as Record<string, unknown>;
      const maybeY = obj["year"];
      const maybeM = obj["month"] ?? obj["monthValue"];
      const maybeD = obj["day"] ?? obj["dayOfMonth"];
      const y =
        typeof maybeY === "number"
          ? maybeY
          : typeof maybeY === "string"
          ? parseInt(maybeY, 10)
          : NaN;
      const m =
        typeof maybeM === "number"
          ? maybeM
          : typeof maybeM === "string"
          ? parseInt(maybeM, 10)
          : NaN;
      const d =
        typeof maybeD === "number"
          ? maybeD
          : typeof maybeD === "string"
          ? parseInt(maybeD, 10)
          : NaN;
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return `${String(y)}-${String(m).padStart(2, "0")}-${String(d).padStart(
          2,
          "0"
        )}`;
      }
    }

    // number timestamp
    const num = Number(dateVal as unknown);
    if (!isNaN(num)) {
      const dt = new Date(num);
      if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
    }

    return "";
  }

  return (
    <div
      className={`${styles["library-loan-management-muon-edit"]} ${
        styles["muo-edit"] ?? ""
      }`}
    >
      <h2>Chỉnh sửa phiếu mượn</h2>
      <form onSubmit={handleSubmit} className={styles["form-container"]}>
        <div className={styles["form-group"]}>
          <label htmlFor="maDocGia">Mã độc giả</label>
          <input
            type="text"
            id="maDocGia"
            name="maDocGia"
            value={form.maDocGia}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="maSach">Mã sách</label>
          <input
            type="text"
            id="maSach"
            name="maSach"
            value={form.maSach}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="ngayMuon">Ngày mượn</label>
          <input
            type="date"
            id="ngayMuon"
            name="ngayMuon"
            value={toDateInputString(form.ngayMuon)}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="ngayTra">Ngày trả</label>
          <input
            type="date"
            id="ngayTra"
            name="ngayTra"
            value={toDateInputString(form.ngayTra)}
            onChange={handleChange}
          />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="trangThaiMuon">Trạng thái mượn</label>
          <select
            id="trangThaiMuon"
            name="trangThaiMuon"
            value={form.trangThaiMuon}
            onChange={handleChange}
            required
          >
            <option value="CHODUYET">Chờ duyệt</option>
            <option value="DADUYET">Đã duyệt</option>
            <option value="TUCHOI">Từ chối</option>
            <option value="DATRA">Đã trả</option>
            <option value="DANGMUON">Đang mượn</option>
          </select>
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="maNhanVien">Mã nhân viên</label>
          <input
            type="text"
            id="maNhanVien"
            name="maNhanVien"
            value={form.maNhanVien}
            onChange={handleChange}
          />
        </div>
        <div className={styles["form-actions"]}>
          <button type="submit" className={styles["save-btn"]}>
            Lưu
          </button>
          <button
            type="button"
            className={styles["cancel-btn"]}
            onClick={() => navigate("/admin/muontra")}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default MuonEdit;
