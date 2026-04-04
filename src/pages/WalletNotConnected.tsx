import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, AlertCircle, ArrowLeft, ShieldCheck, Activity } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import LiquidEther from './LiquidEther';

const WalletNotConnected: React.FC = () => {
  const navigate = useNavigate();
  const { connectWallet, isConnecting } = useWallet();

  const handleConnect = async () => {
    await connectWallet();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen relative bg-[#0a0a0a] text-foreground flex flex-col items-center justify-center overflow-hidden selection:bg-foreground selection:text-background font-sans">
      {/* Background LiquidEther - Lower opacity for focus */}
      <div className="absolute inset-0 z-0 opacity-40">
        <LiquidEther
          colors={[ '#ffffff', '#e0e0e0', '#cccccc' ]}
          mouseForce={15}
          cursorSize={80}
          isViscous
          resolution={0.4}
          autoDemo
          autoSpeed={0.3}
          autoIntensity={1.5}
        />
      </div>

      <main className="relative z-10 w-full max-w-lg px-6">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          {/* Subtle Metallic/Mercury Shimmer instead of Neon Pulse */}
          <div className="absolute -inset-1 bg-gradient-to-tr from-white/10 via-transparent to-white/5 rounded-[2.5rem] blur-xl opacity-30 shadow-[0_0_80px_-15px_rgba(255,255,255,0.1)]" />
          
          <div className="relative bg-secondary/20 border border-white/10 rounded-[2rem] p-10 md:p-14 backdrop-blur-3xl shadow-[0_0_50px_-20px_rgba(0,0,0,0.5)] overflow-hidden group">
            {/* Glossy shine overlay */}
            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 transition-all duration-1000 group-hover:left-[100%] pointer-events-none" />
            {/* Top Badge */}
            <div className="flex justify-center mb-10">
              <div className="bg-secondary/40 border border-border/50 text-muted-foreground px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest flex items-center gap-2 backdrop-blur-xl">
                <ShieldCheck className="w-4 h-4 text-foreground" />
                <span className="text-foreground/90">Identity Protocol</span>
              </div>
            </div>

            {/* Icon Node Style */}
            <div className="flex justify-center mb-10">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={{ y: [0, -10, 0] }}
                transition={{ 
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-24 h-24 rounded-3xl bg-foreground text-background flex items-center justify-center shadow-[0_0_50px_-5px_rgba(255,255,255,0.3)] relative"
              >
                <Wallet className="w-10 h-10" />
                {/* Micro-activity line */}
                <div className="absolute -bottom-2 -right-2 bg-secondary/80 border border-border/50 p-2 rounded-xl backdrop-blur-md">
                   <Activity className="w-4 h-4 text-foreground animate-pulse" />
                </div>
              </motion.div>
            </div>

            <div className="text-center space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                Authorize Wallet
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">
                Connect your account to access the decentralized work marketplace and start building.
              </p>

              <div className="pt-4">
                <motion.button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-foreground text-background px-8 py-5 rounded-2xl text-lg font-bold shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 group/btn"
                >
                  <Wallet className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                  <span>{isConnecting ? 'Authorizing...' : 'Connect Wallet'}</span>
                </motion.button>
              </div>

              {/* Warning/Info Box */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-10 p-5 bg-foreground/5 border border-border/30 rounded-2xl flex items-start gap-4 text-sm text-left backdrop-blur-md"
              >
                <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-muted-foreground/80 leading-relaxed">
                  Authentication requires an active Web3 provider like MetaMask or Rabby. Ensure your extension is unlocked.
                </p>
              </motion.div>

              <div className="pt-6">
                <button
                  onClick={() => navigate('/')}
                  className="group flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-white transition-all mx-auto"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Return to Overview</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Decorative Gradient Glows */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#5227FF]/10 blur-[150px] -z-10 rounded-full" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF9FFC]/10 blur-[150px] -z-10 rounded-full" />
    </div>
  );
};

export default WalletNotConnected;

