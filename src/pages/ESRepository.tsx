import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Search, Plus, FileText, Copy, ChevronDown, Check, Trash2, Edit2, Building2 } from 'lucide-react';

interface ES {
  id: number;
  company_id: number | null;
  company_name?: string;
  company_sector?: string;
  title: string;
  category: string;
  words: number;
  content: string;
}

interface Company {
  id: number;
  name: string;
  sector: string;
}

const ESRepository: React.FC = () => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<ES[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{ company_id: number | '', title: string, category: string, words: number, content: string }>({ 
    company_id: '', title: '', category: '共通', words: 0, content: '' 
  });
  
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = () => {
    Promise.all([
      fetch('/api/es').then(res => res.json()),
      fetch('/api/companies').then(res => res.json())
    ]).then(([esData, compData]) => {
      setQuestions(esData);
      setCompanies(compData);
    }).catch(err => console.error('Failed to fetch data:', err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopy = (id: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ company_id: '', title: '', category: '共通', words: 0, content: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (es: ES) => {
    setEditingId(es.id);
    setFormData({
      company_id: es.company_id || '',
      title: es.title,
      category: es.category,
      words: es.words,
      content: es.content
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, company_id: formData.company_id === '' ? null : formData.company_id };
    
    try {
      if (editingId) {
        await fetch(`/api/es/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/es', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ company_id: '', title: '', category: '共通', words: 0, content: '' });
      fetchData();
    } catch (err) {
      console.error('Failed to save ES:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      await fetch(`/api/es/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Failed to delete ES:', err);
    }
  };

  // Extract unique sectors from the ES entries' associated companies
  const availableSectors = Array.from(new Set(questions.map(q => q.company_sector).filter(Boolean))) as string[];

  // Filter logic
  const filteredQuestions = questions.filter(q => {
    const matchesSector = activeSector ? q.company_sector === activeSector : true;
    const matchesSearch = searchQuery === '' || 
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.company_name && q.company_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSector && matchesSearch;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>ES管理</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>エントリーシートの回答を企業・業界ごとに保存・再利用します。</p>
        </div>
        <Button variant="primary" onClick={openAddModal}>
          <Plus size={18} /> 新規登録
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '600px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
          <input 
            type="text" 
            placeholder="質問、企業名、キーワードで検索..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
        </div>
      </div>

      {availableSectors.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveSector(null)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '999px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              border: activeSector === null ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
              backgroundColor: activeSector === null ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              color: activeSector === null ? 'var(--accent-primary)' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            すべて
          </button>
          {availableSectors.map(sector => (
            <button
              key={sector}
              onClick={() => setActiveSector(sector)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                border: activeSector === sector ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                backgroundColor: activeSector === sector ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: activeSector === sector ? 'var(--accent-primary)' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              {sector}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {filteredQuestions.length === 0 ? (
           <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
             ESが見つかりません。
           </div>
        ) : (
          filteredQuestions.map(q => (
            <Card key={q.id} className="es-card hover-card" padding="1.5rem">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '10px', 
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' 
                  }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{q.title}</h3>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)', alignItems: 'center' }}>
                      {q.company_name ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                          <Building2 size={14} style={{ color: 'var(--accent-primary)' }} />
                          {q.company_name}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                           <FileText size={14} /> 共通
                        </div>
                      )}
                      
                      {q.company_sector && (
                        <>
                          <span>•</span>
                          <span style={{ 
                            padding: '0.1rem 0.5rem', 
                            borderRadius: '4px', 
                            backgroundColor: 'rgba(255,255,255,0.05)', 
                            border: '1px solid var(--border-color)' 
                          }}>
                            {q.company_sector}
                          </span>
                        </>
                      )}
                      
                      <span>•</span>
                      <span>{q.category}</span>
                      <span>•</span>
                      <span>約{q.words}字</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleCopy(q.id, q.content)}
                    style={{ color: copiedId === q.id ? 'var(--success)' : 'var(--text-secondary)' }}
                  >
                    {copiedId === q.id ? <><Check size={16} /> コピー完了</> : <><Copy size={16} /> コピー</>}
                  </Button>
                  <button 
                    onClick={() => openEditModal(q)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem', opacity: 0.6 }}
                    title="編集"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(q.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem', opacity: 0.6 }}
                    title="削除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div style={{ 
                backgroundColor: 'rgba(0,0,0,0.2)', 
                padding: '1rem', 
                borderRadius: '8px', 
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                border: '1px solid var(--border-color)',
                position: 'relative'
              }}>
                {q.content}
                <div style={{ 
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '30px', 
                  background: 'linear-gradient(transparent, rgba(15, 23, 42, 0.9))',
                  borderRadius: '0 0 8px 8px'
                }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                <Button variant="ghost" size="sm" style={{ color: 'var(--accent-primary)' }}>
                  展開 <ChevronDown size={16} />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Save ES Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "ES回答を編集" : "ES回答を登録"}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>対象企業</label>
            <select 
              value={formData.company_id} 
              onChange={e => setFormData({...formData, company_id: e.target.value === '' ? '' : parseInt(e.target.value)})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
            >
              <option value="">共通 (特定の企業なし)</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.sector})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>設問 / タイトル</label>
            <input 
              required
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              placeholder="例: 学生時代に最も打ち込んだこと"
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>カテゴリー</label>
              <input 
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                placeholder="例: ガクチカ, 志望動機"
              />
            </div>
            <div style={{ width: '120px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>文字数</label>
              <input 
                type="number"
                value={formData.words} onChange={e => setFormData({...formData, words: parseInt(e.target.value) || 0})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>回答内容</label>
            <textarea 
              required
              rows={8}
              value={formData.content} 
              onChange={e => {
                const text = e.target.value;
                setFormData({...formData, content: text, words: text.length});
              }}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', resize: 'vertical' }}
              placeholder="回答の本文を入力..."
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

export default ESRepository;
