// 🔐 Reset Password Modal Component - Password reset/change with Glassmorphism design
import React, { useState, useEffect } from 'react';
import authService from '../../services/auth/supabaseAuth';

const ResetPasswordModal = ({ isOpen, onClose, user, initialEmail = '' }) => {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'newPassword'
  const [email, setEmail] = useState(initialEmail || user?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSentTime, setOtpSentTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // Determine if user is logged in
  const isLoggedIn = !!user;
  
  // Countdown timer for OTP expiration
  useEffect(() => {
    if (otpSentTime && step === 'otp') {
      const interval = setInterval(() => {
        const elapsed = Date.now() - otpSentTime;
        const remaining = Math.max(0, 600000 - elapsed); // 10 minutes in ms
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [otpSentTime, step]);
  
  // Format time remaining as MM:SS
  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Resend OTP
  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const result = await authService.sendPasswordResetOTP(email);
      
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Nový kód byl odeslán!');
        setOtpSentTime(Date.now());
        setOtp('');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Něco se pokazilo. Zkuste to prosím znovu.');
      console.error('Resend OTP error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset modal to initial state when closing
  const handleClose = () => {
    setStep('email');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setOtpSentTime(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLoggedIn) {
        // User is logged in - change password directly
        if (newPassword !== confirmPassword) {
          setError('Hesla se neshodují');
          setLoading(false);
          return;
        }
        
        if (newPassword.length < 6) {
          setError('Heslo musí mít alespoň 6 znaků');
          setLoading(false);
          return;
        }

        const result = await authService.updatePassword(newPassword);
        
        if (result.error) {
          setError(result.error);
        } else {
          setSuccess('Heslo bylo úspěšně změněno!');
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } else {
        // Handle OTP flow for non-logged in users
        if (step === 'email') {
          // Step 1: Send OTP
          const result = await authService.sendPasswordResetOTP(email);
          
          if (result.error) {
            setError(result.error);
          } else {
            setSuccess('Kód byl odeslán na váš email.');
            setOtpSentTime(Date.now());
            setStep('otp');
            setTimeout(() => setSuccess(''), 3000);
          }
        } else if (step === 'otp') {
          // Step 2: Verify OTP
          const result = await authService.verifyOTP(email, otp);
          
          if (result.error) {
            setError(result.error);
          } else {
            setSuccess('Kód ověřen! Nyní nastavte nové heslo.');
            setStep('newPassword');
            setTimeout(() => setSuccess(''), 3000);
          }
        } else if (step === 'newPassword') {
          // Step 3: Update password
          if (newPassword !== confirmPassword) {
            setError('Hesla se neshodují');
            setLoading(false);
            return;
          }
          
          if (newPassword.length < 6) {
            setError('Heslo musí mít alespoň 6 znaků');
            setLoading(false);
            return;
          }

          const result = await authService.updatePassword(newPassword);
          
          if (result.error) {
            setError(result.error);
          } else {
            setSuccess('Heslo bylo úspěšně změněno!');
            setTimeout(() => {
              handleClose();
            }, 2000);
          }
        }
      }
    } catch (err) {
      setError('Něco se pokazilo. Zkuste to prosím znovu.');
      console.error('Password reset/update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10001,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        width: '90%',
        maxWidth: '400px',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '2rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            margin: 0
          }}>
            🔐 {isLoggedIn ? 'Změnit heslo' : 'Reset hesla'}
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.9rem',
          marginBottom: '1.5rem'
        }}>
          {isLoggedIn 
            ? 'Zadejte nové heslo pro váš účet' 
            : step === 'email' 
              ? 'Zadejte email a my vám pošleme kód pro reset hesla'
              : step === 'otp'
                ? 'Zadejte 6-místný kód z emailu'
                : 'Nastavte nové heslo pro váš účet'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email input - show for non-logged users in email step */}
          {!isLoggedIn && step === 'email' && (
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                }}
              />
            </div>
          )}
          
          {/* OTP input - show in OTP step */}
          {!isLoggedIn && step === 'otp' && (
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                }}
                required
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '1.2rem',
                  textAlign: 'center',
                  letterSpacing: '0.5rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                }}
              />
              
              {/* Timer and resend functionality */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.75rem'
              }}>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '0.8rem',
                  margin: 0
                }}>
                  Kód odeslán na: {email}
                </p>
                
                {timeRemaining > 0 ? (
                  <p style={{
                    color: 'rgba(59, 130, 246, 0.8)',
                    fontSize: '0.9rem',
                    margin: 0,
                    fontWeight: 'bold'
                  }}>
                    {formatTime(timeRemaining)}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: loading ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.8)',
                      fontSize: '0.85rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      textDecoration: 'underline',
                      padding: 0
                    }}
                  >
                    {loading ? 'Odesílá...' : 'Poslat znovu'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Password inputs - show for logged users OR in newPassword step */}
          {(isLoggedIn || (!isLoggedIn && step === 'newPassword')) && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="password"
                  placeholder="Nové heslo"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                    e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <input
                  type="password"
                  placeholder="Potvrdit nové heslo"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                    e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                  }}
                />
              </div>
            </>
          )}

          {/* Error message */}
          {error && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '0.9rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              color: '#22c55e',
              fontSize: '0.9rem',
              marginBottom: '1rem'
            }}>
              {success}
            </div>
          )}

          {/* Back button for OTP and newPassword steps */}
          {!isLoggedIn && (step === 'otp' || step === 'newPassword') && (
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <button
                type="button"
                onClick={() => {
                  if (step === 'otp') {
                    setStep('email');
                  } else if (step === 'newPassword') {
                    setStep('otp');
                  }
                  setError('');
                  setSuccess('');
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                ← Zpět
              </button>
              
              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || success}
                style={{
                  flex: 2,
                  padding: '0.75rem',
                  backgroundColor: loading || success ? 'rgba(59, 130, 246, 0.5)' : '#3b82f6',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: loading || success ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loading || success ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading && !success) {
                    e.target.style.backgroundColor = '#2563eb';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && !success) {
                    e.target.style.backgroundColor = '#3b82f6';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {loading ? 'Načítání...' : 
                 success ? 'Hotovo!' :
                 step === 'otp' ? 'Ověřit kód' :
                 'Změnit heslo'}
              </button>
            </div>
          )}
          
          {/* Single submit button for logged users and email step */}
          {(isLoggedIn || step === 'email') && (
            <button
              type="submit"
              disabled={loading || success}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: loading || success ? 'rgba(59, 130, 246, 0.5)' : '#3b82f6',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: loading || success ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: loading || success ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading && !success) {
                  e.target.style.backgroundColor = '#2563eb';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && !success) {
                  e.target.style.backgroundColor = '#3b82f6';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading ? 'Načítání...' : 
               success ? 'Hotovo!' :
               isLoggedIn ? 'Změnit heslo' :
               'Odeslat kód'}
            </button>
          )}
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
};

export default ResetPasswordModal;