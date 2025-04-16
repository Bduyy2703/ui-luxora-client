import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.scss";
import {
  fetchProducts,
  getSaleProducts,
  getProductbyCategory,
  getProductList,
} from "../../../src/services/api/productService";
import { getAllBlogs } from "../../../src/services/api/blogService";
import imageExample from "../../assets/images/daychuyen1/vyn13-t-1-1659674319051.webp";

function Home() {
  const [products, setProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cateProducts, setCateProducts] = useState([]);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
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

    const fetchNews = async () => {
      try {
        setNewsLoading(true);
        const data = await getAllBlogs();
        if (data.error) {
          setNewsError(data.error);
        } else {
          const formattedNews = data.blogs.slice(0, 3).map((blog) => ({
            id: blog.id,
            title: blog.title,
            thumbnail: blog.thumbnail,
            description: blog.description || "Chưa có mô tả",
            date: new Date(blog.createAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
          }));
          setNews(formattedNews);
        }
      } catch (err) {
        setNewsError("Không thể tải tin tức. Vui lòng thử lại sau.");
      } finally {
        setNewsLoading(false);
      }
    };

    getProducts();
    getSaleProductsData();
    fetchNews();
  }, []);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleProductClick = (productId) => {
    navigate(`/detail-product/${productId}`);
  };

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
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
              alt="Miễn phí vận chuyển"
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
              alt="Đổi trả miễn phí"
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
              data-src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/ser_1.png?1728012064200"
              alt="Dịch vụ bảo hành"
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
              data-src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/ser_1.png?1728012064200"
              alt="Túi và hộp quà"
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
            alt="Quà tặng tình yêu"
          />
        </div>

        <div>
          <img
            className={styles.imgBanner}
            src="https://bizweb.dktcdn.net/100/461/213/themes/870653/assets/img_3banner_2.jpg?1728012064200"
            alt="Quà tặng tình yêu"
          />
        </div>

        <div>
          <img
            className={styles.imgBanner}
            src="https://bizweb.dktcdn.net/100/461/213/themes/870653/assets/img_3banner_3.jpg?1728012064200"
            alt="Quà tặng tình yêu"
          />
        </div>
      </div>

      <div>
        <img
          className={styles.imgProduct}
          src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/bg_banner_big.jpg?1728012064200"
          alt="Tìm hiểu về Caraluna"
        />
      </div>

      <div className={styles.cara}>
        <div className={styles.title}>Cara Luna x You</div>
        <div className={styles.image}>
          <img
            className={styles.imgProduct}
            src="https://bizweb.dktcdn.net/thumb/grande/100/461/213/themes/870653/assets/img_brand_1.jpg?1728012064200"
            alt="Hình ảnh thương hiệu Caraluna"
          />
          <img
            className={styles.imgProduct}
            src="https://bizweb.dktcdn.net/thumb/grande/100/461/213/themes/870653/assets/img_brand_2.jpg?1728012064200"
            alt="Hình ảnh thương hiệu Caraluna"
          />
          <img
            className={styles.imgProduct}
            src="https://bizweb.dktcdn.net/thumb/grande/100/461/213/themes/870653/assets/img_brand_4.jpg?1728012064200"
            alt="Hình ảnh thương hiệu Caraluna"
          />
          <img
            className={styles.imgProduct}
            src="https://bizweb.dktcdn.net/thumb/grande/100/461/213/themes/870653/assets/img_brand_6.jpg?1728012064200"
            alt="Hình ảnh thương hiệu Caraluna"
          />
          <img
            className={styles.imgProduct}
            src="https://bizweb.dktcdn.net/thumb/grande/100/461/213/themes/870653/assets/img_brand_7.jpg?1728012064200"
            alt="Hình ảnh thương hiệu Caraluna"
          />
        </div>
      </div>

      <div className={styles.titleModules}>
        <h2 className={styles.bestSeller}>Tin tức mới nhất</h2>
      </div>

      <div className={styles.news}>
        {newsLoading && (
          <div className={styles.loading}>Đang tải tin tức...</div>
        )}
        {newsError && <div className={styles.error}>{newsError}</div>}
        {!newsLoading && !newsError && (
          <div className={styles.newsGrid}>
            {news.map((item, index) => (
              <div
                key={item.id}
                className={styles.newsCard}
                onClick={() => handleBlogClick(item.id)}
                style={{ animationDelay: `${index * 0.2}s` }}
                role="button"
                aria-label={`Xem chi tiết bài viết ${item.title}`}
              >
                <div className={styles.cardImageWrapper}>
                  <img
                    className={styles.cardImage}
                    src={item.thumbnail}
                    alt={item.title}
                  />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>
                    {item.title.length > 50
                      ? `${item.title.substring(0, 50)}...`
                      : item.title}
                  </h3>
                  <p className={styles.cardDescription}>
                    {item.description.length > 100
                      ? `${item.description.substring(0, 100)}...`
                      : item.description}
                  </p>
                  <span className={styles.cardDate}>
                    Ngày đăng: {item.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
