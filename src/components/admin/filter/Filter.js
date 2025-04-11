import React, { useState, useEffect } from "react";
import { Input, Select, Button } from "antd";
import { SortAscendingOutlined } from "@ant-design/icons";
import styles from "./filter.scss";

const { Option } = Select;

const Filter = ({ filters, data, validData, setValidData, standardSort, searchFields }) => {
  const [searchValues, setSearchValues] = useState({});
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  // Xử lý tìm kiếm
  const handleSearch = (key, value) => {
    const newSearchValues = { ...searchValues, [key]: value };
    setSearchValues(newSearchValues);

    let filteredData = [...data];

    // Lọc theo các trường tìm kiếm
    Object.keys(newSearchValues).forEach((searchKey) => {
      if (newSearchValues[searchKey]) {
        filteredData = filteredData.filter((item) => {
          if (searchKey === "id") {
            return item.id.toString().includes(newSearchValues[searchKey]);
          }
          if (searchKey === "username") {
            return item.user.username
              .toLowerCase()
              .includes(newSearchValues[searchKey].toLowerCase());
          }
          return true;
        });
      }
    });

    // Lọc theo bộ lọc (status, paymentMethod)
    filters.forEach((filter) => {
      const selectedValue = filter.selectedValue;
      if (selectedValue && selectedValue !== "Tất cả") {
        filteredData = filteredData.filter(
          (item) => item[filter.key] === selectedValue
        );
      }
    });

    setValidData(filteredData);
  };

  // Xử lý sắp xếp
  const handleSort = () => {
    if (!sortField) return;

    const sortedData = [...validData].sort((a, b) => {
      let valueA, valueB;

      if (sortField === "id") {
        valueA = a.id;
        valueB = b.id;
      } else if (sortField === "username") {
        valueA = a.user.username.toLowerCase();
        valueB = b.user.username.toLowerCase();
      } else if (sortField === "createdAt") {
        valueA = new Date(a.createdAt);
        valueB = new Date(b.createdAt);
      } else if (sortField === "status") {
        valueA = a.status.toLowerCase();
        valueB = b.status.toLowerCase();
      } else if (sortField === "paymentMethod") {
        valueA = a.paymentMethod.toLowerCase();
        valueB = b.paymentMethod.toLowerCase();
      }

      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setValidData(sortedData);
  };

  // Xử lý thay đổi bộ lọc (status, paymentMethod)
  const handleFilterChange = (key, value) => {
    const updatedFilters = filters.map((filter) =>
      filter.key === key ? { ...filter, selectedValue: value } : filter
    );

    let filteredData = [...data];

    updatedFilters.forEach((filter) => {
      const selectedValue = filter.selectedValue;
      if (selectedValue && selectedValue !== "Tất cả") {
        filteredData = filteredData.filter(
          (item) => item[filter.key] === selectedValue
        );
      }
    });

    // Áp dụng lại tìm kiếm sau khi lọc
    Object.keys(searchValues).forEach((searchKey) => {
      if (searchValues[searchKey]) {
        filteredData = filteredData.filter((item) => {
          if (searchKey === "id") {
            return item.id.toString().includes(searchValues[searchKey]);
          }
          if (searchKey === "username") {
            return item.user.username
              .toLowerCase()
              .includes(searchValues[searchKey].toLowerCase());
          }
          return true;
        });
      }
    });

    setValidData(filteredData);
  };

  return (
    <div className={styles.filterWrapper}>
      <div className={styles.searchFields}>
        {searchFields.map((field) => (
          <Input
            key={field.key}
            placeholder={field.placeholder}
            value={searchValues[field.key] || ""}
            onChange={(e) => handleSearch(field.key, e.target.value)}
            style={{ width: 200, marginRight: 16 }}
          />
        ))}
      </div>
      <div className={styles.sortSection}>
        <Select
          placeholder="Sắp xếp"
          style={{ width: 200, marginRight: 16 }}
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
          style={{ width: 120, marginRight: 16 }}
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