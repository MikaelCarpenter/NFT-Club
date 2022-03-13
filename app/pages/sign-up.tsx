import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

const SignUp = () => {
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    usernameRef?.current?.focus();
  }, [usernameRef]);

  const [benefitRefs, setBenefitRefs] = useState<RefObject<HTMLInputElement>[]>(
    [{ current: null }]
  );

  const handleNewBenefit = useCallback(() => {
    setBenefitRefs((prev) => [...prev, { current: null }]);
  }, []);

  const handleCreateAccount = useCallback(() => {
    const username = usernameRef?.current?.value;
    const email = emailRef?.current?.value;
    const description = descriptionRef?.current?.value;

    const benefits = benefitRefs.map((benefitRef) => {
      return benefitRef?.current?.value;
    });

    console.log('username', username);
    console.log('email', email);
    console.log('description', description);
    console.log('benefits', benefits);
  }, [benefitRefs]);

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="prose mb-8">
        <h1>Sign Up</h1>
      </div>
      <div className="form-control mb-16 w-full max-w-xs">
        <label className="label">
          <span className="label-text">Username</span>
        </label>
        <input
          ref={usernameRef}
          type="text"
          placeholder="Jane Doe"
          className="input input-bordered mb-4 w-full max-w-xs text-black"
          maxLength={42}
          autoFocus
        />
        <label className="label">
          <span className="label-text">Email</span>
        </label>
        <input
          ref={emailRef}
          type="text"
          placeholder="jdoe@gmail.com"
          className="input input-bordered mb-4 w-full max-w-xs text-black"
          maxLength={42}
        />
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          ref={descriptionRef}
          className="textarea textarea-bordered mb-4 text-black"
          placeholder="Is creating..."
          maxLength={420}
        />

        <div className="prose mb-4 flex items-center justify-between">
          <h3>Benefits</h3>

          <button className="btn btn-outline btn-sm" onClick={handleNewBenefit}>
            +
          </button>
        </div>

        {benefitRefs.map((benefitRef, index) => (
          <input
            key={`benefit-${index}`}
            ref={benefitRef}
            type="text"
            placeholder="Benefit description"
            className="input input-bordered mb-4 w-full max-w-xs text-black"
            maxLength={420}
          />
        ))}

        <button className="btn btn-primary mt-8" onClick={handleCreateAccount}>
          Create Account
        </button>
      </div>
    </div>
  );
};

export default SignUp;
