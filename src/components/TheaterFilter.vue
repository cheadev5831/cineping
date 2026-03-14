<template>
  <div class="theater-filter-section">
    <div class="theater-filter-inner">

      <!-- 체인 선택 -->
      <div class="chain-row">
        <span class="chain-label">체인</span>
        <div class="chain-btn-group">
          <button
            v-for="c in CHAINS"
            :key="c.value"
            class="chain-btn"
            :class="{ active: chainModel === c.value }"
            @click="$emit('update:chainModel', c.value)"
          >
            {{ c.label }}
          </button>
        </div>
      </div>

      <!-- 지역 선택 -->
      <div class="region-row">
        <span class="region-label">지역</span>
        <div class="region-scroll">
          <button
            v-for="r in REGIONS"
            :key="r"
            class="region-btn"
            :class="{ active: regionModel === r }"
            @click="$emit('update:regionModel', r)"
          >
            {{ r }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import 'src/css/theater-filter.css';

defineProps({
  chainModel: {
    type: String,
    default: '전체',
  },
  regionModel: {
    type: String,
    default: '전체',
  },
});

defineEmits(['update:chainModel', 'update:regionModel']);

const CHAINS = [
  { value: '전체', label: '전체' },
  { value: 'CGV', label: 'CGV' },
  { value: '롯데시네마', label: '롯데시네마' },
  { value: '메가박스', label: '메가박스' },
];

const REGIONS = [
  '전체', '서울', '경기', '인천', '강원', '충청', '대전', '세종',
  '전라', '광주', '경상', '대구', '부산', '울산', '제주',
];
</script>
