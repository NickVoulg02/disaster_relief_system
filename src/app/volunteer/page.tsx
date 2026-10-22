'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  Truck,
  MapPin,
  PackageCheck,
  ClipboardList,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Download,
  Upload,
  Check,
  XCircle,
} from 'lucide-react';
import type { VolunteerPendingTask, VolunteerAcceptedTask } from '@/components/VolunteerMap';

const VolunteerMap = dynamic(() => import('@/components/VolunteerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
      Loading Volunteer Rescue Map...
    </div>
  ),
});

interface BaseLoadItem {
  asdaa: number;
  pr_id: number;
  pr_name: string;
  pr_quantity: number;
}

interface VehicleLoadItem {
  pr_id: number;
  pr_name: string;
  pr_quantity: number;
}

export default function VolunteerDashboardPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [volunteer, setVolunteer] = useState({
    vol_id: 0,
    user_name: '',
    vol_name: '',
    vol_lname: '',
    vol_num: '',
    vol_lat: 38.2462,
    vol_long: 21.7322,
  });
  const [vehicle, setVehicle] = useState<{
    veh_id: number;
    veh_task_num: number;
    latitude: number;
    longtitude: number;
    loads: VehicleLoadItem[];
  }>({
    veh_id: 0,
    veh_task_num: 0,
    latitude: 38.2462,
    longtitude: 21.7322,
    loads: [],
  });
  const [base, setBase] = useState({ id: 1, latitude: 38.2462, longtitude: 21.7351 });
  const [distanceToBase, setDistanceToBase] = useState(0);
  const [baseLoads, setBaseLoads] = useState<BaseLoadItem[]>([]);
  const [pendingTasks, setPendingTasks] = useState<VolunteerPendingTask[]>([]);
  const [acceptedTasks, setAcceptedTasks] = useState<VolunteerAcceptedTask[]>([]);

  // Selection state for Base Load table
  const [checkedProducts, setCheckedProducts] = useState<Record<number, boolean>>({});
  const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({});

  const notify = (type: 'ok' | 'err', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 6000);
  };

  const fetchDashboard = useCallback(async () => {
    const res = await fetch('/api/volunteer/dashboard');
    if (res.status === 401) {
      router.push('/login');
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setVolunteer(data.volunteer);
      setVehicle(data.vehicle);
      setBase(data.base);
      setDistanceToBase(data.distanceToBase);
      setBaseLoads(data.baseLoads || []);
      setPendingTasks(data.pendingTasks || []);
      setAcceptedTasks(data.acceptedTasks || []);

      const initQty: Record<number, number> = {};
      (data.baseLoads || []).forEach((b: BaseLoadItem) => {
        initQty[b.pr_id] = 1;
      });
      setSelectedQuantities((prev) => ({ ...initQty, ...prev }));
    }
  }, [router]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleUpdateLocation = async (lat: number, lng: number) => {
    const res = await fetch('/api/volunteer/location', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude: lat, longtitude: lng }),
    });
    if (res.ok) {
      notify('ok', 'Vehicle location updated!');
      fetchDashboard();
    } else {
      notify('err', 'Failed to update location');
    }
  };

  const handleAcceptTask = async (taskId: number) => {
    const res = await fetch('/api/volunteer/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'accept', task_id: taskId }),
    });
    const data = await res.json();
    if (res.ok) {
      notify('ok', data.message || 'Task accepted!');
      fetchDashboard();
    } else {
      notify('err', data.error || 'Could not accept task');
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    const res = await fetch('/api/volunteer/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete', task_id: taskId }),
    });
    const data = await res.json();
    if (res.ok) {
      notify('ok', data.message || 'Task completed!');
      fetchDashboard();
    } else {
      notify('err', data.error || 'Unable to complete task.');
    }
  };

  const handleCancelTask = async (taskId: number) => {
    const res = await fetch('/api/volunteer/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel', task_id: taskId }),
    });
    const data = await res.json();
    if (res.ok) {
      notify('ok', data.message || 'Task cancelled.');
      fetchDashboard();
    } else {
      notify('err', data.error || 'Could not cancel task.');
    }
  };

  const handleLoadFromBase = async () => {
    const itemsToLoad = baseLoads
      .filter((b) => checkedProducts[b.pr_id] && (selectedQuantities[b.pr_id] ?? 0) > 0)
      .map((b) => ({
        pr_id: b.pr_id,
        quantity: selectedQuantities[b.pr_id] || 1,
      }));

    if (itemsToLoad.length === 0) {
      notify('err', 'Check at least one product and select a quantity (> 0) to load.');
      return;
    }

    const res = await fetch('/api/volunteer/load', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'load', items: itemsToLoad }),
    });
    const data = await res.json();
    if (res.ok) {
      notify('ok', data.message);
      setCheckedProducts({});
      fetchDashboard();
    } else {
      notify('err', data.error || 'Load failed');
    }
  };

  const handleUnloadToBase = async () => {
    const res = await fetch('/api/volunteer/load', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unload' }),
    });
    const data = await res.json();
    if (res.ok) {
      notify('ok', data.message);
      fetchDashboard();
    } else {
      notify('err', data.error || 'Unload failed');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Volunteer Rescuer Portal
              </span>
              <h1 className="text-lg font-bold text-white">
                Welcome, {volunteer.user_name || 'Volunteer'}!
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 ${
                distanceToBase <= 100
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Distance to Base: {distanceToBase}m</span>
              <span className="opacity-75">
                ({distanceToBase <= 100 ? 'Within 100m range' : 'Need <=100m to Load/Unload'})
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200">
              Active Tasks: {acceptedTasks.length} / 4
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white text-xs sm:text-sm font-medium transition"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
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
        {/* 1. Interactive Volunteer Map */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                Citizen Demands & Vehicle Navigation Map
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Drag and drop your green Vehicle marker to change location. Click on any pending
                demand marker to accept it.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleUpdateLocation(base.latitude + 0.0002, base.longtitude + 0.0002)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-700/70 text-purple-200 text-xs font-medium transition"
            >
              <Navigation className="w-3.5 h-3.5" />
              Move Vehicle to Base (&lt;100m)
            </button>
          </div>

          <VolunteerMap
            base={base}
            volunteer={volunteer}
            pendingTasks={pendingTasks}
            acceptedTasks={acceptedTasks}
            onUpdateLocation={handleUpdateLocation}
            onAcceptTask={handleAcceptTask}
          />
        </section>

        {/* 2. Load Items from Base & Vehicle Cargo Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <PackageCheck className="w-5 h-5 text-emerald-400" />
              Base Warehouse Cargo Operations
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Load items from Base and Unload anything you don&apos;t need (requires vehicle within
              100m of Base).
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-800 mb-4">
              <table className="w-full text-sm text-left">
                <thead className="bg-rose-900/60 text-rose-100 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 w-12">Select</th>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">Quantity Available in Base</th>
                    <th className="px-4 py-3">Load Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/50">
                  {baseLoads.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                        No items currently available in the Base warehouse.
                      </td>
                    </tr>
                  ) : (
                    baseLoads.map((b) => (
                      <tr key={b.pr_id} className="hover:bg-slate-900/80">
                        <td className="px-4 py-2.5">
                          <input
                            type="checkbox"
                            checked={!!checkedProducts[b.pr_id]}
                            onChange={(e) =>
                              setCheckedProducts((prev) => ({
                                ...prev,
                                [b.pr_id]: e.target.checked,
                              }))
                            }
                            className="rounded accent-rose-500 w-4 h-4"
                          />
                        </td>
                        <td className="px-4 py-2.5 font-medium text-white">{b.pr_name}</td>
                        <td className="px-4 py-2.5 text-slate-300">{b.pr_quantity}</td>
                        <td className="px-4 py-2.5">
                          <select
                            value={selectedQuantities[b.pr_id] ?? 1}
                            onChange={(e) =>
                              setSelectedQuantities((prev) => ({
                                ...prev,
                                [b.pr_id]: Number(e.target.value),
                              }))
                            }
                            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                          >
                            {Array.from({ length: b.pr_quantity + 1 }, (_, idx) => (
                              <option key={idx} value={idx}>
                                {idx}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleLoadFromBase}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition"
              >
                <Download className="w-4 h-4" />
                Load Selected from Base
              </button>
              <button
                type="button"
                onClick={handleUnloadToBase}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold transition"
              >
                <Upload className="w-4 h-4" />
                Unload All Cargo to Base
              </button>
            </div>
          </section>

          <section className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <Truck className="w-5 h-5 text-sky-400" />
              Current Vehicle Cargo
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Items currently loaded inside your rescue vehicle.
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-sm text-left">
                <thead className="bg-rose-900/60 text-rose-100 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">Quantity inside Vehicle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/50">
                  {vehicle.loads.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-6 text-center text-slate-500">
                        Vehicle cargo bay is empty.
                      </td>
                    </tr>
                  ) : (
                    vehicle.loads.map((l) => (
                      <tr key={l.pr_id} className="hover:bg-slate-900/80">
                        <td className="px-4 py-2.5 font-medium text-white">{l.pr_name}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-950 text-sky-300 border border-sky-800">
                            {l.pr_quantity}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* 3. Tasks Panel (matching volunteer.php Tasks Panel) */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
            <ClipboardList className="w-5 h-5 text-rose-400" />
            Tasks Panel
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-4">
            Manage your accepted tasks (up to 4). To complete a task, your vehicle must be within
            50m of the citizen&apos;s location.
          </p>

          {acceptedTasks.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-slate-400 text-sm">
              You have no active tasks assigned. Click on any orange/blue marker on the map to
              accept a citizen request or donation offer.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {acceptedTasks.map((t) => {
                const withinRange = t.distanceMeters <= 50;
                return (
                  <div
                    key={t.task_id}
                    className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                            t.dem_type === 'request'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-sky-950 text-sky-300 border border-sky-800'
                          }`}
                        >
                          {t.dem_type}
                        </span>
                        <span
                          className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                            withinRange
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          Distance: {t.distanceMeters}m {withinRange ? '(<=50m OK)' : '(>50m)'}
                        </span>
                      </div>

                      <div className="pt-1 text-slate-200">
                        <div>
                          <span className="text-slate-400">Name:</span>{' '}
                          <strong className="text-white">{t.cit_name}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Last Name:</span>{' '}
                          <strong className="text-white">{t.cit_laname}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Phone Number:</span> {t.cit_number}
                        </div>
                        <div>
                          <span className="text-slate-400">Task Submission Date:</span>{' '}
                          {new Date(t.task_submission_date).toLocaleString()}
                        </div>
                        <div>
                          <span className="text-slate-400">Product:</span>{' '}
                          <strong className="text-emerald-300">{t.pr_name}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Product Size:</span>{' '}
                          <strong>{t.dem_value}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => handleCompleteTask(t.task_id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Complete
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelTask(t.task_id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                      {!withinRange && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateLocation(t.cit_lat + 0.0001, t.cit_long + 0.0001)
                          }
                          className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                        >
                          <Navigation className="w-3 h-3 text-emerald-400" />
                          Move Vehicle Within 50m
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

