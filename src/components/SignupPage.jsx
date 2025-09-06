import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Firebase config (should match your LoginPage)
const firebaseConfig = {
  apiKey: "AIzaSyBTqcs55CAr_wKD9JSUua_PGWfKRvPF-iQ",
  authDomain: "bookverse-himanshi.firebaseapp.com",
  projectId: "bookverse-himanshi",
  storageBucket: "bookverse-himanshi.appspot.com",
  messagingSenderId: "165229657841",
  appId: "1:165229657841:web:3eae5cf04ef35d2757f350",
  measurementId: "G-9D4FHJS9NG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const SignupPage = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Redirect to /explore if already logged in
    if (auth.currentUser) {
      navigate('/explore');
    }
  }, [navigate]);

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const showError = (message) => {
    setErrorMessage(message);
    setSuccessMessage('');
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setErrorMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!email.trim() || !password) {
      showError('Please fill in all fields.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      showSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      let displayMessage = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        displayMessage = "This email is already in use.";
      } else if (error.code === 'auth/invalid-email') {
        displayMessage = "Invalid email format.";
      } else if (error.code === 'auth/weak-password') {
        displayMessage = "Password should be at least 6 characters.";
      }
      showError(displayMessage);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: `
        linear-gradient(rgba(27, 152, 116, 0.7), rgba(20, 20, 20, 0.7)),
        url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=800&fit=crop') no-repeat center center fixed
      `,
      backgroundSize: 'cover',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
    }}>
      <div style={{
        background: 'rgba(20, 20, 20, 0.85)',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 0 15px rgba(0, 0, 0, 0.7)',
        width: '320px',
        color: '#eee',
        position: 'relative'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          color: '#5ab9ea'
        }}>
          Create Your Account
        </h1>

        <div>
          <label htmlFor="email" style={{
            display: 'block',
            marginBottom: '0.3rem',
            fontWeight: 'bold',
            color: '#ccc'
          }}>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #555',
              borderRadius: '4px',
              boxSizing: 'border-box',
              backgroundColor: '#333',
              color: '#eee',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              fontSize: '1rem'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#5ab9ea';
              e.target.style.boxShadow = '0 0 8px #5ab9ea';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#555';
              e.target.style.boxShadow = 'none';
            }}
          />

          <label htmlFor="password" style={{
            display: 'block',
            marginBottom: '0.3rem',
            fontWeight: 'bold',
            color: '#ccc'
          }}>
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Create a password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #555',
              borderRadius: '4px',
              boxSizing: 'border-box',
              backgroundColor: '#333',
              color: '#eee',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              fontSize: '1rem'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#5ab9ea';
              e.target.style.boxShadow = '0 0 8px #5ab9ea';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#555';
              e.target.style.boxShadow = 'none';
            }}
          />

          <button
            type="submit"
            onClick={handleSubmit}
            style={{
              width: '100%',
              padding: '0.6rem',
              backgroundColor: '#5ab9ea',
              border: 'none',
              borderRadius: '4px',
              color: '#111',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              marginBottom: '1rem'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 4px 15px rgba(90, 185, 234, 0.6)';
              e.target.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
              e.target.style.color = '#111';
            }}
          >
            Sign Up
          </button>
        </div>

        <div style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          color: '#bbb',
          fontSize: '0.9rem'
        }}>
          Already have an account? {' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleLoginRedirect();
            }}
            style={{
              color: '#5ab9ea',
              fontWeight: 'bold',
              textDecoration: 'none'
            }}
          >
            Log in
          </a>
        </div>

        {errorMessage && (
          <p style={{
            color: 'red',
            textAlign: 'center',
            marginTop: '1rem'
          }}>
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p style={{
            color: '#4ade80',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            {successMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default SignupPage;