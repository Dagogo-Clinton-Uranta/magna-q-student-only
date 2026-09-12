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
  | "settings.showTestTour"
  | "settings.showTestTourDescription"
  | "settings.showSidebarTour"
  | "settings.showSidebarTourDescription"
  | "settings.sidebarTourError"
  | "settings.language"
  | "settings.languageDescription"
  | "settings.contentNotice"
  | "settings.saving"
  | "settings.saved"
  | "settings.saveError"
  | "settings.emailNotifications"
  | "settings.emailNotificationsDescription"
  | "settings.emailComingSoon"
  | "tour.label"
  | "tour.skip"
  | "tour.back"
  | "tour.next"
  | "tour.finish"
  | "tour.overview"
  | "tour.getFeatured"
  | "tour.practiceTests"
  | "tour.interviewPractice"
  | "tour.resources"
  | "tour.guidelines"
  | "tour.communityBlogs"
  | "tour.chatRooms"
  | "tour.feedback"
  | "tour.profile"
  | "tour.settings";

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
  "settings.showTestTour": "Show tour before tests",
  "settings.showTestTourDescription":
    "Open the question player tour when you start a Step 1 or Step 2 test.",
  "settings.showSidebarTour": "Sidebar tutorial",
  "settings.showSidebarTourDescription":
    "Turn this on to replay the guided tour of your Magna-Q workspace.",
  "settings.sidebarTourError":
    "We could not start the tutorial. Please try again.",
  "settings.language": "Study language",
  "settings.languageDescription":
    "Choose the language used throughout Magna-Q.",
  "settings.contentNotice":
    "Interface text, articles and test questions are translated automatically in your browser.",
  "settings.saving": "Saving language…",
  "settings.saved": "Language preference saved.",
  "settings.saveError": "We could not save your language. Please try again.",
  "settings.emailNotifications": "Turn on email notifications",
  "settings.emailNotificationsDescription":
    "Receive useful account and study updates by email.",
  "settings.emailComingSoon":
    "Email notifications are coming in the next patch.",
  "tour.label": "Workspace tour",
  "tour.skip": "Skip tour",
  "tour.back": "Back",
  "tour.next": "Next",
  "tour.finish": "Finish",
  "tour.overview":
    "See your latest activity, progress, and next actions across your Magna-Q journey.",
  "tour.getFeatured":
    "Share meaningful work and place your story in front of the Magna-Q community.",
  "tour.practiceTests":
    "Build USMLE practice blocks, then review your answers, explanations, and progress.",
  "tour.interviewPractice":
    "Rehearse residency answers on camera, review recordings, and receive structured feedback.",
  "tour.resources":
    "Browse study materials, residency directories, open days, and networking opportunities.",
  "tour.guidelines":
    "Follow clear timelines and practical guidance for exams, applications, and the Match.",
  "tour.communityBlogs":
    "Read community perspectives and practical experiences from students and doctors.",
  "tour.chatRooms":
    "Ask questions, exchange advice, and connect with people working toward similar goals.",
  "tour.feedback": "Tell us what is working and what Magna-Q should improve.",
  "tour.profile":
    "Manage your public details and review the opportunities and residencies you track.",
  "tour.settings":
    "Choose your language and preferences here. Turn on Sidebar tutorial whenever you want to take this tour again.",
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
  "settings.showTestTour": "Mostrar recorrido antes de los exámenes",
  "settings.showTestTourDescription":
    "Abre el recorrido del reproductor de preguntas al iniciar un examen de Step 1 o Step 2.",
  "settings.showSidebarTour": "Tutorial de la barra lateral",
  "settings.showSidebarTourDescription":
    "Activa esta opción para repetir el recorrido guiado por tu espacio de trabajo de Magna-Q.",
  "settings.sidebarTourError":
    "No pudimos iniciar el tutorial. Inténtalo de nuevo.",
  "settings.language": "Idioma de estudio",
  "settings.languageDescription":
    "Elige el idioma que se usará en todo Magna-Q.",
  "settings.contentNotice":
    "El texto de la interfaz, los artículos y las preguntas de examen se traducen automáticamente en tu navegador.",
  "settings.saving": "Guardando idioma…",
  "settings.saved": "Preferencia de idioma guardada.",
  "settings.saveError": "No pudimos guardar el idioma. Inténtalo de nuevo.",
  "settings.emailNotifications": "Activar notificaciones por correo",
  "settings.emailNotificationsDescription":
    "Recibe actualizaciones útiles sobre tu cuenta y tus estudios por correo.",
  "settings.emailComingSoon":
    "Las notificaciones por correo llegarán en la próxima actualización.",
  "tour.label": "Recorrido del espacio de trabajo",
  "tour.skip": "Omitir recorrido",
  "tour.back": "Atrás",
  "tour.next": "Siguiente",
  "tour.finish": "Finalizar",
  "tour.overview":
    "Consulta tu actividad reciente, tu progreso y tus próximas acciones en Magna-Q.",
  "tour.getFeatured":
    "Comparte trabajos relevantes y presenta tu historia ante la comunidad de Magna-Q.",
  "tour.practiceTests":
    "Crea bloques de práctica del USMLE y revisa tus respuestas, explicaciones y progreso.",
  "tour.interviewPractice":
    "Practica respuestas de residencia ante la cámara, revisa las grabaciones y recibe comentarios estructurados.",
  "tour.resources":
    "Explora materiales de estudio, directorios de residencias, jornadas abiertas y oportunidades para establecer contactos.",
  "tour.guidelines":
    "Sigue cronogramas claros y orientación práctica para exámenes, solicitudes y el Match.",
  "tour.communityBlogs":
    "Lee perspectivas de la comunidad y experiencias prácticas de estudiantes y médicos.",
  "tour.chatRooms":
    "Haz preguntas, intercambia consejos y conecta con personas que persiguen objetivos similares.",
  "tour.feedback": "Cuéntanos qué funciona y qué debería mejorar Magna-Q.",
  "tour.profile":
    "Gestiona tus datos públicos y revisa las oportunidades y residencias que sigues.",
  "tour.settings":
    "Elige aquí tu idioma y tus preferencias. Activa el Tutorial de la barra lateral cuando quieras repetir este recorrido.",
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
  "settings.showTestTour": "Mostrar apresentação antes dos testes",
  "settings.showTestTourDescription":
    "Abra a apresentação do leitor de perguntas ao iniciar um teste Step 1 ou Step 2.",
  "settings.showSidebarTour": "Tutorial da barra lateral",
  "settings.showSidebarTourDescription":
    "Ative esta opção para repetir a visita guiada ao seu espaço de trabalho Magna-Q.",
  "settings.sidebarTourError":
    "Não foi possível iniciar o tutorial. Tente novamente.",
  "settings.language": "Idioma de estudo",
  "settings.languageDescription":
    "Escolha o idioma utilizado em todo o Magna-Q.",
  "settings.contentNotice":
    "O texto da interface, os artigos e as perguntas de teste são traduzidos automaticamente no seu navegador.",
  "settings.saving": "A guardar idioma…",
  "settings.saved": "Preferência de idioma guardada.",
  "settings.saveError": "Não foi possível guardar o idioma. Tente novamente.",
  "settings.emailNotifications": "Ativar notificações por e-mail",
  "settings.emailNotificationsDescription":
    "Receba atualizações úteis sobre a conta e os estudos por e-mail.",
  "settings.emailComingSoon":
    "As notificações por e-mail chegarão na próxima atualização.",
  "tour.label": "Visita ao espaço de trabalho",
  "tour.skip": "Saltar visita",
  "tour.back": "Anterior",
  "tour.next": "Seguinte",
  "tour.finish": "Concluir",
  "tour.overview":
    "Veja a sua atividade recente, o progresso e as próximas ações no seu percurso Magna-Q.",
  "tour.getFeatured":
    "Partilhe trabalhos relevantes e apresente a sua história à comunidade Magna-Q.",
  "tour.practiceTests":
    "Crie blocos de prática para o USMLE e reveja as suas respostas, explicações e progresso.",
  "tour.interviewPractice":
    "Pratique respostas de residência perante a câmara, reveja gravações e receba feedback estruturado.",
  "tour.resources":
    "Explore materiais de estudo, diretórios de residências, dias abertos e oportunidades de networking.",
  "tour.guidelines":
    "Siga cronogramas claros e orientações práticas para exames, candidaturas e o Match.",
  "tour.communityBlogs":
    "Leia perspetivas da comunidade e experiências práticas de estudantes e médicos.",
  "tour.chatRooms":
    "Faça perguntas, troque conselhos e ligue-se a pessoas com objetivos semelhantes.",
  "tour.feedback": "Diga-nos o que funciona e o que a Magna-Q deve melhorar.",
  "tour.profile":
    "Gira os seus dados públicos e reveja as oportunidades e residências que acompanha.",
  "tour.settings":
    "Escolha aqui o seu idioma e preferências. Ative o Tutorial da barra lateral sempre que quiser repetir esta visita.",
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
  "settings.showTestTour": "Afficher la visite avant les tests",
  "settings.showTestTourDescription":
    "Ouvrez la visite du lecteur de questions au début d’un test Step 1 ou Step 2.",
  "settings.showSidebarTour": "Tutoriel de la barre latérale",
  "settings.showSidebarTourDescription":
    "Activez cette option pour revoir la visite guidée de votre espace de travail Magna-Q.",
  "settings.sidebarTourError":
    "Impossible de lancer le tutoriel. Veuillez réessayer.",
  "settings.language": "Langue d’étude",
  "settings.languageDescription":
    "Choisissez la langue utilisée dans l’ensemble de Magna-Q.",
  "settings.contentNotice":
    "Le texte de l’interface, les articles et les questions de test sont traduits automatiquement dans votre navigateur.",
  "settings.saving": "Enregistrement de la langue…",
  "settings.saved": "Préférence linguistique enregistrée.",
  "settings.saveError":
    "Impossible d’enregistrer la langue. Veuillez réessayer.",
  "settings.emailNotifications": "Activer les notifications par e-mail",
  "settings.emailNotificationsDescription":
    "Recevez par e-mail des informations utiles sur votre compte et vos études.",
  "settings.emailComingSoon":
    "Les notifications par e-mail arriveront dans la prochaine mise à jour.",
  "tour.label": "Visite de l’espace de travail",
  "tour.skip": "Ignorer la visite",
  "tour.back": "Retour",
  "tour.next": "Suivant",
  "tour.finish": "Terminer",
  "tour.overview":
    "Consultez votre activité récente, vos progrès et vos prochaines actions dans votre parcours Magna-Q.",
  "tour.getFeatured":
    "Partagez des travaux importants et présentez votre parcours à la communauté Magna-Q.",
  "tour.practiceTests":
    "Créez des blocs d’entraînement USMLE, puis examinez vos réponses, les explications et vos progrès.",
  "tour.interviewPractice":
    "Répétez vos réponses de résidence face à la caméra, revoyez vos enregistrements et recevez des commentaires structurés.",
  "tour.resources":
    "Parcourez les supports d’étude, les répertoires de résidences, les journées portes ouvertes et les occasions de réseautage.",
  "tour.guidelines":
    "Suivez des calendriers clairs et des conseils pratiques pour les examens, les candidatures et le Match.",
  "tour.communityBlogs":
    "Découvrez les points de vue de la communauté et les expériences pratiques d’étudiants et de médecins.",
  "tour.chatRooms":
    "Posez des questions, échangez des conseils et rencontrez des personnes qui poursuivent des objectifs similaires.",
  "tour.feedback":
    "Dites-nous ce qui fonctionne et ce que Magna-Q devrait améliorer.",
  "tour.profile":
    "Gérez vos informations publiques et consultez les possibilités et résidences que vous suivez.",
  "tour.settings":
    "Choisissez ici votre langue et vos préférences. Activez le Tutoriel de la barre latérale lorsque vous souhaitez revoir cette visite.",
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
  "settings.showTestTour": "परीक्षा से पहले टूर दिखाएँ",
  "settings.showTestTourDescription":
    "Step 1 या Step 2 परीक्षा शुरू करते समय प्रश्न प्लेयर का टूर खोलें।",
  "settings.showSidebarTour": "साइडबार ट्यूटोरियल",
  "settings.showSidebarTourDescription":
    "अपने Magna-Q कार्यक्षेत्र का निर्देशित टूर दोबारा देखने के लिए इसे चालू करें।",
  "settings.sidebarTourError":
    "ट्यूटोरियल शुरू नहीं हो सका। कृपया फिर प्रयास करें।",
  "settings.language": "अध्ययन की भाषा",
  "settings.languageDescription":
    "पूरे Magna-Q में उपयोग की जाने वाली भाषा चुनें।",
  "settings.contentNotice":
    "इंटरफ़ेस टेक्स्ट, लेख और परीक्षा प्रश्न आपके ब्राउज़र में अपने आप अनुवादित होते हैं।",
  "settings.saving": "भाषा सहेजी जा रही है…",
  "settings.saved": "भाषा की प्राथमिकता सहेज दी गई है।",
  "settings.saveError": "भाषा सहेजी नहीं जा सकी। कृपया फिर प्रयास करें।",
  "settings.emailNotifications": "ईमेल सूचनाएँ चालू करें",
  "settings.emailNotificationsDescription":
    "खाते और अध्ययन से जुड़े उपयोगी अपडेट ईमेल से पाएँ।",
  "settings.emailComingSoon": "ईमेल सूचनाएँ अगले अपडेट में उपलब्ध होंगी।",
  "tour.label": "कार्यक्षेत्र टूर",
  "tour.skip": "टूर छोड़ें",
  "tour.back": "पीछे",
  "tour.next": "आगे",
  "tour.finish": "समाप्त करें",
  "tour.overview":
    "अपनी Magna-Q यात्रा की हाल की गतिविधि, प्रगति और अगले कदम यहाँ देखें।",
  "tour.getFeatured":
    "सार्थक कार्य साझा करें और अपनी कहानी Magna-Q समुदाय के सामने रखें।",
  "tour.practiceTests":
    "USMLE अभ्यास ब्लॉक बनाएँ, फिर अपने उत्तर, व्याख्याएँ और प्रगति की समीक्षा करें।",
  "tour.interviewPractice":
    "कैमरे पर रेज़िडेंसी उत्तरों का अभ्यास करें, रिकॉर्डिंग देखें और सुव्यवस्थित प्रतिक्रिया पाएँ।",
  "tour.resources":
    "अध्ययन सामग्री, रेज़िडेंसी निर्देशिकाएँ, ओपन डे और नेटवर्किंग अवसर देखें।",
  "tour.guidelines":
    "परीक्षाओं, आवेदनों और Match के लिए स्पष्ट समयसीमा और व्यावहारिक मार्गदर्शन पाएँ।",
  "tour.communityBlogs":
    "छात्रों और डॉक्टरों के सामुदायिक दृष्टिकोण और व्यावहारिक अनुभव पढ़ें।",
  "tour.chatRooms":
    "प्रश्न पूछें, सलाह साझा करें और समान लक्ष्यों वाले लोगों से जुड़ें।",
  "tour.feedback":
    "हमें बताएँ कि क्या अच्छा काम कर रहा है और Magna-Q को क्या सुधारना चाहिए।",
  "tour.profile":
    "अपनी सार्वजनिक जानकारी संभालें और ट्रैक किए गए अवसरों व रेज़िडेंसी की समीक्षा करें।",
  "tour.settings":
    "यहाँ अपनी भाषा और प्राथमिकताएँ चुनें। यह टूर दोबारा देखने के लिए साइडबार ट्यूटोरियल चालू करें।",
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
  "settings.showTestTour": "পরীক্ষার আগে ট্যুর দেখান",
  "settings.showTestTourDescription":
    "Step 1 বা Step 2 পরীক্ষা শুরু করার সময় প্রশ্ন প্লেয়ারের ট্যুর খুলুন।",
  "settings.showSidebarTour": "সাইডবার টিউটোরিয়াল",
  "settings.showSidebarTourDescription":
    "আপনার Magna-Q কর্মক্ষেত্রের নির্দেশিত ট্যুর আবার দেখতে এটি চালু করুন।",
  "settings.sidebarTourError": "টিউটোরিয়াল শুরু করা যায়নি। আবার চেষ্টা করুন।",
  "settings.language": "অধ্যয়নের ভাষা",
  "settings.languageDescription": "Magna-Q জুড়ে ব্যবহৃত ভাষা বেছে নিন।",
  "settings.contentNotice":
    "ইন্টারফেসের লেখা, নিবন্ধ ও পরীক্ষার প্রশ্ন আপনার ব্রাউজারে স্বয়ংক্রিয়ভাবে অনুবাদ হয়।",
  "settings.saving": "ভাষা সংরক্ষণ করা হচ্ছে…",
  "settings.saved": "ভাষার পছন্দ সংরক্ষণ করা হয়েছে।",
  "settings.saveError": "ভাষা সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।",
  "settings.emailNotifications": "ইমেইল বিজ্ঞপ্তি চালু করুন",
  "settings.emailNotificationsDescription":
    "অ্যাকাউন্ট ও পড়াশোনার দরকারি আপডেট ইমেইলে পান।",
  "settings.emailComingSoon": "ইমেইল বিজ্ঞপ্তি পরবর্তী আপডেটে আসবে।",
  "tour.label": "কর্মক্ষেত্র ট্যুর",
  "tour.skip": "ট্যুর এড়িয়ে যান",
  "tour.back": "পেছনে",
  "tour.next": "পরবর্তী",
  "tour.finish": "শেষ করুন",
  "tour.overview":
    "আপনার Magna-Q যাত্রার সাম্প্রতিক কার্যক্রম, অগ্রগতি ও পরবর্তী পদক্ষেপ এখানে দেখুন।",
  "tour.getFeatured":
    "অর্থবহ কাজ শেয়ার করুন এবং Magna-Q কমিউনিটির সামনে আপনার গল্প তুলে ধরুন।",
  "tour.practiceTests":
    "USMLE অনুশীলন ব্লক তৈরি করুন, তারপর আপনার উত্তর, ব্যাখ্যা ও অগ্রগতি পর্যালোচনা করুন।",
  "tour.interviewPractice":
    "ক্যামেরায় রেসিডেন্সির উত্তর অনুশীলন করুন, রেকর্ডিং দেখুন এবং সুসংগঠিত মতামত পান।",
  "tour.resources":
    "পড়াশোনার উপকরণ, রেসিডেন্সি ডিরেক্টরি, ওপেন ডে ও নেটওয়ার্কিংয়ের সুযোগ দেখুন।",
  "tour.guidelines":
    "পরীক্ষা, আবেদন ও Match-এর জন্য পরিষ্কার সময়রেখা ও ব্যবহারিক নির্দেশনা অনুসরণ করুন।",
  "tour.communityBlogs":
    "শিক্ষার্থী ও চিকিৎসকদের কমিউনিটি দৃষ্টিভঙ্গি এবং ব্যবহারিক অভিজ্ঞতা পড়ুন।",
  "tour.chatRooms":
    "প্রশ্ন করুন, পরামর্শ বিনিময় করুন এবং একই লক্ষ্য নিয়ে কাজ করা মানুষের সঙ্গে যুক্ত হন।",
  "tour.feedback":
    "কী ভালো কাজ করছে এবং Magna-Q-তে কী উন্নতি করা উচিত তা আমাদের জানান।",
  "tour.profile":
    "আপনার প্রকাশ্য তথ্য পরিচালনা করুন এবং ট্র্যাক করা সুযোগ ও রেসিডেন্সিগুলো পর্যালোচনা করুন।",
  "tour.settings":
    "এখানে আপনার ভাষা ও পছন্দ বেছে নিন। এই ট্যুর আবার দেখতে সাইডবার টিউটোরিয়াল চালু করুন।",
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
