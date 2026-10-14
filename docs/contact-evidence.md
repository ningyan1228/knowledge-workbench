# 联系人分项核验

先确认公司为已独立核验的海外需求侧企业，并通过应用、同行排除和主体去重。负责人职位高、联系方式齐全，不构成公司入库资格，也不表示采购意向。不新增无依据的 A 级评级。

采购／供应链 → 研发／技术 → 产品 → 生产 → 老板／管理层 → 商务 → 公共业务入口。电商岗位不作为原料采购角色；有公司业务入口时优先使用该入口。

## 保存结构

`CompanyContact` 保留姓名、职位、部门、邮箱、业务电话、公开个人 LinkedIn 链接，并新增：

- `identityEvidence`：company、name、title、responsibilities、currentEmployment=true、sources[]、verifiedAt。核对当前任职公司和职责，优先官网、官方公告或展会资料与公开 LinkedIn 交叉验证。
- `emailEvidence`：company、value（实际披露地址）、kind（named-business / department / general）、personName（具名邮箱时）、publicBusiness=true、sources[]、verifiedAt。
- `phoneEvidence`：与邮箱证据相同字段；value 为明确公开的业务电话号码，不收集私人号码。
- 每条 `sources` 为 `{label,url,summary}`，使用实际读取过的公开页面及证据短摘录。只有一个页面同时明示任职和邮箱归属时，两个证据对象可以引用同一 URL；不能从 LinkedIn 任职信息推导邮箱。

公司 `generalEmailEvidence`、`generalPhoneEvidence` 和部门邮箱 `emailEvidence` 使用同样结构，但不得填 named-business。日期分别记录，不回填虚构日期。旧的 `source`、`verifiedAt` 仅保留为历史合并来源，不自动转成独立证据。

## 状态与发信选择

状态根据数据计算：身份已核验／身份待核验、业务邮箱有来源、业务电话有来源、仅领英入口、待补联系方式。缺项同时列明当前任职与职责、具名业务邮箱归属、已有但未核验的电话。仅领英可用于寻找或核验负责人，不能计入可发邮件名单。

具名收件人必须同时具备匹配本公司、本人姓名和当前职位的身份证据，以及公开业务邮箱和个人归属证据。`info@`、`sales@`、`support@` 等公共／部门邮箱只用公司或部门称呼。所有名单、短开发信、Prompt、下一步动作和发送记录预填共用选择规则；保留共享发送记录去重。邮箱有公开来源不表示已验证投递成功。

既有公司／部门公共邮箱可继续使用保存的公司公开业务来源，并显示“旧公开来源／分项日期待补”。新增记录必须提供分项证据；若新证据无效，不回退到旧来源掩盖问题。缺少分项证据的个人邮箱不自动作为收件人，原资料仍可查看。

## 研究轮次

`contactFindings` 的 found 必须含 identityEvidence；若提供 email 或 phone，必须分别提供对应 evidence。business_email 只填公司／部门邮箱、emailEvidence 和日期，不填虚构姓名。sources[] 仍用于本轮研究记录，不能代替分项证据。结果保持 needs_review / awaiting_review，独立复核后才能补到正式公开联系人。

研究脚本只在身份已核验后关闭相应采购或技术角色缺项；领英身份资料不会关闭 business-email 缺项。普通补联系人不触发客户数据发布。频率与通知偏好保持不变，不发送邮件、不提交联系表单、不写 CRM。
