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
      a: '抱歉，我暂时无法回答这个问题。请通过WhatsApp直接联系我们，我们会尽快为您解答。',
      cta: { label: '联系客服', url: WA_LINK },
    };
  }
  return {
    a: 'I\'m not sure about that one. Please reach out to us directly via WhatsApp and we\'ll be happy to help.',
    cta: { label: 'Contact Us', url: WA_LINK },
  };
}
