

# 生成 agents 种子数据脚本

## 实施内容

创建 `scripts/seed-data.sql`，仅包含 6 条 agents 数据的插入语句。

**具体操作：**
- 先 `DELETE FROM agents` 清空表，避免重复
- 插入线上的 6 个教练（Sarah Chen、Marcus Johnson、Yuki Tanaka、Alex Rivera、Luna Park、David Kim），包含完整的 name、name_en、avatar、perspective、tags、description、system_prompt
- 保留原始 UUID，确保一致性

**使用方式（在本地终端执行）：**
```
psql -h localhost -p 54322 -U postgres -d postgres -f scripts/seed-data.sql
```
或在本地 Supabase Studio（`http://localhost:54323`）的 SQL Editor 中粘贴执行。

## 文件清单

| 文件 | 操作 |
|------|------|
| `scripts/seed-data.sql` | 新建 |

