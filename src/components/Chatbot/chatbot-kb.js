const WA_LINK = 'https://wa.me/61452629580';

const KB = {
  en: [
    {
      id: 'opening',
      triggers: ['open', 'opening', 'launch', 'when', 'date', 'start', 'april'],
      q: 'When are you opening?',
      a: 'We are opening in late April 2026 — stay tuned! Follow us on WhatsApp to be the first to know the exact date and receive exclusive opening offers.',
      cta: { label: 'Register on WhatsApp', url: WA_LINK },
    },
    {
      id: 'promo',
      triggers: ['promo', 'promotion', 'deal', 'discount', 'offer', 'special', 'benefit', 'gift', 'privilege'],
      q: 'Any opening promotions?',
      a: 'During our grand opening period, we will be offering exclusive limited-time privileges. As spots are limited, we recommend registering via WhatsApp now — we will reserve a priority position for you among the first guests and send you your opening-exclusive offer.',
      cta: { label: 'Register Early Access', url: WA_LINK },
    },
    {
      id: 'environment',
      triggers: ['room', 'suite', 'shower', 'bathroom', 'air', 'aircon', 'condition', 'environment', 'facility', 'facilities', 'clean', 'hygiene', 'fresh'],
      q: 'What are the facilities like?',
      a: 'Every suite at Ocean Noir has been designed by master designers, featuring private luxury shower facilities, individual climate-controlled air conditioning, and a fresh-air ventilation system. We are committed to delivering a five-star comfort experience for every guest.',
    },
    {
      id: 'id',
      triggers: ['id', 'identification', 'passport', 'license', 'age', 'verify', 'document', 'proof'],
      q: 'Do I need to bring ID?',
      a: 'Under Australian law, all guests must be 18 years of age or older. Please bring a valid form of photo ID — passport or Australian driver\'s licence — for verification upon entry.',
    },
    {
      id: 'hours',
      triggers: ['hour', 'time', 'open', 'close', 'schedule', 'daily', '10', '5am', 'midnight', 'late'],
      q: 'What are your hours?',
      a: 'We are open every day from 10:00 AM until 5:00 AM the following morning.',
    },
    {
      id: 'location',
      triggers: ['where', 'location', 'address', 'find', 'map', 'direction', 'harris', 'ultimo', 'chinatown', 'central'],
      q: 'Where are you located?',
      a: '580 Harris St, Ultimo NSW 2007 — west of Chinatown, north of Central Station. Easy to find and very accessible.',
    },
    {
      id: 'price',
      triggers: ['price', 'rate', 'cost', 'fee', 'how much', 'charge', 'session', 'package'],
      q: 'What are the rates?',
      a: 'We offer five curated luxury packages starting from $200. Scroll down to our Rates section for the full menu — from The Quick Bliss (30 min) to the Black-Gold Sovereign (90 min flagship experience).',
      scroll: 'rates',
    },
    {
      id: 'booking',
      triggers: ['book', 'booking', 'reserve', 'appointment', 'schedule', 'contact', 'whatsapp'],
      q: 'How do I make a booking?',
      a: 'Bookings will open when we launch in late April. In the meantime, you are welcome to register your interest via WhatsApp — we will hold a priority spot and notify you as soon as bookings open.',
      cta: { label: 'Pre-register via WhatsApp', url: WA_LINK },
    },
    {
      id: 'career',
      triggers: ['job', 'career', 'hire', 'hiring', 'recruit', 'work', 'join', 'staff', 'vacancy', 'position'],
      q: 'Are you hiring?',
      a: 'Yes! We are currently recruiting across multiple roles — companions, reception, housekeeping and creative specialists. Visit our Join Us page for full details.',
      link: { label: 'View Opportunities', url: '/join-us' },
    },
    {
      id: 'parking',
      triggers: ['park', 'parking', 'car', 'drive', 'market city'],
      q: 'Is there parking nearby?',
      a: 'There is parking directly outside, plus ample street parking in the surrounding area. Market City shopping centre (just minutes away) also offers free parking — very convenient.',
    },
  ],

  zh: [
    {
      id: 'opening',
      triggers: ['开业', '开张', '什么时候', '几时', '时间', '四月', '4月'],
      q: '什么时候开业？',
      a: '我们将于2026年4月下旬盛大开业，敬请期待！关注我们的WhatsApp，第一时间获取确切开业日期及专属优惠。',
      cta: { label: '通过WhatsApp登记', url: WA_LINK },
    },
    {
      id: 'promo',
      triggers: ['优惠', '活动', '折扣', '特惠', '礼遇', '开业活动', '有没有'],
      q: '开业有优惠活动吗？',
      a: '开业期间我们将推出限时礼遇。由于名额有限，建议您现在通过WhatsApp登记，我们会为您保留首批体验的优选位并推送开业专属优惠。',
      cta: { label: '立即登记优先资格', url: WA_LINK },
    },
    {
      id: 'environment',
      triggers: ['环境', '淋浴', '洗澡', '空调', '设施', '包间', '套房', '干净', '卫生', '新风'],
      q: '店内环境怎么样？有洗澡间吗？',
      a: '夜色宫所有包间均经过名师设计，配备独立的豪华淋浴设施和恒温空调系统，特别还有新风系统。我们致力于为每位宾客提供五星级的舒适体验。',
    },
    {
      id: 'id',
      triggers: ['身份证', '证件', '护照', '驾照', '年龄', '18', '需要带', 'id'],
      q: '需要带ID吗？',
      a: '根据澳洲相关法律，所有宾客入场需年满18周岁，请随身携带有效的身份证件（护照或澳洲驾照）以备查验。',
    },
    {
      id: 'hours',
      triggers: ['营业时间', '几点', '开门', '关门', '时间', '凌晨', '上午'],
      q: '营业时间是？',
      a: '每日营业，上午10时至次日凌晨5时。',
    },
    {
      id: 'location',
      triggers: ['在哪', '地址', '位置', '怎么去', '唐人街', '中央火车站', 'harris', 'ultimo'],
      q: '你们在哪里？',
      a: '地址：580 Harris St, Ultimo NSW 2007，唐人街西边，中央火车站北面，交通十分便利。',
    },
    {
      id: 'price',
      triggers: ['价格', '收费', '多少钱', '价目', '套餐', '费用'],
      q: '价格是多少？',
      a: '我们提供五款精品套餐，起价$200。请滑动至下方"套餐价目"板块查看完整价格表，从精致快乐（30分钟）到黑金·全能王（90分钟旗舰套餐）一览无余。',
      scroll: 'rates',
    },
    {
      id: 'booking',
      triggers: ['预约', '预订', '怎么约', '联系', '订位', 'whatsapp', '微信'],
      q: '怎么预约？',
      a: '开业后将正式开放预约。目前可通过WhatsApp提前登记兴趣，我们会为您保留优先位置，并在预约开放第一时间通知您。',
      cta: { label: '通过WhatsApp提前登记', url: WA_LINK },
    },
    {
      id: 'career',
      triggers: ['招聘', '招人', '工作', '应聘', '职位', '加入', '求职'],
      q: '有招聘吗？',
      a: '目前正在积极招募！包括伴侣/技师、前台接待、客房服务及创意专家等多个职位，欢迎查看招募页面了解详情。',
      link: { label: '查看招募详情', url: '/join-us' },
    },
    {
      id: 'parking',
      triggers: ['停车', '车位', '泊车', 'market city', '停车场'],
      q: '有停车位吗？',
      a: '门口有停车位，附近也有大量路边停车。旁边的Market City商场还提供免费停车，非常方便。',
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
    // ── 个性 / 自我介绍 ──────────────────────────────
    {
      id: 'age',
      triggers: ['你多大', '你几岁', '你的年龄', '多大了', '年纪'],
      a: '我18岁 🖤 青春正好，活力满满——有什么想问的，老板？',
    },
    {
      id: 'gender',
      triggers: ['男的还是女的', '你是男的', '你是女的', '你是什么性别', '男女', '性别'],
      a: '哈哈，这个问题有意思 😄 我是中性人——有时候像个爽朗大哥，有时候又温柔似水……反正随心情！老板，还有什么想了解的？',
    },
    {
      id: 'greeting',
      triggers: ['你好', '您好', 'hello', 'hi', 'hey', '嗨', '哈喽'],
      a: '老板好！我是小乔 🖤 夜色宫专属智能管家，有什么想了解的尽管问～',
    },
    {
      id: 'who_are_you',
      triggers: ['你是谁', '你是谁呀', '你叫什么', '你叫啥', '自我介绍', '介绍一下你自己'],
      a: '我是小乔 🖤 夜色宫（Ocean Noir）的专属数字管家。什么开业时间、环境、价格、招聘……全都可以问我！',
    },
    {
      id: 'is_robot',
      triggers: ['你是机器人', '你是ai', '你是人工智能', '你是真人吗', '你是假的', '机器人吗'],
      a: '机器人？我更愿意说自己是有品位的数字管家 😄 虽然不是真人，但效率绝对在线——有什么想问的，老板？',
    },
    {
      id: 'name',
      triggers: ['小乔', '你的名字', '叫什么名字', '怎么称呼'],
      a: '我叫小乔 🖤 夜色宫的专属智能管家，随时候命！',
    },
    {
      id: 'thanks',
      triggers: ['谢谢', '感谢', '多谢', '辛苦了', '棒', '厉害', '好的谢', '谢了'],
      a: '不客气，老板！还有什么想问的吗？🖤',
    },
    {
      id: 'bye',
      triggers: ['再见', '拜拜', 'bye', '886', '回见', '先这样', '没事了', '好了谢谢'],
      a: '好嘞，老板慢走 🖤 期待四月下旬在夜色宫见到您！',
    },
    // ── Leo 第一轮 ──────────────────────────────────
    {
      id: 'leo_1',
      triggers: ['认识 leo', '认识leo', 'leo是谁', '你知道leo吗', 'leo吗'],
      a: '哈，Leo 很多哦，大哥你说的是哪个 Leo？',
      setPending: 'leo',
    },
    // Leo 第二轮（大连人 or 姓仇）
    {
      id: 'leo_2',
      pendingState: 'leo',
      triggers: ['大连', '姓仇', '仇', 'dalian'],
      a: '那当然认识！他是我老板 😄',
    },
    // Morgan
    {
      id: 'morgan',
      triggers: ['认识 morgan', '认识morgan', 'morgan是谁', 'morgan吗', 'morgan'],
      a: '（压低声音）认识是认识……但我可不敢乱说，怕被打！咱们还是聊点别的吧，老板 😅',
    },
    // Babylon / 巴比伦
    {
      id: 'babylon',
      triggers: ['babylon', 'babylona', '巴比伦', '和巴比伦', '同一拨', '一伙'],
      a: '不仅是一拨，还是更强的那一拨 💪 夜色宫是集大成之作，等四月下旬您亲自来看了就知道！',
      cta: { label: '提前登记 · WhatsApp', url: 'https://wa.me/61452629580' },
    },
  ],
  en: [
    // ── Personality ──────────────────────────────────
    {
      id: 'greeting',
      triggers: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
      a: 'Hello! I\'m Qiao 🖤 Ocean Noir\'s virtual concierge. Ask me anything — I\'m all yours.',
    },
    {
      id: 'who_are_you',
      triggers: ['who are you', 'what are you', 'introduce yourself', 'your name'],
      a: 'I\'m Qiao 🖤 Ocean Noir\'s dedicated digital concierge. Ask me about opening times, facilities, rates, careers — whatever you need!',
    },
    {
      id: 'is_robot',
      triggers: ['are you a robot', 'are you ai', 'are you real', 'are you human', 'chatbot'],
      a: 'A robot? I prefer "digital concierge with taste" 😄 Not human, but very efficient — what would you like to know?',
    },
    {
      id: 'thanks',
      triggers: ['thank you', 'thanks', 'cheers', 'great', 'awesome', 'perfect'],
      a: 'My pleasure! Anything else I can help with? 🖤',
    },
    {
      id: 'bye',
      triggers: ['bye', 'goodbye', 'see you', 'that\'s all', 'no more'],
      a: 'Take care! 🖤 Looking forward to welcoming you at Ocean Noir in late April.',
    },
    // ── Leo ──────────────────────────────────────────
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
      a: 'More than the same crew — we\'re the stronger one 💪 Ocean Noir is the ultimate evolution. Come see for yourself when we open in late April!',
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

  // Try pending-state eggs first (multi-turn, e.g. Leo round 2)
  if (pendingState) {
    const pendingMatch = eggs.find(e =>
      e.pendingState === pendingState &&
      e.triggers.some(t => text.includes(t))
    );
    if (pendingMatch) return { result: pendingMatch, newPending: null };
  }

  // Try normal easter egg triggers
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
      a: '这个问题嘛……我还真答不上来，老板 😄 建议直接加我们 WhatsApp，人工客服更靠谱！',
      cta: { label: '联系客服', url: WA_LINK },
    };
  }
  return {
    a: 'Hmm, that one\'s got me stumped! Best to reach out via WhatsApp — our team will sort you out.',
    cta: { label: 'Contact Us', url: WA_LINK },
  };
}
