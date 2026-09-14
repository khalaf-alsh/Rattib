import { Turnstile } from "@marsidev/react-turnstile";

type AuthCaptchaProps = {
  onVerify: (token: string) => void;
  onExpire: () => void;
  resetKey: number;
};

function AuthCaptcha({ onVerify, onExpire, resetKey }: AuthCaptchaProps) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    return null;
  }

  return (
    <div className="auth-captcha">
      <Turnstile
        key={resetKey}
        siteKey={siteKey}
        onSuccess={onVerify}
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
