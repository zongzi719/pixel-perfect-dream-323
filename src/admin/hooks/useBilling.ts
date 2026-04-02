import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type TokenPrice = Tables<"token_prices">;
type Plan = Tables<"plans">;
type Order = Tables<"orders">;
type UsageRecord = Tables<"usage_records">;

export function useTokenPrices() {
  return useQuery({
    queryKey: ["admin-token-prices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("token_prices").select("*").order("created_at");
      if (error) throw error;
      return data as TokenPrice[];
    },
  });
}

export function useUpdateTokenPrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input_price, output_price }: { id: string; input_price: number; output_price: number }) => {
      const { error } = await supabase.from("token_prices").update({ input_price, output_price }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-token-prices"] }),
  });
}

export function useCreateTokenPrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (price: TablesInsert<"token_prices">) => {
      const { error } = await supabase.from("token_prices").insert(price);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-token-prices"] }),
  });
}

export function usePlans() {
  return useQuery({
    queryKey: ["admin-plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("*").order("created_at");
      if (error) throw error;
      return data as Plan[];
    },
  });
}

export function useTogglePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === "active" ? "inactive" : "active";
      const { error } = await supabase.from("plans").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-plans"] }),
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (plan: TablesInsert<"plans">) => {
      const { error } = await supabase.from("plans").insert(plan);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-plans"] }),
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (order: TablesInsert<"orders">) => {
      const { error } = await supabase.from("orders").insert(order);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }),
  });
}

export function useUsageRecords() {
  return useQuery({
    queryKey: ["admin-usage-records"],
    queryFn: async () => {
      const { data, error } = await supabase.from("usage_records").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as UsageRecord[];
    },
  });
}

export function useCreateUsageRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: TablesInsert<"usage_records">) => {
      const { error } = await supabase.from("usage_records").insert(record);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-usage-records"] }),
  });
}

export function useUserUsageRecords(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin-usage-records", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("usage_records").select("*").eq("user_id", userId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data as UsageRecord[];
    },
    enabled: !!userId,
  });
}
