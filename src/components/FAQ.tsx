import React from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Como é entregue o código-fonte dos sistemas após a compra?",
    answer: "A entrega é 100% automática e imediata. Logo após a aprovação do pagamento, você receberá um e-mail contendo os detalhes de acesso à nossa área do cliente, onde poderá baixar o arquivo compactado (.zip) do código-fonte e acessar os links dos repositórios do GitHub."
  },
  {
    question: "Posso revender os sistemas com a minha própria marca (White Label)?",
    answer: "Sim! Todos os nossos códigos-fontes são comercializados com licença comercial livre/whitelabel. Isso significa que você pode renomear o sistema, alterar logos, cores, precificação e revender para seus próprios clientes ou cobrar assinaturas mensais sem precisar pagar royalties."
  },
  {
    question: "Preciso pagar alguma taxa recorrente ou mensalidade pela licença?",
    answer: "Não. A compra do código-fonte em nosso marketplace é de pagamento único. Uma vez adquirido, o sistema é seu para sempre, sem nenhuma cobrança oculta de licença mensal ou anual."
  },
  {
    question: "Vocês oferecem suporte para instalação e configuração dos sistemas?",
    answer: "Com certeza. Todos os produtos contam com uma documentação técnica completa e tutoriais passo a passo em vídeo ensinando como configurar o banco de dados, configurar variáveis de ambiente e realizar o deploy em servidores de nuvem de baixo custo (como Render, Railway e VPS)."
  },
  {
    question: "Os sistemas possuem atualizações e correções de segurança?",
    answer: "Sim. Sempre que atualizamos um código-fonte para corrigir eventuais problemas ou adicionar novas funcionalidades, a nova versão fica disponível gratuitamente para download na área do cliente de forma vitalícia."
  },
  {
    question: "Quais são as formas de pagamento aceitas?",
    answer: "Aceitamos pagamentos via PIX com aprovação instantânea e Cartão de Crédito com parcelamento em até 12x. Ambos os métodos são processados de forma 100% segura através de gateways líderes de mercado."
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 relative">
      
      {/* Title */}
      <div className="flex flex-col items-center text-center space-y-3 mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-xs font-semibold text-brand-orange uppercase">
          <HelpCircle size={12} className="text-brand-orange" />
          <span>Dúvidas Frequentes</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
          Perguntas <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-orange to-brand-neonOrange font-black">Frequentes</span>
        </h2>
        <p className="text-sm text-white/50">
          Tudo o que você precisa saber sobre o funcionamento do marketplace e licenças whitelabel.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen 
                  ? 'bg-brand-darkGray/40 border-brand-orange/25 shadow-neon-orange/5' 
                  : 'bg-brand-darkGray/15 border-white/5 hover:border-white/10'
              }`}
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none transition-all duration-300"
              >
                <span className="text-sm sm:text-base font-bold text-white pr-4">
                  {item.question}
                </span>
                <span className={`p-1.5 rounded-xl bg-white/5 text-white/60 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-orange bg-brand-orange/10' : ''}`}>
                  <ChevronDown size={16} />
                </span>
              </button>
              
              {/* Answer Drawer */}
              <div 
                className={`transition-all duration-500 ease-in-out ${
                  isOpen ? 'max-h-[300px] border-t border-white/5' : 'max-h-0'
                } overflow-hidden`}
              >
                <p className="p-5 text-xs sm:text-sm text-white/60 leading-relaxed bg-brand-black/20">
                  {item.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
};
