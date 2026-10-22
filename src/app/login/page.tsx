'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  LogIn,
  UserPlus,
  MapPin,
  Lock,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [latitude, setLatitude] = useState<string>('38.2466');
  const [longitude, setLongitude] = useState<string>('21.7346');
  const [geoStatus, setGeoStatus] = useState<string>('Defaulting to Patras center (click to detect GPS)');
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(6));
          setLongitude(pos.coords.longitude.toFixed(6));
          setGeoStatus('GPS location acquired from browser');
        },
        () => {
          setGeoStatus('Using Patras default coordinates (editable below)');
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const detectLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('Geolocation not supported by browser');
      return;
    }
    setGeoStatus('Requesting browser GPS permission...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setGeoStatus('GPS location updated!');
      },
      () => {
        setGeoStatus('Permission denied — using manual coordinates');
      }
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Login failed');
      } else {
        router.push(data.redirectUrl || '/');
        router.refresh();
      }
    } catch {
      setLoginError('Network or server error occurred.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccess('');
    setSignupLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signupUsername,
          password: signupPassword,
          firstName,
          lastName,
          phone,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSignupError(data.error || 'Registration failed');
      } else {
        setSignupSuccess('Account created! Redirecting to Citizen Portal...');
        setTimeout(() => {
          router.push(data.redirectUrl || '/citizen');
          router.refresh();
        }, 800);
      }
    } catch {
      setSignupError('Network or server error occurred.');
    } finally {
      setSignupLoading(false);
    }
  };

  const fillDemoAccount = (u: string, p: string) => {
    setActiveTab('login');
    setLoginUsername(u);
    setLoginPassword(p);
    setLoginError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Disaster Relief System
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Emergency Supply & Volunteer Coordination Platform
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 border-b border-slate-800 bg-slate-950/50 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-all ${
                activeTab === 'login'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Log In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signup')}
              className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-all ${
                activeTab === 'signup'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Citizen Sign Up
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="text-center mb-2">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    Sign in to your account
                  </span>
                </div>

                {loginError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Enter Username"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter Password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  {loginLoading ? 'Signing in...' : 'Login'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-3.5">
                <div className="text-center mb-1">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    Register a new Citizen account
                  </span>
                </div>

                {signupError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{signupError}</span>
                  </div>
                )}

                {signupSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{signupSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      placeholder="Username"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter Citizen Name"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter Lastname"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Telephone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter Telephone Number"
                      className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      required
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      Citizen Coordinates
                    </span>
                    <button
                      type="button"
                      onClick={detectLocation}
                      className="text-xs text-rose-400 hover:text-rose-300 underline"
                    >
                      Detect GPS
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">{geoStatus}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={signupLoading}
                  className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {signupLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

