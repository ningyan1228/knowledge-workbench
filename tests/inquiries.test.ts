import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { vi } from 'vitest'
import { inquiryError, setInquiryStatus, type Inquiry } from '../src/lib/inquiries'
const mocks=vi.hoisted(()=>({rpc:vi.fn(),getSession:vi.fn()}))
vi.mock('../src/lib/supabase',()=>({supabase:{auth:{getSession:mocks.getSession},rpc:mocks.rpc}}))
vi.mock('../src/lib/accountSession',()=>({useAccountSession:()=>({status:'anonymous',user:null})}))
import { Inquiries } from '../src/features/inquiries/Inquiries'
describe('private inquiries',()=>{
 it('accepts single-row RPC arrays and objects without losing the record identity',async()=>{mocks.getSession.mockResolvedValue({data:{session:{user:{id:'owner'}}},error:null});const row={id:'inquiry',status:'pending',version:0} as Inquiry;const next={...row,status:'sent',version:1};for(const data of [next,[next]]){mocks.rpc.mockResolvedValue({data,error:null});expect(await setInquiryStatus('owner',row,'sent')).toEqual(next)}mocks.rpc.mockResolvedValue({data:[],error:null});await expect(setInquiryStatus('owner',row,'sent')).rejects.toThrow('返回格式异常')})
 it('does not render the workspace, copy actions or statuses without login',()=>{const html=renderToStaticMarkup(createElement(Inquiries));expect(html).toContain('登录私人资料库');expect(html).not.toContain('确认已实际发送');expect(html).not.toContain('inquiry-list');expect(html).not.toContain('复制回复原文')})
 it('explains database setup, permission and concurrent update errors',()=>{expect(inquiryError({code:'PGRST205'})).toContain('尚未初始化');expect(inquiryError({code:'42501'})).toContain('权限');expect(inquiryError({code:'40001'})).toContain('另一窗口')})
})
