'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

export interface VolunteerPendingTask {
  task_id: number;
  dem_id: number;
  dem_type: 'request' | 'donation';
  dem_value: number;
  pr_id: number;
  pr_name: string;
  cit_name: string;
  cit_laname: string;
  cit_number: string;
  cit_lat: number;
  cit_long: number;
  task_submission_date: string;
}

export interface VolunteerAcceptedTask extends VolunteerPendingTask {
  task_acceptance_date: string | null;
  user_name: string;
  distanceMeters: number;
}

interface VolunteerMapProps {
  base: { latitude: number; longtitude: number };
  volunteer: {
    vol_name: string;
    vol_lname: string;
    vol_lat: number;
    vol_long: number;
    user_name: string;
  };
  pendingTasks: VolunteerPendingTask[];
  acceptedTasks: VolunteerAcceptedTask[];
  onUpdateLocation: (lat: number, lng: number) => Promise<void>;
  onAcceptTask: (taskId: number) => Promise<void>;
}

export default function VolunteerMap({
  base,
  volunteer,
  pendingTasks,
  acceptedTasks,
  onUpdateLocation,
  onAcceptTask,
}: VolunteerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [showBase, setShowBase] = useState(true);
  const [showUser, setShowUser] = useState(true);
  const [showAccReq, setShowAccReq] = useState(true);
  const [showAccOff, setShowAccOff] = useState(true);
  const [showPendReq, setShowPendReq] = useState(true);
  const [showPendOff, setShowPendOff] = useState(true);
  const [showLines, setShowLines] = useState(true);

  const [pendingVehicleCoords, setPendingVehicleCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [volunteer.vol_lat || 38.2462, volunteer.vol_long || 21.7351],
      zoom: 15,
      minZoom: 2,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = group;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const group = layerGroupRef.current;
    if (!group) return;
    group.clearLayers();

    const makeIcon = (file: string) =>
      L.icon({
        iconUrl: `/markers/${file}`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -35],
      });

    const baseIcon = makeIcon('purple_marker.png');
    const userIcon = makeIcon('green_marker.png');
    const accReqIcon = makeIcon('red_marker.png');
    const accOffIcon = makeIcon('dark_blue_marker.png');
    const pendReqIcon = makeIcon('orange_marker.png');
    const pendOffIcon = makeIcon('blue_marker.png');

    // 1. Base Marker
    if (showBase && base) {
      const bm = L.marker([base.latitude, base.longtitude], {
        title: 'Base Warehouse',
        icon: baseIcon,
      });
      bm.bindPopup(
        `<div style="color:#0f172a;font-size:13px;">
          <strong>Base Warehouse</strong><br/>
          Move within 100m of Base to Load/Unload cargo.
        </div>`
      );
      group.addLayer(bm);
    }

    // 2. Volunteer's Draggable Vehicle Marker
    if (showUser && volunteer) {
      const um = L.marker([volunteer.vol_lat, volunteer.vol_long], {
        title: 'Your Vehicle (Drag to move)',
        draggable: true,
        icon: userIcon,
      });
      um.bindPopup(
        `<div style="color:#0f172a;font-size:13px;">
          <strong>Your Rescue Vehicle (${volunteer.user_name})</strong><br/>
          Lat: ${volunteer.vol_lat.toFixed(4)}, Lng: ${volunteer.vol_long.toFixed(4)}<br/>
          <span style="color:#64748b;font-size:11px;">Drag marker to update your vehicle position</span>
        </div>`
      );
      um.on('dragend', () => {
        const pos = um.getLatLng();
        setPendingVehicleCoords({ lat: pos.lat, lng: pos.lng });
      });
      group.addLayer(um);
    }

    // 3. Pending Tasks (with Accept Task button inside Popup)
    pendingTasks.forEach((t) => {
      const isRequest = t.dem_type === 'request';
      if (isRequest && !showPendReq) return;
      if (!isRequest && !showPendOff) return;

      const marker = L.marker([t.cit_lat, t.cit_long], {
        title: `Pending ${t.dem_type}`,
        icon: isRequest ? pendReqIcon : pendOffIcon,
      });

      const container = document.createElement('div');
      container.style.color = '#0f172a';
      container.style.fontSize = '13px';
      container.innerHTML = `
        <strong>Pending ${isRequest ? 'Request' : 'Offer (Donation)'}</strong><br/>
        <strong>Citizen Name:</strong> ${t.cit_name}<br/>
        <strong>Citizen Surname:</strong> ${t.cit_laname}<br/>
        <strong>Citizen Telephone:</strong> ${t.cit_number}<br/>
        <strong>Submission Date:</strong> ${new Date(t.task_submission_date).toLocaleString()}<br/>
        <strong>Product:</strong> ${t.pr_name}<br/>
        <strong>Size:</strong> ${t.dem_value}<br/>
        <strong>Acceptance Date:</strong> Not Accepted<br/>
        <strong>Vehicle username:</strong> Not Accepted<br/>
      `;

      const btn = document.createElement('button');
      btn.textContent = 'Accept Task';
      btn.style.marginTop = '8px';
      btn.style.padding = '6px 12px';
      btn.style.backgroundColor = '#e11d48';
      btn.style.color = '#ffffff';
      btn.style.borderRadius = '6px';
      btn.style.fontWeight = '600';
      btn.style.fontSize = '12px';
      btn.style.width = '100%';
      btn.style.cursor = 'pointer';
      btn.onclick = () => {
        onAcceptTask(t.task_id);
      };

      container.appendChild(btn);
      marker.bindPopup(container);
      group.addLayer(marker);
    });

    // 4. Accepted Tasks + Red Polylines
    acceptedTasks.forEach((t) => {
      const isRequest = t.dem_type === 'request';
      if (isRequest && !showAccReq) return;
      if (!isRequest && !showAccOff) return;

      const marker = L.marker([t.cit_lat, t.cit_long], {
        title: `Accepted ${t.dem_type}`,
        icon: isRequest ? accReqIcon : accOffIcon,
      });

      marker.bindPopup(
        `<div style="color:#0f172a;font-size:13px;">
          <strong>Accepted ${isRequest ? 'Request' : 'Offer (Donation)'}</strong><br/>
          <strong>Citizen Name:</strong> ${t.cit_name}<br/>
          <strong>Citizen Surname:</strong> ${t.cit_laname}<br/>
          <strong>Citizen Telephone:</strong> ${t.cit_number}<br/>
          <strong>Submission Date:</strong> ${new Date(t.task_submission_date).toLocaleString()}<br/>
          <strong>Product:</strong> ${t.pr_name}<br/>
          <strong>Size:</strong> ${t.dem_value}<br/>
          <strong>Acceptance Date:</strong> ${
            t.task_acceptance_date ? new Date(t.task_acceptance_date).toLocaleString() : 'Accepted'
          }<br/>
          <strong>Vehicle username:</strong> ${t.user_name}<br/>
          <strong>Distance:</strong> ${t.distanceMeters}m
        </div>`
      );

      group.addLayer(marker);

      if (showLines && showUser) {
        const line = L.polyline(
          [
            [t.cit_lat, t.cit_long],
            [volunteer.vol_lat, volunteer.vol_long],
          ],
          { color: '#ef4444', weight: 3 }
        );
        group.addLayer(line);
      }
    });
  }, [
    base,
    volunteer,
    pendingTasks,
    acceptedTasks,
    showBase,
    showUser,
    showAccReq,
    showAccOff,
    showPendReq,
    showPendOff,
    showLines,
    onAcceptTask,
  ]);

  return (
    <div className="space-y-4">
      {/* Layer Toggles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none p-1.5 rounded-lg hover:bg-slate-900">
          <input
            type="checkbox"
            checked={showBase}
            onChange={(e) => setShowBase(e.target.checked)}
            className="rounded accent-purple-500"
          />
          <img src="/markers/purple_marker.png" alt="Base" className="w-3.5 h-5" />
          <span className="text-purple-300 font-medium">Base Location</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none p-1.5 rounded-lg hover:bg-slate-900">
          <input
            type="checkbox"
            checked={showUser}
            onChange={(e) => setShowUser(e.target.checked)}
            className="rounded accent-emerald-500"
          />
          <img src="/markers/green_marker.png" alt="Your Location" className="w-3.5 h-5" />
          <span className="text-emerald-300 font-medium">Your Vehicle</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none p-1.5 rounded-lg hover:bg-slate-900">
          <input
            type="checkbox"
            checked={showAccReq}
            onChange={(e) => setShowAccReq(e.target.checked)}
            className="rounded accent-rose-500"
          />
          <img src="/markers/red_marker.png" alt="Accepted Requests" className="w-3.5 h-5" />
          <span className="text-rose-300 font-medium">Accepted Req.</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none p-1.5 rounded-lg hover:bg-slate-900">
          <input
            type="checkbox"
            checked={showAccOff}
            onChange={(e) => setShowAccOff(e.target.checked)}
            className="rounded accent-blue-500"
          />
          <img src="/markers/dark_blue_marker.png" alt="Accepted Offers" className="w-3.5 h-5" />
          <span className="text-blue-300 font-medium">Accepted Offers</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none p-1.5 rounded-lg hover:bg-slate-900">
          <input
            type="checkbox"
            checked={showPendReq}
            onChange={(e) => setShowPendReq(e.target.checked)}
            className="rounded accent-amber-500"
          />
          <img src="/markers/orange_marker.png" alt="Pending Requests" className="w-3.5 h-5" />
          <span className="text-amber-300 font-medium">Pending Req.</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none p-1.5 rounded-lg hover:bg-slate-900">
          <input
            type="checkbox"
            checked={showPendOff}
            onChange={(e) => setShowPendOff(e.target.checked)}
            className="rounded accent-sky-400"
          />
          <img src="/markers/blue_marker.png" alt="Pending Offers" className="w-3.5 h-5" />
          <span className="text-sky-300 font-medium">Pending Offers</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none p-1.5 rounded-lg hover:bg-slate-900">
          <input
            type="checkbox"
            checked={showLines}
            onChange={(e) => setShowLines(e.target.checked)}
            className="rounded accent-rose-500"
          />
          <span className="inline-block w-4 h-0.5 bg-rose-500" />
          <span className="text-rose-400 font-medium">Task Lines</span>
        </label>
      </div>

      {/* Confirmation Banner when Volunteer drags Vehicle marker */}
      {pendingVehicleCoords && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-700 text-emerald-100 text-sm">
          <div>
            <strong>Confirm Vehicle Move:</strong> Update your vehicle coordinates to{' '}
            <code className="text-emerald-300">
              [{pendingVehicleCoords.lat.toFixed(5)}, {pendingVehicleCoords.lng.toFixed(5)}]
            </code>
            ?
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await onUpdateLocation(pendingVehicleCoords.lat, pendingVehicleCoords.lng);
                setPendingVehicleCoords(null);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
            >
              Change Location
            </button>
            <button
              type="button"
              onClick={() => setPendingVehicleCoords(null)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-[360px] sm:h-[520px] rounded-2xl border border-slate-800 overflow-hidden shadow-inner z-0"
      />
    </div>
  );
}

