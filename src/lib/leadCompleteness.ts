import { marketExtendedApplications, targetCompanyTypes, tdsVerifiedApplications, type PublicLead } from './productMarketMap'
import { publicContactUrl, selectBusinessRecipient, validContactDate } from './contactEvidence'

export type CompletenessFilter = 'all' | 'needs-email' | 'needs-application' | 'needs-evidence'
export function leadMissingDetails(lead: PublicLead) {
  const evidence = lead.companyEvidence
  const application = (evidence.applicationLayer === 'tds-verified' ? tdsVerifiedApplications : marketExtendedApplications).find(item => item.id === evidence.applicationId && item.productId === lead.productId)
  const target = targetCompanyTypes.find(item => item.id === lead.targetCompanyTypeId && item.productId === lead.productId && item.kind === 'target')
  const extension = evidence.applicationLayer === 'tds-verified' || Boolean(application && 'sourceUrl' in application && publicContactUrl(application.sourceUrl) && validContactDate(application.verifiedAt))
  return {
    'needs-email': !selectBusinessRecipient(lead),
    'needs-application': !application || !extension || !target?.applicationReferences.some(item => item.layer === evidence.applicationLayer && item.applicationId === evidence.applicationId),
    'needs-evidence': !lead.companyEvidence.statement.trim() || !publicContactUrl(lead.companyEvidence.sourceUrl) || !validContactDate(lead.companyEvidence.verifiedAt) || !lead.supplierCompetitorCheck?.conclusion.trim() || !validContactDate(lead.supplierCompetitorCheck.checkedAt),
  }
}
