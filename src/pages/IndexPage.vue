<template>
  <q-page class="row items-center justify-evenly">
    <q-btn
      label="텔레그램 테스트"
      color="primary"
      :loading="isLoading"
      @click="sendTestMessage"
    />
  </q-page>
</template>

<script setup lang="ts">
import { useTelegram } from 'src/composables/useTelegram';

const { isLoading, sendTestMessage } = useTelegram();
</script>
