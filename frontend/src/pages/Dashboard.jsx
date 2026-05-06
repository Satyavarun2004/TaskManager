import { useEffect, useState } from 'react';
import API from '../api/api';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await API.get('/tasks');
        
        // Calculate Stats
        const counts = data.reduce((acc, task) => {
          acc.total++;
          if (task.status === 'Todo') acc.todo++;
          if (task.status === 'In Progress') acc.inProgress++;
          if (task.status === 'Done') acc.done++;
          return acc;
        }, { total: 0, todo: 0, inProgress: 0, done: 0 });
        setStats(counts);

        // Process Recent Activity (Last 5 created tasks)
        const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentTasks(sorted.slice(0, 5));

        // Process Upcoming Deadlines (Tasks with due dates, not done, sorted by date)
        const upcoming = data
          .filter(t => t.dueDate && t.status !== 'Done')
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        setUpcomingTasks(upcoming.slice(0, 5));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { title: 'Total Tasks', value: stats.total, icon: TrendingUp, color: 'var(--accent-color)' },
    { title: 'Pending', value: stats.todo, icon: Clock, color: 'var(--warning)' },
    { title: 'In Progress', value: stats.inProgress, icon: AlertCircle, color: '#a855f7' },
    { title: 'Completed', value: stats.done, icon: CheckCircle2, color: 'var(--success)' },
  ];

  if (loading) return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;

  return (
    <div className="dashboard-page">
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome back! Here's what's happening today.</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card"
              style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
            >
              <div style={{ 
                background: `${stat.color}20`, 
                padding: '12px', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon color={stat.color} size={28} />
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>{stat.title}</p>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '700' }}>{stat.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="glass-card" style={{ padding: '2rem', minHeight: '300px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Recent Activity</h2>
          {recentTasks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentTasks.map((task) => (
                <div key={task._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-color)' }}></div>
                  <p style={{ fontSize: '0.9rem' }}>
                    New task created: <span style={{ fontWeight: '600' }}>{task.title}</span>
                  </p>
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '4rem' }}>
              <p>No recent activity found.</p>
            </div>
          )}
        </div>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Upcoming Deadlines</h2>
          {upcomingTasks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {upcomingTasks.map((task) => (
                <div key={task._id} style={{ padding: '12px', borderLeft: '3px solid var(--danger)', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '0 8px 8px 0' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '4px' }}>{task.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No upcoming deadlines. Stay on track with your goals.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
