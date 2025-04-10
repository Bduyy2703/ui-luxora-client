import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowUpWideShort,
    faArrowUpShortWide,
} from "@fortawesome/free-solid-svg-icons";
import "./sort.css";

const Sort = ({ standards, filters, setFilters, data, setValidData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState({
        name: "Sắp xếp",
        type: "All",
    });
    const [isAscending, setIsAscending] = useState(true);

    useEffect(() => {
        if (filters.some((f) => f.isOpen === true)) {
            setIsOpen(false);
        }
    }, [filters]);

    const handleSortOrder = () => {
        setIsAscending(!isAscending);
        sort(data, selected.type, !isAscending);
    };

    const handleSort = (standard) => {
        setSelected(standard);
        setIsOpen(false);

        sort(data, standard.type, isAscending);
    };

    const sort = (data, sortBy, isAscending) => {
        // Tạo bản sao của data để tránh thay đổi trực tiếp
        const sortedData = [...data];

        standards.forEach((s) => {
            if (s.type === sortBy) {
                sortedData.sort((a, b) => {
                    const aValue = a[sortBy];
                    const bValue = b[sortBy];

                    if (
                        typeof aValue === "string" &&
                        typeof bValue === "string"
                    ) {
                        return isAscending
                            ? aValue.localeCompare(bValue)
                            : bValue.localeCompare(aValue);
                    }

                    if (
                        sortBy === "dateOfBirth" ||
                        sortBy === "createdAt" ||
                        sortBy === "updatedAt"
                    ) {
                        return isAscending
                            ? new Date(aValue) - new Date(bValue)
                            : new Date(bValue) - new Date(aValue);
                    }

                    return isAscending ? aValue - bValue : bValue - aValue;
                });

                // Cập nhật lại state với mảng đã sắp xếp
                setValidData(sortedData);
            }
        });
    };

    return (
        <>
            {/* Sort By */}
            <div className='dropdown'>
                <div
                    className={`dropdown-selected ${isOpen ? "active" : ""}`}
                    onClick={() => {
                        setIsOpen(!isOpen);
                        setFilters(
                            filters.map((f) => ({ ...f, isOpen: false }))
                        );
                    }}
                >
                    {selected.name}
                </div>
                {isOpen ? (
                    <div className='dropdown-options'>
                        {standards.map((standard, index) => (
                            <div
                                key={index}
                                className={
                                    selected.name === standard.name
                                        ? "active"
                                        : ""
                                }
                                onClick={() => handleSort(standard)}
                            >
                                {standard.name}
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
            {/* Sort Order */}
            <button className='btn-sort-order' onClick={handleSortOrder}>
                {isAscending ? (
                    <FontAwesomeIcon icon={faArrowUpWideShort} />
                ) : (
                    <FontAwesomeIcon icon={faArrowUpShortWide} />
                )}
            </button>
        </>
    );
};

export default Sort;
