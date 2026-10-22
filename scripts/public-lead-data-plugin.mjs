import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'

export default function publicLeadDataPlugin() {
  return {
    name:'published-customer-data', apply:'build',
    generateBundle() {
      const source=execFileSync(process.execPath,['--experimental-strip-types','scripts/export-public-lead-data.mjs'],{encoding:'utf8',maxBuffer:16*1024*1024})
      const version=createHash('sha256').update(source).digest('hex')
      const file=`customer-data-${version}.json`
      this.emitFile({type:'asset',fileName:file,source})
      this.emitFile({type:'asset',fileName:'customer-data.json',source:JSON.stringify({schemaVersion:1,version,file,generatedAt:new Date().toISOString()})})
    },
  }
}
