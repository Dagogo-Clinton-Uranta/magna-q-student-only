begin;

update public.feature_requests
set front_page_feature = false
where front_page_feature;

update public.feature_requests
set
  image_url = case id
    when '88e1b927-7772-42fc-bad6-73cb5a44a101' then 'https://images.pexels.com/photos/14996490/pexels-photo-14996490.jpeg?auto=compress&cs=tinysrgb&w=1600'
    when '88e1b927-7772-42fc-bad6-73cb5a44a102' then 'https://images.pexels.com/photos/12660379/pexels-photo-12660379.jpeg?auto=compress&cs=tinysrgb&w=1600'
    when '88e1b927-7772-42fc-bad6-73cb5a44a103' then 'https://images.pexels.com/photos/19963168/pexels-photo-19963168.jpeg?auto=compress&cs=tinysrgb&w=1600'
    when '88e1b927-7772-42fc-bad6-73cb5a44a104' then 'https://images.pexels.com/photos/32254662/pexels-photo-32254662.jpeg?auto=compress&cs=tinysrgb&w=1600'
    when '88e1b927-7772-42fc-bad6-73cb5a44a105' then 'https://images.pexels.com/photos/7904463/pexels-photo-7904463.jpeg?auto=compress&cs=tinysrgb&w=1600'
    when '88e1b927-7772-42fc-bad6-73cb5a44a106' then 'https://images.pexels.com/photos/5888145/pexels-photo-5888145.jpeg?auto=compress&cs=tinysrgb&w=1600'
  end,
  image_alt_text = case id
    when '88e1b927-7772-42fc-bad6-73cb5a44a101' then 'A smiling female doctor in a white coat looking directly at the camera'
    when '88e1b927-7772-42fc-bad6-73cb5a44a102' then 'A smiling male doctor with a stethoscope looking directly at the camera'
    when '88e1b927-7772-42fc-bad6-73cb5a44a103' then 'A smiling female doctor with braided hair looking directly at the camera'
    when '88e1b927-7772-42fc-bad6-73cb5a44a104' then 'A smiling male doctor in a white coat looking directly at the camera'
    when '88e1b927-7772-42fc-bad6-73cb5a44a105' then 'A smiling female doctor holding a notebook and looking directly at the camera'
    when '88e1b927-7772-42fc-bad6-73cb5a44a106' then 'A smiling male doctor in blue scrubs looking directly at the camera'
  end,
  image_credit_text = case id
    when '88e1b927-7772-42fc-bad6-73cb5a44a101' then 'Sample image by Ana Alice Azevedo on Pexels'
    when '88e1b927-7772-42fc-bad6-73cb5a44a102' then 'Sample image by Jrfotosgrand Fotografia on Pexels'
    when '88e1b927-7772-42fc-bad6-73cb5a44a103' then 'Sample image by Tessy Agbonome on Pexels'
    when '88e1b927-7772-42fc-bad6-73cb5a44a104' then 'Sample image by Daniil Kondrashin on Pexels'
    when '88e1b927-7772-42fc-bad6-73cb5a44a105' then 'Sample image by Anna Tarazevich on Pexels'
    when '88e1b927-7772-42fc-bad6-73cb5a44a106' then 'Sample image by Gustavo Fring on Pexels'
  end,
  image_credit_url = case id
    when '88e1b927-7772-42fc-bad6-73cb5a44a101' then 'https://www.pexels.com/photo/portrait-of-smiling-doctor-with-stethoscope-14996490/'
    when '88e1b927-7772-42fc-bad6-73cb5a44a102' then 'https://www.pexels.com/photo/portrait-of-a-doctor-12660379/'
    when '88e1b927-7772-42fc-bad6-73cb5a44a103' then 'https://www.pexels.com/photo/portrait-of-smiling-doctor-19963168/'
    when '88e1b927-7772-42fc-bad6-73cb5a44a104' then 'https://www.pexels.com/photo/confident-doctor-with-stethoscope-portrait-32254662/'
    when '88e1b927-7772-42fc-bad6-73cb5a44a105' then 'https://www.pexels.com/photo/portrait-of-smiling-doctor-7904471/'
    when '88e1b927-7772-42fc-bad6-73cb5a44a106' then 'https://www.pexels.com/photo/man-in-blue-scrub-suit-holding-a-black-stethoscope-5888145/'
  end
where id in (
  '88e1b927-7772-42fc-bad6-73cb5a44a101',
  '88e1b927-7772-42fc-bad6-73cb5a44a102',
  '88e1b927-7772-42fc-bad6-73cb5a44a103',
  '88e1b927-7772-42fc-bad6-73cb5a44a104',
  '88e1b927-7772-42fc-bad6-73cb5a44a105',
  '88e1b927-7772-42fc-bad6-73cb5a44a106'
);

update public.feature_requests
set front_page_feature = true,
    featured_at = coalesce(featured_at, now())
where id = '88e1b927-7772-42fc-bad6-73cb5a44a101'
  and review_status = 'approved';

commit;
