import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LLMModel {
  id: string;
  model_name: string;
  display_name: string;
  provider: string;
  base_url: string;
  api_key: string | null;
  input_price: number;
  output_price: number;
  context_window: number;
  enabled: boolean;
  is_default: boolean;
  sort_order: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export function useLLMModels() {
  return useQuery({
    queryKey: ['llm_models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('llm_models' as any)
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as unknown as LLMModel[];
    },
  });
}

export function useCreateLLMModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (model: Partial<LLMModel>) => {
      const { error } = await supabase.from('llm_models' as any).insert(model as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['llm_models'] }),
  });
}

export function useUpdateLLMModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LLMModel> & { id: string }) => {
      const { error } = await supabase.from('llm_models' as any).update(updates as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['llm_models'] }),
  });
}

export function useDeleteLLMModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('llm_models' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['llm_models'] }),
  });
}

export function useSetDefaultModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Unset all defaults first
      await supabase.from('llm_models' as any).update({ is_default: false } as any).neq('id', id);
      const { error } = await supabase.from('llm_models' as any).update({ is_default: true } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['llm_models'] }),
  });
}
