-- Drop old policies
drop policy if exists "users own data" on exercises;

-- Enable RLS (if not already)
alter table exercises enable row level security;

-- Anyone can read public exercises, users can manage their own
create policy "read public exercises" on exercises
  for select using (user_id is null or user_id = auth.uid());

create policy "insert own exercises" on exercises
  for insert with check (user_id = auth.uid());

create policy "update own exercises" on exercises
  for update using (user_id = auth.uid());

create policy "delete own exercises" on exercises
  for delete using (user_id = auth.uid());

-- Seed common exercises (public — no user_id)
insert into exercises (name, muscle_group, category) values
  ('Bench Press', 'Chest', 'Strength'),
  ('Incline Dumbbell Press', 'Chest', 'Strength'),
  ('Decline Bench Press', 'Chest', 'Strength'),
  ('Dumbbell Flyes', 'Chest', 'Isolation'),
  ('Cable Flyes', 'Chest', 'Isolation'),
  ('Push-ups', 'Chest', 'Bodyweight'),
  ('Dips', 'Chest', 'Bodyweight'),
  ('Deadlift', 'Back', 'Strength'),
  ('Conventional Deadlift', 'Back', 'Strength'),
  ('Sumo Deadlift', 'Back', 'Strength'),
  ('Pull-ups', 'Back', 'Bodyweight'),
  ('Chin-ups', 'Back', 'Bodyweight'),
  ('Barbell Row', 'Back', 'Strength'),
  ('Pendlay Row', 'Back', 'Strength'),
  ('Lat Pulldown', 'Back', 'Strength'),
  ('Seated Cable Row', 'Back', 'Strength'),
  ('Face Pull', 'Back', 'Accessory'),
  ('T-Bar Row', 'Back', 'Strength'),
  ('Overhead Press', 'Shoulders', 'Strength'),
  ('Standing Overhead Press', 'Shoulders', 'Strength'),
  ('Seated Dumbbell Press', 'Shoulders', 'Strength'),
  ('Lateral Raise', 'Shoulders', 'Isolation'),
  ('Front Raise', 'Shoulders', 'Isolation'),
  ('Rear Delt Fly', 'Shoulders', 'Isolation'),
  ('Barbell Curl', 'Biceps', 'Isolation'),
  ('Dumbbell Curl', 'Biceps', 'Isolation'),
  ('Hammer Curl', 'Biceps', 'Isolation'),
  ('Preacher Curl', 'Biceps', 'Isolation'),
  ('Cable Curl', 'Biceps', 'Isolation'),
  ('Tricep Pushdown', 'Triceps', 'Isolation'),
  ('Overhead Tricep Extension', 'Triceps', 'Isolation'),
  ('Skull Crushers', 'Triceps', 'Isolation'),
  ('Close-Grip Bench Press', 'Triceps', 'Strength'),
  ('Squat', 'Legs', 'Strength'),
  ('Front Squat', 'Legs', 'Strength'),
  ('Leg Press', 'Legs', 'Strength'),
  ('Romanian Deadlift', 'Legs', 'Strength'),
  ('Leg Curl', 'Legs', 'Isolation'),
  ('Leg Extension', 'Legs', 'Isolation'),
  ('Bulgarian Split Squat', 'Legs', 'Strength'),
  ('Lunges', 'Legs', 'Strength'),
  ('Calf Raise', 'Legs', 'Isolation'),
  ('Seated Calf Raise', 'Legs', 'Isolation'),
  ('Standing Calf Raise', 'Legs', 'Isolation'),
  ('Hip Thrust', 'Glutes', 'Strength'),
  ('Glute Bridge', 'Glutes', 'Isolation'),
  ('Cable Kickback', 'Glutes', 'Isolation'),
  ('Plank', 'Core', 'Bodyweight'),
  ('Cable Crunch', 'Core', 'Isolation'),
  ('Hanging Leg Raise', 'Core', 'Bodyweight'),
  ('Russian Twist', 'Core', 'Bodyweight'),
  ('Ab Wheel Rollout', 'Core', 'Bodyweight'),
  ('Pallof Press', 'Core', 'Isolation'),
  ('Farmer Walk', 'Core', 'Accessory');
