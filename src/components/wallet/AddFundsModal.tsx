'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { X, CreditCard, Loader2 } from 'lucide-react';
import { brandApi } from '@/src/lib/api';
import { openRazorpayCheckout } from '@/src/lib/razorpay';

const PRESET_AMOUNTS = [1000, 2500, 5000, 10000, 25000];

interface AddFundsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddFundsModal({ open, onClose, onSuccess }: AddFundsModalProps) {
  const [amount, setAmount] = useState(5000);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const resolvedAmount = customAmount ? Number(customAmount) : amount;

  const handlePay = async () => {
    if (!resolvedAmount || resolvedAmount < 1) {
      toast.error('Enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const { keyId } = await brandApi.getRazorpayKey();

      if (!keyId) {
        await brandApi.addFunds(resolvedAmount);
        toast.success(`₹${resolvedAmount.toLocaleString()} added to your wallet`);
        onSuccess();
        onClose();
        return;
      }

      const order = await brandApi.createPaymentOrder(resolvedAmount);
      const payment = await openRazorpayCheckout({
        keyId: order.keyId ?? keyId,
        orderId: order.orderId,
        amount: order.amount,
        description: 'ViralBridge wallet top-up',
      });

      await brandApi.verifyPayment({
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_signature: payment.razorpay_signature,
      });

      toast.success(`₹${resolvedAmount.toLocaleString()} added to your wallet`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <CreditCard size={18} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Add Funds</h2>
              <p className="text-xs text-slate-500">Top up your brand wallet securely</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setAmount(preset);
                setCustomAmount('');
              }}
              className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                amount === preset && !customAmount
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-violet-300'
              }`}
            >
              ₹{(preset / 1000).toFixed(0)}K
            </button>
          ))}
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Custom amount (₹)</label>
          <input
            type="number"
            min={1}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder={`${amount.toLocaleString()}`}
            className="mt-1.5 w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
          />
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-5 flex items-center justify-between">
          <span className="text-sm text-slate-600">Total to pay</span>
          <span className="text-xl font-black text-slate-800">₹{resolvedAmount.toLocaleString()}</span>
        </div>

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          {loading ? 'Processing...' : 'Pay with Razorpay'}
        </button>

        <p className="text-xs text-slate-400 text-center mt-3">
          Funds are credited instantly after payment verification
        </p>
      </div>
    </div>
  );
}
