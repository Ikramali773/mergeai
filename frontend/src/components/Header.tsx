import React from 'react';
import { Code2, Zap } from 'lucide-react';

export const Header = () => {
  return (
    <header className="relative py-16 px-4 text-center overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-green-600/20 blur-3xl"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/50"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Logo and title */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="relative">
            <Code2 className="w-12 h-12 text-accent-blue" />
            <Zap className="w-6 h-6 text-accent-purple absolute -top-1 -right-1" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
            MergeAI
          </h1>
        </div>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-300 font-mono mb-4">
          AST-Aware Code Merger
        </p>
        
        {/* Description */}
        <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
          Intelligently merge C# code files using advanced AI analysis. 
          Resolve conflicts, maintain structure, and optimize your codebase with precision.
        </p>
        
        {/* Animated dots */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-2 h-2 bg-accent-blue rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-accent-purple rounded-full animate-pulse delay-150"></div>
          <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse delay-300"></div>
        </div>
      </div>
    </header>
  );
};