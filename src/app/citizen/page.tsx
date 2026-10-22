'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  HeartHandshake,
  ShoppingBag,
  History,
  Megaphone,
  Gift,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Search,
  Trash2,
} from 'lucide-react';

interface CategoryRow {
  cat_id: number;
  cat_name: string;
}

interface ProductRow {
  pr_id: number;
  pr_name: string;
  pr_cat_id: number;
  detail_name: string;
  detail_value: number;
  cat_name: string;
}

interface AnnouncementRow {
  ann_id: number;
  ann_pr_id: number;
  pr_name: string;
  ann_value: number;
}

interface DemandHistoryRow {
  dem_id: number;
  pr_id: number;
  pr_name: string;
  dem_value: number;
  task_id: number | null;
  task_submission_date: string | null;
  task_acceptance_date: string | null;
  task_completion_date: string | null;
  task_status: string;
}

export default function CitizenDashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState('Citizen');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [requests, setRequests] = useState<DemandHistoryRow[]>([]);
  const [donations, setDonations] = useState<DemandHistoryRow[]>([]);

  // Request Form State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [familyMembers, setFamilyMembers] = useState('1');

  // Donation Form State
  const [selectedAnnProduct, setSelectedAnnProduct] = useState('');
  const [donationQty, setDonationQty] = useState('1');

  const notify = (type: 'ok' | 'err', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  const fetchDashboard = useCallback(async () => {
    const res = await fetch('/api/citizen/dashboard');
    if (res.status === 401) {
      router.push('/login');
      return;
    }
    if (res.ok) {
      const data = await res.json();
      if (data.citizen?.user?.user_name) {
        setUsername(data.citizen.user.user_name);
      }
      setCategories(data.categories || []);
      setProducts(data.products || []);
      setAnnouncements(data.announcements || []);
      setRequests(data.requests || []);
      setDonations(data.donations || []);
      if (!selectedAnnProduct && data.announcements?.[0]) {
        setSelectedAnnProduct(data.announcements[0].pr_name);
      }
    }
  }, [router, selectedAnnProduct]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Products in the selected category (or all products if no category selected)
  const categoryProducts = selectedCategory
    ? products.filter((p) => p.cat_name === selectedCategory)
    : [];

  const autocompleteMatches = (selectedCategory ? categoryProducts : products).filter((p) =>
    p.pr_name.toLowerCase().includes(productQuery.toLowerCase())
  );

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productQuery.trim()) {
      notify('err', 'Please select or enter a product name.');
      return;
    }
    const res = await fetch('/api/citizen/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pr_name: productQuery.trim(),
        people: Number(familyMembers),
      }),
    });
    const data = await res.json();
    if (res.ok) {
      notify('ok', data.message || 'Request has been submitted.');
      setProductQuery('');
      setFamilyMembers('1');
      fetchDashboard();
    } else {
      notify('err', data.error || 'Failed to submit request.');
    }
  };

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnnProduct) {
      notify('err', 'Please select a product from the announcements.');
      return;
    }
    const res = await fetch('/api/citizen/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pr_name: selectedAnnProduct,
        quantity: Number(donationQty),
      }),
    });
    const data = await res.json();
    if (res.ok) {
      notify('ok', data.message || 'Donation has been submitted.');
      setDonationQty('1');
      fetchDashboard();
    } else {
      notify('err', data.error || 'Failed to submit donation.');
    }
  };

  const handleCancelDonation = async (demId: number) => {
    const res = await fetch(`/api/citizen/donations?id=${demId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (res.ok) {
      notify('ok', data.message || 'Donation has been cancelled!');
      fetchDashboard();
    } else {
      notify('err', data.error || 'Failed to cancel donation.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-600/20 border border-sky-500/30 text-sky-400">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                Citizen Relief Portal
              </span>
              <h1 className="text-lg font-bold text-white">Welcome, {username}!</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white text-xs sm:text-sm font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {feedback && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium ${
              feedback.type === 'ok'
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
                : 'bg-rose-950/80 border-rose-700 text-rose-200'
            }`}
          >
            {feedback.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{feedback.text}</span>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* 1. Requesting a Product */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
            <ShoppingBag className="w-5 h-5 text-rose-400" />
            Requesting a Product
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-5">
            Select a category to check product availability, or search directly by product name.
            Request a product for each of your family members.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Selection & Product Table */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-1.5">
                  Select Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white"
                >
                  <option value="">Choose here</option>
                  {categories.map((c) => (
                    <option key={c.cat_id} value={c.cat_name}>
                      {c.cat_name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategory ? (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-rose-900/60 text-rose-100 text-xs uppercase">
                      <tr>
                        <th className="px-3.5 py-2.5">Product Name</th>
                        <th className="px-3.5 py-2.5">Detail Name</th>
                        <th className="px-3.5 py-2.5">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                      {categoryProducts.map((p) => (
                        <tr
                          key={p.pr_id}
                          onClick={() => setProductQuery(p.pr_name)}
                          className="hover:bg-slate-800 cursor-pointer transition"
                        >
                          <td className="px-3.5 py-2 font-medium text-white">{p.pr_name}</td>
                          <td className="px-3.5 py-2 text-slate-300">{p.detail_name}</td>
                          <td className="px-3.5 py-2 text-slate-400">{p.cat_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-4 text-center">
                  Category info will be listed here... (Click any row to select it)
                </div>
              )}
            </div>

            {/* Autocomplete Search & Submit Request */}
            <form
              onSubmit={handleRequestSubmit}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-1.5">
                    Select Product (Autocomplete)
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productQuery}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                      onChange={(e) => {
                        setProductQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      placeholder="Type or click a product name..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white"
                      required
                    />
                  </div>

                  {showSuggestions && autocompleteMatches.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full rounded-xl bg-slate-900 border border-slate-700 shadow-2xl max-h-48 overflow-y-auto divide-y divide-slate-800">
                      {autocompleteMatches.map((item) => (
                        <button
                          type="button"
                          key={item.pr_id}
                          onMouseDown={() => {
                            setProductQuery(item.pr_name);
                            setShowSuggestions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-800 flex items-center justify-between"
                        >
                          <span className="font-medium text-white">{item.pr_name}</span>
                          <span className="text-xs text-slate-400">{item.cat_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-1.5">
                    Insert Number of Family Members
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={familyMembers}
                    onChange={(e) => setFamilyMembers(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-lg transition"
              >
                Submit Aid Request
              </button>
            </form>
          </div>
        </section>

        {/* 2. Request History */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-sky-400" />
            Request History
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-4">
            Check the status of your current and previous aid requests.
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-sm text-left">
              <thead className="bg-rose-900/60 text-rose-100 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">People / Qty</th>
                  <th className="px-4 py-3">Request Submission Date</th>
                  <th className="px-4 py-3">Request Acceptance Date</th>
                  <th className="px-4 py-3">Request Completion Date</th>
                  <th className="px-4 py-3">Request Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/50">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      You have not submitted any aid requests yet.
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.dem_id} className="hover:bg-slate-900/80">
                      <td className="px-4 py-2.5 font-medium text-white">{r.pr_name}</td>
                      <td className="px-4 py-2.5 text-slate-300">{r.dem_value}</td>
                      <td className="px-4 py-2.5 text-slate-300">
                        {r.task_submission_date
                          ? new Date(r.task_submission_date).toLocaleString()
                          : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400">
                        {r.task_acceptance_date
                          ? new Date(r.task_acceptance_date).toLocaleString()
                          : 'Pending'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400">
                        {r.task_completion_date
                          ? new Date(r.task_completion_date).toLocaleString()
                          : '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            r.task_status === 'Complete'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {r.task_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Announcements & Make a Donation */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
            <Megaphone className="w-5 h-5 text-amber-400" />
            Announcements
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-5">
            Check the shortage announcements issued from the Base and pledge a donation offer.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-sm text-left">
                <thead className="bg-rose-900/60 text-rose-100 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">Requested Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/50">
                  {announcements.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-6 text-center text-slate-500">
                        No active shortage announcements at the moment.
                      </td>
                    </tr>
                  ) : (
                    announcements.map((a) => (
                      <tr
                        key={a.ann_id}
                        onClick={() => setSelectedAnnProduct(a.pr_name)}
                        className="hover:bg-slate-900 cursor-pointer transition"
                      >
                        <td className="px-4 py-2.5 font-medium text-white">{a.pr_name}</td>
                        <td className="px-4 py-2.5 text-amber-300 font-semibold">{a.ann_value}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <form
              onSubmit={handleDonateSubmit}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-1.5">
                    Select Product to Donate
                  </label>
                  <select
                    value={selectedAnnProduct}
                    onChange={(e) => setSelectedAnnProduct(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white"
                    required
                  >
                    <option value="">Choose here</option>
                    {Array.from(new Set(announcements.map((a) => a.pr_name))).map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-1.5">
                    Product Quantity to be Donated
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={donationQty}
                    onChange={(e) => setDonationQty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg transition flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4" />
                Submit Donation Offer
              </button>
            </form>
          </div>
        </section>

        {/* 4. Donation History */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
            <Gift className="w-5 h-5 text-emerald-400" />
            Donation History
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-4">
            Check the status of your donations. Feel free to cancel any that are still incomplete.
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-sm text-left">
              <thead className="bg-rose-900/60 text-rose-100 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Donation Submission Date</th>
                  <th className="px-4 py-3">Donation Acceptance Date</th>
                  <th className="px-4 py-3">Donation Completion Date</th>
                  <th className="px-4 py-3">Donation Status</th>
                  <th className="px-4 py-3 text-right">Cancel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/50">
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                      You have not submitted any donations yet.
                    </td>
                  </tr>
                ) : (
                  donations.map((d) => (
                    <tr key={d.dem_id} className="hover:bg-slate-900/80">
                      <td className="px-4 py-2.5 font-medium text-white">{d.pr_name}</td>
                      <td className="px-4 py-2.5 text-slate-300">{d.dem_value}</td>
                      <td className="px-4 py-2.5 text-slate-300">
                        {d.task_submission_date
                          ? new Date(d.task_submission_date).toLocaleString()
                          : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400">
                        {d.task_acceptance_date
                          ? new Date(d.task_acceptance_date).toLocaleString()
                          : 'Pending'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400">
                        {d.task_completion_date
                          ? new Date(d.task_completion_date).toLocaleString()
                          : '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            d.task_status === 'Complete'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {d.task_status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {d.task_status !== 'Complete' && (
                          <button
                            type="button"
                            onClick={() => handleCancelDonation(d.dem_id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-medium transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

