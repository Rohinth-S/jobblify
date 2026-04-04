import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';

import LandingPage from '../pages/LandingPage';
import WalletNotConnected from '../pages/WalletNotConnected';
import Profile from '../pages/Profile';
import Header from './Header';
import PublisherYourTasks from '../pages/publisher/YourTasks';
import PublisherTaskDetail from '../pages/publisher/TaskDetail';
import PublisherAddTask from '../pages/publisher/AddTask';
import FreelancerBrowseTasks from '../pages/freelancer/BrowseTasks';
import FreelancerTaskDescription from '../pages/freelancer/TaskDescription';
import FreelancerYourTasks from '../pages/freelancer/YourTasks';
import FreelancerTaskSubmission from '../pages/freelancer/TaskSubmission';
import { AnimatedLayout } from './AnimatedLayout';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { walletAddress } = useWallet();
  if (!walletAddress) return <WalletNotConnected />;
  return <>{children}</>;
};

interface AnimatedRoutesProps {
  userRole: 'publisher' | 'freelancer';
  selectRole: (role: 'publisher' | 'freelancer') => void;
}

export const AnimatedRoutes: React.FC<AnimatedRoutesProps> = ({ userRole, selectRole }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Landing Page */}
        <Route path="/" element={<AnimatedLayout><LandingPage /></AnimatedLayout>} />

        {/* Dashboard redirect by role */}
        <Route
          path="/dashboard"
          element={
            <AnimatedLayout>
              <ProtectedRoute>
                <Navigate to={userRole === 'publisher' ? '/publisher/tasks' : '/freelancer/browse'} replace />
              </ProtectedRoute>
            </AnimatedLayout>
          }
        />

        {/* Profile Page */}
        <Route
          path="/profile"
          element={
            <AnimatedLayout>
              <ProtectedRoute>
                <Header userRole={userRole} onSelectRole={selectRole} />
                <Profile />
              </ProtectedRoute>
            </AnimatedLayout>
          }
        />

        {/* Publisher Routes */}
        <Route
          path="/publisher"
          element={
            <ProtectedRoute>
              <Header userRole={userRole} onSelectRole={selectRole} />
            </ProtectedRoute>
          }
        />
        <Route path="/publisher/tasks" element={<AnimatedLayout><ProtectedRoute><Header userRole={userRole} onSelectRole={selectRole} /><PublisherYourTasks /></ProtectedRoute></AnimatedLayout>} />
        <Route path="/publisher/task/:id" element={<AnimatedLayout><ProtectedRoute><Header userRole={userRole} onSelectRole={selectRole} /><PublisherTaskDetail /></ProtectedRoute></AnimatedLayout>} />
        <Route path="/publisher/add-task" element={<AnimatedLayout><ProtectedRoute><Header userRole={userRole} onSelectRole={selectRole} /><PublisherAddTask /></ProtectedRoute></AnimatedLayout>} />

        {/* Freelancer Routes */}
        <Route path="/freelancer/browse" element={<AnimatedLayout><ProtectedRoute><Header userRole={userRole} onSelectRole={selectRole} /><FreelancerBrowseTasks /></ProtectedRoute></AnimatedLayout>} />
        <Route path="/freelancer/task/:id" element={<AnimatedLayout><ProtectedRoute><Header userRole={userRole} onSelectRole={selectRole} /><FreelancerTaskDescription /></ProtectedRoute></AnimatedLayout>} />
        <Route path="/freelancer/your-tasks" element={<AnimatedLayout><ProtectedRoute><Header userRole={userRole} onSelectRole={selectRole} /><FreelancerYourTasks /></ProtectedRoute></AnimatedLayout>} />
        <Route path="/freelancer/submit/:id" element={<AnimatedLayout><ProtectedRoute><Header userRole={userRole} onSelectRole={selectRole} /><FreelancerTaskSubmission /></ProtectedRoute></AnimatedLayout>} />

        <Route path="*" element={<AnimatedLayout><WalletNotConnected /></AnimatedLayout>} />
      </Routes>
    </AnimatePresence>
  );
};
