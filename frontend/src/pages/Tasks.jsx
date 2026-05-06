import { useEffect, useState } from 'react';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Plus, CheckCircle2, Circle, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]); // Placeholder for user selection
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    project: '',
    assignee: '',
    priority: 'Medium',
    dueDate: ''
  });
  const { user } = useAuth();

  const fetchTasks = async () => {
    try {
      const { data } = await API.get('/tasks');
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (user?.role === 'Admin') {
      fetchProjects();
      fetchUsers();
    }
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // For simplicity, using current user as assignee if not specified
      const taskData = { ...newTask, assignee: newTask.assignee || user._id };
      await API.post('/tasks', taskData);
      setShowModal(false);
      setNewTask({ title: '', description: '', project: '', assignee: '', priority: 'Medium', dueDate: '' });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/tasks/${id}/status`, { status });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done': return <CheckCircle2 size={18} color="var(--success)" />;
      case 'In Progress': return <PlayCircle size={18} color="#a855f7" />;
      default: return <Circle size={18} color="var(--text-secondary)" />;
    }
  };

  return (
    <div className="tasks-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Tasks</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track and manage your daily work</p>
        </div>
        {user?.role === 'Admin' && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={20} />
            New Task
          </button>
        )}
      </header>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <tr>
              <th style={{ padding: '1.2rem' }}>Status</th>
              <th>Task Title</th>
              <th>Project</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th style={{ paddingRight: '1.2rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task._id} style={{ borderBottom: '1px solid var(--glass-border)', fontSize: '0.9rem' }}>
                <td style={{ padding: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getStatusIcon(task.status)}
                    <span style={{ 
                      fontSize: '0.75rem', 
                      background: task.status === 'Done' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                      color: task.status === 'Done' ? 'var(--success)' : 'var(--text-secondary)',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {task.status}
                    </span>
                  </div>
                </td>
                <td style={{ fontWeight: '600' }}>{task.title}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{task.project?.name || 'N/A'}</td>
                <td>
                  <span style={{ 
                    color: task.priority === 'High' ? 'var(--danger)' : task.priority === 'Medium' ? 'var(--warning)' : 'var(--success)'
                  }}>
                    ● {task.priority}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                </td>
                <td style={{ paddingRight: '1.2rem' }}>
                  <select 
                    value={task.status}
                    onChange={(e) => updateStatus(task._id, e.target.value)}
                    style={{ padding: '4px 8px', width: 'auto', fontSize: '0.8rem' }}
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card" 
            style={{ padding: '2rem', width: '100%', maxWidth: '500px', background: '#1e293b' }}
          >
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Task</h2>
            <form onSubmit={handleCreate}>
              <div className="input-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label>Project</label>
                <select 
                  value={newTask.project}
                  onChange={(e) => setNewTask({...newTask, project: e.target.value})}
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Assign to Member</label>
                <select 
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                  required
                >
                  <option value="">Select Member</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea 
                  rows="3"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  required
                ></textarea>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Priority</label>
                  <select 
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Task</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
