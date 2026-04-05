INSERT INTO storage.buckets (id, name, public) VALUES ('icons', 'icons', true);

CREATE POLICY "Admins can upload icons" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'icons' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update icons" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'icons' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read icons" ON storage.objects FOR SELECT TO public USING (bucket_id = 'icons');