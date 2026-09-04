yarn build
npx serve -s dist


ALTER TABLE job_applied_directurl
DROP CONSTRAINT job_applied_user_id_fkey;

ALTER TABLE job_applied_directurl
ADD CONSTRAINT job_applied_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;