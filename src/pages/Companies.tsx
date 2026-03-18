import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Search, Plus, MapPin, Building, ChevronRight, Trash2, Edit2 } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  sector: string;
  location: string;
  status: string;
}

const getStatusColor = (status: string) => {
  if (status.includes('面接')) return 'var(--accent-primary)';
  if (status.includes('提出')) return 'var(--warning)';
  if (status.includes('ブックマーク')) return 'var(--text-muted)';
  return 'var(--success)';
};

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', sector: '', location: '', status: 'ブックマーク' });

  const fetchCompanies = () => {
    fetch('/api/companies')
      .then(res => res.json())
      .then(data => setCompanies(data))
      .catch(err => console.error('Failed to fetch companies:', err));
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', sector: '', location: '', status: 'ブックマーク' });
    setIsModalOpen(true);
  };

  const openEditModal = (company: Company) => {
    setEditingId(company.id);
    setFormData({
      name: company.name,
      sector: company.sector,
      location: company.location,
      status: company.status
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update existing (PUT)
        await fetch(`/api/companies/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        // Create new (POST)
        await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', sector: '', location: '', status: 'ブックマーク' });
      fetchCompanies();
    } catch (err) {
      console.error('Failed to save company:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      await fetch(`/api/companies/${id}`, { method: 'DELETE' });
      fetchCompanies();
    } catch (err) {
      console.error('Failed to delete company:', err);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>企業管理</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>選考状況と候補企業を管理します。</p>
        </div>
        <Button variant="primary" onClick={openAddModal}>
          <Plus size={18} /> 企業を追加
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '500px' }}>
        <Input icon={Search} placeholder="企業を検索..." />
        <Button variant="secondary"><Building size={18} /> 絞り込み</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {companies.map(company => (
          <Card key={company.id} className="company-card hover-card" padding="1.5rem">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>{company.name}</h3>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{company.sector}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  padding: '0.3rem 0.6rem', 
                  borderRadius: '999px', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  color: '#fff',
                  backgroundColor: getStatusColor(company.status)
                }}>
                  {company.status}
                </div>
                <button 
                  onClick={() => openEditModal(company)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem', opacity: 0.6 }}
                  title="編集"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(company.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem', opacity: 0.6 }}
                  title="削除"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <MapPin size={14} /> {company.location}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <Button variant="ghost" size="sm" onClick={() => openEditModal(company)}>
                詳細・編集 <ChevronRight size={16} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Save Company Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "企業を編集" : "企業を追加"}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>企業名</label>
            <input 
              required
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              placeholder="例: Google Japan"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>業界・セクター</label>
            <input 
              value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              placeholder="例: IT / Web"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>所在地</label>
            <input 
              value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              placeholder="例: 東京"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>選考ステータス</label>
            <select 
              value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
            >
              <option value="ブックマーク">ブックマーク</option>
              <option value="ES提出済">ES提出済</option>
              <option value="Webテスト">Webテスト</option>
              <option value="1次面接">1次面接</option>
              <option value="最終面接">最終面接</option>
              <option value="内定">内定</option>
            </select>
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

export default Companies;
