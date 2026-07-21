-- Track whether an issued coupon code has been added to the mobile app
-- so students can redeem it at checkout. Admin marks this via the
-- coupon ledger's "Update" button after manually adding the code.
alter table coupons
  add column app_synced boolean not null default false,
  add column app_synced_at timestamptz;

create index idx_coupons_unsynced on coupons (college_id) where app_synced = false;
