import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://guaexbidzyhhdqtbcofv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWV4YmlkenloaGRxdGJjb2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0NjU5MjcsImV4cCI6MjA0OTA0MTkyN30.VFa_64oXnhW3x2GFM_-n4cfOeFNgm3TucsWB6-uTS7A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);