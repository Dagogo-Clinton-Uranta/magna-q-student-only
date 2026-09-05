import type { AppLocale } from "./config";

export type MessageKey =
  | "shell.learningWorkspace"
  | "auth.signOut"
  | "nav.main"
  | "nav.mobile"
  | "nav.overview"
  | "nav.getFeatured"
  | "nav.practiceTests"
  | "nav.interviewPractice"
  | "nav.resources"
  | "nav.guidelines"
  | "nav.communityBlogs"
  | "nav.chatRooms"
  | "nav.feedback"
  | "nav.profile"
  | "nav.settings"
  | "settings.pageTitle"
  | "settings.preferences"
  | "settings.appSettings"
  | "settings.intro"
  | "settings.darkMode"
  | "settings.darkModeDescription"
  | "settings.language"
  | "settings.languageDescription"
  | "settings.contentNotice"
  | "settings.saving"
  | "settings.saved"
  | "settings.saveError"
  | "settings.emailNotifications"
  | "settings.emailNotificationsDescription"
  | "settings.emailComingSoon";

type MessagePack = Readonly<Record<MessageKey, string>>;

const en: MessagePack = {
  "shell.learningWorkspace": "Learning workspace",
  "auth.signOut": "Sign out",
  "nav.main": "Main navigation",
  "nav.mobile": "Mobile navigation",
  "nav.overview": "Overview",
  "nav.getFeatured": "Get Featured",
  "nav.practiceTests": "Practice tests",
  "nav.interviewPractice": "Interview practice",
  "nav.resources": "Resources",
  "nav.guidelines": "Guidelines",
  "nav.communityBlogs": "Community blogs",
  "nav.chatRooms": "Chat rooms",
  "nav.feedback": "Feedback",
  "nav.profile": "Profile",
  "nav.settings": "Settings",
  "settings.pageTitle": "Settings",
  "settings.preferences": "Preferences",
  "settings.appSettings": "App settings",
  "settings.intro":
    "Choose how Magna-Q looks and how you would like to hear from us.",
  "settings.darkMode": "Dark mode",
  "settings.darkModeDescription":
    "Use a darker colour palette across the entire site.",
  "settings.language": "Study language",
  "settings.languageDescription":
    "Choose the language used for navigation and supported learning content.",
  "settings.contentNotice":
    "Medical questions and articles remain in their original language until a reviewed translation is available.",
  "settings.saving": "Saving language…",
  "settings.saved": "Language preference saved.",
  "settings.saveError": "We could not save your language. Please try again.",
  "settings.emailNotifications": "Turn on email notifications",
  "settings.emailNotificationsDescription":
    "Receive useful account and study updates by email.",
  "settings.emailComingSoon":
    "Email notifications are coming in the next patch.",
};

const es: MessagePack = {
  "shell.learningWorkspace": "Espacio de aprendizaje",
  "auth.signOut": "Cerrar sesión",
  "nav.main": "Navegación principal",
  "nav.mobile": "Navegación móvil",
  "nav.overview": "Resumen",
  "nav.getFeatured": "Comparte tu historia",
  "nav.practiceTests": "Pruebas de práctica",
  "nav.interviewPractice": "Práctica de entrevistas",
  "nav.resources": "Recursos",
  "nav.guidelines": "Guías",
  "nav.communityBlogs": "Blogs de la comunidad",
  "nav.chatRooms": "Salas de chat",
  "nav.feedback": "Comentarios",
  "nav.profile": "Perfil",
  "nav.settings": "Configuración",
  "settings.pageTitle": "Configuración",
  "settings.preferences": "Preferencias",
  "settings.appSettings": "Configuración de la aplicación",
  "settings.intro":
    "Elige cómo se ve Magna-Q y cómo deseas recibir nuestras comunicaciones.",
  "settings.darkMode": "Modo oscuro",
  "settings.darkModeDescription":
    "Usa una paleta de colores más oscura en todo el sitio.",
  "settings.language": "Idioma de estudio",
  "settings.languageDescription":
    "Elige el idioma de la navegación y del contenido educativo compatible.",
  "settings.contentNotice":
    "Las preguntas y los artículos médicos permanecen en su idioma original hasta que haya una traducción revisada.",
  "settings.saving": "Guardando idioma…",
  "settings.saved": "Preferencia de idioma guardada.",
  "settings.saveError": "No pudimos guardar el idioma. Inténtalo de nuevo.",
  "settings.emailNotifications": "Activar notificaciones por correo",
  "settings.emailNotificationsDescription":
    "Recibe actualizaciones útiles sobre tu cuenta y tus estudios por correo.",
  "settings.emailComingSoon":
    "Las notificaciones por correo llegarán en la próxima actualización.",
};

const pt: MessagePack = {
  "shell.learningWorkspace": "Espaço de aprendizagem",
  "auth.signOut": "Terminar sessão",
  "nav.main": "Navegação principal",
  "nav.mobile": "Navegação móvel",
  "nav.overview": "Visão geral",
  "nav.getFeatured": "Partilhe a sua história",
  "nav.practiceTests": "Testes práticos",
  "nav.interviewPractice": "Prática de entrevistas",
  "nav.resources": "Recursos",
  "nav.guidelines": "Diretrizes",
  "nav.communityBlogs": "Blogs da comunidade",
  "nav.chatRooms": "Salas de conversa",
  "nav.feedback": "Comentários",
  "nav.profile": "Perfil",
  "nav.settings": "Definições",
  "settings.pageTitle": "Definições",
  "settings.preferences": "Preferências",
  "settings.appSettings": "Definições da aplicação",
  "settings.intro":
    "Escolha a aparência do Magna-Q e como deseja receber as nossas comunicações.",
  "settings.darkMode": "Modo escuro",
  "settings.darkModeDescription":
    "Use uma paleta de cores mais escura em todo o site.",
  "settings.language": "Idioma de estudo",
  "settings.languageDescription":
    "Escolha o idioma da navegação e do conteúdo educativo compatível.",
  "settings.contentNotice":
    "As questões e os artigos médicos permanecem no idioma original até existir uma tradução revista.",
  "settings.saving": "A guardar idioma…",
  "settings.saved": "Preferência de idioma guardada.",
  "settings.saveError": "Não foi possível guardar o idioma. Tente novamente.",
  "settings.emailNotifications": "Ativar notificações por e-mail",
  "settings.emailNotificationsDescription":
    "Receba atualizações úteis sobre a conta e os estudos por e-mail.",
  "settings.emailComingSoon":
    "As notificações por e-mail chegarão na próxima atualização.",
};

const fr: MessagePack = {
  "shell.learningWorkspace": "Espace d’apprentissage",
  "auth.signOut": "Se déconnecter",
  "nav.main": "Navigation principale",
  "nav.mobile": "Navigation mobile",
  "nav.overview": "Vue d’ensemble",
  "nav.getFeatured": "Partagez votre parcours",
  "nav.practiceTests": "Tests d’entraînement",
  "nav.interviewPractice": "Entraînement aux entretiens",
  "nav.resources": "Ressources",
  "nav.guidelines": "Guides",
  "nav.communityBlogs": "Blogs de la communauté",
  "nav.chatRooms": "Salons de discussion",
  "nav.feedback": "Commentaires",
  "nav.profile": "Profil",
  "nav.settings": "Paramètres",
  "settings.pageTitle": "Paramètres",
  "settings.preferences": "Préférences",
  "settings.appSettings": "Paramètres de l’application",
  "settings.intro":
    "Choisissez l’apparence de Magna-Q et la manière dont vous souhaitez recevoir nos communications.",
  "settings.darkMode": "Mode sombre",
  "settings.darkModeDescription":
    "Utilisez une palette de couleurs plus sombre sur l’ensemble du site.",
  "settings.language": "Langue d’étude",
  "settings.languageDescription":
    "Choisissez la langue de navigation et des contenus pédagogiques pris en charge.",
  "settings.contentNotice":
    "Les questions et articles médicaux restent dans leur langue d’origine jusqu’à ce qu’une traduction révisée soit disponible.",
  "settings.saving": "Enregistrement de la langue…",
  "settings.saved": "Préférence linguistique enregistrée.",
  "settings.saveError":
    "Impossible d’enregistrer la langue. Veuillez réessayer.",
  "settings.emailNotifications": "Activer les notifications par e-mail",
  "settings.emailNotificationsDescription":
    "Recevez par e-mail des informations utiles sur votre compte et vos études.",
  "settings.emailComingSoon":
    "Les notifications par e-mail arriveront dans la prochaine mise à jour.",
};

const hi: MessagePack = {
  "shell.learningWorkspace": "अध्ययन कार्यक्षेत्र",
  "auth.signOut": "साइन आउट करें",
  "nav.main": "मुख्य नेविगेशन",
  "nav.mobile": "मोबाइल नेविगेशन",
  "nav.overview": "अवलोकन",
  "nav.getFeatured": "अपनी कहानी साझा करें",
  "nav.practiceTests": "अभ्यास परीक्षाएँ",
  "nav.interviewPractice": "साक्षात्कार अभ्यास",
  "nav.resources": "संसाधन",
  "nav.guidelines": "दिशानिर्देश",
  "nav.communityBlogs": "सामुदायिक ब्लॉग",
  "nav.chatRooms": "चैट कक्ष",
  "nav.feedback": "प्रतिक्रिया",
  "nav.profile": "प्रोफ़ाइल",
  "nav.settings": "सेटिंग्स",
  "settings.pageTitle": "सेटिंग्स",
  "settings.preferences": "प्राथमिकताएँ",
  "settings.appSettings": "ऐप सेटिंग्स",
  "settings.intro":
    "चुनें कि Magna-Q कैसा दिखे और आप हमसे संदेश कैसे प्राप्त करना चाहें।",
  "settings.darkMode": "डार्क मोड",
  "settings.darkModeDescription": "पूरी साइट पर गहरे रंगों का उपयोग करें।",
  "settings.language": "अध्ययन की भाषा",
  "settings.languageDescription":
    "नेविगेशन और समर्थित अध्ययन सामग्री की भाषा चुनें।",
  "settings.contentNotice":
    "चिकित्सा प्रश्न और लेख तब तक अपनी मूल भाषा में रहेंगे, जब तक समीक्षा किया हुआ अनुवाद उपलब्ध न हो।",
  "settings.saving": "भाषा सहेजी जा रही है…",
  "settings.saved": "भाषा की प्राथमिकता सहेज दी गई है।",
  "settings.saveError": "भाषा सहेजी नहीं जा सकी। कृपया फिर प्रयास करें।",
  "settings.emailNotifications": "ईमेल सूचनाएँ चालू करें",
  "settings.emailNotificationsDescription":
    "खाते और अध्ययन से जुड़े उपयोगी अपडेट ईमेल से पाएँ।",
  "settings.emailComingSoon": "ईमेल सूचनाएँ अगले अपडेट में उपलब्ध होंगी।",
};

const bn: MessagePack = {
  "shell.learningWorkspace": "শেখার কর্মক্ষেত্র",
  "auth.signOut": "সাইন আউট করুন",
  "nav.main": "প্রধান নেভিগেশন",
  "nav.mobile": "মোবাইল নেভিগেশন",
  "nav.overview": "সংক্ষিপ্ত বিবরণ",
  "nav.getFeatured": "আপনার গল্প শেয়ার করুন",
  "nav.practiceTests": "অনুশীলনী পরীক্ষা",
  "nav.interviewPractice": "সাক্ষাৎকার অনুশীলন",
  "nav.resources": "রিসোর্স",
  "nav.guidelines": "নির্দেশিকা",
  "nav.communityBlogs": "কমিউনিটি ব্লগ",
  "nav.chatRooms": "চ্যাট রুম",
  "nav.feedback": "মতামত",
  "nav.profile": "প্রোফাইল",
  "nav.settings": "সেটিংস",
  "settings.pageTitle": "সেটিংস",
  "settings.preferences": "পছন্দসমূহ",
  "settings.appSettings": "অ্যাপ সেটিংস",
  "settings.intro":
    "Magna-Q কেমন দেখাবে এবং আমাদের বার্তা কীভাবে পেতে চান তা বেছে নিন।",
  "settings.darkMode": "ডার্ক মোড",
  "settings.darkModeDescription": "পুরো সাইটে গাঢ় রঙের প্যালেট ব্যবহার করুন।",
  "settings.language": "অধ্যয়নের ভাষা",
  "settings.languageDescription":
    "নেভিগেশন এবং সমর্থিত শিক্ষামূলক কনটেন্টের ভাষা বেছে নিন।",
  "settings.contentNotice":
    "পর্যালোচিত অনুবাদ না পাওয়া পর্যন্ত চিকিৎসাবিষয়ক প্রশ্ন ও নিবন্ধ তাদের মূল ভাষায় থাকবে।",
  "settings.saving": "ভাষা সংরক্ষণ করা হচ্ছে…",
  "settings.saved": "ভাষার পছন্দ সংরক্ষণ করা হয়েছে।",
  "settings.saveError": "ভাষা সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।",
  "settings.emailNotifications": "ইমেইল বিজ্ঞপ্তি চালু করুন",
  "settings.emailNotificationsDescription":
    "অ্যাকাউন্ট ও পড়াশোনার দরকারি আপডেট ইমেইলে পান।",
  "settings.emailComingSoon": "ইমেইল বিজ্ঞপ্তি পরবর্তী আপডেটে আসবে।",
};

export const MESSAGE_PACKS: Readonly<Record<AppLocale, MessagePack>> = {
  en,
  es,
  pt,
  fr,
  hi,
  bn,
};

export function translate(locale: AppLocale, key: MessageKey) {
  return MESSAGE_PACKS[locale][key] ?? en[key];
}

const workspaceTitleKeys: Readonly<Record<string, MessageKey>> = {
  "Student dashboard": "nav.overview",
  "Create a new test": "nav.practiceTests",
  "Interview practice": "nav.interviewPractice",
  Resources: "nav.resources",
  "Timelines and Guidelines": "nav.guidelines",
  Guidelines: "nav.guidelines",
  "Community blogs": "nav.communityBlogs",
  Feedback: "nav.feedback",
  Profile: "nav.profile",
  Settings: "settings.pageTitle",
};

/** Translates shared page titles while preserving content-specific titles. */
export function translateWorkspaceTitle(locale: AppLocale, title: string) {
  const key = workspaceTitleKeys[title];
  return key ? translate(locale, key) : title;
}
