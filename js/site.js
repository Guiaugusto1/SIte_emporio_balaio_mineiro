/*
 * Monta as partes do site a partir de js/config.js.
 * Não é preciso mexer aqui para mudar horários ou contatos.
 */
(function () {
  'use strict'

  var L = window.LOJA || {}
  var DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
  var DIAS_TABELA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
  var ORDEM_SEMANA = [1, 2, 3, 4, 5, 6, 0]

  function $(id) { return document.getElementById(id) }

  function el(tag, attrs, filhos) {
    var n = document.createElement(tag)
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'texto') n.textContent = attrs[k]
      else if (k === 'html') n.innerHTML = attrs[k]
      else n.setAttribute(k, attrs[k])
    })
    ;(filhos || []).forEach(function (f) { if (f) n.appendChild(f) })
    return n
  }

  // Data e hora atuais no horário de Brasília, mesmo que o visitante esteja em outro fuso
  function agoraSP() {
    var partes = {}
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo', weekday: 'short', year: 'numeric', month: '2-digit',
      day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date()).forEach(function (p) { partes[p.type] = p.value })
    var dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
    return {
      dia: dias[partes.weekday],
      minutos: Number(partes.hour) * 60 + Number(partes.minute),
      iso: partes.year + '-' + partes.month + '-' + partes.day,
    }
  }

  function paraMinutos(hhmm) {
    var p = hhmm.split(':')
    return Number(p[0]) * 60 + Number(p[1] || 0)
  }

  function hora(hhmm) {
    var p = hhmm.split(':')
    var h = String(Number(p[0]))
    return p[1] && p[1] !== '00' ? h + 'h' + p[1] : h + 'h'
  }

  function textoIntervalos(intervalos) {
    if (!intervalos || !intervalos.length) return 'Fechado'
    return intervalos.map(function (i) { return hora(i[0]) + ' às ' + hora(i[1]) }).join(' e ')
  }

  function somarDias(iso, n) {
    var p = iso.split('-').map(Number)
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + n))
    return d.toISOString().slice(0, 10)
  }

  function dataCurta(iso) {
    var p = iso.split('-')
    return p[2] + '/' + p[1]
  }

  function fechadoNoDia(iso) {
    return (L.fechadoEm || []).indexOf(iso) !== -1
  }

  // "Aberto agora, fecha às 19h" / "Fechado agora, abre amanhã às 9h"
  function calcularStatus() {
    var agora = agoraSP()
    var horarios = L.horarios || {}
    var hoje = fechadoNoDia(agora.iso) ? null : horarios[agora.dia]

    if (hoje) {
      for (var i = 0; i < hoje.length; i++) {
        var ini = paraMinutos(hoje[i][0])
        var fim = paraMinutos(hoje[i][1])
        if (agora.minutos >= ini && agora.minutos < fim) {
          var faltam = fim - agora.minutos
          return {
            aberto: true,
            texto: faltam <= 30 ? 'Aberto agora, fecha em ' + faltam + ' min' : 'Aberto agora, fecha às ' + hora(hoje[i][1]),
          }
        }
        if (agora.minutos < ini) {
          return { aberto: false, texto: 'Fechado agora, abre hoje às ' + hora(hoje[i][0]) }
        }
      }
    }

    for (var n = 1; n <= 14; n++) {
      var iso = somarDias(agora.iso, n)
      var dia = (agora.dia + n) % 7
      var h = horarios[dia]
      if (h && h.length && !fechadoNoDia(iso)) {
        var quando = n === 1 ? 'amanhã' : (dia === 0 || dia === 6 ? 'no ' : 'na ') + DIAS[dia]
        var prefixo = fechadoNoDia(agora.iso) && horarios[agora.dia] ? 'Fechado hoje (feriado), abre ' : 'Fechado agora, abre '
        return { aberto: false, texto: prefixo + quando + ' às ' + hora(h[0][0]) }
      }
    }
    return { aberto: false, texto: 'Fechado no momento' }
  }

  function linkWhats(mensagem) {
    return 'https://wa.me/' + String(L.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(mensagem)
  }

  function enderecoTexto() {
    var e = L.endereco || {}
    var linha1 = [e.rua, e.bairro].filter(Boolean).join(' – ')
    var linha2 = [e.cidade, e.uf].filter(Boolean).join(' – ') + (e.cep ? ', CEP ' + e.cep : '')
    return { linha1: linha1, linha2: linha2, referencia: e.referencia || '' }
  }

  function linkMapa() {
    var e = enderecoTexto()
    var busca = [L.nome, e.linha1, e.linha2].filter(Boolean).join(', ')
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(busca)
  }

  var ICONES = {
    queijo: '<path d="M3 17 L12 6 L21 11 V18 H3 Z" /><path d="M12 6 L21 11" /><circle cx="9" cy="14" r="1.3" /><circle cx="15" cy="15" r="1" /><circle cx="17.5" cy="13" r=".8" />',
    vinho: '<path d="M8 3 H16 L15.5 9 A3.5 3.5 0 0 1 8.5 9 Z" /><path d="M8.3 7 H15.7" /><path d="M12 12.5 V20" /><path d="M8.5 20 H15.5" />',
    cachaca: '<path d="M10 2.5 H14 V6 C14 7 16.5 8.5 16.5 11 V20 A1.5 1.5 0 0 1 15 21.5 H9 A1.5 1.5 0 0 1 7.5 20 V11 C7.5 8.5 10 7 10 6 Z" /><path d="M7.5 13 H16.5" /><path d="M7.5 18 H16.5" />',
    frio: '<path d="M5 15 C3 11 6 6 11 6 C17 6 21 9 20 13 C19 17 14 19 9 18.5 C7 18.3 5.8 17 5 15 Z" /><circle cx="10" cy="11" r="1" /><circle cx="14" cy="13" r="1" /><circle cx="12" cy="15.5" r=".8" /><path d="M20 13 L22 12" />',
    doce: '<path d="M7 8 H17 V19 A1 1 0 0 1 16 20 H8 A1 1 0 0 1 7 19 Z" /><path d="M6 5 H18 V8 H6 Z" /><path d="M9.5 13 H14.5" />',
    padrao: '<circle cx="12" cy="12" r="8" /><path d="M8 12 H16" />',
  }

  function icone(titulo) {
    var t = (titulo || '').toLowerCase()
    var chave = /queij/.test(t) ? 'queijo' : /vinh/.test(t) ? 'vinho' : /cacha|aguardente/.test(t) ? 'cachaca' : /frio|embut|salam/.test(t) ? 'frio' : /doce|geleia|compota/.test(t) ? 'doce' : 'padrao'
    return '<svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' + ICONES[chave] + '</svg>'
  }

  function montar() {
    // Recado no topo
    if (L.aviso) {
      $('aviso').textContent = L.aviso
      $('aviso').hidden = false
    }

    // Chamada principal
    document.querySelectorAll('[data-loja="chamada"]').forEach(function (n) { if (L.chamada) n.textContent = L.chamada })

    // Sobre
    var sobre = $('sobre-paragrafos')
    ;(L.sobre || []).forEach(function (p) { sobre.appendChild(el('p', { texto: p })) })

    // Produtos
    var lista = $('produtos-lista')
    ;(L.produtos || []).forEach(function (p) {
      lista.appendChild(el('li', { class: 'produto' }, [
        el('span', { class: 'produto__icone', html: icone(p.titulo) }),
        el('h3', { texto: p.titulo }),
        el('p', { texto: p.texto }),
      ]))
    })

    // Horários
    var agora = agoraSP()
    var corpo = $('tabela-horarios')
    ORDEM_SEMANA.forEach(function (d) {
      var intervalos = (L.horarios || {})[d]
      var tr = el('tr', { class: (d === agora.dia ? 'hoje' : '') + (intervalos ? '' : ' fechado') }, [
        el('th', { scope: 'row', texto: DIAS_TABELA[d] + (d === agora.dia ? ' (hoje)' : '') }),
        el('td', { texto: textoIntervalos(intervalos) }),
      ])
      corpo.appendChild(tr)
    })

    function atualizarStatus() {
      var s = calcularStatus()
      ;['status-capa', 'status-horario'].forEach(function (id) {
        var n = $(id)
        n.textContent = s.texto
        n.classList.toggle('status--aberto', s.aberto)
        n.classList.toggle('status--fechado', !s.aberto)
      })
    }
    atualizarStatus()
    setInterval(atualizarStatus, 60000)

    // Endereço
    var e = enderecoTexto()
    var end = $('endereco')
    end.appendChild(el('span', { texto: e.linha1 }))
    end.appendChild(el('span', { texto: e.linha2 }))
    if (e.referencia) end.appendChild(el('span', { class: 'endereco__ref', texto: e.referencia }))
    $('link-mapa').href = linkMapa()
    $('rodape-endereco').textContent = [e.linha1, e.linha2].filter(Boolean).join(', ')

    // Botões da capa
    var botoes = $('botoes-capa')
    var mensagem = 'Olá! Vi o site do ' + (L.nome || 'Empório') + ' e gostaria de saber mais.'
    if (L.whatsapp) {
      botoes.appendChild(el('a', { class: 'botao', href: linkWhats(mensagem), target: '_blank', rel: 'noopener', texto: 'Chamar no WhatsApp' }))
    } else if (L.instagram) {
      botoes.appendChild(el('a', { class: 'botao', href: 'https://www.instagram.com/' + L.instagram, target: '_blank', rel: 'noopener', texto: 'Ver no Instagram' }))
    }
    botoes.appendChild(el('a', { class: 'botao botao--claro', href: '#horario', texto: 'Horário e endereço' }))

    // Contatos
    var contatos = $('contato-lista')
    function contato(rotulo, valor, href, externo) {
      var a = el('a', { href: href, class: 'contato__item' }, [
        el('span', { class: 'contato__rotulo', texto: rotulo }),
        el('span', { class: 'contato__valor', texto: valor }),
      ])
      if (externo) { a.target = '_blank'; a.rel = 'noopener' }
      contatos.appendChild(el('li', {}, [a]))
    }
    // Ao tocar no telefone, abre o WhatsApp da loja
    if (L.whatsapp) {
      var w = String(L.whatsapp).replace(/\D/g, '')
      var visivel = L.telefone || (w.length >= 12 ? '(' + w.slice(2, 4) + ') ' + w.slice(4, w.length - 4) + '-' + w.slice(-4) : w)
      contato('Telefone e WhatsApp', visivel, linkWhats(mensagem), true)
    } else if (L.telefone) {
      contato('Telefone', L.telefone, 'tel:' + L.telefone.replace(/\D/g, ''))
    }
    if (L.instagram) contato('Instagram', '@' + L.instagram, 'https://www.instagram.com/' + L.instagram, true)
    if (L.email) contato('E-mail', L.email, 'mailto:' + L.email)
    contato('Endereço', e.linha1 || 'Ver no mapa', linkMapa(), true)

    // Botão flutuante do WhatsApp
    if (L.whatsapp) {
      $('whats-flutuante').href = linkWhats(mensagem)
      $('whats-flutuante').hidden = false
    }

    // Dados estruturados para o Google entender que é uma loja
    var diasSchema = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    var aberturas = []
    Object.keys(L.horarios || {}).forEach(function (d) {
      ;(L.horarios[d] || []).forEach(function (i) {
        aberturas.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: diasSchema[d], opens: i[0], closes: i[1] })
      })
    })
    var schema = {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: L.nome,
      image: new URL('img/vitrine.jpg', location.href).href,
      logo: new URL('img/logo.png', location.href).href,
      url: location.origin + location.pathname,
      address: {
        '@type': 'PostalAddress',
        streetAddress: (L.endereco || {}).rua,
        addressLocality: (L.endereco || {}).cidade,
        addressRegion: (L.endereco || {}).uf,
        postalCode: (L.endereco || {}).cep,
        addressCountry: 'BR',
      },
      openingHoursSpecification: aberturas,
      sameAs: L.instagram ? ['https://www.instagram.com/' + L.instagram] : [],
    }
    if (L.telefone) schema.telephone = L.telefone
    var s = document.createElement('script')
    s.type = 'application/ld+json'
    s.textContent = JSON.stringify(schema)
    document.head.appendChild(s)
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar)
  else montar()
})()
