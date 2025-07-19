import React, { useState } from 'react';
import InputField from './components/InputField';
import DisplayField from './components/DisplayField';
import { SparklesIcon, CalculatorIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChevronDownIcon } from './components/Icons';

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

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
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
                                            <h4 className="text-sm font-semibold text-slate-600 pt-1">Расчет логистики (за 1 шт)</h4>
                                            <div className="space-y-3 mt-2">
                                                <DisplayField label="Логистика при продаже" value={logisticsOnSale} format={formatCurrency} />
                                                
                                                <div className="!mt-4 pt-4 border-t border-slate-200">
                                                    <h5 className="text-sm font-semibold text-slate-600 mb-2">Затраты при отмене / возврате</h5>
                                                    <div className="space-y-3 pl-3 border-l-2 border-indigo-200">
                                                        <DisplayField label="Доставка до клиента" value={toCustomerOnCancel} format={formatCurrency} />
                                                        <InputField label="Возврат от клиента" name="returnFromCustomerCost" value={inputs.returnFromCustomerCost} onChange={handleInputChange} unit="₽" />
                                                        <DisplayField label="Возврат на ПВЗ" value={returnToPickupOnCancel} format={formatCurrency} />
                                                        <div className="pt-2 border-t border-slate-200">
                                                            <DisplayField label="Итого на отмену" value={logisticsOnCancel} format={formatCurrency} bold hasBorder={false} />
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