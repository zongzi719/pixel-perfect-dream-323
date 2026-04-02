import { useState } from "react";
import { mockNotes } from "@/admin/data/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Flag, Trash2 } from "lucide-react";

export default function NotesManage() {
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState(mockNotes);

  const filtered = notes.filter(n => n.username.includes(search) || n.title.includes(search));

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input placeholder="搜索用户名/笔记标题" value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户</TableHead>
              <TableHead>标题</TableHead>
              <TableHead>内容预览</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(note => (
              <TableRow key={note.id}>
                <TableCell className="font-medium">{note.username}</TableCell>
                <TableCell>{note.title}</TableCell>
                <TableCell className="max-w-48 truncate">{note.content}</TableCell>
                <TableCell>
                  <Badge variant={note.status === 'normal' ? 'outline' : note.status === 'flagged' ? 'destructive' : 'secondary'}>
                    {note.status === 'normal' ? '正常' : note.status === 'flagged' ? '违规' : '已删除'}
                  </Badge>
                </TableCell>
                <TableCell>{note.updatedAt}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"><Flag className="h-3 w-3" /></Button>
                    <Button size="sm" variant="outline" className="text-red-600"><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
