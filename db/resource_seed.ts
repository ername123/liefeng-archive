export const RESOURCE_SEED: Array<{
  category: string;
  grp: string;
  title: string;
  url: string;
  description: string;
  sortOrder: number;
}> = [
  // ── ACG综合资源 ──────────────────────────────
  { category: "ACG综合资源", grp: "Galgame", title: "GORPG", url: "https://www.gorpg.club/", description: "同人汉化游戏分享平台", sortOrder: 1 },
  { category: "ACG综合资源", grp: "Galgame", title: "忧郁弟弟 Galgame 站", url: "https://www.mikugal.com/", description: "Galgame 资源发布站", sortOrder: 2 },
  { category: "ACG综合资源", grp: "Galgame", title: "VNDB", url: "https://vndb.org/", description: "视觉小说/Galgame 资料库", sortOrder: 3 },
  { category: "ACG综合资源", grp: "Galgame", title: "喵窝 Nyagal", url: "https://www.nyagal.com/", description: "Galgame 下载资源窝", sortOrder: 4 },
  { category: "ACG综合资源", grp: "社区/资讯", title: "绯月 ScarletMoon", url: "https://kf.miaola.info/index.php", description: "绯月 ACG 社区", sortOrder: 1 },
  { category: "ACG综合资源", grp: "社区/资讯", title: "2DJGAME", url: "https://bbs4.2djgame.net/", description: "2DJGAME 社区入口", sortOrder: 2 },
  { category: "ACG综合资源", grp: "社区/资讯", title: "U资讯", url: "http://www.uzxun.me/", description: "ACG 资讯发布页", sortOrder: 3 },
  { category: "ACG综合资源", grp: "工具", title: "MisakaHookFinder", url: "https://github.com/hanmin0822/MisakaHookFinder", description: "Galgame 文本提取工具", sortOrder: 1 },

  // ── 动画/影视资源 ──────────────────────────────
  { category: "动画/影视资源", grp: "动画", title: "Anime Raw", url: "https://animeraw.org/", description: "Anime Raw 生肉资源", sortOrder: 1 },
  { category: "动画/影视资源", grp: "动画", title: "爱恋动漫 BT", url: "http://www.kisssub.org/", description: "爱恋动漫 BT 下载", sortOrder: 2 },
  { category: "动画/影视资源", grp: "动画", title: "哔咪动漫 M站", url: "http://bimiacg.com/", description: "哔咪动漫在线看", sortOrder: 3 },
  { category: "动画/影视资源", grp: "影视/综合", title: "LBRY", url: "https://lbry.com/", description: "自由内容平台", sortOrder: 1 },
  { category: "动画/影视资源", grp: "影视/综合", title: "TVSeries", url: "https://tvseries.cc/", description: "美剧下载观看", sortOrder: 2 },

  // ── MAD/MMD/创作 ──────────────────────────────
  { category: "MAD/MMD/创作", grp: "资料", title: "MAD 图书馆", url: "https://acglibrary.com/", description: "MAD 学习资料库", sortOrder: 1 },
  { category: "MAD/MMD/创作", grp: "资料", title: "月离的万事屋", url: "https://www.yuelili.com/", description: "创作教程与资源分享", sortOrder: 2 },
  { category: "MAD/MMD/创作", grp: "音频工具", title: "Spleeter", url: "https://djtechtools.com/2019/11/07/spleeter-signal-separation-tool-trained-on-deezers-library-is-pretty-impressive/", description: "音轨分离工具/可分人声", sortOrder: 1 },
  { category: "MAD/MMD/创作", grp: "音频工具", title: "Vocal Remover", url: "https://vocalremover.org/ch/", description: "AI 人声分离", sortOrder: 2 },
  { category: "MAD/MMD/创作", grp: "字幕/字体", title: "TCAX 官方论坛", url: "http://www.tcax.org/", description: "字幕特效制作工具论坛", sortOrder: 1 },
  { category: "MAD/MMD/创作", grp: "字幕/字体", title: "OP/ED 字体样式推荐", url: "http://www.tcax.org/forum.php?mod=viewthread&tid=1948", description: "新人 OP/ED 中日字体样式", sortOrder: 2 },
  { category: "MAD/MMD/创作", grp: "MMD 素材", title: "BowlRoll", url: "https://bowlroll.net/", description: "MMD 模型配布", sortOrder: 1 },
  { category: "MAD/MMD/创作", grp: "MMD 素材", title: "模之屋", url: "https://www.aplaybox.com/", description: "模之屋 MMD 素材", sortOrder: 2 },

  // ── 绘画设计 ──────────────────────────────
  { category: "绘画设计", grp: "人体/速写参考", title: "Bodies in Motion", url: "https://www.bodiesinmotion.photo/", description: "人体动态参考图库", sortOrder: 1 },
  { category: "绘画设计", grp: "人体/速写参考", title: "Line of Action", url: "https://line-of-action.com/", description: "速写练习与人体参考", sortOrder: 2 },
  { category: "绘画设计", grp: "人体/速写参考", title: "QuickPoses", url: "https://www.quickposes.com/en/gestures/timed", description: "限时姿态速写", sortOrder: 3 },
  { category: "绘画设计", grp: "教程/馆藏", title: "ArtGraphica", url: "http://www.artgraphica.net/", description: "免费绘画教程", sortOrder: 1 },
  { category: "绘画设计", grp: "教程/馆藏", title: "故宫名画记", url: "https://minghuaji.dpm.org.cn/", description: "故宫名画高清", sortOrder: 2 },
  { category: "绘画设计", grp: "教程/馆藏", title: "芝加哥艺术博物馆", url: "https://www.artic.edu/collection", description: "馆藏艺术品高清图", sortOrder: 3 },
  { category: "绘画设计", grp: "配色", title: "Coolors", url: "https://coolors.co/", description: "配色方案生成", sortOrder: 1 },
  { category: "绘画设计", grp: "配色", title: "NIPPON COLORS", url: "https://nipponcolors.com/", description: "日本传统色", sortOrder: 2 },

  // ── 编程/开发 ──────────────────────────────
  { category: "编程/开发", grp: "建站", title: "学做网站论坛", url: "https://www.xuewangzhan.net/", description: "零基础建站教程", sortOrder: 1 },
  { category: "编程/开发", grp: "建站", title: "NexusPHP", url: "https://github.com/ZJUT/NexusPHP", description: "PT 站建站程序", sortOrder: 2 },
  { category: "编程/开发", grp: "建站", title: "WordPress 中文站", url: "https://cn.wordpress.org/", description: "WordPress 中文", sortOrder: 3 },
  { category: "编程/开发", grp: "建站", title: "kangle", url: "https://www.kangleweb.com/forum.php", description: "kangle Web 服务器", sortOrder: 4 },
  { category: "编程/开发", grp: "开发工具", title: "Chocolatey", url: "https://chocolatey.org/", description: "Windows 包管理器", sortOrder: 1 },
  { category: "编程/开发", grp: "开发工具", title: "Visual Studio", url: "https://visualstudio.microsoft.com/zh-hans/", description: "VS IDE 与开发工具", sortOrder: 2 },
  { category: "编程/开发", grp: "开发工具", title: "监控宝", url: "https://www.jiankongbao.com/", description: "网站/服务器监控", sortOrder: 3 },

  // ── 工具/软件 ──────────────────────────────
  { category: "工具/软件", grp: "图像工具", title: "Photopea", url: "https://www.photopea.com/", description: "在线 PS 图像编辑", sortOrder: 1 },
  { category: "工具/软件", grp: "图像工具", title: "Bigjpg", url: "http://bigjpg.com/", description: "AI 图片无损放大", sortOrder: 2 },
  { category: "工具/软件", grp: "图像工具", title: "remove.bg", url: "https://www.remove.bg/", description: "一键抠图去背景", sortOrder: 3 },
  { category: "工具/软件", grp: "图像工具", title: "Galmoe", url: "http://www.galmoe.com/", description: "B站封面提取", sortOrder: 4 },
  { category: "工具/软件", grp: "在线工具", title: "OSCHINA 在线工具", url: "http://tool.oschina.net/", description: "开发者在线工具集", sortOrder: 1 },
  { category: "工具/软件", grp: "在线工具", title: "Smallpdf", url: "https://smallpdf.com/cn", description: "PDF 在线工具", sortOrder: 2 },
  { category: "工具/软件", grp: "在线工具", title: "百度翻译", url: "http://fanyi.baidu.com/", description: "在线翻译", sortOrder: 3 },
  { category: "工具/软件", grp: "在线工具", title: "摩尔斯电码转换器", url: "http://www.zhongguosou.com/zonghe/moErSiCodeConverter.aspx", description: "摩尔斯电码转换", sortOrder: 4 },

  // ── 论坛/社区 ──────────────────────────────
  { category: "论坛/社区", grp: "技术社区", title: "吾爱破解", url: "https://www.52pojie.cn/", description: "软件安全技术社区", sortOrder: 1 },
  { category: "论坛/社区", grp: "技术社区", title: "CSDN", url: "https://www.csdn.net/", description: "IT 技术社区", sortOrder: 2 },
  { category: "论坛/社区", grp: "技术社区", title: "看雪论坛", url: "https://bbs.pediy.com/", description: "看雪安全社区", sortOrder: 3 },
  { category: "论坛/社区", grp: "技术社区", title: "飘云阁", url: "https://www.chinapyg.com/", description: "软件安全社区", sortOrder: 4 },
  { category: "论坛/社区", grp: "技术社区", title: "技术宅的结界", url: "https://www.0xaa55.com/", description: "技术宅论坛", sortOrder: 5 },
  { category: "论坛/社区", grp: "硬件/数码", title: "萝卜头 IT 论坛", url: "https://bbs.luobotou.org/", description: "萝卜头电脑论坛", sortOrder: 1 },
  { category: "论坛/社区", grp: "硬件/数码", title: "阿莫电子论坛", url: "https://www.amobbs.com/forum.php", description: "电子爱好者社区", sortOrder: 2 },
  { category: "论坛/社区", grp: "硬件/数码", title: "PCEVA", url: "http://bbs.pceva.com.cn/", description: "电脑硬件论坛", sortOrder: 3 },
];
