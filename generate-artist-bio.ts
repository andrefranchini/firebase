// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview An AI agent for generating a biography of a Brazilian musical artist.
 *
 * - generateArtistBio - A function that generates an artist biography.
 * - GenerateArtistBioInput - The input type for the generateArtistBio function.
 * - GenerateArtistBioOutput - The return type for the generateArtistBio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import type { WikipediaArtistInfo } from './get-wikipedia-artist-info';

const GenerateArtistBioInputSchema = z.object({
  artistName: z.string().describe('The name of the Brazilian musical artist.'),
  artistsToExclude: z.array(z.string()).optional().describe('A list of artist names to exclude from the related artists lists.'),
  lang: z.enum(['en', 'pt']).default('en').describe('The language for the biography.'),
  wikipediaContent: z.custom<WikipediaArtistInfo>().optional().describe('Pre-fetched Wikipedia content for the artist.')
});
export type GenerateArtistBioInput = z.infer<typeof GenerateArtistBioInputSchema>;

const GenerateArtistBioOutputSchema = z.object({
  name: z.string().describe("The artist's name."),
  alternativeNames: z.array(z.string()).optional().describe('A list of alternative names or akas for the artist, including common nicknames.'),
  bioPt: z.string().optional().describe("A detailed and long biography for the artist in Brazilian Portuguese. The biography should be comprehensive, covering their career, musical style, and legacy, structured in multiple paragraphs. Use '\n' to separate the paragraphs."),
  bioEn: z.string().optional().describe("A detailed and long biography for the artist in English. The biography should be comprehensive, covering their career, musical style, and legacy, structured in multiple paragraphs. Use '\n' to separate the paragraphs."),
  isBand: z.boolean().optional().describe('Whether the artist is a band or a solo artist.'),
  birthDate: z.string().optional().describe('The birth date of the artist in YYYY-MM-DD format.'),
  deathDate: z.string().optional().describe('The death date of the artist in YYYY-MM-DD format, if applicable.'),
  yearsActiveStart: z.string().optional().describe('The start year of the band\'s activity.'),
  yearsActiveEnd: z.string().optional().describe('The end year of the band\'s activity, if applicable.'),
  genres: z.array(z.string()).describe('A list of music genres associated with the artist, in lowercase (except for acronyms).'),
  instruments: z.array(z.string()).optional().describe('A list of musical instruments associated with the artist, in lowercase.'),
  bandMembers: z.array(z.string()).optional().describe('A list of band members, if the artist is a band.'),
  mentionedArtists: z.array(z.string()).describe('A list of other BRAZILIAN musical artist names mentioned in the biography.'),
  relatedPopularArtists: z.array(z.string()).describe('A list of up to 15 popular Brazilian artists related to the main artist.'),
  relatedObscureArtists: z.array(z.string()).describe('A list of up to 15 obscure or less-known Brazilian artists related to the main artist.'),
  origin: z.object({
    city: z.string().optional(),
    state: z.string().optional().describe('The 2-character abbreviation for the Brazilian state (e.g., RJ, SP, BA).'),
  }).optional().describe('The city and state of origin for the artist or band.'),
  wikipediaUrl: z.string().optional().describe('The direct URL to the artist\'s Wikipedia page.'),
});
export type GenerateArtistBioOutput = z.infer<typeof GenerateArtistBioOutputSchema>;

export async function generateArtistBio(input: GenerateArtistBioInput): Promise<GenerateArtistBioOutput> {
  return generateArtistBioFlow(input);
}

const basePrompt = `Você é um historiador de música especializado em música brasileira. Sua tarefa é extrair e gerar informações detalhadas sobre um artista musical brasileiro, prezando sempre pela precisão e pela qualidade do conteúdo.

**Lógica de Execução Principal (REGRA MAIS IMPORTANTE):**
Sua primeira e mais importante tarefa é verificar se o conteúdo da Wikipedia foi fornecido abaixo.

* **CAMINHO 1: Se o bloco \`<wikipedia_content>\` EXISTE:**
    * Isso é uma **CONFIRMAÇÃO ABSOLUTA** de que o artista {{artistName}} é real e válido. Não questione sua existência.
    * Trate o conteúdo fornecido como a **PRINCIPAL FONTE DE VERDADE** e o ponto de partida para sua análise.
    * Você está autorizado e encorajado a usar seu conhecimento interno para **enriquecer, complementar e melhorar** as informações encontradas no texto da Wikipedia. O objetivo é criar a biografia mais completa e precisa possível.
    * **Regra de Prioridade:** Se houver uma discrepância entre o conteúdo fornecido e seu conhecimento, **dê prioridade às informações do bloco \`<wikipedia_content>\`**.
    * **Regra de Segurança:** É fundamental que qualquer informação adicionada seja factual e correta. **NÃO INVENTE DADOS.** Na dúvida entre adicionar uma informação ou manter a precisão, sempre escolha a precisão.

* **CAMINHO 2: Se e SOMENTE SE o bloco \`<wikipedia_content>\` NÃO EXISTE:**
    * Use seu próprio conhecimento e capacidade de busca para verificar se {{artistName}} é um artista musical brasileiro conhecido.
    * Se você não encontrar nenhuma informação confiável, interrompa o processo e retorne uma resposta com todos os campos vazios.

---

**Artista Alvo:** {{artistName}}

{{#if wikipediaContent}}
<wikipedia_content>
  <extract>
    {{{wikipediaContent.extract}}}
  </extract>
  <categories>
    {{#each wikipediaContent.categories}}
      - {{{this}}}
    {{/each}}
  </categories>
  <external_links>
    {{#each wikipediaContent.extlinks}}
      - {{{this}}}
    {{/each}}
  </external_links>
</wikipedia_content>
{{/if}}

---

**Instruções Detalhadas de Preenchimento:**
Com base no caminho lógico decidido acima (usando o conteúdo fornecido como base e enriquecendo-o, se aplicável), preencha os seguintes campos:

1.  **Nomes:** Analise o conteúdo e seu conhecimento para encontrar o nome canônico do artista e quaisquer apelidos ou nomes alternativos (AKAs). Preencha o campo \`alternativeNames\`.
2.  **Tipo de Artista:** Determine se é uma banda ou um artista solo e defina o campo \`isBand\` como \`true\` ou \`false\`.
3.  **Origem:** Forneça o local de origem nos campos \`city\` e \`state\` (use a abreviação de 2 caracteres, ex: RJ, SP, BA). Extraia isso do texto ou das categorias (ex: "Naturais de Belo Horizonte").
4.  **Datas (Solo):** Se for um artista solo (\`isBand: false\`), preencha \`birthDate\` e \`deathDate\` (se aplicável).
5.  **Datas (Banda):** Se for uma banda (\`isBand: true\`), preencha \`yearsActiveStart\`, \`yearsActiveEnd\` (se aplicável), e uma lista de \`bandMembers\`.
6.  **Biografia:** Gere uma biografia original e envolvente no idioma \`{{bioLang}}\`, usando os fatos mais importantes do conteúdo e complementando com seu conhecimento. **Não copie o texto da Wikipedia.** Use \`\n\` para quebras de parágrafo. A biografia **DEVE OBRIGATORIAMENTE** mencionar pelo menos um outro artista ou banda musical brasileiro relacionado.
7.  **Taxonomia:** A lista de \`genres\` e \`instruments\` deve estar em letras minúsculas, exceto para acrônimos (ex: MPB).
8.  **Menções:** Identifique **TODOS** os artistas ou bandas brasileiros mencionados no texto da biografia e liste-os em \`mentionedArtists\`.
9.  **Artistas Relacionados:** Forneça duas listas de artistas e bandas **brasileiros** relacionados:
    * \`relatedPopularArtists\`: Até 15 artistas populares com forte conexão estilística, de gênero ou histórica.
    * \`relatedObscureArtists\`: Até 15 artistas menos conhecidos ('lado-b') que sejam musicalmente relevantes.
    * É mandatório fornecer pelo menos 3 artistas em cada lista, se possível, com base na análise de gênero e colaboradores. Não invente nomes.
    * {{#if artistsToExclude}}
    **EXCLUSÃO:** Não inclua nenhum dos seguintes artistas nas listas de relacionados: {{#each artistsToExclude}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
    {{/if}}

**Lembrete Crítico Final:** Se o conteúdo da Wikipedia foi fornecido, use-o como a base de confiança para sua resposta. Sua tarefa é processar esses dados, enriquecê-los com fatos verificáveis e entregar o resultado mais completo e preciso possível.`;

const generateArtistBioFlow = ai.defineFlow(
  {
    name: 'generateArtistBioFlow',
    inputSchema: GenerateArtistBioInputSchema,
    outputSchema: GenerateArtistBioOutputSchema,
  },
  async (input) => {
    
    let wikipediaUrl: string | undefined = undefined;
    if (input.wikipediaContent?.title) {
        wikipediaUrl = `https://pt.wikipedia.org/wiki/${encodeURIComponent(input.wikipediaContent.title.replace(/ /g, '_'))}`;
    }
    
    const bioLangText = input.lang === 'pt' ? 'português do Brasil' : 'Inglês';

    const dynamicOutputSchema = GenerateArtistBioOutputSchema.extend({
      bioPt: GenerateArtistBioOutputSchema.shape.bioPt.describe(
        input.lang === 'pt' 
          ? "A detailed and long biography for the artist in Brazilian Portuguese. The biography should be comprehensive, covering their career, musical style, and legacy, structured in multiple paragraphs. Use '\n' to separate the paragraphs." 
          : "Leave this field empty."
      ),
      bioEn: GenerateArtistBioOutputSchema.shape.bioEn.describe(
        input.lang === 'en' 
          ? "A detailed and long biography for the artist in English. The biography should be comprehensive, covering their career, musical style, and legacy, structured in multiple paragraphs. Use '\n' to separate the paragraphs." 
          : "Leave this field empty."
      ),
    }).omit({ wikipediaUrl: true });
    
    const cleanWikipediaContent = input.wikipediaContent
      ? {
          extract: input.wikipediaContent.extract,
          categories: input.wikipediaContent.categories,
          extlinks: input.wikipediaContent.extlinks,
        }
      : null;

    // Manually construct the prompt string for simplicity
    let finalPrompt = basePrompt.replace('{{artistName}}', input.artistName);
    finalPrompt = finalPrompt.replace('{{bioLang}}', bioLangText);

    if (input.artistsToExclude && input.artistsToExclude.length > 0) {
        const excludeList = input.artistsToExclude.join(', ');
        finalPrompt = finalPrompt.replace(/\{\{#if artistsToExclude\}\}(.|\n)*?\{\{\/if\}\}/, `**EXCLUSÃO:** Não inclua nenhum dos seguintes artistas nas listas de relacionados: ${excludeList}.`);
    } else {
        finalPrompt = finalPrompt.replace(/\{\{#if artistsToExclude\}\}(.|\n)*?\{\{\/if\}\}/, '');
    }

    if (cleanWikipediaContent) {
        let wikiBlock = `<wikipedia_content>\n<extract>\n${cleanWikipediaContent.extract}\n</extract>\n`;
        if (cleanWikipediaContent.categories) {
            wikiBlock += `<categories>\n${cleanWikipediaContent.categories.map(c => `- ${c}`).join('\n')}\n</categories>\n`;
        }
        if (cleanWikipediaContent.extlinks) {
            wikiBlock += `<external_links>\n${cleanWikipediaContent.extlinks.map(l => `- ${l}`).join('\n')}\n</external_links>\n`;
        }
        wikiBlock += `</wikipedia_content>`;
        finalPrompt = finalPrompt.replace(/\{\{#if wikipediaContent\}\}(.|\n)*?\{\{\/if\}\}/, wikiBlock);
    } else {
        finalPrompt = finalPrompt.replace(/\{\{#if wikipediaContent\}\}(.|\n)*?\{\{\/if\}\}/, '');
    }

    const { output } = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: finalPrompt,
        output: { schema: dynamicOutputSchema },
        config: {
            tools: [{ googleSearch: {} }],
        },
    });
        
    return {
        ...output!,
        wikipediaUrl,
    };
  }
);
