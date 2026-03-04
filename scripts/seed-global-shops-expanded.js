// 扩展版全球维修店铺数据填充脚本
// 按照要求覆盖欧洲每个国家、美洲每个国家、亚洲主要国家

async function seedExpandedGlobalShops() {
  console.log('🌍 开始填充扩展版全球维修店铺数据...');

  const supabaseUrl = 'https://hrjqzbhqueleszkvnsen.supabase.co';
  const serviceKey = 'your_service_role_key_here';

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  };

  try {
    // 填充扩展版国际维修店铺数据
    await seedExpandedInternationalShops(supabaseUrl, headers);

    // 验证数据完整性
    await verifyExpandedShopData(supabaseUrl, headers);

    console.log('\n🎉 扩展版全球维修店铺数据填充完成！');
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

// 填充扩展版国际维修店铺数据
async function seedExpandedInternationalShops(supabaseUrl, headers) {
  console.log('\n🏪 填充扩展版国际维修店铺数据...');

  const expandedShops = [
    // ==================== 欧洲 ====================

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
      logo_url: 'https://picsum.photos/200/200?random=3000',
      cover_image_url: 'https://picsum.photos/600/300?random=3001',
      business_license: 'UK-LON-BIZ-234567',
      services: JSON.stringify([
        'Mobile Phone Repair',
        'Tablet Repair',
        'Accessory Sales',
        'Insurance Claims',
        'Unlocking Services',
      ]),
      specialties: JSON.stringify([
        'Major Retailer',
        'Nationwide Coverage',
        'Competitive Pricing',
        'Expert Technicians',
      ]),
      languages: JSON.stringify(['English', 'French', 'German']),
      rating: 4.4,
      review_count: 1678,
      service_count: 18,
      certification_level: 4,
      is_verified: true,
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
      logo_url: 'https://picsum.photos/200/200?random=3002',
      cover_image_url: 'https://picsum.photos/600/300?random=3003',
      business_license: 'DE-BER-BIZ-345678',
      services: JSON.stringify([
        'Handyreparatur',
        'Computerservice',
        'TV-Reparatur',
        'Datensicherung',
        'Garantieleistungen',
      ]),
      specialties: JSON.stringify([
        'Großhandelskette',
        'Originalteile',
        'Schneller Service',
        'Fachkompetenz',
      ]),
      languages: JSON.stringify(['德语', '英语']),
      rating: 4.5,
      review_count: 1342,
      service_count: 23,
      certification_level: 4,
      is_verified: true,
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
      logo_url: 'https://picsum.photos/200/200?random=3004',
      cover_image_url: 'https://picsum.photos/600/300?random=3005',
      business_license: 'FR-PAR-BIZ-456789',
      services: JSON.stringify([
        'Réparation Smartphone',
        'Service Informatique',
        'Installation Box',
        'Assistance à Distance',
        'Vente Accessoires',
      ]),
      specialties: JSON.stringify([
        'Opérateur Télécom',
        'Service Officiel',
        'Techniciens Certifiés',
        'Support Multilingue',
      ]),
      languages: JSON.stringify(['法语', '英语', '阿拉伯语']),
      rating: 4.3,
      review_count: 1567,
      service_count: 21,
      certification_level: 5,
      is_verified: true,
    },

    // 意大利 (Italy)
    {
      name: 'Unieuro Service Center (Milano)',
      slug: generateSlug('unieuro-service-milano'),
      contact_person: 'Marco Rossi',
      phone: '+39-02-5555-4567',
      address: 'Via Torino 45, 20121 Milano MI',
      city: 'Milan',
      province: 'Lombardy',
      country: '意大利',
      postal_code: '20121',
      latitude: 45.4642,
      longitude: 9.19,
      logo_url: 'https://picsum.photos/200/200?random=3006',
      cover_image_url: 'https://picsum.photos/600/300?random=3007',
      business_license: 'IT-MI-BIZ-567890',
      services: JSON.stringify([
        'Riparazione Smartphone',
        'Assistenza Computer',
        'Servizio TV',
        'Recupero Dati',
        'Garanzia',
      ]),
      specialties: JSON.stringify([
        'Grande Distribuzione',
        'Componenti Originali',
        'Servizio Rapido',
        'Esperti Tecnici',
      ]),
      languages: JSON.stringify(['意大利语', '英语']),
      rating: 4.2,
      review_count: 1123,
      service_count: 19,
      certification_level: 4,
      is_verified: true,
    },

    // 西班牙 (Spain)
    {
      name: 'El Corte Inglés Tecno Service (Madrid)',
      slug: generateSlug('el-corte-ingles-tecno-madrid'),
      contact_person: 'Carlos García',
      phone: '+34-91-555-5678',
      address: 'Preciados 3, 28013 Madrid',
      city: 'Madrid',
      province: 'Madrid',
      country: '西班牙',
      postal_code: '28013',
      latitude: 40.4165,
      longitude: -3.7026,
      logo_url: 'https://picsum.photos/200/200?random=3008',
      cover_image_url: 'https://picsum.photos/600/300?random=3009',
      business_license: 'ES-MD-BIZ-678901',
      services: JSON.stringify([
        'Reparación Móvil',
        'Servicio Informático',
        'Reparación Electrodomésticos',
        'Recuperación Datos',
        'Venta Accesorios',
      ]),
      specialties: JSON.stringify([
        'Gran Almacén',
        'Piezas Originales',
        'Servicio Integral',
        'Técnicos Cualificados',
      ]),
      languages: JSON.stringify(['西班牙语', '英语']),
      rating: 4.3,
      review_count: 1456,
      service_count: 20,
      certification_level: 4,
      is_verified: true,
    },

    // 荷兰 (Netherlands)
    {
      name: 'Vanden Borre Service Center (Amsterdam)',
      slug: generateSlug('vanden-borre-amsterdam'),
      contact_person: 'Pieter Jansen',
      phone: '+31-20-555-6789',
      address: 'Kalverstraat 1, 1012 PH Amsterdam',
      city: 'Amsterdam',
      province: 'North Holland',
      country: '荷兰',
      postal_code: '1012 PH',
      latitude: 52.3702,
      longitude: 4.8952,
      logo_url: 'https://picsum.photos/200/200?random=3010',
      cover_image_url: 'https://picsum.photos/600/300?random=3011',
      business_license: 'NL-NH-BIZ-789012',
      services: JSON.stringify([
        'Mobiel Reparatie',
        'Computer Service',
        'TV Reparatie',
        'Data Herstel',
        'Garantie Service',
      ]),
      specialties: JSON.stringify([
        'Elektronica Specialist',
        'Originele Onderdelen',
        'Snelle Service',
        'Deskundig Personeel',
      ]),
      languages: JSON.stringify(['荷兰语', '英语', '德语']),
      rating: 4.4,
      review_count: 1234,
      service_count: 18,
      certification_level: 4,
      is_verified: true,
    },

    // 瑞典 (Sweden)
    {
      name: 'Ellos Teknikservice (Stockholm)',
      slug: generateSlug('ellos-teknikservice-stockholm'),
      contact_person: 'Anna Andersson',
      phone: '+46-8-555-56789',
      address: 'Drottninggatan 20, 111 51 Stockholm',
      city: 'Stockholm',
      province: 'Stockholm County',
      country: '瑞典',
      postal_code: '111 51',
      latitude: 59.3293,
      longitude: 18.0686,
      logo_url: 'https://picsum.photos/200/200?random=3012',
      cover_image_url: 'https://picsum.photos/600/300?random=3013',
      business_license: 'SE-ST-BIZ-890123',
      services: JSON.stringify([
        'Mobilreparation',
        'Datorservice',
        'TV-reparation',
        'Dataåterställning',
        'Garantiservice',
      ]),
      specialties: JSON.stringify([
        'Stor Elektronikbutik',
        'Originaldelar',
        'Snabb Service',
        'Kunnig Personal',
      ]),
      languages: JSON.stringify(['瑞典语', '英语']),
      rating: 4.3,
      review_count: 987,
      service_count: 17,
      certification_level: 4,
      is_verified: true,
    },

    // 波兰 (Poland)
    {
      name: 'RTV Euro AGD Service (Warsaw)',
      slug: generateSlug('rtv-euro-agd-warsaw'),
      contact_person: 'Jan Kowalski',
      phone: '+48-22-555-6789',
      address: 'Aleje Jerozolimskie 59, 02-001 Warszawa',
      city: 'Warsaw',
      province: 'Masovian Voivodeship',
      country: '波兰',
      postal_code: '02-001',
      latitude: 52.2297,
      longitude: 21.0122,
      logo_url: 'https://picsum.photos/200/200?random=3014',
      cover_image_url: 'https://picsum.photos/600/300?random=3015',
      business_license: 'PL-MA-BIZ-901234',
      services: JSON.stringify([
        'Naprawa Telefonów',
        'Serwis Komputerowy',
        'Naprawa RTV',
        'Odzyskiwanie Danych',
        'Serwis Gwarancyjny',
      ]),
      specialties: JSON.stringify([
        'Duży Sklep RTV',
        'Oryginalne Części',
        'Szybka Obsługa',
        'Wykwalifikowany Personel',
      ]),
      languages: JSON.stringify(['波兰语', '英语']),
      rating: 4.1,
      review_count: 1345,
      service_count: 19,
      certification_level: 3,
      is_verified: true,
    },

    // 比利时 (Belgium)
    {
      name: 'Colruyt Group Tech Service (Brussels)',
      slug: generateSlug('colruyt-group-brussels'),
      contact_person: 'Jean Dupont',
      phone: '+32-2-555-7890',
      address: 'Avenue Louise 220, 1050 Bruxelles',
      city: 'Brussels',
      province: 'Brussels Capital',
      country: '比利时',
      postal_code: '1050',
      latitude: 50.8466,
      longitude: 4.3528,
      logo_url: 'https://picsum.photos/200/200?random=3016',
      cover_image_url: 'https://picsum.photos/600/300?random=3017',
      business_license: 'BE-BRU-BIZ-012345',
      services: JSON.stringify([
        'Réparation Mobile',
        'Service Informatique',
        'Réparation Électroménager',
        'Récupération Données',
        'Service Garantie',
      ]),
      specialties: JSON.stringify([
        'Grand Distributeur',
        "Pièces d'Origine",
        'Service Rapide',
        'Personnel Qualifié',
      ]),
      languages: JSON.stringify(['法语', '荷兰语', '英语']),
      rating: 4.2,
      review_count: 1123,
      service_count: 18,
      certification_level: 4,
      is_verified: true,
    },

    // 瑞士 (Switzerland)
    {
      name: 'Digitec Service Center (Zurich)',
      slug: generateSlug('digitec-zurich'),
      contact_person: 'Hans Weber',
      phone: '+41-44-555-8901',
      address: 'Hardturmstrasse 201, 8005 Zürich',
      city: 'Zurich',
      province: 'Zurich',
      country: '瑞士',
      postal_code: '8005',
      latitude: 47.3769,
      longitude: 8.5417,
      logo_url: 'https://picsum.photos/200/200?random=3018',
      cover_image_url: 'https://picsum.photos/600/300?random=3019',
      business_license: 'CH-ZH-BIZ-123456',
      services: JSON.stringify([
        'Mobile Reparatur',
        'Computer Service',
        'TV Reparatur',
        'Datenrettung',
        'Garantieservice',
      ]),
      specialties: JSON.stringify([
        'Elektronik Spezialist',
        'Originalteile',
        'Schneller Service',
        'Experten Team',
      ]),
      languages: JSON.stringify(['德语', '法语', '意大利语', '英语']),
      rating: 4.6,
      review_count: 1567,
      service_count: 20,
      certification_level: 5,
      is_verified: true,
    },

    // 奥地利 (Austria)
    {
      name: 'Tesla Service Center (Vienna)',
      slug: generateSlug('tesla-vienna'),
      contact_person: 'Wolfgang Huber',
      phone: '+43-1-555-9012',
      address: 'Mariahilfer Straße 1, 1060 Wien',
      city: 'Vienna',
      province: 'Vienna',
      country: '奥地利',
      postal_code: '1060',
      latitude: 48.2082,
      longitude: 16.3738,
      logo_url: 'https://picsum.photos/200/200?random=3020',
      cover_image_url: 'https://picsum.photos/600/300?random=3021',
      business_license: 'AT-VI-BIZ-234567',
      services: JSON.stringify([
        'Handyreparatur',
        'Computerservice',
        'TV-Reparatur',
        'Datenwiederherstellung',
        'Garantieservice',
      ]),
      specialties: JSON.stringify([
        'Elektronik Fachgeschäft',
        'Originalersatzteile',
        'Schnelle Abwicklung',
        'Kompetentes Team',
      ]),
      languages: JSON.stringify(['德语', '英语']),
      rating: 4.3,
      review_count: 1034,
      service_count: 17,
      certification_level: 4,
      is_verified: true,
    },

    // 丹麦 (Denmark)
    {
      name: 'Proshop Service Center (Copenhagen)',
      slug: generateSlug('proshop-copenhagen'),
      contact_person: 'Lars Nielsen',
      phone: '+45-32-55-5555',
      address: 'Strøget 2, 1160 København K',
      city: 'Copenhagen',
      province: 'Capital Region',
      country: '丹麦',
      postal_code: '1160',
      latitude: 55.6761,
      longitude: 12.5683,
      logo_url: 'https://picsum.photos/200/200?random=3022',
      cover_image_url: 'https://picsum.photos/600/300?random=3023',
      business_license: 'DK-KO-BIZ-345678',
      services: JSON.stringify([
        'Mobilreparation',
        'Computerservice',
        'TV-reparation',
        'Data gendannelse',
        'Garantiservice',
      ]),
      specialties: JSON.stringify([
        'Elektronikhuse',
        'Originale dele',
        'Hurtig service',
        'Fagligt personale',
      ]),
      languages: JSON.stringify(['丹麦语', '英语']),
      rating: 4.2,
      review_count: 876,
      service_count: 16,
      certification_level: 4,
      is_verified: true,
    },

    // 芬兰 (Finland)
    {
      name: 'Verkkokauppa Service (Helsinki)',
      slug: generateSlug('verkkokauppa-helsinki'),
      contact_person: 'Matti Virtanen',
      phone: '+358-9-555-56789',
      address: 'Fredrikinkatu 33, 00100 Helsinki',
      city: 'Helsinki',
      province: 'Uusimaa',
      country: '芬兰',
      postal_code: '00100',
      latitude: 60.1699,
      longitude: 24.9384,
      logo_url: 'https://picsum.photos/200/200?random=3024',
      cover_image_url: 'https://picsum.photos/600/300?random=3025',
      business_license: 'FI-UU-BIZ-456789',
      services: JSON.stringify([
        'Matkapuhelimen korjaus',
        'Tietokonepalvelu',
        'TV-korjaus',
        'Tiedon palautus',
        'Takuupalvelu',
      ]),
      specialties: JSON.stringify([
        'Sähkökauppaketju',
        'Alkuperäiset osat',
        'Nopea palvelu',
        'Asiantunteva henkilökunta',
      ]),
      languages: JSON.stringify(['芬兰语', '瑞典语', '英语']),
      rating: 4.4,
      review_count: 1234,
      service_count: 18,
      certification_level: 4,
      is_verified: true,
    },

    // 挪威 (Norway)
    {
      name: 'Elkjøp Service Center (Oslo)',
      slug: generateSlug('elkjoep-oslo'),
      contact_person: 'Erik Hansen',
      phone: '+47-22-55-5555',
      address: 'Karl Johans gate 1, 0159 Oslo',
      city: 'Oslo',
      province: 'Oslo',
      country: '挪威',
      postal_code: '0159',
      latitude: 59.9139,
      longitude: 10.7522,
      logo_url: 'https://picsum.photos/200/200?random=3026',
      cover_image_url: 'https://picsum.photos/600/300?random=3027',
      business_license: 'NO-OS-BIZ-567890',
      services: JSON.stringify([
        'Mobilreparasjon',
        'Dataservice',
        'TV-reparasjon',
        'Datareduksjon',
        'Garantiservice',
      ]),
      specialties: JSON.stringify([
        'Elektronikkspesialist',
        'Originale deler',
        'Rask service',
        'Kvalifisert personale',
      ]),
      languages: JSON.stringify(['挪威语', '英语']),
      rating: 4.3,
      review_count: 956,
      service_count: 17,
      certification_level: 4,
      is_verified: true,
    },

    // 葡萄牙 (Portugal)
    {
      name: 'Worten Service Center (Lisbon)',
      slug: generateSlug('worten-lisbon'),
      contact_person: 'João Silva',
      phone: '+351-21-555-6789',
      address: 'Rua do Ouro 19, 1100-372 Lisboa',
      city: 'Lisbon',
      province: 'Lisbon',
      country: '葡萄牙',
      postal_code: '1100-372',
      latitude: 38.7078,
      longitude: -9.1366,
      logo_url: 'https://picsum.photos/200/200?random=3028',
      cover_image_url: 'https://picsum.photos/600/300?random=3029',
      business_license: 'PT-LI-BIZ-678901',
      services: JSON.stringify([
        'Reparação de Telemóveis',
        'Serviço Informático',
        'Reparação de TV',
        'Recuperação de Dados',
        'Serviço de Garantia',
      ]),
      specialties: JSON.stringify([
        'Grande Distribuidor',
        'Peças Originais',
        'Serviço Rápido',
        'Pessoal Qualificado',
      ]),
      languages: JSON.stringify(['葡萄牙语', '英语']),
      rating: 4.1,
      review_count: 1045,
      service_count: 16,
      certification_level: 3,
      is_verified: true,
    },

    // 捷克 (Czech Republic)
    {
      name: 'MobilMentor Service (Prague)',
      slug: generateSlug('mobilmentor-prague'),
      contact_person: 'Petr Novák',
      phone: '+420-222-555-7890',
      address: 'Václavské náměstí 28, 110 00 Praha 1',
      city: 'Prague',
      province: 'Prague',
      country: '捷克',
      postal_code: '110 00',
      latitude: 50.0755,
      longitude: 14.4378,
      logo_url: 'https://picsum.photos/200/200?random=3030',
      cover_image_url: 'https://picsum.photos/600/300?random=3031',
      business_license: 'CZ-PR-BIZ-789012',
      services: JSON.stringify([
        'Oprava mobilů',
        'Počítačový servis',
        'Oprava televizí',
        'Obnova dat',
        'Záruční servis',
      ]),
      specialties: JSON.stringify([
        'Specialista na elektroniku',
        'Originální díly',
        'Rychlý servis',
        'Kvalifikovaný tým',
      ]),
      languages: JSON.stringify(['捷克语', '英语']),
      rating: 4.2,
      review_count: 890,
      service_count: 15,
      certification_level: 4,
      is_verified: true,
    },

    // 希腊 (Greece)
    {
      name: 'Plaisio Service Center (Athens)',
      slug: generateSlug('plaisio-athens'),
      contact_person: 'Georgios Papadopoulos',
      phone: '+30-21-555-8901',
      address: 'Panepistimiou 34, 105 64 Athens',
      city: 'Athens',
      province: 'Attica',
      country: '希腊',
      postal_code: '105 64',
      latitude: 37.9838,
      longitude: 23.7275,
      logo_url: 'https://picsum.photos/200/200?random=3032',
      cover_image_url: 'https://picsum.photos/600/300?random=3033',
      business_license: 'GR-AT-BIZ-890123',
      services: JSON.stringify([
        'Επισκευή κινητών',
        'Υπολογιστική υποστήριξη',
        'Επισκευή τηλεοράσεων',
        'Ανάκτηση δεδομένων',
        'Εγγυητική εξυπηρέτηση',
      ]),
      specialties: JSON.stringify([
        'Μεγάλο ηλεκτρονικό κατάστημα',
        'Γνήσια ανταλλακτικά',
        'Γρήγορη εξυπηρέτηση',
        'Εξειδικευμένο προσωπικό',
      ]),
      languages: JSON.stringify(['希腊语', '英语']),
      rating: 4.0,
      review_count: 765,
      service_count: 14,
      certification_level: 3,
      is_verified: true,
    },

    // 匈牙利 (Hungary)
    {
      name: 'Tesco Mobile Service (Budapest)',
      slug: generateSlug('tesco-mobile-budapest'),
      contact_person: 'Gábor Kovács',
      phone: '+36-1-555-9012',
      address: 'Váci utca 1, 1052 Budapest',
      city: 'Budapest',
      province: 'Budapest',
      country: '匈牙利',
      postal_code: '1052',
      latitude: 47.4979,
      longitude: 19.0402,
      logo_url: 'https://picsum.photos/200/200?random=3034',
      cover_image_url: 'https://picsum.photos/600/300?random=3035',
      business_license: 'HU-BU-BIZ-901234',
      services: JSON.stringify([
        'Mobiltelefon javítás',
        'Számítógép szerviz',
        'TV javítás',
        'Adatvisszaállítás',
        'Garanciális szolgáltatás',
      ]),
      specialties: JSON.stringify([
        'Nagy áruházlánc',
        'Eredeti alkatrészek',
        'Gyors kiszolgálás',
        'Szakképzett személyzet',
      ]),
      languages: JSON.stringify(['匈牙利语', '英语']),
      rating: 4.1,
      review_count: 934,
      service_count: 16,
      certification_level: 3,
      is_verified: true,
    },

    // 爱尔兰 (Ireland)
    {
      name: 'Currys PC World Service (Dublin)',
      slug: generateSlug('currys-dublin'),
      contact_person: 'Sean Murphy',
      phone: '+353-1-555-0123',
      address: "O'Connell Street Lower 1, Dublin 1",
      city: 'Dublin',
      province: 'Leinster',
      country: '爱尔兰',
      postal_code: 'D01',
      latitude: 53.3498,
      longitude: -6.2603,
      logo_url: 'https://picsum.photos/200/200?random=3036',
      cover_image_url: 'https://picsum.photos/600/300?random=3037',
      business_license: 'IE-L-BIZ-012345',
      services: JSON.stringify([
        'Mobile Phone Repair',
        'Computer Service',
        'TV Repair',
        'Data Recovery',
        'Warranty Service',
      ]),
      specialties: JSON.stringify([
        'Major Retailer',
        'Genuine Parts',
        'Fast Service',
        'Skilled Staff',
      ]),
      languages: JSON.stringify(['英语', '爱尔兰语']),
      rating: 4.2,
      review_count: 1156,
      service_count: 17,
      certification_level: 4,
      is_verified: true,
    },

    // ==================== 美洲 ====================

    // 美国 (United States) - 已有2家，再添加2家
    {
      name: 'Sprint Repair Center (Los Angeles)',
      slug: generateSlug('sprint-repair-los-angeles'),
      contact_person: 'Jennifer Martinez',
      phone: '+1-213-555-2345',
      address: '777 South Figueroa Street, Los Angeles, CA 90017',
      city: 'Los Angeles',
      province: 'California',
      country: '美国',
      postal_code: '90017',
      latitude: 34.0522,
      longitude: -118.2437,
      logo_url: 'https://picsum.photos/200/200?random=3038',
      cover_image_url: 'https://picsum.photos/600/300?random=3039',
      business_license: 'US-CA-BIZ-234567',
      services: JSON.stringify([
        'Cell Phone Repair',
        'Tablet Service',
        'Network Support',
        'Device Upgrade',
        'Insurance Claims',
      ]),
      specialties: JSON.stringify([
        'Telecom Provider',
        'Authorized Service',
        'Multi-State Network',
        'Technical Experts',
      ]),
      languages: JSON.stringify(['English', 'Spanish']),
      rating: 4.3,
      review_count: 1876,
      service_count: 20,
      certification_level: 5,
      is_verified: true,
    },

    {
      name: 'Verizon Wireless Repair (Chicago)',
      slug: generateSlug('verizon-chicago'),
      contact_person: 'David Thompson',
      phone: '+1-312-555-3456',
      address: '401 North Michigan Avenue, Chicago, IL 60611',
      city: 'Chicago',
      province: 'Illinois',
      country: '美国',
      postal_code: '60611',
      latitude: 41.8819,
      longitude: -87.6278,
      logo_url: 'https://picsum.photos/200/200?random=3040',
      cover_image_url: 'https://picsum.photos/600/300?random=3041',
      business_license: 'US-IL-BIZ-345678',
      services: JSON.stringify([
        'Mobile Repair',
        'Home Phone Service',
        'Internet Support',
        'Device Trade-In',
        'Protection Plans',
      ]),
      specialties: JSON.stringify([
        'Leading Carrier',
        'Nationwide Coverage',
        'Same-Day Service',
        'Customer Satisfaction',
      ]),
      languages: JSON.stringify(['English', 'Spanish', 'Polish']),
      rating: 4.4,
      review_count: 2034,
      service_count: 22,
      certification_level: 5,
      is_verified: true,
    },

    // 加拿大 (Canada) - 已有1家，再添加1家
    {
      name: 'Bell Mobility Service (Montreal)',
      slug: generateSlug('bell-montreal'),
      contact_person: 'Sophie Tremblay',
      phone: '+1-514-555-4567',
      address: '1155 Metcalfe Street, Montreal, QC H3B 4S7',
      city: 'Montreal',
      province: 'Quebec',
      country: '加拿大',
      postal_code: 'H3B 4S7',
      latitude: 45.5017,
      longitude: -73.5673,
      logo_url: 'https://picsum.photos/200/200?random=3042',
      cover_image_url: 'https://picsum.photos/600/300?random=3043',
      business_license: 'CA-QC-BIZ-456789',
      services: JSON.stringify([
        'Réparation Mobile',
        'Service Internet',
        'Support Technique',
        "Échange d'appareils",
        'Plans de protection',
      ]),
      specialties: JSON.stringify([
        'Grand Opérateur',
        'Service Autorisé',
        'Réseau National',
        'Personnel Bilingue',
      ]),
      languages: JSON.stringify(['英语', '法语']),
      rating: 4.2,
      review_count: 1345,
      service_count: 18,
      certification_level: 5,
      is_verified: true,
    },

    // 墨西哥 (Mexico)
    {
      name: 'Telcel Service Center (Mexico City)',
      slug: generateSlug('telcel-mexico-city'),
      contact_person: 'Carlos Hernández',
      phone: '+52-55-5555-5678',
      address: 'Paseo de la Reforma 123, Ciudad de México, CDMX 06500',
      city: 'Mexico City',
      province: 'Ciudad de México',
      country: '墨西哥',
      postal_code: '06500',
      latitude: 19.4326,
      longitude: -99.1332,
      logo_url: 'https://picsum.photos/200/200?random=3044',
      cover_image_url: 'https://picsum.photos/600/300?random=3045',
      business_license: 'MX-CDMX-BIZ-567890',
      services: JSON.stringify([
        'Reparación de Celulares',
        'Servicio de Internet',
        'Soporte Técnico',
        'Cambio de Equipos',
        'Planes de Protección',
      ]),
      specialties: JSON.stringify([
        'Operadora Líder',
        'Servicio Oficial',
        'Cobertura Nacional',
        'Personal Calificado',
      ]),
      languages: JSON.stringify(['西班牙语', '英语']),
      rating: 4.1,
      review_count: 2156,
      service_count: 19,
      certification_level: 5,
      is_verified: true,
    },

    // 巴西 (Brazil) - 已有1家，再添加1家
    {
      name: 'Casas Bahia Tech Service (Rio de Janeiro)',
      slug: generateSlug('casas-bahia-rio'),
      contact_person: 'Roberto Santos',
      phone: '+55-21-5555-6789',
      address: 'Avenida Presidente Vargas 2000, Rio de Janeiro - RJ, 20071-004',
      city: 'Rio de Janeiro',
      province: 'Rio de Janeiro',
      country: '巴西',
      postal_code: '20071-004',
      latitude: -22.9068,
      longitude: -43.1729,
      logo_url: 'https://picsum.photos/200/200?random=3046',
      cover_image_url: 'https://picsum.photos/600/300?random=3047',
      business_license: 'BR-RJ-BIZ-678901',
      services: JSON.stringify([
        'Reparo de Celular',
        'Serviço de Computador',
        'Conserto de TV',
        'Recuperação de Dados',
        'Venda de Peças',
      ]),
      specialties: JSON.stringify([
        'Grande Varejista',
        'Peças Originais',
        'Atendimento Rápido',
        'Suporte Técnico',
      ]),
      languages: JSON.stringify(['葡萄牙语', '英语']),
      rating: 4.0,
      review_count: 1678,
      service_count: 17,
      certification_level: 4,
      is_verified: true,
    },

    // 阿根廷 (Argentina)
    {
      name: 'Fravega Service Center (Buenos Aires)',
      slug: generateSlug('fravega-buenos-aires'),
      contact_person: 'Diego Fernández',
      phone: '+54-11-5555-7890',
      address: 'Corrientes Avenue 1234, Buenos Aires, CABA C1043',
      city: 'Buenos Aires',
      province: 'Buenos Aires',
      country: '阿根廷',
      postal_code: 'C1043',
      latitude: -34.6037,
      longitude: -58.3816,
      logo_url: 'https://picsum.photos/200/200?random=3048',
      cover_image_url: 'https://picsum.photos/600/300?random=3049',
      business_license: 'AR-BA-BIZ-789012',
      services: JSON.stringify([
        'Reparación de Celulares',
        'Servicio Informático',
        'Reparación de Electrodomésticos',
        'Recuperación de Datos',
        'Venta de Accesorios',
      ]),
      specialties: JSON.stringify([
        'Gran Casa Comercial',
        'Repuestos Originales',
        'Servicio Integral',
        'Técnicos Especializados',
      ]),
      languages: JSON.stringify(['西班牙语', '英语']),
      rating: 4.1,
      review_count: 1456,
      service_count: 18,
      certification_level: 4,
      is_verified: true,
    },

    // 智利 (Chile)
    {
      name: 'Ripley Tech Service (Santiago)',
      slug: generateSlug('ripley-santiago'),
      contact_person: 'Francisco Morales',
      phone: '+56-2-5555-8901',
      address:
        "Avenida Libertador Bernardo O'Higgins 1111, Santiago, Región Metropolitana 8320000",
      city: 'Santiago',
      province: 'Santiago Metropolitan',
      country: '智利',
      postal_code: '8320000',
      latitude: -33.4489,
      longitude: -70.6693,
      logo_url: 'https://picsum.photos/200/200?random=3050',
      cover_image_url: 'https://picsum.photos/600/300?random=3051',
      business_license: 'CL-RM-BIZ-890123',
      services: JSON.stringify([
        'Reparación de Celulares',
        'Servicio Computacional',
        'Reparación de TV',
        'Recuperación de Datos',
        'Venta de Accesorios',
      ]),
      specialties: JSON.stringify([
        'Gran Departamental',
        'Piezas Originales',
        'Servicio Rápido',
        'Personal Experto',
      ]),
      languages: JSON.stringify(['西班牙语', '英语']),
      rating: 4.0,
      review_count: 1234,
      service_count: 16,
      certification_level: 4,
      is_verified: true,
    },

    // 哥伦比亚 (Colombia)
    {
      name: 'Éxito Tech Service (Bogotá)',
      slug: generateSlug('exito-bogota'),
      contact_person: 'Andrés Gómez',
      phone: '+57-1-555-59012',
      address: 'Calle 85 # 12-24, Bogotá, Cundinamarca 110221',
      city: 'Bogotá',
      province: 'Bogotá',
      country: '哥伦比亚',
      postal_code: '110221',
      latitude: 4.711,
      longitude: -74.0721,
      logo_url: 'https://picsum.photos/200/200?random=3052',
      cover_image_url: 'https://picsum.photos/600/300?random=3053',
      business_license: 'CO-BO-BIZ-901234',
      services: JSON.stringify([
        'Reparación de Celulares',
        'Servicio Informático',
        'Reparación de Electrodomésticos',
        'Recuperación de Datos',
        'Venta de Accesorios',
      ]),
      specialties: JSON.stringify([
        'Gran Cadena Comercial',
        'Repuestos Originales',
        'Servicio Integral',
        'Técnicos Calificados',
      ]),
      languages: JSON.stringify(['西班牙语', '英语']),
      rating: 3.9,
      review_count: 1045,
      service_count: 15,
      certification_level: 3,
      is_verified: true,
    },

    // 秘鲁 (Peru)
    {
      name: 'Saga Falabella Service (Lima)',
      slug: generateSlug('saga-falabella-lima'),
      contact_person: 'Luis Ramírez',
      phone: '+51-1-555-50123',
      address: 'Av. Javier Prado Este 4200, Lima 27',
      city: 'Lima',
      province: 'Lima',
      country: '秘鲁',
      postal_code: 'Lima 27',
      latitude: -12.0464,
      longitude: -77.0428,
      logo_url: 'https://picsum.photos/200/200?random=3054',
      cover_image_url: 'https://picsum.photos/600/300?random=3055',
      business_license: 'PE-LI-BIZ-012345',
      services: JSON.stringify([
        'Reparación de Celulares',
        'Servicio Informático',
        'Reparación de Electrodomésticos',
        'Recuperación de Datos',
        'Venta de Accesorios',
      ]),
      specialties: JSON.stringify([
        'Gran Tienda Departamental',
        'Repuestos Originales',
        'Servicio Rápido',
        'Personal Experto',
      ]),
      languages: JSON.stringify(['西班牙语', '英语']),
      rating: 4.0,
      review_count: 956,
      service_count: 14,
      certification_level: 3,
      is_verified: true,
    },

    // ==================== 亚洲 ====================

    // 日本 (Japan) - 已有2家，再添加1家
    {
      name: 'ヨドバシカメラ サービスセンター (Yodobashi Camera Service)',
      slug: generateSlug('yodobashi-camera-service'),
      contact_person: '山田 太郎 (Yamada Taro)',
      phone: '+81-3-5555-1234',
      address: '新宿区西新宿1-1-3 新宿ヨドバシカメラ 1Fサービスカウンター',
      city: '东京',
      province: '关东',
      country: '日本',
      postal_code: '163-0401',
      latitude: 35.6938,
      longitude: 139.7036,
      logo_url: 'https://picsum.photos/200/200?random=3056',
      cover_image_url: 'https://picsum.photos/600/300?random=3057',
      business_license: 'JP-TOK-BIZ-123456',
      services: JSON.stringify([
        'スマホ修理',
        'パソコン修理',
        '家電修理',
        'データ復旧',
        '保証対応',
      ]),
      specialties: JSON.stringify([
        '大型家電量販店',
        '正規代理店',
        '即日修理',
        '純正部品',
      ]),
      languages: JSON.stringify(['日语', '英语', '中文']),
      rating: 4.6,
      review_count: 2345,
      service_count: 25,
      certification_level: 5,
      is_verified: true,
    },

    // 韩国 (South Korea) - 已有1家，再添加1家
    {
      name: '이마트 모바일센터 (E-Mart Mobile Center)',
      slug: generateSlug('e-mart-mobile-center'),
      contact_person: '박지현 (Park Ji-hyun)',
      contact_person: '박지현 (Park Ji-hyun)',
      phone: '+82-32-555-5678',
      address: '인천광역시 남동구 예술의전당로 110 이마트 인천점 1F',
      city: '仁川',
      province: '仁川广域市',
      country: '韩国',
      postal_code: '21529',
      latitude: 37.4563,
      longitude: 126.7052,
      logo_url: 'https://picsum.photos/200/200?random=3058',
      cover_image_url: 'https://picsum.photos/600/300?random=3059',
      business_license: 'KR-ICN-BIZ-234567',
      services: JSON.stringify([
        '스마트폰 수리',
        '컴퓨터 수리',
        '가전제품 수리',
        '데이터 복구',
        '보증 서비스',
      ]),
      specialties: JSON.stringify([
        '대형 마트 체인',
        '정품 부품',
        '다국어 지원',
        '편리한 위치',
      ]),
      languages: JSON.stringify(['韩语', '英语', '中文']),
      rating: 4.3,
      review_count: 1567,
      service_count: 20,
      certification_level: 4,
      is_verified: true,
    },

    // 新加坡 (Singapore) - 已有1家，再添加1家
    {
      name: 'Courts Service Center',
      slug: generateSlug('courts-service-center'),
      contact_person: 'Tan Wei Li',
      phone: '+65-6555-2345',
      address: '200 Victoria Street, #01-01 Bugis Junction, Singapore 188021',
      city: 'Singapore',
      province: 'Central Region',
      country: '新加坡',
      postal_code: '188021',
      latitude: 1.3002,
      longitude: 103.8519,
      logo_url: 'https://picsum.photos/200/200?random=3060',
      cover_image_url: 'https://picsum.photos/600/300?random=3061',
      business_license: 'SG-SIN-BIZ-345678',
      services: JSON.stringify([
        'Mobile Repair',
        'Computer Service',
        'Home Appliance Repair',
        'Data Recovery',
        'Warranty Claims',
      ]),
      specialties: JSON.stringify([
        'Department Store Chain',
        'Genuine Parts',
        'Express Service',
        'Multilingual Staff',
      ]),
      languages: JSON.stringify(['英语', '中文', '马来语', '泰米尔语']),
      rating: 4.4,
      review_count: 1345,
      service_count: 18,
      certification_level: 4,
      is_verified: true,
    },

    // 印度 (India) - 已有1家，再添加2家
    {
      name: 'Croma Tech Service (Delhi)',
      slug: generateSlug('croma-delhi'),
      contact_person: 'Amit Sharma',
      phone: '+91-11-5555-3456',
      address: 'Connaught Place, New Delhi, Delhi 110001',
      city: 'New Delhi',
      province: 'Delhi',
      country: '印度',
      postal_code: '110001',
      latitude: 28.6139,
      longitude: 77.209,
      logo_url: 'https://picsum.photos/200/200?random=3062',
      cover_image_url: 'https://picsum.photos/600/300?random=3063',
      business_license: 'IN-DL-BIZ-456789',
      services: JSON.stringify([
        'Mobile Repair',
        'Electronics Service',
        'Appliance Repair',
        'Data Recovery',
        'Upgrade Solutions',
      ]),
      specialties: JSON.stringify([
        'Retail Giant',
        'Wide Network',
        'Skilled Technicians',
        'Competitive Rates',
      ]),
      languages: JSON.stringify(['英语', '印地语']),
      rating: 4.1,
      review_count: 1876,
      service_count: 22,
      certification_level: 4,
      is_verified: true,
    },

    {
      name: 'Vijay Sales Service (Bangalore)',
      slug: generateSlug('vijay-sales-bangalore'),
      contact_person: 'Ramesh Kumar',
      phone: '+91-80-5555-4567',
      address: 'MG Road, Bangalore, Karnataka 560001',
      city: 'Bangalore',
      province: 'Karnataka',
      country: '印度',
      postal_code: '560001',
      latitude: 12.9716,
      longitude: 77.5946,
      logo_url: 'https://picsum.photos/200/200?random=3064',
      cover_image_url: 'https://picsum.photos/600/300?random=3065',
      business_license: 'IN-KA-BIZ-567890',
      services: JSON.stringify([
        'Mobile Repair',
        'Computer Service',
        'TV Repair',
        'Data Recovery',
        'Accessory Sales',
      ]),
      specialties: JSON.stringify([
        'Established Retailer',
        'Technical Expertise',
        'Customer Centric',
        'Quality Service',
      ]),
      languages: JSON.stringify(['英语', '印地语', '卡纳达语']),
      rating: 4.0,
      review_count: 1654,
      service_count: 20,
      certification_level: 4,
      is_verified: true,
    },

    // 马来西亚 (Malaysia)
    {
      name: 'Senheng Service Center (Kuala Lumpur)',
      slug: generateSlug('senheng-kuala-lumpur'),
      contact_person: 'Lee Wei Ming',
      phone: '+60-3-5555-5678',
      address:
        'Lot G-08, Ground Floor, Mid Valley Megamall, Lingkaran Syed Putra, 59200 Kuala Lumpur',
      city: 'Kuala Lumpur',
      province: 'Federal Territory',
      country: '马来西亚',
      postal_code: '59200',
      latitude: 3.1173,
      longitude: 101.6734,
      logo_url: 'https://picsum.photos/200/200?random=3066',
      cover_image_url: 'https://picsum.photos/600/300?random=3067',
      business_license: 'MY-KL-BIZ-678901',
      services: JSON.stringify([
        'Mobile Repair',
        'Computer Service',
        'Home Appliance Repair',
        'Data Recovery',
        'Warranty Service',
      ]),
      specialties: JSON.stringify([
        'Electrical Retailer',
        'Genuine Components',
        'Fast Turnaround',
        'Multilingual Support',
      ]),
      languages: JSON.stringify(['英语', '中文', '马来语', '泰米尔语']),
      rating: 4.2,
      review_count: 1432,
      service_count: 19,
      certification_level: 4,
      is_verified: true,
    },

    // 泰国 (Thailand)
    {
      name: 'JAS Service Center (Bangkok)',
      slug: generateSlug('jas-bangkok'),
      contact_person: 'Somsak Prasert',
      phone: '+66-2-555-56789',
      address: '999 Phetchaburi Road, Huai Khwang, Bangkok 10310',
      city: 'Bangkok',
      province: 'Bangkok',
      country: '泰国',
      postal_code: '10310',
      latitude: 13.7563,
      longitude: 100.5018,
      logo_url: 'https://picsum.photos/200/200?random=3068',
      cover_image_url: 'https://picsum.photos/600/300?random=3069',
      business_license: 'TH-BKK-BIZ-789012',
      services: JSON.stringify([
        'การซ่อมมือถือ',
        'บริการคอมพิวเตอร์',
        'ซ่อมเครื่องใช้ไฟฟ้า',
        'กู้คืนข้อมูล',
        'บริการรับประกัน',
      ]),
      specialties: JSON.stringify([
        'ห้างสรรพสินค้าใหญ่',
        'อะไหล่แท้',
        'บริการรวดเร็ว',
        'บุคลากรผู้เชี่ยวชาญ',
      ]),
      languages: JSON.stringify(['泰语', '英语', '中文']),
      rating: 4.1,
      review_count: 1256,
      service_count: 17,
      certification_level: 4,
      is_verified: true,
    },

    // 菲律宾 (Philippines)
    {
      name: 'SM Appliance Center (Manila)',
      slug: generateSlug('sm-appliance-manila'),
      contact_person: 'Maria Santos',
      phone: '+63-2-555-57890',
      address: 'Seaside Drive, Mall of Asia Complex, Pasay, Metro Manila 1300',
      city: 'Manila',
      province: 'Metro Manila',
      country: '菲律宾',
      postal_code: '1300',
      latitude: 14.5333,
      longitude: 120.9794,
      logo_url: 'https://picsum.photos/200/200?random=3070',
      cover_image_url: 'https://picsum.photos/600/300?random=3071',
      business_license: 'PH-MM-BIZ-890123',
      services: JSON.stringify([
        'Mobile Repair',
        'Computer Service',
        'Appliance Repair',
        'Data Recovery',
        'Accessory Sales',
      ]),
      specialties: JSON.stringify([
        'Shopping Mall Chain',
        'Genuine Parts',
        'Professional Service',
        'Customer Focused',
      ]),
      languages: JSON.stringify(['英语', '菲律宾语', '中文']),
      rating: 4.0,
      review_count: 1345,
      service_count: 18,
      certification_level: 3,
      is_verified: true,
    },

    // 印度尼西亚 (Indonesia)
    {
      name: 'Electronic Solution Service (Jakarta)',
      slug: generateSlug('electronic-solution-jakarta'),
      contact_person: 'Budi Santoso',
      phone: '+62-21-555-58901',
      address: 'Jalan Jenderal Sudirman Kav. 52-53, Jakarta 12190',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      country: '印度尼西亚',
      postal_code: '12190',
      latitude: -6.2088,
      longitude: 106.8456,
      logo_url: 'https://picsum.photos/200/200?random=3072',
      cover_image_url: 'https://picsum.photos/600/300?random=3073',
      business_license: 'ID-JK-BIZ-901234',
      services: JSON.stringify([
        'Perbaikan HP',
        'Layanan Komputer',
        'Perbaikan Elektronik',
        'Pemulihan Data',
        'Penjualan Aksesori',
      ]),
      specialties: JSON.stringify([
        'Toko Elektronik Besar',
        'Suku Cadang Asli',
        'Layanan Cepat',
        'Tenaga Ahli',
      ]),
      languages: JSON.stringify(['印尼语', '英语']),
      rating: 3.9,
      review_count: 1123,
      service_count: 16,
      certification_level: 3,
      is_verified: true,
    },

    // 越南 (Vietnam)
    {
      name: 'Điện Máy Xanh Service (Ho Chi Minh City)',
      slug: generateSlug('dien-may-xanh-hcmc'),
      contact_person: 'Nguyen Van Hai',
      phone: '+84-28-5555-9012',
      address:
        '2B Phan Đình Phùng, Phường Nguyễn Chí Thanh, Quận Phú Nhuận, TP. Hồ Chí Minh',
      city: 'Ho Chi Minh City',
      province: 'Ho Chi Minh City',
      country: '越南',
      postal_code: '700000',
      latitude: 10.7626,
      longitude: 106.6602,
      logo_url: 'https://picsum.photos/200/200?random=3074',
      cover_image_url: 'https://picsum.photos/600/300?random=3075',
      business_license: 'VN-HCM-BIZ-012345',
      services: JSON.stringify([
        'Sửa chữa điện thoại',
        'Dịch vụ máy tính',
        'Sửa chữa thiết bị điện tử',
        'Phục hồi dữ liệu',
        'Bán phụ kiện',
      ]),
      specialties: JSON.stringify([
        'Chuỗi siêu thị điện máy',
        'Linh kiện chính hãng',
        'Dịch vụ nhanh chóng',
        'Nhân viên chuyên nghiệp',
      ]),
      languages: JSON.stringify(['越南语', '英语']),
      rating: 4.0,
      review_count: 1456,
      service_count: 17,
      certification_level: 4,
      is_verified: true,
    },

    // 以色列 (Israel)
    {
      name: 'KSP Computers & Mobile (Tel Aviv)',
      slug: generateSlug('ksp-tel-aviv'),
      contact_person: 'David Cohen',
      phone: '+972-3-555-50123',
      address: 'Dizengoff Street 123, Tel Aviv-Yafo 6343212',
      city: 'Tel Aviv',
      province: 'Tel Aviv District',
      country: '以色列',
      postal_code: '6343212',
      latitude: 32.0853,
      longitude: 34.7818,
      logo_url: 'https://picsum.photos/200/200?random=3076',
      cover_image_url: 'https://picsum.photos/600/300?random=3077',
      business_license: 'IL-TA-BIZ-123456',
      services: JSON.stringify([
        'Mobile Phone Repair',
        'Computer Service',
        'Electronics Repair',
        'Data Recovery',
        'Warranty Service',
      ]),
      specialties: JSON.stringify([
        'Technology Specialists',
        'Genuine Components',
        'Fast Service',
        'Expert Technicians',
      ]),
      languages: JSON.stringify(['希伯来语', '英语', '阿拉伯语']),
      rating: 4.5,
      review_count: 1234,
      service_count: 19,
      certification_level: 5,
      is_verified: true,
    },
  ];

  let successCount = 0;
  for (const shop of expandedShops) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/repair_shops`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(shop),
      });

      if (response.status === 201 || response.status === 409) {
        successCount++;
        console.log(`✅ 已添加: ${shop.name} (${shop.country})`);
      }
    } catch (err) {
      console.log(`❌ 添加失败: ${shop.name}`);
    }
  }

  console.log(
    `\n✅ 扩展版国际维修店铺数据填充完成 (${successCount}/${expandedShops.length} 家)`
  );
  console.log('🌍 覆盖国家和地区:');

  const countryStats = {};
  expandedShops.forEach(shop => {
    const country = shop.country || '未知';
    countryStats[country] = (countryStats[country] || 0) + 1;
  });

  Object.entries(countryStats)
    .sort(([, a], [, b]) => b - a)
    .forEach(([country, count]) => {
      console.log(`  - ${country}: ${count} 家`);
    });
}

// 验证扩展版店铺数据完整性
async function verifyExpandedShopData(supabaseUrl, headers) {
  console.log('\n🔍 验证扩展版维修店铺数据完整性...');

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/repair_shops?select=*,country&order=country`,
      {
        headers: headers,
      }
    );

    if (response.ok) {
      const shops = await response.json();
      console.log(`📊 总店铺数量: ${shops.length} 家`);

      // 按大洲统计
      const continentStats = {
        欧洲: 0,
        美洲: 0,
        亚洲: 0,
        大洋洲: 0,
        非洲: 0,
        中东: 0,
      };

      const countryStats = {};
      shops.forEach(shop => {
        const country = shop.country || '未知';
        countryStats[country] = (countryStats[country] || 0) + 1;

        // 按大洲分类
        if (
          [
            '英国',
            '德国',
            '法国',
            '意大利',
            '西班牙',
            '荷兰',
            '瑞典',
            '波兰',
            '比利时',
            '瑞士',
            '奥地利',
            '丹麦',
            '芬兰',
            '挪威',
            '葡萄牙',
            '捷克',
            '希腊',
            '匈牙利',
            '爱尔兰',
          ].includes(country)
        ) {
          continentStats['欧洲']++;
        } else if (
          [
            '美国',
            '加拿大',
            '墨西哥',
            '巴西',
            '阿根廷',
            '智利',
            '哥伦比亚',
            '秘鲁',
          ].includes(country)
        ) {
          continentStats['美洲']++;
        } else if (
          [
            '日本',
            '韩国',
            '新加坡',
            '印度',
            '马来西亚',
            '泰国',
            '菲律宾',
            '印度尼西亚',
            '越南',
            '以色列',
          ].includes(country)
        ) {
          continentStats['亚洲']++;
        } else if (['澳大利亚'].includes(country)) {
          continentStats['大洋洲']++;
        } else if (['阿联酋'].includes(country)) {
          continentStats['中东']++;
        }
      });

      console.log('\n🌍 各大洲店铺分布:');
      Object.entries(continentStats)
        .filter(([, count]) => count > 0)
        .forEach(([continent, count]) => {
          console.log(`  ${continent}: ${count} 家`);
        });

      console.log('\n🇨🇳 各国店铺分布:');
      Object.entries(countryStats)
        .sort(([, a], [, b]) => b - a)
        .forEach(([country, count]) => {
          console.log(`  ${country}: ${count} 家`);
        });

      // 认证等级统计
      const certStats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      shops.forEach(shop => {
        const level = shop.certification_level || 1;
        certStats[level]++;
      });

      console.log('\n🏅 认证等级分布:');
      Object.entries(certStats)
        .filter(([, count]) => count > 0)
        .forEach(([level, count]) => {
          const stars =
            '★'.repeat(parseInt(level)) + '☆'.repeat(5 - parseInt(level));
          console.log(`  ${stars} (${level}级): ${count} 家`);
        });

      // 平均评分
      const avgRating =
        shops.reduce((sum, shop) => sum + (shop.rating || 0), 0) / shops.length;
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
  seedExpandedGlobalShops();
}

module.exports = { seedExpandedGlobalShops };
