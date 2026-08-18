// 评价维度分两套：
// - 专辑维度（8 个）：评「这堆歌作为一个作品好不好」—— 整体视角
// - 单曲维度（7 个）：评「这一首歌硬不硬」—— 技艺视角
// 每个维度带：一句白话解释（tip）

export const ALBUM_DIMENSION_GROUPS = [
  {
    group: '① 专辑内核',
    items: [
      { key: 'concept', label: '主题', en: 'Concept', tip: '整张想讲什么，是不是概念专辑' },
      { key: 'cohesion', label: '统一性', en: 'Cohesion', tip: '是「一张专辑」还是「一堆单曲」' }
    ]
  },
  {
    group: '② 编排与结构',
    items: [
      { key: 'sequencing', label: '曲序', en: 'Sequencing', tip: '歌的顺序、起承转合、intro/outro' },
      { key: 'pacing', label: '节奏曲线', en: 'Pacing', tip: '快慢强弱的安排，会不会越听越累或越平' },
      { key: 'opening', label: '开场与收尾', en: 'Opening/Closing', tip: '第一首抓不抓人，最后一首留不留味' }
    ]
  },
  {
    group: '③ 整体体验',
    items: [
      { key: 'variety', label: '多样性', en: 'Variety', tip: '会不会十几首一个味' },
      { key: 'replay', label: '耐听度', en: 'Replay Value', tip: '越听越有味，还是听一遍就腻' }
    ]
  },
  {
    group: '④ 视觉',
    items: [
      { key: 'cover', label: '封面/视觉', en: 'Cover Art', tip: '封面设计、整体视觉美学' }
    ]
  }
]

export const TRACK_DIMENSION_GROUPS = [
  {
    group: '① 词与曲',
    items: [
      { key: 'lyrics', label: '作词', en: 'Lyrics', tip: '歌词写得好不好：文学性、意象、打不打动人' },
      { key: 'composition', label: '作曲', en: 'Composition', tip: '旋律、和声、hook（记忆点）好不好' }
    ]
  },
  {
    group: '② 演绎',
    items: [
      { key: 'vocals', label: '演唱', en: 'Vocals', tip: '唱功、音色、情感表达' },
      { key: 'performance', label: '演奏', en: 'Performance', tip: '乐器演奏水平、乐手的表达' }
    ]
  },
  {
    group: '③ 声音制作',
    items: [
      { key: 'arrangement', label: '编曲', en: 'Arrangement', tip: '用什么乐器、怎么铺排、音色层次' },
      { key: 'mixing', label: '混音', en: 'Mixing', tip: '各声部清不清晰、空间感、层次' },
      { key: 'production', label: '制作/母带', en: 'Production', tip: '整体声音质感、响度、细节' }
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
