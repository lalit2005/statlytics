create or replace function create_user (input_email text, input_password_hash text) RETURNS void as $$
BEGIN
    INSERT INTO users (email, password_hash, role) VALUES (input_email, input_password_hash, 'admin');
END;
$$ LANGUAGE plpgsql;

select create_user('root@goa.com', '$2a$10$Iis0PYZSz7WcjdXOkZ3weOjckF0kaWF1lnRxEUUAGmnFp.6vUAcAy');