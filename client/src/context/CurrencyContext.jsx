import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CurrencyContext = createContext();

const COUNTRY_CURRENCY_MAP = {
  IN: 'INR', US: 'USD', GB: 'GBP', DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR',
  PT: 'EUR', AT: 'EUR', IE: 'EUR', FI: 'EUR', GR: 'EUR', AE: 'AED', SA: 'SAR', BD: 'BDT', PK: 'PKR',
  MY: 'MYR', ID: 'IDR', PH: 'PHP', BR: 'BRL', CA: 'CAD', AU: 'AUD', JP: 'JPY', SG: 'SGD',
  NZ: 'AUD', MX: 'USD', TH: 'USD', VN: 'USD', KR: 'USD', TW: 'USD', HK: 'USD', NG: 'USD',
};

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];

const FALLBACK_RATES = {
  USD: 1, INR: 83.5, EUR: 0.92, GBP: 0.79, AED: 3.67, SAR: 3.75,
  BDT: 122, PKR: 278, MYR: 4.7, IDR: 15600, PHP: 56, BRL: 5.0,
  CAD: 1.36, AUD: 1.53, JPY: 149, SGD: 1.34
};

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

const TRANSLATIONS = {
  en: {
    home: 'Home', store: 'Store', cart: 'Cart', login: 'Login', register: 'Register', logout: 'Logout',
    myOrders: 'My Orders', admin: 'Admin', browseStore: 'Browse Store', createAccount: 'Create Account',
    panelsAvailable: 'Panels Available', categories: 'Categories', support: 'Support',
    bothPlatforms: 'Both Platforms', whyChoose: 'Why Choose',
    premiumQuality: 'Premium Quality', premiumQualityDesc: 'Top-tier panels with advanced features and regular updates',
    instantDelivery: 'Instant Delivery', instantDeliveryDesc: 'Get your panel key instantly after payment verification',
    safeSecure: 'Safe & Secure', safeSecureDesc: 'Anti-detection protection with secure payment system',
    multiPlatform: 'Multi-Platform', multiPlatformDesc: 'Full support for both iOS and Android devices',
    support247: '24/7 Support', support247Desc: 'Dedicated support team available round the clock',
    bestPrices: 'Best Prices', bestPricesDesc: 'Competitive pricing with regular discounts and promos',
    readyToStart: 'Ready to Get Started?', readyToStartDesc: 'Join now and explore our collection of premium panels',
    getStartedFree: 'Get Started Free',
    browseOurPremium: 'Browse our premium collection of FF panels',
    all: 'All', addToCart: 'Add to Cart', outOfStock: 'Out of Stock',
    day1: '1 Day', days7: '7 Days', days30: '30 Days', days60: '60 Days',
    shoppingCart: 'Shopping Cart', itemsInCart: 'item(s) in your cart',
    promoCode: 'Promo Code', apply: 'Apply', remove: 'Remove',
    orderSummary: 'Order Summary', subtotal: 'Subtotal', discount: 'Discount', total: 'Total',
    clearCart: 'Clear Cart', proceedToCheckout: 'Proceed to Checkout',
    cartEmpty: 'Your cart is empty', cartEmptyDesc: 'Browse our store to add items',
    checkout: 'Checkout', completeYourPurchase: 'Complete your purchase',
    selectPaymentMethod: 'Select Payment Method', indian: 'Indian', international: 'International',
    scanQrToPay: 'Scan QR to Pay', payExactly: 'Pay exactly', viaUPI: 'via UPI',
    selectCrypto: 'Select Cryptocurrency', selectUsdtNetwork: 'Select USDT Network',
    sendWorth: 'worth of', to: 'to', copyAddress: 'Copy Address',
    cryptoWarning: 'Send exact amount on the correct network. Incorrect transfers cannot be recovered.',
    ivePaidPlaceOrder: "I've Paid - Place Order", placingOrder: 'Placing Order...',
    orderCreated: 'Order Created Successfully!', submitProof: 'Submit your',
    toVerifyPayment: 'to verify payment', utrNumber: 'UTR Number', transactionHash: 'Transaction Hash',
    enterUtr: 'Enter the UTR/Transaction Reference number from your UPI payment',
    enterTxHash: 'Enter the transaction hash/ID from your crypto payment',
    enter12DigitUtr: 'Enter 12-digit UTR number', enterTxHashPlaceholder: 'Enter transaction hash',
    submitForVerification: 'Submit for Verification', submitting: 'Submitting...',
    paymentVerificationPending: 'Payment Verification Pending',
    utrSubmitted: 'has been submitted. We will verify your payment and deliver the key shortly.',
    checkStatusInMyOrders: 'You can check the status in "My Orders" section',
    viewMyOrders: 'View My Orders',
    trackOrderStatus: 'Track your order status', noOrdersYet: 'No orders yet',
    ordersWillAppear: 'Your orders will appear here', duration: 'Duration', order: 'Order',
    pendingPayment: 'Pending Payment', pendingVerification: 'Pending Verification',
    approved: 'Approved', rejected: 'Rejected', delivered: 'Delivered',
    yourKey: 'Your Key', yourFiles: 'Your Files', download: 'Download', note: 'Note', loading: 'Loading...',
    noPanelsAvailable: 'No panels available', checkBackLater: 'Check back later for new items',
    currency: 'Currency', language: 'Language',
    weProvide: 'We provide the best quality panels with reliable service',
    defaultDesc: 'Premium FF Panels for iOS & Android. Get the best panels with instant delivery and 24/7 support.',
    promoApplied: 'Promo applied!', off: 'off',
    username: 'Username', password: 'Password', email: 'Email', telegram: 'Telegram Username',
    loginTitle: 'Login', registerTitle: 'Create Account', dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?', signUp: 'Sign Up', signIn: 'Sign In',
    supportBtn: 'Support', contactSupport: 'Contact Support',
  },
  hi: {
    home: 'होम', store: 'स्टोर', cart: 'कार्ट', login: 'लॉगिन', register: 'रजिस्टर', logout: 'लॉगआउट',
    myOrders: 'मेरे ऑर्डर', admin: 'एडमिन', browseStore: 'स्टोर देखें', createAccount: 'अकाउंट बनाएं',
    panelsAvailable: 'पैनल उपलब्ध', categories: 'श्रेणियां', support: 'सपोर्ट',
    bothPlatforms: 'दोनों प्लेटफॉर्म', whyChoose: 'क्यों चुनें',
    premiumQuality: 'प्रीमियम गुणवत्ता', premiumQualityDesc: 'उन्नत सुविधाओं और नियमित अपडेट के साथ शीर्ष स्तर के पैनल',
    instantDelivery: 'तुरंत डिलीवरी', instantDeliveryDesc: 'भुगतान सत्यापन के बाद तुरंत अपनी पैनल कुंजी प्राप्त करें',
    safeSecure: 'सुरक्षित', safeSecureDesc: 'सुरक्षित भुगतान प्रणाली के साथ एंटी-डिटेक्शन सुरक्षा',
    multiPlatform: 'मल्टी-प्लेटफॉर्म', multiPlatformDesc: 'iOS और Android दोनों उपकरणों के लिए पूर्ण समर्थन',
    support247: '24/7 सपोर्ट', support247Desc: 'चौबीसों घंटे उपलब्ध समर्पित सपोर्ट टीम',
    bestPrices: 'सर्वोत्तम मूल्य', bestPricesDesc: 'नियमित छूट और प्रोमो के साथ प्रतिस्पर्धी मूल्य',
    readyToStart: 'शुरू करने के लिए तैयार?', readyToStartDesc: 'अभी जुड़ें और हमारे प्रीमियम पैनल का संग्रह देखें',
    getStartedFree: 'मुफ्त शुरू करें',
    browseOurPremium: 'FF पैनल का हमारा प्रीमियम संग्रह देखें',
    all: 'सभी', addToCart: 'कार्ट में डालें', outOfStock: 'स्टॉक में नहीं',
    day1: '1 दिन', days7: '7 दिन', days30: '30 दिन', days60: '60 दिन',
    shoppingCart: 'शॉपिंग कार्ट', itemsInCart: 'आइटम आपके कार्ट में',
    promoCode: 'प्रोमो कोड', apply: 'लागू करें', remove: 'हटाएं',
    orderSummary: 'ऑर्डर सारांश', subtotal: 'उपयोग', discount: 'छूट', total: 'कुल',
    clearCart: 'कार्ट खाली करें', proceedToCheckout: 'चेकआउट करें',
    cartEmpty: 'आपका कार्ट खाली है', cartEmptyDesc: 'आइटम जोड़ने के लिए हमारा स्टोर देखें',
    checkout: 'चेकआउट', completeYourPurchase: 'अपनी खरीदारी पूरी करें',
    selectPaymentMethod: 'भुगतान विधि चुनें', indian: 'भारतीय', international: 'अंतरराष्ट्रीय',
    scanQrToPay: 'भुगतान के लिए QR स्कैन करें', payExactly: 'बिल्कुल भुगतान करें', viaUPI: 'UPI से',
    selectCrypto: 'क्रिप्टोकरेंसी चुनें', selectUsdtNetwork: 'USDT नेटवर्क चुनें',
    sendWorth: 'मूल्य का', to: 'को', copyAddress: 'पता कॉपी करें',
    cryptoWarning: 'सही नेटवर्क पर सही राशि भेजें। गलत ट्रांसफर वापस नहीं किया जा सकता।',
    ivePaidPlaceOrder: 'मैंने भुगतान किया - ऑर्डर दें', placingOrder: 'ऑर्डर दे रहे हैं...',
    orderCreated: 'ऑर्डर सफलतापूर्वक बनाया गया!', submitProof: 'अपना जमा करें',
    toVerifyPayment: 'भुगतान सत्यापित करने के लिए', utrNumber: 'UTR नंबर', transactionHash: 'ट्रांजैक्शन हैश',
    enterUtr: 'अपने UPI भुगतान का UTR/ट्रांजैक्शन रेफरेंस नंबर दर्ज करें',
    enterTxHash: 'अपने क्रिप्टो भुगतान का ट्रांजैक्शन हैश/आईडी दर्ज करें',
    enter12DigitUtr: '12 अंकों का UTR नंबर दर्ज करें', enterTxHashPlaceholder: 'ट्रांजैक्शन हैश दर्ज करें',
    submitForVerification: 'सत्यापन के लिए जमा करें', submitting: 'जमा हो रहा है...',
    paymentVerificationPending: 'भुगतान सत्यापन लंबित',
    utrSubmitted: 'जमा किया गया है। हम आपके भुगतान की पुष्टि करेंगे और जल्द ही कुंजी वितरित करेंगे।',
    checkStatusInMyOrders: 'आप "मेरे ऑर्डर" में स्थिति देख सकते हैं',
    viewMyOrders: 'मेरे ऑर्डर देखें',
    trackOrderStatus: 'अपने ऑर्डर की स्थिति ट्रैक करें', noOrdersYet: 'अभी तक कोई ऑर्डर नहीं',
    ordersWillAppear: 'आपके ऑर्डर यहां दिखाई देंगे', duration: 'अवधि', order: 'ऑर्डर',
    pendingPayment: 'भुगतान लंबित', pendingVerification: 'सत्यापन लंबित',
    approved: 'स्वीकृत', rejected: 'अस्वीकृत', delivered: 'वितरित',
    yourKey: 'आपकी कुंजी', yourFiles: 'आपकी फ़ाइलें', download: 'डाउनलोड', note: 'नोट', loading: 'लोड हो रहा है...',
    noPanelsAvailable: 'कोई पैनल उपलब्ध नहीं', checkBackLater: 'नए आइटम के लिए बाद में देखें',
    currency: 'मुद्रा', language: 'भाषा',
    weProvide: 'हम विश्वसनीय सेवा के साथ सर्वोत्तम गुणवत्ता वाले पैनल प्रदान करते हैं',
    defaultDesc: 'iOS और Android के लिए प्रीमियम FF पैनल। तुरंत डिलीवरी और 24/7 सपोर्ट के साथ सर्वोत्तम पैनल प्राप्त करें।',
    promoApplied: 'प्रोमो लागू!', off: 'छूट',
    username: 'यूजरनेम', password: 'पासवर्ड', email: 'ईमेल', telegram: 'टेलीग्राम यूजरनेम',
    loginTitle: 'लॉगिन', registerTitle: 'अकाउंट बनाएं', dontHaveAccount: 'अकाउंट नहीं है?',
    alreadyHaveAccount: 'पहले से अकाउंट है?', signUp: 'साइन अप', signIn: 'साइन इन',
    supportBtn: 'सपोर्ट', contactSupport: 'सपोर्ट से संपर्क करें',
  },
  ar: {
    home: 'الرئيسية', store: 'المتجر', cart: 'السلة', login: 'تسجيل الدخول', register: 'تسجيل', logout: 'تسجيل الخروج',
    myOrders: 'طلباتي', admin: 'المشرف', browseStore: 'تصفح المتجر', createAccount: 'إنشاء حساب',
    panelsAvailable: 'لوحات متاحة', categories: 'الفئات', support: 'الدعم',
    bothPlatforms: 'كلا المنصتين', whyChoose: 'لماذا تختار',
    premiumQuality: 'جودة ممتازة', premiumQualityDesc: 'لوحات عالية المستوى مع ميزات متقدمة وتحديثات منتظمة',
    instantDelivery: 'تسليم فوري', instantDeliveryDesc: 'احصل على مفتاح اللوحة فوراً بعد التحقق من الدفع',
    safeSecure: 'آمن ومحمي', safeSecureDesc: 'حماية ضد الكشف مع نظام دفع آمن',
    multiPlatform: 'متعدد المنصات', multiPlatformDesc: 'دعم كامل لأجهزة iOS و Android',
    support247: 'دعم 24/7', support247Desc: 'فريق دعم مخصص متاح على مدار الساعة',
    bestPrices: 'أفضل الأسعار', bestPricesDesc: 'أسعار تنافسية مع خصومات وعروض منتظمة',
    readyToStart: 'مستعد للبدء؟', readyToStartDesc: 'انضم الآن واستكشف مجموعتنا من اللوحات المميزة',
    getStartedFree: 'ابدأ مجاناً',
    browseOurPremium: 'تصفح مجموعتنا المميزة من لوحات FF',
    all: 'الكل', addToCart: 'أضف للسلة', outOfStock: 'نفذ من المخزون',
    day1: 'يوم واحد', days7: '7 أيام', days30: '30 يوم', days60: '60 يوم',
    shoppingCart: 'سلة التسوق', itemsInCart: 'عنصر في سلتك',
    promoCode: 'رمز ترويجي', apply: 'تطبيق', remove: 'إزالة',
    orderSummary: 'ملخص الطلب', subtotal: 'المجموع الفرعي', discount: 'خصم', total: 'الإجمالي',
    clearCart: 'تفريغ السلة', proceedToCheckout: 'متابعة الدفع',
    cartEmpty: 'سلتك فارغة', cartEmptyDesc: 'تصفح متجرنا لإضافة عناصر',
    checkout: 'الدفع', completeYourPurchase: 'أكمل عملية الشراء',
    selectPaymentMethod: 'اختر طريقة الدفع', indian: 'هندي', international: 'دولي',
    scanQrToPay: 'امسح QR للدفع', payExactly: 'ادفع بالضبط', viaUPI: 'عبر UPI',
    selectCrypto: 'اختر العملة المشفرة', selectUsdtNetwork: 'اختر شبكة USDT',
    sendWorth: 'بقيمة', to: 'إلى', copyAddress: 'نسخ العنوان',
    cryptoWarning: 'أرسل المبلغ الدقيق على الشبكة الصحيحة. لا يمكن استرداد التحويلات غير الصحيحة.',
    ivePaidPlaceOrder: 'لقد دفعت - تقديم الطلب', placingOrder: 'جاري تقديم الطلب...',
    orderCreated: 'تم إنشاء الطلب بنجاح!', submitProof: 'قدم',
    toVerifyPayment: 'للتحقق من الدفع', utrNumber: 'رقم UTR', transactionHash: 'هاش المعاملة',
    enterUtr: 'أدخل رقم مرجع UTR/المعاملة من دفع UPI',
    enterTxHash: 'أدخل هاش/معرف المعاملة من دفع العملة المشفرة',
    enter12DigitUtr: 'أدخل رقم UTR المكون من 12 رقماً', enterTxHashPlaceholder: 'أدخل هاش المعاملة',
    submitForVerification: 'تقديم للتحقق', submitting: 'جاري التقديم...',
    paymentVerificationPending: 'التحقق من الدفع قيد الانتظار',
    utrSubmitted: 'تم تقديمه. سنتحقق من دفعك ونسلم المفتاح قريباً.',
    checkStatusInMyOrders: 'يمكنك التحقق من الحالة في قسم "طلباتي"',
    viewMyOrders: 'عرض طلباتي',
    trackOrderStatus: 'تتبع حالة طلبك', noOrdersYet: 'لا توجد طلبات بعد',
    ordersWillAppear: 'ستظهر طلباتك هنا', duration: 'المدة', order: 'طلب',
    pendingPayment: 'في انتظار الدفع', pendingVerification: 'في انتظار التحقق',
    approved: 'موافق عليه', rejected: 'مرفوض', delivered: 'تم التسليم',
    yourKey: 'مفتاحك', yourFiles: 'ملفاتك', download: 'تحميل', note: 'ملاحظة', loading: 'جاري التحميل...',
    noPanelsAvailable: 'لا توجد لوحات متاحة', checkBackLater: 'تحقق لاحقاً من العناصر الجديدة',
    currency: 'العملة', language: 'اللغة',
    weProvide: 'نقدم أفضل جودة لوحات مع خدمة موثوقة',
    defaultDesc: 'لوحات FF المميزة لنظامي iOS و Android. احصل على أفضل اللوحات مع التسليم الفوري والدعم على مدار الساعة.',
    promoApplied: 'تم تطبيق العرض!', off: 'خصم',
    username: 'اسم المستخدم', password: 'كلمة المرور', email: 'البريد الإلكتروني', telegram: 'اسم مستخدم تيليجرام',
    loginTitle: 'تسجيل الدخول', registerTitle: 'إنشاء حساب', dontHaveAccount: 'ليس لديك حساب؟',
    alreadyHaveAccount: 'لديك حساب بالفعل؟', signUp: 'سجل', signIn: 'دخول',
    supportBtn: 'الدعم', contactSupport: 'اتصل بالدعم',
  },
  es: {
    home: 'Inicio', store: 'Tienda', cart: 'Carrito', login: 'Iniciar Sesión', register: 'Registrar', logout: 'Cerrar Sesión',
    myOrders: 'Mis Pedidos', admin: 'Admin', browseStore: 'Ver Tienda', createAccount: 'Crear Cuenta',
    panelsAvailable: 'Paneles Disponibles', categories: 'Categorías', support: 'Soporte',
    bothPlatforms: 'Ambas Plataformas', whyChoose: 'Por qué elegir',
    premiumQuality: 'Calidad Premium', premiumQualityDesc: 'Paneles de primer nivel con funciones avanzadas y actualizaciones regulares',
    instantDelivery: 'Entrega Instantánea', instantDeliveryDesc: 'Obtén tu clave del panel al instante después de la verificación del pago',
    safeSecure: 'Seguro y Protegido', safeSecureDesc: 'Protección anti-detección con sistema de pago seguro',
    multiPlatform: 'Multiplataforma', multiPlatformDesc: 'Soporte completo para dispositivos iOS y Android',
    support247: 'Soporte 24/7', support247Desc: 'Equipo de soporte dedicado disponible las 24 horas',
    bestPrices: 'Mejores Precios', bestPricesDesc: 'Precios competitivos con descuentos y promociones regulares',
    readyToStart: '¿Listo para Empezar?', readyToStartDesc: 'Únete ahora y explora nuestra colección de paneles premium',
    getStartedFree: 'Empieza Gratis',
    browseOurPremium: 'Explora nuestra colección premium de paneles FF',
    all: 'Todos', addToCart: 'Agregar al Carrito', outOfStock: 'Agotado',
    day1: '1 Día', days7: '7 Días', days30: '30 Días', days60: '60 Días',
    shoppingCart: 'Carrito de Compras', itemsInCart: 'artículo(s) en tu carrito',
    promoCode: 'Código Promo', apply: 'Aplicar', remove: 'Eliminar',
    orderSummary: 'Resumen del Pedido', subtotal: 'Subtotal', discount: 'Descuento', total: 'Total',
    clearCart: 'Vaciar Carrito', proceedToCheckout: 'Ir a Pagar',
    cartEmpty: 'Tu carrito está vacío', cartEmptyDesc: 'Explora nuestra tienda para agregar artículos',
    checkout: 'Pagar', completeYourPurchase: 'Completa tu compra',
    selectPaymentMethod: 'Seleccionar Método de Pago', indian: 'India', international: 'Internacional',
    scanQrToPay: 'Escanear QR para Pagar', payExactly: 'Paga exactamente', viaUPI: 'vía UPI',
    selectCrypto: 'Seleccionar Criptomoneda', selectUsdtNetwork: 'Seleccionar Red USDT',
    sendWorth: 'en valor de', to: 'a', copyAddress: 'Copiar Dirección',
    cryptoWarning: 'Envía el monto exacto en la red correcta. Las transferencias incorrectas no se pueden recuperar.',
    ivePaidPlaceOrder: 'Ya Pagué - Hacer Pedido', placingOrder: 'Haciendo Pedido...',
    orderCreated: '¡Pedido Creado Exitosamente!', submitProof: 'Envía tu',
    toVerifyPayment: 'para verificar el pago', utrNumber: 'Número UTR', transactionHash: 'Hash de Transacción',
    enterUtr: 'Ingresa el número de referencia UTR/Transacción de tu pago UPI',
    enterTxHash: 'Ingresa el hash/ID de transacción de tu pago cripto',
    enter12DigitUtr: 'Ingresa número UTR de 12 dígitos', enterTxHashPlaceholder: 'Ingresa hash de transacción',
    submitForVerification: 'Enviar para Verificación', submitting: 'Enviando...',
    paymentVerificationPending: 'Verificación de Pago Pendiente',
    utrSubmitted: 'ha sido enviado. Verificaremos tu pago y entregaremos la clave pronto.',
    checkStatusInMyOrders: 'Puedes verificar el estado en la sección "Mis Pedidos"',
    viewMyOrders: 'Ver Mis Pedidos',
    trackOrderStatus: 'Rastrea el estado de tu pedido', noOrdersYet: 'Sin pedidos aún',
    ordersWillAppear: 'Tus pedidos aparecerán aquí', duration: 'Duración', order: 'Pedido',
    pendingPayment: 'Pago Pendiente', pendingVerification: 'Verificación Pendiente',
    approved: 'Aprobado', rejected: 'Rechazado', delivered: 'Entregado',
    yourKey: 'Tu Clave', yourFiles: 'Tus Archivos', download: 'Descargar', note: 'Nota', loading: 'Cargando...',
    noPanelsAvailable: 'No hay paneles disponibles', checkBackLater: 'Vuelve más tarde por nuevos artículos',
    currency: 'Moneda', language: 'Idioma',
    weProvide: 'Proporcionamos paneles de la mejor calidad con servicio confiable',
    defaultDesc: 'Paneles FF Premium para iOS y Android. Obtén los mejores paneles con entrega instantánea y soporte 24/7.',
    promoApplied: '¡Promo aplicada!', off: 'de descuento',
    username: 'Usuario', password: 'Contraseña', email: 'Correo', telegram: 'Usuario de Telegram',
    loginTitle: 'Iniciar Sesión', registerTitle: 'Crear Cuenta', dontHaveAccount: '¿No tienes cuenta?',
    alreadyHaveAccount: '¿Ya tienes cuenta?', signUp: 'Registrarse', signIn: 'Entrar',
    supportBtn: 'Soporte', contactSupport: 'Contactar Soporte',
  },
  pt: {
    home: 'Início', store: 'Loja', cart: 'Carrinho', login: 'Entrar', register: 'Registrar', logout: 'Sair',
    myOrders: 'Meus Pedidos', admin: 'Admin', browseStore: 'Ver Loja', createAccount: 'Criar Conta',
    panelsAvailable: 'Painéis Disponíveis', categories: 'Categorias', support: 'Suporte',
    bothPlatforms: 'Ambas Plataformas', whyChoose: 'Por que escolher',
    premiumQuality: 'Qualidade Premium', premiumQualityDesc: 'Painéis de primeira com recursos avançados e atualizações regulares',
    instantDelivery: 'Entrega Instantânea', instantDeliveryDesc: 'Receba sua chave do painel instantaneamente após a verificação do pagamento',
    safeSecure: 'Seguro e Protegido', safeSecureDesc: 'Proteção anti-detecção com sistema de pagamento seguro',
    multiPlatform: 'Multiplataforma', multiPlatformDesc: 'Suporte completo para dispositivos iOS e Android',
    support247: 'Suporte 24/7', support247Desc: 'Equipe de suporte dedicada disponível 24 horas',
    bestPrices: 'Melhores Preços', bestPricesDesc: 'Preços competitivos com descontos e promos regulares',
    readyToStart: 'Pronto para Começar?', readyToStartDesc: 'Junte-se agora e explore nossa coleção de painéis premium',
    getStartedFree: 'Comece Grátis',
    browseOurPremium: 'Explore nossa coleção premium de painéis FF',
    all: 'Todos', addToCart: 'Adicionar ao Carrinho', outOfStock: 'Esgotado',
    day1: '1 Dia', days7: '7 Dias', days30: '30 Dias', days60: '60 Dias',
    shoppingCart: 'Carrinho de Compras', itemsInCart: 'item(ns) no seu carrinho',
    promoCode: 'Código Promo', apply: 'Aplicar', remove: 'Remover',
    orderSummary: 'Resumo do Pedido', subtotal: 'Subtotal', discount: 'Desconto', total: 'Total',
    clearCart: 'Limpar Carrinho', proceedToCheckout: 'Ir para Pagamento',
    cartEmpty: 'Seu carrinho está vazio', cartEmptyDesc: 'Explore nossa loja para adicionar itens',
    checkout: 'Pagamento', completeYourPurchase: 'Complete sua compra',
    selectPaymentMethod: 'Selecionar Método de Pagamento', indian: 'Indiano', international: 'Internacional',
    scanQrToPay: 'Escaneie QR para Pagar', payExactly: 'Pague exatamente', viaUPI: 'via UPI',
    selectCrypto: 'Selecionar Criptomoeda', selectUsdtNetwork: 'Selecionar Rede USDT',
    sendWorth: 'no valor de', to: 'para', copyAddress: 'Copiar Endereço',
    cryptoWarning: 'Envie o valor exato na rede correta. Transferências incorretas não podem ser recuperadas.',
    ivePaidPlaceOrder: 'Já Paguei - Fazer Pedido', placingOrder: 'Fazendo Pedido...',
    orderCreated: 'Pedido Criado com Sucesso!', submitProof: 'Envie seu',
    toVerifyPayment: 'para verificar o pagamento', utrNumber: 'Número UTR', transactionHash: 'Hash da Transação',
    enterUtr: 'Insira o número de referência UTR/Transação do seu pagamento UPI',
    enterTxHash: 'Insira o hash/ID da transação do seu pagamento cripto',
    enter12DigitUtr: 'Insira número UTR de 12 dígitos', enterTxHashPlaceholder: 'Insira hash da transação',
    submitForVerification: 'Enviar para Verificação', submitting: 'Enviando...',
    paymentVerificationPending: 'Verificação de Pagamento Pendente',
    utrSubmitted: 'foi enviado. Verificaremos seu pagamento e entregaremos a chave em breve.',
    checkStatusInMyOrders: 'Você pode verificar o status na seção "Meus Pedidos"',
    viewMyOrders: 'Ver Meus Pedidos',
    trackOrderStatus: 'Acompanhe o status do seu pedido', noOrdersYet: 'Sem pedidos ainda',
    ordersWillAppear: 'Seus pedidos aparecerão aqui', duration: 'Duração', order: 'Pedido',
    pendingPayment: 'Pagamento Pendente', pendingVerification: 'Verificação Pendente',
    approved: 'Aprovado', rejected: 'Rejeitado', delivered: 'Entregue',
    yourKey: 'Sua Chave', yourFiles: 'Seus Arquivos', download: 'Baixar', note: 'Nota', loading: 'Carregando...',
    noPanelsAvailable: 'Nenhum painel disponível', checkBackLater: 'Volte mais tarde para novos itens',
    currency: 'Moeda', language: 'Idioma',
    weProvide: 'Fornecemos painéis da melhor qualidade com serviço confiável',
    defaultDesc: 'Painéis FF Premium para iOS e Android. Obtenha os melhores painéis com entrega instantânea e suporte 24/7.',
    promoApplied: 'Promo aplicada!', off: 'de desconto',
    username: 'Usuário', password: 'Senha', email: 'Email', telegram: 'Usuário do Telegram',
    loginTitle: 'Entrar', registerTitle: 'Criar Conta', dontHaveAccount: 'Não tem conta?',
    alreadyHaveAccount: 'Já tem conta?', signUp: 'Cadastrar', signIn: 'Entrar',
    supportBtn: 'Suporte', contactSupport: 'Contatar Suporte',
  },
  bn: {
    home: 'হোম', store: 'স্টোর', cart: 'কার্ট', login: 'লগইন', register: 'রেজিস্টার', logout: 'লগআউট',
    myOrders: 'আমার অর্ডার', admin: 'এডমিন', browseStore: 'স্টোর দেখুন', createAccount: 'একাউন্ট তৈরি',
    panelsAvailable: 'প্যানেল পাওয়া যাচ্ছে', categories: 'ক্যাটাগরি', support: 'সাপোর্ট',
    bothPlatforms: 'উভয় প্ল্যাটফর্ম', whyChoose: 'কেন বেছে নেবেন',
    all: 'সব', addToCart: 'কার্টে যোগ করুন', outOfStock: 'স্টকে নেই',
    day1: '১ দিন', days7: '৭ দিন', days30: '৩০ দিন', days60: '৬০ দিন',
    supportBtn: 'সাপোর্ট', contactSupport: 'সাপোর্টে যোগাযোগ করুন',
    loading: 'লোড হচ্ছে...', browseOurPremium: 'আমাদের প্রিমিয়াম FF প্যানেল ব্রাউজ করুন',
  },
  ms: {
    home: 'Utama', store: 'Kedai', cart: 'Troli', login: 'Log Masuk', register: 'Daftar', logout: 'Log Keluar',
    browseStore: 'Lihat Kedai', createAccount: 'Buat Akaun', support: 'Sokongan',
    supportBtn: 'Sokongan', contactSupport: 'Hubungi Sokongan',
  },
  id: {
    home: 'Beranda', store: 'Toko', cart: 'Keranjang', login: 'Masuk', register: 'Daftar', logout: 'Keluar',
    browseStore: 'Lihat Toko', createAccount: 'Buat Akun', support: 'Dukungan',
    supportBtn: 'Dukungan', contactSupport: 'Hubungi Dukungan',
  },
  tl: {
    home: 'Home', store: 'Tindahan', cart: 'Cart', login: 'Mag-login', register: 'Mag-register', logout: 'Mag-logout',
    browseStore: 'Tingnan ang Tindahan', createAccount: 'Gumawa ng Account', support: 'Suporta',
    supportBtn: 'Suporta', contactSupport: 'Makipag-ugnay sa Suporta',
  },
  ja: {
    home: 'ホーム', store: 'ストア', cart: 'カート', login: 'ログイン', register: '登録', logout: 'ログアウト',
    browseStore: 'ストアを見る', createAccount: 'アカウント作成', support: 'サポート',
    supportBtn: 'サポート', contactSupport: 'サポートに連絡',
  },
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('ff_currency') || 'USD';
  });
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('ff_language') || 'en';
  });
  const [rates, setRates] = useState({ USD: 1 });
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [geoDetected, setGeoDetected] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem('ff_rates_usd');
    const cachedTime = localStorage.getItem('ff_rates_usd_time');
    if (cached && cachedTime && Date.now() - parseInt(cachedTime) < 3600000) {
      const parsed = JSON.parse(cached);
      setRates({ ...FALLBACK_RATES, ...parsed });
      setRatesLoaded(true);
      return;
    }
    fetch('https://api.frankfurter.dev/v1/latest?base=USD')
      .then(r => r.json())
      .then(data => {
        const allRates = { ...FALLBACK_RATES, USD: 1, ...data.rates };
        setRates(allRates);
        setRatesLoaded(true);
        localStorage.setItem('ff_rates_usd', JSON.stringify(allRates));
        localStorage.setItem('ff_rates_usd_time', String(Date.now()));
      })
      .catch(() => {
        setRates({ ...FALLBACK_RATES });
        setRatesLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (localStorage.getItem('ff_currency')) return;
    fetch('https://ipwhois.app/json/?objects=country_code')
      .then(r => r.json())
      .then(data => {
        if (data.country_code) {
          const detectedCurrency = COUNTRY_CURRENCY_MAP[data.country_code] || 'USD';
          const validCurrency = CURRENCIES.find(c => c.code === detectedCurrency);
          if (validCurrency) {
            setCurrencyState(detectedCurrency);
            localStorage.setItem('ff_currency', detectedCurrency);
          }
        }
        setGeoDetected(true);
      })
      .catch(() => setGeoDetected(true));
  }, []);

  const setCurrency = useCallback((code) => {
    setCurrencyState(code);
    localStorage.setItem('ff_currency', code);
  }, []);

  const setLanguage = useCallback((code) => {
    setLanguageState(code);
    localStorage.setItem('ff_language', code);
  }, []);

  const convertPrice = useCallback((usdPrice) => {
    const rate = rates[currency] || 1;
    return usdPrice * rate;
  }, [rates, currency]);

  const formatPrice = useCallback((usdPrice) => {
    const converted = convertPrice(usdPrice);
    const curr = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
    if (currency === 'JPY' || currency === 'IDR' || currency === 'INR' || currency === 'PKR' || currency === 'BDT') {
      return `${curr.symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${curr.symbol}${converted.toFixed(2)}`;
  }, [convertPrice, currency]);

  const t = useCallback((key) => {
    const lang = TRANSLATIONS[language] || TRANSLATIONS['en'];
    return lang[key] || TRANSLATIONS['en'][key] || key;
  }, [language]);

  const currencyInfo = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  return (
    <CurrencyContext.Provider value={{
      currency, setCurrency, language, setLanguage,
      rates, ratesLoaded, convertPrice, formatPrice,
      currencyInfo, CURRENCIES, LANGUAGES, t
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
