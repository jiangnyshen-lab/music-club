// 11 个评价维度（5 大组）——「辅助审美提升」的核心内容
// 每个维度带：白话解释 + 引导问题（怎么听）
export const DIMENSION_GROUPS = [
  {
    group: '① 文本与主题',
    items: [
      { key: 'lyrics', label: '作词', en: 'Lyrics', tip: '歌词写得好不好：文学性、意象、打不打动人', question: '关掉旋律只看歌词，它还成立吗？' },
      { key: 'concept', label: '主题', en: 'Concept', tip: '整张专辑想讲什么，是不是概念专辑', question: '这些歌是不是在说同一件事？' }
    ]
  },
  {
    group: '② 旋律与和声',
    items: [
      { key: 'composition', label: '作曲', en: 'Composition', tip: '旋律、和声、hook（记忆点）好不好', question: '哼得出几个旋律？哪句留在脑子里？' },
      { key: 'arrangement', label: '编曲', en: 'Arrangement', tip: '用什么乐器、怎么铺排、音色层次', question: '把主唱去掉，背景还在讲东西吗？' }
    ]
  },
  {
    group: '③ 演唱与演奏',
    items: [
      { key: 'vocals', label: '演唱', en: 'Vocals', tip: '唱功、音色、情感表达', question: '换个人唱，这歌还成立吗？' },
      { key: 'performance', label: '演奏', en: 'Performance', tip: '乐器演奏水平、乐手的表达', question: '有没有哪段 solo 让你起鸡皮疙瘩？' }
    ]
  },
  {
    group: '④ 声音制作',
    items: [
      { key: 'mixing', label: '混音', en: 'Mixing', tip: '各声部清不清晰、空间感、层次', question: '戴耳机听，能分清每个乐器在哪儿吗？' },
      { key: 'production', label: '制作/母带', en: 'Production', tip: '整体声音质感、响度、细节', question: '和同类专辑比，这张"声音"是好是糙？' }
    ]
  },
  {
    group: '⑤ 专辑整体',
    items: [
      { key: 'sequencing', label: '曲序', en: 'Sequencing', tip: '歌的顺序、起承转合、intro/outro', question: '打乱顺序还成立吗？哪几首位置动不得？' },
      { key: 'cover', label: '封面/视觉', en: 'Cover Art', tip: '封面设计、整体视觉美学', question: '封面和音乐气质配吗？看图能猜出音乐吗？' },
      { key: 'cohesion', label: '统一性', en: 'Cohesion', tip: '是"一张专辑"还是"一堆单曲"', question: '这是一次完整表达，还是拼盘？' }
    ]
  }
]

// key -> 中文标签的扁平映射（点评卡片里显示维度名用）
export const DIMENSION_LABELS = {}
for (const g of DIMENSION_GROUPS) {
  for (const it of g.items) DIMENSION_LABELS[it.key] = it.label
}
