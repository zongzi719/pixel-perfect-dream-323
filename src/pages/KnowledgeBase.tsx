import { useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KnowledgeSidebar } from '@/components/knowledge/KnowledgeSidebar';
import { UploadZone } from '@/components/knowledge/UploadZone';
import { FileList } from '@/components/knowledge/FileList';
import { FolderDropdown } from '@/components/knowledge/FolderDropdown';
import { defaultFolders, mockFiles, type KnowledgeFolder } from '@/data/knowledgeFiles';

export default function KnowledgeBase() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<KnowledgeFolder[]>(defaultFolders);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [uploadFolder, setUploadFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = mockFiles.filter(f => {
    if (selectedFolder !== 'all' && selectedFolder !== 'recent' && f.folderId !== selectedFolder) return false;
    if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleAddFolder = (name: string) => {
    const newFolder: KnowledgeFolder = {
      id: `folder-${Date.now()}`,
      name,
      count: 0,
    };
    setFolders(prev => [...prev, newFolder]);
  };

  const handleRenameFolder = (id: string, name: string) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f));
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-secondary/30 to-background">
      {/* Left sidebar */}
      <div className="border-r border-border bg-card/50 pl-4">
        <KnowledgeSidebar
          folders={folders}
          selectedFolder={selectedFolder}
          onSelectFolder={setSelectedFolder}
          onAddFolder={handleAddFolder}
          onRenameFolder={handleRenameFolder}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-6 py-4 border-b border-border/50">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-base font-semibold text-foreground">知识库</h1>
          <div className="flex-1" />
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="查找文件"
              className="h-9 pl-8 text-sm bg-secondary/50 border-0"
            />
          </div>
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
            M
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Folder dropdown */}
            <FolderDropdown
              folders={folders}
              selectedFolder={uploadFolder}
              onSelect={setUploadFolder}
            />

            {/* Upload zone */}
            <UploadZone />

            {/* File list */}
            <FileList files={filteredFiles} />
          </div>
        </div>
      </div>
    </div>
  );
}
