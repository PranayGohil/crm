import React from "react";

const ClientAdminActionButtons = () => {
    // TODO: Replace with API call
    /*
    const actionButtons = [
      {
        label: "Delete Client",
        icon: "/SVG/delete-vec.svg",
        link: "#",
        className: "css-high css-delete"
      }
    ];
    */

    return (
        <section className="cdl-btns-sec">
            <div className="cdl-final-btns">
                {[
                    {
                        label: "Delete Client",
                        icon: "/SVG/delete-vec.svg",
                        link: "#",
                        className: "css-high css-delete"
                    }
                ].map((btn, index) => (
                    <div className="css-delete_btn" key={index}>
                        <a href={btn.link} className={btn.className}>
                            <img src={btn.icon} alt="del" />
                            {btn.label}
                        </a>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ClientAdminActionButtons;
