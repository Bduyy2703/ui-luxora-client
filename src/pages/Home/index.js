import { useEffect, useState, useCallback } from "react";
import { getAllBlogs } from "../../services/api/blogService";
import { getProductList } from "../../services/api/productService";
import { getAllSales } from "../../services/api/promotionService";
import styles from "./Home.module.scss";
import { Badge, Button, Table, Modal, Tag, Typography } from "antd";
import { BellOutlined } from "@ant-design/icons";
import io from "socket.io-client";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const { Text } = Typography;

function Home() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [saleProducts, setSaleProducts] = useState([]);
  const [saleProductsLoading, setSaleProductsLoading] = useState(true);
  const [saleProductsError, setSaleProductsError] = useState(null);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [flashSaleLoading, setFlashSaleLoading] = useState(true);
  const [flashSaleEndTime, setFlashSaleEndTime] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const limit = 10;

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  // const getFlashSaleData = async () => {
  //   try {
  //     setFlashSaleLoading(true);
  //     const salesResponse = await getAllSales({ page: 1, limit: 1000 });

  //     // Lọc các sale đang hoạt động và chưa hết thời gian
  //     const now = new Date().getTime();
  //     const activeSales = salesResponse.filter(
  //       (sale) => sale.isActive && new Date(sale.endDate).getTime() > now,
  //     );

  //     if (activeSales.length === 0) {
  //       setFlashSaleProducts([]);
  //       setFlashSaleEndTime(null);
  //       return;
  //     }

  //     // Tìm thời gian kết thúc sớm nhất
  //     const endTimes = activeSales.map((sale) =>
  //       new Date(sale.endDate).getTime(),
  //     );
  //     const earliestEndTime = Math.min(...endTimes);
  //     setFlashSaleEndTime(new Date(earliestEndTime));

  //     const productMap = new Map();

  //     for (const sale of activeSales) {
  //       let productsToProcess = [];

  //       if (sale.isGlobalSale) {
  //         productsToProcess = allProducts;
  //       } else {
  //         productsToProcess = sale.productStrategySales.map(
  //           (item) => item.product,
  //         );
  //       }

  //       productsToProcess.forEach((product) => {
  //         const discountPercent = parseFloat(sale.discountAmount) || 0;
  //         const finalPrice = (
  //           (parseFloat(product.originalPrice) || 0) *
  //           (1 - discountPercent / 100)
  //         ).toFixed(2);

  //         const productData = {
  //           ...product,
  //           saleId: sale.id,
  //           saleName: sale.name,
  //           discountPercent,
  //           finalPrice,
  //           images: allProducts.find((p) => p.id === product.id)?.images,
  //         };

  //         if (productMap.has(product.id)) {
  //           const existingProduct = productMap.get(product.id);
  //           if (discountPercent > existingProduct.discountPercent) {
  //             productMap.set(product.id, productData);
  //           }
  //         } else {
  //           productMap.set(product.id, productData);
  //         }
  //       });
  //     }

  //     const allFlashSaleProducts = Array.from(productMap.values());
  //     setFlashSaleProducts(allFlashSaleProducts);
  //   } catch (error) {
  //     console.error("Lỗi khi lấy dữ liệu Flash Sale:", error);
  //     setFlashSaleProducts([]);
  //     setFlashSaleEndTime(null);
  //   } finally {
  //     setFlashSaleLoading(false);
  //   }
  // };

  const getFlashSaleData = async () => {
    try {
      setFlashSaleLoading(true);
      const salesResponse = await getAllSales({ page: 1, limit: 1000 });

      // Lọc các sale đang hoạt động và chưa hết thời gian
      const now = new Date().getTime();
      const activeSales = salesResponse.filter(
        (sale) => sale.isActive && new Date(sale.endDate).getTime() > now,
      );

      if (activeSales.length === 0) {
        setFlashSaleProducts([]);
        setFlashSaleEndTime(null);
        return;
      }

      // Tìm thời gian kết thúc sớm nhất
      const endTimes = activeSales.map((sale) =>
        new Date(sale.endDate).getTime(),
      );
      const earliestEndTime = Math.min(...endTimes);
      setFlashSaleEndTime(new Date(earliestEndTime));

      const productMap = new Map();

      for (const sale of activeSales) {
        let productsToProcess = [];

        // Case 1: Product Sale
        if (sale.productStrategySales && sale.productStrategySales.length > 0) {
          productsToProcess = sale.productStrategySales.map(
            (item) => item.product,
          );
        }
        // Case 2: Global Sale
        else if (sale.isGlobalSale) {
          productsToProcess = allProducts;
        }
        // Case 3: Category Sale
        else if (
          sale.categoryStrategySales &&
          sale.categoryStrategySales.length > 0
        ) {
          const categoryIds = sale.categoryStrategySales.map(
            (cat) => cat.categoryId,
          );

          console.log("categoryIds", categoryIds);

          productsToProcess = allProducts.filter((product) => {
            console.log("product", product);

            return categoryIds.includes(product.category?.id);
          });
        }

        // Xử lý danh sách sản phẩm cho sale hiện tại
        productsToProcess.forEach((product) => {
          const discountPercent = parseFloat(sale.discountAmount) || 0;
          const finalPrice = (
            (parseFloat(product.originalPrice) || 0) *
            (1 - discountPercent / 100)
          ).toFixed(2);

          const productData = {
            ...product,
            saleId: sale.id,
            saleName: sale.name,
            discountPercent,
            finalPrice,
            images: allProducts.find((p) => p.id === product.id)?.images || [],
            saleType: sale.isGlobalSale
              ? "global"
              : sale.categoryStrategySales?.length > 0
                ? "category"
                : "product",
          };

          // Case 4: Chọn sale có giảm giá cao nhất
          if (productMap.has(product.id)) {
            const existingProduct = productMap.get(product.id);
            if (discountPercent > existingProduct.discountPercent) {
              productMap.set(product.id, productData);
            }
          } else {
            productMap.set(product.id, productData);
          }
        });
      }

      const allFlashSaleProducts = Array.from(productMap.values());
      setFlashSaleProducts(allFlashSaleProducts);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu Flash Sale:", error);
      setFlashSaleProducts([]);
      setFlashSaleEndTime(null);
    } finally {
      setFlashSaleLoading(false);
    }
  };

  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateTimer = () => {
      if (!flashSaleEndTime) return;

      const now = new Date().getTime();
      const end = flashSaleEndTime.getTime();
      const distance = end - now;

      if (distance <= 0) {
        getFlashSaleData();
        return;
      }

      const totalSeconds = Math.floor(distance / 1000);
      const hours = Math.floor(totalSeconds / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
      const seconds = Math.floor(totalSeconds % 60);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [flashSaleEndTime]);

  useEffect(() => {
    const getAllProducts = async () => {
      try {
        setProductsLoading(true);
        setSaleProductsLoading(true);
        const productsResponse = await getProductList(1, 1000);
        const products = productsResponse?.data || [];
        setAllProducts(products);

        setProducts(products.slice(0, 10));
        setSaleProducts(products.slice(0, 10));
      } catch (error) {
        console.error("Lỗi khi lấy toàn bộ sản phẩm:", error);
        setProductsError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
        setSaleProductsError(
          "Không thể tải sản phẩm sale. Vui lòng thử lại sau.",
        );
        setAllProducts([]);
        setProducts([]);
        setSaleProducts([]);
      } finally {
        setProductsLoading(false);
        setSaleProductsLoading(false);
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

    getAllProducts();
    fetchNews();
  }, []);

  useEffect(() => {
    if (allProducts.length > 0) {
      getFlashSaleData();
    }
  }, [allProducts]);

  const handleProductClick = (productId) => {
    window.location.href = `/detail-product/${productId}`;
  };

  const handleBlogClick = (blogId) => {
    window.location.href = `/blog/${blogId}`;
  };

  return (
    <div className={styles.wrapper}>
      <div>
        <img
          className={styles.img}
          src="https://bizweb.dktcdn.net/100/461/213/themes/870653/assets/slider_1.jpg?1728012064200"
          alt="Bộ Sưu Tập Resort ' 2024"
        />
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
            />
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
            />
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
            />
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
            />
          </div>
          <div className={styles.info}>
            <span>Túi & hộp TRANG NHÃ</span>
            <span>Sẵn sàng TRAO TẶNG</span>
          </div>
        </div>
      </div>

      {flashSaleLoading ? (
        <div className={styles.loadingSpinnerContainer}>
          <div className={styles.loadingSpinner}></div>
        </div>
      ) : flashSaleProducts.length > 0 ? (
        <div className={styles.flashSaleSection}>
          <div className={styles.flashSaleHeader}>
            <h2 className={styles.flashSaleTitle}>
              <span style={{ color: "#ff4d4f" }}>FLASH SALE</span>
              <span style={{ marginLeft: 10 }}>
                {String(timeLeft.hours).padStart(2, "0")}:
                {String(timeLeft.minutes).padStart(2, "0")}:
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </h2>
          </div>
          <div className={styles.flashSaleSwiper}>
            {flashSaleProducts.map((product, index) => (
              <div
                key={`${product.id}-${product.saleId}`}
                className={styles.flashSaleItem}
                onClick={() => handleProductClick(product.id)}
                style={{ animationDelay: `${index * 0.2}s` }}
                role="button"
                aria-label={`Xem chi tiết sản phẩm ${product.name}`}
              >
                <div className={styles.flashSaleImageWrapper}>
                  <Badge.Ribbon
                    text={`-${product.discountPercent}%`}
                    color="#ff4d4f"
                  >
                    <img
                      loading="lazy"
                      className={styles.flashSalePicture}
                      src={
                        product?.images?.[0] ||
                        "http://35.247.185.8:9000/public/product-3/fe1d4f02-8381-414c-be2f-46eb1b8f15f3-vun01-vue01-2-1704188629764.webp"
                      }
                      alt={product.name}
                    />
                  </Badge.Ribbon>
                </div>
                {/* <div className={styles.flashSaleContent}>
                  <span className={styles.flashSaleDesc}>{product.name}</span>
                  <span className={styles.flashSaleProgram}>
                    Chương trình: {product.saleName}
                  </span>
                  <div className={styles.flashSalePriceWrapper}>
                    <h4 className={styles.flashSalePrice}>
                      {new Intl.NumberFormat("vi-VN").format(
                        product.finalPrice,
                      )}{" "}
                      <span className={styles.dong}>đ</span>
                    </h4>
                    <span className={styles.flashSaleOriginalPrice}>
                      {new Intl.NumberFormat("vi-VN").format(
                        product.originalPrice,
                      )}{" "}
                      đ
                    </span>
                  </div>
                  <div className={styles.flashSaleStatus}>ĐANG BÁN CHẠY</div>
                </div> */}
                <div className={styles.flashSaleContent}>
                  <span className={styles.flashSaleDesc}>{product.name}</span>
                  <span className={styles.flashSaleProgram}>
                    Chương trình: {product.saleName} ({product.saleType})
                  </span>
                  <div className={styles.flashSalePriceWrapper}>
                    <h4 className={styles.flashSalePrice}>
                      {new Intl.NumberFormat("vi-VN").format(
                        product.finalPrice,
                      )}{" "}
                      <span className={styles.dong}>đ</span>
                    </h4>
                    <span className={styles.flashSaleOriginalPrice}>
                      {new Intl.NumberFormat("vi-VN").format(
                        product.originalPrice,
                      )}{" "}
                      đ
                    </span>
                  </div>
                  <div className={styles.flashSaleStatus}>ĐANG BÁN CHẠY</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className={styles.titleModules}>
        <a className={styles.bestSeller}>
          TOP
          <span className={styles.top}>Best Sellers</span>
        </a>
      </div>

      {saleProductsLoading ? (
        <div className={styles.loadingSpinnerContainer}>
          <div className={styles.loadingSpinner}></div>
        </div>
      ) : saleProductsError ? (
        <div className={styles.error}>{saleProductsError}</div>
      ) : (
        <div className={styles.swiper}>
          {saleProducts.slice(0, 4).map((product, index) => (
            <div
              key={product.id}
              className={styles.item}
              onClick={() => handleProductClick(product.id)}
              style={{ animationDelay: `${index * 0.2}s` }}
              role="button"
              aria-label={`Xem chi tiết sản phẩm ${product.name}`}
            >
              <div className={styles.imageWrapper}>
                {product.isHot && <span className={styles.badge}>Hot</span>}
                <img
                  loading="lazy"
                  className={styles.picture}
                  style={{ cursor: "pointer" }}
                  src={
                    product?.images?.[0] ||
                    "https://via.placeholder.com/303x305"
                  }
                  alt={product.name}
                />
              </div>
              <div className={styles.content}>
                <span style={{ cursor: "pointer" }} className={styles.desc}>
                  {product.name}
                </span>
                <div className={styles.footerItem}>
                  <div className={styles.priceWrapper}>
                    <h4 className={styles.price}>
                      {new Intl.NumberFormat("vi-VN").format(
                        product.finalPrice,
                      )}{" "}
                      <span className={styles.dong}>đ</span>
                    </h4>
                    {parseFloat(product.finalPrice) !==
                      parseFloat(product.originalPrice) && (
                      <span className={styles.originalPrice}>
                        {new Intl.NumberFormat("vi-VN").format(
                          product.originalPrice,
                        )}{" "}
                        đ
                      </span>
                    )}
                  </div>
                  <div className={styles.sold}>Đã bán {product.sold}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.titleModules}>
        <a className={styles.bestSeller}>
          Fine
          <span className={styles.top}>Silver Jewelry</span>
        </a>
      </div>

      {productsLoading ? (
        <div className={styles.loadingSpinnerContainer}>
          <div className={styles.loadingSpinner}></div>
        </div>
      ) : productsError ? (
        <div className={styles.error}>{productsError}</div>
      ) : (
        <div className={styles.swiper}>
          {products.slice(4, 8).map((product, index) => (
            <div
              key={product.id}
              className={styles.item}
              onClick={() => handleProductClick(product.id)}
              style={{ animationDelay: `${index * 0.2}s`, cursor: "pointer" }}
              role="button"
              aria-label={`Xem chi tiết sản phẩm ${product.name}`}
            >
              <div className={styles.imageWrapper}>
                {product.isNew && <span className={styles.badge}>New</span>}
                <img
                  loading="lazy"
                  className={styles.picture}
                  src={
                    product?.images?.[0] ||
                    "https://via.placeholder.com/303x305"
                  }
                  alt={product.name}
                />
              </div>
              <div className={styles.content}>
                <span style={{ cursor: "pointer" }} className={styles.desc}>
                  {product.name}
                </span>
                <div className={styles.footerItem}>
                  <div className={styles.priceWrapper}>
                    <h4 className={styles.price}>
                      {new Intl.NumberFormat("vi-VN").format(
                        product.finalPrice,
                      )}{" "}
                      <span className={styles.dong}>đ</span>
                    </h4>
                    {parseFloat(product.finalPrice) !==
                      parseFloat(product.originalPrice) && (
                      <span className={styles.originalPrice}>
                        {new Intl.NumberFormat("vi-VN").format(
                          product.originalPrice,
                        )}{" "}
                        đ
                      </span>
                    )}
                  </div>
                  <div className={styles.sold}>Đã bán {product.sold}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
        {newsLoading ? (
          <div className={styles.loadingSpinnerContainer}>
            <div className={styles.loadingSpinner}></div>
          </div>
        ) : newsError ? (
          <div className={styles.error}>{newsError}</div>
        ) : (
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
