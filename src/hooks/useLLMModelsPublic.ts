import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LLMModelPublic {
  id: string;
  model_name: string;
  display_name: string;
  provider: string;
  provider_type: string;
  tags: string[];
  is_default: boolean;
}

export function useLLMModelsPublic() {
  return useQuery({
    queryKey: ['llm_models_public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('llm_models' as any)
        .select('id, model_name, display_name, provider, tags, is_default')
        .eq('enabled', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as unknown as LLMModelPublic[];
    },
  });
}
