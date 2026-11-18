import React, { useState } from 'react';
import {
  CampusMetrics,
  DispatchFormInput,
  DropOrder,
  JOYA_LANDMARKS,
  OrderCategory,
  filterOrdersByCategory,
  validateOrderDispatch,
} from '../domain/campusData';
import { soundEngine } from '../utils/soundEffects';

export interface DropSimulatorModalProps {
  isOpen: boolean;
  orders: DropOrder[];
  metrics: CampusMetrics;
  onClose: () => void;
  onDispatchOrder: (input: DispatchFormInput) => void;
}

const CATEGORY_TABS: Array<{ id: OrderCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All Orders' },
  { id: 'food', label: 'Food & Dining' },
  { id: 'grocery', label: 'Grocery & Kirana' },
  { id: 'pharmacy', label: '24x7 Pharmacy' },
  { id: 'parcel', label: 'Local Parcel' },
];

export const DropSimulatorModal: React.FC<DropSimulatorModalProps> = ({
  isOpen,
  orders,
  metrics,
  onClose,
  onDispatchOrder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<OrderCategory | 'all'>('all');
  const [merchantName, setMerchantName] = useState('');
  const [category, setCategory] = useState<OrderCategory>('food');
  const [pickupSector, setPickupSector] = useState(JOYA_LANDMARKS[0]);
  const [dropDestination, setDropDestination] = useState(JOYA_LANDMARKS[3]);
  const [amountInr, setAmountInr] = useState('480');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredOrders = filterOrdersByCategory(orders, selectedCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formInput: DispatchFormInput = {
      merchantName,
      category,
      pickupSector,
      dropDestination,
      amountInr,
    };

    const validation = validateOrderDispatch(formInput);
    if (!validation.valid) {
      setErrors(validation.errors);
      setStatusBanner(null);
      return;
    }

    setErrors({});
    soundEngine.playDispatchChime();
    onDispatchOrder(formInput);
    setStatusBanner(
      `Dispatched EV Rider from Venom Stone HQ Fleet Bay for "${merchantName.trim()}"!`,
    );
    setMerchantName('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drop-sim-title"
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/75"
    >
      <div className="w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-xl bg-[#0f172a] border border-slate-700 p-6 text-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="text-xs text-slate-400">
              VENOM STONE COMPANY · JOYA &amp; AMROHA HYPERLOCAL SUPER-APP
            </div>
            <h2
              id="drop-sim-title"
              className="font-brand text-xl font-bold text-[#d49b27] mt-0.5"
            >
              DROP — One App for Everything Local (Joya, Amroha)
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiClick(460);
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Return to 3D Campus
          </button>
        </div>

        {/* Top KPI Bar */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400">Active Joya Orders</div>
            <div className="mt-1 text-lg font-bold text-white font-mono-tabular">
              {metrics.liveOrders}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400">EV Riders on NH-9</div>
            <div className="mt-1 text-lg font-bold text-[#10b981] font-mono-tabular">
              {metrics.activeRiders} Active
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400">Partner Stores</div>
            <div className="mt-1 text-lg font-bold text-[#d49b27] font-mono-tabular">
              {metrics.joyaMerchants} Merchants
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400">Daily Local GMV</div>
            <div className="mt-1 text-lg font-bold text-white font-mono-tabular">
              ₹{metrics.dailyGmvInr.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Two-Column Split: Left = Dispatch Form, Right = Live Joya Order Feed */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 5 Cols: New Order Dispatch Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="lg:col-span-5 rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-3.5"
          >
            <h3 className="text-sm font-semibold text-white">
              Dispatch Instant Local Order (Joya HQ)
            </h3>

            {statusBanner && (
              <div
                role="status"
                className="p-2.5 rounded-lg bg-emerald-950/90 border border-emerald-700 text-xs text-emerald-200"
              >
                {statusBanner}
              </div>
            )}

            <div>
              <label
                htmlFor="merchant-name-input"
                className="block text-xs font-medium text-slate-300 mb-1"
              >
                Joya Merchant / Store Name
              </label>
              <input
                id="merchant-name-input"
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="e.g. Royal Zaika Family Restaurant"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#d49b27]"
              />
              {errors.merchantName && (
                <p className="mt-1 text-xs text-red-400" role="alert">
                  {errors.merchantName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="order-category-select"
                  className="block text-xs font-medium text-slate-300 mb-1"
                >
                  Service Category
                </label>
                <select
                  id="order-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as OrderCategory)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#d49b27]"
                >
                  <option value="food">Food &amp; Dining</option>
                  <option value="grocery">Grocery &amp; Kirana</option>
                  <option value="pharmacy">24x7 Pharmacy</option>
                  <option value="parcel">Instant Parcel</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="order-amount-input"
                  className="block text-xs font-medium text-slate-300 mb-1"
                >
                  Order Value (₹ INR)
                </label>
                <input
                  id="order-amount-input"
                  type="number"
                  value={amountInr}
                  onChange={(e) => setAmountInr(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono-tabular focus:outline-none focus:border-[#d49b27]"
                />
                {errors.amountInr && (
                  <p className="mt-1 text-xs text-red-400" role="alert">
                    {errors.amountInr}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="pickup-sector-select"
                className="block text-xs font-medium text-slate-300 mb-1"
              >
                Pickup Hub (Joya)
              </label>
              <select
                id="pickup-sector-select"
                value={pickupSector}
                onChange={(e) => setPickupSector(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#d49b27]"
              >
                {JOYA_LANDMARKS.map((landmark) => (
                  <option key={landmark} value={landmark}>
                    {landmark}
                  </option>
                ))}
              </select>
              {errors.pickupSector && (
                <p className="mt-1 text-xs text-red-400" role="alert">
                  {errors.pickupSector}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="drop-destination-select"
                className="block text-xs font-medium text-slate-300 mb-1"
              >
                Drop Destination (Joya / Amroha)
              </label>
              <select
                id="drop-destination-select"
                value={dropDestination}
                onChange={(e) => setDropDestination(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#d49b27]"
              >
                {JOYA_LANDMARKS.map((landmark) => (
                  <option key={landmark} value={landmark}>
                    {landmark}
                  </option>
                ))}
              </select>
              {errors.dropDestination && (
                <p className="mt-1 text-xs text-red-400" role="alert">
                  {errors.dropDestination}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-[#10b981] hover:bg-[#34d399] text-slate-950 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              Dispatch EV Rider Now
            </button>
          </form>

          {/* Right 7 Cols: Live Order Feed with Interactive Filter Bar */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-white">
                Live Hyperlocal Routing Queue
              </h3>

              {/* Interactive Filter Controls */}
              <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto">
                {CATEGORY_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playUiClick(520);
                      setSelectedCategory(tab.id);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedCategory === tab.id
                        ? 'bg-[#d49b27] text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    {/* Unboxed inline metadata */}
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-mono-tabular text-[#d49b27] font-semibold">
                        {order.id}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="uppercase">{order.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{order.status}</span>
                      <span aria-hidden="true">·</span>
                      <span>{order.createdAtLabel}</span>
                    </div>

                    <div className="mt-1 text-sm font-semibold text-white">
                      {order.merchantName}
                    </div>

                    <div className="mt-0.5 text-xs text-slate-300">
                      {order.pickupSector} → {order.dropDestination}
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <div className="text-sm font-bold text-[#10b981] font-mono-tabular">
                      ₹{order.amountInr} · ETA {order.etaMinutes}m
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      Rider: {order.riderName}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
