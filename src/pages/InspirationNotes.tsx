import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Sparkles, Mic, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteCreateModal } from '@/components/notes/NoteCreateModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { InspirationNote } from '@/data/notesData';

export default function InspirationNotes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState<InspirationNote[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [captureText, setCaptureText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadNotes();
  }, [user]);

  const loadNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { toast.error('加载笔记失败'); setLoading(false); return; }
    setNotes((data || []).map(n => ({
      id: n.id,
      title: n.title,
      content: n.content || '',
      tags: [],
      createdAt: new Date(n.created_at).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '.'),
    })));
    setLoading(false);
  };

  const filtered = notes.filter(
    n => n.title.includes(search) || n.content.includes(search) || n.tags.some(t => t.includes(search))
  );

  const handleCapture = () => {
    if (!captureText.trim()) return;
    setShowModal(true);
  };

  const handleSave = async (data: { title: string; tags: string[]; aiInsight: string; content: string }) => {
    if (!user) return;
    const { error } = await supabase.from('notes').insert({
      user_id: user.id,
      title: data.title,
      content: data.content,
      username: user.email?.replace('@user.aiyou.com', '') || '',
    });
    if (error) { toast.error('保存失败'); return; }
    setShowModal(false);
    setCaptureText('');
    loadNotes();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 to-background">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="text-lg font-semibold text-foreground">灵感笔记</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="查找灵感" className="w-56 pl-9 h-9 bg-card border-border text-sm" />
          </div>
          <Button className="rounded-full gap-2 px-5" onClick={() => setShowModal(true)}><Plus className="h-4 w-4" />新建笔记</Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 pb-10">
        <div className="bg-card rounded-xl border border-border p-4 mb-8">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-1 shrink-0" />
            <textarea value={captureText} onChange={e => setCaptureText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCapture(); } }}
              placeholder="捕捉一个想法......" className="flex-1 bg-transparent border-0 outline-none resize-none text-sm text-foreground placeholder:text-primary/60 min-h-[80px]" />
            <button className="text-muted-foreground hover:text-foreground mt-1"><Mic className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">笔记列表</h2>
            <p className="text-sm text-muted-foreground">{filtered.length} 个笔记</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {filtered.map(note => (
              <div key={note.id} className="break-inside-avoid">
                <NoteCard note={note} isSelected={selectedId === note.id} onClick={() => setSelectedId(selectedId === note.id ? null : note.id)} />
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <NoteCreateModal content={captureText} onClose={() => setShowModal(false)} onSave={handleSave} />
      )}
    </div>
  );
}
