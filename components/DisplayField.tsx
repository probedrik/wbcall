
import React from 'react';

interface DisplayFieldProps {
    label: string;
    value: number;
    unit?: string;
    format?: (value: number) => string;
    bold?: boolean;
    hasBorder?: boolean;
}

const DisplayField: React.FC<DisplayFieldProps> = ({ label, value, unit, format, bold = false, hasBorder = true }) => {
    const formattedValue = format ? format(value) : `${value.toFixed(2)}${unit ? ` ${unit}`: ''}`;

    const containerClasses = `flex justify-between items-center ${hasBorder ? 'py-2.5 border-b border-slate-200 last:border-b-0' : ''}`;

    return (
        <div className={containerClasses}>
            <p className="text-sm text-slate-500">{label}</p>
            <p className={`text-base ${bold ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>
                {formattedValue}
            </p>
        </div>
    );
};

export default DisplayField;
