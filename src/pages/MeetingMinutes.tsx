import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MeetingSidebar } from '@/components/meeting/MeetingSidebar';
import { MeetingDetail } from '@/components/meeting/MeetingDetail';
import { NewMeetingScreen } from '@/components/meeting/NewMeetingScreen';
import { RecordingScreen } from '@/components/meeting/RecordingScreen';
import { mockMeetings } from '@/data/meetingData';
import { cn } from '@/lib/utils';

type View = 'list' | 'new' | 'recording';

export default function MeetingMinutes() {
  const navigate = useNavigate();
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [selectedMeeting, setSelectedMeeting] = useState(mockMeetings[0]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<View>('list');

  const filteredMeetings = mockMeetings.filter(m => {
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
      {/* Top bar */}
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
        
        {/* Meeting list + detail */}
        {selectedMeeting ? (
          <MeetingDetail meeting={selectedMeeting} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            选择一个会议查看详情
          </div>
        )}
      </div>
    </div>
  );
}
