import React from 'react';
import styles from './PaginationProp.module.scss';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Tạo mảng các số trang
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={styles.paginationContainer}>
      <button
        className={styles.paginationButton}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>

      {/* Render tất cả các số trang */}
      {pageNumbers.map(number => (
        <button
          key={number}
          className={`${styles.paginationButton} ${currentPage === number ? styles.active : ''}`}
          onClick={() => onPageChange(number)}
        >
          {number}
        </button>
      ))}

      <button
        className={styles.paginationButton}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}