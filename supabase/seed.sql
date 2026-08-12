-- Demo doctors for MediLink. Safe to run after the schema migration.
INSERT INTO public.doctors (name, specialization, hospital, city, fee, available_days, contact) VALUES
  ('Dr. Ananya Sharma','Cardiology','Apollo Hospital','Delhi',900,'Mon-Fri','+91 98110 22334'),
  ('Dr. Rajesh Iyer','Nephrology','Fortis Healthcare','Mumbai',1200,'Mon-Sat','+91 98200 44556'),
  ('Dr. Meera Nair','General Medicine','KIMS Hospital','Kochi',500,'Mon-Fri','+91 98470 11223'),
  ('Dr. Vikram Singh','Orthopaedics','AIIMS','Delhi',800,'Tue-Sat','+91 98111 77889'),
  ('Dr. Priya Deshmukh','Dermatology','Ruby Hall Clinic','Pune',700,'Mon-Thu','+91 98230 66778'),
  ('Dr. Arjun Rao','Neurology','Manipal Hospital','Bengaluru',1500,'Wed-Sun','+91 98450 33445'),
  ('Dr. Fatima Khan','Paediatrics','Rainbow Children''s','Hyderabad',600,'Mon-Sat','+91 98490 55667'),
  ('Dr. Sanjay Gupta','Gastroenterology','Medanta','Gurugram',1100,'Mon-Fri','+91 98100 99001');
