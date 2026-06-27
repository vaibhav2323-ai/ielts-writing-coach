"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Search, X, Lightbulb } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Band = 8 | 9;
type Linker = { phrase: string; meaning: string; band: Band; band8: string; band9: string; tip: string };
type Category = { name: string; linkers: Linker[] };

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    name: "Addition",
    linkers: [
      { phrase: "Furthermore", meaning: "In addition to what has already been said; used to add a stronger or more important point.", band: 8, band8: "The government has increased education funding. Furthermore, it has introduced stricter quality controls in schools.", band9: "The proliferation of digital technology has transformed communication patterns. Furthermore, it has fundamentally altered the cognitive processes by which younger generations acquire and retain knowledge.", tip: "Place at the start of a sentence to introduce a point of equal or greater importance than the previous one. Avoid using in every paragraph." },
      { phrase: "Moreover", meaning: "As a further matter; besides; introduces an additional and often stronger point.", band: 8, band8: "Public transport reduces traffic congestion. Moreover, it significantly lowers carbon emissions in urban areas.", band9: "Renewable energy sources offer a viable alternative to fossil fuels. Moreover, their long-term economic viability surpasses that of conventional energy production once initial infrastructure costs are amortised.", tip: "Interchangeable with 'furthermore' but slightly more emphatic. Best used when the new point reinforces or intensifies the previous argument." },
      { phrase: "In addition", meaning: "As well as; used to introduce an extra point that supports the argument.", band: 8, band8: "Exercise improves physical health. In addition, it has well-documented benefits for mental wellbeing.", band9: "Urbanisation generates significant economic opportunities for rural migrants. In addition, it fosters cultural exchange and accelerates the diffusion of innovations across previously isolated communities.", tip: "Can appear mid-sentence as 'in addition to [noun]' or at the sentence start followed by a comma. Very common in Task 1 for adding data observations." },
      { phrase: "Additionally", meaning: "As an extra factor; a single-word alternative to 'in addition'.", band: 8, band8: "The new policy reduces costs. Additionally, it streamlines administrative processes across all departments.", band9: "Mass incarceration disproportionately affects low-income communities. Additionally, it perpetuates intergenerational cycles of poverty by limiting the economic prospects of offenders' dependants.", tip: "Works well as a paragraph opener, especially in Task 2 body paragraphs. Slightly more formal than 'also'." },
      { phrase: "What is more", meaning: "More importantly; used to introduce an additional point that the writer considers even more significant.", band: 9, band8: "Remote work saves commuting time. What is more, it allows employees to achieve a healthier work-life balance.", band9: "Globalisation has accelerated the transfer of capital across borders. What is more, it has irrevocably eroded the capacity of individual nation-states to regulate their own economies in isolation.", tip: "More emphatic than 'moreover'. Reserve for your strongest additional point. Sounds sophisticated and is rarely overused by IELTS candidates." },
      { phrase: "Not only … but also", meaning: "Used to emphasise that two things are true simultaneously, adding rhetorical weight.", band: 9, band8: "Deforestation not only destroys wildlife habitats but also contributes to rising atmospheric carbon dioxide levels.", band9: "The commodification of education not only undermines its intrinsic social purpose but also entrenches systemic inequality by privileging those with the financial means to access elite institutions.", tip: "When 'not only' opens a sentence, invert the subject and auxiliary verb: 'Not only does it reduce costs, but it also…'. This inversion pattern is a hallmark of Band 9 writing." },
      { phrase: "Coupled with", meaning: "Combined with; shows that two factors work together to produce an effect.", band: 9, band8: "Rising temperatures, coupled with prolonged drought, have devastated agricultural output in the region.", band9: "The exponential growth of social media platforms, coupled with the erosion of traditional gatekeeping mechanisms in journalism, has created an environment in which misinformation proliferates at an unprecedented rate.", tip: "Excellent for combining two causes in Task 1 trend descriptions or Task 2 problem analyses. Follows a noun phrase, not a clause." },
      { phrase: "Alongside", meaning: "At the same time as; in combination with another factor or action.", band: 8, band8: "The government launched a recycling campaign. Alongside this, it imposed penalties on companies that fail to meet waste reduction targets.", band9: "Alongside the documented environmental benefits of veganism, compelling evidence suggests that plant-based diets confer measurable reductions in the incidence of cardiovascular disease and type-2 diabetes.", tip: "Useful for showing simultaneous policies or trends in Task 1. Can also be used mid-sentence: 'economic growth alongside environmental degradation'." },
    ],
  },
  {
    name: "Contrast",
    linkers: [
      { phrase: "However", meaning: "Despite what has just been said; introduces a contrasting or opposing idea.", band: 8, band8: "Nuclear energy is efficient. However, the risks associated with radioactive waste remain a serious concern.", band9: "Proponents of artificial intelligence contend that automation will create new categories of employment. However, mounting empirical evidence suggests that the pace of job displacement significantly outstrips the rate of new role creation.", tip: "The most versatile contrast linker. Use it to open a concession or counterargument paragraph. Always follow with a comma." },
      { phrase: "Nevertheless", meaning: "In spite of that; despite the circumstances mentioned, the following point still holds.", band: 9, band8: "The project exceeded its budget. Nevertheless, it delivered results that far exceeded initial expectations.", band9: "Critics rightly point to the social costs of rapid industrialisation. Nevertheless, the historical evidence overwhelmingly demonstrates that sustained economic development remains the most reliable pathway out of systemic poverty.", tip: "Stronger than 'however'. Signals that despite a valid objection, the writer's position stands. Ideal for concession paragraphs in opinion essays." },
      { phrase: "On the other hand", meaning: "Used to introduce the contrasting side of an argument; signals a balanced discussion.", band: 8, band8: "Studying abroad broadens a student's cultural horizon. On the other hand, it can create significant financial and emotional strain.", band9: "Stringent immigration controls arguably protect domestic labour markets from wage depression. On the other hand, a compelling body of economic research demonstrates that skilled migration generates net fiscal benefits that outweigh any displacement effects.", tip: "Must be preceded by 'On one hand' earlier in the paragraph for structural balance. Essential in Discussion Essay body paragraphs." },
      { phrase: "In contrast", meaning: "When compared with the previous point, this is noticeably different; highlights a sharp difference.", band: 8, band8: "Developed nations have largely stable birth rates. In contrast, many developing countries continue to experience rapid population growth.", band9: "Authoritarian governance systems prioritise economic efficiency and social stability at the expense of individual freedoms. In contrast, liberal democracies, while less efficient in decision-making, demonstrate a superior capacity for long-term adaptive resilience.", tip: "Particularly effective in Task 1 when comparing two data sets, time periods, or groups. Can also appear mid-sentence: 'X, in contrast to Y, …'." },
      { phrase: "Whereas", meaning: "While on the contrary; directly contrasts two parallel ideas within a single sentence.", band: 8, band8: "Urban areas tend to have higher living costs, whereas rural communities generally offer more affordable housing.", band9: "Traditional pedagogical models position the educator as the primary arbiter of knowledge, whereas contemporary constructivist approaches conceive of learning as a collaborative, student-centred process of meaning-making.", tip: "Connects two clauses within one sentence. The two clauses should have grammatically parallel structures. Very effective in Task 1 for comparing categories." },
      { phrase: "Conversely", meaning: "Introducing the opposite idea; when the preceding situation is reversed.", band: 9, band8: "Higher taxes can deter foreign investment. Conversely, tax incentives have been shown to attract significant inflows of overseas capital.", band9: "Protectionist trade policies may offer short-term relief to domestic manufacturers facing intense foreign competition. Conversely, the empirical consensus among economists strongly favours liberalised trade as the primary driver of long-run productivity growth.", tip: "More sophisticated than 'on the other hand'. Implies a direct logical reversal rather than a simple contrast. Excellent for double-question essays." },
      { phrase: "While", meaning: "Although; at the same time as — introduces a contrasting or simultaneous idea.", band: 8, band8: "While online learning offers flexibility, it lacks the social interaction that traditional classrooms provide.", band9: "While it is undeniable that economic globalisation has lifted millions out of absolute poverty, a growing corpus of sociological evidence suggests that it has simultaneously exacerbated relative inequality within nations.", tip: "Can open a sentence to acknowledge the opposing view before stating your own. When used this way, it functions as a concession device. Followed by a comma when at sentence start." },
    ],
  },
  {
    name: "Cause",
    linkers: [
      { phrase: "Due to", meaning: "Because of; caused by. Followed by a noun phrase, not a clause.", band: 8, band8: "Many species face extinction due to the destruction of their natural habitats.", band9: "The sharp decline in social mobility observed across OECD nations is largely attributable to structural inequalities in educational access, exacerbated due to decades of underinvestment in state schooling.", tip: "Always followed by a noun or gerund phrase, never a full clause with a subject and verb. Incorrect: 'due to they cut funding'. Correct: 'due to funding cuts'." },
      { phrase: "Owing to", meaning: "Because of; as a result of. Slightly more formal than 'due to'.", band: 9, band8: "Owing to rising fuel prices, many households are struggling to meet their energy bills.", band9: "Owing to the compounding effects of systemic corruption and chronic underinvestment in public infrastructure, several emerging economies have failed to translate their resource wealth into sustainable human development.", tip: "More formal than 'due to' and preferred in academic writing. Like 'due to', it must be followed by a noun phrase. An excellent way to open a cause explanation in Task 2." },
      { phrase: "As a result of", meaning: "Because of; following as a consequence of a prior action or condition.", band: 8, band8: "As a result of the new legislation, companies are required to reduce their plastic packaging by 50%.", band9: "As a result of the accelerating integration of algorithmic decision-making into judicial systems, fundamental questions about accountability, transparency, and the right to a fair hearing have moved to the centre of legal scholarship.", tip: "Can appear at the start or middle of a sentence. Followed by a noun phrase. More specific than 'because of' and preferred in formal analytical writing." },
      { phrase: "Given that", meaning: "Taking into account the fact that; since.", band: 9, band8: "Given that global temperatures have risen by over 1°C since the industrial revolution, urgent action is required.", band9: "Given that the scientific consensus on anthropogenic climate change has remained robust for over three decades, the continued prioritisation of short-term economic growth over environmental sustainability represents a profound failure of intergenerational responsibility.", tip: "Excellent for introducing a premise before drawing a conclusion. Positions the cause as an acknowledged, established fact rather than a contested claim." },
      { phrase: "In light of", meaning: "Because of; taking into consideration new information or evidence.", band: 9, band8: "In light of recent research, the government has revised its guidelines on sugar consumption.", band9: "In light of the overwhelming evidence linking particulate matter from diesel engines to elevated rates of respiratory disease, the continued subsidisation of the fossil fuel industry constitutes a direct contradiction of public health policy objectives.", tip: "Implies that a cause or new evidence has prompted a reconsideration or response. More nuanced than 'because of'. Particularly effective in the introduction or when pivoting an argument." },
    ],
  },
  {
    name: "Effect",
    linkers: [
      { phrase: "Therefore", meaning: "For that reason; as a logical result of what has been stated.", band: 8, band8: "The river is severely polluted. Therefore, the local government has banned fishing in the area.", band9: "The empirical evidence overwhelmingly supports the conclusion that early childhood intervention programmes yield substantial long-term benefits. Therefore, sustained public investment in pre-school education must be regarded as a fiscal priority rather than a discretionary expenditure.", tip: "One of the most common result linkers. Signals a logical conclusion. Can follow a semicolon: 'The data is clear; therefore, action is needed.'" },
      { phrase: "Consequently", meaning: "As a result; used to show that something happened as a direct result of something else.", band: 8, band8: "The company failed to adapt to digital trends. Consequently, it lost a significant portion of its market share.", band9: "The progressive dismantling of trade barriers since the mid-twentieth century has dramatically lowered the cost of consumer goods. Consequently, living standards in both developed and developing nations have risen substantially, even as aggregate income inequality has widened.", tip: "More formal than 'as a result'. Particularly effective at the start of a concluding or result sentence in a cause-effect Task 2 essay." },
      { phrase: "As a result", meaning: "Because of a cause that has just been described; shows the outcome.", band: 8, band8: "Governments increased spending on renewable energy. As a result, the cost of solar panels has fallen dramatically.", band9: "The rapid displacement of manufacturing employment by automation has created structural unemployment in regions historically dependent on industrial production. As a result, entire communities have been rendered economically marginalised, with cascading social consequences.", tip: "Very versatile and natural-sounding. Can begin a sentence or follow a semicolon. Slightly less formal than 'consequently'. Excellent in both Task 1 and Task 2." },
      { phrase: "Hence", meaning: "For this reason; as a result — formal and concise.", band: 9, band8: "Demand for organic produce has risen sharply. Hence, farmers are increasingly transitioning to sustainable agricultural practices.", band9: "The cognitive load imposed by multitasking demonstrably impairs decision-making quality and increases error rates; hence, the widespread expectation that knowledge workers remain perpetually reachable via digital devices represents a structurally flawed approach to productivity management.", tip: "Very concise and academic. Often used without 'therefore'. Can follow a semicolon. Overused in student writing — use sparingly for maximum impact." },
      { phrase: "This leads to", meaning: "This causes or produces; shows a direct causal chain from one event to the next.", band: 8, band8: "Heavy traffic increases fuel consumption. This leads to higher levels of air pollution in city centres.", band9: "The systematic exclusion of women from senior leadership positions deprives organisations of diverse cognitive perspectives. This leads to strategic blind spots and a diminished capacity for the kind of creative problem-solving that drives sustained competitive advantage.", tip: "Excellent for building cause-effect chains, particularly in 'Causes and Effects' or 'Problems and Solutions' essays. Can be extended: 'This leads to … which in turn leads to …'." },
    ],
  },
  {
    name: "Opinion",
    linkers: [
      { phrase: "I would argue that", meaning: "I believe and wish to defend the position that; presents an argument the writer is prepared to justify.", band: 8, band8: "I would argue that governments bear the primary responsibility for tackling climate change through legislation.", band9: "I would argue that the reduction of complex socioeconomic phenomena to individual moral failing represents a fundamental analytical error that obstructs the development of effective structural policy responses.", tip: "More nuanced than 'I think' or 'I believe'. Implies you have reasons and evidence. Ideal for the thesis statement in opinion essays." },
      { phrase: "In my view", meaning: "According to my opinion; a direct, concise way to state a personal position.", band: 8, band8: "In my view, public transport should be free for all citizens, funded through general taxation.", band9: "In my view, the designation of mental health treatment as a luxury rather than a fundamental healthcare right reflects a deeply embedded societal stigma that materially impairs both individual flourishing and macroeconomic productivity.", tip: "Clean, direct, and widely accepted in IELTS Task 2. Best placed in the introduction or conclusion. Avoid repeating it more than twice per essay." },
      { phrase: "It is my contention that", meaning: "My argued position is that; introduces a claim the writer intends to defend throughout the essay.", band: 9, band8: "It is my contention that a universal basic income would provide a vital safety net in an era of increasing automation.", band9: "It is my contention that the uncritical adoption of standardised testing as the primary metric of educational quality has systematically distorted pedagogical priorities and undermined the broader humanistic aims of education.", tip: "Very formal and forceful. Excellent for thesis statements in opinion essays. Signals to the examiner that you are about to make a sustained, reasoned argument." },
      { phrase: "It is widely acknowledged that", meaning: "Most people or experts recognise and accept that; signals a broadly accepted position.", band: 9, band8: "It is widely acknowledged that regular physical exercise reduces the risk of chronic diseases significantly.", band9: "It is widely acknowledged that the most profound constraint on global poverty reduction is not the scarcity of financial resources but the inadequacy of institutional frameworks and governance structures that determine how those resources are deployed.", tip: "Implies you are citing a consensus view rather than a personal opinion. Be sure the claim you make after this phrase is genuinely well-supported — examiners penalise overclaiming." },
    ],
  },
  {
    name: "Example",
    linkers: [
      { phrase: "For example", meaning: "To illustrate the point just made; introduces a specific instance.", band: 8, band8: "Many countries have achieved economic success without sacrificing environmental standards. For example, Denmark generates over 60% of its electricity from wind power.", band9: "The assumption that economic development necessarily entails environmental degradation is contradicted by a growing number of counter-examples. For example, Costa Rica has achieved near-complete reliance on renewable energy while sustaining robust GDP growth.", tip: "The most common and versatile example linker. Always follow with a comma. Do not use at the start of a paragraph — only after a claim has been made." },
      { phrase: "For instance", meaning: "As an example of what has been said; interchangeable with 'for example'.", band: 8, band8: "Several cities have reduced car usage through innovative urban design. For instance, Amsterdam has built over 800 kilometres of dedicated cycling infrastructure.", band9: "The empirical case for early childhood cognitive stimulation is compelling. For instance, longitudinal studies from the United States demonstrate that high-quality pre-school programmes produce measurable gains in academic attainment that persist well into adulthood.", tip: "Essentially identical to 'for example'. Alternate between the two within an essay to avoid repetition. Both are followed by a comma." },
      { phrase: "A case in point is", meaning: "A relevant and clear example of the point being made.", band: 9, band8: "Technology companies have grown enormously in a short time. A case in point is Apple, which became the world's first trillion-dollar company.", band9: "The failure of purely market-based approaches to deliver universal healthcare is illustrated across numerous high-income nations. A case in point is the United States, which spends nearly twice as much per capita on healthcare as comparable OECD nations while achieving markedly worse population health outcomes.", tip: "More sophisticated and specific than 'for example'. Implies the example is not only relevant but particularly apt or compelling. Excellent for Task 2 essays with specific country or company examples." },
      { phrase: "As demonstrated by", meaning: "As shown clearly through evidence from the following example.", band: 9, band8: "Vaccination programmes are highly effective, as demonstrated by the global eradication of smallpox in 1980.", band9: "The positive spillover effects of public investment in basic science are substantial, as demonstrated by the ARPANET project — a defence-funded research programme that ultimately gave rise to the commercial internet.", tip: "Places emphasis on the demonstrative power of the example. Implies the example constitutes strong evidence, not merely an illustration. Excellent in analytical essays." },
    ],
  },
  {
    name: "Conclusion",
    linkers: [
      { phrase: "In conclusion", meaning: "To finish; used to signal that the essay is ending and a summary follows.", band: 8, band8: "In conclusion, it is clear that governments and individuals must both play a role in combating climate change.", band9: "In conclusion, while the case for economic globalisation rests on a robust empirical foundation, its social and political costs demand institutional responses that current governance frameworks have demonstrably failed to provide.", tip: "The standard conclusion opener for IELTS Task 2. Never introduce new arguments after 'in conclusion'. Follow with a restatement of your thesis, not a copy of it." },
      { phrase: "Overall", meaning: "Taking everything into consideration; provides a general summing up.", band: 8, band8: "Overall, the benefits of remote work appear to outweigh the challenges for most knowledge workers.", band9: "Overall, a dispassionate assessment of the available evidence leads to the inescapable conclusion that voluntary corporate self-regulation is structurally incapable of producing the scale of behavioural change that the climate emergency demands.", tip: "Versatile conclusion word. Can also open a Task 1 overview paragraph — the overview is the most important paragraph in Task 1 and should begin with 'Overall' or 'In general'." },
      { phrase: "In the final analysis", meaning: "When all aspects have been considered; ultimately.", band: 9, band8: "In the final analysis, the success of any education system depends on the quality of its teachers.", band9: "In the final analysis, the persistent failure to address structural determinants of health — poverty, housing insecurity, and educational inequality — reveals the fundamental limitations of a purely biomedical conception of public health.", tip: "Elegant and sophisticated. Implies thorough consideration. Excellent final paragraph opener for opinion essays where you are delivering a considered verdict." },
      { phrase: "Taking everything into account", meaning: "Having considered all the relevant factors and evidence.", band: 9, band8: "Taking everything into account, the advantages of nuclear power seem to outweigh its risks when proper safety protocols are followed.", band9: "Taking everything into account, it becomes evident that the tension between economic growth and environmental sustainability is not a binary trade-off but a complex policy design challenge that demands integrated, systems-level thinking.", tip: "Signals comprehensive consideration before delivering a verdict. Particularly effective in discussion and advantage/disadvantage essays where balance is expected." },
    ],
  },
  {
    name: "Concession",
    linkers: [
      { phrase: "Although", meaning: "Even though; despite the fact that — introduces a concession before a main point.", band: 8, band8: "Although nuclear energy produces no direct carbon emissions, the management of radioactive waste remains a serious long-term challenge.", band9: "Although the empirical case for free trade is well-established at the macroeconomic level, the distributional consequences of import competition have been sufficiently severe in specific communities to generate the political backlash that has powered recent protectionist movements.", tip: "The concession clause comes first, followed by the main clause after the comma. The main clause always contains the writer's primary position." },
      { phrase: "Despite", meaning: "Regardless of; without being prevented by. Followed by a noun phrase or gerund, not a clause.", band: 8, band8: "Despite significant advances in renewable technology, fossil fuels still account for over 80% of global energy supply.", band9: "Despite the proliferation of international human rights instruments since the mid-twentieth century, systematic violations continue to occur with impunity in numerous jurisdictions, exposing the profound limitations of a governance architecture that prioritises sovereignty over accountability.", tip: "Always followed by a noun or gerund — NOT a full clause. Incorrect: 'Despite they made progress…'. Correct: 'Despite making progress…' or 'Despite the progress made…'." },
      { phrase: "Admittedly", meaning: "It is true that; I concede that — acknowledges a point that may weaken your argument.", band: 9, band8: "Admittedly, the initial cost of transitioning to renewable energy is substantial. However, the long-term savings significantly outweigh this investment.", band9: "Admittedly, the evidence linking social media usage to adolescent mental health deterioration is correlational rather than unambiguously causal. This epistemic limitation does not, however, vitiate the case for precautionary regulatory intervention given the stakes involved.", tip: "Acknowledges the strongest version of the opposing argument, which makes your own position appear more balanced and credible. Examiners reward this nuance. Always follow with 'however' or 'nevertheless'." },
      { phrase: "Notwithstanding", meaning: "Despite; in spite of. A highly formal and precise academic term for concession.", band: 9, band8: "Notwithstanding the considerable financial costs, the transition to a low-carbon economy is both necessary and achievable.", band9: "Notwithstanding the genuine advances in poverty reduction attributable to market-led globalisation, the structural asymmetries that characterise the international trading system continue to systematically disadvantage the least developed economies.", tip: "The most formal concession preposition available. Can precede either a noun phrase or a clause ('notwithstanding the fact that…'). Signals exceptional vocabulary range. Use once per essay for maximum impact." },
    ],
  },
];

const TAB_NAMES = CATEGORIES.map((c) => c.name);

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  }
  return (
    <button onClick={handleCopy}
      className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-md transition-colors"
      style={{ background: copied ? "rgba(34,197,94,0.12)" : "#1a1a1a", color: copied ? "#4ade80" : "#666", border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "#2a2a2a"}` }}>
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ─── Band badge ───────────────────────────────────────────────────────────────

function BandBadge({ band }: { band: Band }) {
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{
      background: band === 9 ? "rgba(245,158,11,0.12)" : "rgba(139,92,246,0.12)",
      color: band === 9 ? "#fbbf24" : "#a78bfa",
      borderColor: band === 9 ? "rgba(245,158,11,0.3)" : "rgba(139,92,246,0.3)",
    }}>Band {band}</span>
  );
}

// ─── Linker card ─────────────────────────────────────────────────────────────

function LinkerCard({ linker }: { linker: Linker }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
      className="rounded-lg p-5" style={{ background: "#111111", border: "1px solid #222222" }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-base font-bold text-white">{linker.phrase}</span>
          <BandBadge band={linker.band} />
        </div>
        <CopyButton text={linker.phrase} />
      </div>

      <p className="text-xs leading-relaxed mb-4" style={{ color: "#888" }}>{linker.meaning}</p>

      <div className="space-y-2.5 mb-4">
        <div className="rounded-lg px-3.5 py-2.5" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#a78bfa", opacity: 0.8 }}>Band 8 Example</p>
          <p className="text-xs leading-relaxed italic" style={{ color: "#ccc" }}>&ldquo;{linker.band8}&rdquo;</p>
        </div>
        <div className="rounded-lg px-3.5 py-2.5" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#fbbf24", opacity: 0.8 }}>Band 9 Example</p>
          <p className="text-xs leading-relaxed italic" style={{ color: "#ccc" }}>&ldquo;{linker.band9}&rdquo;</p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg px-3.5 py-2.5" style={{ background: "rgba(79,70,229,0.06)", border: "1px solid rgba(79,70,229,0.15)" }}>
        <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" style={{ color: "#4F46E5" }} />
        <p className="text-xs leading-relaxed" style={{ color: "#888" }}>{linker.tip}</p>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LinkersPage() {
  const [activeTab, setActiveTab] = useState(TAB_NAMES[0]);
  const [search, setSearch] = useState("");
  const [bandFilter, setBandFilter] = useState<"all" | "8" | "9">("all");

  const allLinkers = useMemo(() => CATEGORIES.flatMap((c) => c.linkers), []);

  const displayedLinkers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q) {
      return allLinkers.filter((l) => {
        const matchesBand = bandFilter === "all" || String(l.band) === bandFilter;
        const matchesSearch = l.phrase.toLowerCase().includes(q) || l.meaning.toLowerCase().includes(q) || l.tip.toLowerCase().includes(q);
        return matchesBand && matchesSearch;
      });
    }
    const category = CATEGORIES.find((c) => c.name === activeTab);
    if (!category) return [];
    return category.linkers.filter((l) => bandFilter === "all" || String(l.band) === bandFilter);
  }, [activeTab, search, bandFilter, allLinkers]);

  const isSearching = search.trim().length > 0;

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white mb-0.5" style={{ letterSpacing: "-0.02em" }}>Linkers & Connectives</h1>
        <p className="text-sm" style={{ color: "#888" }}>
          {CATEGORIES.reduce((acc, c) => acc + c.linkers.length, 0)} linkers across {CATEGORIES.length} categories — Band 8 &amp; 9 level
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "#555" }} />
          <input type="text" placeholder="Search any linker or meaning…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder:text-[#444] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            style={{ background: "#111111", border: "1px solid #222222" }} />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#555" }}>
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex rounded-lg overflow-hidden shrink-0" style={{ border: "1px solid #222222" }}>
          {(["all", "8", "9"] as const).map((b) => (
            <button key={b} onClick={() => setBandFilter(b)}
              className="px-3 py-2 text-xs font-semibold transition-colors"
              style={{ background: bandFilter === b ? "#4F46E5" : "#111111", color: bandFilter === b ? "white" : "#555" }}>
              {b === "all" ? "All" : `Band ${b}`}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      {!isSearching && (
        <div className="flex flex-wrap gap-1.5 mb-6 pb-4" style={{ borderBottom: "1px solid #222222" }}>
          {TAB_NAMES.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                background: activeTab === tab ? "#4F46E5" : "#111111",
                color: activeTab === tab ? "white" : "#888",
                border: activeTab === tab ? "none" : "1px solid #222222",
              }}>
              {tab}
            </button>
          ))}
        </div>
      )}

      {isSearching && (
        <p className="text-xs mb-4" style={{ color: "#555" }}>
          {displayedLinkers.length} result{displayedLinkers.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
        </p>
      )}

      {/* Cards grid */}
      <AnimatePresence mode="wait">
        {displayedLinkers.length > 0 ? (
          <motion.div key={isSearching ? `search-${search}` : activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {displayedLinkers.map((linker) => <LinkerCard key={linker.phrase} linker={linker} />)}
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <p className="text-sm" style={{ color: "#555" }}>No linkers found</p>
            {bandFilter !== "all" && <button onClick={() => setBandFilter("all")} className="text-xs" style={{ color: "#4F46E5" }}>Clear band filter</button>}
            {isSearching && <button onClick={() => setSearch("")} className="text-xs" style={{ color: "#4F46E5" }}>Clear search</button>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
