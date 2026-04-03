import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Star, Brain } from 'lucide-react';
import { toast } from 'sonner';
import {
  useLLMModels,
  useCreateLLMModel,
  useUpdateLLMModel,
  useDeleteLLMModel,
  useSetDefaultModel,
  type LLMModel,
} from '@/admin/hooks/useLLMModels';

const emptyForm = {
  model_name: '',
  display_name: '',
  provider: 'OpenAI',
  provider_type: 'openai_compatible' as string,
  base_url: 'https://ai.gateway.lovable.dev/v1',
  api_key: '',
  input_price: 1,
  output_price: 2,
  context_window: 128000,
  enabled: true,
  is_default: false,
  sort_order: 0,
  tags: [] as string[],
};

export default function LLMConfig() {
  const { data: models = [], isLoading } = useLLMModels();
  const createModel = useCreateLLMModel();
  const updateModel = useUpdateLLMModel();
  const deleteModel = useDeleteLLMModel();
  const setDefault = useSetDefaultModel();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [tagsInput, setTagsInput] = useState('');

  const isOpenClaw = form.provider_type === 'openclaw';

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setTagsInput('');
    setDialogOpen(true);
  };

  const openEdit = (m: LLMModel) => {
    setEditingId(m.id);
    setForm({
      model_name: m.model_name,
      display_name: m.display_name,
      provider: m.provider,
      provider_type: m.provider_type || 'openai_compatible',
      base_url: m.base_url,
      api_key: m.api_key || '',
      input_price: m.input_price,
      output_price: m.output_price,
      context_window: m.context_window,
      enabled: m.enabled,
      is_default: m.is_default,
      sort_order: m.sort_order,
      tags: m.tags || [],
    });
    setTagsInput((m.tags || []).join(', '));
    setDialogOpen(true);
  };

  const handleProviderTypeChange = (v: string) => {
    if (v === 'openclaw') {
      setForm(f => ({
        ...f,
        provider_type: 'openclaw',
        provider: 'OpenClaw',
        model_name: 'openclaw',
        base_url: f.base_url === 'https://ai.gateway.lovable.dev/v1' ? '' : f.base_url,
      }));
    } else {
      setForm(f => ({
        ...f,
        provider_type: 'openai_compatible',
        provider: f.provider === 'OpenClaw' ? 'OpenAI' : f.provider,
        model_name: f.model_name === 'openclaw' ? '' : f.model_name,
        base_url: f.base_url || 'https://ai.gateway.lovable.dev/v1',
      }));
    }
  };

  const handleSave = async () => {
    if (!form.display_name) {
      toast.error('请填写展示名称');
      return;
    }
    if (!isOpenClaw && !form.model_name) {
      toast.error('请填写模型标识');
      return;
    }
    const tags = tagsInput.split(/[,，]/).map(t => t.trim()).filter(Boolean);
    const payload = {
      ...form,
      tags,
      api_key: form.api_key || null,
      model_name: isOpenClaw ? (form.model_name || 'openclaw') : form.model_name,
    };

    try {
      if (editingId) {
        await updateModel.mutateAsync({ id: editingId, ...payload });
        toast.success('模型已更新');
      } else {
        await createModel.mutateAsync(payload);
        toast.success('模型已创建');
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该模型？')) return;
    try {
      await deleteModel.mutateAsync(id);
      toast.success('已删除');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefault.mutateAsync(id);
      toast.success('已设为默认');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">LLM 模型配置</h1>
          <p className="text-neutral-400 text-sm mt-1">管理大语言模型接入配置</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> 添加模型
        </Button>
      </div>

      <div className="border border-neutral-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead className="text-neutral-400">模型</TableHead>
              <TableHead className="text-neutral-400">类型</TableHead>
              <TableHead className="text-neutral-400">供应商</TableHead>
              <TableHead className="text-neutral-400">Base URL</TableHead>
              <TableHead className="text-neutral-400">输入单价</TableHead>
              <TableHead className="text-neutral-400">输出单价</TableHead>
              <TableHead className="text-neutral-400">标签</TableHead>
              <TableHead className="text-neutral-400">状态</TableHead>
              <TableHead className="text-neutral-400 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={9} className="text-center text-neutral-500 py-10">加载中...</TableCell></TableRow>
            ) : models.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-neutral-500 py-10">暂无模型</TableCell></TableRow>
            ) : models.map(m => (
              <TableRow key={m.id} className="border-neutral-800">
                <TableCell>
                  <div>
                    <div className="text-white font-medium flex items-center gap-2">
                      {m.display_name}
                      {m.is_default && <Badge variant="outline" className="text-green-400 border-green-600 text-xs">默认</Badge>}
                    </div>
                    <div className="text-neutral-500 text-xs">{m.model_name}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {m.provider_type === 'openclaw' ? (
                    <Badge variant="outline" className="text-purple-400 border-purple-600 text-xs gap-1">
                      <Brain className="h-3 w-3" /> 记忆
                    </Badge>
                  ) : (
                    <span className="text-neutral-400 text-xs">标准</span>
                  )}
                </TableCell>
                <TableCell className="text-neutral-300">{m.provider}</TableCell>
                <TableCell className="text-neutral-400 text-xs max-w-[200px] truncate">{m.base_url}</TableCell>
                <TableCell className="text-neutral-300">{m.input_price}</TableCell>
                <TableCell className="text-neutral-300">{m.output_price}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {(m.tags || []).map(t => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={m.enabled ? 'default' : 'secondary'} className={m.enabled ? 'bg-green-600' : ''}>
                    {m.enabled ? '启用' : '停用'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {!m.is_default && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-yellow-400" onClick={() => handleSetDefault(m.id)}>
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white" onClick={() => openEdit(m)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-red-400" onClick={() => handleDelete(m.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-neutral-900 border-neutral-800 text-white">
          <DialogHeader>
            <DialogTitle>{editingId ? '编辑模型' : '添加模型'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {/* Provider type toggle */}
            <div className="space-y-2">
              <Label>接入类型</Label>
              <Select value={form.provider_type} onValueChange={handleProviderTypeChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai_compatible">OpenAI 兼容</SelectItem>
                  <SelectItem value="openclaw">OpenClaw（带记忆）</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isOpenClaw && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-sm text-purple-300">
                <div className="flex items-center gap-2 font-medium mb-1">
                  <Brain className="h-4 w-4" /> OpenClaw 记忆模式
                </div>
                OpenClaw 自带对话记忆，每个用户独立 session，无需手动管理上下文。
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {!isOpenClaw && (
                <div className="space-y-2">
                  <Label>供应商</Label>
                  <Select value={form.provider} onValueChange={v => setForm(f => ({ ...f, provider: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OpenAI">OpenAI</SelectItem>
                      <SelectItem value="Google">Google</SelectItem>
                      <SelectItem value="Anthropic">Anthropic</SelectItem>
                      <SelectItem value="DeepSeek">DeepSeek</SelectItem>
                      <SelectItem value="其他">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>排序权重</Label>
                <Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} />
              </div>
            </div>

            <div className={isOpenClaw ? '' : 'grid grid-cols-2 gap-4'}>
              {!isOpenClaw && (
                <div className="space-y-2">
                  <Label>模型标识 *</Label>
                  <Input placeholder="如 gpt-4o" value={form.model_name} onChange={e => setForm(f => ({ ...f, model_name: e.target.value }))} />
                </div>
              )}
              <div className="space-y-2">
                <Label>展示名称 *</Label>
                <Input placeholder={isOpenClaw ? "如 OpenClaw 记忆助手" : "如 GPT-4o 高速版"} value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>API Key / Bearer Token</Label>
              <Input type="password" placeholder={isOpenClaw ? "OpenClaw Bearer Token" : "留空则使用系统默认"} value={form.api_key} onChange={e => setForm(f => ({ ...f, api_key: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{isOpenClaw ? 'OpenClaw 服务地址' : 'Base URL'}</Label>
              <Input placeholder={isOpenClaw ? "如 http://your-server:18789" : "https://ai.gateway.lovable.dev/v1"} value={form.base_url} onChange={e => setForm(f => ({ ...f, base_url: e.target.value }))} />
            </div>

            {!isOpenClaw && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>输入积分单价</Label>
                  <Input type="number" value={form.input_price} onChange={e => setForm(f => ({ ...f, input_price: +e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>输出积分单价</Label>
                  <Input type="number" value={form.output_price} onChange={e => setForm(f => ({ ...f, output_price: +e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>上下文窗口</Label>
                  <Input type="number" value={form.context_window} onChange={e => setForm(f => ({ ...f, context_window: +e.target.value }))} />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>标签（逗号分隔）</Label>
              <Input placeholder="如: 默认, 记忆" value={tagsInput} onChange={e => setTagsInput(e.target.value)} />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.enabled} onCheckedChange={v => setForm(f => ({ ...f, enabled: v }))} />
                <Label>启用</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_default} onCheckedChange={v => setForm(f => ({ ...f, is_default: v }))} />
                <Label>设为默认</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={createModel.isPending || updateModel.isPending}>
              {editingId ? '保存' : '创建'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
