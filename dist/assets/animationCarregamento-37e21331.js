import{S as a}from"./index-daf11ca8.js";let s=!1;function c(){return s}function p(i="Carregando",l=!0,o=!1,e){var t;if(a.isVisible()){const n=(t=a.getHtmlContainer())==null?void 0:t.querySelector(".loading h2");n&&(n.textContent=i);return}s=!1;const d=o?"Pressione ESC para cancelar e manter os dados já carregados":"Caso queira cancelar, recarregue a página";return a.fire({title:"Aguarde...",html:`
      <style>
        .loading span {
          display: inline-block;
          vertical-align: middle;
          width: .6em;
          height: .6em;
          margin: .19em;
          background: #e0dfe2;
          border-radius: .6em;
          animation: loading 1s infinite alternate;
        }
        .loading span:nth-of-type(2) { background: #e3c8ff; animation-delay: 0.3s; }
        .loading span:nth-of-type(3) { background: #d2aef7; animation-delay: 0.5s; }
        .loading span:nth-of-type(4) { background: #ba89ee; animation-delay: 0.7s; }
        .loading span:nth-of-type(5) { background: #ad65fb; animation-delay: 0.9s; }
        .loading span:nth-of-type(6) { background: #9532ff; animation-delay: 1.1s; }
        .loading span:nth-of-type(7) { background: #7b00ff; animation-delay: 1.3s; }
        @keyframes loading {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      </style>
      <div class="loading animacaoLoading">
        <h2>${i}</h2>
        <h2 id="numPagesLoading"></h2>
        <small class="${l?"d-block":"d-none"} ">${d}</small>
        <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
    `,allowOutsideClick:!1,allowEscapeKey:o,showConfirmButton:!1,customClass:{container:"custom-swal"}}).then(n=>{n.dismiss===a.DismissReason.esc&&(s=!0,e==null||e())})}const f=()=>{a.close()};export{p as a,c as b,f};
