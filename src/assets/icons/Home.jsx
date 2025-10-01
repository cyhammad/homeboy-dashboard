import React from 'react';

const HomeIcon = ({ size = '1em', color = 'white' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.02 3.79754L3.63 7.99754C2.73 8.69754 2 10.1875 2 11.3175V18.7275C2 21.0475 3.89 22.9475 6.21 22.9475H17.79C20.11 22.9475 22 21.0475 22 18.7375V11.4575C22 10.2475 21.19 8.69754 20.2 8.00754L14.02 3.67754C12.62 2.69754 10.37 2.74754 9.02 3.79754Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 18.9476V15.9476"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default HomeIcon;