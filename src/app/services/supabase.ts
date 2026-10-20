import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabaseUrl = 'https://mumokssahdwryyxdauoz.supabase.co';
  private supabasePublishableKey = 'sb_publishable_ttsUVS9LXgnmnpu9cLLNTw_cTkFQPtb';

  public client: SupabaseClient;

  constructor() {
    this.client = createClient(this.supabaseUrl, this.supabasePublishableKey);
  }
}