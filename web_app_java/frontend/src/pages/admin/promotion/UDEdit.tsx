import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../../axiosConfig";
import styles from "../../../css/admins/promotion/UDEdit.module.css";

interface UuDai {
  maUuDai: string;
  tenUuDai: string;
  moTa: string;
  phanTramGiam: number | string; // Use string/number for form input
  ngayBatDau: string;
  ngayKetThuc: string;
}

const UDEdit: React.FC = () => {
  const { maUuDai } = useParams<{ maUuDai: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<UuDai>({
    maUuDai: "",
    tenUuDai: "",
    moTa: "",
    phanTramGiam: 0,
    ngayBatDau: "",
    ngayKetThuc: "",
  });

  useEffect(() => {
    if (maUuDai) {
      axios
        .get(`/api/uudai/id/${maUuDai}`)
        .then((res) => {
          // Format date for input[type="date"]
          const data = res.data;
          setForm({
            ...data,
            // Ensure phanTramGiam is treated as a string for input value
            phanTramGiam: String(data.phanTramGiam || 0),
          });
        })
        .catch(console.error);
    }
  }, [maUuDai]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (maUuDai) {
        const updateData = {
          ...form,
          phanTramGiam: Number(form.phanTramGiam), // Convert back to number for API
        };
        await axios.put(`/api/uudai/${maUuDai}`, updateData);
        alert("Cập nhật ưu đãi thành công!");
      }
      navigate("/admin/uudai");
    } catch (err) {
      console.error(err);
      alert("Lưu thất bại!");
    }
  };

  return (
    <div className={styles["ud-edit"]}>
      <h2>Cập nhật ưu đãi</h2>

      <form onSubmit={handleSubmit} className={styles["form-container"]}>
        <div className={styles["form-group"]}>
          <label>Mã ưu đãi</label>
          <input
            type="text"
            name="maUuDai"
            value={form.maUuDai}
            onChange={handleChange}
            required
            disabled // Mã ưu đãi thường không được sửa
          />
        </div>

        <div className={styles["form-group"]}>
          <label>Tên ưu đãi</label>
          <input
            type="text"
            name="tenUuDai"
            value={form.tenUuDai}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles["form-group"]}>
          <label>Phần trăm giảm (%)</label>
          <input
            type="number"
            name="phanTramGiam"
            value={form.phanTramGiam}
            onChange={handleChange}
            min={0}
            max={100}
            step="0.01"
            required
          />
        </div>

        <div className={styles["form-group"]}>
          <label>Ngày bắt đầu</label>
          <input
            type="date"
            name="ngayBatDau"
            value={form.ngayBatDau || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles["form-group"]}>
          <label>Ngày kết thúc</label>
          <input
            type="date"
            name="ngayKetThuc"
            value={form.ngayKetThuc || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles["form-group"]}>
          <label>Mô tả</label>
          <textarea
            name="moTa"
            value={form.moTa}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className={styles["form-actions"]}>
          <button type="submit" className={styles["save-btn"]}>
            💾 Lưu
          </button>
          <button
            type="button"
            className={styles["cancel-btn"]}
            onClick={() => navigate("/admin/uudai")}
          >
            ↩ Quay lại
          </button>
        </div>
      </form>
    </div>
  );
};

export default UDEdit;
