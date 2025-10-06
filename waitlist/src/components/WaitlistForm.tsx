import React, { useState, useEffect } from 'react';
import { Translations } from '../types';
import { validateEmail } from '../utils/validation';

interface WaitlistFormProps {
  translations: Translations;
  currentLanguage: string;
}

const WaitlistForm: React.FC<WaitlistFormProps> = ({ translations, currentLanguage }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'already_registered'>('idle');
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  // ページ読み込み時に既に登録済みかチェック
  useEffect(() => {
    const registeredEmail = localStorage.getItem('waitlist_registered_email');
    if (registeredEmail) {
      setIsAlreadyRegistered(true);
      setSubmitStatus('already_registered');
      setEmail(registeredEmail);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError(translations.form.email.required);
      return;
    }

    if (!validateEmail(email)) {
      setError(translations.form.email.invalid);
      return;
    }

    if (!consent) {
      setConsentError(translations.form.agreeToTerms.required);
      return;
    }

    if (consentError) {
      setConsentError('');
    }

    // 既に登録済みのメールアドレスかチェック
    const registeredEmail = localStorage.getItem('waitlist_registered_email');
    if (registeredEmail === email.toLowerCase()) {
      setSubmitStatus('already_registered');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, consent }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        // 登録成功時にローカルストレージに保存
        localStorage.setItem('waitlist_registered_email', email.toLowerCase());
        setEmail('');
        setConsent(false);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSubmitStatus('idle');
    setError('');
    setConsentError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('waitlist_registered_email');
    setIsAlreadyRegistered(false);
    setSubmitStatus('idle');
    setEmail('');
    setConsent(false);
    setConsentError('');
  };

    if (submitStatus === 'success') {
      return (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-center shadow-xl border border-gray-200">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
          {currentLanguage === 'ja' ? '成功！' : 'Success!'}
        </h3>
        <p className="text-gray-600 mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base font-normal leading-relaxed">{translations.form.success}</p>
        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={handleRetry}
            className="btn-secondary w-full text-sm"
            data-analytics="form-retry"
          >
            {currentLanguage === 'ja' ? '別の人を招待' : 'Join Another Person'}
          </button>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">
              {currentLanguage === 'ja' ? 'このページを共有' : 'Share this page'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: currentLanguage === 'ja' ? 'ウェイトリストに参加' : 'Join Waitlist',
                      text: currentLanguage === 'ja' ? 'ウェイトリストに参加しよう！' : 'Join our waitlist!',
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert(currentLanguage === 'ja' ? 'リンクをコピーしました！' : 'Link copied!');
                  }
                }}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors duration-200 flex-1 sm:flex-none"
                data-analytics="share-link"
              >
                {currentLanguage === 'ja' ? '📤 共有' : '📤 Share'}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert(currentLanguage === 'ja' ? 'リンクをコピーしました！' : 'Link copied!');
                }}
                    className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-medium transition-colors duration-200 flex-1 sm:flex-none"
                data-analytics="copy-link"
              >
                {currentLanguage === 'ja' ? '📋 コピー' : '📋 Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

    if (submitStatus === 'already_registered') {
      return (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-center shadow-xl border border-gray-200">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
          {currentLanguage === 'ja' ? '既に登録済みです' : 'Already Registered'}
        </h3>
        <p className="text-gray-600 mb-2 text-sm sm:text-base font-normal leading-relaxed">
          {currentLanguage === 'ja' ? 'このメールアドレスは既に登録されています：' : 'This email is already registered:'}
        </p>
        <p className="text-blue-600 font-semibold mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base">
          {email}
        </p>
        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={handleLogout}
            className="btn-secondary w-full text-sm"
            data-analytics="logout"
          >
            {currentLanguage === 'ja' ? '別のメールで登録' : 'Register with Different Email'}
          </button>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">
              {currentLanguage === 'ja' ? 'このページを共有' : 'Share this page'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: currentLanguage === 'ja' ? 'ウェイトリストに参加' : 'Join Waitlist',
                      text: currentLanguage === 'ja' ? 'ウェイトリストに参加しよう！' : 'Join our waitlist!',
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert(currentLanguage === 'ja' ? 'リンクをコピーしました！' : 'Link copied!');
                  }
                }}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors duration-200 flex-1 sm:flex-none"
                data-analytics="share-link"
              >
                {currentLanguage === 'ja' ? '📤 共有' : '📤 Share'}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert(currentLanguage === 'ja' ? 'リンクをコピーしました！' : 'Link copied!');
                }}
                    className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-medium transition-colors duration-200 flex-1 sm:flex-none"
                data-analytics="copy-link"
              >
                {currentLanguage === 'ja' ? '📋 コピー' : '📋 Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-gray-200">
      {submitStatus === 'error' && (
        <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-medium">{translations.form.error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="mt-3 text-sm text-red-600 hover:text-red-800 underline transition-colors duration-200"
            data-analytics="form-retry"
          >
            {translations.form.retry}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 md:space-y-8" data-analytics="signup">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            {translations.form.email.label}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleInputChange}
            placeholder={translations.form.email.placeholder}
            className={`input-field ${error ? 'input-error' : ''}`}
            required
            aria-describedby={error ? 'email-error' : undefined}
            aria-invalid={!!error}
          />
          {error && (
            <p id="email-error" className="mt-2 text-sm text-red-600 font-medium" role="alert">
              {error}
            </p>
          )}
        </div>

        <div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                if (consentError) {
                  setConsentError('');
                }
              }}
              className="mr-2"
            />
            {translations.form.agreeToTerms.label}
          </label>
          {consentError && (
            <p className="mt-2 text-sm text-red-600 font-medium" role="alert">
              {consentError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary py-3 sm:py-4 font-semibold tracking-wide text-sm"
          data-analytics="form-submit"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {translations.form.submitting}
            </div>
          ) : (
            translations.form.submit
          )}
        </button>
      </form>
    </div>
  );
};

export default WaitlistForm;
