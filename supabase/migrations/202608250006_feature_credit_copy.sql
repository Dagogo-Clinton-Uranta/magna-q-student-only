begin;

update public.feature_requests
set image_credit_text = replace(image_credit_text, 'Sample image by', 'Photo by')
where image_credit_text like 'Sample image by%';

commit;
