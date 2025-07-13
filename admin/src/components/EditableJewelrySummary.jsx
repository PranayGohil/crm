import React, { useState } from 'react';

const initialItems = [
    { name: 'Ring', quantity: 10, price: 100 },
    { name: 'Earring', quantity: 10, price: 100 },
    { name: 'Necklace', quantity: 10, price: 100 },
];

const EditableJewelrySummary = () => {
    const [items, setItems] = useState(initialItems);
    const [totalPrice, setTotalPrice] = useState(2940); // TODO: Replace with API call
    const [uploadedFiles, setUploadedFiles] = useState(0);
    const [projectDescription, setProjectDescription] = useState(
        'This project includes photography and video production for the new spring collection of jewelry items. We need close-up shots highlighting the craftsmanship and detail of each piece. Videos should be 15-30 seconds each, showing the jewelry from multiple angles with proper lighting.'
    );

    const updateItem = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = field === 'name' ? value : Number(value);
        setItems(updated);
    };

    const resetRow = index => {
        const updated = [...items];
        updated[index] = { ...initialItems[index] };
        setItems(updated);
    };

    const deleteRow = index => {
        const updated = [...items];
        updated.splice(index, 1);
        setItems(updated);
    };

    const addItem = () => {
        setItems([...items, { name: '', quantity: 0, price: 0 }]);
    };

    const getTotal = (quantity, price) => quantity * price;

    const getSubTotal = () =>
        items.reduce((acc, item) => acc + item.quantity * item.price, 0);

    return (
        <section className="epc-edit-content-body">
            <div className="epc-edit-summary">
                <h2>Editable Jewelry Summary</h2>
                <div className="epc-add-item-table">
                    <table className="jwell-table">
                        <thead>
                            <tr>
                                <th>Jewelry Item</th>
                                <th>Quantity</th>
                                <th>Price per Item (₹)</th>
                                <th>Total (₹)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={e => updateItem(idx, 'name', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={e => updateItem(idx, 'quantity', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={e => updateItem(idx, 'price', e.target.value)}
                                        />
                                    </td>
                                    <td className="total">₹{getTotal(item.quantity, item.price)}</td>
                                    <td className="action">
                                        <span className="epc-delete-btn" onClick={() => deleteRow(idx)}>
                                            <img src="/SVG/delete-vec.svg" alt="delete" />
                                        </span>
                                        <span className="epc-reset-btn" onClick={() => resetRow(idx)}>
                                            <img src="/SVG/refresh-vec.svg" alt="reset" />
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <a href="#" className="epc-add-btn" onClick={addItem}>
                        <img src="/SVG/plus-vec.svg" alt="plus" />Add Item
                    </a>
                </div>
            </div>

            <div className="epc-price-overview">
                <h2>Pricing Overview</h2>
                <div className="epc-overview-inner">
                    <div className="epc-sub-total">
                        <p>Subtotal</p>
                        <span>₹{getSubTotal()}</span>
                    </div>
                    <div className="epc-total-price">
                        <p>Total Project Price</p>
                        <input
                            type="number"
                            placeholder={totalPrice}
                            value={totalPrice}
                            onChange={e => setTotalPrice(Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            <div className="epc-content-included">
                <h2>Content Included</h2>
                <div className="epc-drag-drop-files">
                    <img src="/SVG/drag-drop-vec.svg" alt="drag" />
                    <span>Drag and drop files here or</span>
                    <a href="#" className="browse-btn">Browse Files</a>
                </div>
                <div className="epc-num-of-file-uploaded">
                    <span>{uploadedFiles}</span>
                    <p>files uploaded</p>
                </div>
            </div>

            <div className="epc-description-notes">
                <h2>Project Description / Notes</h2>
                <p>Project Description</p>
                <div className="epc-des-note-inner">
                    <textarea
                        className="epc-des-note-inner"
                        rows={5}
                        value={projectDescription}
                        onChange={e => setProjectDescription(e.target.value)}
                    />
                </div>
            </div>

            <div className="epc-final-btn">
                <div className="cancel-final-btn">
                    <a href="#">Cancel</a>
                </div>
                <div className="edit-final-btn">
                    <a href="#"><img src="/SVG/edit.svg" alt="edit" />Save Changes</a>
                </div>
            </div>
        </section>
    );
};

export default EditableJewelrySummary;
