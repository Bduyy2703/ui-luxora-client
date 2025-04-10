import React, { useState, useEffect, memo } from "react";
import config from "../../../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronRight,
    faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";

const Pagination = ({ data, setPageData }) => {
    const [page, setPage] = useState(1);
    const [pageRange, setPageRange] = useState([]);
    const [pageTotal, setPageTotal] = useState(0);

    useEffect(() => {
        const pageTotal = Math.ceil(data.length / config.LIMIT);
        setPageTotal(pageTotal);

        if (page >= 1 && page <= 3) {
            setPageRange(Array.from({ length: pageTotal }, (v, i) => i + 1));
        } else if (page >= pageTotal - 2 && page <= pageTotal) {
            const arr = [];
            for (let i = pageTotal - 5; i <= pageTotal; i++) {
                if (i > 0) arr.push(i);
            }
            setPageRange(arr);
        } else {
            setPageRange([page - 2, page - 1, page, page + 1, page + 2]);
        }
        setPage(1);
        setPageData(data.slice(0, config.LIMIT));
    }, [data]);

    const handlePageChange = (page) => {
        setPage(page);
        const startIndex = (page - 1) * config.LIMIT;
        const endIndex = startIndex + config.LIMIT;

        setPageData(data.slice(startIndex, endIndex));
    };

    return (
        <div className='card-pagination'>
            <button
                disabled={page === 1}
                className='pag-btn'
                onClick={() => {
                    handlePageChange(page - 1);
                }}
            >
                <FontAwesomeIcon icon={faChevronLeft} className='fa-xs' />
            </button>

            {pageRange.map((p, index) => (
                <button
                    key={index}
                    className={`pag-btn ${p === page ? "active" : ""}`}
                    onClick={() => {
                        handlePageChange(p);
                    }}
                >
                    {p}
                </button>
            ))}
            <button
                disabled={page === pageTotal}
                className='pag-btn'
                onClick={() => {
                    handlePageChange(page + 1);
                }}
            >
                <FontAwesomeIcon icon={faChevronRight} className='fa-xs' />
            </button>
        </div>
    );
};

export default Pagination;
