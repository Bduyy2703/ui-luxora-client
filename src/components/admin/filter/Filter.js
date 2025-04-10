import React, { useState, useEffect } from "react";
import Search from "../../../components/admin/search/Search";
import Sort from "../../../components/admin/sort/Sort";
import "./filter.css";

const Filter = ({ filters, data, validData, setValidData, standardSort, searchFields }) => {
  const [formattedFilters, setFormattedFilters] = useState(
    filters.map((f) => ({
      name: f.name,
      type: f.type,
      isOpen: false,
      standards: f.standards,
      selected: f.name,
    })),
  );

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFormattedFilters(
      filters.map((f) => ({
        name: f.name,
        type: f.type,
        isOpen: false,
        standards: f.standards,
        selected: f.name,
      })),
    );
  }, [filters]);

  useEffect(() => {
    formattedFilters.forEach((f) => {
      handleFilter(f.type, f.selected);
    });
  }, [data]);

  const wrappedSetValidData = (data) => {
    setValidData(data);
    setFormattedFilters(formattedFilters.map((f) => ({ ...f, isOpen: false })));
  };

  const handleFilter = (filterType, standard) => {
    const tempFilter = formattedFilters.map((f) =>
      f.type === filterType
        ? { ...f, isOpen: false, selected: standard }
        : { ...f, isOpen: false },
    );
    setFormattedFilters(tempFilter);
    setFilteredData(
      data.filter((d) =>
        tempFilter.every(
          (f) =>
            f.selected === f.name ||
            f.selected === "Tất cả" ||
            d[f.type] === f.selected,
        ),
      ),
    );
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
                    onClick={() => handleFilter(f.type, standard)}
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
