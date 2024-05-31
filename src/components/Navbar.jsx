// src/components/Navbar.jsx
import React from 'react';

const Navbar = () => {
  return (
    <header className='fixed top-0 left-0 w-full bg-white z-10'>
      <div className='container mx-auto px-4 py-2 flex items-center justify-center'>
        <p className='blue-gradient_text w-10 h-10 rounded-lg bg-white items-center justify-center flex font-bold shadow-md'>
          KP
        </p>
      </div>
    </header>
  );
};

export default Navbar;
