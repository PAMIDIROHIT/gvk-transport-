import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    return (
        <div className="pagination-container">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                    title="Previous Page"
                >
                    <ChevronLeft size={16} />
                </button>
                <span className="page-indicator">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                    title="Next Page"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
            {/* Optional jump to page can be added here if needed */}
        </div>
    );
}
