import React from "react";

const Menu = () => {

    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className='menu-section'>
            <div className="menu-section-display">
                <p className="menu-option" onClick={() => scrollToSection('files-section')}>Files</p>
                <p className="menu-option" onClick={() => scrollToSection('audit-log-section')}>Audit Log</p>
            </div>
        </div>
    );
}

export default Menu;