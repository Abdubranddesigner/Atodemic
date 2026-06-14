import React, { useState } from 'react';
import { useAppState } from './AppContext';
import { StudyGroup } from '../types';
import { Users, Lock, Unlock, Hash, Plus, Sparkles, User, Award, ShieldAlert } from 'lucide-react';

export default function StudyGroupsView() {
  const { state, createGroup, joinGroup } = useAppState();

  const [groupName, setGroupName] = useState('');
  const [privacy, setPrivacy] = useState<'Public' | 'Private'>('Public');
  const [inviteCodeInput, setInviteCodeInput] = useState('');

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    createGroup(groupName, privacy);
    setGroupName('');
  };

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    const joined = joinGroup(inviteCodeInput);
    if (joined) {
      setInviteCodeInput('');
    } else {
      alert("Verification Code not recognized by core network nodes.");
    }
  };

  const groups = state.studyGroups || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in pb-12">
      
      {/* List of active groups */}
      <div className="lg:col-span-8 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Co-Working Study Circles</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Collaborative cohorts ranked objectively on study consistency and readiness.
          </p>
        </div>

        {groups.length === 0 ? (
          <div className="p-16 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10">
            <Users className="h-10 w-10 text-zinc-650 mx-auto mb-3" />
            <p className="text-zinc-500 text-xs">No study groups joined yet. Create one or enter a colleague's code now.</p>
          </div>
        ) : (
          groups.map((group) => {
            // Sort peer members of study circle by study consistency / hours logged
            const sortedMembers = [...group.members].sort((a,b) => b.weeklyHours - a.weeklyHours);

            return (
              <div key={group.id} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/10 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-20 w-20 bg-indigo-500/[0.02] rounded-bl-full pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                  <div>
                    <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                      {group.name} {group.privacy === 'Private' ? <Lock className="h-3.5 w-3.5 text-zinc-500" /> : <Unlock className="h-3.5 w-3.5 text-zinc-500" />}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Invite Code: <strong>{group.inviteCode}</strong></p>
                  </div>
                  <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">
                    {group.members.length} Peer Scholars Active
                  </span>
                </div>

                {/* Score ranking table */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cohort leaderboard</h5>
                  <div className="space-y-2">
                    {sortedMembers.map((member, mIdx) => {
                      const isSelf = member.userId === state.profile?.username;

                      return (
                        <div 
                          key={member.userId} 
                          className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                            isSelf 
                              ? 'border-indigo-600 bg-indigo-600/5' 
                              : 'border-zinc-900 bg-zinc-950/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 font-black text-xs text-zinc-500">#{mIdx + 1}</span>
                            <div className="h-6 w-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-white uppercase font-black shrink-0">
                              {member.username.substring(0, 2)}
                            </div>
                            <span className={`font-bold ${isSelf ? 'text-indigo-400' : 'text-white'}`}>{member.username}</span>
                          </div>

                          <div className="flex items-center gap-6 font-semibold">
                            <div className="text-right">
                              <span className="text-[9px] text-zinc-500 block uppercase">Consistency</span>
                              <strong className="text-white font-mono">{member.readinessScore}%</strong>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-zinc-500 block uppercase">Logged/Wk</span>
                              <strong className="text-indigo-400 font-mono">{member.weeklyHours}h</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Right panel: Controls to create and join workspace groups */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Join box */}
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
          <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2">Join Circle</h3>
          <p className="text-[11px] text-zinc-400 leading-normal mb-4">
            Enter the invite code from your classmates to map your success analytics to their study circle.
          </p>
          <form onSubmit={handleJoinGroup} className="space-y-3">
            <input 
              type="text" 
              required
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value)}
              placeholder="e.g. ATOD4F"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none uppercase font-mono font-bold tracking-widest text-center"
            />
            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-lg transition-all"
            >
              Verify & Connect Link
            </button>
          </form>
        </div>

        {/* Create box */}
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
          <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Launch Study Circle</h3>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Circle Name</label>
              <input 
                type="text" 
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Med School Prep Elite"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Privacy Status</label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                {(['Public', 'Private'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPrivacy(mode)}
                    className={`p-2.5 text-[10px] font-bold border rounded-lg uppercase tracking-wider text-center transition-all ${
                      privacy === mode 
                        ? 'bg-zinc-100 text-zinc-950 border-white' 
                        : 'border-zinc-850 bg-zinc-950/40 text-zinc-500 hover:text-white'
                    }`}
                  >
                    {mode} Group
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs py-2.5 rounded-lg transition-all"
            >
              Initialize Study Cohort
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
