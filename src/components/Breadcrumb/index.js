import React from "react";
import { Link } from "react-router-dom";
import styles from "./Breadcrumb.module.scss";

const Breadcrumb = ({ items }) => {
  return (
    <div className={styles.breadcrumb}>
      <div className={styles.container}>
        {items.map((item, index) => (
          <span key={index}>
            {index > 0 && <span className={styles.separator}> &gt; </span>}
            {item.path ? (
              <Link to={item.path} className={styles.link}>
                {item.label}
              </Link>
            ) : (
              <span className={styles.current}>{item.label}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Breadcrumb;
