import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Calendar from '../components/ui/Calendar';
import { Calendar as CalendarIcon, Clock, CheckCircle2, Circle, Plus, Trash2, Edit2, XCircle } from 'lucide-react';

interface Task {
  id: number;
  type: string;
  title: string;
  date: string;
  company: string;
  completed: boolean;
}

const Schedule: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ type: '面接', title: '', date: '', company: '' });
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  const fetchTasks = () => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((t: any) => ({
          ...t,
          completed: !!t.completed
        }));
        setTasks(mapped);
      })
      .catch(err => console.error('Failed to fetch tasks:', err));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ type: '面接', title: '', date: '', company: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingId(task.id);
    setFormData({
      type: task.type,
      title: task.title,
      date: task.date,
      company: task.company
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const existingTask = tasks.find(t => t.id === editingId);
        await fetch(`/api/tasks/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, completed: existingTask?.completed })
        });
      } else {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, completed: false })
        });
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ type: '面接', title: '', date: '', company: '' });
      fetchTasks();
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const res = await fetch(`/api/tasks/${id}/toggle`, { method: 'PUT' });
      if (res.ok) {
        const { completed } = await res.json();
        setTasks(tasks.map(t => t.id === id ? { ...t, completed } : t));
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  // Prepare tasks for Calendar markers
  const calendarMarkers = tasks.map(t => ({
    date: t.date, // Assumes user types YYYY-MM-DD for the Calendar filter to work perfectly
    type: t.type
  }));

  const filteredTasks = selectedDateFilter 
    ? tasks.filter(t => t.date.startsWith(selectedDateFilter))
    : tasks;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>スケジュールとタスク</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>面接や締め切りを管理します。</p>
        </div>
        <Button variant="primary" onClick={openAddModal}>
          <Plus size={18} /> 新規タスク
        </Button>
      </div>

      <div className="grid-responsive-calendar">
        
        {/* Task List Section */}
        <Card padding="1.5rem">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              {selectedDateFilter ? `${selectedDateFilter} の予定` : '直近の予定'}
            </h2>
            {selectedDateFilter ? (
               <Button variant="ghost" size="sm" onClick={() => setSelectedDateFilter(null)}>
                 <XCircle size={16} /> フィルター解除
               </Button>
            ) : (
               <Button variant="ghost" size="sm">すべて表示</Button>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredTasks.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                予定がありません
              </div>
            ) : (
              filteredTasks.map(task => (
                <div key={task.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  padding: '1rem', 
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  opacity: task.completed ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}>
                  <button 
                    onClick={() => handleToggle(task.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: task.completed ? 'var(--success)' : 'var(--text-muted)' }}
                  >
                    {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>
                  
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      fontSize: '1rem', 
                      fontWeight: 500, 
                      marginBottom: '0.25rem',
                      textDecoration: task.completed ? 'line-through' : 'none'
                    }}>
                      {task.title}
                    </h4>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={14} /> {task.date}
                      </span>
                      <span>•</span>
                      <span>{task.company}</span>
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    color: task.type === '面接' ? 'var(--accent-primary)' : 
                           task.type === '締切' ? 'var(--danger)' : 'var(--text-muted)',
                    backgroundColor: task.type === '面接' ? 'rgba(59, 130, 246, 0.1)' : 
                                     task.type === '締切' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)'
                  }}>
                    {task.type}
                  </div>
                  
                  <button 
                    onClick={() => openEditModal(task)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem', opacity: 0.6 }}
                    title="編集"
                  >
                    <Edit2 size={20} />
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(task.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem', opacity: 0.6 }}
                    title="削除"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Calendar Widget Section */}
        <Card padding="1.5rem">
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <CalendarIcon size={20} className="text-accent" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>カレンダー</h2>
          </div>
          
          <Calendar 
            tasks={calendarMarkers} 
            selectedDate={selectedDateFilter}
            onDateSelect={(date) => setSelectedDateFilter(date)} 
          />
          
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} /> 面接
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--danger)' }} /> 締切
              </span>
            </div>
            <Button variant="secondary" style={{ width: '100%' }}>Googleカレンダー同期設定</Button>
          </div>
        </Card>

      </div>

      {/* Save Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "タスクを編集" : "新規タスクを追加"}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>タスク / イベント名</label>
            <input 
              required
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              placeholder="例: Google Japan 1次面接"
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>日時・期限 (YYYY-MM-DD)</label>
              <input 
                value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                placeholder="例: 2026-03-25"
              />
            </div>
            <div style={{ width: '150px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>種別</label>
              <select 
                value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              >
                <option value="面接">面接</option>
                <option value="締切">締切</option>
                <option value="タスク">タスク</option>
                <option value="説明会">説明会</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>関連企業</label>
            <input 
              value={formData.company} 
              onChange={e => setFormData({...formData, company: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              placeholder="例: Google Japan"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="ghost" onClick={(e) => { e.preventDefault(); setIsModalOpen(false); }}>キャンセル</Button>
            <Button variant="primary" type="submit">{editingId ? "更新する" : "登録する"}</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Schedule;
