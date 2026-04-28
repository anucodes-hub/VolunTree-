import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Phone, Mail, ArrowRight, ShieldCheck, CheckCircle, RefreshCw } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

interface LoginProps {
  onSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { setupRecaptcha, sendOTP } = useAuth();
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  useEffect(() => {
    if (method === 'phone') {
      setupRecaptcha('recaptcha-container');
    }
  }, [method]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onSuccess();
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        // User doesn't exist yet — auto-register
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          onSuccess();
        } catch (regErr: any) {
          if (regErr.code === 'auth/email-already-in-use') {
            setError('Incorrect password. Please try again.');
          } else if (regErr.code === 'auth/weak-password') {
            setError('Password must be at least 6 characters.');
          } else {
            setError(regErr.message);
          }
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await sendOTP(phone);
      setConfirmationResult(result);
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await confirmationResult.confirm(otp);
      onSuccess();
    } catch (err: any) {
      setError("Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
      <div className="glass shadow-premium" style={{ padding: '3rem', borderRadius: '40px', backgroundColor: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '22px', 
            backgroundColor: 'var(--primary)', color: 'white', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', boxShadow: '0 8px 24px rgba(30, 122, 71, 0.25)'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Secure Login</h2>
          <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>Access your Sahayak dashboard</p>
        </div>

        {/* Method Switcher */}
        <div style={{ 
          display: 'flex', backgroundColor: 'var(--bg-warm)', 
          padding: '4px', borderRadius: '16px', marginBottom: '2rem' 
        }}>
          <button 
            onClick={() => { setMethod('phone'); setStep('input'); }}
            style={{ 
              flex: 1, padding: '10px', borderRadius: '12px', border: 'none',
              backgroundColor: method === 'phone' ? 'white' : 'transparent',
              color: method === 'phone' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <Phone size={16} /> Phone
          </button>
          <button 
            onClick={() => { setMethod('email'); setStep('input'); }}
            style={{ 
              flex: 1, padding: '10px', borderRadius: '12px', border: 'none',
              backgroundColor: method === 'email' ? 'white' : 'transparent',
              color: method === 'email' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <Mail size={16} /> Email
          </button>
        </div>

        <AnimatePresence mode="wait">
          {method === 'phone' ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              {step === 'input' ? (
                <form onSubmit={handlePhoneSubmit}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, opacity: 0.6, marginBottom: '8px' }}>PHONE NUMBER</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="tel" 
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        style={{ 
                          width: '100%', padding: '1.25rem', borderRadius: '16px', 
                          border: '2px solid var(--border)', outline: 'none', 
                          fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.02em'
                        }}
                      />
                    </div>
                  </div>
                  <button className="primary" disabled={loading} style={{ width: '100%', padding: '1.25rem', borderRadius: '18px', fontSize: '1.1rem' }}>
                    {loading ? <RefreshCw className="spin" size={20} /> : <>Send OTP Code <ArrowRight size={20} style={{ marginLeft: '10px' }} /></>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpVerify}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, opacity: 0.6, marginBottom: '8px' }}>6-DIGIT OTP</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      style={{ 
                        width: '100%', padding: '1.25rem', borderRadius: '16px', 
                        border: '2px solid var(--border)', outline: 'none', 
                        fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', letterSpacing: '0.5em'
                      }}
                    />
                  </div>
                  <button className="primary" disabled={loading} style={{ width: '100%', padding: '1.25rem', borderRadius: '18px', fontSize: '1.1rem' }}>
                    {loading ? <RefreshCw className="spin" size={20} /> : <>Verify & Login <CheckCircle size={20} style={{ marginLeft: '10px' }} /></>}
                  </button>
                  <button type="button" onClick={() => setStep('input')} style={{ width: '100%', background: 'none', border: 'none', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                    Change Phone Number
                  </button>
                </form>
              )}
            </motion.div>
          ) : (
            <motion.form 
              key="email"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleEmailLogin}
            >
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, opacity: 0.6, marginBottom: '8px' }}>EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  placeholder="name@organization.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', border: '2px solid var(--border)', outline: 'none', fontSize: '1rem', fontWeight: 600 }}
                />
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, opacity: 0.6, marginBottom: '8px' }}>PASSWORD</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', border: '2px solid var(--border)', outline: 'none', fontSize: '1rem', fontWeight: 600 }}
                />
              </div>
              <button className="primary" disabled={loading} style={{ width: '100%', padding: '1.25rem', borderRadius: '18px', fontSize: '1.1rem' }}>
                {loading ? <RefreshCw className="spin" size={20} /> : <>Login to Sahayak <ArrowRight size={20} style={{ marginLeft: '10px' }} /></>}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
              marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', 
              backgroundColor: 'rgba(226, 75, 74, 0.1)', color: 'var(--accent)', 
              fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' 
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Recaptcha Placeholder */}
        <div id="recaptcha-container" style={{ marginTop: '1rem' }}></div>
      </div>
      
      <p style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.4, fontSize: '0.8rem', fontWeight: 600 }}>
        By logging in, you agree to VolunTree's Ethical Data Policy
      </p>
    </div>
  );
};

export default Login;
