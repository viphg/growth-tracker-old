import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = "https://zeaacxuoqxlpggyxlrbz.supabase.co";
const supabaseAnonKey = "sb_publishable_VCUJgA-bfzcTHgA0_DgRfg_XiBwIhTN";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
