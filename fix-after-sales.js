const fs = require('fs');
const path = require('path');

const filePath = 'd:/BigLionX/3cep/src/app/enterprise/after-sales/page.tsx';
const backupPath = `${filePath}.backup`;

console.log('Backing up original file...');
fs.copyFileSync(filePath, backupPath);

let content = fs.readFileSync(filePath, 'utf8');
let fixes = 0;

const replacements = [
  ['多语言说明/CardTitle>', '多语言说明书</CardTitle>'],
  ['二维码批量生                </CardTitle>', '二维码批量生成</CardTitle>'],
  ['智能知识                </CardTitle>', '智能知识库</CardTitle>'],
  ['说明书列/CardTitle>', '说明书列表</CardTitle>'],
  ['维修技巧列/CardTitle>', '维修技巧列表</CardTitle>'],
  ['软件升级包列/CardTitle>', '软件升级包列表</CardTitle>'],
  ['进行/CardTitle>', '进行中</CardTitle>'],
  ['总参与人/CardTitle>', '总参与人数</CardTitle>'],
  ['参与/CardTitle>', '参与人数</CardTitle>'],
  ['浏览/CardTitle>', '浏览次数</CardTitle>'],
  ['工单/th>', '工单号</th>'],
  ['状/th>', '状态</th>'],
  ['优先/th>', '优先级</th>'],
  ['状                    </th>', '状态</th>'],
  ['浏览                    </th>', '浏览量</th>'],
  ['技巧信                    </th>', '技巧信息</th>'],
  ['升级包信                    </th>', '升级包信息</th>'],
  ['下载                    </th>', '下载量</th>'],
  ['批量生成二维/Button>', '批量生成二维码</Button>'],
  ['次浏/div>', '次浏览</div>'],
  ["'待处}", "'待处理'"],
  ["'处理}", "'处理中'"],
  ["'已解}", "'已解决'"],
  ["'已关}", "'已关闭'"],
  ["{ticket.priority === 'low' && ''}", "{ticket.priority === 'low' && '低'}"],
  [
    "{ticket.priority === 'medium' && ''}",
    "{ticket.priority === 'medium' && '中'}",
  ],
  [
    "{ticket.priority === 'high' && ''}",
    "{ticket.priority === 'high' && '高'}",
  ],
  ["'紧}", "'紧急'"],
  ["'如何重置设备密码,", "'如何重置设备密码？'"],
  ["'电池续航时间短的原因,", "'电池续航时间短的原因'"],
  ["{ lang: '日本, flag: '🇯🇵' }", "{ lang: '日本', flag: '🇯🇵' }"],
  ["{ lang: '한국, flag: '🇰🇷' }", "{ lang: '한국어', flag: '🇰🇷' }"],
  [
    "{ id: 'quiz', name: '有奖问答', icon: ' }",
    "{ id: 'quiz', name: '有奖问答', icon: '🎯' }",
  ],
  ['{/* 二维码管*/}', '{/* 二维码管理 */}'],
  ['{/* 子标签导*/}', '{/* 子标签导航 */}'],
  ['获取说明书列表失);', "获取说明书列表失败');"],
  ['获取维修技巧列表失);', "获取维修技巧列表失败');"],
  ['获取软件升级包列表失);', "获取软件升级包列表失败');"],
  ['{part.price  `', '{part.price ? `'],
];

replacements.forEach(([from, to]) => {
  if (content.includes(from)) {
    content = content.split(from).join(to);
    fixes++;
    console.log(`Fixed: ${from.substring(0, 30)}...`);
  }
});

fs.writeFileSync(filePath, content, 'utf8');

console.log(`\nFix complete!`);
console.log(`Fixed ${fixes} errors`);
console.log(`Fixed file: ${filePath}`);
console.log(`Backup: ${backupPath}`);
