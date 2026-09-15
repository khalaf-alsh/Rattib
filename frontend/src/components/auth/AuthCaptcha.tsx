import { Turnstile } from "@marsidev/react-turnstile";

type AuthCaptchaProps = {
  onVerify: (token: string) => void;
  onExpire: () => void;
  resetKey: number;
};

function AuthCaptcha({ onVerify, onExpire, resetKey }: AuthCaptchaProps) {
  // The Turnstile site key is public and is loaded from the
  // frontend environment variables.
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // Do not render the CAPTCHA widget if the site key
  // has not been configured for the current environment.
  if (!siteKey) {
    return null;
  }

  return (
    <div className="auth-captcha">
      <Turnstile
        // Changing the key forces React to remount the widget,
        // allowing a fresh CAPTCHA token after a failed request.
        key={resetKey}
        siteKey={siteKey}
        onSuccess={onVerify}
        // Expired or failed tokens are treated as invalid so
        // the user must receive a new verified token.
        onExpire={onExpire}
        onError={onExpire}
        options={{
          theme: "auto",
        }}
      />
    </div>
  );
}

export default AuthCaptcha;
