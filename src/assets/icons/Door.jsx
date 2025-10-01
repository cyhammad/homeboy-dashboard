import React from "react";

const DoorIcon = ({
  size = "1em",
  color = "black",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.16699 18.3331V4.99984C4.16699 3.42849 4.16699 2.64281 4.65515 2.15466C5.1433 1.6665 5.92898 1.6665 7.50033 1.6665H12.5003C14.0717 1.6665 14.8573 1.6665 15.3455 2.15466C15.8337 2.64281 15.8337 3.42849 15.8337 4.99984V18.3331"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M2.5 18.3333H17.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.333 10.8334V9.16675"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default DoorIcon;
