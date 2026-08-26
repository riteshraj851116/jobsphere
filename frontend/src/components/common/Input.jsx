import React, { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(({
  label,
  error,
  hint,
  required,
  type = 'text',
  prefix,
  suffix,
  className = '',
  id,
  ...rest
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className="input-label" htmlFor={inputId}>
          {label}{required && <span className="input-required" aria-hidden="true"> *</span>}
        </label>
      )}
      <div className={`input-wrap ${prefix ? 'input-wrap--prefix' : ''} ${suffix ? 'input-wrap--suffix' : ''}`}>
        {prefix && <span className="input-prefix">{prefix}</span>}
        <input
          id={inputId}
          ref={ref}
          type={type}
          className={`input-field ${error ? 'input-field--error' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
      {error && <span id={`${inputId}-error`} className="input-error" role="alert">{error}</span>}
      {hint && !error && <span className="input-hint">{hint}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
