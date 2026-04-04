ALTER TABLE public.deposit_requests ADD COLUMN payment_method text NOT NULL DEFAULT 'usdt_trc20';
ALTER TABLE public.deposit_requests ADD COLUMN currency text NOT NULL DEFAULT 'USD';