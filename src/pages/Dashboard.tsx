import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Target, FileText, Calendar, CheckSquare, Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Stats {
  activeCompanies: number;
  esSubmitted: number;
  upcomingInterviews: number;
  pendingTasks: number;
}

interface Task {
  id: number;
  type: string;
  title: string;
  date: string;
  company: string;
  completed: boolean;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ activeCompanies: 0, esSubmitted: 0, upcomingInterviews: 0, pendingTasks: 0 });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats and tasks in parallel
    Promise.all([
      fetch('/api/stats').then(res => res.json()),
      fetch('/api/tasks').then(res => res.json())
    ])
    .then(([statsData, tasksData]) => {
      setStats(statsData);
      
      // Filter tasks to show only pending ones, limit to top 4.
      const pendingTasks = tasksData
        .filter((t: any) => !t.completed)
        .slice(0, 4); 
        
      setTasks(pendingTasks);
      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to fetch dashboard data:', err);
      setLoading(false);
    });
  }, []);

  const statCards = [
    { title: '選考中', value: stats.activeCompanies, icon: Target, color: 'var(--accent-primary)', path: '/companies' },
    { title: '提出済ES', value: stats.esSubmitted, icon: FileText, color: 'var(--success)', path: '/es' },
    { title: '直近の面接', value: stats.upcomingInterviews, icon: Calendar, color: 'var(--warning)', path: '/schedule' },
    { title: '今週のタスク', value: stats.pendingTasks, icon: CheckSquare, color: 'var(--danger)', path: '/schedule' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>良い一日を！ 👋</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>今日のタスクと選考状況を確認しましょう。</p>
        </div>
        <div style={{ width: '300px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input 
              type="text" 
              placeholder="企業名やESを検索..." 
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                borderRadius: '999px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'rgba(255,255,255,0.03)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-responsive-4col">
        {statCards.map((stat, i) => (
          <Card 
            key={i} 
            padding="1.5rem" 
            className="hover-card" 
            onClick={() => navigate(stat.path)} 
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>{stat.title}</p>
                {loading ? (
                  <h3 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, opacity: 0.5 }}>--</h3>
                ) : (
                  <h3 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{stat.value}</h3>
                )}
              </div>
              <div style={{ 
                width: '48px', height: '48px', 
                borderRadius: '12px', 
                backgroundColor: `${stat.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: stat.color
              }}>
                <stat.icon size={24} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid-responsive-2col">
        
        {/* Activity or Timeline */}
        <Card padding="2rem">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>直近のアクティビティ</h2>
            <Button variant="ghost" size="sm">すべて表示</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', opacity: 0.7 }}>
            {/* Dummy timeline for visual flavor since we don't track events yet */}
            {[1,2,3].map(i => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', marginTop: '6px' }} />
                <div>
                  <p style={{ fontWeight: 500, margin: '0 0 0.25rem 0' }}>Google Japan株式会社</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>1次面接の案内を受信しました (昨日)</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Tasks */}
        <Card padding="2rem">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>直近の予定・タスク</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <p style={{ color: 'var(--text-muted)' }}>読み込み中...</p>
            ) : tasks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>直近の予定はありません</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <h4 style={{ fontWeight: 500, margin: '0 0 0.25rem 0' }}>{task.title}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>{task.company}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 600, color: task.type === '面接' ? 'var(--accent-primary)' : 'var(--danger)', margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>{task.date}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{task.type}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Button variant="secondary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => navigate('/schedule')}>
            スケジュールを見る <ChevronRight size={16} />
          </Button>
        </Card>

      </div>

    </div>
  );
};

export default Dashboard;
