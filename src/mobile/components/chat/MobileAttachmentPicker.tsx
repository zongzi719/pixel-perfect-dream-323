import { BookOpen, FileUp, MessageCircle, FileText, X } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const options = [
  { icon: BookOpen, label: '知识库', desc: '从知识库中选择文件' },
  { icon: FileUp, label: '本地文件', desc: '上传本地文件' },
  { icon: MessageCircle, label: '微信文件', desc: '从微信选择文件' },
  { icon: FileText, label: '腾讯文档', desc: '从腾讯文档导入' },
];

export default function MobileAttachmentPicker({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const handleSelect = (label: string) => {
    toast.info(`${label}功能即将上线`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#1a1a1a] rounded-t-3xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <h3 className="text-white text-base font-semibold">添加附件</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white/60">
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pb-8 space-y-2">
          {options.map(({ icon: Icon, label, desc }) => (
            <button
              key={label}
              onClick={() => handleSelect(label)}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-left active:bg-white/[0.08] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                <Icon size={18} className="text-amber-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{label}</p>
                <p className="text-white/35 text-xs">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
