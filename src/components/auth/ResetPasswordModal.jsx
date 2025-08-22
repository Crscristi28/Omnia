// 🔐 Reset Password Modal Component - Password reset/change with Glassmorphism design
import React, { useState } from 'react';
import authService from '../../services/auth/supabaseAuth';

const ResetPasswordModal = ({ isOpen, onClose, user }) => {
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Determine if user is logged in
  const isLoggedIn = !!user;

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
        // User is not logged in - send reset email
        const result = await authService.resetPasswordForEmail(email);
        
        if (result.error) {
          setError(result.error);
        } else {
          setSuccess('Email pro reset hesla byl odeslán. Zkontrolujte svou emailovou schránku.');
          setTimeout(() => {
            onClose();
          }, 3000);
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
            onClick={onClose}
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
            : 'Zadejte email a my vám pošleme odkaz pro reset hesla'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isLoggedIn && (
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

          {isLoggedIn && (
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

          {/* Submit button */}
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
             isLoggedIn ? 'Změnit heslo' : 'Odeslat reset email'}
          </button>
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