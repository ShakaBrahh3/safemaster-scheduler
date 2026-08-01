import React from 'react';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  PieChart,
  Activity,
  Plus,
  Sparkles,
  Download
} from 'lucide-react';
import { formatCurrency } from '../utils';

/**
 * Dashboard component displaying key metrics and analytics
 */
export const Dashboard = ({
  schedule,
  backlog,
  crews,
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
}) => {
  
  // Calculate metrics
  const totalRevenue = schedule.reduce((sum, job) => sum + (job.cost || 0), 0);
  const totalJobs = schedule.length + backlog.length;
  const scheduledJobs = schedule.length;
  const backlogJobs = backlog.length;
  const highPriorityJobs = [...schedule, ...backlog].filter(job => job.priority === 'high').length;
  const ewpJobs = schedule.filter(job => job.ewpRequired).length;
  
  // Calculate daily revenue
  const dailyRevenue = days.map(day => {
    const dayJobs = schedule.filter(job => job.day === day);
    return {
      day,
      revenue: dayJobs.reduce((sum, job) => sum + (job.cost || 0), 0),
      jobs: dayJobs.length
    };
  });
  
  // Calculate crew performance
  const crewPerformance = crews.map(crew => {
    const crewJobs = schedule.filter(job => job.crewId === crew.id);
    return {
      crew,
      jobs: crewJobs.length,
      revenue: crewJobs.reduce((sum, job) => sum + (job.cost || 0), 0),
      utilization: crewJobs.length / 5 // Assuming 5 days per week
    };
  });
  
  // Calculate run distribution
  const runDistribution = {};
  [...schedule, ...backlog].forEach(job => {
    runDistribution[job.run] = (runDistribution[job.run] || 0) + 1;
  });
  
  // Calculate priority distribution
  const priorityDistribution = {};
  [...schedule, ...backlog].forEach(job => {
    priorityDistribution[job.priority] = (priorityDistribution[job.priority] || 0) + 1;
  });
  
  // Calculate ticket distribution
  const ticketDistribution = {};
  crews.forEach(crew => {
    crew.tickets.forEach(ticket => {
      ticketDistribution[ticket] = (ticketDistribution[ticket] || 0) + 1;
    });
  });
  
  // Get top performing crew
  const topPerformer = crewPerformance.reduce((max, current) => 
    current.revenue > max.revenue ? current : max, crewPerformance[0] || { revenue: 0 }
  );
  
  // Get most booked day
  const mostBookedDay = dailyRevenue.reduce((max, current) => 
    current.jobs > max.jobs ? current : max, dailyRevenue[0] || { jobs: 0 }
  );
  
  // Get highest priority count
  const highestPriority = Object.entries(priorityDistribution).reduce((max, [key, value]) => 
    value > max.value ? { key, value } : max, { key: '', value: 0 }
  );

  return (
    <div className="space-y-6">
      
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-slate-400 mt-1">Total Revenue</p>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {scheduledJobs} scheduled jobs
          </p>
        </div>

        {/* Total Jobs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <Calendar className="h-5 w-5 text-teal-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{totalJobs}</p>
          <p className="text-xs text-slate-400 mt-1">Total Jobs</p>
          <p className="text-xs text-teal-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {scheduledJobs} scheduled, {backlogJobs} in backlog
          </p>
        </div>

        {/* Crew Count */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Users className="h-5 w-5 text-cyan-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{crews.length}</p>
          <p className="text-xs text-slate-400 mt-1">Active Crews</p>
          <p className="text-xs text-cyan-400 mt-1 flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {crewPerformance.reduce((sum, c) => sum + c.jobs, 0)} total assignments
          </p>
        </div>

        {/* High Priority */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{highPriorityJobs}</p>
          <p className="text-xs text-slate-400 mt-1">High Priority Jobs</p>
          <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Require immediate attention
          </p>
        </div>

        {/* EWP Jobs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{ewpJobs}</p>
          <p className="text-xs text-slate-400 mt-1">EWP Required Jobs</p>
          <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Special equipment needed
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Daily Revenue Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-white">Daily Revenue</h3>
            <span className="text-xs text-slate-400">This Week</span>
          </div>
          <div className="flex items-end gap-2 h-40">
            {dailyRevenue.map(dayData => {
              const height = dayData.revenue > 0 
                ? Math.min((dayData.revenue / Math.max(...dailyRevenue.map(d => d.revenue), 1)) * 100, 100)
                : 0;
              return (
                <div key={dayData.day} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-slate-800 rounded-t" 
                    style={{ height: `${height}%` }}
                  >
                    <div className="h-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t opacity-80" />
                  </div>
                  <span className="text-xs text-slate-400">{dayData.day.slice(0, 3)}</span>
                  <span className="text-xs text-slate-500">{formatCurrency(dayData.revenue)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Crew Performance Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-white">Crew Performance</h3>
            <span className="text-xs text-slate-400">This Week</span>
          </div>
          <div className="space-y-3">
            {crewPerformance
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 5)
              .map((performance, index) => {
                const percentage = totalRevenue > 0 
                  ? (performance.revenue / totalRevenue) * 100
                  : 0;
                return (
                  <div key={performance.crew.id} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-4">{index + 1}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div 
                        className="h-2 bg-slate-800 rounded-full overflow-hidden"
                        style={{ width: '100%' }}
                      >
                        <div 
                          className="h-full bg-gradient-to-r from-teal-600 to-teal-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-slate-300 w-20 text-right">{performance.crew.name}</span>
                    <span className="text-xs text-slate-400 w-16 text-right">{performance.jobs} jobs</span>
                    <span className="text-xs text-emerald-400 w-20 text-right">{formatCurrency(performance.revenue)}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Details Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Run Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Job Types Distribution</h3>
          <div className="space-y-3">
            {Object.entries(runDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([run, count]) => {
                const percentage = (count / totalJobs) * 100;
                return (
                  <div key={run} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-20 truncate">{run}</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-teal-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-12 text-right">{count}</span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Priority Distribution</h3>
          <div className="space-y-3">
            {Object.entries(priorityDistribution)
              .sort((a, b) => {
                const order = { high: 0, warning: 1, normal: 2, low: 3 };
                return (order[a[0]] || 3) - (order[b[0]] || 3);
              })
              .map(([priority, count]) => {
                const percentage = (count / totalJobs) * 100;
                const color = priority === 'high' ? 'bg-rose-500' : 
                             priority === 'warning' ? 'bg-amber-500' : 
                             priority === 'normal' ? 'bg-emerald-500' : 'bg-slate-500';
                return (
                  <div key={priority} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-16 capitalize">{priority}</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${color} rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-12 text-right">{count}</span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Top Performer & Most Booked */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Top Performers</h3>
          <div className="space-y-4">
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Top Performing Crew</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-teal-500">{topPerformer?.crew?.name?.slice(0, 1)}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{topPerformer?.crew?.name}</p>
                  <p className="text-xs text-slate-400">{topPerformer?.jobs} jobs - {formatCurrency(topPerformer?.revenue)}</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Most Booked Day</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{mostBookedDay?.day}</p>
                  <p className="text-xs text-slate-400">{mostBookedDay?.jobs} jobs - {formatCurrency(mostBookedDay?.revenue)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700 text-left transition-all group">
            <p className="text-xs text-slate-400 mb-1">New Job</p>
            <p className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> Add Job
            </p>
          </button>
          <button className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700 text-left transition-all group">
            <p className="text-xs text-slate-400 mb-1">Optimize</p>
            <p className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> AI Route
            </p>
          </button>
          <button className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700 text-left transition-all group">
            <p className="text-xs text-slate-400 mb-1">Export</p>
            <p className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Download className="h-4 w-4" /> Schedule
            </p>
          </button>
          <button className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700 text-left transition-all group">
            <p className="text-xs text-slate-400 mb-1">Crews</p>
            <p className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Users className="h-4 w-4" /> Manage
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

// Mini Dashboard for sidebar
export const MiniDashboard = ({ schedule, backlog, crews }) => {
  const totalRevenue = schedule.reduce((sum, job) => sum + (job.cost || 0), 0);
  const scheduledJobs = schedule.length;
  const backlogJobs = backlog.length;
  
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Revenue</p>
        <p className="text-sm font-semibold text-emerald-400">{formatCurrency(totalRevenue)}</p>
      </div>
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Scheduled</p>
        <p className="text-sm font-semibold text-white">{scheduledJobs}</p>
      </div>
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Backlog</p>
        <p className="text-sm font-semibold text-yellow-500">{backlogJobs}</p>
      </div>
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Crews</p>
        <p className="text-sm font-semibold text-cyan-400">{crews.length}</p>
      </div>
    </div>
  );
};

export default Dashboard;
