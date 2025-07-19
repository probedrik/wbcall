
import React from 'react';

interface CalculatorSectionProps {
    title: string;
    children: React.ReactNode;
    noBorder?: boolean;
}

const CalculatorSection: React.FC<CalculatorSectionProps> = ({ title, children, noBorder = false }) => {
    return (
        <div className={`py-4 ${noBorder ? '' : 'border-t border-slate-200 first:border-t-0 first:pt-0'}`}>
            <h3 className="text-lg font-semibold text-indigo-600 mb-4">{title}</h3>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );
};

export default CalculatorSection;
