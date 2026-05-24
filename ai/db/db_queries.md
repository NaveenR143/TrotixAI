SELECT * FROM public.jobseeker_profiles;

select * from education;

select * from projects;

select * from work_experiences;

select * from resumes;

select * from users;

delete from education;
delete from projects;
delete from resumes;
delete from jobseeker_profiles;
delete from work_experiences;

# Delete reference data also 
ALTER TABLE career_advice
drop constraint career_advice_user_id_fkey;

ALTER TABLE career_advice
ADD CONSTRAINT career_advice_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;
