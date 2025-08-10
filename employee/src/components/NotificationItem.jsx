import React from "react";

const NotificationItem = ({
  icon,
  title = "",
  description,
  linkText,
  linkHref = "#",
  time,
  media = [],
}) => {
  const firstLetter = title?.charAt(0).toUpperCase() || "N";

  return (
    <div className="not-completed-tasks">
      <div className="not-completed-img-txt">
        {icon ? (
          <img src={icon} alt={title} />
        ) : (
          <div
            className="not-initial-circle"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#ccc",
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            {firstLetter}
          </div>
        )}

        <div className="not-completed-text">
          <div id="p1">{title}</div>
          <div id="p2">{description}</div>
          {media.length > 0 && (
            <div className="not-media">
              {media.map((src, index) => (
                <img key={index} src={src} alt={`media-${index}`} />
              ))}
            </div>
          )}
          <a href={linkHref}>{linkText}</a>
        </div>
      </div>
      <div className="not-notification-hours">
        <img src="/SVG/dot.svg" alt="dot" />
        <span>{time}</span>
      </div>
    </div>
  );
};

export default NotificationItem;
