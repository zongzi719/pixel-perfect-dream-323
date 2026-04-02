import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MeetingSidebar } from '@/components/meeting/MeetingSidebar';
import { MeetingDetail } from '@/components/meeting/MeetingDetail';
import { NewMeetingScreen } from '@/components/meeting/NewMeetingScreen';
import { RecordingScreen } from '@/components/meeting/RecordingScreen';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Meeting } from '@/data/meetingData';

type View = 'list' | 'new' | 'recording';

export default function MeetingMinutes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<View>('list');

  useEffect(() => {
    if (!user) return;
    const loadMeetings = async () => {
      const { data } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) {
        const mapped: Meeting[] = data.map(m => ({
          id: m.id,
          title: m.title,
          date: m.date,
          duration: m.duration,
          participants: m.participants,
          folder: m.folder,
          audioUrl: m.audio_url || undefined,
          audioDuration: m.audio_duration || undefined,
          transcript: (m.transcript as any[]) || [],
          aiSummary: (m.ai_summary as any) || { keyPoints: [], decisions: [], openQuestions: [], todoItems: [] },
          tags: m.tags || [],
        }));
        setMeetings(mapped);
        if (mapped.length > 0) setSelectedMeeting(mapped[0]);
      }
    };
    loadMeetings();
  }, [user]);

  const filteredMeetings = meetings.filter(m => {
    if (selectedFolder !== 'all' && selectedFolder !== 'recent' && m.folder !== selectedFolder) return false;
    if (search && !m.title.includes(search)) return false;
    return true;
  });

  if (view === 'new') {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-secondary/30 to-background">
        <header className="flex items-center px-6 py-4 border-b border-border">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-foreground hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">会议纪要</span>
          </button>
        </header>
        <NewMeetingScreen onStart={() => setView('recording')} />
      </div>
    );
  }

  if (view === 'recording') {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-secondary/30 to-background">
        <header className="flex items-center px-6 py-4">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-foreground hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">会议纪要</span>
          </button>
        </header>
        <RecordingScreen onEnd={() => setView('list')} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-secondary/30 to-background">
      <header className="flex items-center justify-between px-6 py-3 border-b border-border">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-foreground hover:text-primary">
          <ArrowLeft className="h-5 w-5" />
          <span className="font-semibold text-lg">会议纪要</span>
        </button>

        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="查找会议"
            className="pl-9 h-9 bg-secondary/50 border-0"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setView('new')} className="gap-2 rounded-full">
            <Plus className="h-4 w-4" /> 新会议
          </Button>
          <Button variant="outline" className="gap-2 rounded-full">
            <Upload className="h-4 w-4" /> 上传录音
          </Button>
          <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/30" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <MeetingSidebar selectedFolder={selectedFolder} onSelectFolder={setSelectedFolder} />

        {selectedMeeting ? (
          <MeetingDetail meeting={selectedMeeting} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            {meetings.length === 0 ? '暂无会议记录，点击"新会议"开始' : '选择一个会议查看详情'}
          </div>
        )}
      </div>
    </div>
  );
}
