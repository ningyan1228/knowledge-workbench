import type { User } from '@supabase/supabase-js'
import { proxyRequest } from './api'
import { supabase } from './supabase'
import { products as catalog } from './demoData'

export type WorkspaceProduct = { id: string; import_key: string | null; name_zh: string; name_en: string | null; grade: string | null; current_version_id: string | null }
export type WorkspaceSource = { id: string; name: string; endpoint_url: string; adapter: string; verification_status: string; enabled: boolean; last_verified_at: string | null; last_success_at: string | null; failure_reason: string | null }
export type WorkspaceArticle = { id: string; title: string; canonical_url: string; source_published_at: string | null; source_published_text: string | null; content_access: string; content_text: string | null; kind: string; source_id: string | null }

export const sourceCatalog = [
  { name: 'OpenAlex · 控释肥包膜', adapter: 'openalex', endpoint_url: 'https://api.openalex.org/works?search=controlled%20release%20fertilizer%20coating&per-page=20', homepage_url: 'https://openalex.org/', productKey: 'fertilizer-coating' },
  { name: 'Crossref · 环氧化亚麻油', adapter: 'crossref', endpoint_url: 'https://api.crossref.org/works?query=epoxidized%20linseed%20oil&rows=20', homepage_url: 'https://www.crossref.org/', productKey: 'elo' },
  { name: 'Crossref · PP 水性涂层', adapter: 'crossref', endpoint_url: 'https://api.crossref.org/works?query=waterborne%20coating%20polypropylene&rows=20', homepage_url: 'https://www.crossref.org/', productKey: 'nl-w1201' },
]

function client() {
  if (!supabase) throw new Error('NOT_CONFIGURED: 尚未配置 Supabase。')
  return supabase
}

export async function ensureInitialProducts(user: User): Promise<WorkspaceProduct[]> {
  const db = client()
  await db.rpc('ensure_my_profile')
  const records = catalog.map((product) => ({
    owner_id: user.id, import_key: product.id, name_zh: product.name, name_en: product.englishName,
    grade: product.grade, category: product.category,
  }))
  const { error } = await db.from('products').upsert(records, { onConflict: 'owner_id,import_key', ignoreDuplicates: true })
  if (error) throw error
  return listProducts()
}

export async function listProducts(): Promise<WorkspaceProduct[]> {
  const { data, error } = await client().from('products').select('id,import_key,name_zh,name_en,grade,current_version_id').order('created_at')
  if (error) throw error
  return data ?? []
}

export async function uploadDocument(user: User, productId: string, file: File): Promise<{ documentId: string; jobId?: string }> {
  if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) throw new Error('仅支持 PDF 或 DOCX。')
  if (file.size > 20 * 1024 * 1024) throw new Error('文件超过 20 MB 默认上限。')
  const db = client()
  const hashBuffer = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
  const sha256 = Array.from(new Uint8Array(hashBuffer)).map((value) => value.toString(16).padStart(2, '0')).join('')
  const { data: duplicate, error: duplicateError } = await db.from('documents').select('id').eq('sha256', sha256).maybeSingle()
  if (duplicateError) throw duplicateError
  if (duplicate) return { documentId: duplicate.id }
  const safeName = file.name.replace(/[^\w.\-\u4e00-\u9fff() ]/g, '_')
  const storagePath = `${user.id}/${crypto.randomUUID()}-${safeName}`
  const { error: uploadError } = await db.storage.from('private-documents').upload(storagePath, file, { contentType: file.type, upsert: false })
  if (uploadError) throw uploadError
  const { data: document, error: documentError } = await db.from('documents').insert({ owner_id: user.id, storage_path: storagePath, file_name: file.name, mime_type: file.type, sha256, byte_size: file.size, parser_status: 'queued' }).select('id').single()
  if (documentError) {
    await db.storage.from('private-documents').remove([storagePath])
    throw documentError
  }
  const versionLabel = `待审核 ${new Date().toISOString().replace(/[:.]/g, '-')}-${document.id.slice(0, 8)}`
  const { error: versionError } = await db.from('product_versions').insert({ owner_id: user.id, product_id: productId, document_id: document.id, version_label: versionLabel, review_status: 'extracted' })
  if (versionError) throw versionError
  const response = await proxyRequest<{ job_id: string }>('/documents/parse', { document_id: document.id })
  return { documentId: document.id, jobId: response.job_id }
}

export async function listSources(): Promise<WorkspaceSource[]> {
  const { data, error } = await client().from('sources').select('id,name,endpoint_url,adapter,verification_status,enabled,last_verified_at,last_success_at,failure_reason').order('created_at')
  if (error) throw error
  return data ?? []
}

export async function addCatalogSource(user: User, source: typeof sourceCatalog[number]) {
  const db = client()
  const { productKey, ...sourceFields } = source
  const { error } = await db.from('sources').upsert({ owner_id: user.id, ...sourceFields, access_method: 'public', enabled: false, verification_status: 'unverified' }, { onConflict: 'owner_id,endpoint_url', ignoreDuplicates: true })
  if (error) throw error
  const [{ data: product, error: productError }, { data: sources, error: sourceError }] = await Promise.all([
    db.from('products').select('id').eq('import_key', productKey).maybeSingle(),
    db.from('sources').select('id').eq('endpoint_url', source.endpoint_url).maybeSingle(),
  ])
  if (productError || sourceError || !product || !sources) throw productError || sourceError || new Error('无法关联来源与产品。')
  const { data: existing, error: relationError } = await db.from('source_topics').select('id').eq('source_id', sources.id).eq('product_id', product.id).maybeSingle()
  if (relationError) throw relationError
  if (!existing) {
    const { error: insertError } = await db.from('source_topics').insert({ owner_id: user.id, source_id: sources.id, product_id: product.id })
    if (insertError) throw insertError
  }
}

export async function enqueueSourceValidation(sourceId: string) { return proxyRequest<{ job_id: string }>('/sources/validate', { source_id: sourceId }) }
export async function enqueueIngestion() { return proxyRequest<{ job_id: string }>('/ingestion/run', {}) }
export async function setSourceEnabled(sourceId: string, enabled: boolean) {
  const { error } = await client().from('sources').update({ enabled }).eq('id', sourceId)
  if (error) throw error
}

export async function listArticles(): Promise<WorkspaceArticle[]> {
  const { data, error } = await client().from('articles').select('id,title,canonical_url,source_published_at,source_published_text,content_access,content_text,kind,source_id').order('source_published_at', { ascending: false, nullsFirst: false }).limit(30)
  if (error) throw error
  return data ?? []
}

export async function listArticleSummaries(articleIds: string[]) {
  if (!articleIds.length) return [] as Array<{ article_id: string; summary_zh: string; business_meaning: string | null; review_status: string }>
  const { data, error } = await client().from('article_summaries').select('article_id,summary_zh,business_meaning,review_status').in('article_id', articleIds)
  if (error) throw error
  return data ?? []
}
