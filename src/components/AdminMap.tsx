'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

export interface AdminVehicleMarker {
  veh_id: number;
  veh_vol_id: number;
  veh_task_num: number;
  latitude: number;
  longtitude: number;
  user_name: string;
  vol_name: string;
  vol_lname: string;
  loads: { pr_id: number; pr_name: string; pr_quantity: number }[];
}

export interface AdminDemandMarker {
  task_id: number;
  dem_id: number;
  cit_id: number;
  cit_name: string;
  cit_laname: string;
  cit_number: string;
  cit_lat: number;
  cit_long: number;
  dem_type: 'request' | 'donation';
  dem_value: number;
  pr_name: string;
  task_submission_date: string;
  task_acceptance_date: string | null;
  task_completion_date: string | null;
  acc_vol_id: number | null;
  veh_id: number | null;
  veh_lat: number | null;
  veh_long: number | null;
  user_name: string | null;
}

interface AdminMapProps {
  base: { id: number; latitude: number; longtitude: number };
  vehicles: AdminVehicleMarker[];
  demands: AdminDemandMarker[];
  onUpdateBaseLocation: (lat: number, lng: number) => Promise<void>;
}

export default function AdminMap({
  base,
  vehicles,
  demands,
  onUpdateBaseLocation,
}: AdminMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Layer visibility toggles (matching base2.php checkboxes)
  const [showBase, setShowBase] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showAccReq, setShowAccReq] = useState(true);
  const [showAccOff, setShowAccOff] = useState(true);
  const [showPendReq, setShowPendReq] = useState(true);
  const [showPendOff, setShowPendOff] = useState(true);
  const [showLines, setShowLines] = useState(true);

  const [pendingBaseCoords, setPendingBaseCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [base?.latitude || 38.2462, base?.longtitude || 21.7351],
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
    const vehicleIcon = makeIcon('green_marker.png');
    const accReqIcon = makeIcon('red_marker.png');
    const accOffIcon = makeIcon('dark_blue_marker.png');
    const pendReqIcon = makeIcon('orange_marker.png');
    const pendOffIcon = makeIcon('blue_marker.png');

    // 1. Base Marker (Draggable)
    if (showBase && base) {
      const baseMarker = L.marker([base.latitude, base.longtitude], {
        title: 'Base (Drag to relocate)',
        draggable: true,
        icon: baseIcon,
      });

      baseMarker.bindPopup(
        `<div style="color:#0f172a;font-size:13px;">
          <strong>Central Warehouse Base</strong><br/>
          Lat: ${base.latitude.toFixed(4)}, Lng: ${base.longtitude.toFixed(4)}<br/>
          <span style="color:#64748b;font-size:11px;">Drag marker to relocate Base</span>
        </div>`
      );

      baseMarker.on('dragend', () => {
        const pos = baseMarker.getLatLng();
        setPendingBaseCoords({ lat: pos.lat, lng: pos.lng });
      });

      group.addLayer(baseMarker);
    }

    // 2. Vehicle Markers
    if (showVehicles) {
      vehicles.forEach((v) => {
        const loadStr =
          v.loads.length > 0
            ? v.loads.map((l) => `${l.pr_name} (${l.pr_quantity})`).join(', ')
            : 'None';

        const vehMarker = L.marker([v.latitude, v.longtitude], {
          title: `Vehicle: ${v.user_name}`,
          icon: vehicleIcon,
        });

        vehMarker.bindPopup(
          `<div style="color:#0f172a;font-size:13px;">
            <strong>Volunteer Vehicle</strong><br/>
            <strong>Volunteer Username:</strong> ${v.user_name}<br/>
            <strong>Volunteer Name:</strong> ${v.vol_name}<br/>
            <strong>Volunteer Surname:</strong> ${v.vol_lname}<br/>
            <strong>Active Tasks:</strong> ${v.veh_task_num} / 4<br/>
            <strong>Vehicle Load:</strong> ${loadStr}
          </div>`
        );

        group.addLayer(vehMarker);
      });
    }

    // 3. Demands (Accepted & Pending Requests / Offers) + Polylines
    demands.forEach((d) => {
      const isAccepted = d.task_acceptance_date !== null;
      const isRequest = d.dem_type === 'request';

      if (isAccepted && isRequest && !showAccReq) return;
      if (isAccepted && !isRequest && !showAccOff) return;
      if (!isAccepted && isRequest && !showPendReq) return;
      if (!isAccepted && !isRequest && !showPendOff) return;

      const icon = isAccepted
        ? isRequest
          ? accReqIcon
          : accOffIcon
        : isRequest
        ? pendReqIcon
        : pendOffIcon;

      const subDate = new Date(d.task_submission_date).toLocaleString();
      const accDate = d.task_acceptance_date
        ? new Date(d.task_acceptance_date).toLocaleString()
        : 'Not Accepted';

      const marker = L.marker([d.cit_lat, d.cit_long], {
        title: `${isAccepted ? 'Accepted' : 'Pending'} ${d.dem_type}`,
        icon,
      });

      marker.bindPopup(
        `<div style="color:#0f172a;font-size:13px;">
          <strong>${isAccepted ? 'Accepted' : 'Pending'} ${
          isRequest ? 'Request' : 'Offer (Donation)'
        }</strong><br/>
          <strong>Citizen Name:</strong> ${d.cit_name}<br/>
          <strong>Citizen Surname:</strong> ${d.cit_laname}<br/>
          <strong>Citizen Telephone:</strong> ${d.cit_number}<br/>
          <strong>Submission Date:</strong> ${subDate}<br/>
          <strong>Product:</strong> ${d.pr_name}<br/>
          <strong>Size:</strong> ${d.dem_value}<br/>
          <strong>Acceptance Date:</strong> ${accDate}<br/>
          <strong>Vehicle username:</strong> ${d.user_name || 'Not Accepted'}
        </div>`
      );

      group.addLayer(marker);

      if (isAccepted && showLines && d.veh_lat !== null && d.veh_long !== null) {
        const line = L.polyline(
          [
            [d.cit_lat, d.cit_long],
            [d.veh_lat, d.veh_long],
          ],
          { color: '#ef4444', weight: 3, dashArray: '6, 6' }
        );
        group.addLayer(line);
      }
    });
  }, [
    base,
    vehicles,
    demands,
    showBase,
    showVehicles,
    showAccReq,
    showAccOff,
    showPendReq,
    showPendOff,
    showLines,
  ]);

  return (
    <div className="space-y-4">
      {/* Marker Legend & Layer Filter Bar */}
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
            checked={showVehicles}
            onChange={(e) => setShowVehicles(e.target.checked)}
            className="rounded accent-emerald-500"
          />
          <img src="/markers/green_marker.png" alt="Vehicles" className="w-3.5 h-5" />
          <span className="text-emerald-300 font-medium">Vehicles</span>
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

      {/* Confirmation Banner when Base Marker is dragged */}
      {pendingBaseCoords && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-purple-950/70 border border-purple-700 text-purple-100 text-sm">
          <div>
            <strong>Confirm Base Relocation:</strong> Move Central Base to{' '}
            <code className="text-purple-300">
              [{pendingBaseCoords.lat.toFixed(5)}, {pendingBaseCoords.lng.toFixed(5)}]
            </code>
            ?
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await onUpdateBaseLocation(pendingBaseCoords.lat, pendingBaseCoords.lng);
                setPendingBaseCoords(null);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
            >
              Change Location
            </button>
            <button
              type="button"
              onClick={() => setPendingBaseCoords(null)}
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
        className="w-full h-[360px] sm:h-[540px] rounded-2xl border border-slate-800 overflow-hidden shadow-inner z-0"
      />
    </div>
  );
}

