const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── REGIONS ──────────────────────────────────────────────────────
  const national = await prisma.region.upsert({
    where: { code: 'IND' },
    update: {},
    create: { name: 'India', nameHi: 'भारत', code: 'IND', level: 'NATIONAL' }
  })

  const states = [
    { name: 'Maharashtra', nameHi: 'महाराष्ट्र', code: 'MH' },
    { name: 'Delhi', nameHi: 'दिल्ली', code: 'DL' },
    { name: 'Uttar Pradesh', nameHi: 'उत्तर प्रदेश', code: 'UP' },
    { name: 'Gujarat', nameHi: 'गुजरात', code: 'GJ' },
    { name: 'Rajasthan', nameHi: 'राजस्थान', code: 'RJ' },
    { name: 'Karnataka', nameHi: 'कर्नाटक', code: 'KA' },
    { name: 'Tamil Nadu', nameHi: 'तमिल नाडु', code: 'TN' },
    { name: 'West Bengal', nameHi: 'पश्चिम बंगाल', code: 'WB' },
    { name: 'Bihar', nameHi: 'बिहार', code: 'BR' },
    { name: 'Madhya Pradesh', nameHi: 'मध्य प्रदेश', code: 'MP' },
    { name: 'Telangana', nameHi: 'तेलंगाना', code: 'TG' },
    { name: 'Andhra Pradesh', nameHi: 'आंध्र प्रदेश', code: 'AP' },
    { name: 'Kerala', nameHi: 'केरल', code: 'KL' },
    { name: 'Punjab', nameHi: 'पंजाब', code: 'PB' },
    { name: 'Haryana', nameHi: 'हरियाणा', code: 'HR' },
    { name: 'Jharkhand', nameHi: 'झारखंड', code: 'JH' },
    { name: 'Assam', nameHi: 'असम', code: 'AS' },
    { name: 'Odisha', nameHi: 'ओडिशा', code: 'OD' },
    { name: 'Chhattisgarh', nameHi: 'छत्तीसगढ़', code: 'CG' },
    { name: 'Uttarakhand', nameHi: 'उत्तराखंड', code: 'UK' },
    { name: 'Himachal Pradesh', nameHi: 'हिमाचल प्रदेश', code: 'HP' },
    { name: 'Goa', nameHi: 'गोवा', code: 'GA' },
    { name: 'Tripura', nameHi: 'त्रिपुरा', code: 'TR' },
    { name: 'Manipur', nameHi: 'मणिपुर', code: 'MN' },
    { name: 'Meghalaya', nameHi: 'मेघालय', code: 'ML' },
    { name: 'Nagaland', nameHi: 'नागालैंड', code: 'NL' },
    { name: 'Arunachal Pradesh', nameHi: 'अरुणाचल प्रदेश', code: 'AR' },
    { name: 'Sikkim', nameHi: 'सिक्किम', code: 'SK' },
    { name: 'Jammu & Kashmir', nameHi: 'जम्मू और कश्मीर', code: 'JK' },
    { name: 'Ladakh', nameHi: 'लद्दाख', code: 'LA' },
    { name: 'Chandigarh', nameHi: 'चंडीगढ़', code: 'CH' },
    { name: 'Puducherry', nameHi: 'पुडुचेरी', code: 'PY' },
  ]

  for (const state of states) {
    await prisma.region.upsert({
      where: { code: state.code },
      update: {},
      create: { ...state, level: 'STATE', parentId: national.id }
    })
  }
  console.log('✅ Regions seeded — India + 32 states/UTs')

  // ── PARTIES ──────────────────────────────────────────────────────
  const bjp = await prisma.party.upsert({
    where: { id: 'party_bjp' },
    update: {},
    create: {
      id: 'party_bjp',
      name: 'Bharatiya Janata Party',
      shortName: 'BJP',
      colour: '#FF6600',
      website: 'https://www.bjp.org'
    }
  })

  const inc = await prisma.party.upsert({
    where: { id: 'party_inc' },
    update: {},
    create: {
      id: 'party_inc',
      name: 'Indian National Congress',
      shortName: 'INC',
      colour: '#00BFFF',
      website: 'https://www.inc.in'
    }
  })

  const aap = await prisma.party.upsert({
    where: { id: 'party_aap' },
    update: {},
    create: {
      id: 'party_aap',
      name: 'Aam Aadmi Party',
      shortName: 'AAP',
      colour: '#0066CC',
      website: 'https://www.aamaadmiparty.org'
    }
  })

  const tmc = await prisma.party.upsert({
    where: { id: 'party_tmc' },
    update: {},
    create: {
      id: 'party_tmc',
      name: 'All India Trinamool Congress',
      shortName: 'TMC',
      colour: '#00FF00',
      website: 'https://www.aitcofficial.org'
    }
  })

  const sp = await prisma.party.upsert({
    where: { id: 'party_sp' },
    update: {},
    create: {
      id: 'party_sp',
      name: 'Samajwadi Party',
      shortName: 'SP',
      colour: '#FF0000',
      website: 'https://www.samajwadiparty.in'
    }
  })

  const dmk = await prisma.party.upsert({
    where: { id: 'party_dmk' },
    update: {},
    create: {
      id: 'party_dmk',
      name: 'Dravida Munnetra Kazhagam',
      shortName: 'DMK',
      colour: '#CC0000',
      website: 'https://www.dmk.in'
    }
  })

  console.log('✅ Parties seeded — BJP, INC, AAP, TMC, SP, DMK')

  // ── GOVERNMENTS ──────────────────────────────────────────────────
  const modGovt = await prisma.government.upsert({
    where: { id: 'govt_modi3' },
    update: {},
    create: {
      id: 'govt_modi3',
      name: 'Modi 3.0',
      partyId: bjp.id,
      regionId: national.id,
      termStart: new Date('2024-06-09'),
      isActive: true
    }
  })

  const delhiRegion = await prisma.region.findUnique({ where: { code: 'DL' } })
  const mahaRegion = await prisma.region.findUnique({ where: { code: 'MH' } })
  const upRegion = await prisma.region.findUnique({ where: { code: 'UP' } })
  const tnRegion = await prisma.region.findUnique({ where: { code: 'TN' } })
  const wbRegion = await prisma.region.findUnique({ where: { code: 'WB' } })

  await prisma.government.upsert({
    where: { id: 'govt_aap_delhi' },
    update: {},
    create: {
      id: 'govt_aap_delhi',
      name: 'AAP Delhi Government',
      partyId: aap.id,
      regionId: delhiRegion.id,
      termStart: new Date('2020-02-16'),
      termEnd: new Date('2025-02-20'),
      isActive: false
    }
  })

await prisma.government.upsert({
  where: { id: 'govt_bjp_mh_2024' },   // unique ID
  update: {},
  create: {
    id: 'govt_bjp_mh_2024',
    name: 'Mahayuti Government Maharashtra 2024',
    partyId: 'party_bjp',                 // party ID from Step 2
    regionId: mahaRegion.id,               // region ID
    termStart: new Date('2024-11-23'),     // when they took power
    termEnd: null,                         // null = still in power
    isActive: true
  }
})


  await prisma.government.upsert({
    where: { id: 'govt_bjp_up' },
    update: {},
    create: {
      id: 'govt_bjp_up',
      name: 'Yogi 2.0 UP Government',
      partyId: bjp.id,
      regionId: upRegion.id,
      termStart: new Date('2022-03-25'),
      isActive: true
    }
  })

  await prisma.government.upsert({
    where: { id: 'govt_dmk_tn' },
    update: {},
    create: {
      id: 'govt_dmk_tn',
      name: 'DMK Tamil Nadu Government',
      partyId: dmk.id,
      regionId: tnRegion.id,
      termStart: new Date('2021-05-07'),
      isActive: true
    }
  })

  await prisma.government.upsert({
    where: { id: 'govt_tmc_wb' },
    update: {},
    create: {
      id: 'govt_tmc_wb',
      name: 'TMC West Bengal Government',
      partyId: tmc.id,
      regionId: wbRegion.id,
      termStart: new Date('2021-05-05'),
      isActive: true
    }
  })

  console.log('✅ Governments seeded — Modi 3.0, AAP Delhi, BJP MH, Yogi UP, DMK TN, TMC WB')

  // ── MANIFESTOS ───────────────────────────────────────────────────
  await prisma.manifesto.upsert({
    where: { id: 'manifesto_bjp_2024' },
    update: {},
    create: {
      id: 'manifesto_bjp_2024',
      partyId: bjp.id,
      governmentId: modGovt.id,
      electionYear: 2024,
      title: 'BJP Sankalp Patra 2024 — Lok Sabha',
      pdfUrl: 'https://www.bjp.org/files/manifesto2024.pdf'
    }
  })

  await prisma.manifesto.upsert({
    where: { id: 'manifesto_inc_2024' },
    update: {},
    create: {
      id: 'manifesto_inc_2024',
      partyId: inc.id,
      governmentId: null,
      electionYear: 2024,
      title: 'INC Nyay Patra 2024 — Lok Sabha',
      pdfUrl: 'https://www.inc.in/manifesto2024.pdf'
    }
  })

  await prisma.government.upsert({
  where: { id: 'govt_inc_opposition' },
  update: {},
  create: {
    id: 'govt_inc_opposition',
    name: 'INC Opposition 2024',
    partyId: inc.id,
    regionId: national.id,
    termStart: new Date('2024-06-09'),
    isActive: true
  }
})

// ── HISTORICAL GOVERNMENTS ────────────────────────────
await prisma.government.upsert({
  where: { id: 'govt_upa1_manmohan' },
  update: {},
  create: {
    id: 'govt_upa1_manmohan',
    name: 'UPA 1 — Manmohan Singh (2004–2009)',
    partyId: inc.id,
    regionId: national.id,
    termStart: new Date('2004-05-22'),
    termEnd: new Date('2009-05-22'),
    isActive: false
  }
})

await prisma.government.upsert({
  where: { id: 'govt_upa2_manmohan' },
  update: {},
  create: {
    id: 'govt_upa2_manmohan',
    name: 'UPA 2 — Manmohan Singh (2009–2014)',
    partyId: inc.id,
    regionId: national.id,
    termStart: new Date('2009-05-22'),
    termEnd: new Date('2014-05-26'),
    isActive: false
  }
})

await prisma.government.upsert({
  where: { id: 'govt_modi1' },
  update: {},
  create: {
    id: 'govt_modi1',
    name: 'Modi 1.0 — NDA (2014–2019)',
    partyId: bjp.id,
    regionId: national.id,
    termStart: new Date('2014-05-26'),
    termEnd: new Date('2019-05-30'),
    isActive: false
  }
})

await prisma.government.upsert({
  where: { id: 'govt_modi2' },
  update: {},
  create: {
    id: 'govt_modi2',
    name: 'Modi 2.0 — NDA (2019–2024)',
    partyId: bjp.id,
    regionId: national.id,
    termStart: new Date('2019-05-30'),
    termEnd: new Date('2024-06-09'),
    isActive: false
  }
})

await prisma.manifesto.upsert({
  where: { id: 'manifesto_bjp_mh_2024' },
  update: {},
  create: {
    id: 'manifesto_bjp_mh_2024',
    partyId: bjp.id,
    governmentId: 'govt_bjp_mh_2024',
    electionYear: 2024,
    title: 'Mahayuti Maharashtra Manifesto 2024',
    pdfUrl: 'https://bjp.org/maharashtra-manifesto-2024.pdf'
  }
})

// ── HISTORICAL MANIFESTOS ─────────────────────────────
await prisma.manifesto.upsert({
  where: { id: 'manifesto_inc_2004' },
  update: {},
  create: {
    id: 'manifesto_inc_2004',
    partyId: inc.id,
    governmentId: 'govt_upa1_manmohan',
    electionYear: 2004,
    title: 'INC Congress Ka Haath 2004 — Lok Sabha',
    pdfUrl: 'https://www.inc.in/manifesto2004.pdf'
  }
})

await prisma.manifesto.upsert({
  where: { id: 'manifesto_inc_2009' },
  update: {},
  create: {
    id: 'manifesto_inc_2009',
    partyId: inc.id,
    governmentId: 'govt_upa2_manmohan',
    electionYear: 2009,
    title: 'INC Aam Aadmi Ka Manifesto 2009 — Lok Sabha',
    pdfUrl: 'https://www.inc.in/manifesto2009.pdf'
  }
})

await prisma.manifesto.upsert({
  where: { id: 'manifesto_bjp_2014' },
  update: {},
  create: {
    id: 'manifesto_bjp_2014',
    partyId: bjp.id,
    governmentId: 'govt_modi1',
    electionYear: 2014,
    title: 'BJP Ek Bharat Shreshtha Bharat 2014 — Lok Sabha',
    pdfUrl: 'https://www.bjp.org/manifesto2014.pdf'
  }
})

await prisma.manifesto.upsert({
  where: { id: 'manifesto_bjp_2019' },
  update: {},
  create: {
    id: 'manifesto_bjp_2019',
    partyId: bjp.id,
    governmentId: 'govt_modi2',
    electionYear: 2019,
    title: 'BJP Sankalpit Bharat Sashakt Bharat 2019 — Lok Sabha',
    pdfUrl: 'https://www.bjp.org/manifesto2019.pdf'
  }
})
console.log('✅ Maharashtra manifesto seeded')
console.log('✅ Historical manifestos seeded — INC 2004, INC 2009, BJP 2014, BJP 2019')

console.log('✅ Historical governments seeded — UPA 1, UPA 2, Modi 1.0, Modi 2.0')

  console.log('✅ Manifestos seeded — BJP 2024, INC 2024')
  console.log('🎉 Database seeding complete!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
