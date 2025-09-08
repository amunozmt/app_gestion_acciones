
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Rastreador de Cartera de Acciones
      </h1>
      <p className="mt-2 text-lg text-gray-400">
        Monitorea tus inversiones y calcula tu rentabilidad en tiempo real.
      </p>
    </header>
  );
};

export default Header;
