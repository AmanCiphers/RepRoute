const templates = [
  {
    name: 'Push / Pull / Legs',
    desc: '3-day split: push, pull, legs. Popular for balanced growth.',
    days: [
      {
        name: 'Push Day',
        exercises: [
          { name: 'Bench Press', sets: 4, reps: 8 },
          { name: 'Overhead Press', sets: 3, reps: 10 },
          { name: 'Incline Dumbbell Press', sets: 3, reps: 10 },
          { name: 'Lateral Raise', sets: 3, reps: 15 },
          { name: 'Tricep Pushdown', sets: 3, reps: 12 },
        ],
      },
      {
        name: 'Pull Day',
        exercises: [
          { name: 'Deadlift', sets: 3, reps: 5 },
          { name: 'Pull-ups', sets: 3, reps: 8 },
          { name: 'Barbell Row', sets: 3, reps: 10 },
          { name: 'Face Pull', sets: 3, reps: 15 },
          { name: 'Barbell Curl', sets: 3, reps: 12 },
        ],
      },
      {
        name: 'Legs Day',
        exercises: [
          { name: 'Squat', sets: 4, reps: 8 },
          { name: 'Romanian Deadlift', sets: 3, reps: 10 },
          { name: 'Leg Press', sets: 3, reps: 12 },
          { name: 'Leg Curl', sets: 3, reps: 12 },
          { name: 'Calf Raise', sets: 4, reps: 15 },
        ],
      },
    ],
  },
  {
    name: 'Upper / Lower',
    desc: '4-day split: upper then lower, repeated twice a week.',
    days: [
      {
        name: 'Upper A',
        exercises: [
          { name: 'Bench Press', sets: 4, reps: 8 },
          { name: 'Barbell Row', sets: 4, reps: 8 },
          { name: 'Overhead Press', sets: 3, reps: 10 },
          { name: 'Pull-ups', sets: 3, reps: 10 },
          { name: 'Barbell Curl', sets: 3, reps: 12 },
          { name: 'Tricep Pushdown', sets: 3, reps: 12 },
        ],
      },
      {
        name: 'Lower A',
        exercises: [
          { name: 'Squat', sets: 4, reps: 8 },
          { name: 'Romanian Deadlift', sets: 3, reps: 10 },
          { name: 'Leg Extension', sets: 3, reps: 12 },
          { name: 'Leg Curl', sets: 3, reps: 12 },
          { name: 'Calf Raise', sets: 4, reps: 15 },
        ],
      },
      {
        name: 'Upper B',
        exercises: [
          { name: 'Incline Dumbbell Press', sets: 4, reps: 8 },
          { name: 'Lat Pulldown', sets: 4, reps: 8 },
          { name: 'Seated Dumbbell Press', sets: 3, reps: 10 },
          { name: 'Seated Cable Row', sets: 3, reps: 10 },
          { name: 'Hammer Curl', sets: 3, reps: 12 },
          { name: 'Overhead Tricep Extension', sets: 3, reps: 12 },
        ],
      },
      {
        name: 'Lower B',
        exercises: [
          { name: 'Deadlift', sets: 3, reps: 5 },
          { name: 'Front Squat', sets: 3, reps: 8 },
          { name: 'Bulgarian Split Squat', sets: 3, reps: 10 },
          { name: 'Hip Thrust', sets: 3, reps: 12 },
          { name: 'Seated Calf Raise', sets: 4, reps: 15 },
        ],
      },
    ],
  },
  {
    name: 'Full Body',
    desc: '3-day full body. Great for frequency and beginners.',
    days: [
      {
        name: 'Full Body A',
        exercises: [
          { name: 'Squat', sets: 3, reps: 8 },
          { name: 'Bench Press', sets: 3, reps: 8 },
          { name: 'Barbell Row', sets: 3, reps: 8 },
          { name: 'Overhead Press', sets: 3, reps: 10 },
          { name: 'Deadlift', sets: 2, reps: 5 },
        ],
      },
      {
        name: 'Full Body B',
        exercises: [
          { name: 'Leg Press', sets: 3, reps: 10 },
          { name: 'Incline Dumbbell Press', sets: 3, reps: 10 },
          { name: 'Pull-ups', sets: 3, reps: 8 },
          { name: 'Lateral Raise', sets: 3, reps: 15 },
          { name: 'Barbell Curl', sets: 3, reps: 12 },
        ],
      },
      {
        name: 'Full Body C',
        exercises: [
          { name: 'Romanian Deadlift', sets: 3, reps: 10 },
          { name: 'Lat Pulldown', sets: 3, reps: 10 },
          { name: 'Leg Extension', sets: 3, reps: 12 },
          { name: 'Tricep Pushdown', sets: 3, reps: 12 },
          { name: 'Calf Raise', sets: 3, reps: 15 },
        ],
      },
    ],
  },
  {
    name: 'Bro Split',
    desc: '5-day bodybuilding split: each muscle group gets its own day.',
    days: [
      {
        name: 'Chest',
        exercises: [
          { name: 'Bench Press', sets: 4, reps: 8 },
          { name: 'Incline Dumbbell Press', sets: 4, reps: 10 },
          { name: 'Dumbbell Flyes', sets: 3, reps: 12 },
          { name: 'Push-ups', sets: 3, reps: 15 },
        ],
      },
      {
        name: 'Back',
        exercises: [
          { name: 'Deadlift', sets: 3, reps: 5 },
          { name: 'Pull-ups', sets: 4, reps: 8 },
          { name: 'Barbell Row', sets: 4, reps: 10 },
          { name: 'Face Pull', sets: 3, reps: 15 },
        ],
      },
      {
        name: 'Shoulders',
        exercises: [
          { name: 'Overhead Press', sets: 4, reps: 8 },
          { name: 'Lateral Raise', sets: 4, reps: 15 },
          { name: 'Front Raise', sets: 3, reps: 12 },
          { name: 'Rear Delt Fly', sets: 3, reps: 15 },
        ],
      },
      {
        name: 'Legs',
        exercises: [
          { name: 'Squat', sets: 4, reps: 8 },
          { name: 'Leg Press', sets: 3, reps: 12 },
          { name: 'Leg Extension', sets: 3, reps: 12 },
          { name: 'Leg Curl', sets: 3, reps: 12 },
          { name: 'Calf Raise', sets: 4, reps: 15 },
        ],
      },
      {
        name: 'Arms',
        exercises: [
          { name: 'Barbell Curl', sets: 4, reps: 10 },
          { name: 'Skull Crushers', sets: 4, reps: 10 },
          { name: 'Hammer Curl', sets: 3, reps: 12 },
          { name: 'Overhead Tricep Extension', sets: 3, reps: 12 },
          { name: 'Preacher Curl', sets: 3, reps: 12 },
        ],
      },
    ],
  },
]

export default templates
