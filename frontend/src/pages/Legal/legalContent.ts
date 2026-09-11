export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export type LegalContent = {
  title: string;
  browserTitle: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

type LegalLanguage = "ar" | "en";

export const privacyContent: Record<LegalLanguage, LegalContent> = {
  ar: {
    title: "سياسة الخصوصية",
    browserTitle: "سياسة الخصوصية | رتّب",
    lastUpdated: "آخر تحديث: 11 سبتمبر 2026",
    intro:
      "توضح هذه السياسة كيفية التعامل مع المعلومات عند استخدام موقع رتّب. رتّب خدمة شخصية خاصة ومحدودة الاستخدام، وليست خدمة عامة أو تجارية.",
    sections: [
      {
        title: "1. المعلومات التي نجمعها",
        paragraphs: [
          "قد نجمع المعلومات اللازمة لتشغيل حسابك، مثل عنوان البريد الإلكتروني ومعلومات المصادقة.",
          "كما يتم تخزين البيانات التي تدخلها داخل رتّب، مثل الجداول الدراسية والمهام والملاحظات وأوقات التذكير.",
          "عند تفعيل الإشعارات، قد يتم تخزين معلومات تقنية خاصة باشتراك المتصفح في Web Push لإرسال التذكيرات.",
        ],
      },
      {
        title: "2. كيفية استخدام المعلومات",
        paragraphs: [
          "تُستخدم المعلومات لتشغيل حسابك، وحفظ بياناتك، وعرض الجداول والمهام، وإرسال التذكيرات التي تختارها، وتحسين أمان واستقرار الخدمة.",
          "لا يتم استخدام بياناتك حاليًا للإعلانات أو التسويق أو إنشاء ملفات تعريف إعلانية.",
        ],
      },
      {
        title: "3. خدمات الأطراف الثالثة",
        paragraphs: [
          "يعتمد رتّب على خدمات تقنية خارجية لتشغيل الموقع، وتشمل حاليًا Supabase للمصادقة وقاعدة البيانات، وRender لتشغيل الخادم الخلفي، وVercel لاستضافة الواجهة، وBrevo لإرسال بعض رسائل البريد الإلكتروني، وخدمات Web Push للإشعارات.",
          "قد تتم معالجة أو تخزين بعض البيانات خارج المملكة العربية السعودية. قاعدة بيانات رتّب الحالية مستضافة عبر Supabase في منطقة Frankfurt بألمانيا.",
        ],
      },
      {
        title: "4. ملفات تعريف الارتباط والتخزين المحلي",
        paragraphs: [
          "قد يستخدم رتّب ملفات تعريف الارتباط أو التخزين المحلي في المتصفح بالقدر اللازم للمصادقة، وحفظ الجلسة، وبعض إعدادات الموقع.",
          "لا يستخدم رتّب حاليًا Google Analytics أو Meta Pixel أو أدوات إعلانية مماثلة.",
        ],
      },
      {
        title: "5. الاحتفاظ بالبيانات وحذف الحساب",
        paragraphs: [
          "يتم الاحتفاظ ببيانات حسابك ما دام الحساب موجودًا أو حسب الحاجة لتقديم الخدمة.",
          "يمكنك حذف حسابك من صفحة الحساب. حذف الحساب نهائي ولا يمكن التراجع عنه بعد اكتماله، ويتم حذف البيانات المرتبطة بالحساب من قاعدة البيانات النشطة.",
          "قد تبقى نسخ مؤقتة من بعض المعلومات في سجلات أو نسخ احتياطية لدى مزودي الخدمات لفترة محدودة وفقًا لسياسات الاحتفاظ الخاصة بهم.",
        ],
      },
      {
        title: "6. البيانات الحساسة",
        paragraphs: [
          "رتّب غير مصمم لتخزين البيانات الحساسة أو السرية للغاية. يُرجى عدم إدخال معلومات صحية أو مالية أو هويات رسمية أو كلمات مرور أو معلومات شديدة الحساسية داخل المهام أو الملاحظات.",
        ],
      },
      {
        title: "7. الإشعارات",
        paragraphs: [
          "الإشعارات اختيارية ويمكنك تعطيلها من إعدادات حسابك أو إعدادات المتصفح.",
          "لا يمكن ضمان وصول كل إشعار في الوقت المحدد بسبب اعتماد الإشعارات على المتصفح والجهاز والاتصال وخدمات خارجية.",
        ],
      },
      {
        title: "8. العمر المسموح",
        paragraphs: [
          "رتّب مخصص للمستخدمين الذين تبلغ أعمارهم 18 عامًا أو أكثر.",
        ],
      },
      {
        title: "9. التواصل والطلبات المتعلقة بالخصوصية",
        paragraphs: [
          "لأي استفسار أو طلب متعلق ببياناتك أو خصوصيتك، يمكنك التواصل مع مطور رتّب عبر البريد الإلكتروني khratteb@gmail.com أو عبر واتساب على الرقم +966 57 419 0069.",
        ],
      },
      {
        title: "10. التغييرات على هذه السياسة",
        paragraphs: [
          "قد يتم تحديث هذه السياسة عند تغير طريقة عمل رتّب أو الخدمات المستخدمة فيه. سيتم تحديث تاريخ آخر تعديل عند إجراء تغييرات مهمة.",
        ],
      },
    ],
  },

  en: {
    title: "Privacy Policy",
    browserTitle: "Privacy Policy | Ratteb",
    lastUpdated: "Last updated: September 11, 2026",
    intro:
      "This policy explains how information is handled when you use Ratteb. Ratteb is a private, personal, limited-use service and is not currently operated as a public or commercial service.",
    sections: [
      {
        title: "1. Information We Collect",
        paragraphs: [
          "We may collect information required to operate your account, such as your email address and authentication information.",
          "We also store information you enter into Ratteb, including study schedules, tasks, notes, and reminder times.",
          "If you enable notifications, technical information related to your browser's Web Push subscription may be stored so reminders can be delivered.",
        ],
      },
      {
        title: "2. How We Use Information",
        paragraphs: [
          "Information is used to operate your account, store and display your schedules and tasks, send reminders you request, and maintain the security and reliability of the service.",
          "Your information is not currently used for advertising, marketing, or advertising profiles.",
        ],
      },
      {
        title: "3. Third-Party Services",
        paragraphs: [
          "Ratteb relies on third-party technology providers, currently including Supabase for authentication and database services, Render for backend hosting, Vercel for frontend hosting, Brevo for certain email delivery, and Web Push services for notifications.",
          "Some information may be processed or stored outside Saudi Arabia. Ratteb's current Supabase database is hosted in the Frankfurt region in Germany.",
        ],
      },
      {
        title: "4. Cookies and Local Storage",
        paragraphs: [
          "Ratteb may use cookies or browser local storage when necessary for authentication, maintaining sessions, and storing certain application settings.",
          "Ratteb does not currently use Google Analytics, Meta Pixel, or similar advertising tracking tools.",
        ],
      },
      {
        title: "5. Data Retention and Account Deletion",
        paragraphs: [
          "Account information is retained while your account exists or as needed to provide the service.",
          "You can permanently delete your account from the Account page. Account deletion cannot be reversed after completion, and associated data is removed from the active application database.",
          "Temporary copies of certain information may remain in provider logs or backups for limited periods according to the relevant provider's retention practices.",
        ],
      },
      {
        title: "6. Sensitive Information",
        paragraphs: [
          "Ratteb is not designed for highly sensitive or confidential information. Do not store health information, financial details, official identification documents, passwords, or similarly sensitive information in tasks or notes.",
        ],
      },
      {
        title: "7. Notifications",
        paragraphs: [
          "Notifications are optional and may be disabled through your account settings or browser settings.",
          "Delivery of every notification at an exact time cannot be guaranteed because notifications depend on the browser, device, network connection, and third-party services.",
        ],
      },
      {
        title: "8. Age Requirement",
        paragraphs: [
          "Ratteb is intended only for users who are 18 years of age or older.",
        ],
      },
      {
        title: "9. Privacy Requests and Contact",
        paragraphs: [
          "For questions or requests concerning your information or privacy, contact the Ratteb developer at khratteb@gmail.com or through WhatsApp at +966 57 419 0069.",
        ],
      },
      {
        title: "10. Changes to This Policy",
        paragraphs: [
          "This policy may be updated when Ratteb's functionality or service providers change. The last-updated date will be revised when material changes are made.",
        ],
      },
    ],
  },
};

export const termsContent: Record<LegalLanguage, LegalContent> = {
  ar: {
    title: "شروط الاستخدام",
    browserTitle: "شروط الاستخدام | رتّب",
    lastUpdated: "آخر تحديث: 11 سبتمبر 2026",
    intro:
      "باستخدام رتّب فإنك توافق على شروط الاستخدام التالية. رتّب مشروع شخصي خاص مخصص حاليًا لمجموعة محدودة من المستخدمين.",
    sections: [
      {
        title: "1. الأهلية",
        paragraphs: [
          "يجب أن يكون عمرك 18 عامًا أو أكثر لإنشاء حساب واستخدام رتّب.",
        ],
      },
      {
        title: "2. طبيعة الخدمة",
        paragraphs: [
          "رتّب خدمة شخصية محدودة تساعد على تنظيم الجداول والمهام والتذكيرات.",
          "الخدمة ليست حاليًا منتجًا تجاريًا عامًا ولا يُقصد بها الاستخدام المهني أو المؤسسي أو الجماهيري.",
        ],
      },
      {
        title: "3. الحساب",
        paragraphs: [
          "أنت مسؤول عن المحافظة على سرية بيانات تسجيل الدخول الخاصة بحسابك وعن الأنشطة التي تتم من خلاله.",
          "يجب استخدام معلومات صحيحة ومعقولة عند إنشاء الحساب، وعدم محاولة الوصول إلى حساب مستخدم آخر.",
        ],
      },
      {
        title: "4. الاستخدام والمشاركة",
        paragraphs: [
          "لا يجوز نشر أو توزيع أو الترويج لرابط رتّب للعامة أو تحويل الخدمة إلى استخدام عام دون إذن مسبق من المطور.",
          "يمكن للمطور تقييد أو تعليق أو إنهاء الوصول عند وجود استخدام غير مصرح به أو إساءة استخدام أو محاولة الإضرار بالخدمة أو مستخدميها.",
        ],
      },
      {
        title: "5. المحتوى الذي تضيفه",
        paragraphs: [
          "أنت مسؤول عن المعلومات والمحتوى الذي تدخله داخل الجداول والمهام والملاحظات.",
          "يجب عدم استخدام رتّب لتخزين محتوى غير قانوني أو ضار أو شديد الحساسية.",
        ],
      },
      {
        title: "6. الإشعارات والتذكيرات",
        paragraphs: [
          "يتم توفير التذكيرات والإشعارات كميزة مساعدة، ولا يوجد ضمان بأن كل إشعار سيصل أو يصل في وقت محدد.",
          "يجب عدم الاعتماد على رتّب وحده في المواعيد الحرجة أو الحالات التي قد يؤدي تفويتها إلى ضرر.",
        ],
      },
      {
        title: "7. الخدمات الخارجية",
        paragraphs: [
          "يعتمد رتّب على خدمات خارجية مثل Supabase وRender وVercel وBrevo وWeb Push، وقد تؤثر الأعطال أو التغييرات في تلك الخدمات على توفر بعض ميزات رتّب.",
        ],
      },
      {
        title: "8. حذف الحساب",
        paragraphs: [
          "يمكنك حذف حسابك من صفحة الحساب.",
          "حذف الحساب نهائي ولا يمكن استرجاع الحساب أو بياناته من داخل رتّب بعد اكتمال عملية الحذف.",
        ],
      },
      {
        title: "9. توفر الخدمة",
        paragraphs: [
          "يتم تقديم رتّب كما هو وبحسب توفره. قد تتوقف الخدمة مؤقتًا بسبب الصيانة أو الأعطال أو تغير خدمات الاستضافة.",
        ],
      },
      {
        title: "10. حدود المسؤولية",
        paragraphs: [
          "يُستخدم رتّب كأداة مساعدة للتنظيم. يتحمل المستخدم مسؤولية مراجعة مواعيده ومهامه وبياناته والتأكد منها بشكل مستقل.",
        ],
      },
      {
        title: "11. القانون المطبق",
        paragraphs: [
          "تخضع هذه الشروط للأنظمة المعمول بها في المملكة العربية السعودية.",
        ],
      },
      {
        title: "12. تعديل الشروط",
        paragraphs: [
          "قد يتم تحديث هذه الشروط عند إضافة ميزات جديدة أو تغيير طريقة تشغيل الخدمة. سيظهر تاريخ آخر تحديث في أعلى هذه الصفحة.",
        ],
      },
      {
        title: "13. التواصل",
        paragraphs: [
          "للتواصل بخصوص الخدمة أو هذه الشروط: khratteb@gmail.com أو واتساب +966 57 419 0069.",
        ],
      },
    ],
  },

  en: {
    title: "Terms of Use",
    browserTitle: "Terms of Use | Ratteb",
    lastUpdated: "Last updated: September 11, 2026",
    intro:
      "By using Ratteb, you agree to these Terms of Use. Ratteb is a private personal project currently intended for a limited group of users.",
    sections: [
      {
        title: "1. Eligibility",
        paragraphs: [
          "You must be at least 18 years old to create an account and use Ratteb.",
        ],
      },
      {
        title: "2. Nature of the Service",
        paragraphs: [
          "Ratteb is a limited personal service designed to help organize schedules, tasks, and reminders.",
          "The service is not currently operated as a general commercial product and is not intended for public, professional, institutional, or mass use.",
        ],
      },
      {
        title: "3. Your Account",
        paragraphs: [
          "You are responsible for protecting your account credentials and for activity performed through your account.",
          "You must use reasonable and accurate account information and must not attempt to access another user's account.",
        ],
      },
      {
        title: "4. Use and Distribution",
        paragraphs: [
          "You may not publicly publish, distribute, advertise, or promote access to Ratteb, or turn the service into public use, without prior permission from the developer.",
          "Access may be restricted, suspended, or terminated in cases of unauthorized use, abuse, attempts to damage the service, or harmful activity toward other users.",
        ],
      },
      {
        title: "5. Your Content",
        paragraphs: [
          "You are responsible for the information and content you enter into schedules, tasks, and notes.",
          "Ratteb must not be used to store unlawful, harmful, or highly sensitive content.",
        ],
      },
      {
        title: "6. Notifications and Reminders",
        paragraphs: [
          "Notifications and reminders are provided as a convenience and are not guaranteed to be delivered or delivered at an exact time.",
          "Ratteb should not be your only reminder method for critical deadlines or situations where a missed notification could cause harm.",
        ],
      },
      {
        title: "7. Third-Party Services",
        paragraphs: [
          "Ratteb relies on external services including Supabase, Render, Vercel, Brevo, and Web Push. Outages or changes affecting those services may affect Ratteb's availability or features.",
        ],
      },
      {
        title: "8. Account Deletion",
        paragraphs: [
          "You may delete your account from the Account page.",
          "Account deletion is permanent. Once completed, the account and its active Ratteb data cannot be restored through the service.",
        ],
      },
      {
        title: "9. Service Availability",
        paragraphs: [
          "Ratteb is provided as available. Temporary interruptions may occur due to maintenance, technical problems, or changes to hosting providers.",
        ],
      },
      {
        title: "10. Limitation of Responsibility",
        paragraphs: [
          "Ratteb is an organizational aid. Users remain responsible for independently reviewing and confirming their schedules, deadlines, tasks, and information.",
        ],
      },
      {
        title: "11. Governing Law",
        paragraphs: [
          "These Terms are governed by the applicable laws and regulations of the Kingdom of Saudi Arabia.",
        ],
      },
      {
        title: "12. Changes to These Terms",
        paragraphs: [
          "These Terms may be updated when new features are added or the operation of the service changes. The last-updated date will appear at the top of this page.",
        ],
      },
      {
        title: "13. Contact",
        paragraphs: [
          "For questions concerning Ratteb or these Terms, contact khratteb@gmail.com or WhatsApp +966 57 419 0069.",
        ],
      },
    ],
  },
};
