import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.scss";
import {
  fetchProducts,
  getSaleProducts,
  getProductbyCategory,
  getProductList,
} from "../../../src/services/api/productService";

import imageExample from "../../assets/images/daychuyen1/vyn13-t-1-1659674319051.webp";
function Home() {
  const [products, setProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cateProducts, setCateProducts] = useState([]);
  const navigate = useNavigate();

  const limit = 1;

  useEffect(() => {
    const getProducts = async () => {
      const data = await getProductList(limit, 10);
      if (data && data.data) {
        setProducts(data.data);
      }
    };

    const getSaleProductsData = async () => {
      const data = await getProductList(limit, 10);
      if (data && data.data) {
        setSaleProducts(data.data);
      }
    };

    getProducts();
    getSaleProductsData();
  }, []);
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleProductClick = (productId) => {
    navigate(`/detail-product/${productId}`); 
  };

  return (
    <div className={styles.wrapper}>
      <div>
        <img
          className={styles.img}
          src="https://bizweb.dktcdn.net/100/461/213/themes/870653/assets/slider_1.jpg?1728012064200"
          alt="Bộ Sưu Tập Resort ' 2024"
        ></img>
      </div>

      <div className={styles.section}>
        <div className={styles.box}>
          <div>
            <img
              width="50"
              height="50"
              className={styles.lazyLoad}
              src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/ser_1.png?1728012064200"
              data-src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/ser_1.png?1728012064200"
              alt="Caraluna"
              data-was-processed="true"
            ></img>
          </div>
          <div className={styles.info}>
            <span>MIỄN PHÍ vận chuyển</span>
            <span>Đơn Hàng từ 950.000VNĐ</span>
          </div>
        </div>
        <div className={styles.box}>
          <div>
            <img
              width="50"
              height="50"
              className={styles.lazyLoad}
              src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/ser_2.png?1728012064200"
              data-src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/ser_2.png?1728012064200"
              alt="Caraluna"
              data-was-processed="true"
            ></img>
          </div>
          <div className={styles.info}>
            <span>Đổi trả MIỄN PHÍ</span>
            <span>Trong vòng 30 NGÀY</span>
          </div>
        </div>
        <div className={styles.box}>
          <div>
            <img
              width="50"
              height="50"
              className={styles.lazyLoad}
              src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/ser_3.png?1728012064200"
              data-src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/ser_3.png?1728012064200"
              alt="Caraluna"
              data-was-processed="true"
            ></img>
          </div>
          <div className={styles.info}>
            <span>Dịch vụ BẢO HÀNH</span>
            <span>Làm mới TRỌN ĐỜI</span>
          </div>
        </div>
        <div className={styles.box}>
          <div>
            <img
              width="50"
              height="50"
              className={styles.lazyLoad}
              src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/ser_4.png?1728012064200"
              data-src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/ser_4.png?1728012064200"
              alt="Caraluna"
              data-was-processed="true"
            ></img>
          </div>
          <div className={styles.info}>
            <span>Túi & hộp TRANG NHÃ</span>
            <span>Sẵn sàng TRAO TẶNG</span>
          </div>
        </div>
      </div>

      <div className={styles.titleModules}>
        <a className={styles.bestSeller}>
          TOP
          <span className={styles.top}>Best Sellers</span>
        </a>
      </div>

      <div className={styles.swiper}>
        {saleProducts.slice(0, 4).map((product) => (
          <div
            key={product.id}
            className={styles.item}
            onClick={() => handleProductClick(product.id)}
          >
            <img
              style={{ cursor: "pointer" }}
              className={styles.picture}
              src={imageExample}
              alt={product.name}
            />
            <div>
              <span className={styles.desc}>{product.name}</span>
              <div className={styles.footerItem}>
                <div>
                  <h4 className={styles.price}>
                    {new Intl.NumberFormat("vi-VN").format(product.finalPrice)}{" "}
                    <span className={styles.dong}>đ</span>
                  </h4>
                </div>
                <div className={styles.sold}>Đã bán {product.sold}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.titleModules}>
        <a className={styles.bestSeller}>
          Fine
          <span className={styles.top}>Silver Jewelry</span>
        </a>
      </div>

      <div className={styles.swiper}>
        {products.slice(4, 8).map((product) => (
          <div
            key={product.id}
            className={styles.item}
            onClick={() => handleProductClick(product.id)}
          >
            <div className={styles.ItemImg}>
              <img
                style={{ cursor: "pointer" }}
                className={styles.picture}
                src={imageExample}
                alt={product.name}
              />
            </div>
            <div>
              <span className={styles.desc}>{product.name}</span>
              <div className={styles.footerItem}>
                <div>
                  <h4 className={styles.price}>
                    {new Intl.NumberFormat("vi-VN").format(product.finalPrice)}{" "}
                    <span className={styles.dong}>đ</span>
                  </h4>
                </div>
                <div className={styles.sold}>Đã bán {product.sold}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.banner}>
        <div>
          <img
            className={styles.imgBanner}
            src="https://bizweb.dktcdn.net/100/461/213/themes/870653/assets/img_3banner_1.jpg?1728012064200"
            alt="giftLove"
          />
        </div>

        <div>
          <img
            className={styles.imgBanner}
            src="https://bizweb.dktcdn.net/100/461/213/themes/870653/assets/img_3banner_2.jpg?1728012064200"
            alt="giftLove"
          />
        </div>

        <div>
          <img
            className={styles.imgBanner}
            src="https://bizweb.dktcdn.net/100/461/213/themes/870653/assets/img_3banner_3.jpg?1728012064200"
            alt="giftLove"
          />
        </div>
      </div>

      <div>
        <img
          className={styles.imgProduct}
          src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/bg_banner_big.jpg?1728012064200"
          alt="learnAbout"
        />
      </div>

      <div className={styles.cara}>
        <div className={styles.title}>Cara Luna x You</div>
        <div className={styles.image}>
          <img
            className={styles.imgProduct}
            src="https://bizweb.dktcdn.net/thumb/grande/100/461/213/themes/870653/assets/img_brand_1.jpg?1728012064200"
            alt="learnAbout"
          />
          <img
            className={styles.imgProduct}
            src="https://bizweb.dktcdn.net/thumb/grande/100/461/213/themes/870653/assets/img_brand_2.jpg?1728012064200"
            alt="learnAbout"
          />
          <img
            className={styles.imgProduct}
            src="https://bizweb.dktcdn.net/thumb/grande/100/461/213/themes/870653/assets/img_brand_4.jpg?1728012064200"
            alt="learnAbout"
          />
          <img
            className={styles.imgProduct}
            src="https://bizweb.dktcdn.net/thumb/grande/100/461/213/themes/870653/assets/img_brand_6.jpg?1728012064200"
            alt="learnAbout"
          />
          <img
            className={styles.imgProduct}
            src="https://bizweb.dktcdn.net/thumb/grande/100/461/213/themes/870653/assets/img_brand_7.jpg?1728012064200"
            alt="learnAbout"
          />
        </div>
      </div>

      <div className={styles.titleModules}>
        <a className={styles.bestSeller}>Tin tức mới nhất</a>
      </div>

      <div className={styles.news}>
        <div className={styles.card}>
          <img
            className={styles.imgNews}
            src="https://bizweb.dktcdn.net/100/461/213/articles/tang-hoa-20-10-cho-nguoi-yeu.jpg?v=1712826606977"
            alt="giftLove"
          />
          <div className={styles.overlay}>
            <h3>Tặng Hoa 20/10 Cho Người Yêu Có Ý Nghĩa Gì?</h3>
            <p>Chọn Hoa Nào?</p>
            <span>Ngày đăng: 20/10</span>
          </div>
        </div>

        <div className={styles.card}>
          <img
            className={styles.imgNews}
            src="https://bizweb.dktcdn.net/100/461/213/articles/qua-tang-sinh-nhat-cho-ban-gai.jpg?v=1712302865133"
            alt="giftLove"
          />
          <div className={styles.overlay}>
            <h3>Tặng Quà Sinh Nhật Cho Bạn Gái</h3>
            <p>Sắp đến ngày sinh nhật của bạn gái?</p>
            <span>Ngày đăng: 19/10</span>
          </div>
        </div>

        <div className={styles.card}>
          <img
            className={styles.imgNews}
            src="https://bizweb.dktcdn.net/100/461/213/articles/day-chuyen-tang-ban-gai.jpg?v=1710990022057"
            alt="giftLove"
          />
          <div className={styles.overlay}>
            <h3>Đầy Chuyền Tặng Bạn Gái</h3>
            <p>Gợi Ý Về Vòng Cổ Bạc</p>
            <span>Ngày đăng: 18/10</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
