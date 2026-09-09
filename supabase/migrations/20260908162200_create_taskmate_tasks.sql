/*
# Create TaskMate tasks

1. New Tables
- `taskmate_tasks` stores the shared demo task list.
- `id` (uuid, primary key) uniquely identifies each task.
- `title` (text) is the task name shown in the dashboard.
- `priority` (text) is high, medium, or low and controls colour and urgency.
- `status` (text) is todo, in_progress, or done.
- `due_at` (timestamptz) stores the selected deadline.
- `reminder_frequency` (text) stores the reminder cadence selected by the user.
- `created_at` (timestamptz) records when the task was added.

2. Security
- Row level security is enabled.
- The demo intentionally has no sign-in screen, so anon and authenticated roles can use the shared task list.
- Four separate CRUD policies are created for predictable browser access.

3. Notes
- This is a single shared workspace for the showcase experience.
- Check constraints keep task priority, status, and reminder values within supported options.
*/

CREATE TABLE IF NOT EXISTS public.taskmate_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  due_at timestamptz NOT NULL,
  reminder_frequency text NOT NULL DEFAULT 'Daily' CHECK (reminder_frequency IN ('Once', 'Daily', 'Every 2 days', 'Weekly')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.taskmate_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view TaskMate tasks" ON public.taskmate_tasks;
CREATE POLICY "Public can view TaskMate tasks"
  ON public.taskmate_tasks FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can create TaskMate tasks" ON public.taskmate_tasks;
CREATE POLICY "Public can create TaskMate tasks"
  ON public.taskmate_tasks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update TaskMate tasks" ON public.taskmate_tasks;
CREATE POLICY "Public can update TaskMate tasks"
  ON public.taskmate_tasks FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete TaskMate tasks" ON public.taskmate_tasks;
CREATE POLICY "Public can delete TaskMate tasks"
  ON public.taskmate_tasks FOR DELETE
  TO anon, authenticated
  USING (true);
