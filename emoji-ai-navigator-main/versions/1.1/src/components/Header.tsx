import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, openLoginDialog, logout } = useAuth();

  const navLinks = [
    { name: '海外创意', href: 'http://www.ad996.com' },
    { name: '商务合作', href: '#' },
    { name: '网站收录', href: '/website-submission' },
  ];

  const handleAuthClick = () => {
    if (!isAuthenticated) {
      openLoginDialog();
    } else {
      logout();
    }
  };

  const authText = isAuthenticated ? '退出登入' : '注册/登入';

  return (
    <header className="bg-transparent relative">
      <div className="container mx-auto flex justify-between items-center py-4">
        <Link to="/">
          <img src="/lovable-uploads/cb9be23c-1435-4584-bc43-8a7b6fc635fd.png" alt="adggb logo" className="h-6 w-auto" />
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text-lg">
          {navLinks.map(link => {
            const className = "text-gray-800 hover:text-[#cda14c] transition-colors";
            if (link.href.startsWith('/')) {
              return (
                <Link key={link.name} to={link.href} className={className}>{link.name}</Link>
              )
            }
            return (
              <a key={link.name} href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined} className={className}>{link.name}</a>
            )
          })}
          <button onClick={handleAuthClick} className="text-gray-800 hover:text-[#cda14c] transition-colors">{authText}</button>
        </nav>
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-800">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg z-20">
          <nav className="container mx-auto flex flex-col items-center space-y-4 py-4">
            {navLinks.map(link => {
              const className = "text-gray-800 text-lg hover:text-[#cda14c]";
              if (link.href.startsWith('/')) {
                return (
                  <Link key={link.name} to={link.href} className={className} onClick={() => setIsMenuOpen(false)}>{link.name}</Link>
                )
              }
              return (
                <a key={link.name} href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined} className={className} onClick={() => setIsMenuOpen(false)}>{link.name}</a>
              )
            })}
             <button
              onClick={() => {
                handleAuthClick();
                setIsMenuOpen(false);
              }}
              className="text-gray-800 text-lg hover:text-[#cda14c]"
            >
              {authText}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
