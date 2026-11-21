/**
 * ============================================================================
 * لِسَان | LISAN — الفضاء الرقمي لطلبة اللسانيات العربية
 * المستودع العام — المحرك الرئيسي (app.js)
 * البنية: كشف تدريجي (شيء داخل شيء) + محرك بحث عربي ذكي + SEO ديناميكي
 * + مشغل يوتيوب ذكي (إيقاف تلقائي عند التمرير) + قارئ PDF + معالج روابط آمن
 * ============================================================================
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  increment,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

/* ============================================================================
 * 1. تهيئة Firebase (مشروع lisan-b7f25)
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ============================================================================
 * 2. الإعدادات والهيكلة الافتراضية (تُحدّث تلقائياً ولحظياً من لوحة التحكم)
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
  socialLinks: {
    twitter: "",
    telegram: "",
    youtube: "",
    facebook: ""
  },
  features: {
    globalSearch: true,
    sectionLibrary: true,
    sectionDictionary: true,
    sectionQuiz: true,
    sectionResearch: true,
    sectionLectures: true,
    sectionExchange: true,
    externalLinkWarning: true,
    fontControls: true,
    shareButtons: true,
    announcements: true,
    statsBar: true,
    studentSubmissions: true
  },
  sectionsMeta: {
    library: {
      id: "library",
      order: 1,
      featureKey: "sectionLibrary",
      title: "المكتبة اللسانية",
      shortDesc: "ملخصات النظريات، الكتب والمراجع العلمية، والأبحاث المختارة.",
      icon: "book",
      accent: "#0071e3",
      branches: [
        "ملخصات النظريات اللسانية",
        "كتب ومراجع وروابط علمية",
        "مقالات وأبحاث مختارة"
      ]
    },
    dictionary: {
      id: "dictionary",
      order: 2,
      featureKey: "sectionDictionary",
      title: "المعجم اللساني",
      shortDesc: "مصطلحات اللسانيات العامة والتطبيقية والتداولية والحاسوبية بتعريفات مبسطة.",
      icon: "bookmark",
      accent: "#5e5ce6",
      branches: [
        "مصطلحات اللسانيات العامة",
        "اللسانيات التطبيقية",
        "اللسانيات التداولية",
        "اللسانيات الحاسوبية"
      ]
    },
    quiz: {
      id: "quiz",
      order: 3,
      featureKey: "sectionQuiz",
      title: "اختبر معارفك",
      shortDesc: "اختبارات تفاعلية في فروع اللسانيات، أسئلة اختيار من متعدد، وتحديات أسبوعية.",
      icon: "check-circle",
      accent: "#30b0c7",
      branches: [
        "اختبارات في فروع اللسانيات",
        "أسئلة اختيار من متعدد",
        "تحديات أسبوعية"
      ]
    },
    research: {
      id: "research",
      order: 4,
      featureKey: "sectionResearch",
      title: "فضاء الباحث اللساني",
      shortDesc: "منهجية إعداد مذكرة الماستر، تحليل المدونة، التوثيق العلمي، وأدوات البحث.",
      icon: "compass",
      accent: "#ff9500",
      branches: [
        "كيفية إعداد مذكرة ماستر",
        "منهجية تحليل المدونة",
        "التوثيق العلمي",
        "أدوات البحث اللساني"
      ]
    },
    lectures: {
      id: "lectures",
      order: 5,
      featureKey: "sectionLectures",
      title: "محاضرات ودروس",
      shortDesc: "دروس مختصرة ومرئية في الأصوات، الصرف، النحو، الدلالة، التداولية، وتحليل الخطاب.",
      icon: "play-circle",
      accent: "#af52de",
      branches: [
        "علم الأصوات",
        "الصرف والنحو",
        "الدلالة والتداولية",
        "تحليل الخطاب"
      ]
    },
    exchange: {
      id: "exchange",
      order: 6,
      featureKey: "sectionExchange",
      title: "فضاء التبادل العلمي",
      shortDesc: "عرض مشاريع الطلبة، الإعلان عن الملتقيات، المسابقات العلمية، وتجارب البحث.",
      icon: "users",
      accent: "#34c759",
      branches: [
        "عرض مشاريع الطلبة",
        "الإعلان عن الملتقيات",
        "مسابقات علمية",
        "مشاركة تجارب البحث"
      ]
    }
  }
};

/* ============================================================================
 * 3. بيانات أولية تأسيسية (تظهر فقط إذا كانت قاعدة البيانات فارغة تماماً)
 *    تختفي تلقائياً بمجرد إضافة أول محتوى من لوحة التحكم
 * ============================================================================ */
const FALLBACK_ITEMS = [
  {
    id: "demo-lib-1",
    sectionId: "library",
    branch: "ملخصات النظريات اللسانية",
    title: "مدخل إلى البنيوية اللسانية عند فرديناند دي سوسير",
    subtitle: "ملخص أكاديمي شامل — اللسانيات الحديثة",
    summary: "عرض منهجي لثنائيات دي سوسير المؤسسة للسانيات الحديثة: اللسان والكلام، الدال والمدلول، والمنهجان التزامني والتعاقبي.",
    contentType: "article",
    bodyHtml: `
      <h2>تمهيد منهجي</h2>
      <p>يُعدّ كتاب <strong>محاضرات في اللسانيات العامة</strong> لفرديناند دي سوسير نقطة التحول الحاسمة التي نقلت دراسة اللغة من المقاربات التاريخية المعيارية إلى علم وصفي بنيوي دقيق.</p>
      <blockquote>"إن الموضوع الوحيد والحقيقي للسانيات هو اللغة منظوراً إليها في ذاتها ومن أجل ذاتها."</blockquote>
      <h3>أبرز الثنائيات السوسيرية</h3>
      <ul>
        <li><strong>اللسان والكلام (Langue / Parole):</strong> اللسان نظام اجتماعي مجرد، بينما الكلام تحقق فردي ملموس.</li>
        <li><strong>الدال والمدلول (Signifiant / Signifié):</strong> العلاقة الاعتباطية بين الصورة السمعية والتصور الذهني.</li>
        <li><strong>التزامنية والتعاقبية (Synchronie / Diachronie):</strong> دراسة بنية اللغة في لحظة زمنية محددة مقابل تتبع تطورها عبر الزمن.</li>
      </ul>
      <p>للاطلاع على مزيد من المراجع المعجمية التاريخية يمكن زيارة موقع معجم الدوحة التاريخي: https://www.dohadictionary.org</p>
    `,
    pdfUrl: "",
    youtubeUrl: "",
    coverUrl: "",
    externalUrl: "",
    tags: ["البنيوية", "دي سوسير", "اللسانيات العامة"],
    views: 142,
    createdAt: "2026-11-20T09:00:00Z",
    isDemo: true
  },
  {
    id: "demo-dict-1",
    sectionId: "dictionary",
    branch: "اللسانيات التداولية",
    title: "الاستلزام الحواري",
    subtitle: "Conversational Implicature",
    summary: "ما يقصده المتكلم ضمناً من وراء ملفوظه دون أن يصرح به حرفياً، اعتماداً على السياق ومبدأ التعاون لدى بول غرايس.",
    contentType: "term",
    bodyHtml: `
      <p>صاغ الفيلسوف اللغوي <strong>هربرت بول غرايس (H.P. Grice)</strong> مفهوم الاستلزام الحواري لتفسير الفجوة بين المعنى الحرفي للجملة والمعنى المقصود في السياق التواصلي.</p>
      <h3>شروط تحققه</h3>
      <p>يتحقق الاستلزام الحواري حين يخرق المتكلم ظاهرياً إحدى مسلمات التعاون (الكم، الكيف، العلاقة، الجهة) لإيصال دلالة إضافية يفهمها السامع بالقرينة السياقية.</p>
    `,
    tags: ["غرايس", "التداولية", "السياق"],
    views: 98,
    createdAt: "2026-11-20T09:10:00Z",
    isDemo: true
  },
  {
    id: "demo-dict-2",
    sectionId: "dictionary",
    branch: "اللسانيات الحاسوبية",
    title: "المدونة اللغوية الحاسوبية",
    subtitle: "Linguistic Corpus",
    summary: "مجموعة ضخمة ومنظمة من النصوص الطبيعية المخزنة إلكترونياً والموسومة صرفياً أو نحوياً لأغراض التحليل اللساني الآلي.",
    contentType: "term",
    bodyHtml: `
      <p>تُمثل <strong>المدونة اللغوية</strong> حجر الزاوية في أبحاث اللسانيات الحاسوبية ومعالجة اللغة الطبيعية (NLP)، إذ تتيح للباحث قياس التواترات اللفظية والتلازمات السياقية بدقة إحصائية عالية.</p>
    `,
    tags: ["المدونة", "حاسوبية", "NLP"],
    views: 76,
    createdAt: "2026-11-20T09:15:00Z",
    isDemo: true
  },
  {
    id: "demo-res-1",
    sectionId: "research",
    branch: "كيفية إعداد مذكرة ماستر",
    title: "دليل صياغة الإشكالية وبناء خطة مذكرة الماستر في اللسانيات",
    subtitle: "منهجية البحث الأكاديمي",
    summary: "خطوات عملية لاختيار موضوع لساني دقيق، تحديد المدونة، وصياغة التساؤلات والفرضيات البحثية بصورة علمية محكمة.",
    contentType: "article",
    bodyHtml: `
      <h2>أركان المذكرة اللسانية الناجحة</h2>
      <ol>
        <li><strong>ضبط العنوان:</strong> أن يحدد الظاهرة اللسانية، المنهج المعتمد، وحدود المدونة المدروسة.</li>
        <li><strong>بناء الإشكالية:</strong> صياغة سؤال مركزي قابل للاختبار عبر التحليل الإجرائي للمدونة.</li>
        <li><strong>التوازن بين النظري والتطبيقي:</strong> تخصيص الجانب الأكبر لتحليل النماذج والشواهد واستخلاص النتائج.</li>
      </ol>
    `,
    tags: ["ماستر", "منهجية", "إشكالية"],
    views: 115,
    createdAt: "2026-11-20T09:20:00Z",
    isDemo: true
  },
  {
    id: "demo-lec-1",
    sectionId: "lectures",
    branch: "علم الأصوات",
    title: "الفارق الإجرائي بين علم الأصوات (الفونيتيك) والفونولوجيا",
    subtitle: "محاضرة تمهيدية مركزة",
    summary: "شرح مبسط للفرق بين دراسة الصوت اللغوي بخصائصه الفيزيائية والنطقية، وبين دراسة وظيفته التمييزية داخل النظام اللغوي.",
    contentType: "article",
    bodyHtml: `
      <p>يهتم <strong>علم الأصوات العام (Phonetics)</strong> بدراسة الأصوات البشرية من حيث مخارجها وصفاتها الفيزيائية والسمعية بصرف النظر عن لغتها.</p>
      <p>أما <strong>علم وظائف الأصوات (Phonology)</strong> فيبحث في القيمة التمييزية للصوت (الفونيم) داخل نسق لغة معينة، مثل الفرق الدلالي بين (قال / كال) في العربية.</p>
    `,
    tags: ["الأصوات", "الفونولوجيا", "الفونيم"],
    views: 88,
    createdAt: "2026-11-20T09:25:00Z",
    isDemo: true
  },
  {
    id: "demo-exc-1",
    sectionId: "exchange",
    branch: "عرض مشاريع الطلبة",
    title: "مشروع تخرج: تحليل التداولية الحجاجية في الخطاب الصحفي العربي",
    subtitle: "إعداد: فريق بحثي من طلبة الماستر",
    summary: "نموذج تطبيقي يرصد آليات الحجاج والروابط التداولية في عينة من المقالات الافتتاحية العربية المعاصرة.",
    contentType: "article",
    bodyHtml: `
      <p>يعرض هذا المشروع البحثي تجربة تطبيق نظرية <strong>الحجاج في اللغة</strong> (لديكرو وأنسكومبر) على مدونة صحفية مختارة، مع إبراز دور الروابط الحجاجية مثل (لكن، بل، حتى) في توجيه المتلقي.</p>
    `,
    tags: ["مشاريع الطلبة", "الحجاج", "تحليل الخطاب"],
    views: 64,
    createdAt: "2026-11-20T09:30:00Z",
    isDemo: true
  }
];

const FALLBACK_QUIZZES = [
  {
    id: "demo-quiz-1",
    branch: "اختبارات في فروع اللسانيات",
    title: "اختبار تأسيسي في مفاهيم اللسانيات العامة",
    description: "قيّم استيعابك لأبرز المفاهيم التأسيسية في المدارس اللسانية الحديثة مع شرح علمي فوري لكل إجابة.",
    difficulty: "مبتدئ",
    timeLimitMinutes: 5,
    status: "published",
    isDemo: true,
    questions: [
      {
        question: "من هو العالم اللغوي الذي أسس ثنائية (اللسان والكلام) و(الدال والمدلول)؟",
        options: ["نعوم تشومسكي", "فرديناند دي سوسير", "رومان ياكبسون", "بول غرايس"],
        correctIndex: 1,
        explanation: "فرديناند دي سوسير هو مؤسس اللسانيات البنيوية الحديثة، وقد رسخ هذه الثنائيات في كتابه الشهير (محاضرات في اللسانيات العامة)."
      },
      {
        question: "أي فرع من فروع اللسانيات يدرس العلاقة بين العلامات اللغوية ومستعمليها في سياق التواصل؟",
        options: ["الصرف", "علم الأصوات النطقي", "اللسانيات التداولية", "المعجمية التاريخية"],
        correctIndex: 2,
        explanation: "التداولية (Pragmatics) هي العلم الذي يدرس اللغة في الاستعمال الفعلي والسياق التواصلي ومقاصد المتكلمين."
      },
      {
        question: "تُعرف أصغر وحدة صوتية ذات وظيفة تمييزية تغيّر المعنى في اللغة بـ:",
        options: ["المورفيم", "الفونيم", "السيمانتيم", "المقطع الصوتي"],
        correctIndex: 1,
        explanation: "الفونيم (Phoneme) هو أصغر وحدة صوتية مجردة قادرة على التفريق بين المعاني، أما المورفيم فهو أصغر وحدة صرفية دالة."
      }
    ]
  }
];

/* ============================================================================
 * 4. الحالة المركزية للتطبيق (Application State)
 * ============================================================================ */
const state = {
  settings: structuredClone(DEFAULT_SETTINGS),
  items: [],
  quizzes: [],
  usingFallbackItems: false,
  usingFallbackQuizzes: false,
  loading: true,
  route: {
    view: "home", // 'home' | 'section' | 'item' | 'quiz'
    sectionId: null,
    branch: "الكل",
    itemId: null,
    quizId: null,
    searchQuery: ""
  },
  readerFontSize: 18,
  activeQuizSession: null,
  videoObserver: null,
  pendingExternalUrl: null
};

/* ============================================================================
 * 5. أيقونات SVG نظيفة بأسلوب Apple SF Symbols
 * ============================================================================ */
const ICONS = {
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`,
  bookmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8"/><path d="M8 11h6"/></svg>`,
  "check-circle": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  "play-circle": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
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
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
};

/* ============================================================================
 * 6. محرك البحث العربي الذكي (تجاهل التشكيل والهمزات والتاء المربوطة)
 * ============================================================================ */
function normalizeArabic(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "") // إزالة التشكيل والتطويل
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
      const matchedAll = tokens.every((tk) => fullHaystack.includes(tk));
      if (!matchedAll) return null;

      // ترتيب ذكي بالأولوية (العنوان ثم الفرع ثم الملخص ثم المتن)
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

/* ============================================================================
 * 7. الأدوات الأمنية ومعالجة النصوص والروابط والوسائط الذكية
 * ============================================================================ */
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * تنقية النصوص الأكاديمية القادمة من المحرر + تحويل الروابط العشوائية تلقائياً
 */
function sanitizeAndLinkifyHtml(rawHtml = "") {
  const allowedTags = new Set([
    "H1", "H2", "H3", "H4", "P", "BR", "STRONG", "B", "EM", "I", "U",
    "BLOCKQUOTE", "UL", "OL", "LI", "A", "IMG", "HR", "SPAN", "MARK",
    "SUP", "SUB", "CODE", "PRE", "TABLE", "THEAD", "TBODY", "TR", "TH", "TD", "DIV"
  ]);

  const template = document.createElement("template");
  template.innerHTML = rawHtml || "";

  // إزالة أي وسوم خطيرة أو سمات أحداث
  const walkClean = (node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (!allowedTags.has(child.tagName)) {
          if (["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED"].includes(child.tagName)) {
            child.remove();
            continue;
          }
          // فك الوسم غير المصرح مع الإبقاء على نصه
          const frag = document.createDocumentFragment();
          while (child.firstChild) frag.appendChild(child.firstChild);
          child.replaceWith(frag);
          continue;
        }
        // تنظيف السمات
        for (const attr of Array.from(child.attributes)) {
          const name = attr.name.toLowerCase();
          const val = attr.value.trim();
          if (name.startsWith("on") || name === "style") {
            child.removeAttribute(attr.name);
          } else if ((name === "href" || name === "src") && /^javascript:/i.test(val)) {
            child.removeAttribute(attr.name);
          }
        }
        if (child.tagName === "A") {
          child.setAttribute("target", "_blank");
          child.setAttribute("rel", "noopener noreferrer");
          child.classList.add("lisan-auto-link");
        }
        if (child.tagName === "IMG") {
          child.setAttribute("loading", "lazy");
          child.classList.add("academic-inline-img");
        }
        walkClean(child);
      }
    }
  };
  walkClean(template.content);

  // التعرف التلقائي الذكي على الروابط العشوائية داخل النصوص وتحويلها لروابط تفاعلية
  const urlRegex = /((?:https?:\/\/|www\.)[^\s<>"'()]+)/gi;
  const textNodes = [];
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
  let currentNode;
  while ((currentNode = walker.nextNode())) {
    if (currentNode.parentElement && currentNode.parentElement.closest("a, code, pre")) {
      continue;
    }
    if (urlRegex.test(currentNode.nodeValue)) {
      textNodes.push(currentNode);
    }
    urlRegex.lastIndex = 0;
  }

  for (const tNode of textNodes) {
    const text = tNode.nodeValue;
    const frag = document.createDocumentFragment();
    let lastIndex = 0;
    text.replace(urlRegex, (match, _p1, offset) => {
      if (offset > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
      }
      // إزالة علامات الترقيم العالقة بآخر الرابط
      let cleanUrl = match;
      let trailing = "";
      while (/[.,،؛:!?)}\]]$/.test(cleanUrl)) {
        trailing = cleanUrl.slice(-1) + trailing;
        cleanUrl = cleanUrl.slice(0, -1);
      }
      const href = cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`;
      const a = document.createElement("a");
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "lisan-auto-link";
      a.textContent = cleanUrl;
      frag.appendChild(a);
      if (trailing) frag.appendChild(document.createTextNode(trailing));
      lastIndex = offset + match.length;
    });
    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    tNode.replaceWith(frag);
  }

  const wrapper = document.createElement("div");
  wrapper.appendChild(template.content);
  return wrapper.innerHTML;
}

/**
 * استخراج معرّف فيديو يوتيوب من أي صيغة رابط (عادي، Shorts، مختصر، مضمّن)
 */
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

/**
 * تحويل روابط Google Drive أو PDF إلى رابط عرض احترافي مدمج
 */
function buildPdfEmbedUrl(url = "") {
  if (!url) return null;
  const driveFile = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFile) return `https://drive.google.com/file/d/${driveFile[1]}/preview`;

  const driveOpen = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (driveOpen) return `https://drive.google.com/file/d/${driveOpen[1]}/preview`;

  const gDocs = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (gDocs) return `https://docs.google.com/document/d/${gDocs[1]}/preview`;

  if (/\.pdf(\?.*)?$/i.test(url)) {
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
  }
  return url;
}

function estimateReadingMinutes(html = "") {
  const words = stripHtml(html).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

function formatArabicDate(isoOrTimestamp) {
  if (!isoOrTimestamp) return "";
  try {
    const date = typeof isoOrTimestamp.toDate === "function"
      ? isoOrTimestamp.toDate()
      : new Date(isoOrTimestamp);
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(date);
  } catch {
    return "";
  }
}

/* ============================================================================
 * 8. محرك السيو الديناميكي (SEO + Open Graph + Schema.org JSON-LD)
 * ============================================================================ */
function updateSEO({ title, description, image, type = "website", schemaData = null }) {
  const siteName = state.settings.siteName || "لِسَان | LISAN";
  const fullTitle = title ? `${title} — ${siteName}` : `${siteName} | ${state.settings.siteSubtitle}`;
  const desc = (description || state.settings.siteTagline || "").slice(0, 160);
  const currentUrl = window.location.href;

  document.title = fullTitle;

  const setMeta = (selector, attr, content) => {
    if (!content) return;
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");
      const [k, v] = attr;
      el.setAttribute(k, v);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };

  setMeta('meta[name="description"]', ["name", "description"], desc);
  setMeta('meta[property="og:title"]', ["property", "og:title"], fullTitle);
  setMeta('meta[property="og:description"]', ["property", "og:description"], desc);
  setMeta('meta[property="og:url"]', ["property", "og:url"], currentUrl);
  setMeta('meta[property="og:type"]', ["property", "og:type"], type);
  if (image) setMeta('meta[property="og:image"]', ["property", "og:image"], image);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = currentUrl;

  // تحديث بيانات Schema.org المنظمة لعناكب جوجل
  const ldScript = document.getElementById("dynamic-jsonld");
  if (ldScript) {
    const baseSchema = schemaData || {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: siteName,
      description: desc,
      url: window.location.origin,
      inLanguage: "ar"
    };
    ldScript.textContent = JSON.stringify(baseSchema);
  }
}

/* ============================================================================
 * 9. جلب البيانات من Firestore (مع دمج ذكي مع الإعدادات الافتراضية)
 * ============================================================================ */
function deepMergeSettings(remote = {}) {
  const merged = structuredClone(DEFAULT_SETTINGS);
  Object.keys(remote).forEach((k) => {
    if (k === "features" && remote.features) {
      merged.features = { ...merged.features, ...remote.features };
    } else if (k === "socialLinks" && remote.socialLinks) {
      merged.socialLinks = { ...merged.socialLinks, ...remote.socialLinks };
    } else if (k === "sectionsMeta" && remote.sectionsMeta) {
      Object.keys(remote.sectionsMeta).forEach((secId) => {
        if (merged.sectionsMeta[secId]) {
          merged.sectionsMeta[secId] = {
            ...merged.sectionsMeta[secId],
            ...remote.sectionsMeta[secId]
          };
        }
      });
    } else if (remote[k] !== undefined) {
      merged[k] = remote[k];
    }
  });
  return merged;
}

async function loadPlatformData() {
  try {
    const [settingsSnap, itemsSnap, quizzesSnap] = await Promise.allSettled([
      getDoc(doc(db, "settings", "global")),
      getDocs(query(collection(db, "items"), orderBy("createdAt", "desc"))),
      getDocs(query(collection(db, "quizzes"), orderBy("createdAt", "desc")))
    ]);

    if (settingsSnap.status === "fulfilled" && settingsSnap.value.exists()) {
      state.settings = deepMergeSettings(settingsSnap.value.data());
    }

    if (itemsSnap.status === "fulfilled" && !itemsSnap.value.empty) {
      const liveItems = itemsSnap.value.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((it) => !it.status || it.status === "published");
      if (liveItems.length > 0) {
        state.items = liveItems;
        state.usingFallbackItems = false;
      } else {
        state.items = FALLBACK_ITEMS;
        state.usingFallbackItems = true;
      }
    } else {
      state.items = FALLBACK_ITEMS;
      state.usingFallbackItems = true;
    }

    if (quizzesSnap.status === "fulfilled" && !quizzesSnap.value.empty) {
      const liveQuizzes = quizzesSnap.value.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((q) => !q.status || q.status === "published");
      if (liveQuizzes.length > 0) {
        state.quizzes = liveQuizzes;
        state.usingFallbackQuizzes = false;
      } else {
        state.quizzes = FALLBACK_QUIZZES;
        state.usingFallbackQuizzes = true;
      }
    } else {
      state.quizzes = FALLBACK_QUIZZES;
      state.usingFallbackQuizzes = true;
    }
  } catch (err) {
    console.warn("Lisan fallback mode:", err);
    state.items = FALLBACK_ITEMS;
    state.quizzes = FALLBACK_QUIZZES;
    state.usingFallbackItems = true;
    state.usingFallbackQuizzes = true;
  } finally {
    state.loading = false;
    applyGlobalShell();
  }
}

/* ============================================================================
 * 10. تطبيق الهوية العامة والمفاتيح (Feature Flags) على الغلاف الثابت
 * ============================================================================ */
function applyGlobalShell() {
  const s = state.settings;
  const f = s.features;

  // لون التمييز المرن من لوحة التحكم
  if (s.themeAccent) {
    document.documentElement.style.setProperty("--accent", s.themeAccent);
  }

  // الهوية في الشريط العلوي
  const brandTitle = document.getElementById("brand-title");
  const brandSub = document.getElementById("brand-subtitle");
  const logoWrap = document.getElementById("brand-logo-wrap");
  if (brandTitle) brandTitle.textContent = s.siteName;
  if (brandSub) brandSub.textContent = s.siteSubtitle;
  if (logoWrap && s.logoUrl) {
    logoWrap.innerHTML = `<img src="${escapeHtml(s.logoUrl)}" alt="${escapeHtml(s.siteName)}" class="brand-logo-img" />`;
  }

  // زر البحث العالمي (مربوط بمفتاح التحكم من لوحة التحكم)
  const searchBtn = document.getElementById("header-search-btn");
  if (searchBtn) {
    searchBtn.style.display = f.globalSearch ? "" : "none";
  }

  // شريط الإعلانات العلوي (اختياري)
  const annBar = document.getElementById("app-announcement");
  if (annBar) {
    if (f.announcements && s.announcementText && s.announcementText.trim()) {
      annBar.innerHTML = `<div class="container announcement-inner"><span>${escapeHtml(s.announcementText)}</span></div>`;
      annBar.hidden = false;
    } else {
      annBar.hidden = true;
    }
  }

  // التذييل وروابط التواصل
  const footerText = document.getElementById("footer-text");
  if (footerText) footerText.textContent = s.footerText;

  const footerSocials = document.getElementById("footer-socials");
  if (footerSocials) {
    const links = [];
    const socialMap = {
      twitter: "X / تويتر",
      telegram: "تيليجرام",
      youtube: "يوتيوب",
      facebook: "فيسبوك"
    };
    Object.entries(socialMap).forEach(([key, label]) => {
      if (s.socialLinks?.[key]) {
        links.push(`<a href="${escapeHtml(s.socialLinks[key])}" target="_blank" rel="noopener noreferrer" class="footer-social-pill">${label}</a>`);
      }
    });
    if (s.contactEmail) {
      links.push(`<a href="mailto:${escapeHtml(s.contactEmail)}" class="footer-social-pill">تواصل بريدي</a>`);
    }
    footerSocials.innerHTML = links.join("");
  }
}

/* ============================================================================
 * 11. نظام التوجيه النظيف (Clean URL Routing قابل للفهرسة من جوجل)
 * ============================================================================ */
function parseRouteFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get("item");
  const quizId = params.get("quiz");
  const sectionId = params.get("section");
  const branch = params.get("branch") || "الكل";

  if (itemId) {
    state.route = { view: "item", sectionId: sectionId || null, branch, itemId, quizId: null, searchQuery: "" };
  } else if (quizId) {
    state.route = { view: "quiz", sectionId: "quiz", branch, itemId: null, quizId, searchQuery: "" };
  } else if (sectionId && state.settings.sectionsMeta[sectionId]) {
    state.route = { view: "section", sectionId, branch, itemId: null, quizId: null, searchQuery: "" };
  } else {
    state.route = { view: "home", sectionId: null, branch: "الكل", itemId: null, quizId: null, searchQuery: "" };
  }
}

function navigateTo(routeUpdate, push = true) {
  cleanupVideoObserver();
  state.activeQuizSession = null;
  state.route = { ...state.route, ...routeUpdate };

  const params = new URLSearchParams();
  if (state.route.view === "section" && state.route.sectionId) {
    params.set("section", state.route.sectionId);
    if (state.route.branch && state.route.branch !== "الكل") {
      params.set("branch", state.route.branch);
    }
  } else if (state.route.view === "item" && state.route.itemId) {
    if (state.route.sectionId) params.set("section", state.route.sectionId);
    params.set("item", state.route.itemId);
  } else if (state.route.view === "quiz" && state.route.quizId) {
    params.set("section", "quiz");
    params.set("quiz", state.route.quizId);
  }

  const qs = params.toString();
  const nextUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  if (push) {
    window.history.pushState({ ...state.route }, "", nextUrl);
  }

  renderCurrentView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ============================================================================
 * 12. العرض الرئيسي حسب المسار (الكشف التدريجي — صفر ازدحام)
 * ============================================================================ */
function getEnabledSections() {
  return Object.values(state.settings.sectionsMeta)
    .filter((sec) => state.settings.features[sec.featureKey] !== false)
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
        <div class="sections-grid">
          ${Array(6).fill('<div class="glass-card skeleton-box"></div>').join("")}
        </div>
      </div>`;
    return;
  }

  switch (state.route.view) {
    case "section":
      renderSectionView(main, state.route.sectionId);
      break;
    case "item":
      renderItemDetailView(main, state.route.itemId);
      break;
    case "quiz":
      renderQuizPlayerView(main, state.route.quizId);
      break;
    default:
      renderHomeView(main);
  }
}

/* ---------- 12.1 الواجهة الرئيسية (النظيفة — 6 صناديق مرتبة) ---------- */
function renderHomeView(container) {
  const s = state.settings;
  const f = s.features;
  const sections = getEnabledSections();

  updateSEO({
    title: "",
    description: `${s.siteSubtitle} — ${s.siteTagline}`,
    type: "website"
  });

  const totalResources = state.items.length + state.quizzes.length;

  container.innerHTML = `
    <section class="hero-section container">
      <div class="glass-hero">
        <span class="hero-pill">${ICONS.sparkles} ${escapeHtml(s.audienceBadge)}</span>
        <h1 class="hero-title">${escapeHtml(s.siteName)}</h1>
        <p class="hero-subtitle">${escapeHtml(s.siteSubtitle)}</p>
        <p class="hero-tagline">${escapeHtml(s.siteTagline)}</p>

        ${f.globalSearch ? `
          <div class="hero-search-trigger-wrap">
            <button type="button" class="hero-search-bar" id="hero-open-search" aria-label="البحث الذكي في المنصة">
              <span class="search-icon">${ICONS.search}</span>
              <span class="search-placeholder">ابحث بذكاء في الكتب، المصطلحات، المحاضرات، والأبحاث...</span>
              <kbd class="search-kbd">/</kbd>
            </button>
          </div>
        ` : ""}

        ${f.statsBar ? `
          <div class="hero-stats">
            <div class="stat-pill"><strong>${sections.length}</strong><span>أقسام متخصصة</span></div>
            <div class="stat-pill"><strong>${totalResources}</strong><span>مادة ومعرفة لسانية</span></div>
            <div class="stat-pill"><strong>${state.quizzes.length}</strong><span>اختبارات تفاعلية</span></div>
          </div>
        ` : ""}
      </div>
    </section>

    <section class="container sections-wrapper" aria-label="أقسام منصة لسان">
      <div class="section-heading-row">
        <div>
          <h2 class="section-main-heading">أقسام المنصة</h2>
          <p class="section-sub-heading">اختر القِسم للدخول إلى فروعه ومواده المرتبة بهدوء.</p>
        </div>
      </div>

      <div class="sections-grid">
        ${sections.map((sec) => {
          const count = countItemsInSection(sec.id);
          const branchesPreview = (sec.branches || []).slice(0, 3);
          return `
            <article class="glass-card section-box" data-open-section="${sec.id}" tabindex="0" role="button" aria-label="فتح قسم ${escapeHtml(sec.title)}">
              <div class="section-box-top">
                <div class="section-icon-badge" style="--sec-accent: ${sec.accent || '#0071e3'}">
                  ${ICONS[sec.icon] || ICONS.book}
                </div>
                <span class="section-count-badge">${count} مادة</span>
              </div>
              <h3 class="section-box-title">${escapeHtml(sec.title)}</h3>
              <p class="section-box-desc">${escapeHtml(sec.shortDesc)}</p>
              <div class="section-mini-branches">
                ${branchesPreview.map((b) => `<span class="mini-branch-chip">${escapeHtml(b)}</span>`).join("")}
                ${(sec.branches || []).length > 3 ? `<span class="mini-branch-chip more">+${sec.branches.length - 3}</span>` : ""}
              </div>
              <div class="section-box-footer">
                <span>استكشاف القسم</span>
                <span class="arrow-icon">${ICONS.arrowLeft}</span>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;

  // ربط النقر على بطاقات الأقسام
  container.querySelectorAll("[data-open-section]").forEach((card) => {
    const open = () => navigateTo({ view: "section", sectionId: card.dataset.openSection, branch: "الكل" });
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });

  const heroSearch = document.getElementById("hero-open-search");
  if (heroSearch) heroSearch.addEventListener("click", openGlobalSearchModal);
}

/* ---------- 12.2 واجهة القسم الداخلي (الكرتون المفتوح + الفروع + بحث القسم) ---------- */
function renderSectionView(container, sectionId) {
  const sec = state.settings.sectionsMeta[sectionId];
  if (!sec || state.settings.features[sec.featureKey] === false) {
    navigateTo({ view: "home" }, false);
    return;
  }

  updateSEO({
    title: sec.title,
    description: sec.shortDesc,
    type: "website",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: sec.title,
      description: sec.shortDesc,
      url: window.location.href,
      inLanguage: "ar"
    }
  });

  const branches = ["الكل", ...(sec.branches || [])];
  const isQuizSection = sectionId === "quiz";
  const isDictionary = sectionId === "dictionary";
  const isExchange = sectionId === "exchange";
  const showSubmitBtn = isExchange && state.settings.features.studentSubmissions;

  container.innerHTML = `
    <div class="container section-page">
      <nav class="breadcrumb-bar" aria-label="مسار التنقل">
        <button type="button" class="crumb-btn" id="back-home-btn">${ICONS.arrowRight} الرئيسية</button>
        <span class="crumb-sep">/</span>
        <span class="crumb-current">${escapeHtml(sec.title)}</span>
      </nav>

      <header class="glass-card section-banner" style="--sec-accent: ${sec.accent || '#0071e3'}">
        <div class="section-banner-content">
          <div class="section-icon-badge large">${ICONS[sec.icon] || ICONS.book}</div>
          <div>
            <h1 class="section-page-title">${escapeHtml(sec.title)}</h1>
            <p class="section-page-desc">${escapeHtml(sec.shortDesc)}</p>
          </div>
        </div>
        ${showSubmitBtn ? `
          <button type="button" class="btn-primary-glass" id="open-submission-btn">
            ${ICONS.plus} شارك مشروعك أو تجربتك
          </button>
        ` : ""}
      </header>

      <div class="section-controls-bar glass-panel">
        <div class="branch-tabs" role="tablist" aria-label="فروع القسم">
          ${branches.map((b) => `
            <button type="button" role="tab"
              class="branch-tab ${state.route.branch === b ? "active" : ""}"
              data-branch="${escapeHtml(b)}">
              ${escapeHtml(b)}
            </button>
          `).join("")}
        </div>

        <div class="local-search-box">
          <span class="search-icon">${ICONS.search}</span>
          <input type="search" id="section-smart-search"
            placeholder="ابحث داخل ${escapeHtml(sec.title)}..."
            value="${escapeHtml(state.route.searchQuery || "")}"
            autocomplete="off" />
        </div>
      </div>

      <div id="section-results-grid" class="${isDictionary ? "dictionary-list" : "cards-grid"}"></div>
    </div>
  `;

  document.getElementById("back-home-btn")?.addEventListener("click", () => {
    navigateTo({ view: "home", sectionId: null, branch: "الكل" });
  });

  document.getElementById("open-submission-btn")?.addEventListener("click", openSubmissionModal);

  const searchInput = document.getElementById("section-smart-search");
  const updateGrid = () => {
    const q = searchInput ? searchInput.value : "";
    state.route.searchQuery = q;
    const grid = document.getElementById("section-results-grid");
    if (!grid) return;

    if (isQuizSection) {
      let list = state.quizzes;
      if (state.route.branch !== "الكل") {
        list = list.filter((x) => x.branch === state.route.branch);
      }
      list = smartSearchItems(q, list);
      renderQuizzesGrid(grid, list);
    } else {
      let list = state.items.filter((it) => it.sectionId === sectionId);
      if (state.route.branch !== "الكل") {
        list = list.filter((it) => it.branch === state.route.branch);
      }
      list = smartSearchItems(q, list);
      if (isDictionary) {
        renderDictionaryList(grid, list);
      } else {
        renderItemsCardsGrid(grid, list, sec);
      }
    }
  };

  container.querySelectorAll(".branch-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      container.querySelectorAll(".branch-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      state.route.branch = tab.dataset.branch;
      // تحديث الرابط بدون إعادة رسم الصفحة بالكامل
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
    grid.innerHTML = `
      <div class="glass-card empty-state">
        <p>لا توجد مواد مطابقة في هذا الفرع حالياً.</p>
      </div>`;
    return;
  }

  grid.innerHTML = list.map((item) => {
    const hasVideo = Boolean(extractYouTubeId(item.youtubeUrl));
    const hasPdf = Boolean(item.pdfUrl);
    return `
      <article class="glass-card content-card" data-open-item="${escapeHtml(item.id)}" tabindex="0" role="button">
        ${item.coverUrl ? `
          <div class="content-card-media">
            <img src="${escapeHtml(item.coverUrl)}" alt="${escapeHtml(item.title)}" loading="lazy" />
          </div>
        ` : ""}
        <div class="content-card-body">
          <div class="card-meta-row">
            <span class="branch-badge">${escapeHtml(item.branch || sec.title)}</span>
            <div class="media-badges">
              ${hasVideo ? `<span class="type-pill video">${ICONS.video} فيديو</span>` : ""}
              ${hasPdf ? `<span class="type-pill pdf">${ICONS.pdf} PDF</span>` : ""}
            </div>
          </div>
          <h3 class="content-card-title">${escapeHtml(item.title)}</h3>
          ${item.subtitle ? `<p class="content-card-sub">${escapeHtml(item.subtitle)}</p>` : ""}
          <p class="content-card-summary">${escapeHtml(item.summary || stripHtml(item.bodyHtml).slice(0, 140))}</p>
          <div class="content-card-footer">
            <span class="meta-stat">${ICONS.eye} ${item.views || 0}</span>
            <span class="read-more-link">قراءة وفتح ${ICONS.arrowLeft}</span>
          </div>
        </div>
      </article>
    `;
  }).join("");

  grid.querySelectorAll("[data-open-item]").forEach((card) => {
    const open = () => navigateTo({
      view: "item",
      sectionId: sec.id,
      itemId: card.dataset.openItem
    });
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });
}

function renderDictionaryList(grid, list) {
  if (!list.length) {
    grid.innerHTML = `<div class="glass-card empty-state"><p>لم يُعثر على مصطلح مطابق لبحثك.</p></div>`;
    return;
  }

  grid.innerHTML = list.map((term) => `
    <article class="glass-card term-card" data-open-item="${escapeHtml(term.id)}" tabindex="0" role="button">
      <div class="term-card-header">
        <div>
          <h3 class="term-title">${escapeHtml(term.title)}</h3>
          ${term.subtitle ? `<span class="term-en" dir="ltr">${escapeHtml(term.subtitle)}</span>` : ""}
        </div>
        <span class="branch-badge">${escapeHtml(term.branch || "معجم")}</span>
      </div>
      <p class="term-brief">${escapeHtml(term.summary || stripHtml(term.bodyHtml).slice(0, 180))}</p>
      <div class="term-footer">
        <div class="tags-inline">
          ${(term.tags || []).slice(0, 3).map((tg) => `<span class="tag-chip">#${escapeHtml(tg)}</span>`).join("")}
        </div>
        <span class="read-more-link">التفاصيل الكاملة ${ICONS.arrowLeft}</span>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("[data-open-item]").forEach((card) => {
    const open = () => navigateTo({ view: "item", sectionId: "dictionary", itemId: card.dataset.openItem });
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });
}

function renderQuizzesGrid(grid, list) {
  if (!list.length) {
    grid.innerHTML = `<div class="glass-card empty-state"><p>لا توجد اختبارات مضافة في هذا الفرع بعد.</p></div>`;
    return;
  }

  grid.innerHTML = list.map((q) => `
    <article class="glass-card quiz-card" data-open-quiz="${escapeHtml(q.id)}" tabindex="0" role="button">
      <div class="card-meta-row">
        <span class="branch-badge">${escapeHtml(q.branch || "اختبار")}</span>
        <span class="difficulty-pill">${escapeHtml(q.difficulty || "متوسط")}</span>
      </div>
      <h3 class="content-card-title">${escapeHtml(q.title)}</h3>
      <p class="content-card-summary">${escapeHtml(q.description || "")}</p>
      <div class="content-card-footer">
        <span class="meta-stat">${(q.questions || []).length} أسئلة</span>
        <span class="read-more-link">بدء الاختبار ${ICONS.arrowLeft}</span>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("[data-open-quiz]").forEach((card) => {
    const open = () => navigateTo({ view: "quiz", sectionId: "quiz", quizId: card.dataset.openQuiz });
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });
}

/* ---------- 12.3 صفحة القراءة الأكاديمية الفخمة + يوتيوب الذكي + عارض PDF ---------- */
function renderItemDetailView(container, itemId) {
  const item = state.items.find((x) => x.id === itemId);
  if (!item) {
    container.innerHTML = `
      <div class="container">
        <div class="glass-card empty-state">
          <h2>المادة غير موجودة أو تم نقلها</h2>
          <button type="button" class="btn-primary-glass" id="go-home-404">العودة للرئيسية</button>
        </div>
      </div>`;
    document.getElementById("go-home-404")?.addEventListener("click", () => navigateTo({ view: "home" }));
    return;
  }

  const sec = state.settings.sectionsMeta[item.sectionId] || state.settings.sectionsMeta.library;
  const f = state.settings.features;
  const ytId = extractYouTubeId(item.youtubeUrl);
  const pdfEmbed = buildPdfEmbedUrl(item.pdfUrl);
  const readMins = estimateReadingMinutes(item.bodyHtml);
  const safeHtml = sanitizeAndLinkifyHtml(item.bodyHtml || "");

  // زيادة عداد المشاهدات بهدوء (مرة واحدة في الجلسة)
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
    image: item.coverUrl || "",
    type: "article",
    schemaData: {
      "@context": "https://schema.org",
      "@type": item.sectionId === "dictionary" ? "DefinedTerm" : "ScholarlyArticle",
      name: item.title,
      headline: item.title,
      description: item.summary || "",
      inLanguage: "ar",
      url: window.location.href
    }
  });

  container.innerHTML = `
    <article class="container reader-page">
      <nav class="breadcrumb-bar" aria-label="مسار التنقل">
        <button type="button" class="crumb-btn" id="crumb-home">${ICONS.arrowRight} الرئيسية</button>
        <span class="crumb-sep">/</span>
        <button type="button" class="crumb-btn" id="crumb-sec">${escapeHtml(sec.title)}</button>
        <span class="crumb-sep">/</span>
        <span class="crumb-current">${escapeHtml(item.branch || "")}</span>
      </nav>

      <div class="glass-card reader-shell">
        <header class="reader-header">
          <div class="reader-top-badges">
            <span class="branch-badge">${escapeHtml(item.branch || sec.title)}</span>
            ${item.createdAt ? `<span class="meta-stat">${formatArabicDate(item.createdAt)}</span>` : ""}
            <span class="meta-stat">${ICONS.clock} ${readMins} د قراءة</span>
            <span class="meta-stat">${ICONS.eye} ${item.views || 0}</span>
          </div>

          <h1 class="reader-title">${escapeHtml(item.title)}</h1>
          ${item.subtitle ? `<p class="reader-subtitle">${escapeHtml(item.subtitle)}</p>` : ""}
          ${item.summary ? `<p class="reader-lead">${escapeHtml(item.summary)}</p>` : ""}

          <div class="reader-toolbar">
            ${f.fontControls ? `
              <div class="font-controls" aria-label="التحكم بحجم الخط">
                <button type="button" class="tool-btn" id="font-dec" title="تصغير الخط">A-</button>
                <span class="font-size-label" id="font-size-val">${state.readerFontSize}px</span>
                <button type="button" class="tool-btn" id="font-inc" title="تكبير الخط">A+</button>
              </div>
            ` : ""}
            ${f.shareButtons ? `
              <button type="button" class="tool-btn" id="share-item-btn">${ICONS.share} مشاركة الرابط</button>
            ` : ""}
          </div>
        </header>

        ${item.coverUrl ? `
          <figure class="reader-cover">
            <img src="${escapeHtml(item.coverUrl)}" alt="${escapeHtml(item.title)}" />
          </figure>
        ` : ""}

        ${ytId ? `
          <section class="smart-video-section" aria-label="مشغل الفيديو الذكي">
            <div class="smart-player-frame" data-smart-yt="${ytId}">
              <iframe
                id="yt-iframe-${ytId}"
                src="https://www.youtube.com/embed/${ytId}?enablejsapi=1&rel=0&modestbranding=1"
                title="${escapeHtml(item.title)}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowfullscreen>
              </iframe>
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

        ${safeHtml.trim() ? `
          <div class="academic-prose" id="academic-prose-body" style="font-size: ${state.readerFontSize}px">
            ${safeHtml}
          </div>
        ` : ""}

        ${pdfEmbed ? `
          <section class="smart-pdf-section" aria-label="قارئ ملف PDF">
            <div class="pdf-toolbar">
              <div class="pdf-title-wrap">${ICONS.pdf} <strong>الوثيقة المرفقة (قارئ PDF)</strong></div>
              <div class="pdf-actions">
                <a href="${escapeHtml(item.pdfUrl)}" target="_blank" rel="noopener noreferrer" class="tool-btn lisan-auto-link">
                  ${ICONS.external} فتح في نافذة مستقلة
                </a>
              </div>
            </div>
            <div class="pdf-frame-wrap">
              <iframe src="${escapeHtml(pdfEmbed)}" title="قارئ PDF - ${escapeHtml(item.title)}" loading="lazy" allowfullscreen></iframe>
            </div>
          </section>
        ` : ""}

        ${item.externalUrl ? `
          <div class="external-resource-box">
            <div>
              <strong>رابط المرجع أو المصدر الخارجي</strong>
              <p>${escapeHtml(item.externalUrl)}</p>
            </div>
            <a href="${escapeHtml(item.externalUrl)}" target="_blank" rel="noopener noreferrer" class="btn-primary-glass lisan-auto-link">
              ${ICONS.external} الانتقال للمصدر
            </a>
          </div>
        ` : ""}

        ${(item.tags && item.tags.length) ? `
          <footer class="reader-tags">
            ${item.tags.map((tg) => `<span class="tag-chip">#${escapeHtml(tg)}</span>`).join("")}
          </footer>
        ` : ""}
      </div>
    </article>
  `;

  document.getElementById("crumb-home")?.addEventListener("click", () => navigateTo({ view: "home" }));
  document.getElementById("crumb-sec")?.addEventListener("click", () => {
    navigateTo({ view: "section", sectionId: sec.id, branch: "الكل" });
  });

  // أزرار التحكم بحجم الخط الأكاديمي
  const prose = document.getElementById("academic-prose-body");
  const sizeVal = document.getElementById("font-size-val");
  document.getElementById("font-inc")?.addEventListener("click", () => {
    state.readerFontSize = Math.min(26, state.readerFontSize + 2);
    if (prose) prose.style.fontSize = `${state.readerFontSize}px`;
    if (sizeVal) sizeVal.textContent = `${state.readerFontSize}px`;
  });
  document.getElementById("font-dec")?.addEventListener("click", () => {
    state.readerFontSize = Math.max(14, state.readerFontSize - 2);
    if (prose) prose.style.fontSize = `${state.readerFontSize}px`;
    if (sizeVal) sizeVal.textContent = `${state.readerFontSize}px`;
  });

  // زر المشاركة
  document.getElementById("share-item-btn")?.addEventListener("click", async () => {
    const shareData = { title: item.title, text: item.summary || item.title, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("تم نسخ رابط المادة بنجاح");
    } catch {
      showToast("انسخ الرابط من شريط العنوان بالأعلى");
    }
  });

  // تفعيل مشغل يوتيوب الذكي (أزرار + إيقاف تلقائي عند التمرير)
  if (ytId) {
    setupSmartYouTubePlayers(container);
  }
}

/* ============================================================================
 * 13. مشغل يوتيوب الذكي (إيقاف تلقائي عند التمرير خارج الشاشة)
 * ============================================================================ */
function sendYouTubeCommand(iframe, func) {
  if (!iframe || !iframe.contentWindow) return;
  iframe.contentWindow.postMessage(
    JSON.stringify({ event: "command", func, args: "" }),
    "*"
  );
}

function cleanupVideoObserver() {
  if (state.videoObserver) {
    state.videoObserver.disconnect();
    state.videoObserver = null;
  }
}

function setupSmartYouTubePlayers(root) {
  cleanupVideoObserver();

  root.querySelectorAll("[data-yt-cmd]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const iframe = document.getElementById(btn.dataset.ytTarget);
      sendYouTubeCommand(iframe, btn.dataset.ytCmd);
    });
  });

  const frames = root.querySelectorAll(".smart-player-frame");
  if (!frames.length || !("IntersectionObserver" in window)) return;

  state.videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const iframe = entry.target.querySelector("iframe");
        const ytId = entry.target.dataset.smartYt;
        const statusEl = document.getElementById(`yt-status-${ytId}`);
        if (!entry.isIntersecting || entry.intersectionRatio < 0.35) {
          sendYouTubeCommand(iframe, "pauseVideo");
          if (statusEl) statusEl.textContent = "تم إيقاف الفيديو تلقائياً لتمرير الشاشة بعيداً عنه";
        } else {
          if (statusEl) statusEl.textContent = "المشغل الذكي نشط — يتوقف تلقائياً عند التمرير";
        }
      });
    },
    { threshold: [0, 0.35, 0.6] }
  );

  frames.forEach((f) => state.videoObserver.observe(f));
}

/* ============================================================================
 * 14. محرك الاختبارات التفاعلي الذكي (اختبر معارفك)
 * ============================================================================ */
function renderQuizPlayerView(container, quizId) {
  const quiz = state.quizzes.find((q) => q.id === quizId);
  if (!quiz || !quiz.questions || !quiz.questions.length) {
    navigateTo({ view: "section", sectionId: "quiz", branch: "الكل" }, false);
    return;
  }

  updateSEO({
    title: quiz.title,
    description: quiz.description || "اختبار تفاعلي في اللسانيات العربية"
  });

  state.activeQuizSession = {
    quiz,
    index: 0,
    answers: [], // { selected, correct }
    locked: false
  };

  renderQuizStep(container);
}

function renderQuizStep(container) {
  const session = state.activeQuizSession;
  const { quiz, index } = session;
  const total = quiz.questions.length;

  // شاشة النتيجة النهائية
  if (index >= total) {
    const score = session.answers.filter((a) => a.correct).length;
    const pct = Math.round((score / total) * 100);
    const feedback = pct >= 85
      ? "أداء لساني متميز جداً!"
      : pct >= 60
        ? "نتيجة جيدة، يمكنك مراجعة الشروحات لتثبيت المفاهيم."
        : "بداية جيدة، راجع الملخصات في المكتبة ثم أعد المحاولة.";

    container.innerHTML = `
      <div class="container quiz-page">
        <div class="glass-card quiz-result-card">
          <span class="hero-pill">النتيجة النهائية</span>
          <div class="score-circle">${pct}%</div>
          <h2>${escapeHtml(quiz.title)}</h2>
          <p class="quiz-result-summary">أجبت بشكل صحيح على <strong>${score}</strong> من أصل <strong>${total}</strong> أسئلة.</p>
          <p class="quiz-feedback-msg">${feedback}</p>

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

    document.getElementById("retry-quiz-btn")?.addEventListener("click", () => {
      renderQuizPlayerView(container, quiz.id);
    });
    document.getElementById("back-quizzes-btn")?.addEventListener("click", () => {
      navigateTo({ view: "section", sectionId: "quiz", branch: "الكل" });
    });
    return;
  }

  const currentQ = quiz.questions[index];
  const progress = Math.round(((index) / total) * 100);

  container.innerHTML = `
    <div class="container quiz-page">
      <nav class="breadcrumb-bar">
        <button type="button" class="crumb-btn" id="quiz-back-sec">${ICONS.arrowRight} اختبر معارفك</button>
        <span class="crumb-sep">/</span>
        <span class="crumb-current">${escapeHtml(quiz.title)}</span>
      </nav>

      <div class="glass-card quiz-box">
        <div class="quiz-progress-head">
          <span>السؤال ${index + 1} من ${total}</span>
          <span>${progress}%</span>
        </div>
        <div class="quiz-progress-track">
          <div class="quiz-progress-fill" style="width: ${progress}%"></div>
        </div>

        <h2 class="quiz-question-text">${escapeHtml(currentQ.question)}</h2>

        <div class="quiz-options-list">
          ${currentQ.options.map((opt, optIdx) => `
            <button type="button" class="quiz-option-btn" data-opt="${optIdx}">
              <span class="opt-letter">${["أ", "ب", "ج", "د"][optIdx] || optIdx + 1}</span>
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

  document.getElementById("quiz-back-sec")?.addEventListener("click", () => {
    navigateTo({ view: "section", sectionId: "quiz", branch: "الكل" });
  });

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

      if (feedbackBox) {
        feedbackBox.hidden = false;
        feedbackBox.className = `quiz-instant-feedback ${isCorrect ? "ok" : "bad"}`;
        feedbackBox.innerHTML = `
          <strong>${isCorrect ? "إجابة صحيحة!" : "إجابة غير دقيقة"}</strong>
          ${currentQ.explanation ? `<p>${escapeHtml(currentQ.explanation)}</p>` : ""}
        `;
      }
      if (nextBtn) nextBtn.hidden = false;
    });
  });

  nextBtn?.addEventListener("click", () => {
    session.index += 1;
    session.locked = false;
    renderQuizStep(container);
  });
}

/* ============================================================================
 * 15. نافذة البحث العالمي الذكي (Spotlight Glass Search)
 * ============================================================================ */
function openGlobalSearchModal() {
  if (!state.settings.features.globalSearch) return;
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
  if (!q) {
    const enabledSecs = getEnabledSections();
    listEl.innerHTML = `
      <div class="spotlight-hint">
        <p>ابدأ الكتابة للبحث الفوري في كل الأقسام (يدعم البحث بدون تشكيل أو همزات).</p>
        <div class="spotlight-quick-chips">
          ${enabledSecs.map((s) => `<button type="button" class="mini-branch-chip" data-jump-sec="${s.id}">${escapeHtml(s.title)}</button>`).join("")}
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

  // استبعاد الأقسام المخفية من نتائج البحث احتراماً لمفاتيح لوحة التحكم
  const enabledSecIds = new Set(getEnabledSections().map((s) => s.id));
  const searchableItems = state.items.filter((it) => enabledSecIds.has(it.sectionId));
  const matchedItems = smartSearchItems(q, searchableItems).slice(0, 12);
  const matchedQuizzes = enabledSecIds.has("quiz")
    ? smartSearchItems(q, state.quizzes).slice(0, 5)
    : [];

  if (!matchedItems.length && !matchedQuizzes.length) {
    listEl.innerHTML = `<div class="spotlight-empty">لا توجد نتائج مطابقة لـ "<strong>${escapeHtml(q)}</strong>". جرّب كلمات مفتاحية أخرى.</div>`;
    return;
  }

  listEl.innerHTML = `
    ${matchedItems.map((it) => {
      const sec = state.settings.sectionsMeta[it.sectionId];
      return `
        <button type="button" class="spotlight-row" data-hit-item="${escapeHtml(it.id)}" data-hit-sec="${escapeHtml(it.sectionId)}">
          <div class="spotlight-row-main">
            <strong>${escapeHtml(it.title)}</strong>
            <span>${escapeHtml(it.summary || it.subtitle || "")}</span>
          </div>
          <span class="branch-badge">${escapeHtml(sec?.title || "")}</span>
        </button>
      `;
    }).join("")}
    ${matchedQuizzes.map((qz) => `
      <button type="button" class="spotlight-row" data-hit-quiz="${escapeHtml(qz.id)}">
        <div class="spotlight-row-main">
          <strong>${escapeHtml(qz.title)}</strong>
          <span>${escapeHtml(qz.description || "اختبار تفاعلي")}</span>
        </div>
        <span class="branch-badge">اختبر معارفك</span>
      </button>
    `).join("")}
  `;

  listEl.querySelectorAll("[data-hit-item]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeGlobalSearchModal();
      navigateTo({ view: "item", sectionId: btn.dataset.hitSec, itemId: btn.dataset.hitItem });
    });
  });
  listEl.querySelectorAll("[data-hit-quiz]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeGlobalSearchModal();
      navigateTo({ view: "quiz", sectionId: "quiz", quizId: btn.dataset.hitQuiz });
    });
  });
}

/* ============================================================================
 * 16. إشعار الانتقال الآمن للروابط الخارجية (External Link Guard)
 * ============================================================================ */
function setupExternalLinkInterceptor() {
  document.addEventListener("click", (e) => {
    const anchor = e.target.closest("a[href]");
    if (!anchor) return;
    if (!state.settings.features.externalLinkWarning) return;

    const href = anchor.getAttribute("href") || "";
    if (!/^https?:\/\//i.test(href)) return;

    try {
      const urlObj = new URL(href);
      if (urlObj.origin === window.location.origin) return;
      e.preventDefault();
      state.pendingExternalUrl = href;
      const modal = document.getElementById("external-link-modal");
      const preview = document.getElementById("external-link-url");
      if (preview) preview.textContent = href;
      if (modal) modal.hidden = false;
    } catch {
      // رابط غير قياسي
    }
  });

  document.getElementById("cancel-external-btn")?.addEventListener("click", closeExternalModal);
  document.getElementById("confirm-external-btn")?.addEventListener("click", () => {
    if (state.pendingExternalUrl) {
      window.open(state.pendingExternalUrl, "_blank", "noopener,noreferrer");
    }
    closeExternalModal();
  });
}

function closeExternalModal() {
  state.pendingExternalUrl = null;
  const modal = document.getElementById("external-link-modal");
  if (modal) modal.hidden = true;
}

/* ============================================================================
 * 17. نافذة مشاركة مشاريع وتجارب الطلبة (فضاء التبادل العلمي)
 * ============================================================================ */
function openSubmissionModal() {
  const modal = document.getElementById("submission-modal");
  if (modal) modal.hidden = false;
}

function closeSubmissionModal() {
  const modal = document.getElementById("submission-modal");
  if (modal) modal.hidden = true;
}

function setupSubmissionForm() {
  const form = document.getElementById("student-submission-form");
  document.getElementById("close-submission-btn")?.addEventListener("click", closeSubmissionModal);

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const name = document.getElementById("sub-student-name")?.value.trim();
    const branch = document.getElementById("sub-branch")?.value;
    const title = document.getElementById("sub-title")?.value.trim();
    const details = document.getElementById("sub-details")?.value.trim();
    const link = document.getElementById("sub-link")?.value.trim();

    if (!name || !title || !details) {
      showToast("يرجى إكمال الحقول الأساسية المطلوبة");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "جارٍ الإرسال...";

    try {
      await addDoc(collection(db, "items"), {
        sectionId: "exchange",
        branch: branch || "عرض مشاريع الطلبة",
        title,
        subtitle: `مساهمة: ${name}`,
        summary: details.slice(0, 180),
        contentType: "article",
        bodyHtml: `<p>${escapeHtml(details).replace(/\n/g, "</p><p>")}</p>`,
        externalUrl: link || "",
        pdfUrl: "",
        youtubeUrl: "",
        coverUrl: "",
        tags: ["مساهمة طلابية"],
        status: "pending", // بانتظار اعتماد المشرف من لوحة التحكم
        views: 0,
        createdAt: new Date().toISOString(),
        submittedAt: serverTimestamp()
      });
      form.reset();
      closeSubmissionModal();
      showToast("تم إرسال مساهمتك بنجاح! ستظهر فور مراجعتها واعتمادها.");
    } catch (err) {
      console.error(err);
      showToast("تعذر الإرسال حالياً، يرجى المحاولة لاحقاً.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "إرسال للمراجعة";
    }
  });
}

/* ============================================================================
 * 18. الإشعارات الزجاجية اللطيفة (Toast)
 * ============================================================================ */
function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "glass-toast";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 20);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3400);
}

/* ============================================================================
 * 19. نقطة الانطلاق وربط الأحداث العامة
 * ============================================================================ */
async function init() {
  // ربط أحداث الشريط العلوي والنوافذ المنبثقة
  document.getElementById("brand-home-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo({ view: "home", sectionId: null, branch: "الكل" });
  });

  document.getElementById("header-search-btn")?.addEventListener("click", openGlobalSearchModal);
  document.getElementById("close-search-modal")?.addEventListener("click", closeGlobalSearchModal);
  document.getElementById("global-search-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "global-search-modal") closeGlobalSearchModal();
  });
  document.getElementById("global-search-input")?.addEventListener("input", (e) => {
    renderGlobalSearchResults(e.target.value);
  });

  // اختصار لوحة المفاتيح للبحث الذكي ( / أو Ctrl+K ) و Escape للإغلاق
  document.addEventListener("keydown", (e) => {
    if ((e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      openGlobalSearchModal();
    } else if (e.key === "Escape") {
      closeGlobalSearchModal();
      closeExternalModal();
      closeSubmissionModal();
    }
  });

  window.addEventListener("popstate", () => {
    parseRouteFromUrl();
    renderCurrentView();
  });

  setupExternalLinkInterceptor();
  setupSubmissionForm();

  // رسم هيكل التحميل المبدئي ثم جلب البيانات الحية
  renderCurrentView();
  await loadPlatformData();
  parseRouteFromUrl();
  renderCurrentView();
}

document.addEventListener("DOMContentLoaded", init);
