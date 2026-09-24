import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type LearningEnrollment = { id: string; start_mode: 'beginner' | 'foundation' | 'direct_answer'; daily_minutes: 15 | 30 | 60; timezone: string; selected_product_id: string | null; selected_product_version_id: string | null }
export type LearningProgress = { lesson_id: string; status: 'not_started' | 'in_progress' | 'completed'; mastery: 'unassessed' | 'needs_review' | 'confident'; read_confirmed_at: string | null; completed_at: string | null }
export type LearningAttempt = { id: string; exercise_id: string; lesson_id: string; state: 'draft' | 'submitted'; answers: Record<string, unknown>; submitted_at: string | null }
export type LearningReview = { id: string; target_type: 'lesson' | 'term'; target_id: string; due_on: string; interval_stage: number }
export type LearningQuestion = { id: string; question: string; related_lesson_ids: string[]; status: string; created_at: string }
export type LearningState = { enrollment: LearningEnrollment | null; progress: LearningProgress[]; attempts: LearningAttempt[]; reviews: LearningReview[]; questions: LearningQuestion[] }

function client() { if (!supabase) throw new Error('NOT_CONFIGURED: 请先连接 Supabase。'); return supabase }

export async function loadLearningState(): Promise<LearningState> {
  const db = client()
  const [enrollment, progress, attempts, reviews, questions] = await Promise.all([
    db.from('learning_enrollments').select('id,start_mode,daily_minutes,timezone,selected_product_id,selected_product_version_id').eq('path_id', 'chemical-trade-growth-v1').maybeSingle(),
    db.from('learning_progress').select('lesson_id,status,mastery,read_confirmed_at,completed_at').not('lesson_id', 'is', null).order('updated_at', { ascending: false }),
    db.from('exercise_attempts').select('id,exercise_id,lesson_id,state,answers,submitted_at').order('updated_at', { ascending: false }),
    db.from('review_items').select('id,target_type,target_id,due_on,interval_stage').eq('active', true).order('due_on').limit(30),
    db.from('learning_questions').select('id,question,related_lesson_ids,status,created_at').order('created_at', { ascending: false }).limit(30),
  ])
  for (const result of [enrollment, progress, attempts, reviews, questions]) if (result.error) throw result.error
  return { enrollment: enrollment.data as LearningEnrollment | null, progress: (progress.data ?? []) as LearningProgress[], attempts: (attempts.data ?? []) as LearningAttempt[], reviews: (reviews.data ?? []) as LearningReview[], questions: (questions.data ?? []) as LearningQuestion[] }
}

export async function enrollLearning(user: User, values: { startMode: LearningEnrollment['start_mode']; dailyMinutes: 15 | 30 | 60; productId: string | null; productVersionId: string | null }) {
  const { error } = await client().from('learning_enrollments').upsert({ owner_id: user.id, path_id: 'chemical-trade-growth-v1', start_mode: values.startMode, daily_minutes: values.dailyMinutes, timezone: 'Asia/Shanghai', selected_product_id: values.productId, selected_product_version_id: values.productVersionId }, { onConflict: 'owner_id,path_id' })
  if (error) throw error
}

export async function confirmLessonRead(user: User, lessonId: string, productId: string | null) {
  void user
  const { error } = await client().rpc('confirm_learning_lesson_read', { p_lesson_id: lessonId, p_product_id: productId })
  if (error) throw error
}

export async function setLessonMastery(lessonId: string, mastery: LearningProgress['mastery']) {
  const { error } = await client().from('learning_progress').update({ mastery }).eq('lesson_id', lessonId)
  if (error) throw error
}

export async function submitLearningAttempt(values: { exerciseId: string; lessonId: string; answer: string; selfCheck: boolean; productId: string | null; productVersionId?: string | null }) {
  const { data, error } = await client().rpc('submit_learning_attempt', {
    p_exercise_id: values.exerciseId, p_lesson_id: values.lessonId, p_lesson_revision: 1,
    p_answers: { response: values.answer }, p_self_check: { learner_confirmed: values.selfCheck },
    p_product_id: values.productId, p_product_version_id: values.productVersionId ?? null, p_idempotency_key: crypto.randomUUID(),
  })
  if (error) throw error
  return data as string
}

export async function saveLearningNote(user: User, lessonId: string, note: string) {
  const { error } = await client().from('learning_notes').upsert({ owner_id: user.id, lesson_id: lessonId, note }, { onConflict: 'owner_id,lesson_id' })
  if (error) throw error
}

export async function addReview(user: User, targetType: 'lesson' | 'term', targetId: string) {
  const { error } = await client().from('review_items').upsert({ owner_id: user.id, target_type: targetType, target_id: targetId, due_on: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10), interval_stage: 0, active: true }, { onConflict: 'owner_id,target_type,target_id' })
  if (error) throw error
}

export async function rateReview(reviewId: string, rating: 'not_known' | 'vague' | 'known') {
  const { data, error } = await client().rpc('rate_learning_review', { p_item_id: reviewId, p_rating: rating, p_idempotency_key: crypto.randomUUID() })
  if (error) throw error
  return data
}

export async function saveLearningQuestion(user: User, question: string, lessonIds: string[]) {
  const { error } = await client().from('learning_questions').insert({ owner_id: user.id, question, related_lesson_ids: lessonIds })
  if (error) throw error
}

export async function exportLearningData() {
  const db = client()
  const [enrollment, progress, attempts, notes, reviews, events, questions] = await Promise.all([
    db.from('learning_enrollments').select('*'), db.from('learning_progress').select('*'), db.from('exercise_attempts').select('*'),
    db.from('learning_notes').select('*'), db.from('review_items').select('*'), db.from('review_events').select('*'), db.from('learning_questions').select('*'),
  ])
  for (const result of [enrollment, progress, attempts, notes, reviews, events, questions]) if (result.error) throw result.error
  return { exported_at: new Date().toISOString(), enrollment: enrollment.data, progress: progress.data, attempts: attempts.data, notes: notes.data, reviews: reviews.data, review_events: events.data, questions: questions.data }
}
