import React, { useState } from 'react';
import { User, Award, Shield, CheckCircle, Star, Edit3, Save, Check } from 'lucide-react';
import { TrainingLevel, TraineeProfile } from '../types';
import { soundFx } from '../engine/soundEffectsEngine';

interface ProfilePageProps {
  level: TrainingLevel;
  profile: TraineeProfile;
  onUpdateProfile: (updated: TraineeProfile) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ level, profile, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<TraineeProfile>(profile);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSuccess();
    onUpdateProfile(formData);
    setIsEditing(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const BADGES = [
    { name: 'RADAR SPECIALIST', desc: 'Achieved <10s average target detection speed across 20 drills.', icon: Award, color: 'border-emerald-500 text-emerald-400 bg-emerald-950/30' },
    { name: 'SWARM INTERCEPTOR', desc: 'Successfully classified and neutralized 5 simultaneous swarm elements.', icon: Shield, color: 'border-cyan-500 text-cyan-400 bg-cyan-950/30' },
    { name: 'ZERO DECOY ERROR', desc: 'Zero false alarm engagements on non-threat wildlife/decoys.', icon: CheckCircle, color: 'border-purple-500 text-purple-400 bg-purple-950/30' },
    { name: 'NIGHT VISION ACE', desc: 'Completed night fog scenario with >90% classification accuracy.', icon: Star, color: 'border-amber-500 text-amber-400 bg-amber-950/30' }
  ];

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 p-4 md:p-8 font-mono space-y-6 overflow-y-auto select-none">
      
      {/* Header Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 text-xl font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">{formData.rank}</span>
              <h1 className="text-2xl font-extrabold text-slate-100 uppercase">{formData.name}</h1>
            </div>
            <p className="text-xs text-slate-400 font-bold">SERVICE ID: {formData.serviceId} | {formData.unit.toUpperCase()}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                BRANCH: {formData.branch}
              </span>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                LEVEL: {level.toUpperCase()}
              </span>
              <span className="bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                {formData.baseLocation}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            setIsEditing(!isEditing);
          }}
          className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 hover:border-cyan-500 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition"
        >
          <Edit3 className="w-4 h-4" />
          <span>{isEditing ? 'CANCEL EDITING' : 'EDIT DEFENSE PROFILE'}</span>
        </button>
      </div>

      {/* Profile Form (Edit Mode) */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-slate-900 border border-cyan-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100 tracking-wider uppercase flex items-center space-x-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>DEFENSE PERSONNEL IDENTIFICATION SETTINGS</span>
            </h2>
            {isSaved && (
              <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                <Check className="w-4 h-4" />
                <span>PROFILE SAVED!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase">FULL NAME & INITIALS</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-slate-100 font-bold focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase">RANK / POSITION</label>
              <input
                type="text"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-slate-100 font-bold focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase">SERVICE ID NUMBER</label>
              <input
                type="text"
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-slate-100 font-bold focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase">ARMED FORCES BRANCH</label>
              <select
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value as TraineeProfile['branch'] })}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-cyan-300 font-bold focus:outline-none"
              >
                <option value="Indian Army">Indian Army</option>
                <option value="Indian Air Force">Indian Air Force</option>
                <option value="Indian Navy">Indian Navy</option>
                <option value="Indian Coast Guard">Indian Coast Guard</option>
                <option value="Special Forces">Special Forces</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase">UNIT / REGIMENT / BATTERY</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-slate-100 font-bold focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase">COMMAND / BASE LOCATION</label>
              <input
                type="text"
                value={formData.baseLocation}
                onChange={(e) => setFormData({ ...formData, baseLocation: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-slate-100 font-bold focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase flex items-center space-x-2 shadow-lg transition"
            >
              <Save className="w-4 h-4" />
              <span>SAVE DEFENSE PROFILE</span>
            </button>
          </div>
        </form>
      )}

      {/* Badges Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-200 tracking-wider uppercase border-b border-slate-800 pb-2">
          ACHIEVEMENT BADGES & MILITARY CERTIFICATIONS
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BADGES.map((b, idx) => {
            const IconComponent = b.icon;
            return (
              <div key={idx} className={`border rounded-xl p-4 space-y-2 ${b.color}`}>
                <div className="flex items-center space-x-2">
                  <IconComponent className="w-5 h-5" />
                  <h3 className="font-bold text-xs text-slate-100">{b.name}</h3>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
