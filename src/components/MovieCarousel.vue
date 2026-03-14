<template>
  <div class="movie-carousel-section">
    <div class="movie-carousel-wrapper">

      <!-- 이전 버튼 -->
      <q-btn
        class="carousel-arrow carousel-arrow-left"
        round
        flat
        icon="chevron_left"
        color="white"
        size="md"
        @click="scrollPrev"
        aria-label="이전"
      />

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

            <!-- 순위 뱃지 -->
            <span class="movie-rank-badge">{{ index + 1 }}</span>

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

      <!-- 다음 버튼 -->
      <q-btn
        class="carousel-arrow carousel-arrow-right"
        round
        flat
        icon="chevron_right"
        color="white"
        size="md"
        @click="scrollNext"
        aria-label="다음"
      />

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Movie } from 'src/types';
import 'src/css/movie-carousel.css';

defineProps<{
  movies: Movie[];
  selectedId: string;
}>();

defineEmits<{ select: [movie: Movie] }>();

const trackRef = ref<HTMLElement | null>(null);

function scrollPrev() {
  trackRef.value?.scrollBy({ left: -480, behavior: 'smooth' });
}

function scrollNext() {
  trackRef.value?.scrollBy({ left: 480, behavior: 'smooth' });
}
</script>
