# Tables 
users : verified

# view example 

 -- View: public.v_wallet_summary

-- DROP VIEW public.v_wallet_summary;

CREATE OR REPLACE VIEW public.v_wallet_summary
 AS
 SELECT w.user_id,
    u.full_name,
    u.email,
    w.balance,
    w.lifetime_earned,
    w.lifetime_spent,
    ( SELECT count(*) AS count
           FROM credit_transactions ct
          WHERE ct.wallet_id = w.id) AS transaction_count
   FROM credit_wallets w
     JOIN users u ON w.user_id = u.id;

ALTER TABLE public.v_wallet_summary
    OWNER TO postgres;

