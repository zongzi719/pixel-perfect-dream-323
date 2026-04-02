import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type MemoryConfig = Tables<"memory_configs">;

export function useMemoryConfigs() {
  return useQuery({
    queryKey: ["admin-memory-configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memory_configs")
        .select("*")
        .order("last_updated", { ascending: false });
      if (error) throw error;
      return data as MemoryConfig[];
    },
  });
}

export function useToggleAutoExtract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, auto_extract }: { id: string; auto_extract: boolean }) => {
      const { error } = await supabase
        .from("memory_configs")
        .update({ auto_extract: !auto_extract })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-memory-configs"] }),
  });
}
