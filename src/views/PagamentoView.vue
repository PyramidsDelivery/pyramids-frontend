<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFreteStore } from '../stores/freteStore'
import DarkButton from '../components/DarkButton.vue'
import LightButton from '../components/LightButton.vue'

const route = useRoute()
const router = useRouter()
const store = useFreteStore()

const frete = ref(null)
const carregando = ref(true)
const redirecionando = ref(false)
const verificando = ref(false)
const erro = ref('')
const aviso = ref('')

const MOEDAS = { Reais: 'BRL', Euro: 'EUR', Dolar: 'USD' }

const jaPago = computed(() => frete.value?.status_pagamento === 'PAGO')

const valorFormatado = computed(() => {
  if (!frete.value) return ''
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: MOEDAS[frete.value.moeda] || 'BRL'
  }).format(Number(frete.value.valor_frete))
})

async function irParaMercadoPago() {
  if (redirecionando.value) return
  erro.value = ''
  aviso.value = ''
  redirecionando.value = true

  const resultado = await store.iniciarPagamento(frete.value.id)

  if (!resultado.success) {
    erro.value = resultado.message
    redirecionando.value = false
    return
  }

  // Leva o cliente para a página de pagamento do Mercado Pago
  window.location.href = resultado.checkoutUrl
}

// Útil para PIX/boleto pagos depois, ou quando o webhook não está configurado
async function verificarPagamento() {
  verificando.value = true
  erro.value = ''
  aviso.value = ''

  const resultado = await store.confirmarPagamento(frete.value.id)

  if (!resultado.success) {
    erro.value = resultado.message
  } else if (resultado.pago) {
    router.push('/usuario-hub')
    return
  } else {
    aviso.value = 'Ainda não identificamos o pagamento. Se você acabou de pagar, aguarde alguns instantes e tente de novo.'
  }

  verificando.value = false
}

function voltar() {
  router.push('/usuario-hub')
}

onMounted(async () => {
  frete.value = await store.buscarFrete(route.params.id)
  if (!frete.value) erro.value = 'Frete não encontrado.'
  carregando.value = false
})
</script>

<template>
  <div class="pagamento">
    <div class="card">
      <h1>Pagamento do frete</h1>

      <p v-if="carregando">Carregando...</p>

      <template v-else-if="frete">
        <div class="resumo">
          <span>Frete #{{ frete.id }}</span>
          <strong>{{ valorFormatado }}</strong>
        </div>

        <p v-if="jaPago" class="destaque">Este frete já foi pago.</p>

        <template v-else>
          <p class="info">
            Você será levado ao ambiente seguro do Mercado Pago, onde poderá pagar com
            <strong>PIX</strong>, <strong>cartão</strong> ou <strong>boleto</strong>.
            Depois do pagamento, você volta automaticamente para cá.
          </p>

          <DarkButton
            :label="redirecionando ? 'Redirecionando...' : 'Pagar com Mercado Pago'"
            @click="irParaMercadoPago"
          />

          <LightButton
            :label="verificando ? 'Verificando...' : 'Já paguei, verificar pagamento'"
            @click="verificarPagamento"
          />
        </template>
      </template>

      <p v-if="erro" class="erro">{{ erro }}</p>
      <p v-if="aviso" class="aviso">{{ aviso }}</p>

      <button type="button" class="voltar" @click="voltar">Voltar ao painel</button>
    </div>
  </div>
</template>

<style scoped>
.pagamento {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background-color: var(--color-light);
  color: var(--color-dark);
}

.card {
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
}

.resumo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 16px;
  background: #e9e9e9;
}

.resumo strong {
  font-size: 1.5rem;
}

.info {
  line-height: 1.5;
}

.destaque {
  font-weight: bold;
}

.erro {
  color: #b00020;
  font-weight: 600;
}

.aviso {
  color: #555;
}

.voltar {
  background: none;
  border: none;
  color: var(--color-dark);
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.95rem;
}
</style>