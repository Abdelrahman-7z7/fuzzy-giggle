import {createClient, SupabaseClient} from '@supabase/supabase-js';
import AppError from '../utils/AppError';
import * as dotenv from 'dotenv'; 

dotenv.config({path: './.env'})

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SERVICE_ROLE_KEY_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY_SECRET;

if(!SUPABASE_URL || !SERVICE_ROLE_KEY || !SERVICE_ROLE_KEY_SECRET){
    throw new Error('Missing Supabase environment variables')
}

// (token:string) type of the paramter : SupabaseClient is the return type of the function
export const createSupabaseWithUser = (token : string):SupabaseClient => {
    return createClient(SUPABASE_URL, SERVICE_ROLE_KEY,  {
        global: {
            headers: {
        Authorization: `Bearer ${token}`,
            }
        }
    })
} 

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
export const supabaseSecret: SupabaseClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY_SECRET)

