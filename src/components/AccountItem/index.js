import styles from './AccountItem.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';


function AccountItem() {
    return (
        <div className={styles.wrapper}>
            <img
                className={styles.avatar}
                src="https://scontent.fsgn18-1.fna.fbcdn.net/v/t39.30808-1/412912943_2094957970854208_8237656501665238034_n.jpg?stp=dst-jpg_p200x200&_nc_cat=101&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=IyTQyL0_3xoQ7kNvgFwawC5&_nc_ht=scontent.fsgn18-1.fna&oh=00_AYAAisXziYwenbS0htkTHgM2r0mllK0cRIs4ZJroAnor5A&oe=66C285C8"
                alt="Boi"
            />
            <div className={styles.info}>
                <h4 className={styles.name}>
                    <span>Trần Hoàng Minh Thư</span>
                    <FontAwesomeIcon className={styles.check} icon={faCheckCircle} />
                </h4>
                <span className={styles.username}>boimint</span>
            </div>
        </div>
    );
}

export default AccountItem;
