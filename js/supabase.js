const SUPABASE_URL =
    "https://zfqjxpcsnrhlcwzppndr.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_SkM28mlctTGZbbHWEs9BDQ_xTHSTxFR";

const nyumbaniSupabase =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

window.nyumbaniSupabase =
    nyumbaniSupabase;

console.log(
    "Nyumbani Supabase connected successfully."
);