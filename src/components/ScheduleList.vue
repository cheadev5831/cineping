<template>
  <div class="schedule-section">
    <div class="schedule-inner">

      <!-- 빈 상태 -->
      <div v-if="grouped.length === 0" class="schedule-empty">
        <q-icon name="event_busy" size="48px" color="grey-4" />
        <div class="q-mt-md text-grey-5 text-body1">선택하신 날짜에 상영 일정이 없습니다.</div>
      </div>

      <!-- 극장 카드 목록 -->
      <div
        v-for="theater in grouped"
        :key="theater.name"
        class="theater-card"
      >
        <!-- 극장 헤더 -->
        <div class="theater-header">
          <q-btn
            flat
            round
            dense
            :icon="favorites.includes(theater.name) ? 'star' : 'star_outline'"
            class="theater-favorite-btn"
            :class="{ favorited: favorites.includes(theater.name) }"
            size="sm"
            @click="$emit('toggleFavorite', theater.name)"
            :aria-label="favorites.includes(theater.name) ? '즐겨찾기 해제' : '즐겨찾기 추가'"
          />

          <span class="theater-name">{{ theater.name }}</span>

          <span
            class="theater-chain-badge"
            :class="chainBadgeClass(theater.chain)"
          >{{ theater.chain }}</span>

          <a
            :href="theaterInfoUrl(theater.chain)"
            target="_blank"
            rel="noopener noreferrer"
            class="theater-info-link"
          >극장안내</a>
        </div>

        <!-- 관별 상영 행 -->
        <div
          v-for="hall in theater.halls"
          :key="hall.key"
          class="hall-row"
        >
          <!-- 관 정보 -->
          <div class="hall-info">
            <span class="hall-name">{{ hall.key }}</span>
            <span
              class="screen-type-badge"
              :class="screenTypeBadgeClass(hall.key)"
            >{{ hall.key }}</span>
          </div>

          <!-- 시간 버튼 목록 -->
          <div class="showtime-buttons">
            <button
              v-for="s in hall.schedules"
              :key="s.id"
              class="showtime-btn"
              :class="seatStatusClass(s.availableSeats)"
              :disabled="s.availableSeats === 0"
              @click="openBooking(s.bookingUrl)"
            >
              <span class="showtime-btn-start">{{ s.startTime }}</span>
              <span class="showtime-btn-end">~{{ s.endTime }}</span>
              <span class="showtime-btn-seats">
                {{ s.availableSeats === 0 ? '매진' : `잔여 ${s.availableSeats}석` }}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Schedule } from 'src/types';
import 'src/css/schedule.css';

interface TheaterGroup {
  name: string;
  chain: string;
  halls: Record<string, Schedule[]>;
}

const props = defineProps<{
  schedules: Schedule[];
  favorites: string[];
}>();

defineEmits<{ toggleFavorite: [name: string] }>();

/* 즐겨찾기 극장 우선 → 이름순 정렬 후 그룹화 */
const grouped = computed(() => {
  const map: Record<string, TheaterGroup> = {};

  for (const s of props.schedules) {
    if (!map[s.theater]) {
      map[s.theater] = { name: s.theater, chain: s.chain, halls: {} };
    }
    const key = s.screenType || '2D';
    const theater = map[s.theater];
    if (theater && !theater.halls[key]) theater.halls[key] = [];
    theater?.halls[key]?.push(s);
  }

  return Object.values(map)
    .sort((a, b) => {
      const aFav = props.favorites.includes(a.name) ? 0 : 1;
      const bFav = props.favorites.includes(b.name) ? 0 : 1;
      if (aFav !== bFav) return aFav - bFav;
      return a.name.localeCompare(b.name);
    })
    .map((t) => ({
      ...t,
      halls: Object.entries(t.halls).map(([key, list]) => ({
        key,
        schedules: [...list].sort((a, b) => a.startTime.localeCompare(b.startTime)),
      })),
    }));
});

function chainBadgeClass(chain: string): string {
  if (chain === 'CGV') return 'cgv';
  if (chain === '롯데시네마') return 'lotte';
  if (chain === '메가박스') return 'mega';
  return '';
}

function screenTypeBadgeClass(type: string): string {
  const t = type.toUpperCase();
  if (t.includes('IMAX')) return 'imax';
  if (t.includes('4DX')) return 'four-dx';
  if (t.includes('SCREENX')) return 'screenx';
  if (t.includes('DOLBY')) return 'dolby';
  return 'type-2d';
}

function seatStatusClass(seats: number): string {
  if (seats === 0) return 'sold-out';
  if (seats <= 10) return 'almost-full';
  if (seats <= 50) return 'available';
  return 'normal';
}

function theaterInfoUrl(chain: string): string {
  if (chain === 'CGV') return 'https://www.cgv.co.kr';
  if (chain === '롯데시네마') return 'https://www.lottecinema.co.kr';
  if (chain === '메가박스') return 'https://www.megabox.co.kr';
  return '#';
}

function openBooking(url: string): void {
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
}
</script>
