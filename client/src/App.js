import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VisualizzaUtenti from './pages/VisualizzaUtenti';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <div>
        <Navbar /> {/* Navbar inclusa nel layout principale */}
        <Routes>
          <Route path="/utenti" element={<VisualizzaUtenti />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;