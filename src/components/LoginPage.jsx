import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; // Import from your centralized firebase.js

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState({
    login: false,
    google: false,
    facebook: false,
    forgot: false
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/explore');
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // --- Helper Functions for UI state ---
  const showLoading = (buttonName) => setIsLoading(prev => ({ ...prev, [buttonName]: true }));
  const hideLoading = (buttonName) => setIsLoading(prev => ({ ...prev, [buttonName]: false }));
  const showError = (message) => { setErrorMessage(message); setSuccessMessage(''); };
  const showSuccess = (message) => { setSuccessMessage(message); setErrorMessage(''); };
  const clearMessages = () => { setErrorMessage(''); setSuccessMessage(''); };

  // --- Action Handlers ---
  const redirectToExplore = () => {
    showSuccess('Login successful! Redirecting...');
    setTimeout(() => {
      navigate('/explore');
    }, 1500);
  };

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearMessages();
    if (!email.trim() || !password) {
      showError('Please fill in all fields.');
      return;
    }
    showLoading('login');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      redirectToExplore();
    } catch (error) {
      hideLoading('login');
      let displayMessage = "An unexpected error occurred. Please try again.";
      switch (error.code) {
        case 'auth/invalid-email':
          displayMessage = "Invalid email format. Please check your email address.";
          break;
        case 'auth/user-disabled':
          displayMessage = "Your account has been disabled.";
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          displayMessage = "Invalid email or password. Please try again.";
          break;
        case 'auth/too-many-requests':
          displayMessage = "Too many login attempts. Please try again later.";
          break;
        case 'auth/network-request-failed':
          displayMessage = "Network error. Please check your connection.";
          break;
      }
      showError(displayMessage);
    }
  };

  const handleSocialSignIn = async (providerName) => {
    clearMessages();
    showLoading(providerName);
    let provider;
    if (providerName === 'google') provider = new GoogleAuthProvider();
    if (providerName === 'facebook') provider = new FacebookAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      redirectToExplore();
    } catch (error) {
      hideLoading(providerName);
      let displayMessage = `${providerName.charAt(0).toUpperCase() + providerName.slice(1)} sign-in failed. Please try again.`;
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          displayMessage = `${providerName.charAt(0).toUpperCase() + providerName.slice(1)} sign-in was cancelled.`;
          break;
        case 'auth/cancelled-popup-request':
          displayMessage = `Another ${providerName} sign-in is already in progress.`;
          break;
        case 'auth/account-exists-with-different-credential':
          displayMessage = `An account with this email already exists using a different sign-in method.`;
          break;
        case 'auth/popup-blocked':
          displayMessage = `Pop-up blocked. Please allow pop-ups and try again.`;
          break;
      }
      showError(displayMessage);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    clearMessages();
    if (!email.trim()) {
      showError("Please enter your email address first to reset your password.");
      return;
    }
    showLoading('forgot');
    try {
      await sendPasswordResetEmail(auth, email);
      hideLoading('forgot');
      showSuccess("Password reset email sent! Please check your inbox.");
    } catch (error) {
      hideLoading('forgot');
      let displayMessage = "Failed to send password reset email. Please try again.";
      switch (error.code) {
        case 'auth/invalid-email':
          displayMessage = "Invalid email format.";
          break;
        case 'auth/user-not-found':
          displayMessage = "No user found with this email address.";
          break;
      }
      showError(displayMessage);
    }
  };

  if (checkingAuth) {
    return <div style={{color: '#5ab9ea', fontSize: '1.5rem', textAlign: 'center', marginTop: '20vh'}}>Loading...</div>;
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
      background: `
        linear-gradient(rgba(152, 27, 27, 0.7), rgba(20, 20, 20, 0.7)),
        url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=800&fit=crop') no-repeat center center fixed
      `,
      backgroundSize: 'cover',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1rem',
      boxSizing: 'border-box'
    }}>
      {/* Centered form box */}
      <div style={{
        background: 'rgba(20, 20, 20, 0.85)',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 0 25px rgba(0, 0, 0, 0.8)',
        width: '100%',
        maxWidth: '450px',
        color: '#eee',
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          color: '#5ab9ea',
          fontSize: '2.5rem',
          fontWeight: 'bold'
        }}>
          Welcome to BookVerse
        </h1>

        <div style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          color: '#bbb',
          fontSize: '0.9rem'
        }}>
          Don't have an account? {' '}
          <Link to="/signup" style={{ color: '#5ab9ea', fontWeight: 'bold', textDecoration: 'none' }}>
            Sign up for free
          </Link>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 'bold', color: '#ccc' }}>
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #555',
              borderRadius: '4px', boxSizing: 'border-box', backgroundColor: '#333',
              color: '#eee', transition: 'border-color 0.3s ease, box-shadow 0.3s ease', fontSize: '1rem'
            }}
          />

          {/* Password Input */}
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 'bold', color: '#ccc' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Enter password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 2.5rem 0.75rem 0.75rem', marginBottom: '1rem', border: '1px solid #555',
                borderRadius: '4px', boxSizing: 'border-box', backgroundColor: '#333', color: '#eee',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease', fontSize: '1rem'
              }}
            />
            <span
              onClick={handlePasswordToggle}
              style={{
                position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-60%)',
                cursor: 'pointer', color: showPassword ? '#5ab9ea' : '#aaa', fontSize: '1.5rem', userSelect: 'none'
              }}
              title="Show/Hide Password"
            >
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>

          {/* Remember Me & Forgot Password */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '1rem', color: '#bbb', fontSize: '0.9rem'
          }}>
            <label style={{ fontWeight: 'normal', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ marginRight: '0.4rem', cursor: 'pointer' }}
              />
              Remember Me
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              style={{
                background: 'none',
                border: 'none',
                color: '#5ab9ea',
                textDecoration: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                padding: 0
              }}
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading.login}
            style={{
              width: '100%', padding: '0.8rem', backgroundColor: '#5ab9ea', border: 'none',
              borderRadius: '4px', color: '#111', fontSize: '1.1rem', cursor: isLoading.login ? 'default' : 'pointer',
              fontWeight: 'bold', transition: 'background-color 0.3s ease, transform 0.2s ease', marginBottom: '1.5rem', opacity: isLoading.login ? 0.7 : 1
            }}
          >
            {isLoading.login ? 'Loading...' : 'Login'}
          </button>
        </form>

        {/* Social Login Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <button
            type="button"
            onClick={() => handleSocialSignIn('google')}
            disabled={isLoading.google}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem',
              borderRadius: '4px', color: 'white', fontWeight: 'bold', cursor: isLoading.google ? 'default' : 'pointer',
              fontSize: '1rem', transition: 'background-color 0.3s ease', border: 'none',
              backgroundColor: '#de5246', opacity: isLoading.google ? 0.7 : 1
            }}
          >
            <svg style={{ width: '20px', height: '20px', fill: 'white' }} viewBox="0 0 24 24"><path d="M21.35 11.1h-9.1v2.9h5.2c-.23 1.3-1.43 3.8-5.2 3.8-3.15 0-5.7-2.6-5.7-5.8s2.55-5.8 5.7-5.8c1.8 0 3 .77 3.7 1.44l2.52-2.42c-1.57-1.46-3.58-2.4-6.22-2.4-5 0-9 4-9 9s4 9 9 9c5.18 0 8.62-3.65 8.62-8.8 0-.6-.07-1.06-.19-1.32z"/></svg>
            {isLoading.google ? 'Loading...' : 'Login with Google'}
          </button>
          <button
            type="button"
            onClick={() => handleSocialSignIn('facebook')}
            disabled={isLoading.facebook}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem',
              borderRadius: '4px', color: 'white', fontWeight: 'bold', cursor: isLoading.facebook ? 'default' : 'pointer',
              fontSize: '1rem', transition: 'background-color 0.3s ease', border: 'none',
              backgroundColor: '#3b5998', opacity: isLoading.facebook ? 0.7 : 1
            }}
          >
            <svg style={{ width: '20px', height: '20px', fill: 'white' }} viewBox="0 0 24 24"><path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 5 3.7 9.1 8.5 9.9v-7H8v-3h2.5V9.5C10.5 7 11.9 6 14 6c1 0 1.8.1 2 .1v2.3h-1.2c-1 0-1.2.5-1.2 1.1V12h2.4l-.4 3h-2v7c4.8-.8 8.5-4.9 8.5-9.9z"/></svg>
            {isLoading.facebook ? 'Loading...' : 'Login with Facebook'}
          </button>
        </div>

        {/* Status Messages */}
        {errorMessage && <p style={{ color: '#f87171', textAlign: 'center', marginTop: '1.5rem', fontWeight: 'bold' }}>{errorMessage}</p>}
        {successMessage && <p style={{ color: '#4ade80', textAlign: 'center', marginTop: '1.5rem', fontWeight: 'bold' }}>{successMessage}</p>}

      </div>
    </div>
  );
};

export default LoginPage;