import { useState } from "react";
import styles from "./WarrantyPolicy.module.scss";

const WarrantyPolicy = () => {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const warrantyItems = [
    {
      title: "1. Thời Hạn Bảo Hành",
      content:
        "Tất cả sản phẩm DCLux được bảo hành trong vòng 12 tháng kể từ ngày mua. Thời gian bảo hành được tính dựa trên hóa đơn hoặc chứng từ mua hàng chính thức.",
    },
    {
      title: "2. Phạm Vi Bảo Hành",
      content:
        "Bảo hành áp dụng cho các lỗi kỹ thuật do nhà sản xuất (như hỏng đá, gãy móc do vật liệu). Không bao gồm hư hỏng do sử dụng không đúng cách hoặc va đập mạnh.",
    },
    {
      title: "3. Quy Trình Bảo Hành",
      content:
        "Để được bảo hành, khách hàng cần mang sản phẩm cùng hóa đơn đến cửa hàng DCLux hoặc gửi qua đường bưu điện. Thời gian xử lý bảo hành từ 7-14 ngày làm việc.",
    },
    {
      title: "4. Chi Phí Bảo Hành",
      content:
        "Bảo hành miễn phí cho các lỗi thuộc phạm vi bảo hành. Nếu hư hỏng do khách hàng gây ra, phí sửa chữa sẽ được thông báo trước khi thực hiện.",
    },
    {
      title: "5. Hỗ Trợ Khách Hàng",
      content:
        "Đội ngũ DCLux luôn sẵn sàng hỗ trợ bạn qua email hoặc điện thoại. Vui lòng liên hệ để được tư vấn chi tiết về quy trình bảo hành.",
      image:
        "https://via.placeholder.com/400x250?text=Warranty+Support",
    },
  ];

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Chính Sách Bảo Hành</h1>
          <p>Cam kết chất lượng từ DCLux</p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.accordion}>
          {warrantyItems.map((item, index) => (
            <div key={index} className={styles.accordionItem}>
              <div
                className={styles.accordionHeader}
                onClick={() => toggleSection(index)}
              >
                <h2>{item.title}</h2>
                <span>{openSections[index] ? "−" : "+"}</span>
              </div>
              {openSections[index] && (
                <div className={styles.accordionContent}>
                  <p>{item.content}</p>
                  {item.image && (
                    <img
                      src={item.image}
                      alt="Warranty Support"
                      className={styles.accordionImage}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.contact}>
          <h2>Liên Hệ Hỗ Trợ</h2>
          <p>
            Nếu bạn cần thêm thông tin về bảo hành, vui lòng liên hệ:
          </p>
          <p>
            <strong>Email:</strong> support@dclux.vn
          </p>
          <p>
            <strong>Điện thoại:</strong> 0768800022
          </p>
          <p>
            <strong>Thời gian:</strong> 9:00 - 18:00 (Thứ 2 - Thứ 7)
          </p>
        </div>
      </main>
    </div>
  );
};

export default WarrantyPolicy;