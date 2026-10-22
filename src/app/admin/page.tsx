'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import {
  Package,
  Map as MapIcon,
  Users,
  LogOut,
  Plus,
  Edit3,
  ArrowUpRight,
  RotateCcw,
  Trash2,
  Megaphone,
  FolderPlus,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  FileJson,
  Upload,
} from 'lucide-react';
import type { AdminVehicleMarker, AdminDemandMarker } from '@/components/AdminMap';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const AdminMap = dynamic(() => import('@/components/AdminMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
      Loading Interactive Map...
    </div>
  ),
});

interface ProductRow {
  pr_id: number;
  pr_name: string;
  pr_cat_id: number;
  detail_name: string;
  detail_value: number;
  cat_name: string;
}

interface CategoryRow {
  cat_id: number;
  cat_name: string;
}

interface BaseLoadRow {
  asdaa: number;
  pr_id: number;
  pr_name: string;
  cat_name: string;
  pr_quantity: number;
}

interface AnnouncementRow {
  ann_id: number;
  ann_pr_id: number;
  pr_name: string;
  ann_value: number;
}

interface InventoryRow {
  id: string;
  pr_id: number;
  pr_name: string;
  cat_name: string;
  quantity: number;
  location: 'Base' | 'Vehicle';
  volunteerUsername: string;
}

interface TaskOverviewRow {
  task_id: number;
  dem_type: 'request' | 'donation';
  pr_name: string;
  dem_value: number;
  cit_name: string;
  task_submission_date: string;
  task_acceptance_date: string | null;
  task_completion_date: string | null;
  task_status: string;
}

interface VolunteerRow {
  vol_id: number;
  user_name: string;
  vol_name: string;
  vol_lname: string;
  vol_num: string;
  vol_lat: number;
  vol_long: number;
  veh_id: number | null;
  veh_task_num: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'base1' | 'base2' | 'base3'>('base1');
  const [username, setUsername] = useState('nikosvoulg');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Tab 1 state
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [baseLoads, setBaseLoads] = useState<BaseLoadRow[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);

  // Edit product modal state
  const [editProd, setEditProd] = useState<ProductRow | null>(null);
  // New product form state
  const [showNewProd, setShowNewProd] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdDetail, setNewProdDetail] = useState('');
  const [newProdValue, setNewProdValue] = useState('1');
  const [newProdCategory, setNewProdCategory] = useState('');

  // Base load modal state
  const [baseActionModal, setBaseActionModal] = useState<{
    action: 'add_to_base' | 'return_to_storage' | 'remove_entirely';
    id: number;
    name: string;
    maxQty: number;
  } | null>(null);
  const [baseActionQty, setBaseActionQty] = useState('1');

  // New category state
  const [newCatName, setNewCatName] = useState('');

  // Announcement modal state
  const [annTargetProduct, setAnnTargetProduct] = useState<ProductRow | null>(null);
  const [annQuantity, setAnnQuantity] = useState('2');

  // Tab 2 state
  const [baseCoords, setBaseCoords] = useState({ id: 1, latitude: 38.2462, longtitude: 21.7351 });
  const [vehicles, setVehicles] = useState<AdminVehicleMarker[]>([]);
  const [demands, setDemands] = useState<AdminDemandMarker[]>([]);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [allTasks, setAllTasks] = useState<TaskOverviewRow[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['ALL']);
  const [statsPeriod, setStatsPeriod] = useState('year');
  const [statsData, setStatsData] = useState({
    completedRequests: 0,
    incompleteRequests: 0,
    incompleteDonations: 0,
    completedDonations: 0,
  });

  // Tab 3 state
  const [volunteers, setVolunteers] = useState<VolunteerRow[]>([]);
  const [volUsername, setVolUsername] = useState('');
  const [volPassword, setVolPassword] = useState('');
  const [volName, setVolName] = useState('');
  const [volLname, setVolLname] = useState('');
  const [volLong, setVolLong] = useState('21.7350');
  const [volLat, setVolLat] = useState('38.2460');
  const [volNum, setVolNum] = useState('');

  const notify = (type: 'ok' | 'err', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  const fetchTab1Data = useCallback(async () => {
    const res = await fetch('/api/admin/products');
    if (res.status === 401) {
      router.push('/login');
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products || []);
      setCategories(data.categories || []);
      setBaseLoads(data.baseLoads || []);
      setAnnouncements(data.announcements || []);
      if (!newProdCategory && data.categories?.[0]) {
        setNewProdCategory(data.categories[0].cat_name);
      }
    }
  }, [router, newProdCategory]);

  const fetchTab2Data = useCallback(async () => {
    const [mapRes, statsRes] = await Promise.all([
      fetch('/api/admin/map'),
      fetch(`/api/admin/statistics?period=${statsPeriod}`),
    ]);
    if (mapRes.ok) {
      const m = await mapRes.json();
      if (m.base) setBaseCoords(m.base);
      setVehicles(m.vehicles || []);
      setDemands(m.demands || []);
      setInventory(m.inventory || []);
      setCategories(m.categories || []);
      setAllTasks(m.allTasks || []);
    }
    if (statsRes.ok) {
      const s = await statsRes.json();
      setStatsData(s);
    }
  }, [statsPeriod]);

  const fetchTab3Data = useCallback(async () => {
    const res = await fetch('/api/admin/volunteers');
    if (res.ok) {
      const data = await res.json();
      setVolunteers(data.volunteers || []);
    }
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d.user || d.user.userType !== 'admin') {
          router.push('/login');
        } else {
          setUsername(d.user.username);
        }
      });
  }, [router]);

  useEffect(() => {
    if (activeTab === 'base1') fetchTab1Data();
    if (activeTab === 'base2') fetchTab2Data();
    if (activeTab === 'base3') fetchTab3Data();
  }, [activeTab, fetchTab1Data, fetchTab2Data, fetchTab3Data]);

  // Handlers for Tab 1
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProd) return;
    const res = await fetch('/api/admin/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editProd),
    });
    const data = await res.json();
    if (res.ok) {
      notify('ok', data.message || 'Product Submitted');
      setEditProd(null);
      fetchTab1Data();
    } else {
      notify('err', data.error || 'Update failed');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pr_name: newProdName,
        detail_name: newProdDetail,
        detail_value: Number(newProdValue),
        cat_name: newProdCategory,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      notify('ok', data.message || 'Product Added');
      setNewProdName('');
      setNewProdDetail('');
      setNewProdValue('1');
      setShowNewProd(false);
      fetchTab1Data();
    } else {
      notify('err', data.error || 'Failed to add product');
    }
  };

  const handleBaseLoadAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseActionModal) return;
    const res = await fetch('/api/admin/base-load', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: baseActionModal.action,
        id: baseActionModal.id,
        quantity: Number(baseActionQty),
      }),
    });
    const data = await res.json();
    if (res.ok) {
      notify('ok', data.message);
      setBaseActionModal(null);
      fetchTab1Data();
    } else {
      notify('err', data.error || 'Operation failed');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cat_name: newCatName }),
    });
    const data = await res.json();
    if (res.ok) {
      notify('ok', data.message || 'Category Added!');
      setNewCatName('');
      fetchTab1Data();
    } else {
      notify('err', data.error || 'Failed to add category');
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTargetProduct) return;
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ann_pr_id: annTargetProduct.pr_id,
        ann_value: Number(annQuantity),
      }),
    });
    const data = await res.json();
    if (res.ok) {
      notify('ok', data.message || 'Announcement Added');
      setAnnTargetProduct(null);
      fetchTab1Data();
    } else {
      notify('err', data.error || 'Failed to add announcement');
    }
  };

  const handleDeleteAnnouncement = async (annId: number) => {
    const res = await fetch(`/api/admin/announcements?id=${annId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (res.ok) {
      notify('ok', data.message || 'Announcement Deleted!');
      fetchTab1Data();
    } else {
      notify('err', data.error || 'Delete failed');
    }
  };

  const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch('/api/admin/products/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (res.ok) {
        notify('ok', data.message);
        fetchTab1Data();
      } else {
        notify('err', data.error || 'Invalid JSON file');
      }
    } catch {
      notify('err', 'Failed to parse JSON file.');
    }
  };

  // Handlers for Tab 2
  const handleUpdateBaseCoords = async (lat: number, lng: number) => {
    const res = await fetch('/api/admin/map', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude: lat, longtitude: lng }),
    });
    if (res.ok) {
      notify('ok', 'Base location updated!');
      fetchTab2Data();
    } else {
      notify('err', 'Failed to update Base coordinates');
    }
  };

  const toggleCategoryFilter = (catName: string) => {
    if (catName === 'ALL') {
      setSelectedCategories((prev) => (prev.includes('ALL') ? [] : ['ALL']));
      return;
    }
    setSelectedCategories((prev) => {
      const withoutAll = prev.filter((c) => c !== 'ALL');
      if (withoutAll.includes(catName)) {
        return withoutAll.filter((c) => c !== catName);
      } else {
        return [...withoutAll, catName];
      }
    });
  };

  const filteredInventory = selectedCategories.includes('ALL')
    ? inventory
    : inventory.filter((item) => selectedCategories.includes(item.cat_name));

  // Handlers for Tab 3
  const handleCreateVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/volunteers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: volUsername,
        password: volPassword,
        vol_name: volName,
        vol_lname: volLname,
        vol_long: parseFloat(volLong),
        vol_lat: parseFloat(volLat),
        vol_num: volNum,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      notify('ok', data.message || 'Volunteer Added!');
      setVolUsername('');
      setVolPassword('');
      setVolName('');
      setVolLname('');
      setVolNum('');
      fetchTab3Data();
    } else {
      notify('err', data.error || 'Failed to add volunteer');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const pieChartData = {
    labels: [
      'Completed Requests',
      'Incomplete Requests',
      'Incomplete Donations',
      'Completed Donations',
    ],
    datasets: [
      {
        data: [
          statsData.completedRequests,
          statsData.incompleteRequests,
          statsData.incompleteDonations,
          statsData.completedDonations,
        ],
        backgroundColor: ['#ef4444', '#3b82f6', '#22c55e', '#eab308'],
        borderColor: '#0f172a',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              Base Administrator Portal
            </span>
            <h1 className="text-lg font-bold text-white">Welcome, {username}!</h1>
          </div>

          {/* 3 Main Tabs matching base1.php / base2.php / base3.php */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('base1')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === 'base1'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              Base Items & Announcements
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('base2')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === 'base2'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              Map & Item Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('base3')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === 'base3'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Volunteer Account Management
            </button>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ================= TAB 1: BASE ITEMS & ANNOUNCEMENTS ================= */}
        {activeTab === 'base1' && (
          <div className="space-y-6">
            {/* 1. Product Storage Management */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-rose-400" />
                    Product Storage Management
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Edit any details concerning the stored products. From here you can also load
                    items to the Base, making them available for pickup to any volunteer.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="/data.json"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                  >
                    <FileJson className="w-3.5 h-3.5 text-amber-400" />
                    View data.json
                  </a>
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5 text-sky-400" />
                    Import JSON
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleJsonUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewProd((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Product to Storage
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-sm text-left">
                  <thead className="bg-rose-900/60 text-rose-100 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Detail</th>
                      <th className="px-4 py-3">Value (Storage Qty)</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/50">
                    {products.map((p) => (
                      <tr key={p.pr_id} className="hover:bg-slate-900/80 transition">
                        <td className="px-4 py-2.5 font-medium text-white">{p.pr_name}</td>
                        <td className="px-4 py-2.5 text-slate-300">{p.detail_name}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-200">
                            {p.detail_value}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                            {p.cat_name}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => setEditProd({ ...p })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setBaseActionModal({
                                action: 'add_to_base',
                                id: p.pr_id,
                                name: p.pr_name,
                                maxQty: p.detail_value,
                              });
                              setBaseActionQty('1');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-medium transition"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            Add to Base
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Edit Product Popup Form */}
              {editProd && (
                <form
                  onSubmit={handleUpdateProduct}
                  className="mt-4 p-4 rounded-xl bg-slate-950 border border-rose-800/60 space-y-3"
                >
                  <div className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                    Edit Product #{editProd.pr_id}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Product Name</label>
                      <input
                        type="text"
                        value={editProd.pr_name}
                        onChange={(e) => setEditProd({ ...editProd, pr_name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Detail Name</label>
                      <input
                        type="text"
                        value={editProd.detail_name}
                        onChange={(e) => setEditProd({ ...editProd, detail_name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Detail Value</label>
                      <input
                        type="number"
                        value={editProd.detail_value}
                        onChange={(e) =>
                          setEditProd({ ...editProd, detail_value: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Category Name</label>
                      <select
                        value={editProd.cat_name}
                        onChange={(e) => setEditProd({ ...editProd, cat_name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white"
                      >
                        {categories.map((c) => (
                          <option key={c.cat_id} value={c.cat_name}>
                            {c.cat_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                    >
                      Update Product Catalogue
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditProd(null)}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                    >
                      Close
                    </button>
                  </div>
                </form>
              )}

              {/* Add New Product Popup Form */}
              {showNewProd && (
                <form
                  onSubmit={handleAddProduct}
                  className="mt-4 p-4 rounded-xl bg-slate-950 border border-emerald-800/60 space-y-3"
                >
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Add New Product to Storage
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Product Name</label>
                      <input
                        type="text"
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        placeholder="e.g. Flashlight"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Detail Name</label>
                      <input
                        type="text"
                        value={newProdDetail}
                        onChange={(e) => setNewProdDetail(e.target.value)}
                        placeholder="e.g. Multipack"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Detail Value</label>
                      <input
                        type="number"
                        min="0"
                        value={newProdValue}
                        onChange={(e) => setNewProdValue(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Category Name</label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white"
                      >
                        {categories.map((c) => (
                          <option key={c.cat_id} value={c.cat_name}>
                            {c.cat_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                    >
                      Update Product Catalogue
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewProd(false)}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                    >
                      Close
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* 2. Base Management */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-1">Base Management</h2>
              <p className="text-xs sm:text-sm text-slate-400 mb-4">
                Remove items from the Base by returning them back to Storage or remove them
                entirely.
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-sm text-left">
                  <thead className="bg-rose-900/60 text-rose-100 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Quantity Available in Base</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/50">
                    {baseLoads.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                          No items currently loaded in the Base. Use &quot;Add to Base&quot; above.
                        </td>
                      </tr>
                    ) : (
                      baseLoads.map((b) => (
                        <tr key={b.asdaa} className="hover:bg-slate-900/80 transition">
                          <td className="px-4 py-2.5 font-medium text-white">{b.pr_name}</td>
                          <td className="px-4 py-2.5 text-slate-300">{b.cat_name}</td>
                          <td className="px-4 py-2.5">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                              {b.pr_quantity}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setBaseActionModal({
                                  action: 'return_to_storage',
                                  id: b.asdaa,
                                  name: b.pr_name,
                                  maxQty: b.pr_quantity,
                                });
                                setBaseActionQty('1');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-medium transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Remove from Available (Return to Storage)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setBaseActionModal({
                                  action: 'remove_entirely',
                                  id: b.asdaa,
                                  name: b.pr_name,
                                  maxQty: b.pr_quantity,
                                });
                                setBaseActionQty('1');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-medium transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove Entirely
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Quantity Action Form Popup */}
              {baseActionModal && (
                <form
                  onSubmit={handleBaseLoadAction}
                  className="mt-4 p-4 rounded-xl bg-slate-950 border border-amber-700/60 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="text-sm">
                    <span className="font-semibold text-amber-300">
                      {baseActionModal.action === 'add_to_base'
                        ? `Add "${baseActionModal.name}" from Storage to Base`
                        : baseActionModal.action === 'return_to_storage'
                        ? `Return "${baseActionModal.name}" from Base to Storage`
                        : `Remove "${baseActionModal.name}" Entirely from Base`}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      (Max available: {baseActionModal.maxQty})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400">Select quantity:</label>
                    <input
                      type="number"
                      min="1"
                      max={baseActionModal.maxQty}
                      value={baseActionQty}
                      onChange={(e) => setBaseActionQty(e.target.value)}
                      className="w-24 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={() => setBaseActionModal(null)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    >
                      Close
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* 3. Add New Categories */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                <FolderPlus className="w-5 h-5 text-indigo-400" />
                Add New Categories for the Products
              </h2>
              <form onSubmit={handleAddCategory} className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-slate-300">Category Name:</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. EQUIPMENT"
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition"
                >
                  Add Category
                </button>
              </form>
            </section>

            {/* 4. Create & Manage Announcements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                  <Megaphone className="w-5 h-5 text-amber-400" />
                  Create New Announcements
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Visible to citizens who want to donate needed supplies.
                </p>

                <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-80">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-rose-900/60 text-rose-100 text-xs uppercase sticky top-0">
                      <tr>
                        <th className="px-4 py-2.5">Product Name</th>
                        <th className="px-4 py-2.5">Storage Qty</th>
                        <th className="px-4 py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-950/50">
                      {products.map((p) => (
                        <tr key={p.pr_id} className="hover:bg-slate-900/80">
                          <td className="px-4 py-2 font-medium text-white">{p.pr_name}</td>
                          <td className="px-4 py-2 text-slate-300">{p.detail_value}</td>
                          <td className="px-4 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setAnnTargetProduct(p);
                                setAnnQuantity('2');
                              }}
                              className="px-3 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-medium transition"
                            >
                              Add
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {annTargetProduct && (
                  <form
                    onSubmit={handleAddAnnouncement}
                    className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-amber-700/60 flex flex-wrap items-center justify-between gap-3"
                  >
                    <span className="text-xs font-semibold text-amber-300">
                      Requesting donations for: {annTargetProduct.pr_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={annQuantity}
                        onChange={(e) => setAnnQuantity(e.target.value)}
                        className="w-20 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        required
                      />
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnnTargetProduct(null)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
                      >
                        Close
                      </button>
                    </div>
                  </form>
                )}
              </section>

              <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-base font-bold text-white mb-1">Announcements Posted</h2>
                <p className="text-xs text-slate-400 mb-4">
                  Active shortage alerts currently displayed on the Citizen portal.
                </p>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-rose-900/60 text-rose-100 text-xs uppercase">
                      <tr>
                        <th className="px-4 py-2.5">Product Name</th>
                        <th className="px-4 py-2.5">Requested Quantity</th>
                        <th className="px-4 py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-950/50">
                      {announcements.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                            No active announcements posted.
                          </td>
                        </tr>
                      ) : (
                        announcements.map((a) => (
                          <tr key={a.ann_id} className="hover:bg-slate-900/80">
                            <td className="px-4 py-2.5 font-medium text-white">{a.pr_name}</td>
                            <td className="px-4 py-2.5 text-slate-300">{a.ann_value}</td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteAnnouncement(a.ann_id)}
                                className="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-medium transition"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ================= TAB 2: MAP, INVENTORY OVERVIEW & STATISTICS ================= */}
        {activeTab === 'base2' && (
          <div className="space-y-6">
            {/* 1. Interactive Map */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-white">
                  Citizen Demands & Vehicle Locations Map
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Drag and drop the purple Base marker to change warehouse location. Click on any
                  marker to view full details.
                </p>
              </div>
              <AdminMap
                base={baseCoords}
                vehicles={vehicles}
                demands={demands}
                onUpdateBaseLocation={handleUpdateBaseCoords}
              />
            </section>

            {/* 2. Unified Inventory Status Table with Category Filters */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-1">
                Base & Vehicle Inventory Status
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mb-4">
                Check up on the status of every product inside the Base or loaded inside a
                Volunteer Vehicle. Use filters to show only certain categories.
              </p>

              {/* Category Filter Checkboxes */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('ALL')}
                    onChange={() => toggleCategoryFilter('ALL')}
                    className="rounded accent-rose-500"
                  />
                  <span>ALL</span>
                </label>
                {categories.map((cat) => (
                  <label
                    key={cat.cat_id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={
                        selectedCategories.includes('ALL') ||
                        selectedCategories.includes(cat.cat_name)
                      }
                      onChange={() => toggleCategoryFilter(cat.cat_name)}
                      className="rounded accent-rose-500"
                    />
                    <span>{cat.cat_name}</span>
                  </label>
                ))}
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-sm text-left">
                  <thead className="bg-rose-900/60 text-rose-100 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Current Location</th>
                      <th className="px-4 py-3">Vehicle Volunteer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/50">
                    {filteredInventory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                          No inventory items match the selected category filter.
                        </td>
                      </tr>
                    ) : (
                      filteredInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-900/80">
                          <td className="px-4 py-2.5 font-medium text-white">{item.pr_name}</td>
                          <td className="px-4 py-2.5 text-slate-300">{item.cat_name}</td>
                          <td className="px-4 py-2.5 font-semibold text-white">{item.quantity}</td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.location === 'Base'
                                  ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              }`}
                            >
                              {item.location}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-300">{item.volunteerUsername}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 3. Service Statistics & All Tasks Log */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-rose-400" />
                      Service Statistics
                    </h2>
                    <p className="text-xs text-slate-400">
                      Completed & incomplete requests and donations by time period.
                    </p>
                  </div>
                  <select
                    value={statsPeriod}
                    onChange={(e) => setStatsPeriod(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white"
                  >
                    <option value="day">Last Day</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="6month">Last 6 Months</option>
                    <option value="year">Last Year</option>
                    <option value="all">All Time</option>
                  </select>
                </div>

                <div className="max-w-xs mx-auto py-4">
                  <Pie
                    data={pieChartData}
                    options={{
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: { color: '#e2e8f0', font: { size: 11 } },
                        },
                        title: {
                          display: true,
                          text: 'Tasks Breakdown',
                          color: '#f8fafc',
                        },
                      },
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-rose-400 font-bold text-lg">
                      {statsData.completedRequests}
                    </div>
                    <div className="text-slate-400">Completed Req.</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-blue-400 font-bold text-lg">
                      {statsData.incompleteRequests}
                    </div>
                    <div className="text-slate-400">Incomplete Req.</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-emerald-400 font-bold text-lg">
                      {statsData.incompleteDonations}
                    </div>
                    <div className="text-slate-400">Incomplete Don.</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-amber-400 font-bold text-lg">
                      {statsData.completedDonations}
                    </div>
                    <div className="text-slate-400">Completed Don.</div>
                  </div>
                </div>
              </section>

              <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-1">Submitted Tasks Log</h2>
                <p className="text-xs text-slate-400 mb-4">
                  Real-time log of all citizen requests and donations with timestamps.
                </p>

                <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[420px]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-300 uppercase sticky top-0">
                      <tr>
                        <th className="px-3 py-2.5">Product</th>
                        <th className="px-3 py-2.5">Submission Date</th>
                        <th className="px-3 py-2.5">Acceptance Date</th>
                        <th className="px-3 py-2.5">Completion Date</th>
                        <th className="px-3 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                      {allTasks.map((t) => (
                        <tr key={t.task_id} className="hover:bg-slate-900/70">
                          <td className="px-3 py-2 font-medium text-white">
                            {t.pr_name} ({t.dem_value})
                            <div className="text-[10px] text-slate-400 uppercase">{t.dem_type}</div>
                          </td>
                          <td className="px-3 py-2 text-slate-300">
                            {new Date(t.task_submission_date).toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-slate-400">
                            {t.task_acceptance_date
                              ? new Date(t.task_acceptance_date).toLocaleString()
                              : 'NULL'}
                          </td>
                          <td className="px-3 py-2 text-slate-400">
                            {t.task_completion_date
                              ? new Date(t.task_completion_date).toLocaleString()
                              : 'NULL'}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                t.task_status === 'Complete'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              {t.task_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ================= TAB 3: VOLUNTEER ACCOUNT MANAGEMENT ================= */}
        {activeTab === 'base3' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-1">Create New Volunteer Account</h2>
              <p className="text-xs text-slate-400 mb-5">
                Registers a new volunteer rescuer and automatically provisions their rescue vehicle
                on the map.
              </p>

              <form onSubmit={handleCreateVolunteer} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Username</label>
                    <input
                      type="text"
                      value={volUsername}
                      onChange={(e) => setVolUsername(e.target.value)}
                      placeholder="Enter Username"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Password</label>
                    <input
                      type="password"
                      value={volPassword}
                      onChange={(e) => setVolPassword(e.target.value)}
                      placeholder="Enter Password"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Volunteer Name</label>
                    <input
                      type="text"
                      value={volName}
                      onChange={(e) => setVolName(e.target.value)}
                      placeholder="Enter Volunteer Name"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Volunteer Surname</label>
                    <input
                      type="text"
                      value={volLname}
                      onChange={(e) => setVolLname(e.target.value)}
                      placeholder="Enter Volunteer Surname"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Volunteer Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={volLong}
                      onChange={(e) => setVolLong(e.target.value)}
                      placeholder="21.7350"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Volunteer Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={volLat}
                      onChange={(e) => setVolLat(e.target.value)}
                      placeholder="38.2460"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Volunteer Phone Number
                  </label>
                  <input
                    type="text"
                    value={volNum}
                    onChange={(e) => setVolNum(e.target.value)}
                    placeholder="Enter Volunteer Phone Number"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-lg transition"
                >
                  Sign Up Volunteer
                </button>
              </form>
            </section>

            <section className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-1">Registered Volunteer Fleet</h2>
              <p className="text-xs text-slate-400 mb-4">
                Active volunteer rescuers and their assigned rescue vehicles.
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-sm text-left">
                  <thead className="bg-rose-900/60 text-rose-100 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Full Name</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Coordinates</th>
                      <th className="px-4 py-3">Active Tasks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/50">
                    {volunteers.map((v) => (
                      <tr key={v.vol_id} className="hover:bg-slate-900/80">
                        <td className="px-4 py-2.5 font-semibold text-emerald-300">
                          {v.user_name}
                        </td>
                        <td className="px-4 py-2.5 text-white">
                          {v.vol_name} {v.vol_lname}
                        </td>
                        <td className="px-4 py-2.5 text-slate-300">{v.vol_num}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-400">
                          {v.vol_lat.toFixed(4)}, {v.vol_long.toFixed(4)}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-200">
                            {v.veh_task_num} / 4
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

