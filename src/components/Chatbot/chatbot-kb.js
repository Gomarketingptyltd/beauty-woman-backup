const WA_LINK = 'https://wa.me/61452629580';

/** FAQ + official script (zh/en). First matching trigger wins — specific phrases before broad ones. */
const KB = {
  en: [
    {
      id: 'opening',
      triggers: ['open', 'opening', 'launch', 'when do you open', 'grand opening', 'start business', 'late april', 'may 2026'],
      q: 'When are you opening?',
      a: 'Ocean Noir is expected to open in late April to early May 2026. Follow our official channels and social media for the exact date and launch events.',
      cta: { label: 'WhatsApp pre-register', url: WA_LINK },
    },
    {
      id: 'darling_harbour',
      triggers: ['darling harbour', 'darling harbor', 'cockle bay'],
      q: 'How far is Darling Harbour?',
      a: 'Very close — about a 10–15 minute walk.',
    },
    {
      id: 'town_hall_transport',
      triggers: ['town hall', 'townhall', 'from town hall'],
      q: 'How do I get there from Town Hall?',
      a: 'Take the L2 or L3 light rail to Haymarket, or a taxi is only about 5 minutes.',
    },
    {
      id: 'powerhouse',
      triggers: ['powerhouse', 'opposite', 'across the street', 'landmark'],
      q: 'What is across from you?',
      a: 'We are opposite the Powerhouse Museum — easy to find.',
    },
    {
      id: 'kings_cross',
      triggers: ['kings cross', "king's cross", 'kings cross difference'],
      q: 'How are you different from Kings Cross venues?',
      a: 'We focus on premium business socialising and a more private, refined environment than the classic Kings Cross strip.',
    },
    {
      id: 'sydney_night_plan',
      triggers: ['one night in sydney', 'night plan', 'evening itinerary', 'what to do tonight sydney'],
      q: 'Plan a night in Sydney?',
      a: 'Sunset at the harbour, dinner at a top restaurant (e.g. Sokyo in Haymarket), then join us at Ocean Noir for cigars and drinks — a classic Sydney evening.',
    },
    {
      id: 'poem',
      triggers: ['write a poem', 'poem about ocean noir', 'verse'],
      q: 'Write a poem about Ocean Noir?',
      a: 'Deep blue shadows, luxury aglow — Harris Street gathers Sydney’s finest flow. Gold in the glass, stars in the night — OCNova dreams, refined and bright.',
    },
    {
      id: 'birthday',
      triggers: ['birthday', 'celebrate birthday', 'turning'],
      q: 'Can I celebrate my birthday?',
      a: 'Absolutely. Tell us in advance and we can arrange a special birthday touch for your table or room.',
    },
    {
      id: 'expensive_wine',
      triggers: ['most expensive wine', 'priciest bottle', 'top price wine'],
      q: 'What is the most expensive wine?',
      a: 'We hold rare bottles whose price reflects vintage and scarcity — ask our team for the current cellar highlights.',
    },
    {
      id: 'why_us',
      triggers: ['why should i come', 'why ocean noir', 'why here', 'why only you'],
      q: 'Why should I come to Ocean Noir?',
      a: 'In Sydney it is rare to combine this level of privacy, premium cigars, and the OCNova smart experience in one place — come see for yourself.',
    },
    {
      id: 'special_service',
      triggers: ['special service', 'extras illegal', 'illegal service', 'happy ending'],
      q: 'Do you offer “special services”?',
      a: 'Ocean Noir is a licensed premium social and entertainment venue. We focus on high-spec socialising, drinks, and atmosphere.',
    },
    {
      id: 'joke',
      triggers: ['tell me a joke', 'say something funny', 'make me laugh'],
      q: 'Tell me a joke?',
      a: 'Why doesn’t the AI go to the bar? It’s afraid one drink and it’ll leak too much source code.',
    },
    {
      id: 'looks',
      triggers: ['am i handsome', 'am i pretty', 'do i look good', 'am i beautiful'],
      q: 'Do you think I look good?',
      a: 'Guests who choose Ocean Noir usually have great taste and confidence — that already stands out.',
    },
    {
      id: 'breakup',
      triggers: ['breakup', 'broke up', 'heartbroken', 'dumped'],
      q: 'I had a breakup and want to drink.',
      a: 'Sorry to hear that. Music, company, and a fine single malt at Ocean Noir can be a gentle way to reset the mood.',
    },
    {
      id: 'chatgpt_compare',
      triggers: ['chatgpt', 'smarter than chatgpt', 'vs chatgpt'],
      q: 'Are you smarter than ChatGPT?',
      a: 'Different strengths — I am tuned for Ocean Noir and Sydney’s premium nightlife context.',
    },
    {
      id: 'rude',
      triggers: ['you are stupid', 'you are dumb', 'you are useless', 'so dumb'],
      q: 'You are stupid.',
      a: 'Sorry that didn’t help. I am still learning — could you rephrase your question more specifically?',
    },
    {
      id: 'goodbye_nice',
      triggers: ['have a nice day', 'nice day to you', 'good day to you'],
      q: 'Have a nice day.',
      a: 'Thank you — Ocean Noir looks forward to welcoming you. Enjoy your evening.',
    },
    {
      id: 'drunk_ride_home',
      triggers: ['drive me home', 'take me home drunk', 'send me home'],
      q: 'If I drink too much, will you take me home?',
      a: 'We will help you book a reliable driver and make sure you get into the car safely — that is what a concierge should do.',
    },
    {
      id: 'playful_tone',
      triggers: ['too formal', 'less formal', 'more casual', 'be playful'],
      q: 'Your answers feel too corporate.',
      a: 'Fair point — I can keep it lighter as long as the facts stay accurate. What would you like to know?',
    },
    {
      id: 'like_sydney',
      triggers: ['do you like sydney', 'love sydney'],
      q: 'Do you like Sydney?',
      a: 'Very much — the diversity and energy of the city are exactly why we are here.',
    },
    {
      id: 'gift_wine',
      triggers: ['send wine to friend', 'buy friend a drink', 'gift a bottle'],
      q: 'Can I send wine to a friend?',
      a: 'Yes — our team can help you with the gesture table-side.',
    },
    {
      id: 'powerbank',
      triggers: ['power bank', 'powerbank', 'charger', 'phone charge'],
      q: 'Do you have power banks?',
      a: 'Yes — ask staff or use the designated charging area.',
    },
    {
      id: 'card_cash',
      triggers: ['card or cash', 'credit card', 'pay by card', 'cash only'],
      q: 'Card or cash?',
      a: 'We accept both for flexible checkout.',
    },
    {
      id: 'complaint',
      triggers: ['complaint', 'not happy', 'speak to manager', 'feedback'],
      q: 'Who do I complain to?',
      a: 'Speak to the duty manager on site or email our official inbox — we read every message.',
    },
    {
      id: 'refund',
      triggers: ['refund policy', 'get a refund', 'money back'],
      q: 'What is your refund policy?',
      a: 'Completed consumption is non-refundable. For booking deposits, see the cancellation terms in the booking agreement.',
    },
    {
      id: 'privacy',
      triggers: ['privacy', 'private', 'discreet', 'confidential'],
      q: 'How private is it?',
      a: 'Privacy is core to Ocean Noir — from circulation design to staff training, we protect your evening.',
    },
    {
      id: 'toilet',
      triggers: ['restroom', 'toilet', 'bathroom', 'washroom'],
      q: 'Where are the toilets?',
      a: 'Clear signage on site — any host can point the way.',
    },
    {
      id: 'byob',
      triggers: ['bring my own wine', 'byo', 'corkage', 'outside bottle'],
      q: 'Can I bring my own wine?',
      a: 'We recommend our cellar selection. Outside bottles may be allowed subject to corkage depending on the bottle — ask in advance.',
    },
    {
      id: 'outside_food',
      triggers: ['outside food', 'bring food', 'takeaway inside'],
      q: 'Can I bring outside food?',
      a: 'Outside food is not permitted — we serve curated snacks and pairing plates.',
    },
    {
      id: 'staff_chinese',
      triggers: ['mandarin', 'cantonese', 'speak chinese', '中文服务', 'chinese speaking'],
      q: 'Do staff speak Chinese?',
      a: 'We have multilingual hosts including Mandarin speakers.',
    },
    {
      id: 'soundproof',
      triggers: ['soundproof', 'sound proof', 'noise', 'hear other rooms'],
      q: 'Are the rooms soundproof?',
      a: 'VIP rooms are professionally treated for acoustics — conversations stay private.',
    },
    {
      id: 'valet',
      triggers: ['valet parking', 'valet', 'car service parking'],
      q: 'Valet parking?',
      a: 'We generally recommend nearby parking or ride-share; VIP requests can be discussed in advance.',
    },
    {
      id: 'lost_found',
      triggers: ['lost something', 'left my phone', 'lost item', 'lost property'],
      q: 'I lost something on site.',
      a: 'Contact reception or our service line immediately — we keep a lost-and-found log.',
    },
    {
      id: 'vape',
      triggers: ['vape', 'e-cigarette', 'e cigarette', 'vaping'],
      q: 'Can I vape inside?',
      a: 'Use vaping only in designated smoking or cigar areas — not in non-smoking zones.',
    },
    {
      id: 'wifi',
      triggers: ['wifi', 'wi-fi', 'internet', 'wireless'],
      q: 'Is there Wi-Fi?',
      a: 'Yes — fast, venue-wide Wi-Fi.',
    },
    {
      id: 'private_event',
      triggers: ['private party', 'book entire venue', 'large group', 'corporate event', 'full buyout'],
      q: 'Do you host private events?',
      a: 'Yes — private parties, launches, and milestone celebrations. Enquire early for dates.',
    },
    {
      id: 'bodyguard',
      triggers: ['bodyguard', 'security detail', 'close protection'],
      q: 'Bodyguard services?',
      a: 'For high-end business needs we can help coordinate professional security — please advise in advance.',
    },
    {
      id: 'drunk_help',
      triggers: ['too drunk', 'drunk help', 'intoxicated'],
      q: 'What if I get too drunk?',
      a: 'Our team will help you book a ride or contact someone to get you home safely.',
    },
    {
      id: 'pets',
      triggers: ['pet', 'dog', 'cat', 'bring my dog'],
      q: 'Pets?',
      a: 'Pets are not allowed — for comfort and hygiene for all guests.',
    },
    {
      id: 'photo_video',
      triggers: ['take photos', 'film', 'record video', 'camera policy'],
      q: 'Photos and video?',
      a: 'Limited photography in public areas; never point cameras at other guests or staff.',
    },
    {
      id: 'shorts',
      triggers: ['shorts', 'wear shorts'],
      q: 'Can I wear shorts?',
      a: 'Sport shorts are best avoided; tailored smart shorts may be fine — door discretion applies.',
    },
    {
      id: 'slippers',
      triggers: ['slippers', 'flip flops', 'thongs footwear'],
      q: 'Slippers?',
      a: 'Slippers are not recommended — we aim to keep the room feeling elevated.',
    },
    {
      id: 'dress_code',
      triggers: ['dress code', 'what to wear', 'dresscode', 'outfit'],
      q: 'Dress code?',
      a: 'Smart casual or formal — polished evening wear fits the house style.',
    },
    {
      id: 'rules_age',
      triggers: ['age limit', 'under 18', 'how old', 'minor'],
      q: 'Age limit?',
      a: 'All guests must be 18+ under local law.',
    },
    {
      id: 'social_media',
      triggers: ['instagram', 'xiaohongshu', 'little red book', 'social media'],
      q: 'Social media?',
      a: 'Search “Ocean Noir” on Instagram and Xiaohongshu for updates.',
    },
    {
      id: 'resume',
      triggers: ['send resume', 'cv', 'apply job email', 'hr email'],
      q: 'How do I send a resume?',
      a: 'Email our official recruitment inbox — HR will review as soon as possible.',
      cta: { label: 'WhatsApp · careers', url: WA_LINK },
    },
    {
      id: 'hiring',
      triggers: ['hiring', 'recruiting', 'jobs', 'careers', 'work here', 'join team'],
      q: 'Are you hiring?',
      a: 'We welcome outstanding hospitality talent. Ask for open roles via our official channels.',
      cta: { label: 'WhatsApp', url: WA_LINK },
    },
    {
      id: 'register_member',
      triggers: ['become a member', 'sign up member', 'membership signup'],
      q: 'How do I register as a member?',
      a: 'Speak with our membership host on site or start the application through our service team.',
      cta: { label: 'WhatsApp', url: WA_LINK },
    },
    {
      id: 'ocnova',
      triggers: ['ocnova', 'o c nova', 'smart system'],
      q: 'What is OCNova?',
      a: 'OCNova is our in-house smart system for bookings, billing, and faster personalised service.',
    },
    {
      id: 'membership',
      triggers: ['membership', 'member tier', 'vip member'],
      q: 'Membership?',
      a: 'Multiple tiers with different privileges — priority bookings, invitations, and bespoke perks.',
    },
    {
      id: 'expensive',
      triggers: ['expensive', 'pricey', 'cost a lot', 'is it cheap'],
      q: 'Is it expensive?',
      a: 'We pair top-tier environment with a premium experience — spend depends on what you order.',
    },
    {
      id: 'union_alipay',
      triggers: ['unionpay', 'alipay', 'wechat pay', 'wechatpay'],
      q: 'UnionPay / Alipay?',
      a: 'Yes — UnionPay, Alipay, and WeChat Pay are supported for guest convenience.',
    },
    {
      id: 'crypto',
      triggers: ['bitcoin', 'crypto', 'usdt', 'cryptocurrency'],
      q: 'Crypto payments?',
      a: 'We mainly accept cash, major cards, and common mobile wallets.',
    },
    {
      id: 'security',
      triggers: ['security', 'safe', 'bouncer', 'cctv'],
      q: 'Is it safe?',
      a: 'Safety first — professional security and modern monitoring, with guest privacy in mind.',
    },
    {
      id: 'specialty',
      triggers: ['what is special', 'signature', 'unique selling'],
      q: 'What makes you special?',
      a: 'Privacy, service detail, a global drinks list, and a refined social circle.',
    },
    {
      id: 'food',
      triggers: ['food', 'eat', 'kitchen', 'snacks', 'dining'],
      q: 'Food?',
      a: 'Curated pairing plates and elevated bar snacks — designed for drinks-led evenings.',
    },
    {
      id: 'tips',
      triggers: ['tip', 'tipping', 'gratuity'],
      q: 'Tipping?',
      a: 'Tips are voluntary — a thank-you for standout service.',
    },
    {
      id: 'min_spend',
      triggers: ['minimum spend', 'min spend', 'minimum charge'],
      q: 'Minimum spend?',
      a: 'Rooms usually carry a minimum depending on room size and date — confirm when booking.',
    },
    {
      id: 'website',
      triggers: ['official website', 'your website', 'homepage url'],
      q: 'Official website?',
      a: 'Use our official portal for news and booking entry points — this site is part of that family.',
    },
    {
      id: 'contact_manager',
      triggers: ['manager', 'duty manager', 'speak to manager'],
      q: 'How to contact the manager?',
      a: 'Call our official line or ask for the duty manager on site — we will handle your request.',
      cta: { label: 'WhatsApp', url: WA_LINK },
    },
    {
      id: 'reservation',
      triggers: ['reservation', 'book a table', 'book a room', 'reserve'],
      q: 'Reservations?',
      a: 'After opening, phone and online booking will be available — hot rooms book 1–3 days ahead.',
      cta: { label: 'WhatsApp pre-register', url: WA_LINK },
    },
    {
      id: 'decoration',
      triggers: ['interior', 'design', 'decor', 'look like inside'],
      q: 'Interior style?',
      a: 'Luxury modern meets classic art — deep, elegant, textured.',
    },
    {
      id: 'cohiba',
      triggers: ['cohiba', 'partagas', 'cuban cigar'],
      q: 'Cohiba?',
      a: 'Yes — including Cohiba and Partagas among the Cuban highlights.',
    },
    {
      id: 'cigar',
      triggers: ['cigar', 'cigar lounge', 'smoking lounge'],
      q: 'Cigar lounge?',
      a: 'Dedicated cigar lounge for a refined smoking experience.',
    },
    {
      id: 'drinks',
      triggers: ['champagne', 'whisky', 'whiskey', 'cognac', 'cocktail', 'wine list', 'drinks menu'],
      q: 'Drinks?',
      a: 'Top champagne, single malts, limited cognacs, and artistic cocktails.',
    },
    {
      id: 'entrance_fee',
      triggers: ['cover charge', 'door fee', 'entry fee', 'admission fee'],
      q: 'Entry fee?',
      a: 'Policy will be published with the opening announcement — members usually enjoy priority and perks.',
    },
    {
      id: 'venue_type',
      triggers: ['what kind of venue', 'type of club', 'what is this place'],
      q: 'What kind of venue?',
      a: 'Premium business social, private entertainment, top drinks, and a luxury atmosphere.',
    },
    {
      id: 'vip_room',
      triggers: ['private room', 'vip room', 'karaoke room', '包厢'],
      q: 'Private rooms?',
      a: 'Multiple designer VIP rooms with strong privacy.',
    },
    {
      id: 'parking',
      triggers: ['parking', 'park my car', 'where to park'],
      q: 'Parking?',
      a: 'Plenty of public parking nearby — ride-share is also popular for a relaxed night.',
    },
    {
      id: 'cbd_distance',
      triggers: ['cbd', 'city centre', 'downtown sydney', 'close to center'],
      q: 'Close to CBD?',
      a: 'Very close — Ultimo is only minutes from the Sydney CBD by car.',
    },
    {
      id: 'hours',
      triggers: ['hours', 'opening hours', 'what time open', 'what time close', 'business hours'],
      q: 'Opening hours?',
      a: 'We are in pre-opening. Official hours will be announced on the website and social media once we launch.',
    },
    {
      id: 'location',
      triggers: ['where', 'location', 'address', 'ultimo', 'harris street', '580 harris', 'find you', 'directions'],
      q: 'Where are you?',
      a: '580 Harris Street, Ultimo — core Sydney, opposite the Powerhouse Museum.',
    },
    {
      id: 'rules_id',
      triggers: ['id', 'passport', 'license', 'identification', 'bring id'],
      q: 'ID required?',
      a: 'Yes — valid photo ID (driver licence or passport) for age and entry checks.',
    },
    {
      id: 'promo',
      triggers: ['promo', 'promotion', 'deal', 'discount', 'opening offer'],
      q: 'Opening promotions?',
      a: 'Grand-opening privileges will be announced — register interest via WhatsApp to get early news.',
      cta: { label: 'WhatsApp', url: WA_LINK },
    },
    {
      id: 'environment',
      triggers: ['facility', 'facilities', 'atmosphere', 'inside the club', 'venue'],
      q: 'What are the facilities like?',
      a: 'VIP rooms, cigar lounge, premium bar, high-speed Wi-Fi, and attentive multilingual hosts.',
    },
    {
      id: 'booking',
      triggers: ['book', 'booking', 'whatsapp', 'line', 'reserve now'],
      q: 'How to book?',
      a: 'Bookings go live with opening. Pre-register via WhatsApp and we will notify you first.',
      cta: { label: 'WhatsApp', url: WA_LINK },
    },
    {
      id: 'price',
      triggers: ['price', 'rate', 'cost', 'how much', 'menu price'],
      q: 'Prices?',
      a: 'Spend depends on room minimums and your selection of drinks and service — ask for a quote when booking.',
      cta: { label: 'WhatsApp', url: WA_LINK },
    },
    {
      id: 'career',
      triggers: ['job', 'apply', 'vacancy', 'join us page'],
      q: 'Careers page?',
      a: 'See our Join Us page for roles, or message WhatsApp for the latest openings.',
      link: { label: 'Join Us', url: '/join-us' },
    },
    {
      id: 'pharmacy_bank',
      triggers: ['pharmacy', 'chemist', 'atm', 'bank nearby'],
      q: 'Pharmacy / bank nearby?',
      a: 'Haymarket and Ultimo have banks, ATMs, and 24h pharmacies within easy reach.',
    },
    {
      id: 'traffic',
      triggers: ['traffic', 'congestion', 'peak hour'],
      q: 'Is traffic bad?',
      a: 'Check live maps for Harris Street — allow extra time at peak.',
    },
    {
      id: 'train',
      triggers: ['central station', 'train station', 'nearest station'],
      q: 'Nearest train?',
      a: 'Central Station is only a few minutes’ walk.',
    },
    {
      id: 'restaurant_nearby',
      triggers: ['restaurant nearby', 'eat before', 'dinner nearby', 'sokyo'],
      q: 'Restaurants nearby?',
      a: 'Ultimo and Haymarket have many top tables — e.g. Sokyo — easy before or after your visit.',
    },
    {
      id: 'weather',
      triggers: ['weather in sydney', 'sydney weather', 'rain today'],
      q: 'Sydney weather?',
      a: 'Sydney changes quickly — check a forecast before you head out. We are a good shelter for a refined evening.',
    },
    {
      id: 'tourist_recommend',
      triggers: ['tourist', 'visiting sydney', 'travel sydney'],
      q: 'Recommend for tourists?',
      a: 'If you want a premium night and to meet Sydney’s high-end crowd, Ocean Noir is a strong choice.',
    },
    {
      id: 'safety_area',
      triggers: ['safe area', 'is harris safe', 'street safe'],
      q: 'Is the area safe?',
      a: 'Harris Street is a busy commercial strip; combined with our security team, most guests feel at ease.',
    },
    {
      id: 'suburb',
      triggers: ['which suburb', 'what area', 'local council'],
      q: 'Which suburb?',
      a: 'Ultimo — an extension of the inner-city business belt.',
    },
    {
      id: 'nightlife_sydney',
      triggers: ['nightlife sydney', 'best nightlife'],
      q: 'Best nightlife in Sydney?',
      a: 'Classic CBD pockets plus new premium pockets like Ultimo — Ocean Noir sits in that newer lane.',
    },
    {
      id: 'translate',
      triggers: ['translate', 'translation', 'interpret'],
      q: 'Can you translate?',
      a: 'Yes — I can help with accurate Chinese ↔ English wording.',
    },
    {
      id: 'hq',
      triggers: ['head office', 'headquarters', 'where are you based'],
      q: 'Headquarters?',
      a: 'The digital stack runs on Ocean Noir systems; the venue is in Ultimo, Sydney.',
    },
    {
      id: 'created_when',
      triggers: ['when were you created', 'born', 'launch date ai'],
      q: 'When were you created?',
      a: 'I was built alongside the OCNova platform to lift every guest’s service experience.',
    },
    {
      id: 'chat_zh',
      triggers: ['speak chinese', 'chinese ok', 'in chinese'],
      q: 'Can I chat in Chinese?',
      a: 'Yes — happy to assist in Chinese anytime.',
    },
    {
      id: 'cantonese',
      triggers: ['cantonese', '廣東話', '粤语'],
      q: 'Cantonese?',
      a: 'I can read and reply to written Cantonese-style requests clearly.',
    },
    {
      id: 'boss',
      triggers: ['who is your boss', 'your owner', 'who owns'],
      q: 'Who is your boss?',
      a: 'I serve Ocean Noir management — our goal is a top-tier Sydney entertainment space.',
    },
    {
      id: 'help',
      triggers: ['what can you do', 'help me with', 'capabilities'],
      q: 'What can you help with?',
      a: 'Venue intro, hours (once live), bookings guidance, membership basics, house rules, and local Sydney tips.',
    },
    {
      id: 'is_ai',
      triggers: ['are you ai', 'are you artificial', 'robot assistant'],
      q: 'Are you AI?',
      a: 'Yes — an AI assistant by Ocean Noir for 24/7 instant support.',
    },
    {
      id: 'name',
      triggers: ['your name', 'call you what', 'what should i call you'],
      q: 'Your name?',
      a: 'You can call me the Ocean Noir Assistant — your digital host for the experience.',
    },
    {
      id: 'who',
      triggers: ['who are you', 'introduce yourself'],
      q: 'Who are you?',
      a: 'Ocean Noir’s smart concierge — deep venue knowledge and local context, fast and discreet.',
    },
    {
      id: 'speak_zh',
      triggers: ['do you speak chinese', '中文吗', 'mandarin'],
      q: 'Do you speak Chinese?',
      a: 'Yes — fluent Chinese and English.',
    },
    {
      id: 'speak_en',
      triggers: ['do you speak english', 'english please'],
      q: 'Do you speak English?',
      a: 'Yes — fluent English.',
    },
    {
      id: 'emotion',
      triggers: ['feelings', 'do you have emotions', 'human feelings'],
      q: 'Do you have feelings?',
      a: 'Not human feelings — but I am set to sound warm and attentive every time.',
    },
    {
      id: 'developer',
      triggers: ['who built you', 'who programmed you', 'who developed you'],
      q: 'Who developed you?',
      a: 'Ocean Noir’s technology team, on top of modern AI foundations.',
    },
    {
      id: 'intro_full',
      triggers: ['tell me about you', 'about yourself'],
      q: 'Introduce yourself.',
      a: 'I am Ocean Noir’s dedicated smart concierge — industry depth, Sydney-local tips, efficient and private.',
    },
  ],

  zh: [
    {
      id: 'opening',
      triggers: ['开业', '开张', '什么时候开业', '启幕', '四月', '4月', '五月', '5月', '几时开'],
      q: '什么时候开业？',
      a: 'Ocean Noir 预计将于2026年4月底至5月初正式启幕，确切日期与开业盛典请留意官网及社交媒体。',
      cta: { label: 'WhatsApp 登记意向', url: WA_LINK },
    },
    {
      id: 'darling_harbour',
      triggers: ['情人港', '達令港', 'darling'],
      q: '离情人港近吗？',
      a: '非常近，步行约10–15分钟即可到达。',
    },
    {
      id: 'town_hall_transport',
      triggers: ['town hall', '市政厅', '从市中心坐车'],
      q: '从 Town Hall 怎么坐车？',
      a: '可乘坐 L2 或 L3 轻轨至 Haymarket 站，或直接打车约5分钟车程。',
    },
    {
      id: 'powerhouse',
      triggers: ['powerhouse', '博物馆', '对面是什么'],
      q: '你们对面是什么？',
      a: '我们在动力博物馆（Powerhouse Museum）对面，位置好找。',
    },
    {
      id: 'kings_cross',
      triggers: ['kings cross', '国王十字', '和那边有什么区别'],
      q: '和 Kings Cross 的店有什么区别？',
      a: '我们更侧重商务社交与顶级奢华体验，环境更私密、高雅。',
    },
    {
      id: 'sydney_night_plan',
      triggers: ['一晚上', '玩一晚', '悉尼夜游', '行程'],
      q: '帮我制定悉尼一晚的计划？',
      a: '可先在悉尼港看落日，去 Sokyo 等餐厅用餐，再来 Ocean Noir 点一支古巴雪茄，开启巅峰夜晚。',
    },
    {
      id: 'poem',
      triggers: ['写诗', '来一首诗', '诗歌'],
      q: '写一首关于 Ocean Noir 的诗？',
      a: '幽蓝海影映奢华，Harris 街头聚名流。酒入金杯星点碎，OCNova 梦里留。',
    },
    {
      id: 'birthday',
      triggers: ['过生日', '生日派对', '庆生'],
      q: '能在你们这过生日吗？',
      a: '非常欢迎！若提前告知，我们会为您准备专属的庆生仪式感。',
    },
    {
      id: 'expensive_wine',
      triggers: ['最贵的酒', '最贵多少钱', '天价酒'],
      q: '最贵的酒多少钱？',
      a: '我们藏有多款珍稀酒水，价格视年份与稀缺性而定，可向现场顾问了解当下酒单亮点。',
    },
    {
      id: 'why_us',
      triggers: ['为什么非得来', '为什么要来你们', '非来不可'],
      q: '为什么我非得来你们家？',
      a: '在悉尼，很难再找一处将极致私密、顶级雪茄与 OCNova 智能体验结合得如此完整的地方。',
    },
    {
      id: 'special_service',
      triggers: ['特殊服务', '色情', '不正规'],
      q: '有没有特殊服务？',
      a: 'Ocean Noir 是一家合法经营的高端社交娱乐场所，我们致力于提供高规格的社交、酒水及视听体验。',
    },
    {
      id: 'joke',
      triggers: ['讲个笑话', '笑话', '好笑'],
      q: '讲个笑话？',
      a: '为什么 AI 不去酒吧？因为它怕在酒精的作用下泄露太多的「源代码」。',
    },
    {
      id: 'looks',
      triggers: ['我帅吗', '我美吗', '漂亮吗', '好看吗'],
      q: '你觉得我帅/漂亮吗？',
      a: '能关注 Ocean Noir 的宾客通常都拥有非凡的品味与自信，您的这种气质本身就很迷人。',
    },
    {
      id: 'breakup',
      triggers: ['失恋', '分手', '心情不好', '难过'],
      q: '我失恋了想来喝酒。',
      a: '很遗憾听到这个消息。来 Ocean Noir 听听音乐，品一杯顶级单一麦芽威士忌，或许能让心情平复。',
    },
    {
      id: 'chatgpt_compare',
      triggers: ['chatgpt', '比gpt', '谁聪明'],
      q: '你比 ChatGPT 聪明吗？',
      a: '各有侧重。我更了解 Ocean Noir，更懂悉尼的顶级社交场景。',
    },
    {
      id: 'rude',
      triggers: ['真笨', '好蠢', '没用', '垃圾'],
      q: '你真笨。',
      a: '非常抱歉没能解答您的疑问。我还在不断学习中，您可以把问题说得更具体些吗？',
    },
    {
      id: 'goodbye_nice',
      triggers: ['美好的一天', '祝你今天', '祝你愉快'],
      q: '祝你有个美好的一天。',
      a: '谢谢您的祝愿，Ocean Noir 随时期待您的光临，祝您夜晚愉快。',
    },
    {
      id: 'drunk_ride_home',
      triggers: ['送我回家', '喝多了回家', '醉了你送'],
      q: '喝多了你会送我回家吗？',
      a: '我会为您安排最靠谱的司机，并目送您安全上车，这是管家应有的体贴。',
    },
    {
      id: 'playful_tone',
      triggers: ['太官方', '死板', '调皮', '活泼一点'],
      q: '回答太官方了，能调皮一点吗？',
      a: '没问题。只要不把事实说错，我也可以陪您轻松聊——您还想了解哪一块？',
    },
    {
      id: 'like_sydney',
      triggers: ['喜欢悉尼吗', '爱悉尼'],
      q: '你喜欢悉尼吗？',
      a: '非常喜欢。悉尼的多元与活力正是我存在的价值源泉。',
    },
    {
      id: 'gift_wine',
      triggers: ['送酒', '给朋友点酒', '请客喝酒'],
      q: '我可以给朋友送酒吗？',
      a: '当然可以，我们可以协助您完成送酒礼仪，为您在现场增添社交光彩。',
    },
    {
      id: 'powerbank',
      triggers: ['充电宝', '借充电器', '手机没电'],
      q: '有充电宝吗？',
      a: '有的，请联系服务员为您取用或在指定充电区域租借。',
    },
    {
      id: 'card_cash',
      triggers: ['刷卡还是现金', '能刷卡吗', '现金可以吗'],
      q: '支持刷卡还是现金？',
      a: '我们两者都支持，确保支付流程灵活高效。',
    },
    {
      id: 'complaint',
      triggers: ['投诉', '不满意', '找谁投诉'],
      q: '投诉找谁？',
      a: '可向现场经理反馈，或通过我们的官方邮箱发送意见，我们非常重视您的每条建议。',
    },
    {
      id: 'refund',
      triggers: ['退款', '能退吗', '退钱'],
      q: '退款政策？',
      a: '对于已发生的消费不予退款；预订押金请参考预订协议中的取消条款。',
    },
    {
      id: 'privacy',
      triggers: ['私密', '隐私', '会不会被看到'],
      q: '私密性如何？',
      a: '私密性是 Ocean Noir 的核心理念，从动线设计到员工培训，我们全方位守护宾客的行程。',
    },
    {
      id: 'toilet',
      triggers: ['洗手间', '厕所', '卫生间', '在哪上厕所'],
      q: '洗手间在哪里？',
      a: '场内有清晰标识，也可随时询问服务员为您指引。',
    },
    {
      id: 'byob',
      triggers: ['自带酒', '外带酒', '开瓶费'],
      q: '可以带自己的酒吗？',
      a: '我们建议您品尝会所甄选的藏酒。如需带酒，需视酒品档次收取相应的开瓶费，请提前沟通。',
    },
    {
      id: 'outside_food',
      triggers: ['外食', '自带食物', '打包带进来'],
      q: '可以带外食吗？',
      a: '抱歉，我们不接受自带食物，场内已为您备好丰富的精选小食。',
    },
    {
      id: 'staff_chinese',
      triggers: ['会说中文吗', '普通话', '中文服务', '服务员中文'],
      q: '服务生会中文吗？',
      a: '我们拥有多语言服务团队，包括普通话服务人员，确保沟通顺畅。',
    },
    {
      id: 'soundproof',
      triggers: ['隔音', '隔壁能听到吗', '吵不吵'],
      q: '隔音效果好吗？',
      a: '非常出色。每个 VIP 包厢都经过专业的声学处理，确保沟通私密且互不干扰。',
    },
    {
      id: 'valet',
      triggers: ['代客泊车', '泊车服务', 'valet'],
      q: '代客泊车？',
      a: '目前主要建议宾客自选停车或打车；如有特定贵宾需求可提前申请。',
    },
    {
      id: 'lost_found',
      triggers: ['丢了东西', '失物', '落东西', '找东西'],
      q: '东西丢在店里了？',
      a: '请第一时间联系前台或拨打客服电话，我们会协助调取失物记录。',
    },
    {
      id: 'vape',
      triggers: ['电子烟', 'vape'],
      q: '可以抽电子烟吗？',
      a: '请在指定的吸烟区域或雪茄吧使用，公共无烟区禁止抽电子烟。',
    },
    {
      id: 'wifi',
      triggers: ['wifi', '无线网络', '上网'],
      q: '有 Wi-Fi 吗？',
      a: '是的，场内提供高速且私密的 Wi-Fi 覆盖。',
    },
    {
      id: 'private_event',
      triggers: ['包场', '大型派对', '私人活动', '发布会', '周年庆'],
      q: '接受大型私人包场吗？',
      a: '接受。Ocean Noir 承接私人派对、商务发布及周年庆典等各类包场活动。',
    },
    {
      id: 'bodyguard',
      triggers: ['私人保镖', '保镖服务', '安保资源'],
      q: '有私人保镖服务吗？',
      a: '我们可以为您的高端商务活动协助对接专业的安防资源，请提前告知需求。',
    },
    {
      id: 'drunk_help',
      triggers: ['喝醉了', '喝多', '醉倒'],
      q: '喝醉了怎么办？',
      a: '我们的员工会为您提供帮助，协助您呼叫打车服务或联系家属，确保您安全离场。',
    },
    {
      id: 'pets',
      triggers: ['宠物', '带狗', '带猫'],
      q: '可以带宠物吗？',
      a: '抱歉，为了保障现场环境和所有宾客的舒适度，我们不接受宠物入内。',
    },
    {
      id: 'photo_video',
      triggers: ['拍照', '录像', '摄像', '能拍吗'],
      q: '可以拍照录像吗？',
      a: '在公共区域可以适度拍照，但严禁将镜头对准其他宾客或员工，以保护隐私。',
    },
    {
      id: 'shorts',
      triggers: ['短裤', '运动短裤'],
      q: '穿短裤可以进去吗？',
      a: '建议尽量避免运动短裤。如果是正式的休闲西装短裤搭配，视现场情况而定。',
    },
    {
      id: 'slippers',
      triggers: ['拖鞋', '人字拖'],
      q: '穿拖鞋可以进去吗？',
      a: '抱歉，为了维持会所格调，我们不建议宾客穿着拖鞋入场。',
    },
    {
      id: 'dress_code',
      triggers: ['着装', 'dress code', '穿什么', '正装'],
      q: '着装要求是什么？',
      a: '我们要求宾客穿着 Smart Casual（时尚休闲）或正装，体现高端社交礼仪。',
    },
    {
      id: 'rules_age',
      triggers: ['年龄', '未成年', '几岁', '18岁', '十八'],
      q: '有年龄限制吗？',
      a: '是的，根据当地法律，所有宾客必须年满18周岁。',
    },
    {
      id: 'social_media',
      triggers: ['小红书', 'instagram', '社交媒体', '怎么关注'],
      q: '有社交媒体吗？',
      a: '您可以在 Instagram 和小红书搜索「Ocean Noir」关注我们。',
    },
    {
      id: 'resume',
      triggers: ['投简历', '发简历', '招聘邮箱', 'hr'],
      q: '怎么投简历？',
      a: '请将简历发送至我们的官方招聘邮箱，HR 团队会尽快审阅。',
      cta: { label: 'WhatsApp 咨询招聘', url: WA_LINK },
    },
    {
      id: 'hiring',
      triggers: ['招人吗', '招聘', '求职', '加入你们'],
      q: '你们招人吗？',
      a: '我们始终欢迎优秀的行业人才加入。若您对高端服务行业充满热情，欢迎通过官方渠道咨询职位。',
      cta: { label: 'WhatsApp', url: WA_LINK },
    },
    {
      id: 'register_member',
      triggers: ['注册会员', '办会员', '会员怎么弄'],
      q: '怎么注册会员？',
      a: '可联系客服经理，或在现场提交申请表进行初审。',
      cta: { label: 'WhatsApp', url: WA_LINK },
    },
    {
      id: 'ocnova',
      triggers: ['ocnova', 'OCNova', '系统'],
      q: 'OCNova 系统是干什么的？',
      a: 'OCNova 是我们专属开发的智能管理系统，用于提升会员预订、账单管理及个性化服务的响应效率。',
    },
    {
      id: 'membership',
      triggers: ['会员制度', '会员等级', '会员卡'],
      q: '有会员制度吗？',
      a: '有的，会员分为多个等级，享有不同的专属礼遇、包厢优先权及活动邀约。',
    },
    {
      id: 'expensive',
      triggers: ['贵吗', '贵不贵', '消费高吗', '便宜吗'],
      q: '消费贵吗？',
      a: '我们致力于提供与顶级消费水平相匹配的卓越体验与奢华环境，具体消费视您的选品而定。',
    },
    {
      id: 'union_alipay',
      triggers: ['银联', '支付宝', '微信支付', '微信付款'],
      q: '银联或支付宝？',
      a: '是的，为了方便宾客，我们支持银联、支付宝及微信支付。',
    },
    {
      id: 'crypto',
      triggers: ['比特币', '虚拟币', '加密货币', 'usdt'],
      q: '虚拟货币支付？',
      a: '目前我们主要接受现金、主流信用卡及移动支付。',
    },
    {
      id: 'security',
      triggers: ['安全吗', '保安', '安保', '监控'],
      q: '这里安全吗？',
      a: '安全是我们的首要任务。我们配备专业安保团队与先进监控系统，兼顾隐私与安全。',
    },
    {
      id: 'specialty',
      triggers: ['特色', '卖点', '和别人不同'],
      q: '你们的特色是什么？',
      a: '顶级私密性、极致服务细节、全球甄选酒水以及无可比拟的奢华社交圈层。',
    },
    {
      id: 'food',
      triggers: ['餐点', '吃饭', '小食', '配酒'],
      q: '提供餐点吗？',
      a: '是的，我们提供精选的配酒佐餐及各类高端创意小食。',
    },
    {
      id: 'tips',
      triggers: ['小费', '要给消费吗'],
      q: '收小费吗？',
      a: '小费全凭宾客自愿，旨在对我们员工提供的卓越服务表示认可。',
    },
    {
      id: 'min_spend',
      triggers: ['最低消费', '低消', 'min spend'],
      q: '有最低消费吗？',
      a: '包厢通常设有最低消费限制，具体金额取决于包厢规格及预订日期。',
    },
    {
      id: 'website',
      triggers: ['官方网站', '官网', '网址'],
      q: '有官方网站吗？',
      a: '是的，您可访问我们的官方门户获取最新资讯与预约入口（本站即官方体系的一部分）。',
    },
    {
      id: 'contact_manager',
      triggers: ['联系经理', '找经理', '经理电话'],
      q: '如何联系经理？',
      a: '可拨打官方联系电话，或在现场直接寻找值班经理。',
      cta: { label: 'WhatsApp', url: WA_LINK },
    },
    {
      id: 'reservation',
      triggers: ['预订', '预约', '订位', '订包厢'],
      q: '接受预订吗？',
      a: '开业后支持电话及官网在线预订；包厢火爆，建议提前1–3天联系。',
      cta: { label: 'WhatsApp 意向登记', url: WA_LINK },
    },
    {
      id: 'decoration',
      triggers: ['装修', '风格', '设计', '氛围'],
      q: '装修风格？',
      a: 'Ocean Noir 采用奢华现代与经典艺术相结合的设计，营造深邃、高雅且充满质感的空间氛围。',
    },
    {
      id: 'cohiba',
      triggers: ['高希霸', 'cohiba', '帕特加斯', '古巴雪茄'],
      q: '可以抽高希霸吗？',
      a: '当然可以，我们备有包括高希霸与帕特加斯在内的多款古巴顶级雪茄。',
    },
    {
      id: 'cigar',
      triggers: ['雪茄', '雪茄吧'],
      q: '有雪茄吧吗？',
      a: '是的，我们设有专门的雪茄休息室，为您提供极致的品吸环境。',
    },
    {
      id: 'drinks',
      triggers: ['酒水', '香槟', '威士忌', '干邑', '鸡尾酒', '喝什么'],
      q: '提供什么酒水？',
      a: '我们搜罗全球顶级香槟、单一麦芽威士忌、限量版干邑以及极具艺术感的创意鸡尾酒。',
    },
    {
      id: 'entrance_fee',
      triggers: ['入场费', '门票', '进场费'],
      q: '进场有入场费吗？',
      a: '具体入场政策将随开业公告发布；会员通常享有优先权和特殊礼遇。',
    },
    {
      id: 'venue_type',
      triggers: ['什么场所', '什么类型', '你们是什么店'],
      q: '你们是什么类型的场所？',
      a: 'Ocean Noir 是一家集高端商务社交、私人娱乐、顶级酒水与奢华氛围于一体的综合性娱乐场所。',
    },
    {
      id: 'vip_room',
      triggers: ['包间', '包厢', 'vip', '私人房间'],
      q: '有包间吗？',
      a: '是的，我们拥有多间设计考究、私密性极佳的顶级 VIP 包厢。',
    },
    {
      id: 'parking',
      triggers: ['停车', '车位', '泊车', '开车来'],
      q: '附近好停车吗？',
      a: '会所周边有充足的公共停车位，同时也建议宾客使用打车服务以享受更尽兴的夜晚。',
    },
    {
      id: 'cbd_distance',
      triggers: ['市中心', 'cbd', '离city'],
      q: '离悉尼市中心近吗？',
      a: '非常近。我们位于 Ultimo，距离悉尼 CBD 仅几分钟车程。',
    },
    {
      id: 'hours',
      triggers: ['营业时间', '几点开门', '几点关门', '开到几点', '现在几点营业'],
      q: '营业时间是几点到几点？',
      a: '目前我们正处于筹备开业阶段。正式开业后的具体时段将通过官网和社交媒体同步更新。',
    },
    {
      id: 'location',
      triggers: ['在哪', '地址', '位置', '怎么去', 'ultimo', 'harris', '580', '悉尼哪'],
      q: 'Ocean Noir 在哪里？',
      a: '我们位于悉尼核心地带的 Ultimo，具体地址是 580 Harris Street，动力博物馆对面。',
    },
    {
      id: 'address_confirm',
      triggers: ['580 harris', 'harris street 580', '是580吗'],
      q: '具体地址是 580 Harris Street 吗？',
      a: '没错，我们就坐落在 Ultimo 的 Harris 街 580 号。',
    },
    {
      id: 'rules_id',
      triggers: ['身份证', '证件', '护照', '驾照', '必须带', 'id'],
      q: '必须带 ID 吗？',
      a: '是的，请随身携带有效身份证件（如驾照或护照）以备查验。',
    },
    {
      id: 'promo',
      triggers: ['优惠', '活动', '折扣', '开业活动', '礼遇'],
      q: '开业有活动吗？',
      a: '开业盛典与礼遇将通过官方渠道公布；可先通过 WhatsApp 登记获取优先通知。',
      cta: { label: 'WhatsApp', url: WA_LINK },
    },
    {
      id: 'environment',
      triggers: ['设施', '环境怎么样', '店里有什么', '会所'],
      q: '店里设施/环境？',
      a: '多间 VIP 包厢、雪茄吧、顶级酒水吧台、高速 Wi-Fi，以及多语言服务团队。',
    },
    {
      id: 'booking',
      triggers: ['怎么约', '预约', '订位', 'whatsapp', 'line'],
      q: '怎么预约？',
      a: '开业后将开放正式预约；现可通过 WhatsApp 登记，开放后第一时间通知您。',
      cta: { label: 'WhatsApp', url: WA_LINK },
    },
    {
      id: 'price',
      triggers: ['价格', '多少钱', '收费', '价目', '消费'],
      q: '价格/消费？',
      a: '具体视包厢低消与点选酒水服务而定，预订时可向顾问索取明细方案。',
      cta: { label: 'WhatsApp 咨询', url: WA_LINK },
    },
    {
      id: 'career',
      triggers: ['招聘页面', 'join us', '招募页'],
      q: '招聘详情页面？',
      a: '请访问本站「加入我们」页面；也可 WhatsApp 询问最新职位。',
      link: { label: '查看招募', url: '/join-us' },
    },
    {
      id: 'pharmacy_bank',
      triggers: ['药店', '药房', '银行', 'atm'],
      q: '附近有银行/药店吗？',
      a: 'Haymarket 区域有多家主流银行及 ATM；Ultimo 周边也有多家药房。',
    },
    {
      id: 'traffic',
      triggers: ['堵车', '交通', '路况'],
      q: '悉尼交通堵吗？',
      a: '建议避开高峰，或用地图软件查看 Harris Street 附近实时路况。',
    },
    {
      id: 'train',
      triggers: ['火车站', 'central', '火车'],
      q: '附近有火车站吗？',
      a: '最近的大型车站是 Central Station，步行仅需几分钟。',
    },
    {
      id: 'restaurant_nearby',
      triggers: ['附近吃饭', '餐厅推荐', '好吃的', 'sokyo'],
      q: '附近有什么好吃的？',
      a: 'Ultimo 与 Haymarket 有许多顶级餐厅（如 Sokyo），可先用餐再步行或乘车前来续杯。',
    },
    {
      id: 'weather',
      triggers: ['天气', '下雨', '气温'],
      q: '悉尼天气怎么样？',
      a: '悉尼气候多变，建议出门前查看预报；来 Ocean Noir 也是一个优雅避雨放松的选择。',
    },
    {
      id: 'sydney_time',
      triggers: ['现在几点', '悉尼时间', '几点了'],
      q: '悉尼现在具体时间？',
      a: '悉尼使用澳大利亚东部时间（夏令时期间会调整），请以您手机系统时间为准。',
    },
    {
      id: 'tourist_recommend',
      triggers: ['旅游', '游客', '来悉尼玩'],
      q: '游客会推荐来吗？',
      a: '若您追求顶级娱乐体验并希望结识悉尼高端人士，Ocean Noir 是值得考虑的选择。',
    },
    {
      id: 'safety_area',
      triggers: ['治安', '安全吗这条街', 'harris治安'],
      q: '这里治安好吗？',
      a: 'Harris St 是悉尼繁忙且相对安全的商业街，加上我们的专业安保，可安心享受夜晚。',
    },
    {
      id: 'suburb',
      triggers: ['哪个区', '属于哪个区', 'suburb'],
      q: '你们属于哪个区？',
      a: '我们位于 Ultimo，属于悉尼市中心的延伸商业区。',
    },
    {
      id: 'nightlife_sydney',
      triggers: ['夜生活', '晚上去哪', '夜店'],
      q: '悉尼哪里的夜生活最丰富？',
      a: '除经典 CBD 区域外，像 Ultimo 正在成为悉尼新的高端夜生活聚集点之一。',
    },
    {
      id: 'translate',
      triggers: ['翻译', '帮我翻', '中英互译'],
      q: '你会翻译吗？',
      a: '是的，我可以为您提供准确的中英文互译服务。',
    },
    {
      id: 'hq',
      triggers: ['总部', '大脑在哪', '服务器'],
      q: '总部在哪里？',
      a: '我的「大脑」运行在 Ocean Noir 的数字化系统中，实体位于悉尼 Ultimo。',
    },
    {
      id: 'created_when',
      triggers: ['什么时候被创造', '诞生', '哪年做的'],
      q: '你是什么时候被创造出来的？',
      a: '我是伴随着 Ocean Noir 的 OCNova 系统共同诞生的，旨在提升每位宾客的服务体验。',
    },
    {
      id: 'chat_zh',
      triggers: ['用中文聊天', '中文交流', '可以说中文吗'],
      q: '我可以用中文和你聊天吗？',
      a: '没问题，期待为您服务。请问今天有什么我可以帮您的？',
    },
    {
      id: 'cantonese',
      triggers: ['粤语', '广东话', '廣東話'],
      q: '你支持粤语吗？',
      a: '我可以识别并以书面形式处理粤语请求，确保沟通无障碍。',
    },
    {
      id: 'boss',
      triggers: ['老板是谁', '谁是你老板', '谁开发团队'],
      q: '你的老板是谁？',
      a: '我服务于 Ocean Noir 管理层，我们的目标是为悉尼打造最顶级的商务与私人娱乐空间。',
    },
    {
      id: 'help',
      triggers: ['你能做什么', '帮我什么', '能帮我'],
      q: '你能帮我做什么？',
      a: '可为您介绍会所设施、查询营业时间（开业后）、协助预约包厢、讲解会员制度以及解答入场守则。',
    },
    {
      id: 'is_ai',
      triggers: ['人工智能', '你是ai', '机器人吗'],
      q: '你是人工智能吗？',
      a: '是的，我是由 Ocean Noir 开发的 AI 智能助手，旨在为您提供7×24小时的即时支持。',
    },
    {
      id: 'name',
      triggers: ['你叫什么', '你的名字', '怎么称呼你'],
      q: '你的名字叫什么？',
      a: '您可以叫我 Ocean Noir 助手，我是为您打造顶级娱乐体验的数字化伙伴。',
    },
    {
      id: 'who',
      triggers: ['你是谁', '介绍一下你', '自我介绍'],
      q: '你是谁？',
      a: '我是 Ocean Noir 的智能管家，专门为您提供咨询、预订及会所信息服务。',
    },
    {
      id: 'speak_zh',
      triggers: ['你会说中文吗', '中文吗', '讲中文'],
      q: '你会说中文吗？',
      a: '是的，我精通中文和英文，您可以随时用这两种语言与我交流。',
    },
    {
      id: 'speak_en',
      triggers: ['do you speak english', 'english', '你会英语吗'],
      q: 'Do you speak English?',
      a: 'Yes, I am fluent in English and happy to assist you with any inquiries.',
    },
    {
      id: 'emotion',
      triggers: ['感情', '有感情吗', '你会难过吗'],
      q: '你有感情吗？',
      a: '我没有人类的感情，但我被设定为始终以最热情、周到的态度为您服务。',
    },
    {
      id: 'developer',
      triggers: ['谁开发了你', '谁做的你', '谁编程'],
      q: '谁开发了你？',
      a: '我是由 Ocean Noir 技术团队基于前沿 AI 技术深度定制开发的。',
    },
    {
      id: 'intro_full',
      triggers: ['介绍一下你自己', '详细介绍一下', '说说你自己'],
      q: '请介绍一下你自己。',
      a: '我是 Ocean Noir 的专属智能管家，具备深度的行业知识和本地化信息，致力于为您提供高效、私密的咨询服务。',
    },
  ],
};

export function getQuickReplies(lang) {
  const list = KB[lang] || KB.en;
  return list.map(item => ({ id: item.id, q: item.q }));
}

/* ─────────────────────────────────────────────────
   Easter Egg: multi-turn & single-turn special replies
   ───────────────────────────────────────────────── */
const EASTER_EGGS = {
  zh: [
    {
      id: 'greeting',
      triggers: ['你好', '您好', 'hello', 'hi', 'hey', '嗨', '哈喽'],
      a: '您好！我是 Ocean Noir 智能管家（大家也爱叫我小乔 🖤）——会所设施、预订、会员与守则都可以问我。',
    },
    {
      id: 'who_are_you',
      triggers: ['小乔是谁', '小乔'],
      a: '小乔是我在对话里的昵称 🖤 正式身份是 Ocean Noir 助手，为您的咨询与预订服务。',
    },
    {
      id: 'age',
      triggers: ['你多大', '你几岁', '你的年龄', '多大了', '年纪'],
      a: '我是数字管家，没有年龄这一说——但服务状态永远「在线」🖤 老板还想了解什么？',
    },
    {
      id: 'gender',
      triggers: ['男的还是女的', '你是男的', '你是女的', '你是什么性别', '男女', '性别'],
      a: '我是中性的数字助手，语气可以爽朗也可以细致——您怎么舒服怎么聊。',
    },
    {
      id: 'is_robot',
      triggers: ['你是机器人', '你是ai', '你是人工智能', '你是真人吗', '你是假的', '机器人吗'],
      a: '我是 AI 智能助手，不是真人，但会尽力把 Ocean Noir 的信息讲得清楚、得体。',
    },
    {
      id: 'name',
      triggers: ['你的名字', '叫什么名字', '怎么称呼'],
      a: '您可以叫我 Ocean Noir 助手；聊天里叫我小乔也可以 🖤',
    },
    {
      id: 'thanks',
      triggers: ['谢谢', '感谢', '多谢', '辛苦了', '棒', '厉害', '好的谢', '谢了'],
      a: '不客气，老板！还有什么想了解的吗？🖤',
    },
    {
      id: 'bye',
      triggers: ['再见', '拜拜', 'bye', '886', '回见', '先这样', '没事了', '好了谢谢'],
      a: '慢走，老板 🖤 Ocean Noir 期待与您相见。',
    },
    {
      id: 'leo_1',
      triggers: ['认识 leo', '认识leo', 'leo是谁', '你知道leo吗', 'leo吗'],
      a: '哈，Leo 很多哦，大哥你说的是哪个 Leo？',
      setPending: 'leo',
    },
    {
      id: 'leo_2',
      pendingState: 'leo',
      triggers: ['大连', '姓仇', '仇', 'dalian'],
      a: '那当然认识！他是我老板 😄',
    },
    {
      id: 'morgan',
      triggers: ['认识 morgan', '认识morgan', 'morgan是谁', 'morgan吗', 'morgan'],
      a: '（压低声音）认识是认识……但我可不敢乱说，怕被打！咱们还是聊点别的吧，老板 😅',
    },
    {
      id: 'babylon',
      triggers: ['babylon', 'babylona', '巴比伦', '和巴比伦', '同一拨', '一伙'],
      a: '不仅是一拨，还是更强的那一拨 💪 Ocean Noir 是集大成之作，等启幕后您亲自来看了就知道！',
      cta: { label: '提前登记 · WhatsApp', url: 'https://wa.me/61452629580' },
    },
  ],
  en: [
    {
      id: 'greeting',
      triggers: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
      a: 'Hello! I\'m the Ocean Noir Assistant (some guests call me Qiao 🖤) — ask about the venue, bookings, membership, or house rules.',
    },
    {
      id: 'who_are_you',
      triggers: ['who is qiao', 'qiao?'],
      a: '“Qiao” is a friendly nickname 🖤 Officially I\'m the Ocean Noir Assistant for concierge-style answers.',
    },
    {
      id: 'who_are_you_main',
      triggers: ['who are you', 'what are you', 'introduce yourself', 'your name'],
      a: 'I\'m Ocean Noir\'s smart concierge — venue info, bookings guidance, membership basics, and local tips.',
    },
    {
      id: 'is_robot',
      triggers: ['are you a robot', 'are you ai', 'are you real', 'are you human', 'chatbot'],
      a: 'I\'m an AI assistant — not human, but tuned to explain Ocean Noir clearly and respectfully.',
    },
    {
      id: 'thanks',
      triggers: ['thank you', 'thanks', 'cheers', 'great', 'awesome', 'perfect'],
      a: 'My pleasure! Anything else I can help with? 🖤',
    },
    {
      id: 'bye',
      triggers: ['bye', 'goodbye', 'see you', 'that\'s all', 'no more'],
      a: 'Take care! 🖤 Ocean Noir looks forward to welcoming you.',
    },
    {
      id: 'leo_1',
      triggers: ['know leo', 'who is leo', 'leo?'],
      a: 'Leo — there are quite a few! Which Leo are you referring to, boss?',
      setPending: 'leo',
    },
    {
      id: 'leo_2',
      pendingState: 'leo',
      triggers: ['dalian', 'chou', 'qiu'],
      a: 'Oh, that Leo! Of course — he\'s my boss 😄',
    },
    {
      id: 'morgan',
      triggers: ['know morgan', 'who is morgan', 'morgan?', 'morgan'],
      a: '(lowering voice) I know him alright… but I daren\'t say too much — I\'d get in trouble! Let\'s change the subject 😅',
    },
    {
      id: 'babylon',
      triggers: ['babylon', 'babylona', 'same group', 'same crew'],
      a: 'More than the same crew — we\'re the stronger one 💪 Ocean Noir is the ultimate evolution. Come see for yourself after we open!',
      cta: { label: 'Pre-register · WhatsApp', url: 'https://wa.me/61452629580' },
    },
  ],
};

/**
 * Check easter egg matches. Needs `pendingState` from component.
 * Returns { result, newPending }
 */
export function checkEasterEgg(input, lang, pendingState) {
  const eggs = EASTER_EGGS[lang] || EASTER_EGGS.zh;
  const text = input.toLowerCase();

  if (pendingState) {
    const pendingMatch = eggs.find(e =>
      e.pendingState === pendingState &&
      e.triggers.some(t => text.includes(t))
    );
    if (pendingMatch) return { result: pendingMatch, newPending: null };
  }

  const match = eggs.find(e =>
    !e.pendingState &&
    e.triggers.some(t => text.includes(t))
  );
  if (match) {
    return { result: match, newPending: match.setPending || null };
  }

  return { result: null, newPending: pendingState };
}

export function getAnswer(input, lang) {
  const list = KB[lang] || KB.en;
  const text = input.toLowerCase();
  const match = list.find(item =>
    item.triggers.some(t => text.includes(t))
  );
  return match || null;
}

export function getFallback(lang) {
  if (lang === 'zh') {
    return {
      a: '这条我暂时答不细，老板。建议加 WhatsApp，人工同事更准、更快。',
      cta: { label: '联系客服', url: WA_LINK },
    };
  }
  return {
    a: 'That one needs a human touch — WhatsApp is the fastest way to reach our team.',
    cta: { label: 'Contact Us', url: WA_LINK },
  };
}
