import React, { useState, useEffect, useRef } from 'react';

// TODO: Replace with API call
// const pricingData = [...]
const pricingData = [
    { item: 'Ring', quantity: 10, price: 100, total: '1,000' },
    { item: 'Earring', quantity: 6, price: 50, total: '300' },
    { item: 'Bracelet', quantity: 10, price: 100, total: '1,000' },
    { item: 'Necklace', quantity: 10, price: 100, total: '1,000' },
];

// TODO: Replace with API call
// const currencyOptions = [...]
const currencyOptions = [
    '₹ Indian Rupee (INR)',
    'In progress',
    'To do',
    'Pause',
    'Block',
    'Done',
];

const ProjectPricingSection = () => {
    const [currency, setCurrency] = useState(currencyOptions[0]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <section className="pc-price-and-overview pc-sec-content">
            <div className="pc-item-price">
                <div className="pc-item-price-inner">
                    <h2>Jewelry Items & Pricing</h2>
                </div>
                <div className="pc-item-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Jewelry Item</th>
                                <th>Quantity</th>
                                <th>Price per Item (₹)</th>
                                <th>Total (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pricingData.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.item}</td>
                                    <td>{row.quantity}</td>
                                    <td>{row.price}</td>
                                    <td>{row.total}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="3">Sub Total</td>
                                <td>2000</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="pc-pricing-overview">
                <div className="pc-prc-inner">
                    <div className="prc-txt">
                        <h2>Pricing Overview</h2>
                    </div>

                    <p>Currency</p>
                    <div className={`pc-currancy-dropdown ${dropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
                        <div className="pc-dropdown_toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
                            <span className="pc-text_btn">{currency}</span>
                            <img src="/SVG/header-vector.svg" alt="vec" className="pc-arrow_icon" />
                        </div>
                        <ul className="pc-dropdown_menu">
                            {currencyOptions.map((opt, idx) => (
                                <li key={idx} onClick={() => { setCurrency(opt); setDropdownOpen(false); }}>
                                    {opt}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="pc-total-project-price">
                    <p>Total Project Price</p>
                    <span>₹2,940</span>
                    <h3>Price Distribution</h3>
                </div>
            </div>
        </section>
    );
};

export default ProjectPricingSection;

