import React from 'react';
import { Github, FileText, Mail, Code2 } from 'lucide-react';

export const Footer = () => {
  const links = [
    { icon: FileText, label: 'Docs', href: '#docs' },
    { icon: Github, label: 'GitHub', href: '#github' },
    { icon: Mail, label: 'Contact', href: '#contact' },
  ];

  return (
    <footer className="mt-24 border-t border-glass-border bg-glass backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo and description */}
          <div className="flex items-center gap-3">
            <Code2 className="w-8 h-8 text-accent-blue" />
            <div>
              <p className="text-white font-semibold">MergeAI</p>
              <p className="text-gray-400 text-sm">AST-Aware Code Merger</p>
            </div>
          </div>
          
          {/* Links */}
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
              >
                <link.icon className="w-4 h-4 group-hover:text-accent-blue transition-colors" />
                <span className="text-sm font-medium">{link.label}</span>
              </a>
            ))}
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t border-glass-border text-center">
          <p className="text-gray-500 text-sm">
            © 2025 MergeAI. Powered by advanced AI technology.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Built with ♥ for developers who value clean, maintainable code.
          </p>
        </div>
      </div>
    </footer>
  );
};