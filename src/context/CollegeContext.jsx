import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getCollegeBySlug } from '../services/collegeService';

const CollegeContext = createContext(null);

/**
 * Wraps every /:collegeSlug/* route. Loads the college config object once
 * (from Supabase) and makes it available to all child pages via useCollege().
 * Every page renders from this object — nothing college-specific is
 * hardcoded in components (per PRD Engineering Principles).
 */
export const CollegeProvider = ({ children }) => {
  const { collegeSlug } = useParams();
  const [college, setCollege] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'not_found' | 'error'
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setStatus('loading');
    setError(null);
    const { college: loaded, error: loadError } = await getCollegeBySlug(collegeSlug);

    if (loadError === 'not_found') {
      setStatus('not_found');
      return;
    }
    if (loadError) {
      setError(loadError);
      setStatus('error');
      return;
    }
    setCollege(loaded);
    setStatus('ready');
  }, [collegeSlug]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <CollegeContext.Provider value={{ college, status, error, slug: collegeSlug, reload }}>
      {children}
    </CollegeContext.Provider>
  );
};

export const useCollege = () => {
  const ctx = useContext(CollegeContext);
  if (!ctx) {
    throw new Error('useCollege must be used within a CollegeProvider');
  }
  return ctx;
};
