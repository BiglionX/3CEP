| schemaname | tablename   | policyname                 | permissive | roles           | cmd    | qual                                                                                             | with_check |
| ---------- | ----------- | -------------------------- | ---------- | --------------- | ------ | ------------------------------------------------------------------------------------------------ | ---------- |
| public     | admin_users | 仅管理员可修改 admin_users | PERMISSIVE | {public}        | ALL    | COALESCE((current_setting('app.settings.current_user_role'::text, true) = 'admin'::text), false) | null       |
| public     | admin_users | 用户可查询自身管理员状态   | PERMISSIVE | {authenticated} | SELECT | (user_id = auth.uid())                                                                           | null       |
| public     | admin_users | 租户隔离 - 查看管理员      | PERMISSIVE | {authenticated} | SELECT | (tenant_id IN ( SELECT tenant_users.tenant_id                                                    |

FROM tenant_users
WHERE (tenant_users.user_id = auth.uid()))) | null |
| public | admin_users | 管理员可管理管理员 | PERMISSIVE | {authenticated} | ALL | true | null |
| public | admin_users | 认证用户可查看 admin_users | PERMISSIVE | {authenticated} | SELECT | true | null |
| public | external_data_sources | 仅管理员可管理数据源 | PERMISSIVE | {authenticated} | ALL | (EXISTS ( SELECT 1
FROM admin_users
WHERE ((admin_users.user_id = auth.uid()) AND (admin_users.is_active = true)))) | null |
| public | external_data_sources | 允许认证用户查看数据源配置 | PERMISSIVE | {authenticated} | SELECT | true | null |
| public | parts_staging | 仅管理员可审核临时表数据 | PERMISSIVE | {authenticated} | ALL | (EXISTS ( SELECT 1
FROM admin_users
WHERE ((admin_users.user_id = auth.uid()) AND (admin_users.is_active = true)))) | null |
| public | parts_staging | 允许认证用户查看临时表数据 | PERMISSIVE | {authenticated} | SELECT | true | null |
| public | tenant_users | 租户隔离 - 查看租户成员 | PERMISSIVE | {authenticated} | SELECT | (tenant_id IN ( SELECT tenant_users_1.tenant_id
FROM tenant_users tenant_users_1
WHERE (tenant_users_1.user_id = auth.uid()))) | null |
