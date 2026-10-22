// Build output contains only data already used by the public frontend.
// No research queue, private work records, configuration or credentials are read.
import { readFileSync } from 'node:fs'
import { publicLeads, marketProducts, tdsVerifiedApplications, marketExtendedApplications, targetCompanyTypes } from '../src/lib/productMarketMap.ts'
import { leadEmailFacts } from '../src/lib/leadEmailFacts.ts'
import { conciseCompanyFact } from '../src/lib/conciseLeadEmailFacts.ts'
import { savedLeadBusinessFact } from '../src/lib/leadBusinessFacts.ts'
import { presentBusinessFact } from '../src/lib/leadBusinessFactPresentation.ts'

const history = JSON.parse(readFileSync(new URL('../src/lib/leadFirstRecorded.json', import.meta.url), 'utf8'))
const facts = Object.fromEntries(publicLeads.map(lead => [lead.id, {
  statement: lead.companyEvidence.statement,
  email: leadEmailFacts[lead.id], concise: conciseCompanyFact(lead.id), business: presentBusinessFact(lead.companyEvidence.statement, savedLeadBusinessFact(lead)),
}]))
const timeline = Object.fromEntries(publicLeads.filter(lead => history[lead.id]).map(lead => [lead.id, history[lead.id]]))
process.stdout.write(JSON.stringify({ schemaVersion:1, leads:publicLeads, timeline, facts, products:marketProducts, tdsApplications:tdsVerifiedApplications, extendedApplications:marketExtendedApplications, targetTypes:targetCompanyTypes }))
