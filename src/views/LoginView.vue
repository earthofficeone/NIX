<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

const remember = ref(false)

onMounted(() => {
  remember.value = localStorage.getItem('remember') === 'true'
  if (remember.value) {
    email.value = localStorage.getItem('email') || ''
    password.value = localStorage.getItem('password') || ''
  }
})

function rememberChange(event: Event) {
  const checkbox = event.target as HTMLInputElement
  remember.value = checkbox.checked
  localStorage.setItem('remember', remember.value.toString())
}

async function submit() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'กรุณากรอกอีเมลและรหัสผ่าน'
    return
  }
  const err = await auth.login(email.value, password.value)
  if (err) {
    error.value = err
    return
  }

  if (remember.value === true) {
    localStorage.setItem('email', email.value)
    localStorage.setItem('password', password.value)
  } else {
    localStorage.removeItem('email')
    localStorage.removeItem('password')
  }

  router.push({ name: 'dashboard' })
}
</script>

<template>
  <AuthLayout>
    <form class="auth-form lux-card" @submit.prevent="submit">
      <h2 class="auth-form__title">เข้าสู่ระบบ</h2>
      <p class="lux-subtitle auth-form__desc">จัดการรายรับรายจ่ายอย่างมีระดับ</p>

      <div class="auth-form__field">
        <label class="lux-label" for="email">อีเมล</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="lux-input"
          placeholder="you@email.com"
        />
      </div>
      <div class="auth-form__field">
        <label class="lux-label" for="password">รหัสผ่าน</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="lux-input"
          placeholder="••••••••"
        />
      </div>

      <p v-if="error" class="auth-form__error">{{ error }}</p>

      <div class="auth-form__field flex items-center gap-2 justify-end mt-[-10px]">
        <input
          type="checkbox"
          id="remember"
          v-model="remember"
          class="w-4 h-4 accent-(--Primary-Color) cursor-pointer"
          @change="rememberChange"
        />
        <label for="remember" class="cursor-pointer text-sm">จดจำฉัน</label>
      </div>

      <button type="submit" class="lux-btn lux-btn--gold lux-btn--full" :disabled="auth.loading">
        {{ auth.loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
      </button>

      <p class="auth-form__footer">
        ยังไม่มีบัญชี?
        <RouterLink to="/register">สมัครสมาชิก</RouterLink>
      </p>
    </form>
  </AuthLayout>
</template>

<style scoped lang="scss">
.auth-form {
  padding: 2rem 1.75rem;
}

.auth-form__title {
  font-size: 1.35rem;
  font-weight: 300;
  color: #f5f0e8;
  margin: 0 0 0.35rem;
  letter-spacing: 0.06em;
}

.auth-form__desc {
  margin-bottom: 1.75rem;
}

.auth-form__field {
  margin-bottom: 1.1rem;
}

.auth-form__error {
  color: #e08a8a;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.auth-form__footer {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: rgba(245, 240, 232, 0.5);

  a {
    color: var(--Primary-Color);
    text-decoration: none;
    margin-left: 0.25rem;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
