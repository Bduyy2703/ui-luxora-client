// import React, { useState, useEffect } from "react";
// import { Input, Select, Button } from "antd";
// import { SortAscendingOutlined } from "@ant-design/icons";
// import styles from "./filter.module.scss";

// const { Option } = Select;

// const Filter = ({
//   filters,
//   data,
//   validData,
//   setValidData,
//   standardSort,
//   searchFields,
//   className,
// }) => {
//   const [searchValues, setSearchValues] = useState({});
//   const [sortField, setSortField] = useState(null);
//   const [sortOrder, setSortOrder] = useState("asc");

//   const getFieldValue = (item, key) => {
//     if (!item) return "";
//     if (key === "username") {
//       return item.user?.username || item.username || "";
//     }
//     if (key === "email") {
//       return item.user?.email || item.email || "";
//     }
//     return item[key] || "";
//   };

//   const handleSearch = (key, value) => {
//     const newSearchValues = { ...searchValues, [key]: value };
//     setSearchValues(newSearchValues);

//     let filteredData = [...data];

//     Object.keys(newSearchValues).forEach((searchKey) => {
//       if (newSearchValues[searchKey]) {
//         filteredData = filteredData.filter((item) => {
//           if (!item) return false;
//           const fieldValue = getFieldValue(item, searchKey);
//           return fieldValue
//             .toString()
//             .toLowerCase()
//             .includes(newSearchValues[searchKey].toLowerCase());
//         });
//       }
//     });

//     filters.forEach((filter) => {
//       const selectedValue = filter.selectedValue;
//       if (selectedValue && selectedValue !== "Tất cả") {
//         filteredData = filteredData.filter((item) => {
//           if (!item) return false;
//           const fieldValue = getFieldValue(item, filter.key);
//           return fieldValue === selectedValue;
//         });
//       }
//     });

//     setValidData(filteredData);
//   };

//   const handleSort = () => {
//     if (!sortField) return;

//     const sortedData = [...validData].sort((a, b) => {
//       let valueA = getFieldValue(a, sortField);
//       let valueB = getFieldValue(b, sortField);

//       if (sortField === "createdAt" || sortField === "createAt") {
//         valueA = a?.[sortField] ? new Date(a[sortField]) : new Date(0);
//         valueB = b?.[sortField] ? new Date(b[sortField]) : new Date(0);
//       } else {
//         valueA = valueA?.toString().toLowerCase() || "";
//         valueB = valueB?.toString().toLowerCase() || "";
//       }

//       if (sortOrder === "asc") {
//         return valueA > valueB ? 1 : -1;
//       } else {
//         return valueA < valueB ? 1 : -1;
//       }
//     });

//     setValidData(sortedData);
//   };

//   const handleFilterChange = (key, value) => {
//     const updatedFilters = filters.map((filter) =>
//       filter.key === key ? { ...filter, selectedValue: value } : filter,
//     );

//     let filteredData = [...data];

//     updatedFilters.forEach((filter) => {
//       const selectedValue = filter.selectedValue;
//       if (selectedValue && selectedValue !== "Tất cả") {
//         filteredData = filteredData.filter((item) => {
//           if (!item) return false;
//           const fieldValue = getFieldValue(item, filter.key);
//           return fieldValue === selectedValue;
//         });
//       }
//     });

//     Object.keys(searchValues).forEach((searchKey) => {
//       if (searchValues[searchKey]) {
//         filteredData = filteredData.filter((item) => {
//           if (!item) return false;
//           const fieldValue = getFieldValue(item, searchKey);
//           return fieldValue
//             .toString()
//             .toLowerCase()
//             .includes(searchValues[searchKey].toLowerCase());
//         });
//       }
//     });

//     setValidData(filteredData);
//   };

//   return (
//     <div className={`${styles.filterWrapper} ${className}`}>
//       <div className={`${styles.searchFields} ${styles.customSearchFields}`}>
//         {searchFields.map((field) => (
//           <Input
//             key={field.key}
//             placeholder={field.placeholder}
//             value={searchValues[field.key] || ""}
//             onChange={(e) => handleSearch(field.key, e.target.value)}
//             style={{ width: 200, marginRight: 7 }}
//           />
//         ))}
//       </div>
//       <div className={`${styles.sortSection} ${styles.customSortSection}`}>
//         <Select
//           placeholder="Sắp xếp"
//           style={{ width: 200, marginRight: "-9px" }}
//           onChange={(value) => setSortField(value)}
//         >
//           {standardSort.map((sort) => (
//             <Option key={sort.type} value={sort.type}>
//               {sort.name}
//             </Option>
//           ))}
//         </Select>
//         <Select
//           defaultValue="asc"
//           style={{ width: 120, marginRight: "-9px" }}
//           onChange={(value) => setSortOrder(value)}
//         >
//           <Option value="asc">Tăng dần</Option>
//           <Option value="desc">Giảm dần</Option>
//         </Select>
//         <Button
//           type="primary"
//           icon={<SortAscendingOutlined />}
//           onClick={handleSort}
//         >
//           Sắp xếp
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default Filter;

import React, { useState, useEffect } from "react";
import { Input, Select, Button } from "antd";
import { SortAscendingOutlined } from "@ant-design/icons";
import styles from "./filter.module.scss";

const { Option } = Select;

const Filter = ({
  filters,
  data,
  validData,
  setValidData,
  standardSort,
  searchFields,
  className,
}) => {
  const [searchValues, setSearchValues] = useState({});
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const getFieldValue = (item, key) => {
    if (!item) return "";
    if (key === "username") {
      return item.user?.username || item.username || "";
    }
    if (key === "email") {
      return item.user?.email || item.email || "";
    }
    return item[key] || "";
  };

  const handleSearch = (key, value) => {
    const newSearchValues = { ...searchValues, [key]: value };
    setSearchValues(newSearchValues);

    let filteredData = [...data];

    Object.keys(newSearchValues).forEach((searchKey) => {
      if (newSearchValues[searchKey]) {
        filteredData = filteredData.filter((item) => {
          if (!item) return false;
          const fieldValue = getFieldValue(item, searchKey);

          // Xử lý tìm kiếm cho finalPrice (số)
          if (searchKey === "finalPrice") {
            const searchNumber = parseFloat(newSearchValues[searchKey]);
            const fieldNumber = parseFloat(fieldValue);
            return !isNaN(searchNumber) && !isNaN(fieldNumber)
              ? fieldNumber === searchNumber
              : false;
          }

          // Xử lý tìm kiếm cho name (chuỗi)
          return fieldValue
            .toString()
            .toLowerCase()
            .includes(newSearchValues[searchKey].toLowerCase());
        });
      }
    });

    filters.forEach((filter) => {
      const selectedValue = filter.selectedValue;
      if (selectedValue && selectedValue !== "Tất cả") {
        filteredData = filteredData.filter((item) => {
          if (!item) return false;
          const fieldValue = getFieldValue(item, filter.key);
          return fieldValue === selectedValue;
        });
      }
    });

    setValidData(filteredData);
  };

  const handleSort = () => {
    if (!sortField) return;

    const sortedData = [...validData].sort((a, b) => {
      let valueA = getFieldValue(a, sortField);
      let valueB = getFieldValue(b, sortField);

      // Xử lý sắp xếp cho finalPrice (số)
      if (sortField === "finalPrice") {
        valueA = parseFloat(valueA) || 0;
        valueB = parseFloat(valueB) || 0;
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
      }

      // Xử lý sắp xếp cho createdAt
      if (sortField === "createdAt" || sortField === "createAt") {
        valueA = a?.[sortField] ? new Date(a[sortField]) : new Date(0);
        valueB = b?.[sortField] ? new Date(b[sortField]) : new Date(0);
      } else {
        // Xử lý sắp xếp cho name (chuỗi)
        valueA = valueA?.toString().toLowerCase() || "";
        valueB = valueB?.toString().toLowerCase() || "";
      }

      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setValidData(sortedData);
  };

  const handleFilterChange = (key, value) => {
    const updatedFilters = filters.map((filter) =>
      filter.key === key ? { ...filter, selectedValue: value } : filter,
    );

    let filteredData = [...data];

    updatedFilters.forEach((filter) => {
      const selectedValue = filter.selectedValue;
      if (selectedValue && selectedValue !== "Tất cả") {
        filteredData = filteredData.filter((item) => {
          if (!item) return false;
          const fieldValue = getFieldValue(item, filter.key);
          return fieldValue === selectedValue;
        });
      }
    });

    Object.keys(searchValues).forEach((searchKey) => {
      if (searchValues[searchKey]) {
        filteredData = filteredData.filter((item) => {
          if (!item) return false;
          const fieldValue = getFieldValue(item, searchKey);

          // Xử lý tìm kiếm cho finalPrice (số)
          if (searchKey === "finalPrice") {
            const searchNumber = parseFloat(searchValues[searchKey]);
            const fieldNumber = parseFloat(fieldValue);
            return !isNaN(searchNumber) && !isNaN(fieldNumber)
              ? fieldNumber === searchNumber
              : false;
          }

          // Xử lý tìm kiếm cho name (chuỗi)
          return fieldValue
            .toString()
            .toLowerCase()
            .includes(searchValues[searchKey].toLowerCase());
        });
      }
    });

    setValidData(filteredData);
  };

  return (
    <div className={`${styles.filterWrapper} ${className}`}>
      <div className={`${styles.searchFields} ${styles.customSearchFields}`}>
        {searchFields.map((field) => (
          <Input
            key={field.key}
            placeholder={field.placeholder}
            value={searchValues[field.key] || ""}
            onChange={(e) => handleSearch(field.key, e.target.value)}
            style={{ width: 200, marginRight: 7 }}
          />
        ))}
      </div>
      <div className={`${styles.sortSection} ${styles.customSortSection}`}>
        <Select
          placeholder="Sắp xếp"
          style={{ width: 200, marginRight: "-9px" }}
          onChange={(value) => setSortField(value)}
        >
          {standardSort.map((sort) => (
            <Option key={sort.type} value={sort.type}>
              {sort.name}
            </Option>
          ))}
        </Select>
        <Select
          defaultValue="asc"
          style={{ width: 120, marginRight: "-9px" }}
          onChange={(value) => setSortOrder(value)}
        >
          <Option value="asc">Tăng dần</Option>
          <Option value="desc">Giảm dần</Option>
        </Select>
        <Button
          type="primary"
          icon={<SortAscendingOutlined />}
          onClick={handleSort}
        >
          Sắp xếp
        </Button>
      </div>
    </div>
  );
};

export default Filter;
