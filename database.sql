-- Nyumbani Hotel Digital Customer Feedback System
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  guest_type text not null check (guest_type in ('Resident','Non-Resident')),
  visit_purpose text,
  name text,
  email text,
  phone text,
  room_number text,
  booking_type text,
  comments text,
  average_rating numeric,
  status text default 'Received',
  resolution_notes text,
  created_at timestamptz default now()
);

create table if not exists feedback_ratings (
  id bigint generated always as identity primary key,
  feedback_id uuid references feedback(id) on delete cascade,
  category text not null,
  answer text not null check (answer in ('Very Good','Good','Average','Poor','Very Poor')),
  hidden_score int not null check (hidden_score between 1 and 5)
);

create table if not exists staff_users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  phone text,
  role text not null check (role in ('System Admin','Manager','Receptionist')),
  department text,
  status text default 'Active',
  created_at timestamptz default now()
);


-- AI extension
alter table feedback add column if not exists ai_sentiment text;
alter table feedback add column if not exists ai_department text;
alter table feedback add column if not exists ai_issue_type text;
alter table feedback add column if not exists ai_urgency text;
alter table feedback add column if not exists ai_engine text;
