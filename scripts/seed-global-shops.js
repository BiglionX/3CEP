// 全球维修店铺数据填充脚本
// 包含中国及海外各国的维修服务商

async function seedGlobalShops() {
  console.log('🌍 开始填充全球维修店铺数据...');
  
  const supabaseUrl = 'https://hrjqzbhqueleszkvnsen.supabase.co';
  const serviceKey = 'your_service_role_key_here';
  
  const headers = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  };

  try {
    // 填充全球维修店铺数据
    await seedInternationalShops(supabaseUrl, headers);
    
    // 验证数据完整性
    await verifyShopData(supabaseUrl, headers);
    
    console.log('\n🎉 全球维修店铺数据填充完成！');
    
  } catch (error) {
    console.error('❌ 数据填充过程中发生错误:', error.message);
    console.error('详细错误:', error);
  }
}

// 生成店铺slug的辅助函数
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 填充国际维修店铺数据
async function seedInternationalShops(supabaseUrl, headers) {
  console.log('\n🏪 填充国际维修店铺数据...');
  
  const internationalShops = [
    // 美国 (United States)
    {
      name: 'iFixit Repair Center (San Francisco)',
      slug: generateSlug('iFixit Repair Center San Francisco'),
      contact_person: 'Michael Roberts',
      phone: '+1-415-555-0123',
      address: '1350 Treat Ave, San Francisco, CA 94110',
      city: 'San Francisco',
      province: 'California',
      country: '美国',
      postal_code: '94110',
      latitude: 37.7749,
      longitude: -122.4194,
      logo_url: 'https://picsum.photos/200/200?random=2000',
      cover_image_url: 'https://picsum.photos/600/300?random=2001',
      business_license: 'US-CA-BIZ-123456',
      services: JSON.stringify(['iPhone Repair', 'Android Repair', 'Mac Repair', 'Tablet Repair', 'Data Recovery']),
      specialties: JSON.stringify(['Official iFixit Partner', 'DIY Repair Kits', 'Online Tutorials', 'Professional Tools']),
      rating: 4.9,
      review_count: 2156,
      service_count: 28,
      certification_level: 5,
      is_verified: true,
      languages: JSON.stringify(['English', 'Spanish'])
    },
    {
      name: 'Best Buy Geek Squad (New York)',
      slug: generateSlug('Best Buy Geek Squad New York'),
      contact_person: 'Sarah Johnson',
      phone: '+1-212-555-0456',
      address: '123 West 34th Street, New York, NY 10001',
      city: 'New York',
      province: 'New York',
      country: '美国',
      postal_code: '10001',
      latitude: 40.7505,
      longitude: -73.9934,
      logo_url: 'https://picsum.photos/200/200?random=2002',
      cover_image_url: 'https://picsum.photos/600/300?random=2003',
      business_license: 'US-NY-BIZ-789012',
      services: JSON.stringify(['Computer Repair', 'Smartphone Repair', 'TV Installation', 'Network Setup', 'Protection Plans']),
      specialties: JSON.stringify(['Nationwide Service', 'Same-Day Repair', 'Mail-In Service', 'Corporate Solutions']),
      rating: 4.6,
      review_count: 3421,
      service_count: 35,
      certification_level: 5,
      is_verified: true,
      languages: JSON.stringify(['English', 'Spanish', 'French'])
    },
    
    // 日本 (Japan)
    {
      name: 'ドコモショップ 渋谷店 (Docomo Shop Shibuya)',
      slug: generateSlug('docomo-shop-shibuya'),
      contact_person: '田中 太郎 (Tanaka Taro)',
      phone: '+81-3-5555-6789',
      address: '東京都渋谷区宇田川町21-1 渋谷ヒカリエ 1F',
      city: '东京',
      province: '关东',
      country: '日本',
      postal_code: '150-0042',
      latitude: 35.6580,
      longitude: 139.7016,
      logo_url: 'https://picsum.photos/200/200?random=2004',
      cover_image_url: 'https://picsum.photos/600/300?random=2005',
      business_license: 'JP-TOK-BIZ-345678',
      services: JSON.stringify(['スマホ修理', 'データ復旧', '画面交換', 'バッテリー交換', '保証対応']),
      specialties: JSON.stringify(['正規代理店', '即日修理', '純正部品', '多言語対応']),
      rating: 4.7,
      review_count: 1876,
      service_count: 22,
      certification_level: 5,
      is_verified: true,
      languages: JSON.stringify(['日语', '英语', '中文'])
    },
    {
      name: 'ビックカメラ パソコンサポート (Bic Camera PC Support)',
      slug: generateSlug('bic-camera-pc-support'),
      contact_person: '佐藤 花子 (Sato Hanako)',
      phone: '+81-570-55-5555',
      address: '大阪府大阪市中央区心斎橋筋1-7-20',
      city: '大阪',
      province: '关西',
      country: '日本',
      postal_code: '542-0086',
      latitude: 34.6739,
      longitude: 135.5013,
      logo_url: 'https://picsum.photos/200/200?random=2006',
      cover_image_url: 'https://picsum.photos/600/300?random=2007',
      business_license: 'JP-OSA-BIZ-901234',
      services: JSON.stringify(['パソコン修理', 'スマートフォン修理', '家電修理', 'データ移行', 'セキュリティ設定']),
      specialties: JSON.stringify(['大型チェーン', '豊富なパーツ', '技術者多数', '安心のアフターサポート']),
      rating: 4.5,
      review_count: 1432,
      service_count: 25,
      certification_level: 4,
      is_verified: true,
      languages: JSON.stringify(['日语', '英语'])
    },
    
    // 韩国 (South Korea)
    {
      name: '올리브영 모바일센터 (OLIVE YOUNG Mobile Center)',
      slug: generateSlug('olive-young-mobile-center'),
      contact_person: '김민수 (Kim Min-soo)',
      phone: '+82-2-5555-7890',
      address: '서울특별시 강남구 테헤란로 123',
      city: '首尔',
      province: '首尔特别市',
      country: '韩国',
      postal_code: '06134',
      latitude: 37.5078,
      longitude: 127.0543,
      logo_url: 'https://picsum.photos/200/200?random=2008',
      cover_image_url: 'https://picsum.photos/600/300?random=2009',
      business_license: 'KR-SEL-BIZ-567890',
      services: JSON.stringify(['스마트폰 수리', '배터리 교체', '화면 교체', '데이터 복구', '보증 서비스']),
      specialties: JSON.stringify(['대형 체인', '정품 부품', '다국어 지원', '빠른 서비스']),
      rating: 4.6,
      review_count: 1245,
      service_count: 20,
      certification_level: 4,
      is_verified: true,
      languages: JSON.stringify(['韩语', '英语', '中文'])
    },
    
    // 英国 (United Kingdom)
    {
      name: 'Carphone Warehouse Repair Centre (London)',
      slug: generateSlug('carphone-warehouse-repair-london'),
      contact_person: 'James Wilson',
      phone: '+44-20-7555-1234',
      address: '123 Oxford Street, London W1D 1AB',
      city: 'London',
      province: 'England',
      country: '英国',
      postal_code: 'W1D 1AB',
      latitude: 51.5156,
      longitude: -0.1424,
      logo_url: 'https://picsum.photos/200/200?random=2010',
      cover_image_url: 'https://picsum.photos/600/300?random=2011',
      business_license: 'UK-LON-BIZ-234567',
      services: JSON.stringify(['Mobile Phone Repair', 'Tablet Repair', 'Accessory Sales', 'Insurance Claims', 'Unlocking Services']),
      specialties: JSON.stringify(['Major Retailer', 'Nationwide Coverage', 'Competitive Pricing', 'Expert Technicians']),
      rating: 4.4,
      review_count: 1678,
      service_count: 18,
      certification_level: 4,
      is_verified: true,
      languages: JSON.stringify(['English', 'French', 'German'])
    },
    
    // 德国 (Germany)
    {
      name: 'MediaMarkt Service Center (Berlin)',
      slug: generateSlug('mediamarkt-service-berlin'),
      contact_person: 'Hans Mueller',
      phone: '+49-30-5555-2345',
      address: 'Alexanderplatz 1, 10178 Berlin',
      city: 'Berlin',
      province: 'Berlin',
      country: '德国',
      postal_code: '10178',
      latitude: 52.5213,
      longitude: 13.4107,
      logo_url: 'https://picsum.photos/200/200?random=2012',
      cover_image_url: 'https://picsum.photos/600/300?random=2013',
      business_license: 'DE-BER-BIZ-345678',
      services: JSON.stringify(['Handyreparatur', 'Computerservice', 'TV-Reparatur', 'Datensicherung', 'Garantieleistungen']),
      specialties: JSON.stringify(['Großhandelskette', 'Originalteile', 'Schneller Service', 'Fachkompetenz']),
      rating: 4.5,
      review_count: 1342,
      service_count: 23,
      certification_level: 4,
      is_verified: true,
      languages: JSON.stringify(['德语', '英语'])
    },
    
    // 法国 (France)
    {
      name: 'Orange Assistance Technique (Paris)',
      slug: generateSlug('orange-assistance-paris'),
      contact_person: 'Marie Dubois',
      phone: '+33-1-5555-3456',
      address: '75 Champs-Élysées, 75008 Paris',
      city: 'Paris',
      province: 'Île-de-France',
      country: '法国',
      postal_code: '75008',
      latitude: 48.8738,
      longitude: 2.3072,
      logo_url: 'https://picsum.photos/200/200?random=2014',
      cover_image_url: 'https://picsum.photos/600/300?random=2015',
      business_license: 'FR-PAR-BIZ-456789',
      services: JSON.stringify(['Réparation Smartphone', 'Service Informatique', 'Installation Box', 'Assistance à Distance', 'Vente Accessoires']),
      specialties: JSON.stringify(['Opérateur Télécom', 'Service Officiel', 'Techniciens Certifiés', 'Support Multilingue']),
      rating: 4.3,
      review_count: 1567,
      service_count: 21,
      certification_level: 5,
      is_verified: true,
      languages: JSON.stringify(['法语', '英语', '阿拉伯语'])
    },
    
    // 加拿大 (Canada)
    {
      name: 'Telus Repair Solutions (Toronto)',
      slug: generateSlug('telus-repair-toronto'),
      contact_person: 'Robert Brown',
      phone: '+1-416-555-4567',
      address: '100 Queen Street West, Toronto, ON M5H 2M2',
      city: 'Toronto',
      province: 'Ontario',
      country: '加拿大',
      postal_code: 'M5H 2M2',
      latitude: 43.6532,
      longitude: -79.3832,
      logo_url: 'https://picsum.photos/200/200?random=2016',
      cover_image_url: 'https://picsum.photos/600/300?random=2017',
      business_license: 'CA-ON-BIZ-567890',
      services: JSON.stringify(['Mobile Repair', 'Home Phone Service', 'Internet Support', 'Device Trade-In', 'Protection Plans']),
      specialties: JSON.stringify(['Telecom Provider', 'Authorized Service', 'Nationwide Network', 'Customer First Approach']),
      rating: 4.5,
      review_count: 1789,
      service_count: 19,
      certification_level: 5,
      is_verified: true,
      languages: JSON.stringify(['English', 'French'])
    },
    
    // 澳大利亚 (Australia)
    {
      name: 'Telstra Repair Centre (Sydney)',
      slug: generateSlug('telstra-repair-sydney'),
      contact_person: 'Emma Davis',
      phone: '+61-2-5555-5678',
      address: '1 Martin Place, Sydney NSW 2000',
      city: 'Sydney',
      province: 'New South Wales',
      country: '澳大利亚',
      postal_code: '2000',
      latitude: -33.8688,
      longitude: 151.2093,
      logo_url: 'https://picsum.photos/200/200?random=2018',
      cover_image_url: 'https://picsum.photos/600/300?random=2019',
      business_license: 'AU-NSW-BIZ-678901',
      services: JSON.stringify(['Phone Repairs', 'Tablet Service', 'Modem Support', 'Device Insurance', 'Accessories']),
      specialties: JSON.stringify(['Leading Telco', 'Expert Technicians', 'Fast Turnaround', 'Quality Guarantee']),
      rating: 4.4,
      review_count: 1456,
      service_count: 17,
      certification_level: 5,
      is_verified: true,
      languages: JSON.stringify(['English'])
    },
    
    // 新加坡 (Singapore)
    {
      name: 'Singtel DeviceCare Centre',
      slug: generateSlug('singtel-devicecare-centre'),
      contact_person: 'Lim Wei Ming',
      phone: '+65-6555-6789',
      address: '1 Scotts Road, #10-04 Shaw Centre, Singapore 228208',
      city: 'Singapore',
      province: 'Central Region',
      country: '新加坡',
      postal_code: '228208',
      latitude: 1.3048,
      longitude: 103.8319,
      logo_url: 'https://picsum.photos/200/200?random=2020',
      cover_image_url: 'https://picsum.photos/600/300?random=2021',
      business_license: 'SG-SIN-BIZ-789012',
      services: JSON.stringify(['Mobile Repair', 'Data Recovery', 'Screen Replacement', 'Battery Service', 'Warranty Claims']),
      specialties: JSON.stringify(['Telecom Leader', 'Certified Repairs', 'Express Service', 'Multilingual Staff']),
      rating: 4.6,
      review_count: 1234,
      service_count: 16,
      certification_level: 5,
      is_verified: true,
      languages: JSON.stringify(['英语', '中文', '马来语', '泰米尔语'])
    },
    
    // 印度 (India)
    {
      name: 'Reliance Digital Service Center (Mumbai)',
      slug: generateSlug('reliance-digital-mumbai'),
      contact_person: 'Rajesh Patel',
      phone: '+91-22-5555-7890',
      address: 'Nariman Point, Mumbai, Maharashtra 400021',
      city: 'Mumbai',
      province: 'Maharashtra',
      country: '印度',
      postal_code: '400021',
      latitude: 18.9220,
      longitude: 72.8347,
      logo_url: 'https://picsum.photos/200/200?random=2022',
      cover_image_url: 'https://picsum.photos/600/300?random=2023',
      business_license: 'IN-MH-BIZ-890123',
      services: JSON.stringify(['Mobile Repair', 'Electronics Service', 'Appliance Repair', 'Upgrade Solutions', 'Customer Support']),
      specialties: JSON.stringify(['Retail Giant', 'Wide Network', 'Skilled Technicians', 'Affordable Rates']),
      rating: 4.2,
      review_count: 2156,
      service_count: 24,
      certification_level: 4,
      is_verified: true,
      languages: JSON.stringify(['英语', '印地语', '马拉地语'])
    },
    
    // 巴西 (Brazil)
    {
      name: 'Magazine Luiza Tech Service (São Paulo)',
      slug: generateSlug('magazine-luiza-tech-sao-paulo'),
      contact_person: 'Carlos Silva',
      phone: '+55-11-5555-8901',
      address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100',
      city: 'São Paulo',
      province: 'São Paulo',
      country: '巴西',
      postal_code: '01310-100',
      latitude: -23.5619,
      longitude: -46.6553,
      logo_url: 'https://picsum.photos/200/200?random=2024',
      cover_image_url: 'https://picsum.photos/600/300?random=2025',
      business_license: 'BR-SP-BIZ-901234',
      services: JSON.stringify(['Reparo de Celular', 'Serviço de Computador', 'Conserto de TV', 'Recuperação de Dados', 'Venda de Peças']),
      specialties: JSON.stringify(['Maior Varejista', 'Peças Originais', 'Atendimento Rápido', 'Suporte Técnico']),
      rating: 4.3,
      review_count: 1876,
      service_count: 22,
      certification_level: 4,
      is_verified: true,
      languages: JSON.stringify(['葡萄牙语', '英语'])
    },
    
    // 俄罗斯 (Russia)
    {
      name: 'М.Видео Сервисный Центр (Moscow)',
      slug: generateSlug('m-video-service-moscow'),
      contact_person: 'Иван Петров (Ivan Petrov)',
      phone: '+7-495-555-5678',
      address: 'Тверская улица, 2, Москва, Россия, 125009',
      city: '莫斯科',
      province: '莫斯科州',
      country: '俄罗斯',
      postal_code: '125009',
      latitude: 55.7558,
      longitude: 37.6176,
      logo_url: 'https://picsum.photos/200/200?random=2026',
      cover_image_url: 'https://picsum.photos/600/300?random=2027',
      business_license: 'RU-MOW-BIZ-012345',
      services: JSON.stringify(['Ремонт смартфонов', 'Компьютерная помощь', 'Восстановление данных', 'Продажа аксессуаров', 'Гарантийное обслуживание']),
      specialties: JSON.stringify(['Крупная сеть', 'Оригинальные запчасти', 'Профессиональные мастера', 'Широкий ассортимент']),
      rating: 4.4,
      review_count: 1645,
      service_count: 20,
      certification_level: 4,
      is_verified: true,
      languages: JSON.stringify(['俄语', '英语'])
    },
    
    // 阿联酋 (UAE)
    {
      name: 'Euronics Mobile Care (Dubai)',
      slug: generateSlug('euronics-mobile-care-dubai'),
      contact_person: 'Ahmed Al Mansouri',
      phone: '+971-4-555-5678',
      address: 'Dubai Mall, Downtown Dubai, Dubai, UAE',
      city: 'Dubai',
      province: 'Dubai',
      country: '阿联酋',
      postal_code: '00000',
      latitude: 25.1972,
      longitude: 55.2790,
      logo_url: 'https://picsum.photos/200/200?random=2028',
      cover_image_url: 'https://picsum.photos/600/300?random=2029',
      business_license: 'AE-DXB-BIZ-123456',
      services: JSON.stringify(['Mobile Repair', 'Electronics Service', 'Data Recovery', 'Accessory Sales', 'Warranty Support']),
      specialties: JSON.stringify(['Premium Retailer', 'Luxury Market Focus', 'High-Quality Service', 'Multinational Expertise']),
      rating: 4.7,
      review_count: 1324,
      service_count: 18,
      certification_level: 5,
      is_verified: true,
      languages: JSON.stringify(['英语', '阿拉伯语', '印地语', '菲律宾语'])
    }
  ];

  let successCount = 0;
  for (const shop of internationalShops) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/repair_shops`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(shop)
      });
      
      if (response.status === 201 || response.status === 409) {
        successCount++;
        console.log(`✅ 已添加: ${shop.name} (${shop.country})`);
      }
    } catch (err) {
      console.log(`❌ 添加失败: ${shop.name}`);
    }
  }
  
  console.log(`\n✅ 国际维修店铺数据填充完成 (${successCount}/${internationalShops.length} 家)`);
  console.log('🌍 覆盖国家和地区:');
  const countries = [...new Set(internationalShops.map(shop => shop.country))];
  countries.forEach(country => console.log(`  - ${country}`));
}

// 验证店铺数据完整性
async function verifyShopData(supabaseUrl, headers) {
  console.log('\n🔍 验证维修店铺数据完整性...');
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/repair_shops?select=*,country&order=country`, {
      headers: headers
    });
    
    if (response.ok) {
      const shops = await response.json();
      console.log(`📊 总店铺数量: ${shops.length} 家`);
      
      // 按国家统计
      const countryStats = {};
      shops.forEach(shop => {
        const country = shop.country || '未知';
        countryStats[country] = (countryStats[country] || 0) + 1;
      });
      
      console.log('\n🌍 各国店铺分布:');
      Object.entries(countryStats)
        .sort(([,a], [,b]) => b - a)
        .forEach(([country, count]) => {
          console.log(`  ${country}: ${count} 家`);
        });
      
      // 显示认证等级统计
      const certStats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      shops.forEach(shop => {
        const level = shop.certification_level || 1;
        certStats[level]++;
      });
      
      console.log('\n🏅 认证等级分布:');
      Object.entries(certStats)
        .filter(([,count]) => count > 0)
        .forEach(([level, count]) => {
          const stars = '★'.repeat(parseInt(level)) + '☆'.repeat(5 - parseInt(level));
          console.log(`  ${stars} (${level}级): ${count} 家`);
        });
        
      // 平均评分
      const avgRating = shops.reduce((sum, shop) => sum + (shop.rating || 0), 0) / shops.length;
      console.log(`\n⭐ 平均评分: ${avgRating.toFixed(1)}/5.0`);
      
    } else {
      console.log('❌ 无法获取店铺数据');
    }
  } catch (err) {
    console.log('❌ 验证过程中发生错误');
  }
}

// 执行脚本
if (require.main === module) {
  seedGlobalShops();
}

module.exports = { seedGlobalShops };
