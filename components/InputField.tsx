
import React from 'react';

interface InputFieldProps {
    label: string;
    name: string;
    value: number;
    onChange: (name: string, value: number) => void;
    unit: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, unit }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
        if (!isNaN(numValue)) {
            onChange(name, numValue);
        }
    };

    let stepValue = "1";
    if (unit === '%') {
        stepValue = "0.1";
    } else if (unit === 'x') {
        stepValue = "0.01";
    }

    return (
        <div className="flex justify-between items-center gap-4">
            <label htmlFor={name} className="text-sm font-medium text-slate-600 whitespace-nowrap">{label}</label>
            <div className="flex items-center space-x-2 flex-shrink-0">
                <input
                    type="number"
                    id={name}
                    name={name}
                    value={value.toString()}
                    onChange={handleChange}
                    className="w-28 sm:w-32 text-right bg-slate-100 rounded-lg p-2 border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition duration-200"
                    step={stepValue}
                    min="0"
                />
                <span className="text-sm text-slate-500 w-5 text-left">{unit}</span>
            </div>
        </div>
    );
};

export default InputField;
