import React, { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import "./table.css";
import { Button } from "antd";

const Table = ({
  rows,
  columns,
  rowLink,
  setChecked,
  isUser,
  onEdit,
  onAddDetails,
}) => {
  const nav = useNavigate();
  const [formattedRows, setFormattedRow] = useState([]);
  const [checkedState, setCheckedState] = useState([]);

  useEffect(() => {
    if (!Array.isArray(rows)) {
      console.error("rows is not an array:", rows);
      setFormattedRow([]);
      setCheckedState([]);
      if (setChecked) setChecked([]);
      return;
    }

    setFormattedRow(
      rows.map((row) => ({
        ...row,
        createdAt: row.createdAt
          ? format(row.createdAt, "dd MMM yyyy, h:mm a")
          : "",
        startDate: row.startDate
          ? format(row.startDate, "dd MMM yyyy, h:mm a")
          : "",
        endDate: row.endDate ? format(row.endDate, "dd MMM yyyy, h:mm a") : "",
        product_isAvailable: row.product_isAvailable ? "Còn hàng" : "Hết hàng",
      })),
    );

    setCheckedState(new Array(rows.length).fill(false));
    if (setChecked) setChecked([]);
  }, [rows, setChecked]);

  const handleCheck = (e, index) => {
    e.stopPropagation();
    const newCheckedState = [...checkedState];
    newCheckedState[index] = e.target.checked;
    setCheckedState(newCheckedState);

    const checkedIds = formattedRows
      .filter((_, i) => newCheckedState[i])
      .map((row) => row.id);
    if (setChecked) setChecked(checkedIds);
  };

  const handleCheckAll = (e) => {
    const checked = e.target.checked;
    const newCheckedState = new Array(formattedRows.length).fill(checked);
    setCheckedState(newCheckedState);

    const allIds = checked ? formattedRows.map((row) => row.id) : [];
    if (setChecked) setChecked(allIds);
  };

  const formatPrice = (value) => {
    const num = Number(value);
    if (isNaN(num)) return "N/A";

    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(num);
    } catch (error) {
      // Fallback
      const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${formatted} đ`;
    }
  };
  return (
    <table className="card-table">
      <thead>
        <tr>
          {setChecked && (
            <th className="col-checkbox">
              <input type="checkbox" onChange={handleCheckAll} />
            </th>
          )}
          {columns.map((col) => (
            <th key={col.key}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {formattedRows.length > 0 ? (
          formattedRows.map((row, index) => (
            <tr
              key={index}
              className="table-row"
              onClick={() => onEdit(row)}
              style={{ cursor: "pointer" }}
            >
              {setChecked && (
                <td
                  className="col-checkbox"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    name="ckb-data"
                    value={row.id}
                    checked={checkedState[index] || false}
                    onChange={(e) => handleCheck(e, index)}
                  />
                </td>
              )}
              {columns.map((col) => {
                return (
                  <td key={col.key}>
                    {(() => {
                      const key = col.key;
                      const value = row[key];
                      if (key.includes("finalPrice")) {
                        return formatPrice(value);
                      }
                      return value;
                    })()}
                  </td>
                );
              })}
              {/* <td>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddDetails(row);
                  }}
                  type="primary"
                  style={{ marginLeft: "10px", cursor: "pointer" }}
                >
                  Thêm chi tiết
                </Button>
              </td> */}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length + (setChecked ? 1 : 0)}>
              Không tìm thấy
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default memo(Table);
