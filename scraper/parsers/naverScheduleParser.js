import { chromium } from 'playwright';

/**
 * 특정 영화의 네이버 상영일정 크롤링 (날짜별 전체)
 *
 * URL 패턴:
 *   https://search.naver.com/search.naver?where=nexearch&sm=tab_etc&mra=bkEw
 *     &pkid=68&os={naverMovieId}&qvt=0&query={title}%20상영일정
 *
 * HTML 구조:
 *   li._scrolling_wrapper                         ← 극장 블록
 *     a.this_link_place                           ← 극장명
 *     li._time_check[data-time="YYYY-MM-DD ..."]  ← 상영 회차
 *       a.area_link[href]                         ← 예매 URL (chain 판별용)
 *       dd.this_text_time > span.this_point_big   ← 시작 시간
 *       dd.this_text_time (전체 텍스트 ~ 이후)    ← 종료 시간
 *       dd.this_text_place                        ← 상영관 타입
 *
 * @param {{ id: string, title: string, naverMovieId: string }} movie
 * @returns {Array<{ movieId, chain, theater, date, startTime, endTime, screenType, bookingUrl, lastUpdatedAt }>}
 */
export async function scrapeMovieSchedules(movie) {
  const { id: movieId, title, naverMovieId } = movie;

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    });

    await page.setViewportSize({ width: 1280, height: 900 });

    const url =
      `https://search.naver.com/search.naver?where=nexearch&sm=tab_etc&mra=bkEw` +
      `&pkid=68&os=${naverMovieId}&qvt=0` +
      `&query=${encodeURIComponent(title + ' 상영일정')}`;

    console.log(`  [스케줄] "${title}" 로딩...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // 극장 목록 로드 대기
    await page
      .waitForSelector('li._scrolling_wrapper', { timeout: 15000 })
      .catch(() => console.warn(`  [스케줄] "${title}" — 극장 목록 대기 타임아웃`));

    // ── 날짜 탭 수집 ────────────────────────────────────────────
    const dateTabs = await page.$$('._date');
    console.log(`  [스케줄] "${title}" — 날짜 탭 ${dateTabs.length}개`);

    const allSchedules = [];

    if (dateTabs.length === 0) {
      // 날짜 탭 없으면 현재 페이지만 수집
      const list = await extractSchedules(page, movieId);
      allSchedules.push(...list);
    } else {
      for (let i = 0; i < dateTabs.length; i++) {
        // DOM 재생성 대비: 매 반복 새로 선택
        const tabs = await page.$$('._date');
        if (!tabs[i]) break;

        await tabs[i].click();
        await page
          .waitForSelector('li._scrolling_wrapper', { timeout: 8000 })
          .catch(() => {});
        await page.waitForTimeout(600);

        const list = await extractSchedules(page, movieId);
        allSchedules.push(...list);
        console.log(`  [스케줄] "${title}" 날짜 ${i + 1}: ${list.length}개`);
      }
    }

    console.log(`  [스케줄] "${title}" 완료 — 총 ${allSchedules.length}개`);
    return allSchedules;
  } finally {
    await browser.close();
  }
}

/**
 * 현재 페이지의 모든 극장/회차 데이터 추출
 */
async function extractSchedules(page, movieId) {
  const lastUpdatedAt = new Date().toISOString();

  const raw = await page.evaluate(() => {
    const results = [];

    document.querySelectorAll('li._scrolling_wrapper').forEach((theaterEl) => {
      const theaterName = theaterEl.querySelector('a.this_link_place')?.textContent?.trim() ?? '';
      if (!theaterName) return;

      theaterEl.querySelectorAll('li._time_check').forEach((item) => {
        // 예매 URL & chain 판별
        const bookingUrl = item.querySelector('a.area_link')?.getAttribute('href') ?? '';
        let chain = '';
        if (bookingUrl.includes('megabox.co.kr') || theaterName.startsWith('메가박스')) {
          chain = '메가박스';
        } else if (bookingUrl.includes('cgv.co.kr') || theaterName.startsWith('CGV')) {
          chain = 'CGV';
        } else if (
          bookingUrl.includes('lottecinema.co.kr') ||
          theaterName.startsWith('롯데시네마')
        ) {
          chain = '롯데시네마';
        } else if (theaterName.startsWith('씨네Q')) {
          chain = '씨네Q';
        }

        // 날짜: data-time="2026-03-15 07:30:00.0" → "2026-03-15"
        const date = (item.getAttribute('data-time') ?? '').substring(0, 10);

        // 시작/종료 시간
        const timeEl = item.querySelector('dd.this_text_time');
        const startTime = timeEl?.querySelector('span.this_point_big')?.textContent?.trim() ?? '';
        const endTime = (timeEl?.textContent?.trim() ?? '').split('~')[1]?.trim() ?? '';

        // 상영관 타입
        const screenType = item.querySelector('dd.this_text_place')?.textContent?.trim() ?? '';

        if (!date || !startTime) return;

        results.push({ chain, theater: theaterName, date, startTime, endTime, screenType, bookingUrl });
      });
    });

    return results;
  });

  return raw.map((s) => ({ ...s, movieId, lastUpdatedAt }));
}
