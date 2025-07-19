
import React, { useState, useEffect } from 'react';
import InputField from './components/InputField';
import DisplayField from './components/DisplayField';
import { SparklesIcon, CalculatorIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChevronDownIcon, DownloadIcon } from './components/Icons';

// Type for Telegram WebApp object for better type safety
declare global {
    interface Window {
        Telegram: any;
    }
}

// Accordion Component for better layout organization
const AccordionSection: React.FC<{ 
    title: string; 
    children: React.ReactNode; 
    defaultOpen?: boolean; 
    variant?: 'default' | 'subtle';
}> = ({ title, children, defaultOpen = false, variant = 'default' }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const buttonWeightClass = variant === 'subtle' ? 'font-medium' : 'font-bold';
    const titleSizeClass = variant === 'subtle' ? 'text-lg' : 'text-xl';
    const buttonColorClass = variant === 'subtle' ? 'text-slate-600' : 'text-slate-800';

    return (
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/40 overflow-hidden transition-all duration-300">
            <button
                className={`w-full flex justify-between items-center p-4 sm:p-5 text-left ${buttonWeightClass} ${buttonColorClass} hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <span className={titleSizeClass}>{title}</span>
                <ChevronDownIcon className={`w-6 h-6 text-slate-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                style={{
                    display: 'grid',
                    gridTemplateRows: isOpen ? '1fr' : '0fr',
                    transition: 'grid-template-rows 0.4s ease-out'
                }}
            >
                <div className="overflow-hidden">
                     <div className="border-t border-slate-200">
                        {children}
                     </div>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [inputs, setInputs] = useState({
        price: 10000,
        sppDiscountPercent: 7,
        walletDiscountPercent: 2,
        commissionPercent: 21.5,
        acquiringPercent: 1.8,
        length: 104,
        width: 60,
        height: 34,
        returnFromCustomerCost: 50,
        buyoutPercent: 90,
        taxPercent: 6,
        costPrice: 3000,
    });

    const [formulas, setFormulas] = useState({
        baseToCustomerCost: 38,
        toCustomerPerLiterCost: 9.5,
        toCustomerMultiplier: 1.25,
        returnToPickupVolumeThreshold: 100,
        returnToPickupBaseCost: 137.5,
        returnToPickupPerLiterCost: 11.5,
    });

    useEffect(() => {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();

            // Set background to Telegram's theme background color
            document.body.style.backgroundColor = tg.themeParams.bg_color || '#f1f5f9';
            document.body.style.color = tg.themeParams.text_color || '#1e293b';

            // Show a main button to close the app
            tg.MainButton.setText('Закрыть калькулятор');
            tg.MainButton.show();
            tg.MainButton.onClick(() => tg.close());
        }
    }, []);

    const handleInputChange = (name: keyof typeof inputs, value: number) => {
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    const handleFormulaChange = (name: keyof typeof formulas, value: number) => {
        setFormulas(prev => ({ ...prev, [name]: value }));
    };

    // Calculations
    const sppDiscountValue = inputs.price * (inputs.sppDiscountPercent / 100);
    const walletDiscountValue = inputs.price * (inputs.walletDiscountPercent / 100);
    const priceOnWB = inputs.price - sppDiscountValue - walletDiscountValue;
    const commissionValue = inputs.price * (inputs.commissionPercent / 100);
    const acquiringValue = inputs.price * (inputs.acquiringPercent / 100);
    const taxValue = inputs.price * (inputs.taxPercent / 100);

    const volume = (inputs.length * inputs.width * inputs.height) / 1000;

    const toCustomerOnSale = (formulas.baseToCustomerCost + formulas.toCustomerPerLiterCost * Math.max(0, volume - 1)) * formulas.toCustomerMultiplier;
    const toCustomerOnCancel = toCustomerOnSale;
    const returnToPickupOnCancel = volume < formulas.returnToPickupVolumeThreshold ? 0 : (formulas.returnToPickupBaseCost + formulas.returnToPickupPerLiterCost * Math.max(0, volume - 1));
    
    const logisticsOnSale = toCustomerOnSale;
    const logisticsOnCancel = toCustomerOnCancel + inputs.returnFromCustomerCost + returnToPickupOnCancel;

    const totalLogistics = 
      (inputs.buyoutPercent / 100) * logisticsOnSale +
      (1 - (inputs.buyoutPercent / 100)) * logisticsOnCancel;
      
    const totalCosts = commissionValue + acquiringValue + totalLogistics + taxValue + inputs.costPrice;
    
    const totalProfit = inputs.price - commissionValue - acquiringValue - totalLogistics - taxValue - inputs.costPrice;
    const profitMargin = inputs.price > 0 ? (totalProfit / inputs.price) * 100 : 0;

    const formatCurrency = (value: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    
    const formatNumberForCsv = (value: number) => value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const handleDownloadCsv = () => {
        const dataForCsv = [
            { category: 'Параметры', parameter: 'Цена', value: inputs.price, unit: '₽' },
            { category: 'Параметры', parameter: 'Скидка СПП', value: inputs.sppDiscountPercent, unit: '%' },
            { category: 'Параметры', parameter: 'Скидка кошелек', value: inputs.walletDiscountPercent, unit: '%' },
            { category: 'Параметры', parameter: 'Комиссия', value: inputs.commissionPercent, unit: '%' },
            { category: 'Параметры', parameter: 'Процент выкупа', value: inputs.buyoutPercent, unit: '%' },
            { category: 'Параметры', parameter: 'Возврат от клиента', value: inputs.returnFromCustomerCost, unit: '₽' },
            { category: 'Финансы', parameter: 'Эквайринг', value: inputs.acquiringPercent, unit: '%' },
            { category: 'Финансы', parameter: 'Налог', value: inputs.taxPercent, unit: '%' },
            { category: 'Параметры', parameter: 'Длина', value: inputs.length, unit: 'см' },
            { category: 'Параметры', parameter: 'Ширина', value: inputs.width, unit: 'см' },
            { category: 'Параметры', parameter: 'Высота', value: inputs.height, unit: 'см' },
            { category: 'Результат', parameter: 'Объем товара', value: volume, unit: 'л' },
            {}, // Empty row
            { category: 'Результат', parameter: 'Цена для покупателя', value: priceOnWB, unit: '₽' },
            { category: 'Результат', parameter: 'Комиссия', value: commissionValue, unit: '₽' },
            { category: 'Результат', parameter: 'Эквайринг', value: acquiringValue, unit: '₽' },
            { category: 'Результат', parameter: 'Налог (сумма)', value: taxValue, unit: '₽' },
            { category: 'Результат', parameter: 'Общая логистика с % выкупа', value: totalLogistics, unit: '₽' },
            { category: 'Параметры', parameter: 'Себестоимость', value: inputs.costPrice, unit: '₽' },
            { category: 'Результат', parameter: 'Чистая прибыль', value: totalProfit, unit: '₽' },
            { category: 'Результат', parameter: 'Маржинальность', value: profitMargin, unit: '%' },
        ];

        const header = ['Категория', 'Параметр', 'Значение', 'Единица'];
        const csvRows = [header.join(';')];

        dataForCsv.forEach(row => {
            if (!row.category) {
                csvRows.push(';;;');
                return;
            }
            const valueStr = row.value !== undefined ? formatNumberForCsv(row.value) : '';
            const rowData = [row.category, row.parameter, valueStr, row.unit].join(';');
            csvRows.push(rowData);
        });
        
        const csvContent = "\uFEFF" + csvRows.join('\n'); // Add BOM for Excel compatibility with Cyrillic
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'wildberries_calculation.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <header className="text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 flex items-center justify-center gap-3">
                        <CalculatorIcon className="w-10 h-10 text-indigo-500" />
                        Калькулятор Wildberries
                    </h1>
                    <p className="mt-3 text-lg text-slate-500">Рассчитайте вашу прибыль от продаж на маркетплейсе</p>
                </header>
                
                <main className="mt-10">
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/60 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
                            <div className="md:col-span-3">
                                <h2 className="text-2xl font-bold mb-6 text-slate-700">Ключевые параметры</h2>
                                <div className="space-y-5">
                                    <InputField label="Цена" name="price" value={inputs.price} onChange={handleInputChange} unit="₽" />
                                    <InputField label="Скидка СПП" name="sppDiscountPercent" value={inputs.sppDiscountPercent} onChange={handleInputChange} unit="%" />
                                    <InputField label="Скидка кошелек" name="walletDiscountPercent" value={inputs.walletDiscountPercent} onChange={handleInputChange} unit="%" />
                                    
                                    <div className="bg-indigo-50 p-3 rounded-lg">
                                        <DisplayField label="Цена для покупателя" value={priceOnWB} format={formatCurrency} bold={true} hasBorder={false} />
                                    </div>
                                    
                                    <hr className="!my-6 border-slate-200" />

                                    <InputField label="Себестоимость" name="costPrice" value={inputs.costPrice} onChange={handleInputChange} unit="₽" />
                                    <InputField label="Процент выкупа" name="buyoutPercent" value={inputs.buyoutPercent} onChange={handleInputChange} unit="%" />
                                </div>
                            </div>
                            <div className="md:col-span-2 flex items-center justify-center h-full">
                                <div className={`p-6 w-full h-full flex flex-col justify-center rounded-xl text-white ${totalProfit >= 0 ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-rose-600'} shadow-lg`}>
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-medium opacity-90">Чистая прибыль</span>
                                        {totalProfit >= 0 ? <ArrowTrendingUpIcon className="w-8 h-8 opacity-80" /> : <ArrowTrendingDownIcon className="w-8 h-8 opacity-80" />}
                                    </div>
                                    <div className="text-4xl font-bold mt-2">{formatCurrency(totalProfit)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <AccordionSection title="Детализация расчетов">
                            <div className="p-6 sm:p-8 bg-slate-50/80">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                    <div>
                                        <h3 className="text-lg font-semibold text-indigo-600 mb-4 pb-2 border-b border-indigo-200/50">Комиссии и налоги</h3>
                                        <div className="space-y-3">
                                            <InputField label="Комиссия WB" name="commissionPercent" value={inputs.commissionPercent} onChange={handleInputChange} unit="%" />
                                            <DisplayField label="Комиссия WB (сумма)" value={commissionValue} format={formatCurrency} />
                                            <hr className="my-3 border-slate-200" />
                                            <InputField label="Эквайринг" name="acquiringPercent" value={inputs.acquiringPercent} onChange={handleInputChange} unit="%" />
                                            <DisplayField label="Эквайринг (сумма)" value={acquiringValue} format={formatCurrency} />
                                            <hr className="my-3 border-slate-200" />
                                            <InputField label="Налог" name="taxPercent" value={inputs.taxPercent} onChange={handleInputChange} unit="%" />
                                            <DisplayField label="Налог (сумма)" value={taxValue} format={formatCurrency} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-indigo-600 mb-4 pb-2 border-b border-indigo-200/50">Габариты и логистика</h3>
                                        <div className="space-y-3">
                                            <InputField label="Длина" name="length" value={inputs.length} onChange={handleInputChange} unit="см" />
                                            <InputField label="Ширина" name="width" value={inputs.width} onChange={handleInputChange} unit="см" />
                                            <InputField label="Высота" name="height" value={inputs.height} onChange={handleInputChange} unit="см" />
                                            <DisplayField label="Объем товара" value={volume} unit="л" bold />
                                            <hr className="my-3 border-slate-200" />
                                            <h4 className="text-base font-bold text-slate-700 pt-2">Расчет логистики (за 1 шт)</h4>
                                            
                                            <div className="mt-4 space-y-4">
                                                {/* Sale Section */}
                                                <div>
                                                    <h5 className="text-sm font-bold text-slate-800 mb-2">Логистика при продаже</h5>
                                                    <div className="border-b border-slate-200">
                                                        <DisplayField label="К клиенту при продаже" value={logisticsOnSale} format={formatCurrency} hasBorder={false} />
                                                    </div>
                                                </div>
                                                
                                                {/* Return Section */}
                                                <div className="pt-4 border-t border-slate-200">
                                                    <h5 className="text-sm font-bold text-slate-800 mb-2">Логистика при отмене / возврате</h5>
                                                    <div className="space-y-3 pl-3 border-l-2 border-indigo-200">
                                                        <DisplayField label="К клиенту при отмене" value={toCustomerOnCancel} format={formatCurrency} />
                                                        <InputField label="От клиента при отмене" name="returnFromCustomerCost" value={inputs.returnFromCustomerCost} onChange={handleInputChange} unit="₽" />
                                                        <DisplayField label="Возврат КГТ продавцу на ПВЗ" value={returnToPickupOnCancel} format={formatCurrency} />
                                                        <div className="pt-2 mt-2 border-t border-slate-200">
                                                            <DisplayField label="Итого при отмене" value={logisticsOnCancel} format={formatCurrency} bold hasBorder={false} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AccordionSection>

                        <AccordionSection title="Итоговая сводка" defaultOpen={true}>
                            <div className="p-6 sm:p-8 bg-slate-50/80">
                                <div className="space-y-3 max-w-md mx-auto">
                                    <DisplayField label="Общая логистика (с % выкупа)" value={totalLogistics} format={formatCurrency} bold />
                                    <DisplayField label="Всего расходов (без себестоимости)" value={totalCosts - inputs.costPrice} format={formatCurrency} />
                                    <DisplayField label="Всего расходов (с себестоимостью)" value={totalCosts} format={formatCurrency} bold />
                                    <hr className="my-3 border-slate-300" />
                                    <DisplayField label="Чистая прибыль (с 1 ед.)" value={totalProfit} format={formatCurrency} bold />
                                    <DisplayField label="Маржинальность" value={profitMargin} unit="%" bold />
                                </div>
                            </div>
                        </AccordionSection>

                        <AccordionSection title="Формулы расчета логистики" variant="subtle">
                            <div className="p-6 sm:p-8 bg-slate-50/80">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                    <div>
                                        <h3 className="text-lg font-semibold text-indigo-600 mb-4 pb-2 border-b border-indigo-200/50">Логистика до клиента</h3>
                                        <div className="space-y-3">
                                            <InputField label="Базовая стоимость" name="baseToCustomerCost" value={formulas.baseToCustomerCost} onChange={handleFormulaChange} unit="₽" />
                                            <InputField label="Стоимость за литр (свыше 1л)" name="toCustomerPerLiterCost" value={formulas.toCustomerPerLiterCost} onChange={handleFormulaChange} unit="₽" />
                                            <InputField label="Множитель" name="toCustomerMultiplier" value={formulas.toCustomerMultiplier} onChange={handleFormulaChange} unit="x" />
                                        </div>
                                        <div className="mt-4 p-3 bg-slate-100 rounded-lg text-xs text-slate-600 font-mono">
                                            <p className="font-semibold mb-1 text-slate-700">Формула:</p>
                                            <p>(Баз. стоимость + Ст. за литр * (Объем - 1)) * Множитель</p>
                                        </div>
                                    </div>
                                     <div>
                                        <h3 className="text-lg font-semibold text-indigo-600 mb-4 pb-2 border-b border-indigo-200/50">Возврат на ПВЗ (при отмене)</h3>
                                        <div className="space-y-3">
                                             <InputField label="Порог объема для бесплатного возврата" name="returnToPickupVolumeThreshold" value={formulas.returnToPickupVolumeThreshold} onChange={handleFormulaChange} unit="л" />
                                             <InputField label="Базовая стоимость" name="returnToPickupBaseCost" value={formulas.returnToPickupBaseCost} onChange={handleFormulaChange} unit="₽" />
                                             <InputField label="Стоимость за литр (свыше 1л)" name="returnToPickupPerLiterCost" value={formulas.returnToPickupPerLiterCost} onChange={handleFormulaChange} unit="₽" />
                                        </div>
                                        <div className="mt-4 p-3 bg-slate-100 rounded-lg text-xs text-slate-600 font-mono">
                                            <p className="font-semibold mb-1 text-slate-700">Формула:</p>
                                            <p>Если Объем &lt; Порог: 0 ₽</p>
                                            <p>Иначе: Баз. стоимость + Ст. за литр * (Объем - 1)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AccordionSection>
                    </div>

                    <div className="mt-8 text-center">
                        <button 
                            onClick={handleDownloadCsv}
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md"
                        >
                            <DownloadIcon className="w-4 h-4" />
                            Выгрузить расчет в CSV
                        </button>
                    </div>

                    <div className="text-xs text-slate-400 text-center pt-8">
                        <p>Все расчеты основаны на предоставленной таблице и могут не отражать актуальные тарифы Wildberries. Используйте как инструмент для оценки.</p>
                    </div>
                </main>
                 <footer className="text-center mt-8 pb-4">
                    <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
                        Crafted with <SparklesIcon className="w-4 h-4 text-amber-400" /> by a Senior React Engineer
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default App;
