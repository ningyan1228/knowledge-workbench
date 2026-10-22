// Populated only after a complete, validated public snapshot has been fetched.
// The statement binds each reviewed rendering to the same company's evidence.
export type RefreshedLeadFact = { statement: string; email?: string; concise?: string; business?: string }
let refreshedFacts: Record<string, RefreshedLeadFact> = {}
export function replaceRefreshedLeadFacts(facts: Record<string, RefreshedLeadFact>) { refreshedFacts = facts }
export function refreshedLeadFact(lead: { id: string; companyEvidence: { statement: string } }) {
  const fact = refreshedFacts[lead.id]
  return fact?.statement === lead.companyEvidence.statement ? fact : undefined
}
