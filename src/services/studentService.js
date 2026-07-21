import { supabase } from '../lib/supabase';

const SESSION_KEY_PREFIX = 'zordr_student_';

/**
 * Everything the frontend knows about "this browser's" signup for a given
 * college — kept in sessionStorage, never re-read from the students table
 * directly (that table has zero anon RLS access by design). Cleared when
 * the tab closes, which is an intentional tradeoff for this phase: no auth
 * yet, so there's no safe way to let someone reload and re-fetch their own
 * record without exposing an ID-guessable read path to everyone else's.
 */
function sessionKey(slug) {
  return `${SESSION_KEY_PREFIX}${slug}`;
}

export function getStudentSession(slug) {
  try {
    const raw = sessionStorage.getItem(sessionKey(slug));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStudentSession(slug, data) {
  const existing = getStudentSession(slug) || {};
  const merged = { ...existing, ...data };
  sessionStorage.setItem(sessionKey(slug), JSON.stringify(merged));
  return merged;
}

/**
 * Creates (or resumes) an Early Bird signup for the given college.
 * @returns {Promise<{ data: object|null, error: string|null }>}
 */
export async function createStudent(slug, { name, email, phone, ref }) {
  const { data, error } = await supabase.functions.invoke('create-student', {
    body: { collegeSlug: slug, name, email, phone, ref },
  });

  if (error) return { data: null, error: error.message || 'Could not sign up right now' };
  if (data?.error) return { data: null, error: data.error };

  setStudentSession(slug, {
    studentId: data.studentId,
    referralCode: data.referralCode,
    hasClaimedReward: data.hasClaimedReward,
    name: String(name).trim(),
    email: String(email).trim(),
    phone: String(phone).trim(),
  });

  return { data, error: null };
}

/**
 * Triggers the mystery-card reward assignment for the current student.
 * @returns {Promise<{ data: object|null, error: string|null }>}
 */
export async function claimReward(slug) {
  const session = getStudentSession(slug);
  if (!session?.studentId) {
    return { data: null, error: 'No signup found for this session — please sign up again.' };
  }

  const { data, error } = await supabase.functions.invoke('claim-reward', {
    body: { studentId: session.studentId },
  });

  if (error) return { data: null, error: error.message || 'Could not reveal your reward right now' };
  if (data?.error) return { data: null, error: data.error };

  setStudentSession(slug, {
    rewardTitle: data.rewardTitle,
    rewardDescription: data.rewardDescription,
    couponCode: data.couponCode,
    minOrderValue: data.minOrderValue,
    maxDiscountAmount: data.maxDiscountAmount,
  });

  return { data, error: null };
}
