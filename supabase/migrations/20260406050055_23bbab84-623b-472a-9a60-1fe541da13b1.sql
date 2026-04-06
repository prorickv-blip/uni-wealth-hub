
-- Allow admin to delete chat messages
CREATE POLICY "Admins can delete messages"
ON public.chat_messages
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reward_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(referred_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all referrals"
ON public.referrals FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own referrals"
ON public.referrals FOR SELECT TO authenticated
USING (auth.uid() = referrer_id);

CREATE POLICY "Anyone authenticated can insert referrals"
ON public.referrals FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can update referrals"
ON public.referrals FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add referred_by to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by text DEFAULT NULL;

-- Create update-images bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('update-images', 'update-images', true);

CREATE POLICY "Admin upload update images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'update-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public read update images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'update-images');
