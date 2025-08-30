// 💰 PricingModal.jsx - Modern pricing modal for Omnia subscription plans
import React from 'react';
import { X, Check, Star } from 'lucide-react';

const PricingModal = ({ 
  isOpen, 
  onClose,
  currentPlan = 'free' // 'free', 'premium-monthly', 'premium-quarterly'
}) => {
  
  if (!isOpen) return null;

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '0',
      currency: 'Free',
      period: 'forever',
      badge: null,
      features: [
        '20 messages per day',
        '3 file uploads daily',
        '3 image generations daily',
        'Basic AI models',
        'Standard support'
      ],
      buttonText: currentPlan === 'free' ? 'Current Plan' : 'Downgrade',
      buttonDisabled: currentPlan === 'free',
      gradient: 'linear-gradient(135deg, rgba(107, 114, 128, 0.8), rgba(75, 85, 99, 0.9))',
      borderColor: currentPlan === 'free' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)'
    },
    {
      id: 'premium-monthly',
      name: 'Premium',
      price: '350',
      currency: 'Kč',
      period: 'per month',
      badge: null,
      features: [
        'Unlimited messages',
        'Unlimited file uploads',
        'Unlimited image generations',
        'All AI models access',
        'Priority support',
        'Advanced features'
      ],
      buttonText: currentPlan === 'premium-monthly' ? 'Current Plan' : 'Upgrade Now',
      buttonDisabled: currentPlan === 'premium-monthly',
      gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.9))',
      borderColor: currentPlan === 'premium-monthly' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(255, 255, 255, 0.15)'
    },
    {
      id: 'premium-quarterly',
      name: 'Premium',
      price: '900',
      currency: 'Kč',
      period: 'for 3 months',
      badge: 'SAVE 25%',
      features: [
        'Unlimited messages',
        'Unlimited file uploads', 
        'Unlimited image generations',
        'All AI models access',
        'Priority support',
        'Advanced features'
      ],
      buttonText: currentPlan === 'premium-quarterly' ? 'Current Plan' : 'Best Value',
      buttonDisabled: currentPlan === 'premium-quarterly',
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.8), rgba(5, 150, 105, 0.9))',
      borderColor: currentPlan === 'premium-quarterly' ? 'rgba(16, 185, 129, 0.8)' : 'rgba(255, 255, 255, 0.15)',
      popular: true
    }
  ];

  return (
    <>
      {/* MODAL OVERLAY */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          animation: 'fadeIn 0.3s ease'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* MODAL CONTENT */}
        <div 
          style={{
            width: '100%',
            maxWidth: '1200px',
            height: '90vh',
            background: 'linear-gradient(135deg, rgba(0, 4, 40, 0.95), rgba(0, 78, 146, 0.92))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div style={{
            padding: '1.5rem 2rem 1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            flexShrink: 0
          }}>
            <div>
              <h1 style={{
                color: 'white',
                fontSize: '1.75rem',
                fontWeight: '700',
                margin: '0 0 0.25rem 0',
                letterSpacing: '-0.025em'
              }}>
                Choose Your Plan
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1rem',
                margin: 0,
                fontWeight: '400'
              }}>
                Unlock the full potential of Omnia AI
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                outline: 'none',
                padding: '0.5rem',
                borderRadius: '8px',
                fontSize: '1.25rem',
                lineHeight: 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.color = 'rgba(255, 255, 255, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'rgba(255, 255, 255, 0.7)';
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* SCROLLABLE PRICING CARDS */}
          <div style={{
            flex: 1,
            padding: '1.5rem 2rem',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              alignItems: 'stretch'
            }}>
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                style={{
                  background: plan.gradient,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: `2px solid ${plan.borderColor}`,
                  padding: '2rem',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'default',
                  boxShadow: currentPlan === plan.id 
                    ? '0 20px 40px rgba(59, 130, 246, 0.3)' 
                    : '0 10px 30px rgba(0, 0, 0, 0.2)',
                  transform: currentPlan === plan.id ? 'scale(1.05)' : 'scale(1)',
                  zIndex: currentPlan === plan.id ? 10 : 1
                }}
                onMouseEnter={(e) => {
                  if (currentPlan !== plan.id) {
                    e.target.style.transform = 'scale(1.02) translateY(-4px)';
                    e.target.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.25)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPlan !== plan.id) {
                    e.target.style.transform = 'scale(1) translateY(0)';
                    e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
                  }
                }}
              >
                {/* POPULAR BADGE */}
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-1px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '0 0 12px 12px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    letterSpacing: '0.05em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
                  }}>
                    <Star size={12} fill="currentColor" />
                    MOST POPULAR
                  </div>
                )}

                {/* SAVE BADGE */}
                {plan.badge && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    letterSpacing: '0.05em',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                  }}>
                    {plan.badge}
                  </div>
                )}

                {/* PLAN NAME */}
                <div style={{
                  marginBottom: '1rem'
                }}>
                  <h3 style={{
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {plan.name}
                  </h3>
                  
                  {/* PRICE */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.5rem',
                    marginBottom: '0.25rem'
                  }}>
                    <span style={{
                      color: 'white',
                      fontSize: '3rem',
                      fontWeight: '800',
                      lineHeight: '1'
                    }}>
                      {plan.price}
                    </span>
                    <span style={{
                      color: 'white',
                      fontSize: '1.25rem',
                      fontWeight: '600'
                    }}>
                      {plan.currency}
                    </span>
                  </div>
                  
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '1rem',
                    margin: 0,
                    fontWeight: '500'
                  }}>
                    {plan.period}
                  </p>
                </div>

                {/* FEATURES */}
                <div style={{
                  marginBottom: '2rem'
                }}>
                  {plan.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '0.95rem',
                        fontWeight: '500'
                      }}
                    >
                      <Check 
                        size={18} 
                        style={{ 
                          color: '#10B981',
                          flexShrink: 0
                        }} 
                        strokeWidth={3}
                      />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA BUTTON */}
                <button
                  disabled={plan.buttonDisabled}
                  style={{
                    width: '100%',
                    background: plan.buttonDisabled 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '1rem',
                    color: plan.buttonDisabled ? 'rgba(255, 255, 255, 0.6)' : '#1F2937',
                    cursor: plan.buttonDisabled ? 'default' : 'pointer',
                    outline: 'none',
                    fontSize: '1rem',
                    fontWeight: '700',
                    letterSpacing: '0.025em',
                    transition: 'all 0.2s ease',
                    boxShadow: plan.buttonDisabled 
                      ? 'none' 
                      : '0 4px 12px rgba(0, 0, 0, 0.15)',
                    opacity: plan.buttonDisabled ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!plan.buttonDisabled) {
                      e.target.style.background = 'rgba(255, 255, 255, 1)';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.25)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!plan.buttonDisabled) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }
                  }}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
            </div>
          </div>

          {/* FOOTER */}
          <div style={{
            padding: '1rem 2rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
            flexShrink: 0
          }}>
            <p style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.9rem',
              margin: 0,
              fontWeight: '400'
            }}>
              All plans include secure data handling and regular updates
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @media (max-width: 768px) {
          .pricing-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
};

export default PricingModal;