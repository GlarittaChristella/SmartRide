import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://oliokarfzfogpxhydbat.supabase.co";

// 👇 USE THIS KEY ONLY
const supabaseKey = "sb_publishable_MWcsb9Fx47f4CBMcK_5obw_Eqyzs97a";

export const supabase = createClient(supabaseUrl, supabaseKey);