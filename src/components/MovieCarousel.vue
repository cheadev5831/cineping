<template>
  <div class="movie-carousel-section">
    <div class="movie-carousel-wrapper">

      <!-- 포스터 스크롤 트랙 -->
      <div ref="trackRef" class="movie-carousel-track">
        <div
          v-for="(movie, index) in movies"
          :key="movie.id"
          class="movie-poster-item"
          :class="{ selected: selectedId === movie.id }"
          @click="$emit('select', movie)"
        >
          <!-- 포스터 이미지 영역 -->
          <div class="movie-poster-img-wrap">
            <img
              :src="movie.poster || 'https://via.placeholder.com/152x228?text=No+Image'"
              :alt="movie.title"
              class="movie-poster-img"
            />

            <!-- 호버 오버레이 -->
            <div class="movie-poster-overlay" />
          </div>

          <!-- 영화 정보 -->
          <div class="movie-poster-title">{{ movie.title }}</div>
        </div>

        <!-- 빈 상태 -->
        <div v-if="movies.length === 0" class="text-grey-5 q-pa-xl text-body2">
          등록된 영화가 없습니다.
        </div>
      </div>


</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import type { Movie } from 'src/types';
import 'src/css/movie-carousel.css';

const props = defineProps<{
  movies: Movie[];
  selectedId: string;
}>();

defineEmits<{ select: [movie: Movie] }>();

const trackRef = ref<HTMLElement | null>(null);

async function centerSelected(): Promise<void> {
  await nextTick();
  if (!trackRef.value) return;
  const selected = trackRef.value.querySelector('.selected') as HTMLElement | null;
  selected?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

watch(() => props.selectedId, centerSelected);
</script>
