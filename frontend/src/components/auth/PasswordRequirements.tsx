import { Check, Circle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { getPasswordRequirements } from "../../lib/passwordPolicy";

import "./PasswordRequirements.css";

type PasswordRequirementsProps = {
  password: string;
};

function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const { t } = useTranslation();

  const requirements = getPasswordRequirements(password);

  const items = [
    {
      key: "minLength",
      valid: requirements.minLength,
    },
    {
      key: "uppercase",
      valid: requirements.uppercase,
    },
    {
      key: "lowercase",
      valid: requirements.lowercase,
    },
    {
      key: "number",
      valid: requirements.number,
    },
    {
      key: "special",
      valid: requirements.special,
    },
  ];

  return (
    <div className="password-requirements" id="password-requirements">
      <p>{t("passwordRules.title")}</p>

      <ul>
        {items.map((item) => (
          <li
            key={item.key}
            className={
              item.valid ? "password-requirement valid" : "password-requirement"
            }
          >
            {item.valid ? (
              <Check size={15} aria-hidden="true" />
            ) : (
              <Circle size={12} aria-hidden="true" />
            )}

            <span>{t(`passwordRules.${item.key}`)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PasswordRequirements;
