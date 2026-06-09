-- Migration: Complementary security function hardening before production
-- Description: Secure internal trigger functions without changing RLS behavior.

-- Trigger functions do not need a caller-controlled search path.
alter function public.handle_updated_at()
    set search_path = '';

alter function public.handle_new_user()
    set search_path = '';

-- These functions are invoked by existing triggers and are not public RPC endpoints.
revoke all on function public.handle_updated_at()
    from public, anon, authenticated, service_role;

revoke all on function public.handle_new_user()
    from public, anon, authenticated, service_role;

-- The SECURITY DEFINER authorization helpers intentionally keep EXECUTE for authenticated:
-- PostgreSQL evaluates them as the caller while applying RLS policies. Revoking that privilege
-- would make protected table access fail before the policies can return a decision.
