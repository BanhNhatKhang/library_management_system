import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../../../css/admins/borrow/MuonDetails.css";

interface DocGia {
  maDocGia: string;
  hoLot: string;
  ten: string;
  dienThoai: string;
  email: string;
  diaChi?: string;
  ngaySinh?: string;
}

interface Sach {
  maSach: string;
  tenSach: string;
  tacGia: string;
  theLoai: string;
}

interface MuonSach {
  maDocGia: string;
  maSach: string;
  ngayMuon: string;
  ngayTra: string;
  trangThaiMuon: string;
  docGia: DocGia;
  sach: Sach;
}

const MuonDetails: React.FC = () => {
  const { maDocGia, maSach, ngayMuon } = useParams<{
    maDocGia: string;
    maSach: string;
    ngayMuon: string;
  }>();
  const [muonSach, setMuonSach] = useState<MuonSach | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMuonSachDetails = async () => {
      try {
        const response = await axios.get(
          `/api/theodoimuonsach/item?maDocGia=${maDocGia}&maSach=${maSach}&ngayMuon=${ngayMuon}`
        );
        setMuonSach(response.data);
      } catch (error) {
        console.error("Error fetching loan details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMuonSachDetails();
  }, [maDocGia, maSach, ngayMuon]);

  if (loading) {
    return <div>⏳ Đang tải...</div>;
  }

  if (!muonSach) {
    return (
      <div className="p-3">
        <Link to="/admin/muontra" className="btn btn-secondary mb-3">
          ← Quay lại danh sách
        </Link>
        <div>Không tìm thấy thông tin phiếu mượn.</div>
      </div>
    );
  }

  return (
    <div className="muon-details">
      <div className="header-container">
        <Link to="/admin/muontra" className="back-link">
          ← Quay lại danh sách
        </Link>
        <h2 className="page-title">📖 Chi tiết phiếu mượn</h2>
      </div>

      <div className="info-section">
        <h3>Thông tin độc giả</h3>
        <p>
          <strong>Mã độc giả:</strong> {muonSach.docGia.maDocGia}
        </p>
        <p>
          <strong>Họ và tên:</strong> {muonSach.docGia.hoLot}{" "}
          {muonSach.docGia.ten}
        </p>
        <p>
          <strong>Điện thoại:</strong> {muonSach.docGia.dienThoai}
        </p>
        <p>
          <strong>Email:</strong> {muonSach.docGia.email}
        </p>
        <p>
          <strong>Địa chỉ:</strong> {muonSach.docGia.diaChi}
        </p>
      </div>
      <div className="info-section">
        <h3>Thông tin sách</h3>
        <p>
          <strong>Mã sách:</strong> {muonSach.sach.maSach}
        </p>
        <p>
          <strong>Tên sách:</strong> {muonSach.sach.tenSach}
        </p>
        <p>
          <strong>Tác giả:</strong> {muonSach.sach.tacGia}
        </p>
        <p>
          <strong>Thể loại:</strong> {muonSach.sach.theLoai}
        </p>
      </div>
      <div className="info-section">
        <h3>Thông tin phiếu mượn</h3>
        <p>
          <strong>Ngày mượn:</strong>{" "}
          {new Date(muonSach.ngayMuon).toLocaleDateString("vi-VN")}
        </p>
        <p>
          <strong>Ngày trả:</strong>{" "}
          {muonSach.ngayTra
            ? new Date(muonSach.ngayTra).toLocaleDateString("vi-VN")
            : "Chưa trả"}
        </p>
        <p>
          <strong>Trạng thái:</strong> {muonSach.trangThaiMuon}
        </p>
      </div>
    </div>
  );
};

export default MuonDetails;
