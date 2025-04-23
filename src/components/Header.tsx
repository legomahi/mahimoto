import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <div className="header">
      <Link to="/" className="logo">PENDAR YOUSEFI</Link>
      <div className="nav">
        <Link to="/about">ABOUT</Link>
        <Link to="https://store.mahimoto.com">STORE</Link>
      </div>
    </div>
  );
};

export default Header; 