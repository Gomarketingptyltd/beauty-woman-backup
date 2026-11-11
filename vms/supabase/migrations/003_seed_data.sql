-- ============================================================
-- Seed Data: Rooms, Test Technicians, Test Agent
-- ============================================================

-- ============================================================
-- ROOMS: S01-S15 service rooms + waiting + public
-- ============================================================
INSERT INTO rooms (code, room_type, status) VALUES
    ('S01', 'service', 'free'),
    ('S02', 'service', 'free'),
    ('S03', 'service', 'free'),
    ('S04', 'service', 'free'),
    ('S05', 'service', 'free'),
    ('S06', 'service', 'free'),
    ('S07', 'service', 'free'),
    ('S08', 'service', 'free'),
    ('S09', 'service', 'free'),
    ('S10', 'service', 'free'),
    ('S11', 'service', 'free'),
    ('S12', 'service', 'free'),
    ('S13', 'service', 'free'),
    ('S14', 'service', 'free'),
    ('S15', 'service', 'free'),
    ('W01', 'waiting', 'free'),
    ('W02', 'waiting', 'free'),
    ('W03', 'waiting', 'free'),
    ('PUB', 'public', 'free')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- TEST AGENT
-- ============================================================
INSERT INTO agents (name, bio, contact, default_commission) VALUES
    ('星月文化推广', '专业美容健康服务人才推广机构，旗下技师均经过专业培训。', 
     '{"phone": "0400000001", "wechat": "xingyue_hk", "notes": "每周二结算"}',
     2000)
ON CONFLICT DO NOTHING;

-- ============================================================
-- TEST TECHNICIANS (20 technicians, test data)
-- ============================================================
DO $$
DECLARE
    agent_uuid UUID;
BEGIN
    SELECT id INTO agent_uuid FROM agents WHERE name = '星月文化推广' LIMIT 1;

    INSERT INTO technicians (code, name, age, body, cup_size, height, language, type, speciality, starting_price, holder_description, photos, status, agent_id) VALUES
    ('T001', '小雪', 24, '纤细匀称', 'B', '162cm', ARRAY['普通话','英语'], '清纯型', '精油按摩、水床推拿', '$200起', '温柔细腻，让您身心舒缓，是您放松解压的最佳选择。', ARRAY[]::TEXT[], 'off', agent_uuid),
    ('T002', '晓晴', 22, '玲珑有致', 'C', '158cm', ARRAY['普通话','粤语'], '活泼型', '泰式推背、深层组织按摩', '$200起', '阳光开朗，热情专业，给您带来满满活力。', ARRAY[]::TEXT[], 'off', agent_uuid),
    ('T003', '雅婷', 26, '丰满性感', 'D', '165cm', ARRAY['普通话','日语'], '成熟型', '热石SPA、芳疗减压', '$270起', '成熟优雅，经验丰富，擅长全身深层放松。', ARRAY[]::TEXT[], 'off', agent_uuid),
    ('T004', '思颖', 23, '苗条修长', 'B', '168cm', ARRAY['普通话','英语','韩语'], '知性型', '淋巴引流、足底反射', '$200起', '知性温柔，手法专业，让您的疲劳一扫而空。', ARRAY[]::TEXT[], 'off', NULL),
    ('T005', '美琪', 25, '性感迷人', 'C', '160cm', ARRAY['普通话','粤语','英语'], '妩媚型', '水床推拿、精油按摩', '$270起', '妩媚动人，技术精湛，为您带来极致感官享受。', ARRAY[]::TEXT[], 'off', NULL),
    ('T006', '若汐', 21, '清纯可人', 'B', '155cm', ARRAY['普通话','日语'], '清纯型', '精油按摩、芳疗减压', '$200起', '青春靓丽，手法轻柔，是您减压放松的好伙伴。', ARRAY[]::TEXT[], 'off', agent_uuid),
    ('T007', '诗涵', 27, '成熟丰韵', 'D', '163cm', ARRAY['普通话','粤语'], '御姐型', '深层组织按摩、热石SPA', '$270起', '御姐风范，经验丰富，让您体验专业级SPA服务。', ARRAY[]::TEXT[], 'off', NULL),
    ('T008', '语桐', 24, '清秀雅致', 'B', '161cm', ARRAY['普通话','英语'], '文艺型', '泰式推背、淋巴引流', '$200起', '文艺气质，心思细腻，为您量身定制舒压方案。', ARRAY[]::TEXT[], 'off', NULL),
    ('T009', '紫萱', 22, '性感撩人', 'C', '157cm', ARRAY['普通话','粤语','英语'], '妩媚型', '水床推拿、精油按摩', '$270起', '性感迷人，手法独特，让您沉浸在极致享受之中。', ARRAY[]::TEXT[], 'off', agent_uuid),
    ('T010', '心怡', 28, '温柔贤淑', 'C', '162cm', ARRAY['普通话','日语','英语'], '温婉型', '足底反射、芳疗减压', '$200起', '温柔如水，专注每一个细节，给您最贴心的服务。', ARRAY[]::TEXT[], 'off', NULL),
    ('T011', '淑贤', 25, '健美性感', 'C', '166cm', ARRAY['普通话','粤语'], '健美型', '深层组织按摩、热石SPA', '$270起', '健康活力，力道十足，专业消除肌肉酸痛。', ARRAY[]::TEXT[], 'off', NULL),
    ('T012', '婉儿', 23, '婉约温柔', 'B', '159cm', ARRAY['普通话','英语'], '温婉型', '精油按摩、淋巴引流', '$200起', '婉约气质，温柔体贴，让您感受如沐春风的服务。', ARRAY[]::TEXT[], 'off', agent_uuid),
    ('T013', '欣妍', 26, '优雅大方', 'C', '164cm', ARRAY['普通话','粤语','韩语'], '优雅型', '泰式推背、水床推拿', '$270起', '优雅端庄，技术全面，为您打造专属舒压体验。', ARRAY[]::TEXT[], 'off', NULL),
    ('T014', '悦宁', 24, '娇小玲珑', 'B', '153cm', ARRAY['普通话','日语'], '娇小型', '精油按摩、芳疗减压', '$200起', '娇小可爱，手法灵活，带给您意想不到的享受。', ARRAY[]::TEXT[], 'off', NULL),
    ('T015', '依依', 22, '清纯靓丽', 'B', '160cm', ARRAY['普通话','粤语','英语'], '清纯型', '足底反射、精油按摩', '$200起', '清纯自然，笑容甜美，是您解压放松的不二之选。', ARRAY[]::TEXT[], 'off', agent_uuid),
    ('T016', '佳璇', 29, '成熟魅惑', 'D', '167cm', ARRAY['普通话','英语'], '成熟型', '深层组织按摩、热石SPA', '$320起', '风情万种，经验十足，专为您带来最高级的服务体验。', ARRAY[]::TEXT[], 'off', NULL),
    ('T017', '慕雪', 23, '冰清玉洁', 'B', '161cm', ARRAY['普通话','日语','英语'], '清冷型', '淋巴引流、水床推拿', '$200起', '清冷如雪，内心温柔，用双手为您驱散所有疲惫。', ARRAY[]::TEXT[], 'off', NULL),
    ('T018', '叶澜', 25, '野性妩媚', 'C', '163cm', ARRAY['普通话','粤语'], '野性型', '泰式推背、精油按摩', '$270起', '野性与柔情并存，独特手法令您流连忘返。', ARRAY[]::TEXT[], 'off', agent_uuid),
    ('T019', '凌云', 27, '高挑优雅', 'C', '170cm', ARRAY['普通话','英语','韩语'], '高挑型', '热石SPA、深层组织按摩', '$270起', '高挑身材，气质出众，专业技术让您彻底放松。', ARRAY[]::TEXT[], 'off', NULL),
    ('T020', '锦绣', 24, '婀娜多姿', 'C', '162cm', ARRAY['普通话','粤语','日语'], '多变型', '全套SPA、精油按摩', '$270起', '多才多艺，善解人意，为您定制最适合的舒压方案。', ARRAY[]::TEXT[], 'off', agent_uuid)
    ON CONFLICT (code) DO NOTHING;
END $$;

-- Set up agent commission rules for test agent
DO $$
DECLARE
    agent_uuid UUID;
BEGIN
    SELECT id INTO agent_uuid FROM agents WHERE name = '星月文化推广' LIMIT 1;
    
    IF agent_uuid IS NOT NULL THEN
        INSERT INTO agent_package_commissions (agent_id, package_key, commission_amount) VALUES
            (agent_uuid, 'QUICK_BLISS', 2000),         -- $20
            (agent_uuid, 'STEAM_SANCTUARY', 3000),      -- $30
            (agent_uuid, 'SILK_ROAD_AQUA', 3000),       -- $30
            (agent_uuid, 'DEEP_SPA_RITUAL', 3500),      -- $35
            (agent_uuid, 'BLACK_GOLD_SOVEREIGN', 4000)  -- $40
        ON CONFLICT (agent_id, package_key) DO NOTHING;
    END IF;
END $$;
