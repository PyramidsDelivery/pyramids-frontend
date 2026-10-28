<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFreteStore } from '../stores/freteStore'
import DarkButton from '../components/DarkButton.vue'
import LightButton from '../components/LightButton.vue'

const route = useRoute()
const router = useRouter()
const store = useFreteStore()

// verificando | aprovado | pendente | recusado | erro
const estado = ref('verificando')
const mensagem = ref('')
const freteId = ref(null)

// O Mercado Pago manda "null" como texto quando ainda não existe pagamento
function limpar(valor) {
  return valor && valor !== 'null' ? String(valor) : null
}

onMounted(async () => {
  freteId.value = limpar(route.query.external_reference)
  const paymentId = limpar(route.query.payment_id) || limpar(route.query.collection_id)

  if (!freteId.value) {
    estado.value = 'erro'
    mensagem.value = 'Não foi possível identificar o frete deste pagamento.'
    return
  }

  // A URL pode ser alterada por qualquer pessoa: quem decide é o backend
  const resultado = await store.confirmarPagamento(freteId.value, paymentId)

  if (!resultado.success) {
    estado.value = 'erro'
    mensagem.value = resultado.message
    return
  }

  if (resultado.pago) {
    estado.value = 'aprovado'
    mensagem.value = 'Pagamento aprovado com sucesso!'
    setTimeout(() => router.push('/usuario-hub'), 2500)
  } else if (['pending', 'in_process', 'authorized'].includes(resultado.statusMp)) {
    estado.value = 'pendente'
    mensagem.value = 'Pagamento em análise ou aguardando confirmação. Assim que for confirmado, o frete será atualizado.'
  } else {
    estado.value = 'recusado'
    mensagem.value = 'O pagamento não foi concluído. Você pode tentar novamente.'
  }
})
</script>

<template>
  <div class="retorno">
    <div class="card">
      <h1 v-if="estado === 'verificando'">Verificando pagamento...</h1>
      <h1 v-else-if="estado === 'aprovado'">Tudo certo!</h1>
      <h1 v-else-if="estado === 'pendente'">Pagamento pendente</h1>
      <h1 v-else>Não foi possível concluir</h1>

      <p v-if="mensagem">{{ mensagem }}</p>

      <div class="acoes">
        <DarkButton
          v-if="estado === 'recusado' && freteId"
          label="Tentar novamente"
          @click="router.push(`/pagamento/${freteId}`)"
        />
        <LightButton
          v-if="estado !== 'verificando'"
          label="Ir para o painel"
          @click="router.push('/usuario-hub')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.retorno {
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
  text-align: center;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
}

.acoes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>