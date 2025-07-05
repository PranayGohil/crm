import React from 'react';

// TODO: Replace with API call
const notes = [
    "This project includes a complete jewelry collection for the summer season. The collection features rings, earrings, bracelets, and necklaces designed with a modern aesthetic while maintaining traditional craftsmanship.",
    "All items will be photographed from multiple angles to showcase the intricate details and craftsmanship. Videos will demonstrate how the jewelry looks when worn."
];

const ClientAdminProjectNotesSection = () => {
    return (
        <section className="pc-notes-description">
            <div className="pc-not-des-inner">
                <h2>Project Notes / Description</h2>
            </div>
            <div className="pc-description">
                {notes.map((note, index) => (
                    <span key={index}>{note}</span>
                ))}
            </div>
        </section>
    );
};

export default ClientAdminProjectNotesSection;
