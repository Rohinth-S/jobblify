import { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { AnimatedRoutes } from './components/AnimatedRoutes';
import './App.css';

function App() {
  const [userRole, setUserRole] = useState<'publisher' | 'freelancer'>('publisher');

  const selectRole = (role: 'publisher' | 'freelancer') => {
    setUserRole(role);
  };

  return (
    <WalletProvider>
      <Router>
        <AnimatedRoutes userRole={userRole} selectRole={selectRole} />
      </Router>
    </WalletProvider>
  );
}

export default App;
