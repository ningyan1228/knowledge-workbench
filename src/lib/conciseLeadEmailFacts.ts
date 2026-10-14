import { leadEmailFacts } from './leadEmailFacts'

// Editorial shortening of existing sourced observations only. Keep the original
// sentences for legacy references; new customers use their reviewed fact directly.
const conciseOverrides: Record<string, string> = {
  'cifo-san-giorgio': 'Your slow-release fertilizer for green plants uses granules coated with a porous MCT membrane.',
  'dahan-tech-innovation-nilai': 'Your Hydropic range includes corrosion-protection, antifouling and chemical-resistant coatings.',
  'weha-agro-sejahtera-jakarta': 'Your Nagaemas NPK production process includes coating intended to control nutrient release and prevent caking.',
  'isaval-ribarroja': 'Your Xanol Barniz Interior is a single-component water-based polyurethane varnish for wood.',
  'polyvine-cheddar': 'Your 2K-POLY86 is a two-pack water-based polyurethane varnish for wooden floors and interior timber.',
  'bedec-dunmow': 'Your MSV range is a water-based acrylic varnish reinforced with polyurethane for wood applications.',
  'incitec-pivot-fertilisers-melbourne': 'Your Tasmanian sites apply Green Urea NV and eNpower using their own fertiliser coating systems.',
  'chugoku-marine-paints-tokyo': 'Your company manufactures marine, industrial and container paints, with factories and R&D centres in Japan.',
  'saraswanti-anugerah-indonesia-mempawah': 'Your NPK product page describes a coating step intended to regulate nutrient release before packing.',
}

export function conciseCompanyFact(leadId: string) {
  return leadEmailFacts[leadId] ? conciseOverrides[leadId] ?? leadEmailFacts[leadId] : undefined
}
