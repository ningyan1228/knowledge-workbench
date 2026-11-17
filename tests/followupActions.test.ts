import { describe, expect, it } from 'vitest'
import { effectiveFollowupDate, type FollowupAction } from '../src/features/market/FollowupActions'
import type { FollowupCustomer } from '../src/lib/customerFollowup'
describe('follow-up actions do not rewrite source plans',()=>{
 const row={id:'C01',actionDate:'2026-11-17'} as FollowupCustomer
 const action=(id:string,kind:'done'|'postpone',day:string):FollowupAction=>({id,customer_id:'C01',kind,action_date:day,note:'用户确认',actor:'owner@example.test',created_at:'2026-11-17T00:00:00Z'})
 it('only a confirmed done action clears the current reminder',()=>{expect(effectiveFollowupDate(row,[])).toBe(row.actionDate);expect(effectiveFollowupDate(row,[action('1','done','2026-11-17')])).toBeNull();expect(row.actionDate).toBe('2026-11-17')})
 it('latest explicit action wins and other customers remain isolated',()=>{const history=[action('1','done','2026-11-17'),action('2','postpone','2026-11-20')];expect(effectiveFollowupDate(row,history)).toBe('2026-11-20');expect(effectiveFollowupDate({...row,id:'C02'},history)).toBe('2026-11-17')})
})
