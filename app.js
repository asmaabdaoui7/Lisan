/**
 * ============================================================================
 * لِسَان | LISAN — الفضاء الرقمي لطلبة اللسانيات العربية
 * المستودع العام — المحرك الرئيسي الشامل (app.js) — الإصدار 3.1
 * ============================================================================
 * 1. نظام عضويات الطلبة (Email/Password + Google Auth + تفعيل البريد + استعادة كلمة المرور)
 * 2. الحظر الصارم للحسابات المشطوبة نهائياً (terminated): طرد فوري + إظهار السبب + منع إعادة التسجيل
 * 3. التحقق المزدوج + البطاقة الجامعية السرية + التدرج العادل لحالات الحساب والإشعارات الفورية
 * 4. سجل الدرجات الخاص مع خيار الإظهار العلني المؤكَّد + الشارات الأكاديمية التحفيزية
 * 5. نظام التحكم الثلاثي بالميزات (on: مفعّل | off: مخفي | soon: قريباً)
 * 6. دردشة الدعم الفني الذكية للجميع (بمعرّف تذكرة موحد LISAN-XXXXXXXX + متابعة الردود)
 * 7. الصفحات التعريفية المرنة + البحث الذكي + الصور الحرة + Lightbox + الورق الدافئ + YouTube + PDF + SEO
 * ============================================================================
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  increment,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

/* ============================================================================
 * 1. مفاتيح الربط (Firebase + ImgBB)
 * ============================================================================ */
const firebaseConfig = {
  apiKey: "AIzaSyAem1ULSfM9RdKXZPW36fZI8RoI-gvW-lo",
  authDomain: "lisan-b7f25.firebaseapp.com",
  projectId: "lisan-b7f25",
  storageBucket: "lisan-b7f25.firebasestorage.app",
  messagingSenderId: "1068695535462",
  appId: "1:1068695535462:web:aac5c38525898fa30812a7",
  measurementId: "G-4HVJE22SXL"
};

const IMGBB_API_KEY = "6f2cb200a4cd81440fc5ea71238a919e";
const SAVED_TICKETS_KEY = "lisan_recent_tickets_v3";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/* ============================================================================
 * 2. الإعدادات الافتراضية (متزامنة لحظياً مع غرفة العمليات)
 * ============================================================================ */
const DEFAULT_SETTINGS = {
  siteName: "لِسَان | LISAN",
  siteSubtitle: "الفضاء الرقمي لطلبة اللسانيات العربية",
  siteTagline: "نتعلم اللسانيات، نكتشف نظرياتها، ونطور مهاراتنا البحثية.",
  audienceBadge: "جمهور متخصص: طلبة اللسانيات",
  logoUrl: "",
  announcementText: "",
  footerText: "لِسَان | LISAN — الفضاء الرقمي الأكاديمي لطلبة اللسانيات العربية",
  contactEmail: "",
  themeAccent: "#0071e3",
  publicBaseUrl: "",
  studentIdCardMode: "optional",
  requireLoginForQuiz: false,
  supportContacts: {
    whatsapp: "",
    email: "",
    telegram: "",
    welcomeMessage: "مرحباً بك في مركز الدعم الفني لمنصة لِسَان! اختر نوع المشكلة أو اكتب استفسارك ليتم تحويلك مباشرة إلى الكادر البشري."
  },
  socialLinks: { twitter: "", telegram: "", youtube: "", facebook: "" },
  features: {
    globalSearch: "on",
    sectionLibrary: "on",
    sectionDictionary: "on",
    sectionQuiz: "on",
    sectionResearch: "on",
    sectionLectures: "on",
    sectionExchange: "on",
    externalLinkWarning: "on",
    fontControls: "on",
    warmPaperMode: "on",
    shareButtons: "on",
    announcements: "on",
    statsBar: "on",
    studentSubmissions: "on",
    studentAccounts: "on",
    studentPublicGrades: "on",
    supportChat: "on",
    staticPages: "on"
  },
  sectionsMeta: {
    library: {
      id: "library", order: 1, featureKey: "sectionLibrary", title: "المكتبة اللسانية",
      shortDesc: "ملخصات النظريات، الكتب والمراجع العلمية، والأبحاث المختارة.",
      icon: "book", accent: "#0071e3",
      branches: ["ملخصات النظريات اللسانية", "كتب ومراجع وروابط علمية", "مقالات وأبحاث مختارة"]
    },
    dictionary: {
      id: "dictionary", order: 2, featureKey: "sectionDictionary", title: "المعجم اللساني",
      shortDesc: "مصطلحات اللسانيات العامة والتطبيقية والتداولية والحاسوبية بتعريفات مبسطة.",
      icon: "bookmark", accent: "#5e5ce6",
      branches: ["مصطلحات اللسانيات العامة", "اللسانيات التطبيقية", "اللسانيات التداولية", "اللسانيات الحاسوبية"]
    },
    quiz: {
      id: "quiz", order: 3, featureKey: "sectionQuiz", title: "اختبر معارفك",
      shortDesc: "اختبارات تفاعلية في فروع اللسانيات، أسئلة اختيار من متعدد، وتحديات أسبوعية.",
      icon: "check-circle", accent: "#0e9aa7",
      branches: ["اختبارات في فروع اللسانيات", "أسئلة اختيار من متعدد", "تحديات أسبوعية"]
    },
    research: {
      id: "research", order: 4, featureKey: "sectionResearch", title: "فضاء الباحث اللساني",
      shortDesc: "منهجية إعداد مذكرة الماستر، تحليل المدونة، التوثيق العلمي، وأدوات البحث.",
      icon: "compass", accent: "#c88a2e",
      branches: ["كيفية إعداد مذكرة ماستر", "منهجية تحليل المدونة", "التوثيق العلمي", "أدوات البحث اللساني"]
    },
    lectures: {
      id: "lectures", order: 5, featureKey: "sectionLectures", title: "محاضرات ودروس",
      shortDesc: "دروس مختصرة ومرئية في الأصوات، الصرف، النحو، الدلالة، التداولية، وتحليل الخطاب.",
      icon: "play-circle", accent: "#8b5cf6",
      branches: ["علم الأصوات", "الصرف والنحو", "الدلالة والتداولية", "تحليل الخطاب"]
    },
    exchange: {
      id: "exchange", order: 6, featureKey: "sectionExchange", title: "فضاء التبادل العلمي",
      shortDesc: "عرض مشاريع الطلبة، الإعلان عن الملتقيات، المسابقات العلمية، وتجارب البحث.",
      icon: "users", accent: "#16a34a",
      branches: ["عرض مشاريع الطلبة", "الإعلان عن الملتقيات", "مسابقات علمية", "مشاركة تجارب البحث"]
    }
  }
};

const DEFAULT_PAGES = [
  {
    id: "about", slug: "about", order: 1, visible: true,
    title: "من نحن",
    subtitle: "تعرف على منصة لِسَان | LISAN ورؤيتها الأكاديمية",
    bodyHtml: `
      <h2>عن منصة لِسَان | LISAN</h2>
      <p>منصة <strong>لِسَان</strong> هي فضاء رقمي أكاديمي متخصص صُمم خصيصاً لطلبة وباحثي اللسانيات العربية، بهدف جمع المعرفة اللسانية الموثوقة في بيئة هادئة ومنظمة تجمع بين أصالة التراث اللغوي وحداثة الأدوات الرقمية.</p>
      <h3>أهدافنا الأساسية</h3>
      <ul>
        <li>تبسيط النظريات اللسانية الحديثة والقديمة وتقديم ملخصات أكاديمية دقيقة.</li>
        <li>توفير معجم لساني متنامٍ بالمصطلحات ومقابلاتها الأجنبية.</li>
        <li>تمكين الطلبة من اختبار معارفهم وتبادل مشاريعهم وتجاربهم البحثية ضمن مجتمع موثق.</li>
      </ul>
    `
  },
  {
    id: "methodology", slug: "methodology", order: 2, visible: true,
    title: "الرسالة والمنهجية",
    subtitle: "ضوابط النشر العلمي وتوثيق العضويات في المنصة",
    bodyHtml: `
      <h2>منهجيتنا العلمية</h2>
      <p>نعتمد في منصة <strong>لِسَان</strong> على المراجعة التحريرية الدقيقة للمواد المنشورة، مع الالتزام بالأمانة العلمية وتوثيق المصادر والمراجع الأكاديمية.</p>
      <h3>آلية توثيق حسابات الطلبة</h3>
      <p>حرصاً على موثوقية المجتمع الأكاديمي، يخضع كل حساب جديد لتحقق مزدوج يشمل تأكيد البريد الإلكتروني ومراجعة البيانات الأكاديمية من قِبل الإدارة، وتبقى أي وثائق إثباتية سرية تماماً ولا تُعرض للعامة.</p>
    `
  },
  {
    id: "privacy", slug: "privacy", order: 3, visible: true,
    title: "الخصوصية وشروط الاستخدام",
    subtitle: "كيف نحمي بياناتك الأكاديمية وضوابط المشاركة العادلة",
    bodyHtml: `
      <h2>حماية الخصوصية</h2>
      <p>خصوصية الطالب أولوية قصوى لدينا: لا يظهر البريد الإلكتروني أو صورة البطاقة الجامعية أو سجل الدرجات للزوار إطلاقاً، ولا يُكشف سجل الدرجات إلا إذا اختار الطالب ذلك بنفسه مع تأكيد صريح.</p>
      <h3>ضوابط الاستخدام العادل</h3>
      <ul>
        <li>الالتزام بالأمانة العلمية وعدم انتحال أبحاث الغير عند إرسال المساهمات.</li>
        <li>احترام الطابع الأكاديمي الهادف في جميع المشاركات والردود.</li>
        <li>في حال وجود أي ملاحظة أو تقييد على حساب، يصل إشعار فوري يوضح السبب مع إتاحة التواصل المباشر مع الدعم الفني.</li>
      </ul>
    `
  }
];

/* ============================================================================
 * 3. بيانات تأسيسية أولية (تختفي تلقائياً عند نشر أول مادة من غرفة العمليات)
 * ============================================================================ */
const FALLBACK_ITEMS = [
  {
    id: "demo-lib-1", sectionId: "library", branch: "ملخصات النظريات اللسانية",
    title: "مدخل إلى البنيوية اللسانية عند فرديناند دي سوسير",
    subtitle: "ملخص أكاديمي شامل — اللسانيات الحديثة",
    summary: "عرض منهجي لثنائيات دي سوسير المؤسسة للسانيات الحديثة: اللسان والكلام، الدال والمدلول، والمنهجان التزامني والتعاقبي.",
    contentType: "article",
    bodyHtml: `<h2>تمهيد منهجي</h2><p>يُعدّ كتاب <strong>محاضرات في اللسانيات العامة</strong> لفرديناند دي سوسير نقطة التحول الحاسمة التي نقلت دراسة اللغة إلى علم وصفي بنيوي دقيق.</p><blockquote>"إن الموضوع الوحيد والحقيقي للسانيات هو اللغة منظوراً إليها في ذاتها ومن أجل ذاتها."</blockquote>`,
    tags: ["البنيوية", "دي سوسير", "اللسانيات العامة"], views: 142, createdAt: "2026-11-20T09:00:00Z", isDemo: true
  },
  {
    id: "demo-dict-1", sectionId: "dictionary", branch: "اللسانيات التداولية",
    title: "الاستلزام الحواري", subtitle: "Conversational Implicature",
    summary: "ما يقصده المتكلم ضمناً من وراء ملفوظه دون أن يصرح به حرفياً، اعتماداً على السياق ومبدأ التعاون لدى بول غرايس.",
    contentType: "term",
    bodyHtml: `<p>صاغ الفيلسوف اللغوي <strong>هربرت بول غرايس (H.P. Grice)</strong> مفهوم الاستلزام الحواري لتفسير الفجوة بين المعنى الحرفي للجملة والمعنى المقصود في السياق التواصلي.</p>`,
    tags: ["غرايس", "التداولية", "السياق"], views: 98, createdAt: "2026-11-20T09:10:00Z", isDemo: true
  },
  {
    id: "demo-res-1", sectionId: "research", branch: "كيفية إعداد مذكرة ماستر",
    title: "دليل صياغة الإشكالية وبناء خطة مذكرة الماستر في اللسانيات",
    subtitle: "منهجية البحث الأكاديمي",
    summary: "خطوات عملية لاختيار موضوع لساني دقيق، تحديد المدونة، وصياغة التساؤلات والفرضيات البحثية بصورة علمية محكمة.",
    contentType: "article",
    bodyHtml: `<h2>أركان المذكرة اللسانية الناجحة</h2><ol><li><strong>ضبط العنوان:</strong> تحديد الظاهرة والمنهج وحدود المدونة.</li><li><strong>بناء الإشكالية:</strong> صياغة سؤال مركزي قابل للاختبار.</li></ol>`,
    tags: ["ماستر", "منهجية", "إشكالية"], views: 115, createdAt: "2026-11-20T09:20:00Z", isDemo: true
  },
  {
    id: "demo-lec-1", sectionId: "lectures", branch: "علم الأصوات",
    title: "الفارق الإجرائي بين علم الأصوات (الفونيتيك) والفونولوجيا",
    subtitle: "محاضرة تمهيدية مركزة",
    summary: "شرح مبسط للفرق بين دراسة الصوت اللغوي بخصائصه الفيزيائية والنطقية، وبين دراسة وظيفته التمييزية داخل النظام اللغوي.",
    contentType: "article",
    bodyHtml: `<p>يهتم <strong>علم الأصوات العام (Phonetics)</strong> بدراسة الأصوات البشرية من حيث مخارجها وصفاتها، أما <strong>الفونولوجيا</strong> فتبحث في القيمة التمييزية للصوت داخل النسق اللغوي.</p>`,
    tags: ["الأصوات", "الفونولوجيا", "الفونيم"], views: 88, createdAt: "2026-11-20T09:25:00Z", isDemo: true
  },
  {
    id: "demo-exc-1", sectionId: "exchange", branch: "عرض مشاريع الطلبة",
    title: "مشروع تخرج: تحليل التداولية الحجاجية في الخطاب الصحفي العربي",
    subtitle: "إعداد: فريق بحثي من طلبة الماستر",
    summary: "نموذج تطبيقي يرصد آليات الحجاج والروابط التداولية في عينة من المقالات الافتتاحية العربية المعاصرة.",
    contentType: "article",
    bodyHtml: `<p>يعرض هذا المشروع البحثي تجربة تطبيق نظرية <strong>الحجاج في اللغة</strong> على مدونة صحفية مختارة.</p>`,
    tags: ["مشاريع الطلبة", "الحجاج", "تحليل الخطاب"], views: 64, createdAt: "2026-11-20T09:30:00Z", isDemo: true
  }
];

const FALLBACK_QUIZZES = [
  {
    id: "demo-quiz-1", branch: "اختبارات في فروع اللسانيات",
    title: "اختبار تأسيسي في مفاهيم اللسانيات العامة",
    description: "قيّم استيعابك لأبرز المفاهيم التأسيسية في المدارس اللسانية الحديثة مع شرح علمي فوري لكل إجابة.",
    difficulty: "مبتدئ", status: "published", isDemo: true,
    questions: [
      {
        question: "من هو العالم اللغوي الذي أسس ثنائية (اللسان والكلام) و(الدال والمدلول)؟",
        options: ["نعوم تشومسكي", "فرديناند دي سوسير", "رومان ياكبسون", "بول غرايس"],
        correctIndex: 1,
        explanation: "فرديناند دي سوسير هو مؤسس اللسانيات البنيوية الحديثة."
      },
      {
        question: "أي فرع من فروع اللسانيات يدرس العلاقة بين العلامات اللغوية ومستعمليها في سياق التواصل؟",
        options: ["الصرف", "علم الأصوات النطقي", "اللسانيات التداولية", "المعجمية التاريخية"],
        correctIndex: 2,
        explanation: "التداولية (Pragmatics) تدرس اللغة في الاستعمال الفعلي والسياق التواصلي."
      },
      {
        question: "تُعرف أصغر وحدة صوتية ذات وظيفة تمييزية تغيّر المعنى في اللغة بـ:",
        options: ["المورفيم", "الفونيم", "السيمانتيم", "المقطع الصوتي"],
        correctIndex: 1,
        explanation: "الفونيم هو أصغر وحدة صوتية مجردة قادرة على التفريق بين المعاني."
      }
    ]
  }
];

/* ============================================================================
 * 4. الحالة المركزية للتطبيق (State)
 * ============================================================================ */
const state = {
  settings: structuredClone(DEFAULT_SETTINGS),
  pages: structuredClone(DEFAULT_PAGES),
  items: [],
  quizzes: [],
  loading: true,
  authReady: false,
  authUser: null,
  studentProfile: null,
  studentResults: [],
  studentNotifications: [],
  studentSubmissions: [],
  profileTab: "overview",
  route: {
    view: "home",
    sectionId: null,
    branch: "الكل",
    itemId: null,
    quizId: null,
    pageSlug: null,
    studentUid: null,
    searchQuery: ""
  },
  readerFontSize: Number(localStorage.getItem("lisan_font_size") || 18),
  warmPaperActive: localStorage.getItem("lisan_warm_paper") === "1",
  activeQuizSession: null,
  videoObserver: null,
  pendingExternalUrl: null,
  activeTicketId: null
};

/* ============================================================================
 * 5. أيقونات SVG نظيفة
 * ============================================================================ */
const ICONS = {
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`,
  bookmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8"/><path d="M8 11h6"/></svg>`,
  "check-circle": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  "play-circle": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  support: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  arrowLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  external: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  pdf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  video: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><polygon points="10 9 15 12 10 15 10 9"/></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  paper: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  verified: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 2.4 3.4-.3.9 3.3 2.9 1.7-1.4 3.1 1.4 3.1-2.9 1.7-.9 3.3-3.4-.3L12 22l-2.4-2.4-3.4.3-.9-3.3-2.9-1.7 1.4-3.1-1.4-3.1 2.9-1.7.9-3.3 3.4.3L12 2z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  google: `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1C3.3 21.4 7.3 24 12 24z"/><path fill="#FBBC05" d="M5.3 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.6H1.3C.5 8.2 0 10.1 0 12s.5 3.8 1.3 5.4l4-3.1z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C18 1.2 15.2 0 12 0 7.3 0 3.3 2.6 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z"/></svg>`
};

/* ============================================================================
 * 6. نظام التحكم الثلاثي بالميزات + نافذة الشطب النهائي + مساعدات أساسية
 * ============================================================================ */
function getFeatureState(key) {
  const val = state.settings.features?.[key];
  if (val === false || val === "off") return "off";
  if (val === "soon") return "soon";
  return "on";
}

function showComingSoonModal(featureName = "هذه الميزة") {
  openDynamicModal("قريباً في منصة لِسَان", `
    <div class="soon-box">
      <div class="soon-badge-icon">${ICONS.sparkles}</div>
      <h3>${escapeHtml(featureName)} ستتوفر قريباً</h3>
      <p>هذه الميزة غير متوفرة حالياً، وتعمل إدارة المنصة على تجهيزها لتتاح للجميع في أقرب وقت.</p>
      <button type="button" class="btn-primary-glass" id="close-soon-ok">حسناً، فهمت</button>
    </div>
  `, "compact");
  document.getElementById("close-soon-ok")?.addEventListener("click", closeDynamicModal);
}

function showTerminatedAccountModal(reason = "") {
  openDynamicModal("حساب مشطوب نهائياً", `
    <div class="soon-box">
      <div class="auth-err-box" style="margin-bottom:14px">
        ⛔ تم شطب وإنهاء هذا الحساب نهائياً بقرار من الإدارة العليا لمنصة لِسَان.
      </div>
      <p style="margin-bottom:10px">لا يمكن الدخول إلى هذا الحساب أو إعادة التسجيل بنفس البريد الإلكتروني مجدداً.</p>
      ${reason ? `<div class="bot-bubble" style="text-align:right"><strong>السبب المسجّل في السجل:</strong><p>${escapeHtml(reason)}</p></div>` : ""}
      <div class="dialog-actions" style="justify-content:center; margin-top:18px">
        ${getFeatureState("supportChat") === "on" ? `<button type="button" class="tool-btn" id="term-contact-support">${ICONS.support} التواصل مع الدعم</button>` : ""}
        <button type="button" class="btn-primary-glass" id="term-close-ok">إغلاق</button>
      </div>
    </div>
  `, "compact");
  document.getElementById("term-close-ok")?.addEventListener("click", closeDynamicModal);
  document.getElementById("term-contact-support")?.addEventListener("click", () => {
    closeDynamicModal();
    openSupportChatModal("account_issue");
  });
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeArabic(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(html = "") {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

function smartSearchItems(queryText, list, extraFieldsFn = null) {
  const normQuery = normalizeArabic(queryText);
  if (!normQuery) return list;
  const tokens = normQuery.split(" ").filter(Boolean);

  return list
    .map((entry) => {
      const titleNorm = normalizeArabic(entry.title || "");
      const subNorm = normalizeArabic(entry.subtitle || "");
      const summaryNorm = normalizeArabic(entry.summary || entry.description || "");
      const branchNorm = normalizeArabic(entry.branch || "");
      const tagsNorm = normalizeArabic((entry.tags || []).join(" "));
      const bodyNorm = normalizeArabic(stripHtml(entry.bodyHtml || ""));
      const extraNorm = extraFieldsFn ? normalizeArabic(extraFieldsFn(entry)) : "";

      const fullHaystack = `${titleNorm} ${subNorm} ${summaryNorm} ${branchNorm} ${tagsNorm} ${bodyNorm} ${extraNorm}`;
      if (!tokens.every((tk) => fullHaystack.includes(tk))) return null;

      let score = 0;
      if (titleNorm.includes(normQuery)) score += 100;
      tokens.forEach((tk) => {
        if (titleNorm.includes(tk)) score += 30;
        if (subNorm.includes(tk)) score += 20;
        if (tagsNorm.includes(tk)) score += 18;
        if (branchNorm.includes(tk)) score += 15;
        if (summaryNorm.includes(tk)) score += 10;
        if (bodyNorm.includes(tk)) score += 4;
      });
      return { entry, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.entry);
}

function renderAvatarHtml(url, fallbackName = "ط", sizeClass = "md") {
  const ch = escapeHtml((fallbackName || "ط").trim()[0] || "ط");
  if (url) return `<img src="${escapeHtml(url)}" alt="${escapeHtml(fallbackName)}" class="avatar-img ${sizeClass}" />`;
  return `<div class="avatar-placeholder ${sizeClass}">${ch}</div>`;
}

async function compressImageToBase64(file, maxWidth = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("تعذر قراءة الصورة"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("ملف الصورة غير صالح"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality).split(",")[1]);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function uploadImageToImgBB(file, statusEl = null, maxWidth = 900) {
  if (!file) throw new Error("لم يتم اختيار صورة");
  if (statusEl) statusEl.textContent = "جارٍ ضغط الصورة...";
  const base64 = await compressImageToBase64(file, maxWidth, 0.82);
  if (statusEl) statusEl.textContent = "جارٍ الرفع الآمن...";
  const fd = new FormData();
  fd.append("image", base64);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok || !json?.success || !json?.data?.url) {
    throw new Error("تعذر رفع الصورة حالياً، حاول مجدداً");
  }
  if (statusEl) statusEl.textContent = "تم الرفع بنجاح ✓";
  return json.data.url;
}

/* ============================================================================
 * 7. تنقية النصوص والصور الحرة وروابط الوسائط والسيو
 * ============================================================================ */
function sanitizeAndLinkifyHtml(rawHtml = "") {
  const allowedTags = new Set([
    "H1", "H2", "H3", "H4", "P", "BR", "STRONG", "B", "EM", "I", "U",
    "BLOCKQUOTE", "UL", "OL", "LI", "A", "IMG", "FIGURE", "FIGCAPTION",
    "HR", "SPAN", "MARK", "SUP", "SUB", "CODE", "PRE",
    "TABLE", "THEAD", "TBODY", "TR", "TH", "TD", "DIV"
  ]);
  const safeClasses = new Set(["academic-figure", "academic-inline-img", "img-size-sm", "img-size-md", "img-size-full"]);
  const template = document.createElement("template");
  template.innerHTML = rawHtml || "";

  const walkClean = (node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (!allowedTags.has(child.tagName)) {
          if (["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED"].includes(child.tagName)) {
            child.remove();
            continue;
          }
          const frag = document.createDocumentFragment();
          while (child.firstChild) frag.appendChild(child.firstChild);
          child.replaceWith(frag);
          continue;
        }
        const kept = Array.from(child.classList).filter((c) => safeClasses.has(c));
        for (const attr of Array.from(child.attributes)) {
          const n = attr.name.toLowerCase();
          const v = attr.value.trim();
          if (n.startsWith("on") || n === "style" || n === "contenteditable" || n === "class") {
            child.removeAttribute(attr.name);
          } else if ((n === "href" || n === "src") && /^javascript:/i.test(v)) {
            child.removeAttribute(attr.name);
          }
        }
        kept.forEach((c) => child.classList.add(c));
        if (child.tagName === "A") {
          child.setAttribute("target", "_blank");
          child.setAttribute("rel", "noopener noreferrer");
          child.classList.add("lisan-auto-link");
        }
        if (child.tagName === "IMG") {
          child.setAttribute("loading", "lazy");
          child.classList.add("academic-inline-img", "zoomable-img");
        }
        if (child.tagName === "FIGURE") child.classList.add("academic-figure");
        walkClean(child);
      }
    }
  };
  walkClean(template.content);

  const urlRegex = /((?:https?:\/\/|www\.)[^\s<>"'()]+)/gi;
  const textNodes = [];
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
  let cur;
  while ((cur = walker.nextNode())) {
    if (cur.parentElement && cur.parentElement.closest("a, code, pre")) continue;
    if (urlRegex.test(cur.nodeValue)) textNodes.push(cur);
    urlRegex.lastIndex = 0;
  }
  for (const tNode of textNodes) {
    const text = tNode.nodeValue;
    const frag = document.createDocumentFragment();
    let lastIndex = 0;
    text.replace(urlRegex, (match, _p1, offset) => {
      if (offset > lastIndex) frag.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
      let cleanUrl = match;
      let trailing = "";
      while (/[.,،؛:!?)}\]]$/.test(cleanUrl)) {
        trailing = cleanUrl.slice(-1) + trailing;
        cleanUrl = cleanUrl.slice(0, -1);
      }
      const a = document.createElement("a");
      a.href = cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "lisan-auto-link";
      a.textContent = cleanUrl;
      frag.appendChild(a);
      if (trailing) frag.appendChild(document.createTextNode(trailing));
      lastIndex = offset + match.length;
    });
    if (lastIndex < text.length) frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    tNode.replaceWith(frag);
  }

  const wrap = document.createElement("div");
  wrap.appendChild(template.content);
  return wrap.innerHTML;
}

function extractYouTubeId(url = "") {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/
  ];
  for (const reg of patterns) {
    const m = url.match(reg);
    if (m && m[1]) return m[1];
  }
  return null;
}

function buildPdfEmbedUrl(url = "") {
  if (!url) return null;
  const d1 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (d1) return `https://drive.google.com/file/d/${d1[1]}/preview`;
  const d2 = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (d2) return `https://drive.google.com/file/d/${d2[1]}/preview`;
  const d3 = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (d3) return `https://docs.google.com/document/d/${d3[1]}/preview`;
  if (/\.pdf(\?.*)?$/i.test(url)) return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
  return url;
}

function estimateReadingMinutes(html = "") {
  const words = stripHtml(html).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

function formatArabicDate(val, withTime = false) {
  if (!val) return "";
  try {
    const d = typeof val.toDate === "function" ? val.toDate() : new Date(val);
    if (isNaN(d.getTime())) return "";
    const opts = { year: "numeric", month: "short", day: "numeric" };
    if (withTime) { opts.hour = "2-digit"; opts.minute = "2-digit"; }
    return new Intl.DateTimeFormat("ar-SA", opts).format(d);
  } catch {
    return "";
  }
}

function updateSEO({ title, description, image, type = "website", schemaData = null }) {
  const siteName = state.settings.siteName || "لِسَان | LISAN";
  const fullTitle = title ? `${title} — ${siteName}` : `${siteName} | ${state.settings.siteSubtitle}`;
  const desc = (description || state.settings.siteTagline || "").slice(0, 160);
  document.title = fullTitle;

  const setMeta = (selector, attr, content) => {
    if (!content) return;
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr[0], attr[1]);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };
  setMeta('meta[name="description"]', ["name", "description"], desc);
  setMeta('meta[property="og:title"]', ["property", "og:title"], fullTitle);
  setMeta('meta[property="og:description"]', ["property", "og:description"], desc);
  setMeta('meta[property="og:url"]', ["property", "og:url"], window.location.href);
  setMeta('meta[property="og:type"]', ["property", "og:type"], type);
  if (image) setMeta('meta[property="og:image"]', ["property", "og:image"], image);

  const ld = document.getElementById("dynamic-jsonld");
  if (ld) {
    ld.textContent = JSON.stringify(schemaData || {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: siteName,
      description: desc,
      url: window.location.origin,
      inLanguage: "ar"
    });
  }
}

/* ============================================================================
 * 8. جلب البيانات والصفحات والعضوية والإشعارات + التحقق من الشطب النهائي
 * ============================================================================ */
function deepMergeSettings(remote = {}) {
  const merged = structuredClone(DEFAULT_SETTINGS);
  Object.keys(remote).forEach((k) => {
    if (k === "features" && remote.features) {
      Object.keys(remote.features).forEach((fk) => {
        const v = remote.features[fk];
        merged.features[fk] = v === true ? "on" : v === false ? "off" : v;
      });
    } else if (k === "socialLinks" && remote.socialLinks) {
      merged.socialLinks = { ...merged.socialLinks, ...remote.socialLinks };
    } else if (k === "supportContacts" && remote.supportContacts) {
      merged.supportContacts = { ...merged.supportContacts, ...remote.supportContacts };
    } else if (k === "sectionsMeta" && remote.sectionsMeta) {
      Object.keys(remote.sectionsMeta).forEach((sId) => {
        if (merged.sectionsMeta[sId]) merged.sectionsMeta[sId] = { ...merged.sectionsMeta[sId], ...remote.sectionsMeta[sId] };
      });
    } else if (remote[k] !== undefined) {
      merged[k] = remote[k];
    }
  });
  return merged;
}

async function loadPlatformData() {
  try {
    const [settingsSnap, pagesSnap, itemsSnap, quizzesSnap] = await Promise.allSettled([
      getDoc(doc(db, "settings", "global")),
      getDocs(collection(db, "pages")),
      getDocs(query(collection(db, "items"), orderBy("createdAt", "desc"))),
      getDocs(query(collection(db, "quizzes"), orderBy("createdAt", "desc")))
    ]);

    if (settingsSnap.status === "fulfilled" && settingsSnap.value.exists()) {
      state.settings = deepMergeSettings(settingsSnap.value.data());
    }

    if (pagesSnap.status === "fulfilled" && !pagesSnap.value.empty) {
      const remoteMap = new Map(pagesSnap.value.docs.map((d) => [d.id, { id: d.id, ...d.data() }]));
      const mergedPages = DEFAULT_PAGES.map((dp) => remoteMap.has(dp.id) ? { ...dp, ...remoteMap.get(dp.id) } : dp);
      pagesSnap.value.docs.forEach((d) => {
        if (!DEFAULT_PAGES.some((dp) => dp.id === d.id)) mergedPages.push({ id: d.id, ...d.data() });
      });
      state.pages = mergedPages.sort((a, b) => (a.order || 99) - (b.order || 99));
    }

    if (itemsSnap.status === "fulfilled" && !itemsSnap.value.empty) {
      const liveItems = itemsSnap.value.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((it) => !it.status || it.status === "published");
      state.items = liveItems.length ? liveItems : FALLBACK_ITEMS;
    } else {
      state.items = FALLBACK_ITEMS;
    }

    if (quizzesSnap.status === "fulfilled" && !quizzesSnap.value.empty) {
      const liveQuizzes = quizzesSnap.value.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((q) => !q.status || q.status === "published");
      state.quizzes = liveQuizzes.length ? liveQuizzes : FALLBACK_QUIZZES;
    } else {
      state.quizzes = FALLBACK_QUIZZES;
    }
  } catch (err) {
    console.warn("Lisan fallback mode:", err);
    state.items = FALLBACK_ITEMS;
    state.quizzes = FALLBACK_QUIZZES;
  } finally {
    state.loading = false;
    applyGlobalShell();
  }
}

async function checkEmailTerminated(email = "") {
  const lower = String(email || "").trim().toLowerCase();
  if (!lower) return null;
  try {
    const snap = await getDocs(query(collection(db, "students"), where("emailLower", "==", lower)));
    for (const d of snap.docs) {
      const data = d.data();
      if (data.status === "terminated") return data;
    }
  } catch {}
  return null;
}

async function loadStudentData(uid) {
  if (!uid) {
    state.studentProfile = null;
    state.studentResults = [];
    state.studentNotifications = [];
    state.studentSubmissions = [];
    updateHeaderAccountUi();
    return { terminated: false };
  }

  try {
    const profileRef = doc(db, "students", uid);
    const snap = await getDoc(profileRef);

    if (snap.exists()) {
      const data = { id: snap.id, ...snap.data() };

      // حظر صارم وفوري للحسابات المشطوبة نهائياً
      if (data.status === "terminated") {
        state.studentProfile = null;
        state.studentResults = [];
        state.studentNotifications = [];
        state.studentSubmissions = [];
        await signOut(auth).catch(() => {});
        updateHeaderAccountUi();
        showTerminatedAccountModal(data.statusReason || "");
        if (state.route.view === "profile") navigateTo({ view: "home" }, false);
        return { terminated: true, reason: data.statusReason || "" };
      }

      if (state.authUser?.emailVerified && !data.emailVerified) {
        const nextStatus = data.status === "pending_email" ? "pending_review" : data.status;
        await updateDoc(profileRef, { emailVerified: true, status: nextStatus, updatedAt: new Date().toISOString() });
        data.emailVerified = true;
        data.status = nextStatus;
      }
      state.studentProfile = data;
    } else {
      // فحص البريد في حال كان مشطوباً بسجل سابق
      const termRec = await checkEmailTerminated(state.authUser?.email || "");
      if (termRec) {
        await signOut(auth).catch(() => {});
        state.studentProfile = null;
        updateHeaderAccountUi();
        showTerminatedAccountModal(termRec.statusReason || "");
        return { terminated: true, reason: termRec.statusReason || "" };
      }
      state.studentProfile = null;
    }

    const [resSnap, notifSnap, subSnap] = await Promise.allSettled([
      getDocs(query(collection(db, "quizResults"), where("studentUid", "==", uid))),
      getDocs(query(collection(db, "notifications"), where("studentUid", "==", uid))),
      getDocs(query(collection(db, "items"), where("studentUid", "==", uid)))
    ]);

    state.studentResults = resSnap.status === "fulfilled"
      ? resSnap.value.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
      : [];
    state.studentNotifications = notifSnap.status === "fulfilled"
      ? notifSnap.value.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
      : [];
    state.studentSubmissions = subSnap.status === "fulfilled"
      ? subSnap.value.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
      : [];
  } catch (err) {
    console.warn("Student data load issue:", err);
  }
  updateHeaderAccountUi();
  return { terminated: false };
}

function computeStudentBadges(profile, results = [], publishedSubsCount = 0) {
  const badges = [];
  if (["approved", "restricted_publish", "restricted_readonly", "hidden_profile"].includes(profile?.status)) {
    badges.push({ label: "طالب موثق", tone: "verified" });
  }
  if (profile?.isEduEmail) {
    badges.push({ label: "بريد جامعي", tone: "edu" });
  }
  if (publishedSubsCount >= 1) {
    badges.push({ label: "باحث مساهم", tone: "contrib" });
  }
  const highScores = results.filter((r) => Number(r.percentage) >= 90).length;
  if (highScores >= 3) {
    badges.push({ label: "متفوق اللسانيات", tone: "gold" });
  }
  return badges;
}

const STUDENT_STATUS_MAP = {
  pending_email: { label: "بانتظار تأكيد البريد", tone: "warn", desc: "أرسلنا رابط تفعيل إلى بريدك الإلكتروني. اضغط عليه ثم حدّث حالتك ليتم تحويل طلبك للمراجعة." },
  pending_review: { label: "قيد المراجعة الأكاديمية", tone: "info", desc: "بريدك مؤكَّد! يراجع فريق الإدارة بياناتك حالياً لاعتماد عضويتك." },
  approved: { label: "عضو موثق ونشط", tone: "ok", desc: "حسابك موثق بالكامل؛ يمكنك خوض الاختبارات، حفظ درجاتك، ومشاركة أبحاثك." },
  restricted_publish: { label: "مقيّد النشر مؤقتاً", tone: "warn", desc: "يمكنك القراءة وأداء الاختبارات، بينما أُوقف إرسال المساهمات الجديدة مؤقتاً." },
  restricted_readonly: { label: "تصفح وقراءة فقط", tone: "warn", desc: "يمكنك تصفح المنصة والاطلاع على سجلك، مع تقييد مؤقت للاختبارات والمساهمات." },
  hidden_profile: { label: "موثق (ملف عام مخفي)", tone: "info", desc: "حسابك نشط داخلياً، مع إخفاء بطاقتك العامة عن الزوار." },
  suspended: { label: "حساب معلّق مؤقتاً", tone: "danger", desc: "تم تعليق الحساب مؤقتاً من قِبل الإدارة. يمكنك التواصل مع الدعم الفني للاستفسار أو الاعتراض." },
  rejected: { label: "يحتاج استكمال بيانات", tone: "danger", desc: "لم يُعتمد الطلب بعد. يرجى مراجعة الملاحظة وتحديث بياناتك لإعادة الإرسال." },
  terminated: { label: "حساب مشطوب نهائياً", tone: "danger", desc: "تم شطب هذا الحساب نهائياً بقرار من الإدارة العليا." }
};

/* ============================================================================
 * 9. تطبيق الهوية، الشريط العلوي المتوازن، الصفحات التعريفية، والدعم العائم
 * ============================================================================ */
function applyGlobalShell() {
  const s = state.settings;
  if (s.themeAccent) {
    document.documentElement.style.setProperty("--accent", s.themeAccent);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", s.themeAccent);
  }

  const brandTitle = document.getElementById("brand-title");
  const brandSub = document.getElementById("brand-subtitle");
  const logoWrap = document.getElementById("brand-logo-wrap");
  if (brandTitle) brandTitle.textContent = s.siteName;
  if (brandSub) brandSub.textContent = s.siteSubtitle;

  if (logoWrap) {
    if (s.logoUrl) {
      logoWrap.innerHTML = `<img src="${escapeHtml(s.logoUrl)}" alt="${escapeHtml(s.siteName)}" class="brand-logo-img" />`;
      document.querySelector('link[rel="icon"]')?.setAttribute("href", s.logoUrl);
    } else {
      logoWrap.textContent = (s.siteName || "ل").trim()[0] || "ل";
    }
  }

  const searchState = getFeatureState("globalSearch");
  const searchBtn = document.getElementById("header-search-btn");
  if (searchBtn) searchBtn.hidden = searchState === "off";

  const supportState = getFeatureState("supportChat");
  const supportFab = document.getElementById("support-fab");
  if (supportFab) supportFab.hidden = supportState === "off";

  const annBar = document.getElementById("app-announcement");
  if (annBar) {
    if (getFeatureState("announcements") === "on" && s.announcementText?.trim()) {
      annBar.innerHTML = `<div class="container announcement-inner"><span class="ann-ornament">❖</span><span>${escapeHtml(s.announcementText)}</span></div>`;
      annBar.hidden = false;
    } else {
      annBar.hidden = true;
    }
  }

  const footerText = document.getElementById("footer-text");
  if (footerText) footerText.textContent = s.footerText;

  const footerPagesNav = document.getElementById("footer-pages-nav");
  if (footerPagesNav) {
    if (getFeatureState("staticPages") === "off") {
      footerPagesNav.innerHTML = "";
    } else {
      const visiblePages = state.pages.filter((p) => p.visible !== false);
      footerPagesNav.innerHTML = visiblePages.map((p) =>
        `<button type="button" class="footer-page-link" data-open-page="${escapeHtml(p.slug || p.id)}">${escapeHtml(p.title)}</button>`
      ).join("");
      footerPagesNav.querySelectorAll("[data-open-page]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (getFeatureState("staticPages") === "soon") {
            showComingSoonModal("الصفحات التعريفية");
            return;
          }
          navigateTo({ view: "page", pageSlug: btn.dataset.openPage });
        });
      });
    }
  }

  const footerSocials = document.getElementById("footer-socials");
  if (footerSocials) {
    const links = [];
    const socialMap = { twitter: "X / تويتر", telegram: "تيليجرام", youtube: "يوتيوب", facebook: "فيسبوك" };
    Object.entries(socialMap).forEach(([key, label]) => {
      if (s.socialLinks?.[key]) {
        links.push(`<a href="${escapeHtml(s.socialLinks[key])}" target="_blank" rel="noopener noreferrer" class="footer-social-pill">${label}</a>`);
      }
    });
    if (s.contactEmail) {
      links.push(`<a href="mailto:${escapeHtml(s.contactEmail)}" class="footer-social-pill">بريد المنصة</a>`);
    }
    footerSocials.innerHTML = links.join("");
  }

  updateHeaderAccountUi();
}

function updateHeaderAccountUi() {
  const accBtn = document.getElementById("header-account-btn");
  if (!accBtn) return;

  const accState = getFeatureState("studentAccounts");
  if (accState === "off") {
    accBtn.hidden = true;
    return;
  }
  accBtn.hidden = false;

  const unreadCount = state.studentNotifications.filter((n) => !n.read).length;

  if (state.authUser && state.studentProfile) {
    accBtn.className = "icon-glass-btn account-pill-btn signed-in";
    accBtn.innerHTML = `
      ${renderAvatarHtml(state.studentProfile.avatarUrl, state.studentProfile.fullName, "xs")}
      <span class="btn-label">${escapeHtml(state.studentProfile.fullName.split(" ")[0])}</span>
      ${unreadCount > 0 ? `<span class="notif-dot" aria-label="${unreadCount} إشعار جديد">${unreadCount}</span>` : ""}
    `;
  } else if (state.authUser) {
    accBtn.className = "icon-glass-btn account-pill-btn";
    accBtn.innerHTML = `${ICONS.user}<span class="btn-label">إكمال الملف</span>`;
  } else {
    accBtn.className = "icon-glass-btn account-pill-btn";
    accBtn.innerHTML = `${ICONS.user}<span class="btn-label">حسابي</span>`;
  }
}

/* ============================================================================
 * 10. التوجيه النظيف (Router)
 * ============================================================================ */
function parseRouteFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get("item");
  const quizId = params.get("quiz");
  const sectionId = params.get("section");
  const pageSlug = params.get("page");
  const studentUid = params.get("student");
  const viewParam = params.get("view");
  const branch = params.get("branch") || "الكل";

  if (viewParam === "profile") {
    state.route = { view: "profile", sectionId: null, branch: "الكل", itemId: null, quizId: null, pageSlug: null, studentUid: null, searchQuery: "" };
  } else if (studentUid) {
    state.route = { view: "student", sectionId: null, branch: "الكل", itemId: null, quizId: null, pageSlug: null, studentUid, searchQuery: "" };
  } else if (pageSlug) {
    state.route = { view: "page", sectionId: null, branch: "الكل", itemId: null, quizId: null, pageSlug, studentUid: null, searchQuery: "" };
  } else if (itemId) {
    state.route = { view: "item", sectionId: sectionId || null, branch, itemId, quizId: null, pageSlug: null, studentUid: null, searchQuery: "" };
  } else if (quizId) {
    state.route = { view: "quiz", sectionId: "quiz", branch, itemId: null, quizId, pageSlug: null, studentUid: null, searchQuery: "" };
  } else if (sectionId && state.settings.sectionsMeta[sectionId]) {
    state.route = { view: "section", sectionId, branch, itemId: null, quizId: null, pageSlug: null, studentUid: null, searchQuery: "" };
  } else {
    state.route = { view: "home", sectionId: null, branch: "الكل", itemId: null, quizId: null, pageSlug: null, studentUid: null, searchQuery: "" };
  }
}

function navigateTo(routeUpdate, push = true) {
  cleanupVideoObserver();
  state.activeQuizSession = null;
  state.route = { ...state.route, ...routeUpdate };

  const params = new URLSearchParams();
  if (state.route.view === "profile") {
    params.set("view", "profile");
  } else if (state.route.view === "student" && state.route.studentUid) {
    params.set("student", state.route.studentUid);
  } else if (state.route.view === "page" && state.route.pageSlug) {
    params.set("page", state.route.pageSlug);
  } else if (state.route.view === "section" && state.route.sectionId) {
    params.set("section", state.route.sectionId);
    if (state.route.branch && state.route.branch !== "الكل") params.set("branch", state.route.branch);
  } else if (state.route.view === "item" && state.route.itemId) {
    if (state.route.sectionId) params.set("section", state.route.sectionId);
    params.set("item", state.route.itemId);
  } else if (state.route.view === "quiz" && state.route.quizId) {
    params.set("section", "quiz");
    params.set("quiz", state.route.quizId);
  }

  const qs = params.toString();
  const nextUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  if (push) window.history.pushState({ ...state.route }, "", nextUrl);

  renderCurrentView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ============================================================================
 * 11. عرض الشاشات الرئيسية والفرعية
 * ============================================================================ */
function getVisibleSections() {
  return Object.values(state.settings.sectionsMeta)
    .filter((sec) => getFeatureState(sec.featureKey) !== "off")
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

function countItemsInSection(sectionId) {
  if (sectionId === "quiz") return state.quizzes.length;
  return state.items.filter((it) => it.sectionId === sectionId).length;
}

function renderCurrentView() {
  const main = document.getElementById("app-main");
  if (!main) return;

  if (state.loading) {
    main.innerHTML = `
      <div class="container loading-shell">
        <div class="glass-card skeleton-hero"></div>
        <div class="sections-grid">${Array(6).fill('<div class="glass-card skeleton-box"></div>').join("")}</div>
      </div>`;
    return;
  }

  switch (state.route.view) {
    case "section": return renderSectionView(main, state.route.sectionId);
    case "item": return renderItemDetailView(main, state.route.itemId);
    case "quiz": return renderQuizPlayerView(main, state.route.quizId);
    case "page": return renderStaticPageView(main, state.route.pageSlug);
    case "profile": return renderStudentDashboardView(main);
    case "student": return renderPublicStudentView(main, state.route.studentUid);
    default: return renderHomeView(main);
  }
}

/* ---------- 11.1 الواجهة الرئيسية ---------- */
function renderHomeView(container) {
  const s = state.settings;
  const sections = getVisibleSections();
  const searchState = getFeatureState("globalSearch");
  const statsState = getFeatureState("statsBar");

  updateSEO({
    title: "",
    description: `${s.siteSubtitle} — ${s.siteTagline}`,
    image: s.logoUrl || ""
  });

  const totalResources = state.items.length + state.quizzes.length;

  container.innerHTML = `
    <section class="hero-section container">
      <div class="glass-hero heritage-frame">
        <div class="hero-ornament-line" aria-hidden="true"><span>✦</span></div>
        <span class="hero-pill">${ICONS.sparkles} ${escapeHtml(s.audienceBadge)}</span>
        <h1 class="hero-title">${escapeHtml(s.siteName)}</h1>
        <p class="hero-subtitle">${escapeHtml(s.siteSubtitle)}</p>
        <p class="hero-tagline">${escapeHtml(s.siteTagline)}</p>

        ${searchState !== "off" ? `
          <div class="hero-search-trigger-wrap">
            <button type="button" class="hero-search-bar" id="hero-open-search" aria-label="البحث الذكي في المنصة">
              <span class="search-icon">${ICONS.search}</span>
              <span class="search-placeholder">ابحث بذكاء في الكتب، المصطلحات، المحاضرات...</span>
              <kbd class="search-kbd">/</kbd>
            </button>
          </div>
        ` : ""}

        ${statsState === "on" ? `
          <div class="hero-stats">
            <div class="stat-pill"><strong>${sections.length}</strong><span>أقسام</span></div>
            <div class="stat-pill"><strong>${totalResources}</strong><span>مادة لسانية</span></div>
            <div class="stat-pill"><strong>${state.quizzes.length}</strong><span>اختبارات</span></div>
          </div>
        ` : ""}
      </div>
    </section>

    <section class="container sections-wrapper" aria-label="أقسام منصة لسان">
      <div class="section-heading-row">
        <div>
          <h2 class="section-main-heading">أقسام المنصة</h2>
          <p class="section-sub-heading">بنية معرفية مرتّبة — افتح القسم لاستكشاف فروعه بهدوء.</p>
        </div>
      </div>

      <div class="sections-grid">
        ${sections.map((sec, idx) => {
          const fState = getFeatureState(sec.featureKey);
          const isSoon = fState === "soon";
          const count = countItemsInSection(sec.id);
          const branchesPreview = (sec.branches || []).slice(0, 2);
          return `
            <article class="glass-card section-box heritage-card stagger-in ${isSoon ? "is-soon-card" : ""}"
              style="--stagger: ${idx}; --sec-accent: ${sec.accent || '#0071e3'}"
              data-open-section="${sec.id}" data-sec-state="${fState}" tabindex="0" role="button">
              <div class="section-box-top">
                <div class="section-icon-badge" style="--sec-accent: ${sec.accent || '#0071e3'}">
                  ${ICONS[sec.icon] || ICONS.book}
                </div>
                <span class="section-count-badge ${isSoon ? "soon-pill" : ""}">${isSoon ? "قريباً" : count}</span>
              </div>
              <h3 class="section-box-title">${escapeHtml(sec.title)}</h3>
              <p class="section-box-desc">${escapeHtml(sec.shortDesc)}</p>
              <div class="section-mini-branches">
                ${branchesPreview.map((b) => `<span class="mini-branch-chip">${escapeHtml(b)}</span>`).join("")}
                ${(sec.branches || []).length > 2 ? `<span class="mini-branch-chip more">+${sec.branches.length - 2}</span>` : ""}
              </div>
              <div class="section-box-footer">
                <span>${isSoon ? "سيتوفر قريباً" : "استكشاف"}</span>
                <span class="arrow-icon">${ICONS.arrowLeft}</span>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;

  container.querySelectorAll("[data-open-section]").forEach((card) => {
    const open = () => {
      if (card.dataset.secState === "soon") {
        const sec = state.settings.sectionsMeta[card.dataset.openSection];
        showComingSoonModal(sec?.title || "هذا القسم");
        return;
      }
      navigateTo({ view: "section", sectionId: card.dataset.openSection, branch: "الكل" });
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });

  document.getElementById("hero-open-search")?.addEventListener("click", () => {
    if (searchState === "soon") showComingSoonModal("محرك البحث الذكي");
    else openGlobalSearchModal();
  });
}

/* ---------- 11.2 واجهة القسم الداخلي ---------- */
function renderSectionView(container, sectionId) {
  const sec = state.settings.sectionsMeta[sectionId];
  const fState = sec ? getFeatureState(sec.featureKey) : "off";
  if (!sec || fState === "off") {
    navigateTo({ view: "home" }, false);
    return;
  }
  if (fState === "soon") {
    showComingSoonModal(sec.title);
    navigateTo({ view: "home" }, false);
    return;
  }

  updateSEO({
    title: sec.title,
    description: sec.shortDesc,
    schemaData: {
      "@context": "https://schema.org", "@type": "CollectionPage",
      name: sec.title, description: sec.shortDesc, url: window.location.href, inLanguage: "ar"
    }
  });

  const branches = ["الكل", ...(sec.branches || [])];
  const isQuizSection = sectionId === "quiz";
  const isDictionary = sectionId === "dictionary";
  const isExchange = sectionId === "exchange";
  const subFeatureState = getFeatureState("studentSubmissions");

  container.innerHTML = `
    <div class="container section-page">
      <nav class="breadcrumb-bar" aria-label="مسار التنقل">
        <button type="button" class="crumb-btn" id="back-home-btn">${ICONS.arrowRight} الرئيسية</button>
        <span class="crumb-sep">/</span>
        <span class="crumb-current">${escapeHtml(sec.title)}</span>
      </nav>

      <header class="glass-card section-banner heritage-frame" style="--sec-accent: ${sec.accent || '#0071e3'}">
        <div class="section-banner-content">
          <div class="section-icon-badge large">${ICONS[sec.icon] || ICONS.book}</div>
          <div>
            <h1 class="section-page-title">${escapeHtml(sec.title)}</h1>
            <p class="section-page-desc">${escapeHtml(sec.shortDesc)}</p>
          </div>
        </div>
        ${isExchange && subFeatureState !== "off" ? `
          <button type="button" class="btn-primary-glass" id="open-submission-btn">
            ${ICONS.plus} شارك مشروعك أو تجربتك
          </button>
        ` : ""}
      </header>

      ${isQuizSection && !state.authUser && getFeatureState("studentAccounts") === "on" ? `
        <div class="light-guide-banner">
          <span>💡 <strong>توجيه لطيف:</strong> يمكنك خوض الاختبارات مباشرة، أو <button type="button" class="inline-link-btn" id="guide-login-quiz">تسجيل الدخول بحساب طالب موثق</button> لحفظ درجاتك تلقائياً في سجلك الأكاديمي.</span>
        </div>
      ` : ""}

      <div class="section-controls-bar glass-panel">
        <div class="branch-tabs" role="tablist">
          ${branches.map((b) => `
            <button type="button" role="tab" class="branch-tab ${state.route.branch === b ? "active" : ""}" data-branch="${escapeHtml(b)}">${escapeHtml(b)}</button>
          `).join("")}
        </div>
        <div class="local-search-box">
          <span class="search-icon">${ICONS.search}</span>
          <input type="search" id="section-smart-search" placeholder="ابحث داخل ${escapeHtml(sec.title)}..." value="${escapeHtml(state.route.searchQuery || "")}" autocomplete="off" />
        </div>
      </div>

      <div id="section-results-grid" class="${isDictionary ? "dictionary-list" : "cards-grid"}"></div>
    </div>
  `;

  document.getElementById("back-home-btn")?.addEventListener("click", () => navigateTo({ view: "home", sectionId: null, branch: "الكل" }));
  document.getElementById("guide-login-quiz")?.addEventListener("click", () => openAuthModal("login"));
  document.getElementById("open-submission-btn")?.addEventListener("click", handleOpenSubmissionClick);

  const searchInput = document.getElementById("section-smart-search");
  const updateGrid = () => {
    const q = searchInput ? searchInput.value : "";
    state.route.searchQuery = q;
    const grid = document.getElementById("section-results-grid");
    if (!grid) return;

    if (isQuizSection) {
      let list = state.quizzes;
      if (state.route.branch !== "الكل") list = list.filter((x) => x.branch === state.route.branch);
      renderQuizzesGrid(grid, smartSearchItems(q, list));
    } else {
      let list = state.items.filter((it) => it.sectionId === sectionId);
      if (state.route.branch !== "الكل") list = list.filter((it) => it.branch === state.route.branch);
      list = smartSearchItems(q, list);
      if (isDictionary) renderDictionaryList(grid, list);
      else renderItemsCardsGrid(grid, list, sec);
    }
  };

  container.querySelectorAll(".branch-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      container.querySelectorAll(".branch-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      state.route.branch = tab.dataset.branch;
      const params = new URLSearchParams({ section: sectionId });
      if (state.route.branch !== "الكل") params.set("branch", state.route.branch);
      window.history.replaceState({ ...state.route }, "", `${window.location.pathname}?${params.toString()}`);
      updateGrid();
    });
  });

  searchInput?.addEventListener("input", updateGrid);
  updateGrid();
}

function renderItemsCardsGrid(grid, list, sec) {
  if (!list.length) {
    grid.innerHTML = `<div class="glass-card empty-state"><p>لا توجد مواد مطابقة في هذا الفرع حالياً.</p></div>`;
    return;
  }

  grid.innerHTML = list.map((item, idx) => {
    const hasVideo = Boolean(extractYouTubeId(item.youtubeUrl));
    const hasPdf = Boolean(item.pdfUrl);
    return `
      <article class="glass-card content-card heritage-card stagger-in"
        style="--stagger: ${Math.min(idx, 10)}" data-open-item="${escapeHtml(item.id)}" tabindex="0" role="button">
        ${item.coverUrl ? `<div class="content-card-media"><img src="${escapeHtml(item.coverUrl)}" alt="${escapeHtml(item.title)}" loading="lazy" /></div>` : ""}
        <div class="content-card-body">
          <div class="card-meta-row">
            <span class="branch-badge">${escapeHtml(item.branch || sec.title)}</span>
            <div class="media-badges">
              ${hasVideo ? `<span class="type-pill video">${ICONS.video} فيديو</span>` : ""}
              ${hasPdf ? `<span class="type-pill pdf">${ICONS.pdf} PDF</span>` : ""}
            </div>
          </div>
          <h3 class="content-card-title">${escapeHtml(item.title)}</h3>
          ${item.studentUid && item.studentName ? `
            <button type="button" class="author-mini-chip" data-open-student="${escapeHtml(item.studentUid)}">
              ${renderAvatarHtml(item.studentAvatar, item.studentName, "xxs")}
              <span>${escapeHtml(item.studentName)}</span>
              <span class="verified-mini">${ICONS.verified}</span>
            </button>
          ` : (item.subtitle ? `<p class="content-card-sub">${escapeHtml(item.subtitle)}</p>` : "")}
          <p class="content-card-summary">${escapeHtml(item.summary || stripHtml(item.bodyHtml).slice(0, 120))}</p>
          <div class="content-card-footer">
            <span class="meta-stat">${ICONS.eye} ${item.views || 0}</span>
            <span class="read-more-link">قراءة ${ICONS.arrowLeft}</span>
          </div>
        </div>
      </article>
    `;
  }).join("");

  grid.querySelectorAll("[data-open-student]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      navigateTo({ view: "student", studentUid: btn.dataset.openStudent });
    });
  });

  grid.querySelectorAll("[data-open-item]").forEach((card) => {
    const open = () => navigateTo({ view: "item", sectionId: sec.id, itemId: card.dataset.openItem });
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });
}

function renderDictionaryList(grid, list) {
  if (!list.length) {
    grid.innerHTML = `<div class="glass-card empty-state"><p>لم يُعثر على مصطلح مطابق لبحثك.</p></div>`;
    return;
  }
  grid.innerHTML = list.map((term, idx) => `
    <article class="glass-card term-card heritage-card stagger-in"
      style="--stagger: ${Math.min(idx, 10)}" data-open-item="${escapeHtml(term.id)}" tabindex="0" role="button">
      <div class="term-card-header">
        <div>
          <h3 class="term-title">${escapeHtml(term.title)}</h3>
          ${term.subtitle ? `<span class="term-en" dir="ltr">${escapeHtml(term.subtitle)}</span>` : ""}
        </div>
        <span class="branch-badge">${escapeHtml(term.branch || "معجم")}</span>
      </div>
      <p class="term-brief">${escapeHtml(term.summary || stripHtml(term.bodyHtml).slice(0, 150))}</p>
      <div class="term-footer">
        <div class="tags-inline">${(term.tags || []).slice(0, 2).map((tg) => `<span class="tag-chip">#${escapeHtml(tg)}</span>`).join("")}</div>
        <span class="read-more-link">التفاصيل ${ICONS.arrowLeft}</span>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("[data-open-item]").forEach((card) => {
    const open = () => navigateTo({ view: "item", sectionId: "dictionary", itemId: card.dataset.openItem });
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });
}

function renderQuizzesGrid(grid, list) {
  if (!list.length) {
    grid.innerHTML = `<div class="glass-card empty-state"><p>لا توجد اختبارات مضافة في هذا الفرع بعد.</p></div>`;
    return;
  }
  grid.innerHTML = list.map((q, idx) => `
    <article class="glass-card quiz-card heritage-card stagger-in"
      style="--stagger: ${Math.min(idx, 10)}" data-open-quiz="${escapeHtml(q.id)}" tabindex="0" role="button">
      <div class="card-meta-row">
        <span class="branch-badge">${escapeHtml(q.branch || "اختبار")}</span>
        <span class="difficulty-pill">${escapeHtml(q.difficulty || "متوسط")}</span>
      </div>
      <h3 class="content-card-title">${escapeHtml(q.title)}</h3>
      <p class="content-card-summary">${escapeHtml(q.description || "")}</p>
      <div class="content-card-footer">
        <span class="meta-stat">${(q.questions || []).length} أسئلة</span>
        <span class="read-more-link">ابدأ ${ICONS.arrowLeft}</span>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("[data-open-quiz]").forEach((card) => {
    const open = () => handleStartQuizClick(card.dataset.openQuiz);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });
}

/* ---------- 11.3 صفحة القراءة الأكاديمية ---------- */
function renderItemDetailView(container, itemId) {
  const item = state.items.find((x) => x.id === itemId);
  if (!item) {
    container.innerHTML = `<div class="container"><div class="glass-card empty-state"><h2>المادة غير موجودة أو تم نقلها</h2><button type="button" class="btn-primary-glass" id="go-home-404">العودة للرئيسية</button></div></div>`;
    document.getElementById("go-home-404")?.addEventListener("click", () => navigateTo({ view: "home" }));
    return;
  }

  const sec = state.settings.sectionsMeta[item.sectionId] || state.settings.sectionsMeta.library;
  const ytId = extractYouTubeId(item.youtubeUrl);
  const pdfEmbed = buildPdfEmbedUrl(item.pdfUrl);
  const readMins = estimateReadingMinutes(item.bodyHtml);
  const safeHtml = sanitizeAndLinkifyHtml(item.bodyHtml || "");
  const fontCtrlState = getFeatureState("fontControls");
  const warmState = getFeatureState("warmPaperMode");
  const shareState = getFeatureState("shareButtons");
  const isWarm = warmState === "on" && state.warmPaperActive;

  if (!item.isDemo) {
    const viewKey = `lisan_viewed_${item.id}`;
    if (!sessionStorage.getItem(viewKey)) {
      sessionStorage.setItem(viewKey, "1");
      item.views = (item.views || 0) + 1;
      updateDoc(doc(db, "items", item.id), { views: increment(1) }).catch(() => {});
    }
  }

  updateSEO({
    title: item.title,
    description: item.summary || stripHtml(item.bodyHtml).slice(0, 155),
    image: item.coverUrl || state.settings.logoUrl || "",
    type: "article"
  });

  container.innerHTML = `
    <article class="container reader-page">
      <nav class="breadcrumb-bar">
        <button type="button" class="crumb-btn" id="crumb-home">${ICONS.arrowRight} الرئيسية</button>
        <span class="crumb-sep">/</span>
        <button type="button" class="crumb-btn" id="crumb-sec">${escapeHtml(sec.title)}</button>
        <span class="crumb-sep">/</span>
        <span class="crumb-current">${escapeHtml(item.branch || "")}</span>
      </nav>

      <div class="glass-card reader-shell heritage-frame ${isWarm ? "warm-paper" : ""}" id="reader-shell-card">
        <header class="reader-header">
          <div class="reader-top-badges">
            <span class="branch-badge">${escapeHtml(item.branch || sec.title)}</span>
            ${item.createdAt ? `<span class="meta-stat">${formatArabicDate(item.createdAt)}</span>` : ""}
            <span class="meta-stat">${ICONS.clock} ${readMins} د قراءة</span>
            <span class="meta-stat">${ICONS.eye} ${item.views || 0}</span>
          </div>

          <h1 class="reader-title">${escapeHtml(item.title)}</h1>
          ${item.studentUid && item.studentName ? `
            <button type="button" class="author-reader-card" id="reader-open-student" data-uid="${escapeHtml(item.studentUid)}">
              ${renderAvatarHtml(item.studentAvatar, item.studentName, "sm")}
              <div>
                <strong>${escapeHtml(item.studentName)} <span class="verified-inline">${ICONS.verified}</span></strong>
                <span>انقر لعرض الملف الأكاديمي العام للطالب</span>
              </div>
            </button>
          ` : (item.subtitle ? `<p class="reader-subtitle">${escapeHtml(item.subtitle)}</p>` : "")}
          ${item.summary ? `<p class="reader-lead">${escapeHtml(item.summary)}</p>` : ""}

          <div class="reader-toolbar">
            <div class="toolbar-cluster">
              ${fontCtrlState === "on" ? `
                <div class="font-controls">
                  <button type="button" class="tool-btn" id="font-dec">A-</button>
                  <span class="font-size-label" id="font-size-val">${state.readerFontSize}px</span>
                  <button type="button" class="tool-btn" id="font-inc">A+</button>
                </div>
              ` : ""}
              ${warmState !== "off" ? `
                <button type="button" class="tool-btn ${isWarm ? "active-toggle" : ""}" id="warm-paper-btn">
                  ${ICONS.paper} <span>ورق دافئ</span>
                </button>
              ` : ""}
            </div>
            ${shareState !== "off" ? `<button type="button" class="tool-btn" id="share-item-btn">${ICONS.share} مشاركة</button>` : ""}
          </div>
        </header>

        ${item.coverUrl ? `<figure class="reader-cover"><img src="${escapeHtml(item.coverUrl)}" alt="${escapeHtml(item.title)}" class="zoomable-img" /></figure>` : ""}

        ${ytId ? `
          <section class="smart-video-section">
            <div class="smart-player-frame" data-smart-yt="${ytId}">
              <iframe id="yt-iframe-${ytId}" src="https://www.youtube.com/embed/${ytId}?enablejsapi=1&rel=0&modestbranding=1" title="${escapeHtml(item.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>
            </div>
            <div class="smart-player-controls">
              <div class="player-btn-group">
                <button type="button" class="tool-btn" data-yt-cmd="playVideo" data-yt-target="yt-iframe-${ytId}">تشغيل</button>
                <button type="button" class="tool-btn" data-yt-cmd="pauseVideo" data-yt-target="yt-iframe-${ytId}">إيقاف مؤقت</button>
              </div>
              <span class="smart-player-note" id="yt-status-${ytId}">يتوقف الفيديو تلقائياً عند التمرير بعيداً عنه</span>
            </div>
          </section>
        ` : ""}

        ${safeHtml.trim() ? `<div class="academic-prose" id="academic-prose-body" style="font-size: ${state.readerFontSize}px">${safeHtml}</div>` : ""}

        ${pdfEmbed ? `
          <section class="smart-pdf-section">
            <div class="pdf-toolbar">
              <div class="pdf-title-wrap">${ICONS.pdf} <strong>الوثيقة المرفقة (قارئ PDF)</strong></div>
              <a href="${escapeHtml(item.pdfUrl)}" target="_blank" rel="noopener noreferrer" class="tool-btn lisan-auto-link">${ICONS.external} فتح مستقل</a>
            </div>
            <div class="pdf-frame-wrap"><iframe src="${escapeHtml(pdfEmbed)}" title="PDF" loading="lazy" allowfullscreen></iframe></div>
          </section>
        ` : ""}

        ${item.externalUrl ? `
          <div class="external-resource-box">
            <div><strong>رابط المرجع أو المصدر الخارجي</strong><p>${escapeHtml(item.externalUrl)}</p></div>
            <a href="${escapeHtml(item.externalUrl)}" target="_blank" rel="noopener noreferrer" class="btn-primary-glass lisan-auto-link">${ICONS.external} الانتقال للمصدر</a>
          </div>
        ` : ""}

        ${item.tags?.length ? `<footer class="reader-tags">${item.tags.map((tg) => `<span class="tag-chip">#${escapeHtml(tg)}</span>`).join("")}</footer>` : ""}
      </div>
    </article>
  `;

  document.getElementById("crumb-home")?.addEventListener("click", () => navigateTo({ view: "home" }));
  document.getElementById("crumb-sec")?.addEventListener("click", () => navigateTo({ view: "section", sectionId: sec.id, branch: "الكل" }));
  document.getElementById("reader-open-student")?.addEventListener("click", (e) => {
    navigateTo({ view: "student", studentUid: e.currentTarget.dataset.uid });
  });

  const prose = document.getElementById("academic-prose-body");
  const sizeVal = document.getElementById("font-size-val");
  document.getElementById("font-inc")?.addEventListener("click", () => {
    state.readerFontSize = Math.min(26, state.readerFontSize + 2);
    localStorage.setItem("lisan_font_size", String(state.readerFontSize));
    if (prose) prose.style.fontSize = `${state.readerFontSize}px`;
    if (sizeVal) sizeVal.textContent = `${state.readerFontSize}px`;
  });
  document.getElementById("font-dec")?.addEventListener("click", () => {
    state.readerFontSize = Math.max(14, state.readerFontSize - 2);
    localStorage.setItem("lisan_font_size", String(state.readerFontSize));
    if (prose) prose.style.fontSize = `${state.readerFontSize}px`;
    if (sizeVal) sizeVal.textContent = `${state.readerFontSize}px`;
  });

  const warmBtn = document.getElementById("warm-paper-btn");
  const shellCard = document.getElementById("reader-shell-card");
  warmBtn?.addEventListener("click", () => {
    if (warmState === "soon") { showComingSoonModal("وضع الورق الدافئ"); return; }
    state.warmPaperActive = !state.warmPaperActive;
    localStorage.setItem("lisan_warm_paper", state.warmPaperActive ? "1" : "0");
    shellCard?.classList.toggle("warm-paper", state.warmPaperActive);
    warmBtn.classList.toggle("active-toggle", state.warmPaperActive);
  });

  shellCard?.querySelectorAll(".zoomable-img").forEach((img) => {
    img.addEventListener("click", () => {
      const cap = img.closest("figure")?.querySelector("figcaption")?.textContent || img.alt || "";
      openLightbox(img.src, cap);
    });
  });

  document.getElementById("share-item-btn")?.addEventListener("click", async () => {
    if (shareState === "soon") { showComingSoonModal("مشاركة الروابط"); return; }
    if (navigator.share) { try { await navigator.share({ title: item.title, url: window.location.href }); return; } catch {} }
    try { await navigator.clipboard.writeText(window.location.href); showToast("تم نسخ رابط المادة بنجاح ✓"); }
    catch { showToast("انسخ الرابط من شريط العنوان"); }
  });

  if (ytId) setupSmartYouTubePlayers(container);
}

/* ---------- 11.4 الصفحات التعريفية المرنة ---------- */
function renderStaticPageView(container, pageSlug) {
  if (getFeatureState("staticPages") === "off") { navigateTo({ view: "home" }, false); return; }
  const page = state.pages.find((p) => (p.slug === pageSlug || p.id === pageSlug) && p.visible !== false);
  if (!page) {
    container.innerHTML = `<div class="container"><div class="glass-card empty-state"><h2>الصفحة غير متوفرة</h2><button type="button" class="btn-primary-glass" id="back-home-pg">العودة للرئيسية</button></div></div>`;
    document.getElementById("back-home-pg")?.addEventListener("click", () => navigateTo({ view: "home" }));
    return;
  }

  updateSEO({ title: page.title, description: page.subtitle || page.title });

  container.innerHTML = `
    <article class="container reader-page">
      <nav class="breadcrumb-bar">
        <button type="button" class="crumb-btn" id="pg-back-home">${ICONS.arrowRight} الرئيسية</button>
        <span class="crumb-sep">/</span>
        <span class="crumb-current">${escapeHtml(page.title)}</span>
      </nav>
      <div class="glass-card reader-shell heritage-frame">
        <header class="reader-header">
          <span class="branch-badge">صفحة تعريفية</span>
          <h1 class="reader-title" style="margin-top:12px">${escapeHtml(page.title)}</h1>
          ${page.subtitle ? `<p class="reader-lead">${escapeHtml(page.subtitle)}</p>` : ""}
        </header>
        <div class="academic-prose">${sanitizeAndLinkifyHtml(page.bodyHtml || "")}</div>
      </div>
    </article>
  `;
  document.getElementById("pg-back-home")?.addEventListener("click", () => navigateTo({ view: "home" }));
}

/* ============================================================================
 * 12. محرك الاختبارات التفاعلي + حفظ الدرجة في سجل الطالب
 * ============================================================================ */
function handleStartQuizClick(quizId) {
  const accState = getFeatureState("studentAccounts");
  if (state.settings.requireLoginForQuiz && accState === "on") {
    if (!state.authUser || !state.studentProfile) {
      showToast("يرجى تسجيل الدخول بحساب طالب موثق لأداء الاختبار وحفظ درجتك");
      openAuthModal("login");
      return;
    }
    if (["suspended", "restricted_readonly", "pending_email", "pending_review", "rejected", "terminated"].includes(state.studentProfile.status)) {
      showToast("حسابك لا يسمح بخوض الاختبارات حالياً — راجع تفاصيل حالتك في ملفك الشخصي");
      navigateTo({ view: "profile" });
      return;
    }
  } else if (state.studentProfile && ["suspended", "restricted_readonly", "terminated"].includes(state.studentProfile.status)) {
    showToast("تم تقييد خوض الاختبارات على حسابك — راجع إشعاراتك");
    navigateTo({ view: "profile" });
    return;
  }
  navigateTo({ view: "quiz", sectionId: "quiz", quizId });
}

function renderQuizPlayerView(container, quizId) {
  const quiz = state.quizzes.find((q) => q.id === quizId);
  if (!quiz || !quiz.questions?.length) {
    navigateTo({ view: "section", sectionId: "quiz", branch: "الكل" }, false);
    return;
  }
  updateSEO({ title: quiz.title, description: quiz.description || "اختبار تفاعلي" });
  state.activeQuizSession = { quiz, index: 0, answers: [], locked: false, saved: false };
  renderQuizStep(container);
}

async function saveStudentQuizResult(quiz, score, total, pct) {
  if (!state.authUser || !state.studentProfile) return;
  if (!["approved", "restricted_publish", "hidden_profile"].includes(state.studentProfile.status)) return;
  try {
    const entry = {
      studentUid: state.authUser.uid,
      studentName: state.studentProfile.fullName,
      quizId: quiz.id,
      quizTitle: quiz.title,
      branch: quiz.branch || "اختبارات",
      score,
      total,
      percentage: pct,
      createdAt: new Date().toISOString(),
      ts: serverTimestamp()
    };
    const ref = await addDoc(collection(db, "quizResults"), entry);
    state.studentResults.unshift({ id: ref.id, ...entry });
  } catch (err) {
    console.warn("Could not save quiz result:", err);
  }
}

function renderQuizStep(container) {
  const session = state.activeQuizSession;
  const { quiz, index } = session;
  const total = quiz.questions.length;

  if (index >= total) {
    const score = session.answers.filter((a) => a.correct).length;
    const pct = Math.round((score / total) * 100);
    if (!session.saved) {
      session.saved = true;
      saveStudentQuizResult(quiz, score, total, pct);
    }
    const feedback = pct >= 85 ? "أداء لساني متميز جداً!" : pct >= 60 ? "نتيجة جيدة، راجع الشروحات لتثبيت المفاهيم." : "بداية طيبة، راجع الملخصات ثم أعد المحاولة.";
    const savedNotice = state.studentProfile && ["approved", "restricted_publish", "hidden_profile"].includes(state.studentProfile.status)
      ? `<p class="light-hint ok">✓ تم حفظ هذه النتيجة تلقائياً في سجل درجاتك الخاص داخل ملفك الشخصي.</p>`
      : (getFeatureState("studentAccounts") === "on"
        ? `<p class="light-hint">💡 سجّل دخولك بحساب طالب موثق لحفظ نتائج اختباراتك القادمة في سجلك الأكاديمي.</p>`
        : "");

    container.innerHTML = `
      <div class="container quiz-page">
        <div class="glass-card quiz-result-card heritage-frame">
          <span class="hero-pill">النتيجة النهائية</span>
          <div class="score-circle">${pct}%</div>
          <h2>${escapeHtml(quiz.title)}</h2>
          <p class="quiz-result-summary">أجبت بشكل صحيح على <strong>${score}</strong> من أصل <strong>${total}</strong> أسئلة.</p>
          <p class="quiz-feedback-msg">${feedback}</p>
          ${savedNotice}

          <div class="quiz-review-list">
            ${quiz.questions.map((q, i) => {
              const ans = session.answers[i];
              return `
                <div class="review-item ${ans.correct ? "ok" : "bad"}">
                  <strong>${i + 1}. ${escapeHtml(q.question)}</strong>
                  <p>إجابتك: ${escapeHtml(q.options[ans.selected] || "—")}</p>
                  ${!ans.correct ? `<p class="correct-ans">الإجابة الصحيحة: ${escapeHtml(q.options[q.correctIndex])}</p>` : ""}
                  ${q.explanation ? `<p class="exp-note">${escapeHtml(q.explanation)}</p>` : ""}
                </div>
              `;
            }).join("")}
          </div>

          <div class="quiz-result-actions">
            <button type="button" class="btn-primary-glass" id="retry-quiz-btn">إعادة الاختبار</button>
            <button type="button" class="tool-btn" id="back-quizzes-btn">العودة لقسم الاختبارات</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById("retry-quiz-btn")?.addEventListener("click", () => renderQuizPlayerView(container, quiz.id));
    document.getElementById("back-quizzes-btn")?.addEventListener("click", () => navigateTo({ view: "section", sectionId: "quiz", branch: "الكل" }));
    return;
  }

  const currentQ = quiz.questions[index];
  const progress = Math.round((index / total) * 100);

  container.innerHTML = `
    <div class="container quiz-page">
      <nav class="breadcrumb-bar">
        <button type="button" class="crumb-btn" id="quiz-back-sec">${ICONS.arrowRight} اختبر معارفك</button>
        <span class="crumb-sep">/</span>
        <span class="crumb-current">${escapeHtml(quiz.title)}</span>
      </nav>
      <div class="glass-card quiz-box heritage-frame">
        <div class="quiz-progress-head"><span>السؤال ${index + 1} من ${total}</span><span>${progress}%</span></div>
        <div class="quiz-progress-track"><div class="quiz-progress-fill" style="width: ${progress}%"></div></div>
        <h2 class="quiz-question-text">${escapeHtml(currentQ.question)}</h2>
        <div class="quiz-options-list">
          ${currentQ.options.map((opt, oi) => `
            <button type="button" class="quiz-option-btn" data-opt="${oi}">
              <span class="opt-letter">${["أ", "ب", "ج", "د"][oi] || oi + 1}</span>
              <span>${escapeHtml(opt)}</span>
            </button>
          `).join("")}
        </div>
        <div id="quiz-instant-feedback" class="quiz-instant-feedback" hidden></div>
        <div class="quiz-nav-row">
          <button type="button" class="btn-primary-glass" id="quiz-next-btn" hidden>
            ${index + 1 === total ? "عرض النتيجة النهائية" : "السؤال التالي"} ${ICONS.arrowLeft}
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("quiz-back-sec")?.addEventListener("click", () => navigateTo({ view: "section", sectionId: "quiz", branch: "الكل" }));
  const feedbackBox = document.getElementById("quiz-instant-feedback");
  const nextBtn = document.getElementById("quiz-next-btn");

  container.querySelectorAll(".quiz-option-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (session.locked) return;
      session.locked = true;
      const chosen = Number(btn.dataset.opt);
      const isCorrect = chosen === Number(currentQ.correctIndex);
      session.answers.push({ selected: chosen, correct: isCorrect });

      container.querySelectorAll(".quiz-option-btn").forEach((b) => {
        const idx = Number(b.dataset.opt);
        b.disabled = true;
        if (idx === Number(currentQ.correctIndex)) b.classList.add("is-correct");
        else if (idx === chosen && !isCorrect) b.classList.add("is-wrong");
      });

      feedbackBox.hidden = false;
      feedbackBox.className = `quiz-instant-feedback ${isCorrect ? "ok" : "bad"}`;
      feedbackBox.innerHTML = `<strong>${isCorrect ? "إجابة صحيحة!" : "إجابة غير دقيقة"}</strong>${currentQ.explanation ? `<p>${escapeHtml(currentQ.explanation)}</p>` : ""}`;
      nextBtn.hidden = false;
    });
  });

  nextBtn?.addEventListener("click", () => {
    session.index += 1;
    session.locked = false;
    renderQuizStep(container);
  });
}

/* ============================================================================
 * 13. نظام حسابات الطلبة: التسجيل + Google + التحقق + منع المشطوبين
 * ============================================================================ */
function mapAuthError(code = "") {
  const map = {
    "auth/email-already-in-use": "هذا البريد الإلكتروني مسجل لدينا مسبقاً؛ يرجى تسجيل الدخول أو استعادة كلمة المرور.",
    "auth/invalid-email": "صيغة البريد الإلكتروني غير صحيحة.",
    "auth/weak-password": "كلمة المرور ضعيفة؛ يرجى اختيار 6 أحرف أو أرقام فأكثر.",
    "auth/user-not-found": "لا يوجد حساب مسجل بهذا البريد الإلكتروني.",
    "auth/wrong-password": "كلمة المرور غير صحيحة.",
    "auth/invalid-credential": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    "auth/popup-closed-by-user": "تم إغلاق نافذة تسجيل الدخول عبر Google قبل الإكمال.",
    "auth/popup-blocked": "حظر المتصفح النافذة المنبثقة؛ يرجى فتح الموقع في متصفح Chrome أو Safari والسماح بالنوافذ المنبثقة.",
    "auth/unauthorized-domain": "هذا النطاق غير مضاف بعد في النطاقات المصرح بها (Authorized domains) داخل إعدادات Firebase.",
    "auth/operation-not-allowed": "تسجيل الدخول بهذه الطريقة غير مفعّل في إعدادات Firebase Authentication.",
    "auth/too-many-requests": "محاولات كثيرة متتالية؛ يرجى الانتظار قليلاً ثم المحاولة."
  };
  return map[code] || "تعذر إتمام العملية حالياً، يرجى المحاولة مجدداً.";
}

function isAcademicEduEmail(email = "") {
  const e = email.toLowerCase();
  return /\.edu(\.[a-z]{2})?$|univ-|university|ac\.[a-z]{2}$/i.test(e);
}

function openAuthModal(tab = "login") {
  const accState = getFeatureState("studentAccounts");
  if (accState === "off") return;
  if (accState === "soon") { showComingSoonModal("حسابات وعضويات الطلبة"); return; }

  const idMode = state.settings.studentIdCardMode || "optional";

  openDynamicModal(
    tab === "register" ? "إنشاء حساب طالب جديد" : tab === "reset" ? "استعادة كلمة المرور" : "تسجيل الدخول لحسابك",
    `
    <div class="auth-tabs-bar">
      <button type="button" class="auth-tab-btn ${tab === "login" ? "active" : ""}" data-auth-tab="login">تسجيل الدخول</button>
      <button type="button" class="auth-tab-btn ${tab === "register" ? "active" : ""}" data-auth-tab="register">حساب طالب جديد</button>
    </div>

    ${tab !== "reset" ? `
      <button type="button" class="google-auth-btn" id="google-signin-btn">
        ${ICONS.google}
        <span>المتابعة السريعة باستخدام Google</span>
      </button>
      <p class="light-hint center">تأكيد البريد تلقائي عبر Google، ولا يمكن تسجيل نفس البريد مرتين.</p>
      <div class="or-divider"><span>أو عبر البريد الإلكتروني</span></div>
    ` : ""}

    ${tab === "login" ? `
      <form id="student-login-form" class="clean-form">
        <div class="form-group">
          <label>البريد الإلكتروني</label>
          <input type="email" id="st-login-email" required dir="ltr" placeholder="name@university.edu" />
        </div>
        <div class="form-group">
          <label>كلمة المرور</label>
          <input type="password" id="st-login-pass" required placeholder="••••••••" />
        </div>
        <div class="form-links-row">
          <button type="button" class="inline-link-btn" id="go-reset-pass">نسيت كلمة المرور؟</button>
          <button type="button" class="inline-link-btn" id="login-open-support">فقدت الوصول لحسابي؟ تواصل مع الدعم</button>
        </div>
        <div id="st-auth-err" class="auth-err-box" hidden></div>
        <button type="submit" class="btn-primary-glass full-width" id="st-login-submit">تسجيل الدخول</button>
      </form>
    ` : ""}

    ${tab === "reset" ? `
      <form id="student-reset-form" class="clean-form">
        <p class="light-hint">أدخل بريدك الإلكتروني المسجل وسنرسل لك فوراً رابطاً آمناً لإعادة تعيين كلمة المرور.</p>
        <div class="form-group">
          <label>البريد الإلكتروني</label>
          <input type="email" id="st-reset-email" required dir="ltr" placeholder="name@example.com" />
        </div>
        <div id="st-auth-err" class="auth-err-box" hidden></div>
        <button type="submit" class="btn-primary-glass full-width" id="st-reset-submit">إرسال رابط الاستعادة</button>
        <div class="form-links-row" style="margin-top:12px; justify-content:center">
          <button type="button" class="inline-link-btn" data-auth-tab="login">العودة لتسجيل الدخول</button>
          <button type="button" class="inline-link-btn" id="reset-open-support">تواصل مع الدعم الفني</button>
        </div>
      </form>
    ` : ""}

    ${tab === "register" ? `
      <form id="student-register-form" class="clean-form">
        <p class="light-hint">توجيه: بعد إنشاء الحساب سيصلك رابط تأكيد لبريدك، ثم تُراجع الإدارة بياناتك الأكاديمية لاعتماد العضوية.</p>
        <div class="form-grid-2">
          <div class="form-group">
            <label>الاسم الكامل *</label>
            <input type="text" id="st-reg-name" required placeholder="الاسم كما في البطاقة الجامعية" />
          </div>
          <div class="form-group">
            <label>البريد الإلكتروني *</label>
            <input type="email" id="st-reg-email" required dir="ltr" placeholder="name@university.edu" />
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label>كلمة المرور *</label>
            <input type="password" id="st-reg-pass" required minlength="6" placeholder="6 أحرف أو أرقام فأكثر" />
          </div>
          <div class="form-group">
            <label>المستوى الدراسي *</label>
            <select id="st-reg-level" required>
              <option value="ليسانس">ليسانس / بكالوريوس</option>
              <option value="ماستر">ماستر / ماجستير</option>
              <option value="دكتوراه">دكتوراه</option>
              <option value="باحث مستقل">باحث / مهتم باللسانيات</option>
            </select>
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label>الجامعة / الكلية *</label>
            <input type="text" id="st-reg-uni" required placeholder="مثال: جامعة الجزائر 2" />
          </div>
          <div class="form-group">
            <label>التخصص الدقيق *</label>
            <input type="text" id="st-reg-major" required placeholder="مثال: لسانيات عامة / تداولية" />
          </div>
        </div>
        <div class="form-group">
          <label>نبذة أكاديمية مختصرة (تظهر في ملفك العام)</label>
          <textarea id="st-reg-bio" rows="2" placeholder="اهتماماتك البحثية أو موضوع مذكرتك..."></textarea>
        </div>
        ${idMode !== "hidden" ? `
          <div class="form-group">
            <label>صورة البطاقة الجامعية أو شهادة التسجيل (${idMode === "required" ? "إلزامي للتوثيق *" : "اختياري لتسريع التوثيق"})</label>
            <div class="upload-row">
              <input type="url" id="st-reg-idcard" dir="ltr" readonly placeholder="اختر صورة البطاقة..." />
              <label class="tool-btn upload-trigger">${ICONS.upload} رفع البطاقة<input type="file" id="st-reg-idcard-file" accept="image/*" hidden /></label>
            </div>
            <small id="st-idcard-status" class="light-hint">🔒 سرية تامة: لا تظهر هذه الوثيقة لأي زائر، وتراها الإدارة فقط للتحقق.</small>
          </div>
        ` : ""}
        <div id="st-auth-err" class="auth-err-box" hidden></div>
        <button type="submit" class="btn-primary-glass full-width" id="st-reg-submit">إنشاء الحساب وإرسال رابط التفعيل</button>
      </form>
    ` : ""}
    `,
    tab === "register" ? "wide" : "normal"
  );

  document.querySelectorAll("[data-auth-tab]").forEach((b) => {
    b.addEventListener("click", () => openAuthModal(b.dataset.authTab));
  });
  document.getElementById("go-reset-pass")?.addEventListener("click", () => openAuthModal("reset"));
  document.getElementById("login-open-support")?.addEventListener("click", () => { closeDynamicModal(); openSupportChatModal("lost_account"); });
  document.getElementById("reset-open-support")?.addEventListener("click", () => { closeDynamicModal(); openSupportChatModal("lost_account"); });

  document.getElementById("st-reg-idcard-file")?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const stEl = document.getElementById("st-idcard-status");
    try {
      const url = await uploadImageToImgBB(file, stEl, 1000);
      document.getElementById("st-reg-idcard").value = url;
    } catch (err) {
      stEl.textContent = err.message;
    }
  });

  // الدخول السريع عبر Google (مع فحص الشطب النهائي)
  document.getElementById("google-signin-btn")?.addEventListener("click", async () => {
    const errEl = document.getElementById("st-auth-err");
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const user = cred.user;

      // فحص إن كان الحساب أو البريد مشطوباً نهائياً
      const termRec = await checkEmailTerminated(user.email || "");
      const snap = await getDoc(doc(db, "students", user.uid));
      if (termRec || (snap.exists() && snap.data().status === "terminated")) {
        const reason = (snap.exists() ? snap.data().statusReason : "") || termRec?.statusReason || "";
        await signOut(auth).catch(() => {});
        showTerminatedAccountModal(reason);
        return;
      }

      if (snap.exists()) {
        await loadStudentData(user.uid);
        closeDynamicModal();
        showToast(`أهلاً بعودتك، ${snap.data().fullName} ✓`);
        navigateTo({ view: "profile" });
      } else {
        openCompleteGoogleProfileModal(user);
      }
    } catch (err) {
      if (errEl) { errEl.textContent = mapAuthError(err.code); errEl.hidden = false; }
      else showToast(mapAuthError(err.code));
    }
  });

  // دخول بالبريد وكلمة المرور (مع فحص الشطب النهائي قبل وبعد الدخول)
  document.getElementById("student-login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errEl = document.getElementById("st-auth-err");
    const btn = document.getElementById("st-login-submit");
    const email = document.getElementById("st-login-email").value.trim();

    errEl.hidden = true;
    btn.disabled = true;
    btn.textContent = "جارٍ تسجيل الدخول...";
    try {
      const termBefore = await checkEmailTerminated(email);
      if (termBefore) {
        btn.disabled = false;
        btn.textContent = "تسجيل الدخول";
        showTerminatedAccountModal(termBefore.statusReason || "");
        return;
      }

      const cred = await signInWithEmailAndPassword(auth, email, document.getElementById("st-login-pass").value);
      const res = await loadStudentData(cred.user.uid);
      if (res?.terminated) return;

      closeDynamicModal();
      showToast("تم تسجيل الدخول بنجاح ✓");
      navigateTo({ view: "profile" });
    } catch (err) {
      errEl.textContent = mapAuthError(err.code);
      errEl.hidden = false;
      btn.disabled = false;
      btn.textContent = "تسجيل الدخول";
    }
  });

  // استعادة كلمة المرور (مع منع المشطوبين نهائياً)
  document.getElementById("student-reset-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errEl = document.getElementById("st-auth-err");
    const btn = document.getElementById("st-reset-submit");
    const email = document.getElementById("st-reset-email").value.trim();
    errEl.hidden = true;
    btn.disabled = true;
    try {
      const termRec = await checkEmailTerminated(email);
      if (termRec) {
        btn.disabled = false;
        showTerminatedAccountModal(termRec.statusReason || "");
        return;
      }
      await sendPasswordResetEmail(auth, email);
      closeDynamicModal();
      showToast("تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني ✓");
    } catch (err) {
      errEl.textContent = mapAuthError(err.code);
      errEl.hidden = false;
      btn.disabled = false;
    }
  });

  // تسجيل طالب جديد بالبريد وكلمة المرور (مع منع البريد المكرر أو المشطوب نهائياً)
  document.getElementById("student-register-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errEl = document.getElementById("st-auth-err");
    const btn = document.getElementById("st-reg-submit");
    const email = document.getElementById("st-reg-email").value.trim();
    const emailLower = email.toLowerCase();
    const idCardUrl = document.getElementById("st-reg-idcard")?.value.trim() || "";

    if (idMode === "required" && !idCardUrl) {
      errEl.textContent = "يرجى رفع صورة البطاقة الجامعية أو شهادة التسجيل لإتمام الطلب.";
      errEl.hidden = false;
      return;
    }

    errEl.hidden = true;
    btn.disabled = true;
    btn.textContent = "جارٍ إنشاء الحساب...";

    try {
      const dupSnap = await getDocs(query(collection(db, "students"), where("emailLower", "==", emailLower)));
      if (!dupSnap.empty) {
        const existingData = dupSnap.docs[0].data();
        if (existingData.status === "terminated") {
          btn.disabled = false;
          btn.textContent = "إنشاء الحساب وإرسال رابط التفعيل";
          showTerminatedAccountModal(existingData.statusReason || "");
          return;
        }
        errEl.textContent = "هذا البريد الإلكتروني مسجل لدينا مسبقاً؛ لا يمكن إنشاء حسابين بنفس البريد.";
        errEl.hidden = false;
        btn.disabled = false;
        btn.textContent = "إنشاء الحساب وإرسال رابط التفعيل";
        return;
      }

      const cred = await createUserWithEmailAndPassword(auth, email, document.getElementById("st-reg-pass").value);
      await sendEmailVerification(cred.user).catch(() => {});

      const profile = {
        uid: cred.user.uid,
        email,
        emailLower,
        fullName: document.getElementById("st-reg-name").value.trim(),
        university: document.getElementById("st-reg-uni").value.trim(),
        major: document.getElementById("st-reg-major").value.trim(),
        level: document.getElementById("st-reg-level").value,
        bio: document.getElementById("st-reg-bio").value.trim(),
        avatarUrl: "",
        idCardUrl,
        emailVerified: false,
        isEduEmail: isAcademicEduEmail(email),
        authProvider: "password",
        status: "pending_email",
        statusReason: "",
        showGradesPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, "students", cred.user.uid), profile);
      await addDoc(collection(db, "notifications"), {
        studentUid: cred.user.uid,
        type: "info",
        title: "مرحباً بك في منصة لِسَان!",
        message: "الخطوة التالية: افتح بريدك الإلكتروني واضغط على رابط التفعيل ليتم تحويل حسابك مباشرة إلى الإدارة للمراجعة.",
        read: false,
        createdAt: new Date().toISOString()
      });

      await loadStudentData(cred.user.uid);
      closeDynamicModal();
      showToast("تم إنشاء الحساب! افحص بريدك الإلكتروني لتأكيد العنوان ✓");
      navigateTo({ view: "profile" });
    } catch (err) {
      errEl.textContent = mapAuthError(err.code);
      errEl.hidden = false;
      btn.disabled = false;
      btn.textContent = "إنشاء الحساب وإرسال رابط التفعيل";
    }
  });
}

function openCompleteGoogleProfileModal(user) {
  const idMode = state.settings.studentIdCardMode || "optional";
  openDynamicModal("إكمال ملفك الأكاديمي (حساب Google)", `
    <form id="google-complete-form" class="clean-form">
      <p class="light-hint ok">✓ تم تأكيد بريدك (${escapeHtml(user.email)}) تلقائياً عبر Google! أكمل بياناتك الجامعية ليراجعها فريق الإدارة.</p>
      <div class="form-grid-2">
        <div class="form-group">
          <label>الاسم الكامل *</label>
          <input type="text" id="gc-name" required value="${escapeHtml(user.displayName || "")}" />
        </div>
        <div class="form-group">
          <label>المستوى الدراسي *</label>
          <select id="gc-level" required>
            <option value="ليسانس">ليسانس / بكالوريوس</option>
            <option value="ماستر">ماستر / ماجستير</option>
            <option value="دكتوراه">دكتوراه</option>
            <option value="باحث مستقل">باحث / مهتم باللسانيات</option>
          </select>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label>الجامعة / الكلية *</label>
          <input type="text" id="gc-uni" required placeholder="مثال: جامعة الجزائر 2" />
        </div>
        <div class="form-group">
          <label>التخصص الدقيق *</label>
          <input type="text" id="gc-major" required placeholder="مثال: لسانيات تطبيقية" />
        </div>
      </div>
      <div class="form-group">
        <label>نبذة أكاديمية مختصرة</label>
        <textarea id="gc-bio" rows="2" placeholder="اهتماماتك البحثية..."></textarea>
      </div>
      ${idMode !== "hidden" ? `
        <div class="form-group">
          <label>صورة البطاقة الجامعية (${idMode === "required" ? "إلزامي *" : "اختياري لتسريع التوثيق"})</label>
          <div class="upload-row">
            <input type="url" id="gc-idcard" dir="ltr" readonly placeholder="اختر صورة البطاقة..." />
            <label class="tool-btn upload-trigger">${ICONS.upload} رفع البطاقة<input type="file" id="gc-idcard-file" accept="image/*" hidden /></label>
          </div>
          <small id="gc-idcard-status" class="light-hint">🔒 سرية تامة للإدارة فقط.</small>
        </div>
      ` : ""}
      <button type="submit" class="btn-primary-glass full-width" id="gc-submit">إرسال الطلب للمراجعة</button>
    </form>
  `, "wide");

  document.getElementById("gc-idcard-file")?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const stEl = document.getElementById("gc-idcard-status");
    try {
      document.getElementById("gc-idcard").value = await uploadImageToImgBB(file, stEl, 1000);
    } catch (err) { stEl.textContent = err.message; }
  });

  document.getElementById("google-complete-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const idCardUrl = document.getElementById("gc-idcard")?.value.trim() || "";
    if (idMode === "required" && !idCardUrl) { showToast("يرجى رفع صورة البطاقة الجامعية"); return; }

    const email = user.email || "";
    const termRec = await checkEmailTerminated(email);
    if (termRec) {
      await signOut(auth).catch(() => {});
      showTerminatedAccountModal(termRec.statusReason || "");
      return;
    }

    const btn = document.getElementById("gc-submit");
    btn.disabled = true;
    await setDoc(doc(db, "students", user.uid), {
      uid: user.uid,
      email,
      emailLower: email.toLowerCase(),
      fullName: document.getElementById("gc-name").value.trim(),
      university: document.getElementById("gc-uni").value.trim(),
      major: document.getElementById("gc-major").value.trim(),
      level: document.getElementById("gc-level").value,
      bio: document.getElementById("gc-bio").value.trim(),
      avatarUrl: user.photoURL || "",
      idCardUrl,
      emailVerified: true,
      isEduEmail: isAcademicEduEmail(email),
      authProvider: "google",
      status: "pending_review",
      statusReason: "",
      showGradesPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    await addDoc(collection(db, "notifications"), {
      studentUid: user.uid,
      type: "info",
      title: "تم استلام طلب العضوية!",
      message: "تم تأكيد بريدك عبر Google بنجاح، وطلبك الآن قيد المراجعة لدى الإدارة.",
      read: false,
      createdAt: new Date().toISOString()
    });
    await loadStudentData(user.uid);
    closeDynamicModal();
    showToast("تم إرسال بياناتك للمراجعة بنجاح ✓");
    navigateTo({ view: "profile" });
  });
}

/* ============================================================================
 * 14. لوحة الطالب الشخصية (الخاصة به وحده) + الملف العام المختصر للزوار
 * ============================================================================ */
function renderStudentDashboardView(container) {
  if (getFeatureState("studentAccounts") !== "on") { navigateTo({ view: "home" }, false); return; }
  if (!state.authUser) {
    container.innerHTML = `
      <div class="container reader-page">
        <div class="glass-card empty-state heritage-frame">
          <h2>حساب الطالب الأكاديمي</h2>
          <p>سجّل دخولك أو أنشئ حساب طالب موثق لحفظ درجاتك ومشاركة مشاريعك البحثية.</p>
          <div style="display:flex; gap:10px; justify-content:center; margin-top:16px">
            <button type="button" class="btn-primary-glass" id="dash-login-btn">تسجيل الدخول</button>
            <button type="button" class="tool-btn" id="dash-reg-btn">إنشاء حساب جديد</button>
          </div>
        </div>
      </div>`;
    document.getElementById("dash-login-btn")?.addEventListener("click", () => openAuthModal("login"));
    document.getElementById("dash-reg-btn")?.addEventListener("click", () => openAuthModal("register"));
    return;
  }

  if (!state.studentProfile) {
    openCompleteGoogleProfileModal(state.authUser);
    return;
  }

  const p = state.studentProfile;
  if (p.status === "terminated") {
    signOut(auth).catch(() => {});
    showTerminatedAccountModal(p.statusReason || "");
    navigateTo({ view: "home" }, false);
    return;
  }

  const stInfo = STUDENT_STATUS_MAP[p.status] || STUDENT_STATUS_MAP.pending_review;
  const pubSubsCount = state.studentSubmissions.filter((x) => x.status === "published").length;
  const badges = computeStudentBadges(p, state.studentResults, pubSubsCount);
  const unreadNotifs = state.studentNotifications.filter((n) => !n.read).length;
  const pubGradesState = getFeatureState("studentPublicGrades");

  updateSEO({ title: `ملفي الشخصي — ${p.fullName}`, description: "لوحة الطالب الأكاديمية الخاصة" });

  container.innerHTML = `
    <div class="container reader-page">
      <nav class="breadcrumb-bar">
        <button type="button" class="crumb-btn" id="prof-home">${ICONS.arrowRight} الرئيسية</button>
        <span class="crumb-sep">/</span>
        <span class="crumb-current">ملفي الأكاديمي الخاص</span>
      </nav>

      <div class="status-banner-card tone-${stInfo.tone}">
        <div>
          <strong>حالة الحساب: ${stInfo.label}</strong>
          <p>${escapeHtml(p.statusReason || stInfo.desc)}</p>
        </div>
        <div class="status-banner-actions">
          ${p.status === "pending_email" ? `
            <button type="button" class="tool-btn" id="btn-check-verified">لقد أكّدت بريدي — تحديث</button>
            <button type="button" class="tool-btn" id="btn-resend-verif">إعادة إرسال الرابط</button>
          ` : ""}
          ${["suspended", "restricted_publish", "restricted_readonly", "rejected"].includes(p.status) ? `
            <button type="button" class="tool-btn" id="btn-appeal-support">${ICONS.support} تواصل مع الدعم</button>
          ` : ""}
        </div>
      </div>

      <section class="glass-card student-hero-card heritage-frame">
        <div class="student-hero-main">
          ${renderAvatarHtml(p.avatarUrl, p.fullName, "xl")}
          <div>
            <div class="student-name-row">
              <h1>${escapeHtml(p.fullName)}</h1>
              ${p.status === "approved" ? `<span class="verified-chip">${ICONS.verified} موثق</span>` : ""}
            </div>
            <p class="student-meta-sub">${escapeHtml(p.university || "")} • ${escapeHtml(p.major || "")} (${escapeHtml(p.level || "")})</p>
            <p class="student-bio-text">${escapeHtml(p.bio || "لم تُضف نبذة أكاديمية بعد.")}</p>
            <div class="badges-row">
              ${badges.map((b) => `<span class="academic-badge ${b.tone}">${b.label}</span>`).join("")}
            </div>
          </div>
        </div>
        <div class="student-hero-actions">
          ${p.status !== "hidden_profile" && p.status !== "suspended" ? `<button type="button" class="tool-btn" id="view-my-public-btn">معاينة ملفي العام</button>` : ""}
          <button type="button" class="tool-btn danger" id="student-logout-btn">تسجيل الخروج</button>
        </div>
      </section>

      <div class="glass-panel profile-tabs-bar">
        <button type="button" class="branch-tab ${state.profileTab === "overview" ? "active" : ""}" data-ptab="overview">ملخص وسجل الدرجات (${state.studentResults.length})</button>
        <button type="button" class="branch-tab ${state.profileTab === "submissions" ? "active" : ""}" data-ptab="submissions">مساهماتي (${state.studentSubmissions.length})</button>
        <button type="button" class="branch-tab ${state.profileTab === "notifications" ? "active" : ""}" data-ptab="notifications">الإشعارات ${unreadNotifs ? `(${unreadNotifs} جديد)` : ""}</button>
        <button type="button" class="branch-tab ${state.profileTab === "edit" ? "active" : ""}" data-ptab="edit">تعديل بياناتي</button>
      </div>

      <div id="profile-tab-content"></div>
    </div>
  `;

  document.getElementById("prof-home")?.addEventListener("click", () => navigateTo({ view: "home" }));
  document.getElementById("view-my-public-btn")?.addEventListener("click", () => navigateTo({ view: "student", studentUid: p.uid }));
  document.getElementById("btn-appeal-support")?.addEventListener("click", () => openSupportChatModal("account_issue"));

  document.getElementById("btn-check-verified")?.addEventListener("click", async () => {
    await state.authUser.reload();
    await loadStudentData(state.authUser.uid);
    showToast(state.authUser.emailVerified ? "تم تأكيد بريدك وتحويل طلبك للمراجعة ✓" : "لم يُؤكَّد البريد بعد — افحص البريد الوارد أو الرسائل غير المرغوب فيها");
    renderCurrentView();
  });

  document.getElementById("btn-resend-verif")?.addEventListener("click", async () => {
    try {
      await sendEmailVerification(state.authUser);
      showToast("تم إرسال رابط التفعيل مجدداً إلى بريدك ✓");
    } catch {
      showToast("انتظر دقيقة قبل طلب إرسال رابط جديد");
    }
  });

  document.getElementById("student-logout-btn")?.addEventListener("click", async () => {
    await signOut(auth);
    showToast("تم تسجيل الخروج بنجاح");
    navigateTo({ view: "home" });
  });

  container.querySelectorAll("[data-ptab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.profileTab = btn.dataset.ptab;
      renderStudentDashboardView(container);
    });
  });

  const tabBody = document.getElementById("profile-tab-content");

  if (state.profileTab === "overview") {
    const avg = state.studentResults.length
      ? Math.round(state.studentResults.reduce((s, r) => s + Number(r.percentage || 0), 0) / state.studentResults.length)
      : 0;

    tabBody.innerHTML = `
      ${pubGradesState !== "off" ? `
        <div class="glass-card privacy-toggle-card">
          <div>
            <strong>خصوصية سجل الدرجات ${pubGradesState === "soon" ? "<span class='soon-inline'>(قريباً)</span>" : ""}</strong>
            <p class="light-hint" style="margin:4px 0 0">افتراضياً لا يرى درجاتك سواك والإدارة. يمكنك اختيار كشفها في ملفك العام للزوار.</p>
          </div>
          <label class="apple-switch">
            <input type="checkbox" id="toggle-public-grades" ${p.showGradesPublic ? "checked" : ""} />
            <span class="apple-slider"></span>
          </label>
        </div>
      ` : ""}

      <div class="glass-card profile-section-card">
        <div class="card-head-flex">
          <h3>سجل درجاتي في الاختبارات</h3>
          ${state.studentResults.length ? `<span class="branch-badge">المعدل العام: ${avg}%</span>` : ""}
        </div>
        ${state.studentResults.length ? `
          <div class="transcript-list">
            ${state.studentResults.map((r) => `
              <div class="transcript-row">
                <div>
                  <strong>${escapeHtml(r.quizTitle)}</strong>
                  <small>${escapeHtml(r.branch || "")} • ${formatArabicDate(r.createdAt, true)}</small>
                </div>
                <div class="transcript-score ${Number(r.percentage) >= 85 ? "high" : ""}">
                  <strong>${r.percentage}%</strong>
                  <span>(${r.score}/${r.total})</span>
                </div>
              </div>
            `).join("")}
          </div>
        ` : `<p class="light-hint">لم تخض أي اختبار بعد. انتقل لقسم "اختبر معارفك" وستُحفظ نتائجك هنا تلقائياً.</p>`}
      </div>
    `;

    document.getElementById("toggle-public-grades")?.addEventListener("change", (e) => {
      const chk = e.target;
      if (pubGradesState === "soon") {
        chk.checked = Boolean(p.showGradesPublic);
        showComingSoonModal("إظهار الدرجات في الملف العام");
        return;
      }
      if (chk.checked) {
        chk.checked = false;
        openDynamicModal("تأكيد كشف الدرجات علناً", `
          <p><strong>هل أنت متأكد من ذلك؟</strong></p>
          <p style="color:var(--text-secondary); font-size:0.92rem">عند تفعيل هذا الخيار، سيصبح سجل درجاتك في الاختبارات مرئياً لكل من يزور ملفك الأكاديمي العام. يمكنك إخفاؤه مجدداً في أي وقت.</p>
          <div class="dialog-actions" style="margin-top:18px">
            <button type="button" class="tool-btn" id="cancel-pub-grades">إلغاء (إبقاء الدرجات خاصة)</button>
            <button type="button" class="btn-primary-glass" id="confirm-pub-grades">نعم، أؤكد إظهار درجاتي</button>
          </div>
        `, "compact");
        document.getElementById("cancel-pub-grades")?.addEventListener("click", closeDynamicModal);
        document.getElementById("confirm-pub-grades")?.addEventListener("click", async () => {
          await updateDoc(doc(db, "students", p.uid), { showGradesPublic: true });
          p.showGradesPublic = true;
          closeDynamicModal();
          showToast("تم تفعيل إظهار درجاتك في ملفك العام ✓");
          renderStudentDashboardView(container);
        });
      } else {
        updateDoc(doc(db, "students", p.uid), { showGradesPublic: false }).then(() => {
          p.showGradesPublic = false;
          showToast("تمت إعادة سجل درجاتك إلى الوضع الخاص ✓");
        });
      }
    });
  }

  else if (state.profileTab === "submissions") {
    const stLbl = { published: "منشورة", pending: "قيد المراجعة", draft: "مسودة / ملاحظة" };
    tabBody.innerHTML = `
      <div class="glass-card profile-section-card">
        <div class="card-head-flex">
          <h3>مشاريعي ومساهماتي المرسلة</h3>
          <button type="button" class="btn-primary-glass" id="dash-new-sub">${ICONS.plus} مساهمة جديدة</button>
        </div>
        ${state.studentSubmissions.length ? `
          <div class="transcript-list">
            ${state.studentSubmissions.map((it) => `
              <div class="transcript-row">
                <div>
                  <strong>${escapeHtml(it.title)}</strong>
                  <small>${escapeHtml(it.branch || "")} • ${formatArabicDate(it.createdAt)}</small>
                </div>
                <div style="display:flex; align-items:center; gap:8px">
                  <span class="branch-badge">${stLbl[it.status] || it.status}</span>
                  ${it.status === "published" ? `<button type="button" class="tool-btn" data-go-item="${it.id}">عرض</button>` : ""}
                </div>
              </div>
            `).join("")}
          </div>
        ` : `<p class="light-hint">لم ترسل أي مشروع أو تجربة بحثية بعد.</p>`}
      </div>
    `;
    document.getElementById("dash-new-sub")?.addEventListener("click", handleOpenSubmissionClick);
    tabBody.querySelectorAll("[data-go-item]").forEach((b) => {
      b.addEventListener("click", () => navigateTo({ view: "item", sectionId: "exchange", itemId: b.dataset.goItem }));
    });
  }

  else if (state.profileTab === "notifications") {
    tabBody.innerHTML = `
      <div class="glass-card profile-section-card">
        <div class="card-head-flex">
          <h3>صندوق الإشعارات والتنبيهات</h3>
          ${unreadNotifs ? `<button type="button" class="tool-btn" id="mark-all-read-btn">تحديد الكل كمقروء</button>` : ""}
        </div>
        ${state.studentNotifications.length ? `
          <div class="notifs-list">
            ${state.studentNotifications.map((n) => `
              <div class="notif-item tone-${escapeHtml(n.type || "info")} ${n.read ? "is-read" : "is-unread"}">
                <div class="notif-head">
                  <strong>${escapeHtml(n.title || "إشعار إداري")}</strong>
                  <small>${formatArabicDate(n.createdAt, true)}</small>
                </div>
                <p>${escapeHtml(n.message || "")}</p>
              </div>
            `).join("")}
          </div>
        ` : `<p class="light-hint">لا توجد إشعارات حالياً.</p>`}
      </div>
    `;
    document.getElementById("mark-all-read-btn")?.addEventListener("click", async () => {
      const unread = state.studentNotifications.filter((n) => !n.read);
      await Promise.all(unread.map((n) => updateDoc(doc(db, "notifications", n.id), { read: true }).catch(() => {})));
      state.studentNotifications.forEach((n) => { n.read = true; });
      updateHeaderAccountUi();
      renderStudentDashboardView(container);
    });
  }

  else if (state.profileTab === "edit") {
    tabBody.innerHTML = `
      <form id="student-edit-profile-form" class="glass-card profile-section-card clean-form">
        <h3>تحديث بياناتي وصورتي الشخصية</h3>
        <div class="avatar-upload-box">
          <div id="st-edit-av-preview">${renderAvatarHtml(p.avatarUrl, p.fullName, "lg")}</div>
          <div style="flex:1">
            <label class="tool-btn upload-trigger">${ICONS.upload} تغيير الصورة الشخصية<input type="file" id="st-edit-av-file" accept="image/*" hidden /></label>
            <input type="hidden" id="st-edit-av-url" value="${escapeHtml(p.avatarUrl || "")}" />
            <small id="st-edit-av-status" class="light-hint">تُضغط الصورة تلقائياً لحفظ البيانات وسرعة التصفح.</small>
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group"><label>الاسم الكامل</label><input type="text" id="st-edit-name" required value="${escapeHtml(p.fullName)}" /></div>
          <div class="form-group">
            <label>المستوى الدراسي</label>
            <select id="st-edit-level">
              ${["ليسانس", "ماستر", "دكتوراه", "باحث مستقل"].map((lv) => `<option value="${lv}" ${p.level === lv ? "selected" : ""}>${lv}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group"><label>الجامعة / الكلية</label><input type="text" id="st-edit-uni" required value="${escapeHtml(p.university || "")}" /></div>
          <div class="form-group"><label>التخصص الدقيق</label><input type="text" id="st-edit-major" required value="${escapeHtml(p.major || "")}" /></div>
        </div>
        <div class="form-group"><label>نبذة أكاديمية (تظهر للزوار)</label><textarea id="st-edit-bio" rows="3">${escapeHtml(p.bio || "")}</textarea></div>
        ${state.settings.studentIdCardMode !== "hidden" && p.status !== "approved" ? `
          <div class="form-group">
            <label>تحديث صورة البطاقة الجامعية (سرية للإدارة فقط)</label>
            <div class="upload-row">
              <input type="url" id="st-edit-idcard" dir="ltr" readonly value="${escapeHtml(p.idCardUrl || "")}" placeholder="اختر صورة..." />
              <label class="tool-btn upload-trigger">${ICONS.upload} رفع وثيقة<input type="file" id="st-edit-idcard-file" accept="image/*" hidden /></label>
            </div>
            <small id="st-edit-idcard-status" class="light-hint"></small>
          </div>
        ` : ""}
        <button type="submit" class="btn-primary-glass" id="st-save-edit-btn">حفظ التغييرات</button>
      </form>
    `;

    document.getElementById("st-edit-av-file")?.addEventListener("change", async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      try {
        const url = await uploadImageToImgBB(f, document.getElementById("st-edit-av-status"), 512);
        document.getElementById("st-edit-av-url").value = url;
        document.getElementById("st-edit-av-preview").innerHTML = renderAvatarHtml(url, p.fullName, "lg");
      } catch (err) { showToast(err.message); }
    });

    document.getElementById("st-edit-idcard-file")?.addEventListener("change", async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      try {
        document.getElementById("st-edit-idcard").value = await uploadImageToImgBB(f, document.getElementById("st-edit-idcard-status"), 1000);
      } catch (err) { showToast(err.message); }
    });

    document.getElementById("student-edit-profile-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("st-save-edit-btn");
      btn.disabled = true;
      const updates = {
        fullName: document.getElementById("st-edit-name").value.trim(),
        level: document.getElementById("st-edit-level").value,
        university: document.getElementById("st-edit-uni").value.trim(),
        major: document.getElementById("st-edit-major").value.trim(),
        bio: document.getElementById("st-edit-bio").value.trim(),
        avatarUrl: document.getElementById("st-edit-av-url").value.trim(),
        updatedAt: new Date().toISOString()
      };
      const idEl = document.getElementById("st-edit-idcard");
      if (idEl) updates.idCardUrl = idEl.value.trim();
      if (p.status === "rejected" && p.emailVerified) {
        updates.status = "pending_review";
        updates.statusReason = "";
      }
      await updateDoc(doc(db, "students", p.uid), updates);
      state.studentProfile = { ...p, ...updates };
      updateHeaderAccountUi();
      showToast("تم حفظ بياناتك بنجاح ✓");
      renderStudentDashboardView(container);
    });
  }
}

/* ---------- الملف العام المختصر للطالب ---------- */
async function renderPublicStudentView(container, studentUid) {
  container.innerHTML = `<div class="container reader-page"><div class="glass-card empty-state"><p>جارٍ تحميل البطاقة الأكاديمية...</p></div></div>`;
  try {
    const snap = await getDoc(doc(db, "students", studentUid));
    if (!snap.exists()) {
      container.innerHTML = `<div class="container reader-page"><div class="glass-card empty-state"><h3>لم يُعثر على هذا الملف</h3><button type="button" class="btn-primary-glass" id="pub-st-home">الرئيسية</button></div></div>`;
      document.getElementById("pub-st-home")?.addEventListener("click", () => navigateTo({ view: "home" }));
      return;
    }
    const st = snap.data();
    const hiddenStatuses = ["hidden_profile", "suspended", "pending_email", "pending_review", "rejected", "terminated"];
    if (st.status === "terminated" || (hiddenStatuses.includes(st.status) && state.authUser?.uid !== studentUid)) {
      container.innerHTML = `<div class="container reader-page"><div class="glass-card empty-state"><h3>هذا الملف الشخصي غير متاح للعرض العام حالياً</h3><button type="button" class="btn-primary-glass" id="pub-st-home">العودة للرئيسية</button></div></div>`;
      document.getElementById("pub-st-home")?.addEventListener("click", () => navigateTo({ view: "home" }));
      return;
    }

    const pubSubs = state.items.filter((it) => it.studentUid === studentUid);
    let pubResults = [];
    const showGrades = Boolean(st.showGradesPublic) && getFeatureState("studentPublicGrades") === "on";
    if (showGrades) {
      const rSnap = await getDocs(query(collection(db, "quizResults"), where("studentUid", "==", studentUid)));
      pubResults = rSnap.docs.map((d) => d.data()).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    }
    const badges = computeStudentBadges(st, pubResults, pubSubs.length);

    updateSEO({ title: `الملف الأكاديمي — ${st.fullName}`, description: st.bio || `${st.university} — ${st.major}` });

    container.innerHTML = `
      <div class="container reader-page">
        <nav class="breadcrumb-bar">
          <button type="button" class="crumb-btn" id="pub-st-back">${ICONS.arrowRight} الرئيسية</button>
          <span class="crumb-sep">/</span>
          <span class="crumb-current">${escapeHtml(st.fullName)}</span>
        </nav>

        <section class="glass-card student-hero-card heritage-frame">
          <div class="student-hero-main">
            ${renderAvatarHtml(st.avatarUrl, st.fullName, "xl")}
            <div>
              <div class="student-name-row">
                <h1>${escapeHtml(st.fullName)}</h1>
                <span class="verified-chip">${ICONS.verified} طالب موثق</span>
              </div>
              <p class="student-meta-sub">${escapeHtml(st.university || "")} • ${escapeHtml(st.major || "")} (${escapeHtml(st.level || "")})</p>
              ${st.bio ? `<p class="student-bio-text">${escapeHtml(st.bio)}</p>` : ""}
              <div class="badges-row">${badges.map((b) => `<span class="academic-badge ${b.tone}">${b.label}</span>`).join("")}</div>
            </div>
          </div>
        </section>

        ${showGrades && pubResults.length ? `
          <section class="glass-card profile-section-card" style="margin-top:18px">
            <h3>سجل الدرجات (مُشارك بموافقة الطالب)</h3>
            <div class="transcript-list">
              ${pubResults.map((r) => `
                <div class="transcript-row">
                  <div><strong>${escapeHtml(r.quizTitle)}</strong><small>${formatArabicDate(r.createdAt)}</small></div>
                  <div class="transcript-score"><strong>${r.percentage}%</strong><span>(${r.score}/${r.total})</span></div>
                </div>
              `).join("")}
            </div>
          </section>
        ` : ""}

        <section class="glass-card profile-section-card" style="margin-top:18px">
          <h3>المساهمات والمشاريع المنشورة (${pubSubs.length})</h3>
          ${pubSubs.length ? `
            <div class="transcript-list">
              ${pubSubs.map((it) => `
                <div class="transcript-row">
                  <div><strong>${escapeHtml(it.title)}</strong><small>${escapeHtml(it.branch || "")} • ${formatArabicDate(it.createdAt)}</small></div>
                  <button type="button" class="tool-btn" data-open-pub-item="${it.id}">قراءة</button>
                </div>
              `).join("")}
            </div>
          ` : `<p class="light-hint">لا توجد مساهمات منشورة بعد.</p>`}
        </section>
      </div>
    `;

    document.getElementById("pub-st-back")?.addEventListener("click", () => navigateTo({ view: "home" }));
    container.querySelectorAll("[data-open-pub-item]").forEach((b) => {
      b.addEventListener("click", () => navigateTo({ view: "item", sectionId: "exchange", itemId: b.dataset.openPubItem }));
    });
  } catch {
    container.innerHTML = `<div class="container reader-page"><div class="glass-card empty-state"><p>تعذر تحميل الملف حالياً.</p></div></div>`;
  }
}

/* ============================================================================
 * 15. دردشة الدعم الفني الذكية (متاحة للجميع + معرّف موحّد LISAN-XXXXXXXX)
 * ============================================================================ */
async function generateUniqueTicketId() {
  for (let i = 0; i < 6; i++) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const num = String((arr[0] % 90000000) + 10000000);
    const id = `LISAN-${num}`;
    const exists = await getDoc(doc(db, "tickets", id));
    if (!exists.exists()) return id;
  }
  return `LISAN-${Date.now().toString().slice(-8)}`;
}

function getSavedTicketIds() {
  try { return JSON.parse(localStorage.getItem(SAVED_TICKETS_KEY) || "[]"); }
  catch { return []; }
}

function saveTicketIdLocally(id) {
  const list = [id, ...getSavedTicketIds().filter((x) => x !== id)].slice(0, 6);
  localStorage.setItem(SAVED_TICKETS_KEY, JSON.stringify(list));
}

function openSupportChatModal(presetTopic = "") {
  const sState = getFeatureState("supportChat");
  if (sState === "off") return;
  if (sState === "soon") { showComingSoonModal("الدعم الفني المباشر"); return; }

  const sc = state.settings.supportContacts || {};
  const recentIds = getSavedTicketIds();
  const quickTopics = [
    { key: "lost_account", label: "فقدت الوصول إلى حسابي / استعادة الحساب" },
    { key: "verification", label: "تأخر تفعيل البريد أو مراجعة الحساب" },
    { key: "account_issue", label: "استفسار حول تقييد أو إشعار على حسابي" },
    { key: "quiz_content", label: "ملاحظة على اختبار أو مادة علمية" },
    { key: "technical", label: "مشكلة تقنية أو اقتراح تطوير" }
  ];

  const prefillName = state.studentProfile?.fullName || "";
  const prefillContact = state.studentProfile?.email || "";

  openDynamicModal("مركز الدعم الفني — لِسَان", `
    <div class="support-shell">
      <div class="bot-bubble">
        <strong>المساعد الآلي لمنصة لِسَان</strong>
        <p>${escapeHtml(sc.welcomeMessage || DEFAULT_SETTINGS.supportContacts.welcomeMessage)}</p>
      </div>

      ${(sc.whatsapp || sc.email || sc.telegram) ? `
        <div class="support-direct-bar">
          <span>قنوات التواصل السريع:</span>
          ${sc.whatsapp ? `<a href="https://wa.me/${escapeHtml(sc.whatsapp.replace(/[^\d]/g, ""))}" target="_blank" rel="noopener noreferrer" class="footer-social-pill">واتساب الإدارة</a>` : ""}
          ${sc.telegram ? `<a href="${escapeHtml(sc.telegram)}" target="_blank" rel="noopener noreferrer" class="footer-social-pill">تيليجرام</a>` : ""}
          ${sc.email ? `<a href="mailto:${escapeHtml(sc.email)}" class="footer-social-pill">البريد الإلكتروني</a>` : ""}
        </div>
      ` : ""}

      <div class="auth-tabs-bar" style="margin-top:12px">
        <button type="button" class="auth-tab-btn active" id="sup-tab-new">فتح تذكرة دعم جديدة</button>
        <button type="button" class="auth-tab-btn" id="sup-tab-track">متابعة تذكرة برقمها</button>
      </div>

      <form id="support-new-form" class="clean-form">
        <div class="form-group">
          <label>اختر المشكلة الأقرب (أو اكتبها بحرية):</label>
          <div class="quick-topics-wrap">
            ${quickTopics.map((t) => `
              <button type="button" class="topic-chip ${presetTopic === t.key ? "active" : ""}" data-topic-label="${escapeHtml(t.label)}">${t.label}</button>
            `).join("")}
          </div>
          <input type="text" id="sup-subject" required placeholder="عنوان المشكلة..." value="${escapeHtml(quickTopics.find((t) => t.key === presetTopic)?.label || "")}" style="margin-top:8px" />
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label>الاسم *</label>
            <input type="text" id="sup-name" required value="${escapeHtml(prefillName)}" placeholder="اسمك الكامل" />
          </div>
          <div class="form-group">
            <label>وسيلة التواصل (بريد أو واتساب) *</label>
            <input type="text" id="sup-contact" required dir="ltr" value="${escapeHtml(prefillContact)}" placeholder="email@domain.com أو 05..." />
          </div>
        </div>
        <div class="form-group">
          <label>اشرح مشكلتك بوضوح *</label>
          <textarea id="sup-message" rows="3" required placeholder="اكتب كل التفاصيل التي تساعد موظف الدعم في خدمتك بسرعة..."></textarea>
        </div>
        <button type="submit" class="btn-primary-glass full-width" id="sup-submit-btn">إرسال التذكرة والتحويل للكادر البشري</button>
      </form>

      <div id="support-track-pane" hidden>
        <div class="upload-row" style="margin-bottom:10px">
          <input type="text" id="sup-track-input" dir="ltr" placeholder="أدخل رقم التذكرة مثل LISAN-48291735" value="${escapeHtml(recentIds[0] || "")}" />
          <button type="button" class="btn-primary-glass" id="sup-track-btn">فتح المحادثة</button>
        </div>
        ${recentIds.length ? `
          <div class="recent-tickets-row">
            <small>تذاكرك الأخيرة:</small>
            ${recentIds.map((tid) => `<button type="button" class="mini-branch-chip" data-quick-tid="${escapeHtml(tid)}">${escapeHtml(tid)}</button>`).join("")}
          </div>
        ` : ""}
        <div id="sup-thread-view"></div>
      </div>
    </div>
  `, "wide");

  const newForm = document.getElementById("support-new-form");
  const trackPane = document.getElementById("support-track-pane");
  const tabNew = document.getElementById("sup-tab-new");
  const tabTrack = document.getElementById("sup-tab-track");

  const switchSupportTab = (which) => {
    const isNew = which === "new";
    newForm.hidden = !isNew;
    trackPane.hidden = isNew;
    tabNew.classList.toggle("active", isNew);
    tabTrack.classList.toggle("active", !isNew);
  };
  tabNew?.addEventListener("click", () => switchSupportTab("new"));
  tabTrack?.addEventListener("click", () => switchSupportTab("track"));

  document.querySelectorAll("[data-topic-label]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-topic-label]").forEach((x) => x.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("sup-subject").value = btn.dataset.topicLabel;
    });
  });

  const loadTicketThread = async (rawId) => {
    const tid = String(rawId || "").trim().toUpperCase();
    const wrap = document.getElementById("sup-thread-view");
    if (!tid) { wrap.innerHTML = `<p class="light-hint">أدخل رقم التذكرة أولاً.</p>`; return; }
    wrap.innerHTML = `<p class="light-hint">جارٍ البحث عن التذكرة ${escapeHtml(tid)}...</p>`;
    try {
      const snap = await getDoc(doc(db, "tickets", tid));
      if (!snap.exists()) {
        wrap.innerHTML = `<div class="auth-err-box">لم يُعثر على تذكرة بالرقم (${escapeHtml(tid)}). تأكد من الرقم وحاول مجدداً.</div>`;
        return;
      }
      const tk = snap.data();
      saveTicketIdLocally(tid);
      const stLabels = { open: "مفتوحة — بانتظار الدعم", answered: "تم الرد من الكادر البشري", closed: "مغلقة" };

      wrap.innerHTML = `
        <div class="ticket-thread-box">
          <div class="ticket-head-strip">
            <div><strong dir="ltr">${escapeHtml(tid)}</strong> — <span>${escapeHtml(tk.subject)}</span></div>
            <span class="branch-badge">${stLabels[tk.status] || tk.status}</span>
          </div>
          <div class="chat-messages-list">
            ${(tk.messages || []).map((m) => `
              <div class="chat-msg from-${escapeHtml(m.senderType || "user")}">
                <div class="chat-msg-meta"><strong>${escapeHtml(m.senderName || "")}</strong><span>${formatArabicDate(m.createdAt, true)}</span></div>
                <p>${escapeHtml(m.text || "")}</p>
              </div>
            `).join("")}
          </div>
          ${tk.status !== "closed" ? `
            <form id="sup-followup-form" class="upload-row" style="margin-top:12px">
              <input type="text" id="sup-followup-text" required placeholder="أضف رداً أو تفصيلاً إضافياً للتذكرة..." />
              <button type="submit" class="btn-primary-glass">إرسال</button>
            </form>
          ` : `<p class="light-hint center" style="margin-top:10px">تم إغلاق هذه التذكرة. يمكنك فتح تذكرة جديدة عند الحاجة.</p>`}
        </div>
      `;

      document.getElementById("sup-followup-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const txt = document.getElementById("sup-followup-text").value.trim();
        if (!txt) return;
        const nextMsgs = [
          ...(tk.messages || []),
          { senderType: "user", senderName: tk.requesterName || "المستفيد", text: txt, createdAt: new Date().toISOString() }
        ];
        await updateDoc(doc(db, "tickets", tid), { messages: nextMsgs, status: "open", updatedAt: new Date().toISOString() });
        showToast("تم إرسال ردك للكادر البشري ✓");
        loadTicketThread(tid);
      });
    } catch {
      wrap.innerHTML = `<div class="auth-err-box">تعذر تحميل التذكرة حالياً.</div>`;
    }
  };

  document.getElementById("sup-track-btn")?.addEventListener("click", () => {
    loadTicketThread(document.getElementById("sup-track-input").value);
  });
  document.querySelectorAll("[data-quick-tid]").forEach((b) => {
    b.addEventListener("click", () => {
      document.getElementById("sup-track-input").value = b.dataset.quickTid;
      loadTicketThread(b.dataset.quickTid);
    });
  });

  newForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("sup-submit-btn");
    btn.disabled = true;
    btn.textContent = "جارٍ إنشاء التذكرة...";
    try {
      const ticketId = await generateUniqueTicketId();
      const requesterName = document.getElementById("sup-name").value.trim();
      const contact = document.getElementById("sup-contact").value.trim();
      const subject = document.getElementById("sup-subject").value.trim();
      const message = document.getElementById("sup-message").value.trim();
      const now = new Date().toISOString();

      await setDoc(doc(db, "tickets", ticketId), {
        ticketId,
        requesterName,
        contact,
        studentUid: state.authUser?.uid || "",
        subject,
        status: "open",
        messages: [
          { senderType: "user", senderName: requesterName, text: message, createdAt: now },
          {
            senderType: "bot",
            senderName: "النظام الآلي",
            text: `تم استلام طلبك بنجاح برقم التذكرة الموحّد (${ticketId}) وتم تحويلك إلى الكادر البشري. سيتواصل معك أحد موظفي خدمة العملاء في أقرب وقت، ويمكنك متابعة الرد هنا في أي وقت بنفس الرقم.`,
            createdAt: now
          }
        ],
        createdAt: now,
        updatedAt: now
      });

      saveTicketIdLocally(ticketId);
      showToast(`تم فتح التذكرة ${ticketId} بنجاح ✓`);
      switchSupportTab("track");
      document.getElementById("sup-track-input").value = ticketId;
      loadTicketThread(ticketId);
    } catch (err) {
      console.error(err);
      showToast("تعذر إنشاء التذكرة حالياً");
      btn.disabled = false;
      btn.textContent = "إرسال التذكرة والتحويل للكادر البشري";
    }
  });
}

/* ============================================================================
 * 16. مساهمات الطلبة + Spotlight + Lightbox + يوتيوب والروابط الخارجية
 * ============================================================================ */
function handleOpenSubmissionClick() {
  const subState = getFeatureState("studentSubmissions");
  if (subState === "off") return;
  if (subState === "soon") { showComingSoonModal("إرسال مشاريع ومساهمات الطلبة"); return; }

  const accState = getFeatureState("studentAccounts");
  if (accState === "on") {
    if (!state.authUser || !state.studentProfile) {
      showToast("يلزم تسجيل الدخول بحساب طالب موثق لمشاركة مشروعك باسمك في المنصة");
      openAuthModal("login");
      return;
    }
    if (["suspended", "restricted_publish", "restricted_readonly", "terminated"].includes(state.studentProfile.status)) {
      showToast("حسابك مقيّد من إرسال المساهمات — راجع الإشعارات أو تواصل مع الدعم");
      navigateTo({ view: "profile" });
      return;
    }
    if (["pending_email", "pending_review", "rejected"].includes(state.studentProfile.status)) {
      showToast("يمكنك إرسال المساهمات فور اعتماد توثيق حسابك من الإدارة");
      navigateTo({ view: "profile" });
      return;
    }
  }

  const nameInput = document.getElementById("sub-student-name");
  if (nameInput && state.studentProfile?.fullName) {
    nameInput.value = `${state.studentProfile.fullName} — ${state.studentProfile.university || ""}`;
  }
  const modal = document.getElementById("submission-modal");
  if (modal) modal.hidden = false;
}

function setupSubmissionForm() {
  const form = document.getElementById("student-submission-form");
  document.getElementById("close-submission-btn")?.addEventListener("click", () => {
    document.getElementById("submission-modal").hidden = true;
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const name = document.getElementById("sub-student-name")?.value.trim();
    const branch = document.getElementById("sub-branch")?.value;
    const title = document.getElementById("sub-title")?.value.trim();
    const details = document.getElementById("sub-details")?.value.trim();
    const link = document.getElementById("sub-link")?.value.trim();
    if (!name || !title || !details) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "جارٍ الإرسال...";
    try {
      const payload = {
        sectionId: "exchange",
        branch: branch || "عرض مشاريع الطلبة",
        title,
        subtitle: `مساهمة: ${name}`,
        studentUid: state.authUser?.uid || "",
        studentName: state.studentProfile?.fullName || name,
        studentAvatar: state.studentProfile?.avatarUrl || "",
        summary: details.slice(0, 180),
        contentType: "article",
        bodyHtml: `<p>${escapeHtml(details).replace(/\n/g, "</p><p>")}</p>`,
        externalUrl: link || "",
        pdfUrl: "",
        youtubeUrl: "",
        coverUrl: "",
        tags: ["مساهمة طلابية"],
        status: "pending",
        views: 0,
        createdAt: new Date().toISOString(),
        submittedAt: serverTimestamp()
      };
      const ref = await addDoc(collection(db, "items"), payload);
      if (state.authUser) state.studentSubmissions.unshift({ id: ref.id, ...payload });
      form.reset();
      document.getElementById("submission-modal").hidden = true;
      showToast("تم إرسال مساهمتك بنجاح! ستظهر في المنصة وفي سجلك فور اعتمادها ✓");
    } catch {
      showToast("تعذر الإرسال حالياً، حاول لاحقاً");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "إرسال للمراجعة";
    }
  });
}

function openGlobalSearchModal() {
  const sState = getFeatureState("globalSearch");
  if (sState === "off") return;
  if (sState === "soon") { showComingSoonModal("محرك البحث الذكي"); return; }
  const modal = document.getElementById("global-search-modal");
  const input = document.getElementById("global-search-input");
  if (!modal) return;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  setTimeout(() => input?.focus(), 40);
  renderGlobalSearchResults(input?.value || "");
}

function closeGlobalSearchModal() {
  const modal = document.getElementById("global-search-modal");
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = "";
}

function renderGlobalSearchResults(queryText) {
  const listEl = document.getElementById("global-search-results");
  if (!listEl) return;
  const q = queryText.trim();
  const activeSecs = getVisibleSections().filter((s) => getFeatureState(s.featureKey) === "on");

  if (!q) {
    listEl.innerHTML = `
      <div class="spotlight-hint">
        <p>ابدأ الكتابة للبحث الفوري في كل الأقسام (يدعم البحث بدون تشكيل أو همزات).</p>
        <div class="spotlight-quick-chips">
          ${activeSecs.map((s) => `<button type="button" class="mini-branch-chip" data-jump-sec="${s.id}">${escapeHtml(s.title)}</button>`).join("")}
        </div>
      </div>`;
    listEl.querySelectorAll("[data-jump-sec]").forEach((b) => {
      b.addEventListener("click", () => {
        closeGlobalSearchModal();
        navigateTo({ view: "section", sectionId: b.dataset.jumpSec, branch: "الكل" });
      });
    });
    return;
  }

  const activeIds = new Set(activeSecs.map((s) => s.id));
  const matchedItems = smartSearchItems(q, state.items.filter((it) => activeIds.has(it.sectionId))).slice(0, 12);
  const matchedQuizzes = activeIds.has("quiz") ? smartSearchItems(q, state.quizzes).slice(0, 5) : [];

  if (!matchedItems.length && !matchedQuizzes.length) {
    listEl.innerHTML = `<div class="spotlight-empty">لا توجد نتائج مطابقة لـ "<strong>${escapeHtml(q)}</strong>".</div>`;
    return;
  }

  listEl.innerHTML = `
    ${matchedItems.map((it) => {
      const sec = state.settings.sectionsMeta[it.sectionId];
      return `<button type="button" class="spotlight-row" data-hit-item="${escapeHtml(it.id)}" data-hit-sec="${escapeHtml(it.sectionId)}"><div class="spotlight-row-main"><strong>${escapeHtml(it.title)}</strong><span>${escapeHtml(it.summary || it.subtitle || "")}</span></div><span class="branch-badge">${escapeHtml(sec?.title || "")}</span></button>`;
    }).join("")}
    ${matchedQuizzes.map((qz) => `<button type="button" class="spotlight-row" data-hit-quiz="${escapeHtml(qz.id)}"><div class="spotlight-row-main"><strong>${escapeHtml(qz.title)}</strong><span>${escapeHtml(qz.description || "اختبار")}</span></div><span class="branch-badge">اختبر معارفك</span></button>`).join("")}
  `;

  listEl.querySelectorAll("[data-hit-item]").forEach((b) => {
    b.addEventListener("click", () => { closeGlobalSearchModal(); navigateTo({ view: "item", sectionId: b.dataset.hitSec, itemId: b.dataset.hitItem }); });
  });
  listEl.querySelectorAll("[data-hit-quiz]").forEach((b) => {
    b.addEventListener("click", () => { closeGlobalSearchModal(); handleStartQuizClick(b.dataset.hitQuiz); });
  });
}

function openLightbox(src, caption = "") {
  const modal = document.getElementById("image-lightbox-modal");
  const img = document.getElementById("lightbox-img");
  const cap = document.getElementById("lightbox-caption");
  if (!modal || !img) return;
  img.src = src;
  img.alt = caption;
  if (cap) { cap.textContent = caption; cap.hidden = !caption.trim(); }
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  const modal = document.getElementById("image-lightbox-modal");
  if (modal) { modal.hidden = true; document.body.style.overflow = ""; }
}

function openDynamicModal(title, bodyHtml, size = "normal") {
  const backdrop = document.getElementById("dynamic-modal-backdrop");
  const dialog = document.getElementById("dynamic-modal-dialog");
  document.getElementById("dynamic-modal-title").textContent = title;
  document.getElementById("dynamic-modal-body").innerHTML = bodyHtml;
  dialog.className = `dynamic-modal-dialog ${size}`;
  backdrop.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeDynamicModal() {
  const backdrop = document.getElementById("dynamic-modal-backdrop");
  if (backdrop) { backdrop.hidden = true; document.body.style.overflow = ""; }
}

function sendYouTubeCommand(iframe, func) {
  if (iframe?.contentWindow) iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func, args: "" }), "*");
}

function cleanupVideoObserver() {
  if (state.videoObserver) { state.videoObserver.disconnect(); state.videoObserver = null; }
}

function setupSmartYouTubePlayers(root) {
  cleanupVideoObserver();
  root.querySelectorAll("[data-yt-cmd]").forEach((b) => {
    b.addEventListener("click", () => sendYouTubeCommand(document.getElementById(b.dataset.ytTarget), b.dataset.ytCmd));
  });
  const frames = root.querySelectorAll(".smart-player-frame");
  if (!frames.length || !("IntersectionObserver" in window)) return;
  state.videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const iframe = entry.target.querySelector("iframe");
      const stEl = document.getElementById(`yt-status-${entry.target.dataset.smartYt}`);
      if (!entry.isIntersecting || entry.intersectionRatio < 0.35) {
        sendYouTubeCommand(iframe, "pauseVideo");
        if (stEl) stEl.textContent = "تم إيقاف الفيديو تلقائياً لتمرير الشاشة بعيداً عنه";
      } else if (stEl) {
        stEl.textContent = "المشغل الذكي نشط — يتوقف تلقائياً عند التمرير";
      }
    });
  }, { threshold: [0, 0.35, 0.6] });
  frames.forEach((f) => state.videoObserver.observe(f));
}

function setupExternalLinkInterceptor() {
  document.addEventListener("click", (e) => {
    const anchor = e.target.closest("a[href]");
    if (!anchor || getFeatureState("externalLinkWarning") !== "on") return;
    const href = anchor.getAttribute("href") || "";
    if (!/^https?:\/\//i.test(href)) return;
    try {
      const urlObj = new URL(href);
      if (urlObj.origin === window.location.origin) return;
      e.preventDefault();
      state.pendingExternalUrl = href;
      document.getElementById("external-link-url").textContent = href;
      document.getElementById("external-link-modal").hidden = false;
    } catch {}
  });
  document.getElementById("cancel-external-btn")?.addEventListener("click", () => {
    state.pendingExternalUrl = null;
    document.getElementById("external-link-modal").hidden = true;
  });
  document.getElementById("confirm-external-btn")?.addEventListener("click", () => {
    if (state.pendingExternalUrl) window.open(state.pendingExternalUrl, "_blank", "noopener,noreferrer");
    state.pendingExternalUrl = null;
    document.getElementById("external-link-modal").hidden = true;
  });
}

function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "glass-toast";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 20);
  setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 300); }, 3600);
}

/* ============================================================================
 * 17. نقطة الانطلاق
 * ============================================================================ */
async function init() {
  document.getElementById("brand-home-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo({ view: "home", sectionId: null, branch: "الكل" });
  });

  document.getElementById("header-search-btn")?.addEventListener("click", openGlobalSearchModal);
  document.getElementById("header-account-btn")?.addEventListener("click", () => {
    const accState = getFeatureState("studentAccounts");
    if (accState === "soon") { showComingSoonModal("حسابات الطلبة"); return; }
    if (state.authUser) navigateTo({ view: "profile" });
    else openAuthModal("login");
  });

  document.getElementById("support-fab")?.addEventListener("click", () => openSupportChatModal());
  document.getElementById("close-search-modal")?.addEventListener("click", closeGlobalSearchModal);
  document.getElementById("global-search-modal")?.addEventListener("click", (e) => { if (e.target.id === "global-search-modal") closeGlobalSearchModal(); });
  document.getElementById("global-search-input")?.addEventListener("input", (e) => renderGlobalSearchResults(e.target.value));

  document.getElementById("close-dynamic-modal")?.addEventListener("click", closeDynamicModal);
  document.getElementById("dynamic-modal-backdrop")?.addEventListener("click", (e) => { if (e.target.id === "dynamic-modal-backdrop") closeDynamicModal(); });

  document.getElementById("close-lightbox-btn")?.addEventListener("click", closeLightbox);
  document.getElementById("image-lightbox-modal")?.addEventListener("click", (e) => { if (e.target.id === "image-lightbox-modal") closeLightbox(); });

  document.addEventListener("keydown", (e) => {
    if ((e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      openGlobalSearchModal();
    } else if (e.key === "Escape") {
      closeGlobalSearchModal();
      closeDynamicModal();
      closeLightbox();
      document.getElementById("external-link-modal").hidden = true;
      document.getElementById("submission-modal").hidden = true;
    }
  });

  window.addEventListener("popstate", () => { parseRouteFromUrl(); renderCurrentView(); });

  setupExternalLinkInterceptor();
  setupSubmissionForm();

  onAuthStateChanged(auth, async (user) => {
    state.authUser = user;
    state.authReady = true;
    const res = await loadStudentData(user?.uid || null);
    if (!res?.terminated && state.route.view === "profile") renderCurrentView();
  });

  renderCurrentView();
  await loadPlatformData();
  parseRouteFromUrl();
  renderCurrentView();
}

document.addEventListener("DOMContentLoaded", init);
