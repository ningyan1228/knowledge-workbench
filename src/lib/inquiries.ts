import { supabase } from './supabase'
export type InquirySummary = {
  id: string; customer_name: string; product: string; inquiry_time: string | null;
  status: 'pending' | 'sent'; version: number; position: number;
}
export type Inquiry = InquirySummary & {
  company: string | null; country: string | null; subject: string | null; extra_request: string | null;
  source_metadata: string; language: 'en' | 'vi'; inquiry_original: string; inquiry_zh: string;
  reply_original: string; reply_zh: string; status_updated_at: string | null;
}
async function client(ownerId: string) {
  if (!supabase) throw new Error('私人资料库尚未连接，请检查账号与连接。')
  const { data, error } = await supabase.auth.getSession()
  if (error || data.session?.user.id !== ownerId) throw new Error('登录状态已变化，请重新登录。')
  return supabase
}
export function inquiryError(error: unknown) {
  const code = (error as {code?: string})?.code
  if (code === '42P01' || code === 'PGRST205' || code === 'PGRST202') return '询盘私有表尚未初始化，请管理员执行询盘页面迁移后重试。'
  if (code === '42501') return '当前账号没有读取或更新这条询盘的权限。'
  if (code === '40001') return '另一窗口已更新状态，请刷新后核对。'
  return error instanceof Error ? error.message : (error as {message?:string})?.message || '读取失败，请检查网络并重试。'
}
export async function listInquiries(ownerId: string, signal: AbortSignal) {
  const db=await client(ownerId)
  const {data,error}=await db.from('customer_inquiries').select('id,customer_name,product,inquiry_time,status,version,position').eq('owner_id',ownerId).order('position').abortSignal(signal)
  if(error)throw error
  return (data??[]) as InquirySummary[]
}
export async function readInquiry(ownerId:string,id:string,signal:AbortSignal) {
  const db=await client(ownerId)
  const {data,error}=await db.from('customer_inquiries').select('id,customer_name,product,inquiry_time,status,version,position,company,country,subject,extra_request,source_metadata,language,inquiry_original,inquiry_zh,reply_original,reply_zh,status_updated_at').eq('owner_id',ownerId).eq('id',id).abortSignal(signal).single()
  if(error)throw error
  return data as Inquiry
}
export async function setInquiryStatus(ownerId:string,row:Inquiry,status:Inquiry['status']) {
  const db=await client(ownerId)
  const {data,error}=await db.rpc('set_inquiry_status',{p_id:row.id,p_status:status,p_expected_version:row.version})
  if(error)throw error
  const result = Array.isArray(data) ? data[0] : data
  if (!result || result.id !== row.id || result.status !== status || typeof result.version !== 'number') throw new Error('状态返回格式异常，请刷新后核对，勿重复标记。')
  return result as Inquiry
}
