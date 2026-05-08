'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, DollarSign, Trophy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createDonation, getLeaderboard, getMonthlyDonationTotal, tsToDate } from '@/lib/firestore';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Textarea } from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import { RoleBadge } from '@/components/ui/Badge';
import DonationProgress from '@/components/dashboard/DonationProgress';
import toast from 'react-hot-toast';

export default function DonationsPage() {
  const { user, refreshUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  const load = async () => {
    const [lb, mt] = await Promise.all([getLeaderboard(), getMonthlyDonationTotal()]);
    setLeaderboard(lb);
    setMonthlyTotal(mt);
  };

  useEffect(() => { load(); }, []);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount.'); return; }
    if (!user) return;
    setIsLoading(true);
    try {
      await createDonation({ userId: user.id, userName: user.name, amount: amt, message, isAnonymous });
      toast.success('Thank you for your donation! 💝 You now have Premium status!');
      setAmount(''); setMessage('');
      await Promise.all([load(), refreshUser()]);
    } catch (err: any) {
      toast.error(err.message);
    } finally { setIsLoading(false); }
  };

  const quickAmounts = [5, 10, 25, 50, 100];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Donations</h1>
        <p className="text-slate-400 mt-1">Support your shared home community and unlock Premium benefits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donation form */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                <CardTitle>Make a Donation</CardTitle>
              </div>
            </CardHeader>
            <form onSubmit={handleDonate} className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 mb-2">Quick amounts</p>
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map(a => (
                    <button key={a} type="button" onClick={() => setAmount(a.toString())}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${amount === String(a) ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                      ${a}
                    </button>
                  ))}
                </div>
              </div>
              <Input label="Custom Amount ($)" type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0.00" min="0.01" step="0.01" leftIcon={<DollarSign className="w-4 h-4" />} required />
              <Textarea label="Message (optional)" value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Leave a message for your housemates..." rows={2} />
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-violet-600" />
                <span className="text-sm text-slate-300">Donate anonymously</span>
              </label>
              <Button type="submit" variant="primary" fullWidth isLoading={isLoading} leftIcon={<Heart className="w-4 h-4" />}>
                Donate Now
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader><CardTitle>🌟 Premium Benefits</CardTitle></CardHeader>
            <ul className="space-y-2 text-sm text-slate-300">
              {['3 reservations/day (vs 1)', '10 reservations/week (vs 3)', '8 hour sessions (vs 4)', '14 days advance booking', 'Priority in conflicts', 'Premium badge'].map(b => (
                <li key={b} className="flex items-center gap-2"><span className="text-violet-400">✓</span>{b}</li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          <DonationProgress monthlyTotal={monthlyTotal} allTimeTotal={monthlyTotal} />

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <CardTitle>Top Donors</CardTitle>
              </div>
            </CardHeader>
            {leaderboard.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No donations yet. Be the first!</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((donor: any, i) => (
                  <motion.div key={donor.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                    <span className={`text-lg font-bold w-8 text-center ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <Avatar name={donor.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{donor.name}</p>
                        <RoleBadge role={donor.role} />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-violet-400">${(donor.totalDonations || 0).toFixed(2)}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
