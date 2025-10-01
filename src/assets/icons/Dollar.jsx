import React from "react";

const DollarIcon = ({ size = "1em", color = "black" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_293_5445)">
        <path
          d="M18.3337 10.0001C18.3337 14.6024 14.6027 18.3334 10.0003 18.3334C5.39795 18.3334 1.66699 14.6024 1.66699 10.0001C1.66699 5.39771 5.39795 1.66675 10.0003 1.66675C14.6027 1.66675 18.3337 5.39771 18.3337 10.0001Z"
          stroke={color}
          strokeWidth="1.5"
        />
        <path
          d="M12.2588 8.38433C12.1762 7.74878 11.4465 6.72193 10.1343 6.7219C8.60966 6.72188 7.96812 7.5663 7.83795 7.9885C7.63486 8.55325 7.67548 9.71433 9.46257 9.84091C11.6965 9.99925 12.5914 10.2629 12.4776 11.6301C12.3637 12.9972 11.1184 13.2926 10.1343 13.2608C9.15016 13.2292 7.54002 12.7772 7.47754 11.5612M9.97816 5.83179V6.72493M9.97816 13.2527V14.1651"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_293_5445">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default DollarIcon;
