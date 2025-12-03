import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/orders/DHEdit.module.css";

interface DonHang {
  maDonHang?: string;
  maDocGia: string;
  ngayDat: string;
  tongTien: number;
  trangThai: string;
}

const DHEdit: React.FC = () => {
  const { maDonHang } = useParams<{ maDonHang: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<DonHang>({
    maDocGia: "",
    ngayDat: "",
    tongTien: 0,
    trangThai: "",
  });

  useEffect(() => {
    if (maDonHang) {
      axios
        .get(`/api/donhang/id/${maDonHang}`)
        .then((res) => setForm(res.data))
        .catch(console.error);
    }
  }, [maDonHang]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "tongTien" ? Number(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (maDonHang) {
        await axios.put(`/api/donhang/${maDonHang}`, form);
        alert("Cập nhật đơn hàng thành công!");
      } else {
        await axios.post("/api/donhang", form);
        alert("Thêm đơn hàng mới thành công!");
      }
      navigate("/admin/donhang");
    } catch (err) {
      console.error(err);
      alert("Lưu thất bại!");
    }
  };

  return (
    <div className={styles["dh-edit"]}>
      <h2>{maDonHang ? "Cập nhật đơn hàng" : "Thêm đơn hàng mới"}</h2>

      <form onSubmit={handleSubmit} className={styles["form-container"]}>
        <div className={styles["form-group"]}>
          <label>Mã độc giả</label>
          <input
            type="text"
            name="maDocGia"
            value={form.maDocGia}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles["form-group"]}>
          <label>Ngày đặt</label>
          <input
            type="date"
            name="ngayDat"
            value={form.ngayDat?.split("T")[0] || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles["form-group"]}>
          <label>Tổng tiền</label>
          <input
            type="number"
            name="tongTien"
            value={form.tongTien}
            onChange={handleChange}
            min={0}
          />
        </div>

        <div className={styles["form-group"]}>
          <label>Trạng thái</label>
          <select
            name="trangThai"
            value={form.trangThai}
            onChange={handleChange}
          >
            <option value="">-- Chọn trạng thái --</option>
            <option value="DANGXULY">Đang xử lý</option>
            <option value="DAGIAO">Hoàn tất</option>
            <option value="DAHUY">Đã hủy</option>
            <option value="GIAOTHATBAI">Giao thất bại</option>
          </select>
        </div>

        <div className={styles["form-actions"]}>
          <button type="submit" className={styles["save-btn"]}>
            💾 Lưu
          </button>
          <button
            type="button"
            className={styles["cancel-btn"]}
            onClick={() => navigate("/admin/donhang")}
          >
            ↩ Quay lại
          </button>
        </div>
      </form>
    </div>
  );
};

export default DHEdit;
