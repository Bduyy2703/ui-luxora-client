import { Link } from 'react-router-dom';
import styles from './Button.module.scss';
import classNames from 'classnames';

function Button({
    to,
    href,
    primary = false,
    outline = false,
    text = false,
    disabled = false,
    rounded = false,
    small = false,
    large = false,
    children,
    className,
    leftIcon,
    rightIcon,
    onClick,
    ...passProps
}) {
    let Comp = 'button';

    const props = {
        onClick,
        ...passProps,
    };

    if (to) {
        props.to = to;
        Comp = Link;
    } else if (href) {
        props.href = href;
        Comp = 'a';
    }

    if (disabled) {
        delete props.onClick;
    }

    const classes = classNames(styles.wrapper, {
        [className]: className,
        [styles.primary]: primary,
        [styles.outline]: outline,
        [styles.text]: text,
        [styles.disabled]: disabled,
        [styles.rounded]: rounded,
        [styles.small]: small,
        [styles.large]: large,
    });

    return (
        <Comp className={classes} {...props}>
            {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
            <span className={styles.title}>{children}</span>
            {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
        </Comp>
    );
}

export default Button;
