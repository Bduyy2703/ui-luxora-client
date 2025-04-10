import { useState } from 'react';
import styles from './FilterSidebar.module.scss';
import { filterProducts } from '../../services/api/productService';
import { useNavigate } from 'react-router-dom';

export default function FilterSidebar() {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true, 
    materials: true,
    sizes: true
  });

  const [selectedFilters, setSelectedFilters] = useState({
    priceRanges: [],
    materials: [],
    sizes: [],
    categoryId: null
  });

  const categories = [
    { name: 'Earrings (Hoa tai)', expanded: false },
    { name: 'Rings (Nhẫn)', expanded: true },
    { name: 'Necklaces (Dây chuyền)', expanded: false },
    { name: 'Bracelets (Vòng tay)', expanded: false }
  ];

  const priceRanges = [
    'Dưới 500k',
    '500k - 2 triệu', 
    '2 triệu - 3 triệu',
    '5 triệu - 10 triệu',
  ];

  const materials = [
    'Bạc Y 925',
    'Ngọc Trai',
    'Đá CZ'
  ];

  const sizes = [
    'Nhỏ',
    'Trung', 
    'Lớn'
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (type, value) => {
    setSelectedFilters(prev => {
      const currentValues = prev[type];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [type]: newValues
      };
    });
  };

  const handleFilter = async () => {
    try {
      const response = await filterProducts({
        ...selectedFilters
      });
      
      navigate('/list-product', {
        state: {
          isFiltered: true,
          filters: selectedFilters
        }
      });
    } catch (error) {
      console.error("Lỗi khi lọc sản phẩm:", error);
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.categorySection}>
        <h3 onClick={() => toggleSection('categories')} style={{cursor: 'pointer'}}>
          DANH MỤC SẢN PHẨM {expandedSections.categories ? '▼' : '▶'}
        </h3>
        {expandedSections.categories && categories.map((category, index) => (
          <div key={index} className={styles.categoryItem}>
            {category.name}
            {category.expanded && <span>+</span>}
          </div>
        ))}
      </div>

      <div className={styles.filterSection}>
        <h3 onClick={() => toggleSection('price')} style={{cursor: 'pointer'}}>
          CHỌN KHOẢNG GIÁ {expandedSections.price ? '▼' : '▶'}
        </h3>
        {expandedSections.price && priceRanges.map((range, index) => (
          <div key={index} className={styles.checkboxItem}>
            <input 
              type="checkbox"
              id={`price-${index}`}
              checked={selectedFilters.priceRanges.includes(range)}
              onChange={() => handleFilterChange('priceRanges', range)}
            />
            <label htmlFor={`price-${index}`}>{range}</label>
          </div>
        ))}

        <h3 onClick={() => toggleSection('materials')} style={{cursor: 'pointer'}}>
          CHẤT LIỆU CHÍNH {expandedSections.materials ? '▼' : '▶'}
        </h3>
        {expandedSections.materials && materials.map((material, index) => (
          <div key={index} className={styles.checkboxItem}>
            <input 
              type="checkbox"
              id={`material-${index}`}
              checked={selectedFilters.materials.includes(material)}
              onChange={() => handleFilterChange('materials', material)}
            />
            <label htmlFor={`material-${index}`}>{material}</label>
          </div>
        ))}

        <h3 onClick={() => toggleSection('sizes')} style={{cursor: 'pointer'}}>
          KÍCH THƯỚC {expandedSections.sizes ? '▼' : '▶'}
        </h3>
        {expandedSections.sizes && sizes.map((size, index) => (
          <div key={index} className={styles.checkboxItem}>
            <input 
              type="checkbox"
              id={`size-${index}`}
              checked={selectedFilters.sizes.includes(size)}
              onChange={() => handleFilterChange('sizes', size)}
            />
            <label htmlFor={`size-${index}`}>{size}</label>
          </div>
        ))}

        <div className={styles.filterButtonContainer}>
          <button className={styles.filterButton} onClick={handleFilter}>
            Lọc
          </button>
        </div>
      </div>
    </aside>
  );
}