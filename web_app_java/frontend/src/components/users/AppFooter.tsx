import React from "react";
import styles from "../../css/users/AppFooter.module.css";
import { Link } from "react-router-dom";

// Dữ liệu giả lập (mock data) cho các cột liên kết
const services = [
  "Điều khoản sử dụng",
  "Chính sách bảo mật thông tin cá nhân",
  "Chính sách bảo mật thanh toán",
  "Giới thiệu Fahasa",
  "Hệ thống nhà sách",
];

const support = [
  "Chính sách đổi - trả - hoàn tiền",
  "Chính sách bảo hành - bồi hoàn",
  "Chính sách vận chuyển",
  "Chính sách khách sỉ",
];

const Footer: React.FC = () => {
  // Hàm giả lập để lấy icon URL
  const getIcon = (name: string) => `/path/to/icon/${name}.png`;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Phần Xem tất cả */}
        <div className={styles.header}>
          <Link to="/tat-ca" className={styles.viewAllButton}>
            Xem tất cả
          </Link>
        </div>

        <div className={styles.mainContent}>
          {/* Cột 1: Thông tin liên hệ và Logo */}
          <div className={styles.infoColumn}>
            {/* Logo Fahasa */}
            <img
              src={getIcon("logo-fahasa")}
              alt="Fahasa Logo"
              className={styles.logo}
            />

            <p className={styles.fahasaInfo}>
              Lầu 5, 387-389 Hai Bà Trưng Quận 3 TP HCM
              <br />
              Công Ty Cổ Phần Phát Hành Sách TP HCM - FAHASA
              <br />
              60 - 62 Lê Lợi, Quận 1, TP. HCM, Việt Nam
              <br />
              <br />
              Fahasa.com nhận đặt hàng trực tuyến và giao hàng tận nơi.
              <br />
              KHÔNG hỗ trợ đặt mua và nhận hàng trực tiếp tại văn phòng
              <br />
              cũng như tất cả Hệ Thống Fahasa trên toàn quốc.
            </p>

            {/* Icons mạng xã hội */}
            <div className={styles.socialIcons}>
              <a
                href="#"
                className={styles.socialIcon}
                style={{ backgroundColor: "#3b5998" }}
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="#"
                className={styles.socialIcon}
                style={{ backgroundColor: "#dd4b39" }}
              >
                <i className="fab fa-google-plus-g"></i>
              </a>
              <a
                href="#"
                className={styles.socialIcon}
                style={{ backgroundColor: "#007bb5" }}
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a
                href="#"
                className={styles.socialIcon}
                style={{ backgroundColor: "#1da1f2" }}
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="#"
                className={styles.socialIcon}
                style={{ backgroundColor: "#bd081c" }}
              >
                <i className="fab fa-pinterest-p"></i>
              </a>
            </div>
          </div>

          {/* Cột 2: DỊCH VỤ */}
          <div className={styles.linkColumn}>
            <h4>DỊCH VỤ</h4>
            <ul>
              {services.map((item, index) => (
                <li key={index}>
                  <a href="#">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: HỖ TRỢ */}
          <div className={styles.linkColumn}>
            <h4>HỖ TRỢ</h4>
            <ul>
              {support.map((item, index) => (
                <li key={index}>
                  <a href="#">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: TÀI KHOẢN CỦA TÔI */}
          <div className={styles.contactColumn}>
            <h4>LIÊN HỆ</h4>
            <p>
              <i className="fas fa-map-marker-alt"></i> 60-62 Lê Lợi, Q.1, TP.
              HCM
            </p>
            <p>
              <i className="fas fa-envelope"></i> cskh@fahasa.com.vn
            </p>
            <p>
              <i className="fas fa-phone"></i> 1900636467
            </p>
          </div>
        </div>

        {/* Thông tin bản quyền/Giấy phép */}
        <div className={styles.copyright}>
          Giấy chứng nhận Đăng ký Kinh doanh số 0304132047 do Sở Kế hoạch và Đầu
          tư Thành phố Hồ Chí Minh cấp ngày 20/12/2005, đăng ký thay đổi lần thứ
          10, ngày 20/05/2022.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
