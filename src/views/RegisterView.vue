<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const error = ref('')

async function submit() {
  error.value = ''
  if (!name.value.trim()) {
    error.value = 'กรุณากรอกชื่อ'
    return
  }
  if (!email.value || !password.value) {
    error.value = 'กรุณากรอกอีเมลและรหัสผ่าน'
    return
  }
  if (password.value.length < 4) {
    error.value = 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'รหัสผ่านไม่ตรงกัน'
    return
  }
  const err = await auth.register(name.value, email.value, password.value)
  if (err) {
    error.value = err
    return
  }
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <AuthLayout>
    <form class="py-8 px-7 lux-card" @submit.prevent="submit">
      <h2 class="text-[1.35rem] font-light text-(--Text-Color) mb-[0.35rem] tracking-[0.06em]">
        สมัครสมาชิก
      </h2>
      <p class="lux-subtitle mb-7">เริ่มบันทึกการเงินส่วนตัวของคุณ</p>

      <div class="mb-[1.1rem]">
        <label class="lux-label" for="name">ชื่อ</label>
        <input id="name" v-model="name" type="text" class="lux-input" placeholder="ชื่อของคุณ" />
      </div>
      <div class="mb-[1.1rem]">
        <label class="lux-label" for="email">อีเมล</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="lux-input"
          placeholder="you@email.com"
        />
      </div>
      <div class="mb-[1.1rem]">
        <label class="lux-label" for="password">รหัสผ่าน</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="lux-input"
          placeholder="••••••••"
        />
      </div>
      <div class="mb-[1.1rem]">
        <label class="lux-label" for="confirm">ยืนยันรหัสผ่าน</label>
        <input
          id="confirm"
          v-model="confirm"
          type="password"
          class="lux-input"
          placeholder="••••••••"
        />
      </div>

      <p v-if="error" class="text-(--Danger-Color) text-[0.85rem] mb-4">{{ error }}</p>

      <button type="submit" class="lux-btn lux-btn--gold lux-btn--full" :disabled="auth.loading">
        {{ auth.loading ? 'กำลังสมัคร...' : 'สร้างบัญชี' }}
      </button>

      <p class="text-center mt-6 text-[0.85rem] text-(--Muted-Color)">
        มีบัญชีแล้ว?
        <RouterLink to="/login" class="text-(--Primary-Color) ml-1">เข้าสู่ระบบ</RouterLink>
      </p>
    </form>
  </AuthLayout>
</template>
