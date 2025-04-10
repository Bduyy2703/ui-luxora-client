import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Footer.module.scss';
import Tippy from '@tippyjs/react';
import HeadlessTippy from '@tippyjs/react/headless';
import Button from '../../../Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCircleXmark,
    faSpinner,
    faMagnifyingGlass,
    faEllipsisVertical,
    faLanguage,
    faCircleQuestion,
    faKeyboard,
    faCloudUpload,
    faMessage,
    faUser,
    faCoins,
    faGear,
    faSignOut,
    faUserCircle,
    faUserAlt,
    faCartShopping,
    faFire,
    faArrowDown,
} from '@fortawesome/free-solid-svg-icons';
import { Wrapper as PopperWrapper } from '../../../Popper';
import AccountItem from '../../../AccountItem';
import Menu from '../../../Popper/Menu';
import 'tippy.js/dist/tippy.css';
import { FacebookFilled, InstagramFilled, TwitterOutlined, YoutubeFilled } from '@ant-design/icons';

const cx = classNames.bind(styles);

function Header() {

    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        setCartCount(0); 
    }, []);

    return (
        <div className={styles.wrapper}>
            <div className={styles.introduce}>
                <span className={styles.intro}>GIỚI THIỆU</span>
                <img 
                    width="200" 
                    height="43" 
                    src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/logo.png?1727259903818" 
                    data-src="//bizweb.dktcdn.net/100/461/213/themes/870653/assets/logo.png?1727259903818" 
                    alt="Caraluna" 
                    className="lazyload loaded" 
                    data-was-processed="true"
                />
                <div>
                    <ul style={{ listStyle: 'none' }}>
                        <li>Địa chỉ:</li>
                        <li>CS1: 1 Đoàn Trần Nghiệp, HBT, Hà Nội</li>
                        <li>CS2: 191 Xã Đàn, Đống Đa, Hà Nội</li>
                        <li>CS3: 116 Trần Quang Diệu, P.14, Q.3, HCM</li>
                    </ul>
                </div>
                <p><strong>Điện thoại:</strong> 084 272 96 86</p>
                <p><strong>Email:</strong> info@caraluna.vn</p>
                <div>
                    <a className={styles.icon} src='https://www.facebook.com/caraluna.vn/'><FacebookFilled /></a>
                    <a className={styles.icon} src='https://www.facebook.com/caraluna.vn/'><TwitterOutlined /></a>
                    <a className={styles.icon} src='https://www.facebook.com/caraluna.vn/'><YoutubeFilled /></a>
                    <a className={styles.icon} src='https://www.facebook.com/caraluna.vn/'><InstagramFilled /></a>
                </div>
                <div>
                    <img src="https://bizweb.dktcdn.net/100/461/213/themes/870653/assets/bct.png?1728012064200" alt="LOGO" className="mt-4" style={{ width: '100px', height: 'auto' }}/>
                    <img src="https://bizweb.dktcdn.net/100/461/213/files/logo-vnpay-qr-1.webp" alt="VNPAY" className="mt-4" style={{ width: '100px', height: 'auto', marginLeft: '10px' }}/>
                </div>
            </div>
            <div className={styles.newPost}>
                <div className={styles.new}>BÀI VIẾT MỚI</div>
                <div className={styles.footerFlower}>
                    <div>
                        <img src="https://bizweb.dktcdn.net/100/461/213/articles/tang-hoa-20-10-cho-nguoi-yeu.jpg?v=1712826606977" alt='flower' style={{ width: '90px', height: '60px', marginRight: '10px'  }}/>
                    </div>
                    <div className={styles.footerNote}>
                        <span>Tặng hoa 20/10 cho người yêu có ý nghĩa gì? Chọn hoa nào?</span>
                        <span className={styles.time}>11/04/2024</span>
                    </div>
                </div>

                <div className={styles.footerFlower}>
                    <div>
                        <img src="https://bizweb.dktcdn.net/100/461/213/articles/qua-tang-sinh-nhat-cho-ban-gai.jpg?v=1712302865133" alt='gift' style={{ width: '90px', height: '60px', marginRight: '10px' }}/>
                    </div>
                    <div className={styles.footerNote}>
                        <span>Tặng quà sinh nhật cho bạn gái - Gợi ý 57 món quà ý nghĩa</span>
                        <span className={styles.time}>05/04/2024</span>
                    </div>
                </div>

                <div className={styles.footerFlower}>
                    <div>
                        <img src="https://bizweb.dktcdn.net/100/461/213/articles/day-chuyen-tang-ban-gai.jpg?v=1710990022057" alt='necklace' style={{ width: '90px', height: '60px', marginRight: '10px'  }}/>
                    </div>
                    <div className={styles.footerNote}>
                        <span>32 Quà tặng bạn đi du học nước ngoài đáng nhớ và ý nghĩa</span>
                        <span className={styles.time}>21/03/2024</span>
                    </div>
                </div>

                <div className={styles.footerFlower}>
                    <div>
                        <img src="https://bizweb.dktcdn.net/100/461/213/articles/qua-tang-ban-di-du-hoc.jpg?v=1710307553127" alt='abroad' style={{ width: '90px', height: '60px', marginRight: '10px'  }}/>
                    </div>
                    <div className={styles.footerNote}>
                        <span>Tặng hoa 20/10 cho người yêu có ý nghĩa gì? Chọn hoa nào?</span>
                        <span className={styles.time}>13/04/2024</span>
                    </div>
                </div>

            </div>
            <div className={styles.storeJewelry}>
                <span className={styles.store}>CỬA HÀNG TRANG SỨC</span>
                <div>
                    <ul className={styles.list}>
                        <li>Earrings (Hoa tai)</li>
                        <li>Rings (Nhẫn)</li>
                        <li>Necklaces (Dây chuyền)</li>
                        <li>Bracelets (Vòng tay)</li>
                    </ul>
                </div>
            </div>
            <div className={styles.support}>
                <span className={styles.store}>HỖ TRỢ</span>
                <div>
                    <ul className={styles.list}>
                        <li>Điều khoản dịch vụ</li>
                        <li>Hướng dẫn mua hàng</li>
                        <li>Hướng dẫn thanh toán</li>
                    </ul>
                </div>
            </div>
            <div className={styles.policy}>
                <span className={styles.store}>CHÍNH SÁCH</span>
                <div>
                    <ul className={styles.list}>
                        <li>Chính sách bảo mật</li>
                        <li>Chính sách bảo hành</li>
                        <li>Chính sách đổi trả</li>
                        <li>Chính sách vận chuyển</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}    

export default Header;
