// supabase/functions/admin-colleges
//
// POST body: { action: 'list' | 'get' | 'create' | 'update', ... }
//
// - list: no params -> all colleges + their live signup counts
// - get: { collegeId }
// - create: { name, shortName, slug, theme?, launchDate?, campaignStatus?,
//             earlyBirdLimit?, logoUrl?, heroImageUrl?, signupRewardNote?,
//             referralRewardNote?, socialLinks? }
// - update: { collegeId, ...same fields as create, all optional }
//
// This is the "onboard a new college by creating a DB row" step from the
// PRD's whole "Build Once. Configure Per College." pitch -- no code
// changes needed to add VNR, CBIT, etc. once this exists.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { requireAdmin } from '../_shared/adminAuth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );

  const { user, error: authError, status: authStatus } = await requireAdmin(req, supabase);
  if (!user) return jsonResponse({ error: authError }, authStatus);

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'list') {
      const { data: colleges, error } = await supabase
        .from('colleges')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return jsonResponse({ error: error.message }, 500);

      const { data: stats } = await supabase.from('college_public_stats').select('*');
      const statsByCollege = new Map((stats || []).map(s => [s.college_id, s.current_signup_count]));

      return jsonResponse({
        colleges: colleges.map(c => ({ ...c, current_signup_count: statsByCollege.get(c.id) || 0 })),
      });
    }

    if (action === 'get') {
      const { collegeId } = body;
      if (!collegeId) return jsonResponse({ error: 'collegeId is required' }, 400);
      const { data, error } = await supabase.from('colleges').select('*').eq('id', collegeId).maybeSingle();
      if (error) return jsonResponse({ error: error.message }, 500);
      if (!data) return jsonResponse({ error: 'Not found' }, 404);
      return jsonResponse({ college: data });
    }

    if (action === 'create') {
      const { name, shortName, slug, theme, launchDate, campaignStatus, earlyBirdLimit, logoUrl, heroImageUrl, signupRewardNote, referralRewardNote, socialLinks } = body;
      if (!name || !shortName || !slug) {
        return jsonResponse({ error: 'name, shortName, and slug are required' }, 400);
      }
      const { data, error } = await supabase
        .from('colleges')
        .insert({
          name, short_name: shortName, slug: slug.toLowerCase().trim(),
          theme: theme || {}, launch_date: launchDate || null,
          campaign_status: campaignStatus || 'draft',
          early_bird_limit: earlyBirdLimit ?? 500,
          logo_url: logoUrl || null, hero_image_url: heroImageUrl || null,
          signup_reward_note: signupRewardNote || null, referral_reward_note: referralRewardNote || null,
          social_links: socialLinks || {},
        })
        .select('*')
        .single();
      if (error) {
        if (error.code === '23505') return jsonResponse({ error: `Slug "${slug}" is already in use` }, 409);
        return jsonResponse({ error: error.message }, 500);
      }
      return jsonResponse({ college: data });
    }

    if (action === 'update') {
      const { collegeId, ...fields } = body;
      if (!collegeId) return jsonResponse({ error: 'collegeId is required' }, 400);

      const patch = {};
      if (fields.name !== undefined) patch.name = fields.name;
      if (fields.shortName !== undefined) patch.short_name = fields.shortName;
      if (fields.slug !== undefined) patch.slug = fields.slug.toLowerCase().trim();
      if (fields.theme !== undefined) patch.theme = fields.theme;
      if (fields.launchDate !== undefined) patch.launch_date = fields.launchDate;
      if (fields.campaignStatus !== undefined) patch.campaign_status = fields.campaignStatus;
      if (fields.earlyBirdLimit !== undefined) patch.early_bird_limit = fields.earlyBirdLimit;
      if (fields.logoUrl !== undefined) patch.logo_url = fields.logoUrl;
      if (fields.heroImageUrl !== undefined) patch.hero_image_url = fields.heroImageUrl;
      if (fields.signupRewardNote !== undefined) patch.signup_reward_note = fields.signupRewardNote;
      if (fields.referralRewardNote !== undefined) patch.referral_reward_note = fields.referralRewardNote;
      if (fields.socialLinks !== undefined) patch.social_links = fields.socialLinks;

      const { data, error } = await supabase.from('colleges').update(patch).eq('id', collegeId).select('*').single();
      if (error) {
        if (error.code === '23505') return jsonResponse({ error: 'That slug is already in use' }, 409);
        return jsonResponse({ error: error.message }, 500);
      }
      return jsonResponse({ college: data });
    }

    return jsonResponse({ error: `Unknown action "${action}"` }, 400);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
