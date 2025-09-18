import React from 'react';

export function Table({ children, className = '' }) {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="min-w-full divide-y divide-border table-fixed">
                {children}
            </table>
        </div>
    );
}

export function TableHeader({ children, className = '' }) {
    return (
        <thead className={`bg-muted ${className}`}>
            {children}
        </thead>
    );
}

export function TableBody({ children, className = '' }) {
    return (
        <tbody className={`bg-card divide-y divide-border ${className}`}>
            {children}
        </tbody>
    );
}

export function TableRow({ children, className = '' }) {
    return (
        <tr className={`hover:bg-muted ${className}`}>
            {children}
        </tr>
    );
}

export function TableHead({ children, className = '' }) {
    return (
        <th className={`px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border ${className}`}>
            {children}
        </th>
    );
}

export function TableCell({ children, className = '', colSpan }) {
    return (
        <td
            className={`px-6 py-4 text-sm text-foreground align-top ${className}`}
            colSpan={colSpan}
        >
            {children}
        </td>
    );
}
