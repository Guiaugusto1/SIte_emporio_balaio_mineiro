/*
 * DADOS DA LOJA
 * --------------------------------------------------------------
 * Para mudar horário, endereço ou contatos, altere só este arquivo.
 * Depois de salvar no GitHub, o Render publica o site sozinho.
 */
window.LOJA = {
  nome: 'Empório Balaio Mineiro',

  // Frase curta que aparece em destaque no topo do site
  chamada: 'Bons sabores, escolhidos a dedo',

  // Texto da seção "Sobre a loja" (cada item é um parágrafo)
  sobre: [
    'O Empório Balaio Mineiro reúne queijos, vinhos, cachaças e doces escolhidos com o cuidado de quem conhece a tradição mineira.',
    'Aqui você encontra produtos para o dia a dia, para montar uma tábua com os amigos ou para presentear quem gosta de comer bem. Venha conhecer, provar e conversar com a gente.',
  ],

  // Produtos em destaque
  produtos: [
    { titulo: 'Queijos', texto: 'Queijos artesanais e queijos finos, em peça ou fatiados na hora.' },
    { titulo: 'Vinhos', texto: 'Rótulos nacionais e importados, para o dia a dia e para ocasiões especiais.' },
    { titulo: 'Cachaças', texto: 'Cachaças selecionadas para apreciar com calma ou para presentear.' },
    { titulo: 'Doces', texto: 'Doce de leite, goiabada, cocada e outros doces para a sobremesa.' },
  ],

  // Contatos — deixe vazio ('') o que a loja não tiver; o site esconde sozinho
  instagram: 'emporiobalaiomineiro',
  // Número da loja. Ao tocar no telefone, o cliente vai direto para o WhatsApp.
  whatsapp: '5511993065520', // só números, com 55 + DDD
  telefone: '(11) 99306-5520', // como o número aparece no site
  email: '',

  // Endereço
  endereco: {
    rua: 'Rua Dr. Humberto Pascale, 163',
    bairro: 'Capão Redondo',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '05884-310',
    referencia: '', // Ex.: 'Em frente à praça'
  },

  // Horário de funcionamento
  // 0 = domingo, 1 = segunda ... 6 = sábado
  // null = fechado. Com intervalo de almoço: [['09:00', '12:00'], ['13:30', '20:00']]
  horarios: {
    0: [['09:00', '14:30']],
    1: [['09:00', '20:00']],
    2: [['09:00', '20:00']],
    3: [['09:00', '20:00']],
    4: [['09:00', '20:00']],
    5: [['09:00', '20:00']],
    6: [['09:00', '20:00']],
  },

  // Dias em que a loja não abre (feriados), no formato 'AAAA-MM-DD'
  fechadoEm: ['2026-12-25', '2027-01-01'],

  // Recado numa faixa no topo do site. Deixe '' para esconder.
  // Ex.: 'Encomendas de Natal até 20/12 pelo WhatsApp'
  aviso: '',
}
