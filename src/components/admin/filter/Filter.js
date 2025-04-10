// components/admin/filter/Filter.js
import React, { useState, useEffect } from "react";
import Search from "../../../components/admin/search/Search";
import Sort from "../../../components/admin/sort/Sort";
import "./filter.css";

const Filter = ({ filters, data, validData, setValidData, standardSort, searchFields }) => {
  const [formattedFilters, setFormattedFilters] = useState(
    filters.map((f) => ({
      name: f.header,
      type: f.key,
      isOpen: false,
      standards: f.options,
      selected: f.header,
    })),
  );

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFormattedFilters(
      filters.map((f) => ({
        name: f.header,
        type: f.key,
        isOpen: false,
        standards: f.options,
        selected: f.header,
      })),
    );
  }, [filters]);

  useEffect(() => {
    handleFilter();
  }, [data, formattedFilters]);

  const wrappedSetValidData = (data) => {
    setValidData(data);
    setFormattedFilters(formattedFilters.map((f) => ({ ...f, isOpen: false })));
  };

  const handleFilter = () => {
    const filtered = data.filter((d) =>
      formattedFilters.every((f) => {
        if (f.selected === f.name || f.selected === "Tất cả") return true;

        if (f.type === "role") {
          const roleName = d.role?.name || "";
          return roleName === f.selected;
        }

        if (f.type === "status") {
          const isVerified = d.isVerified;
          if (f.selected === "Active") return isVerified === true;
          if (f.selected === "Inactive") return isVerified === false;
          return true;
        }

        return d[f.type] === f.selected;
      }),
    );

    setFilteredData(filtered);
    setValidData(filtered);
  };

  const handleFilterChange = (filterType, standard) => {
    const tempFilter = formattedFilters.map((f) =>
      f.type === filterType
        ? { ...f, isOpen: false, selected: standard }
        : { ...f, isOpen: false },
    );
    setFormattedFilters(tempFilter);
  };

  return (
    <>
      <Search
        data={filteredData.length > 0 ? filteredData : data}
        setValidData={wrappedSetValidData}
        searchFields={searchFields}
      />
      <div className="card-filters">
        {formattedFilters.map((f, index) => (
          <div className="dropdown" key={index}>
            <div
              className={`dropdown-selected ${f.isOpen ? "active" : ""}`}
              onClick={() => {
                setFormattedFilters(
                  formattedFilters.map((item) =>
                    item.type === f.type
                      ? { ...item, isOpen: !item.isOpen }
                      : { ...item, isOpen: false },
                  ),
                );
              }}
            >
              {f.selected}
            </div>
            {f.isOpen ? (
              <div className="dropdown-options">
                {f.standards.map((standard, index) => (
                  <div
                    key={index}
                    className={standard === f.selected ? "active" : ""}
                    onClick={() => handleFilterChange(f.type, standard)}
                  >
                    {standard}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        <Sort
          standards={standardSort}
          data={validData}
          filters={formattedFilters}
          setFilters={setFormattedFilters}
          setValidData={setValidData}
        />
      </div>
    </>
  );
};

export default Filter;