import { useCallback, useEffect, useMemo, useState } from 'react';
import type { RpcOptions } from '@protobuf-ts/runtime-rpc';
import { AppShell } from '../components/layout/AppShell';
import { driverClient, stationClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Area } from '../proto/common';
import type { DriverProfile, RoutePlan, RouteStop } from '../proto/driver';
import { Timestamp as TimestampMessage } from '../proto/google/protobuf/timestamp';

type ToastState = {
	type: 'success' | 'error';
	message: string;
} | null;

const timestampLabel = (ts?: TimestampMessage) => {
	if (!ts) return 'Awaiting schedule';
	try {
		return TimestampMessage.toDate(ts).toLocaleString();
	} catch {
		return 'Pending timestamp';
	}
};

type MessageCarrier = { message?: string };
type RpcErrorLike = { statusMessage?: string };

const hasMessage = (value: unknown): value is MessageCarrier => (
	typeof value === 'object'
	&& value !== null
	&& 'message' in value
	&& typeof (value as MessageCarrier).message === 'string'
);

const hasStatusMessage = (value: unknown): value is RpcErrorLike => (
	typeof value === 'object'
	&& value !== null
	&& 'statusMessage' in value
	&& typeof (value as RpcErrorLike).statusMessage === 'string'
);

const extractError = (error: unknown, fallback = 'Request failed') => {
	if (!error) return fallback;
	if (typeof error === 'string') return error;
	if (error instanceof Error) return error.message;
	if (hasStatusMessage(error) && error.statusMessage) return error.statusMessage;
	if (hasMessage(error) && error.message) return error.message;
	return fallback;
};

export const DriverDashboard = () => {
	const { token, userId } = useAuth();
	const rpcOptions = useMemo<RpcOptions | undefined>(() => (
		token ? { meta: { Authorization: `Bearer ${token}` } } : undefined
	), [token]);

	const [areas, setAreas] = useState<Area[]>([]);
	const [areasLoading, setAreasLoading] = useState(true);
	const areaLookup = useMemo(() => new Map(areas.map(area => [area.id, area])), [areas]);

	const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
	const [driverId, setDriverId] = useState<string | null>(() => localStorage.getItem('driverId'));
	const [manualDriverLookup, setManualDriverLookup] = useState('');

	const [vehicleNo, setVehicleNo] = useState('');
	const [capacity, setCapacity] = useState(4);
	const [registeringDriver, setRegisteringDriver] = useState(false);

	const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
	const [savingRoute, setSavingRoute] = useState(false);
	const [pickupLoadingRoute, setPickupLoadingRoute] = useState<string | null>(null);
	const [refreshingProfile, setRefreshingProfile] = useState(false);

	const [toast, setToast] = useState<ToastState>(null);

	const defaultAreaId = areas[0]?.id ?? '';

	useEffect(() => {
		let ignore = false;
		const loadAreas = async () => {
			try {
				setAreasLoading(true);
				const { response } = await stationClient.listAreas({}, rpcOptions);
				if (!ignore) setAreas(response.items);
			} catch (error) {
				if (!ignore) setToast({ type: 'error', message: extractError(error, 'Unable to load service areas') });
			} finally {
				if (!ignore) setAreasLoading(false);
			}
		};
		loadAreas();
		return () => { ignore = true; };
	}, [rpcOptions]);

	const refreshDriverProfile = useCallback(async (id: string) => {
		if (!id) return null;
		setRefreshingProfile(true);
		try {
			const { response } = await driverClient.getDriver({ id }, rpcOptions);
			setDriverProfile(response);
			setDriverId(response.driverId);
			localStorage.setItem('driverId', response.driverId);
			return response;
		} finally {
			setRefreshingProfile(false);
		}
	}, [rpcOptions]);

	useEffect(() => {
		if (!driverId) return;
		refreshDriverProfile(driverId).catch(error => {
			setToast({ type: 'error', message: extractError(error, 'Unable to load driver profile') });
		});
	}, [driverId, refreshDriverProfile]);

	useEffect(() => {
		if (driverProfile) {
			setVehicleNo(driverProfile.vehicleNo);
			setCapacity(driverProfile.capacity || 4);
		}
	}, [driverProfile]);

	const handleRegisterDriver = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!userId) {
			setToast({ type: 'error', message: 'Missing user identity' });
			return;
		}
		if (!vehicleNo.trim()) {
			setToast({ type: 'error', message: 'Vehicle number is required' });
			return;
		}
		setRegisteringDriver(true);
		try {
			const { response } = await driverClient.registerDriver({ userId, vehicleNo: vehicleNo.trim(), capacity }, rpcOptions);
			setDriverProfile(response);
			setDriverId(response.driverId);
			localStorage.setItem('driverId', response.driverId);
			setToast({ type: 'success', message: 'Driver profile created – let’s build a route!' });
		} catch (error) {
			setToast({ type: 'error', message: extractError(error, 'Failed to register driver') });
		} finally {
			setRegisteringDriver(false);
		}
	};

	const handleManualAttach = async (event: React.FormEvent) => {
		event.preventDefault();
		const trimmed = manualDriverLookup.trim();
		if (!trimmed) return;
		try {
			const profile = await refreshDriverProfile(trimmed);
			if (profile) {
				setToast({ type: 'success', message: 'Connected existing driver profile' });
				setManualDriverLookup('');
			}
		} catch (error) {
			setToast({ type: 'error', message: extractError(error, 'Driver ID not found') });
		}
	};

	const handleAddStop = () => {
		if (!areas.length) {
			setToast({ type: 'error', message: 'Load service areas before planning a route' });
			return;
		}
		const previous = routeStops[routeStops.length - 1];
		const fallbackArea = previous?.areaId ?? defaultAreaId;
		const resolvedArea = areaLookup.get(fallbackArea);
		const newStop: RouteStop = {
			sequence: routeStops.length + 1,
			areaId: fallbackArea,
			isStation: resolvedArea?.isStation ?? true,
			arrivalOffsetMinutes: previous ? previous.arrivalOffsetMinutes + 5 : 0,
		};
		setRouteStops(prev => [...prev, newStop]);
	};

	const handleStopChange = (index: number, patch: Partial<RouteStop>) => {
		setRouteStops(prev => prev.map((stop, idx) => {
			if (idx !== index) return stop;
			const nextArea = patch.areaId ? areaLookup.get(patch.areaId) : null;
			return {
				...stop,
				...patch,
				isStation: patch.areaId ? (nextArea?.isStation ?? stop.isStation) : stop.isStation,
			};
		}));
	};

	const handleRemoveStop = (index: number) => {
		setRouteStops(prev => prev.filter((_, idx) => idx !== index).map((stop, idx) => ({
			...stop,
			sequence: idx + 1,
		})));
	};

	const handleRegisterRoute = async () => {
		if (!driverId) {
			setToast({ type: 'error', message: 'Create or attach a driver profile before publishing routes' });
			return;
		}
		if (routeStops.length < 2) {
			setToast({ type: 'error', message: 'Add at least two stops to publish a route' });
			return;
		}
		setSavingRoute(true);
		try {
			const normalizedStops = routeStops.map((stop, idx) => {
				const area = areaLookup.get(stop.areaId);
				return {
					sequence: idx + 1,
					areaId: stop.areaId,
					arrivalOffsetMinutes: stop.arrivalOffsetMinutes,
					isStation: area?.isStation ?? stop.isStation,
				} satisfies RouteStop;
			});
			const { response } = await driverClient.registerRoute({ driverId, stops: normalizedStops }, rpcOptions);
			setRouteStops([]);
			setToast({ type: 'success', message: `Route ${response.routeId.substring(0, 6)} created` });
			await refreshDriverProfile(driverId);
		} catch (error) {
			setToast({ type: 'error', message: extractError(error, 'Unable to save route') });
		} finally {
			setSavingRoute(false);
		}
	};

	const handlePickupStatus = async (routeId: string, pickingUp: boolean) => {
		if (!driverId) return;
		setPickupLoadingRoute(routeId);
		try {
			const { response } = await driverClient.updatePickupStatus({ driverId, routeId, pickingUp }, rpcOptions);
			const message = response.msg || (pickingUp ? 'Marked as picking riders up' : 'Marked as idle');
			setToast({ type: response.ok ? 'success' : 'error', message });
		} catch (error) {
			setToast({ type: 'error', message: extractError(error, 'Failed to update pickup status') });
		} finally {
			setPickupLoadingRoute(null);
		}
	};

	const plannedRoutes = useMemo<RoutePlan[]>(() => {
		if (!driverProfile?.routes?.length) return [];
		return [...driverProfile.routes].sort((a, b) => {
			const aSeconds = a.createdAt ? Number(a.createdAt.seconds) : 0;
			const bSeconds = b.createdAt ? Number(b.createdAt.seconds) : 0;
			return bSeconds - aSeconds;
		});
	}, [driverProfile?.routes]);

	const stopsDisabled = !driverId || savingRoute || refreshingProfile;

	return (
		<AppShell
			title="Driver Command Center"
			subtitle="Register your vehicle, curate last-mile loops, and keep pickups in sync."
			actions={driverId ? (
				<button
					type="button"
					onClick={() => driverId && refreshDriverProfile(driverId).catch(error => setToast({ type: 'error', message: extractError(error, 'Unable to refresh profile') }))}
					className="rounded-full border border-white/40 px-4 py-1 text-xs font-semibold uppercase tracking-widest transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
					disabled={refreshingProfile}
				>
					{refreshingProfile ? 'Syncing…' : 'Sync Profile'}
				</button>
			) : undefined}
		>
			{toast && (
				<div className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg ${toast.type === 'success' ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200' : 'border-rose-500/40 bg-rose-950/30 text-rose-200'}`}>
					{toast.message}
				</div>
			)}

			<div className="grid gap-6 xl:grid-cols-3">
				<section className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur xl:col-span-1">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm uppercase tracking-[0.3em] text-indigo-200/70">Onboarding</p>
							<h2 className="text-2xl font-semibold text-white">Fleet Identity</h2>
						</div>
						{driverProfile && (
							<span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
								Ready
							</span>
						)}
					</div>

					{driverProfile ? (
						<div className="mt-6 space-y-4 text-sm text-slate-200">
							<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.3em] text-slate-400">Driver ID</p>
								<div className="mt-1 flex items-center gap-2 text-lg font-mono text-white">
									<span>{driverProfile.driverId}</span>
									<button
										type="button"
										onClick={() => navigator.clipboard?.writeText(driverProfile.driverId)}
										className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-widest transition hover:bg-white/10"
									>
										Copy
									</button>
								</div>
							</div>
							<div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/0 p-4">
								<div>
									<p className="text-xs uppercase tracking-[0.3em] text-slate-400">Vehicle</p>
									<p className="text-lg font-semibold text-white">{driverProfile.vehicleNo}</p>
								</div>
								<div>
									<p className="text-xs uppercase tracking-[0.3em] text-slate-400">Capacity</p>
									<p className="text-lg font-semibold text-white">{driverProfile.capacity} riders</p>
								</div>
								<div>
									<p className="text-xs uppercase tracking-[0.3em] text-slate-400">Routes planned</p>
									<p className="text-lg font-semibold text-white">{plannedRoutes.length}</p>
								</div>
							</div>
						</div>
					) : (
						<div className="mt-6 space-y-6">
							<form onSubmit={handleRegisterDriver} className="space-y-4">
								<div>
									<label className="text-xs uppercase tracking-[0.4em] text-slate-400">Vehicle Number</label>
									<input
										type="text"
										value={vehicleNo}
										onChange={(event) => setVehicleNo(event.target.value.toUpperCase())}
										className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
										placeholder="KA-01-AB-1234"
									/>
								</div>
								<div>
									<label className="text-xs uppercase tracking-[0.4em] text-slate-400">Seating Capacity</label>
									<input
										type="number"
										min={2}
										max={8}
										value={capacity}
										onChange={(event) => setCapacity(Number(event.target.value))}
										className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none"
									/>
								</div>
								<button
									type="submit"
									className="w-full rounded-2xl bg-indigo-500/80 px-4 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
									disabled={registeringDriver}
								>
									{registeringDriver ? 'Registering…' : 'Register Driver'}
								</button>
							</form>

							<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.3em] text-slate-400">Attach Existing Driver</p>
								<p className="mt-1 text-sm text-slate-300">Already onboarded elsewhere? Paste your driver ID.</p>
								<form onSubmit={handleManualAttach} className="mt-3 flex flex-col gap-3">
									<input
										type="text"
										value={manualDriverLookup}
										onChange={(event) => setManualDriverLookup(event.target.value)}
										className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-white focus:border-indigo-400 focus:outline-none"
										placeholder="drv_123..."
									/>
									<button
										type="submit"
										className="rounded-2xl border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-white/10"
									>
										Link Driver ID
									</button>
								</form>
							</div>
						</div>
					)}
				</section>

				<section className="rounded-3xl border border-white/5 bg-gradient-to-br from-indigo-500/10 via-transparent to-sky-500/20 p-6 backdrop-blur xl:col-span-2">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="text-sm uppercase tracking-[0.3em] text-indigo-200/70">Route Designer</p>
							<h2 className="text-2xl font-semibold text-white">Compose Your Loop</h2>
							<p className="text-sm text-slate-300">Add station pickups and intermediate areas. Offsets represent minutes from route start.</p>
						</div>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={handleAddStop}
								className="rounded-2xl border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
								disabled={stopsDisabled}
							>
								+ Add Stop
							</button>
							<button
								type="button"
								onClick={() => setRouteStops([])}
								className="rounded-2xl border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
								disabled={routeStops.length === 0}
							>
								Reset
							</button>
						</div>
					</div>

					{!driverId && (
						<div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
							Complete driver onboarding to unlock the route builder.
						</div>
					)}

					<div className="mt-6 space-y-4">
						{routeStops.length === 0 && (
							<p className="rounded-2xl border border-dashed border-white/20 p-6 text-center text-sm text-slate-300">
								{areasLoading ? 'Loading service areas…' : 'No stops yet — add your first pickup point.'}
							</p>
						)}

						{routeStops.map((stop, index) => (
							<div key={index} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center">
								<div className="flex items-center gap-3 text-sm font-semibold text-indigo-200">
									<span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-lg font-bold text-white">{index + 1}</span>
									<div>
										<p className="text-xs uppercase tracking-[0.4em] text-slate-400">Stop</p>
										<p>{areaLookup.get(stop.areaId)?.name ?? 'Select area'}</p>
									</div>
								</div>
								<div className="flex-1">
									<label className="text-xs uppercase tracking-[0.4em] text-slate-400">Area</label>
									<select
										value={stop.areaId}
										onChange={(event) => handleStopChange(index, { areaId: event.target.value })}
										className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none"
										disabled={stopsDisabled}
									>
										{areas.map(area => (
											<option key={area.id} value={area.id} className="bg-slate-900 text-white">
												{area.name}{area.isStation ? ' • Station' : ''}
											</option>
										))}
									</select>
								</div>
								<div className="w-full md:w-48">
									<label className="text-xs uppercase tracking-[0.4em] text-slate-400">Offset (min)</label>
									<input
										type="number"
										min={0}
										value={stop.arrivalOffsetMinutes}
										onChange={(event) => handleStopChange(index, { arrivalOffsetMinutes: Number(event.target.value) })}
										className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none"
										disabled={stopsDisabled}
									/>
								</div>
								<button
									type="button"
									onClick={() => handleRemoveStop(index)}
									className="rounded-2xl border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:bg-white/10"
									disabled={stopsDisabled}
								>
									Remove
								</button>
							</div>
						))}
					</div>

					<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
						<button
							type="button"
							onClick={handleRegisterRoute}
							className="rounded-2xl bg-emerald-500/80 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
							disabled={stopsDisabled || routeStops.length < 2}
						>
							{savingRoute ? 'Publishing…' : 'Publish Route'}
						</button>
						<p className="text-xs uppercase tracking-[0.4em] text-slate-400">
							{routeStops.length < 2 ? 'Add at least two stops' : `${routeStops.length} stops queued`}
						</p>
					</div>
				</section>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<section className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur lg:col-span-2">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="text-sm uppercase tracking-[0.3em] text-indigo-200/70">Live Routes</p>
							<h2 className="text-2xl font-semibold text-white">Operational Timeline</h2>
							<p className="text-sm text-slate-300">View planned loops and broadcast pickup state.</p>
						</div>
					</div>

					{plannedRoutes.length === 0 ? (
						<p className="mt-6 rounded-2xl border border-dashed border-white/20 p-6 text-center text-sm text-slate-300">
							No routes yet. Publish one to see it here.
						</p>
					) : (
						<div className="mt-6 space-y-4">
							{plannedRoutes.map(route => (
								<div key={route.routeId} className="rounded-2xl border border-white/10 bg-white/5 p-5">
									<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
										<div>
											<p className="text-xs uppercase tracking-[0.3em] text-slate-400">Route ID</p>
											<p className="text-lg font-semibold text-white">{route.routeId}</p>
											<p className="text-sm text-slate-300">Created {timestampLabel(route.createdAt)}</p>
										</div>
										<div className="flex gap-2">
											<button
												type="button"
												onClick={() => handlePickupStatus(route.routeId, true)}
												className="rounded-2xl border border-emerald-400/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
												disabled={pickupLoadingRoute === route.routeId}
											>
												Start Pickup
											</button>
											<button
												type="button"
												onClick={() => handlePickupStatus(route.routeId, false)}
												className="rounded-2xl border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
												disabled={pickupLoadingRoute === route.routeId}
											>
												Clear
											</button>
										</div>
									</div>
									<div className="mt-4 space-y-3">
										{route.stops.map(stop => (
											<div key={`${route.routeId}-${stop.sequence}`} className="flex items-center gap-4">
												<div className="text-sm font-semibold text-indigo-200">#{stop.sequence}</div>
												<div className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
													<p className="text-sm font-medium text-white">{areaLookup.get(stop.areaId)?.name ?? stop.areaId}</p>
													<p className="text-xs text-slate-400">{stop.isStation ? 'Station stop' : 'Pass-through'} • +{stop.arrivalOffsetMinutes} min</p>
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					)}
				</section>

				<section className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/60 via-slate-950/80 to-black p-6">
					<p className="text-sm uppercase tracking-[0.3em] text-indigo-200/70">Service Areas</p>
					<h2 className="text-2xl font-semibold text-white">Field Cheat Sheet</h2>
					<p className="text-sm text-slate-300">Quick reference for neighborhoods and stations available in the network.</p>

					<div className="mt-5 space-y-3 max-h-[420px] overflow-y-auto pr-2">
						{areasLoading ? (
							<p className="text-sm text-slate-400">Loading areas…</p>
						) : areas.length === 0 ? (
							<p className="text-sm text-slate-400">No areas provisioned.</p>
						) : (
							areas.map(area => (
								<div key={area.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
									<div>
										<p className="font-semibold text-white">{area.name}</p>
										<p className="text-xs text-slate-400">{area.id}</p>
									</div>
									<span className={`rounded-full px-3 py-1 text-xs font-semibold ${area.isStation ? 'bg-indigo-500/20 text-indigo-200' : 'bg-slate-700 text-slate-200'}`}>
										{area.isStation ? 'Station' : 'Zone'}
									</span>
								</div>
							))
						)}
					</div>
				</section>
			</div>
		</AppShell>
	);
};
