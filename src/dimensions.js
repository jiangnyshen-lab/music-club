// 评价维度分两套：
// - 专辑维度（8 个）：评「这堆歌作为一个作品好不好」—— 整体视角
// - 单曲维度（7 个）：评「这一首歌硬不硬」—— 技艺视角
// 每个维度带：白话解释 + 引导问题（怎么听）

export const ALBUM_DIMENSION_GROUPS = [
  {
    group: '① 专辑内核',
    items: [
      { key: 'concept', label: '主题', en: 'Concept', tip: '整张想讲什么，是不是概念专辑', question: '这些歌是不是在说同一件事？' },
      { key: 'cohesion', label: '统一性', en: 'Cohesion', tip: '是「一张专辑」还是「一堆单曲」', question: '这是一次完整表达，还是拼盘？' }
    ]
  },
  {
    group: '② 编排与结构',
    items: [
      { key: 'sequencing', label: '曲序', en: 'Sequencing', tip: '歌的顺序、起承转合、intro/outro', question: '打乱顺序还成立吗？哪几首位置动不得？' },
      { key: 'pacing', label: '节奏曲线', en: 'Pacing', tip: '快慢强弱的安排，会不会越听越累或越平', question: '全专听下来，情绪有没有起伏？' },
      { key: 'opening', label: '开场与收尾', en: 'Opening/Closing', tip: '第一首抓不抓人，最后一首留不留味', question: '第一首把你抓住了吗？最后一首让你回味吗？' }
    ]
  },
  {
    group: '③ 整体体验',
    items: [
      { key: 'variety', label: '多样性', en: 'Variety', tip: '会不会十几首一个味', question: '闭眼听，分得清现在是第几首吗？' },
      { key: 'replay', label: '耐听度', en: 'Replay Value', tip: '越听越有味，还是听一遍就腻', question: '你还会想再完整听一遍吗？' }
    ]
  },
  {
    group: '④ 视觉',
    items: [
      { key: 'cover', label: '封面/视觉', en: 'Cover Art', tip: '封面设计、整体视觉美学', question: '封面和音乐气质配吗？看图能猜出音乐吗？' }
    ]
  }
]

export const TRACK_DIMENSION_GROUPS = [
  {
    group: '① 词与曲',
    items: [
      { key: 'lyrics', label: '作词', en: 'Lyrics', tip: '歌词写得好不好：文学性、意象、打不打动人', question: '关掉旋律只看歌词，它还成立吗？' },
      { key: 'composition', label: '作曲', en: 'Composition', tip: '旋律、和声、hook（记忆点）好不好', question: '哼得出几个旋律？哪句留在脑子里？' }
    ]
  },
  {
    group: '② 演绎',
    items: [
      { key: 'vocals', label: '演唱', en: 'Vocals', tip: '唱功、音色、情感表达', question: '换个人唱，这歌还成立吗？' },
      { key: 'performance', label: '演奏', en: 'Performance', tip: '乐器演奏水平、乐手的表达', question: '有没有哪段 solo 让你起鸡皮疙瘩？' }
    ]
  },
  {
    group: '③ 声音制作',
    items: [
      { key: 'arrangement', label: '编曲', en: 'Arrangement', tip: '用什么乐器、怎么铺排、音色层次', question: '把主唱去掉，背景还在讲东西吗？' },
      { key: 'mixing', label: '混音', en: 'Mixing', tip: '各声部清不清晰、空间感、层次', question: '戴耳机听，能分清每个乐器在哪儿吗？' },
      { key: 'production', label: '制作/母带', en: 'Production', tip: '整体声音质感、响度、细节', question: '和同类专辑比，这张「声音」是好是糙？' }
    ]
  }
]

// key -> 中文标签的扁平映射（点评卡片里显示维度名用）
export const ALBUM_DIMENSION_LABELS = {}
for (const g of ALBUM_DIMENSION_GROUPS) {
  for (const it of g.items) ALBUM_DIMENSION_LABELS[it.key] = it.label
}

export const TRACK_DIMENSION_LABELS = {}
for (const g of TRACK_DIMENSION_GROUPS) {
  for (const it of g.items) TRACK_DIMENSION_LABELS[it.key] = it.label
}
