// 🔐 Auth Modal Component - Login/Signup with Glassmorphism design
import React, { useState } from 'react';
import authService from '../../services/auth/supabaseAuth';
import { getTranslation, detectLanguage } from '../../utils/text/translations';

const AuthModal = ({ onSuccess, onForgotPassword, uiLanguage = 'cs' }) => {
  const t = getTranslation(uiLanguage);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [otp, setOtp] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await authService.signInWithEmail(email, password);
        
        if (result.error) {
          setError(result.error);
        } else if (result.user) {
          console.log('✅ Login success:', result.user.email);
          onSuccess(result.user);
        }
      } else {
        // Signup flow - detect language and send it to Supabase
        const deviceLanguage = detectLanguage();
        result = await authService.signUpWithEmail(email, password, deviceLanguage);
        
        if (result.error) {
          setError(result.error);
        } else {
          console.log('✅ Signup success, needs confirmation:', result.user?.email || email);
          setSuccess(t('registrationSuccessful'));
          setNeedsConfirmation(true);
          setTimeout(() => setSuccess(''), 3000);
        }
      }
    } catch (err) {
      setError(t('somethingWentWrong'));
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP confirmation for signup
  const handleConfirmSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await authService.verifySignupOTP(email, otp);
      
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        console.log('✅ Signup confirmed:', result.user.email);
        setSuccess(t('accountConfirmed'));
        setTimeout(() => {
          onSuccess(result.user);
        }, 1500);
      }
    } catch (err) {
      setError(t('somethingWentWrong'));
      console.error('Signup confirmation error:', err);
    } finally {
      setLoading(false);
    }
  };

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
      zIndex: 10000,
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
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            margin: 0
          }}>
            {needsConfirmation ? t('confirmRegistration') : t('welcomeToOmnia')}
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9rem',
            marginTop: '0.5rem'
          }}>
            {needsConfirmation 
              ? t('enterCodeFromEmail')
              : isLogin ? t('pleaseSignIn') : t('createNewAccount')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={needsConfirmation ? handleConfirmSignup : handleSubmit}>
          {/* Email input - show only when not in OTP confirmation mode */}
          {!needsConfirmation && (
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="email"
                placeholder={t('email')}
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

          {/* Password input - show only when not in OTP confirmation mode */}
          {!needsConfirmation && (
            <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="password"
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          )}

          {/* OTP input - show when in confirmation mode */}
          {needsConfirmation && (
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
              
              {/* Show email for reference */}
              <p style={{
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '0.8rem',
                textAlign: 'center',
                marginTop: '0.5rem'
              }}>
                {t('codeSentTo')} {email}
              </p>
            </div>
          )}

          {/* Forgot password link - only show for login and not in OTP mode */}
          {isLogin && !needsConfirmation && (
            <div style={{
              textAlign: 'right',
              marginBottom: '1rem'
            }}>
              <button
                type="button"
                onClick={() => {
                  if (onForgotPassword) {
                    onForgotPassword(email); // Pass email if already entered
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(59, 130, 246, 0.8)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                {t('forgotPassword')}
              </button>
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

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? 'rgba(59, 130, 246, 0.5)' : '#3b82f6',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {loading ? t('loading') : 
             needsConfirmation ? t('confirmCode') :
             isLogin ? t('signIn') : t('register')}
          </button>
        </form>

        {/* Toggle login/signup - hide during OTP confirmation */}
        {!needsConfirmation && (
          <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9rem'
          }}>
            {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                marginLeft: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                textDecoration: 'underline'
              }}
            >
              {isLogin ? t('register') : t('signIn')}
            </button>
          </p>
          </div>
        )}
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

export default AuthModal;