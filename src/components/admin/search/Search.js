import React, { useState, useEffect } from "react";
import "./search.css";

const Search = ({ data, setValidData, searchFields = [] }) => {
  const [searchValues, setSearchValues] = useState({});

  useEffect(() => {
    search();
  }, [data, searchValues]);

  const search = () => {
    try {
      let searchData = [...data];
      searchFields.forEach(({ key }) => {
        const val = searchValues[key];
        if (val) {
          searchData = searchData.filter((item) =>
            (item[key] + "").toLowerCase().includes(val.toLowerCase()),
          );
        }
      });
      setValidData(searchData);
    } catch (err) {
      console.error("Error in search:", err);
    }
  };

  const handleChange = (key, value) => {
    setSearchValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="card-search">
      {searchFields.map(({ key, placeholder }, index) => (
        <div className="search-group" key={index}>
          <input
            type="text"
            className="search"
            placeholder={placeholder}
            value={searchValues[key] || ""}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};

export default Search;
