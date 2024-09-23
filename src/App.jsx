/* eslint-disable no-unused-vars */
import React from 'react';
import Home from './pages/Home';
import { ThemeProvider } from 'next-themes';

const App = () => {
  return (
    <ThemeProvider attribute="class">
        <Home />
    </ThemeProvider>
  );
};

export default App;
