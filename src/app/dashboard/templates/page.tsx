"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, Check, Search, X, MessageSquare, ChevronDown, ChevronUp,
  Sparkles, Loader2, AlertCircle, Lightbulb, BookOpen,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Band = 8 | 9;
type TaskType = "Task 1" | "Task 2";
type EssayType =
  | "Opinion"
  | "Discussion"
  | "Advantages/Disadvantages"
  | "Problems/Solutions"
  | "Double Question"
  | "Task 1 Overview"
  | "Task 1 Body"
  | "Task 1 Trend"
  | "Task 1 Comparison"
  | "Task 1 Conclusion";

type Template = {
  id: string;
  name: string;
  band: Band;
  task: TaskType;
  type: EssayType;
  text: string;
};

type AIResult = {
  essayType: string;
  templateName: string;
  explanation: string;
  band: Band;
  customizedTemplate: string;
};

// ─── Template data ────────────────────────────────────────────────────────────

const TEMPLATES: Template[] = [
  // ── Opinion ──────────────────────────────────────────────────────────────
  {
    id: "op-1", name: "Intro — Hook + Thesis", band: 8, task: "Task 2", type: "Opinion",
    text: `In recent years, [TOPIC] has become an increasingly debated issue in many parts of the world. While some people argue that [OPPOSING VIEW], others maintain that [YOUR VIEW]. In my opinion, [YOUR CLEAR POSITION], and this essay will discuss [REASON 1] and [REASON 2] to support this view.`,
  },
  {
    id: "op-2", name: "Intro — Controversial Opening", band: 9, task: "Task 2", type: "Opinion",
    text: `The question of [TOPIC] has increasingly divided opinion among policymakers, academics, and the general public alike. Whilst proponents of [POSITION A] cite [REASON A], those who advocate for [POSITION B] draw attention to [REASON B]. This essay will argue, without equivocation, that [CLEAR THESIS], grounded in an analysis of [DIMENSION 1] and [DIMENSION 2].`,
  },
  {
    id: "op-3", name: "Intro — Qualified Agreement", band: 9, task: "Task 2", type: "Opinion",
    text: `The extent to which [CLAIM] is a matter of considerable scholarly and public debate. Whilst it would be an oversimplification to argue that [EXTREME VERSION OF THE CLAIM], a careful examination of the evidence suggests that [NUANCED POSITION]. This essay will substantiate this claim through an analysis of [DIMENSION 1] and [DIMENSION 2].`,
  },
  {
    id: "op-4", name: "Body — Main Argument (PEEL)", band: 8, task: "Task 2", type: "Opinion",
    text: `The most compelling reason to support [YOUR POSITION] is [REASON]. This is because [EXPLANATION]. To illustrate, [SPECIFIC EXAMPLE from a country, organisation, or study]. As a result, [CONSEQUENCE that supports your view]. This clearly demonstrates that [LINK BACK TO THESIS].`,
  },
  {
    id: "op-5", name: "Body — Argument with Concession", band: 9, task: "Task 2", type: "Opinion",
    text: `A further argument in favour of [YOUR POSITION] concerns [SECOND REASON]. [EXPLAIN WITH SPECIFIC DETAIL AND EXAMPLE]. Admittedly, critics might object that [MOST OBVIOUS COUNTER-ARGUMENT]; however, upon closer examination, [REBUTTAL SHOWING WHY YOUR POINT STANDS]. This ultimately reinforces the conclusion that [RESTATE YOUR POINT].`,
  },
  {
    id: "op-6", name: "Body — Cause-Effect Chain", band: 9, task: "Task 2", type: "Opinion",
    text: `One significant consequence of [TOPIC] is [MAIN POINT]. This arises because [ROOT CAUSE], which in turn leads to [INTERMEDIATE EFFECT]. The cumulative result is [FINAL OUTCOME], a pattern clearly observable in [SPECIFIC EXAMPLE]. This chain of causation provides compelling evidence that [YOUR THESIS].`,
  },
  {
    id: "op-7", name: "Conclusion — Standard", band: 8, task: "Task 2", type: "Opinion",
    text: `In conclusion, I firmly maintain the view that [RESTATE THESIS IN DIFFERENT WORDS]. As argued throughout this essay, [REASON 1] and [REASON 2] together provide a compelling case for this position. Whilst [MINOR CONCESSION], the overall evidence strongly supports the conclusion that [FINAL STATEMENT].`,
  },
  {
    id: "op-8", name: "Conclusion — Advanced", band: 9, task: "Task 2", type: "Opinion",
    text: `In the final analysis, a dispassionate assessment of the evidence leads me to conclude, with considerable conviction, that [NUANCED RESTATEMENT OF THESIS]. The interplay of [FACTOR 1] and [FACTOR 2], as explored in this essay, makes a compelling case for [SPECIFIC ACTION OR POSITION]. Notwithstanding [CONCESSION], I remain firmly convinced that [RESTATED POSITION].`,
  },

  // ── Discussion ───────────────────────────────────────────────────────────
  {
    id: "disc-1", name: "Intro — Both Views Standard", band: 8, task: "Task 2", type: "Discussion",
    text: `The issue of [TOPIC] is a matter on which people hold widely divergent views. On one hand, some argue that [VIEW 1]. On the other hand, others maintain that [VIEW 2]. This essay will examine both perspectives before presenting my own opinion that [YOUR POSITION].`,
  },
  {
    id: "disc-2", name: "Intro — Both Views Advanced", band: 9, task: "Task 2", type: "Discussion",
    text: `Few issues generate as much intellectual and public controversy as [TOPIC]. Advocates of [POSITION 1] argue that [ARGUMENT 1], citing [EVIDENCE or REASON]. Their opponents, however, contend that [POSITION 2], on the grounds that [ARGUMENT 2]. This essay will critically examine both viewpoints before concluding that [YOUR QUALIFIED VERDICT].`,
  },
  {
    id: "disc-3", name: "Body — View 1 Paragraph", band: 8, task: "Task 2", type: "Discussion",
    text: `Those who support [VIEW 1] argue that [MAIN ARGUMENT OF THIS VIEW]. This perspective rests on the observation that [SUPPORTING POINT]. For instance, [SPECIFIC EXAMPLE from a country or study]. Proponents of this view would therefore conclude that [CONCLUSION OF THIS PERSPECTIVE].`,
  },
  {
    id: "disc-4", name: "Body — View 2 Paragraph", band: 9, task: "Task 2", type: "Discussion",
    text: `Conversely, those who favour [VIEW 2] maintain that [MAIN COUNTER-ARGUMENT]. This position is bolstered by the fact that [SUPPORTING EVIDENCE]. A particularly compelling illustration is provided by [SPECIFIC EXAMPLE], which demonstrates that [WHAT THE EXAMPLE PROVES]. It can therefore be argued that [CONCLUSION OF VIEW 2].`,
  },
  {
    id: "disc-5", name: "Body — Own Opinion Paragraph", band: 9, task: "Task 2", type: "Discussion",
    text: `In my view, whilst both perspectives raise valid concerns, [THE VIEW YOU FAVOUR] presents the more persuasive case. This is primarily because [KEY DECISIVE REASON], which [THE OTHER VIEW] fails to adequately address. Furthermore, [ADDITIONAL REASON that tilts the balance decisively], leading to the conclusion that [YOUR FINAL VERDICT].`,
  },
  {
    id: "disc-6", name: "Conclusion — Balanced Verdict", band: 8, task: "Task 2", type: "Discussion",
    text: `In conclusion, whilst [VIEW 1] has certain merits, particularly in relation to [SPECIFIC ASPECT], the argument for [VIEW 2 or YOUR POSITION] is ultimately more convincing, largely due to [DECISIVE REASON]. On balance, I believe that [FINAL VERDICT]. Going forward, [RECOMMENDATION for governments, individuals, or society].`,
  },
  {
    id: "disc-7", name: "Conclusion — Nuanced Advanced", band: 9, task: "Task 2", type: "Discussion",
    text: `Taking everything into account, [TOPIC] presents society with a challenge that resists simple resolution. Whilst [VIEW 1] commands respect on account of [REASON], the analysis presented in this essay suggests that [VIEW 2 or YOUR POSITION] ultimately provides the more coherent and evidence-based framework. The crucial insight is that [KEY TAKEAWAY GOING BEYOND THE QUESTION].`,
  },
  {
    id: "disc-8", name: "4-Para Structure Overview", band: 8, task: "Task 2", type: "Discussion",
    text: `[INTRO: The issue of [TOPIC] is contentious. Some argue [VIEW 1]; others maintain [VIEW 2]. This essay examines both before concluding that [POSITION].]

[BODY 1: Those who support [VIEW 1] contend that [ARGUMENT]. [EXAMPLE]. This suggests [CONCLUSION OF VIEW 1].]

[BODY 2: Conversely, advocates of [VIEW 2] argue that [COUNTER-ARGUMENT]. [EXAMPLE]. It can therefore be argued that [CONCLUSION OF VIEW 2].]

[CONCLUSION: In conclusion, having considered both sides, I believe [YOUR VERDICT] because [DECISIVE REASON]. [RECOMMENDATION].]`,
  },

  // ── Advantages/Disadvantages ──────────────────────────────────────────────
  {
    id: "ad-1", name: "Intro — Standard", band: 8, task: "Task 2", type: "Advantages/Disadvantages",
    text: `[TOPIC] has become an increasingly common phenomenon in modern society. Whilst this development brings certain advantages, it is not without its drawbacks. This essay will examine both sides of this issue before reaching a conclusion about whether the advantages outweigh the disadvantages.`,
  },
  {
    id: "ad-2", name: "Intro — Advanced", band: 9, task: "Task 2", type: "Advantages/Disadvantages",
    text: `The [accelerating/growing/widespread] phenomenon of [TOPIC] has generated considerable debate regarding its net impact on [SOCIETY/INDIVIDUALS/THE ECONOMY]. Whilst its proponents emphasise [KEY BENEFIT], a growing body of evidence highlights the significant costs associated with [KEY DRAWBACK]. This essay will evaluate both dimensions before arriving at a reasoned verdict.`,
  },
  {
    id: "ad-3", name: "Body — Advantages Paragraph", band: 8, task: "Task 2", type: "Advantages/Disadvantages",
    text: `The most significant advantage of [TOPIC] is [MAIN BENEFIT]. This is because [EXPLANATION OF WHY THIS IS BENEFICIAL]. For example, [SPECIFIC EXAMPLE from a country, study, or statistic]. Furthermore, [SECONDARY BENEFIT], which has the potential to [POSITIVE OUTCOME]. These benefits are particularly pronounced among [SPECIFIC GROUP or CONTEXT].`,
  },
  {
    id: "ad-4", name: "Body — Advantages Advanced", band: 9, task: "Task 2", type: "Advantages/Disadvantages",
    text: `The case for [TOPIC] rests primarily on [MAIN ADVANTAGE]. This benefit operates through [MECHANISM — how it actually works], generating downstream effects that include [SECONDARY BENEFIT 1] and [SECONDARY BENEFIT 2]. Particularly compelling is the evidence from [SPECIFIC EXAMPLE], which demonstrates that [WHAT THE EVIDENCE SHOWS]. What makes this advantage especially significant is that [WHY IT MATTERS MORE THAN THE DISADVANTAGES].`,
  },
  {
    id: "ad-5", name: "Body — Disadvantages Paragraph", band: 8, task: "Task 2", type: "Advantages/Disadvantages",
    text: `However, [TOPIC] is not without its drawbacks. The most serious of these is [MAIN DISADVANTAGE], which can lead to [NEGATIVE CONSEQUENCE]. In addition, [SECONDARY DISADVANTAGE], a problem that is particularly acute among [AFFECTED GROUP]. Unless [CONDITION is met], these disadvantages are likely to intensify over time.`,
  },
  {
    id: "ad-6", name: "Body — Disadvantages Advanced", band: 9, task: "Task 2", type: "Advantages/Disadvantages",
    text: `Set against these benefits, however, are considerable costs. Perhaps most significantly, [MAIN DISADVANTAGE] imposes disproportionate burdens on [AFFECTED GROUP], as evidenced by [SPECIFIC DATA or EXAMPLE]. This disadvantage is compounded by [SECONDARY DISADVANTAGE], which creates a self-reinforcing cycle of [NEGATIVE PATTERN]. The cumulative effect of these drawbacks is [OVERALL NEGATIVE CONSEQUENCE].`,
  },
  {
    id: "ad-7", name: "Conclusion — Clear Verdict", band: 8, task: "Task 2", type: "Advantages/Disadvantages",
    text: `In conclusion, [TOPIC] presents both significant advantages and notable disadvantages. Having examined both sides, I conclude that the [advantages/disadvantages] ultimately outweigh the [disadvantages/advantages], primarily because [KEY REASON]. It is important, however, to ensure that [SAFEGUARD] in order to [MINIMISE DOWNSIDES or MAXIMISE BENEFITS].`,
  },
  {
    id: "ad-8", name: "Conclusion — Nuanced Balance", band: 9, task: "Task 2", type: "Advantages/Disadvantages",
    text: `In conclusion, this essay has demonstrated that [TOPIC] generates both substantial benefits — notably [ADVANTAGE 1] and [ADVANTAGE 2] — and considerable costs, particularly [DISADVANTAGE 1] and [DISADVANTAGE 2]. Whether the advantages outweigh the disadvantages depends critically on [CONTEXTUAL FACTOR — e.g., the regulatory environment, the specific implementation, or the group affected]. What is clear is that [UNIVERSAL INSIGHT ABOUT THE TOPIC].`,
  },

  // ── Problems/Solutions ────────────────────────────────────────────────────
  {
    id: "ps-1", name: "Intro — Standard", band: 8, task: "Task 2", type: "Problems/Solutions",
    text: `[TOPIC] is a pressing issue that affects [WHO IS AFFECTED] around the world. This problem has arisen as a result of [CAUSE 1] and [CAUSE 2], and if left unaddressed, is likely to lead to [SERIOUS CONSEQUENCE]. This essay will examine the primary causes of this problem and propose two effective solutions.`,
  },
  {
    id: "ps-2", name: "Intro — Advanced", band: 9, task: "Task 2", type: "Problems/Solutions",
    text: `The escalating problem of [TOPIC] represents one of the most significant challenges facing [SOCIETY/GOVERNMENTS/COMMUNITIES] in the [21st century/modern era]. Driven by [UNDERLYING CAUSE 1] and exacerbated by [UNDERLYING CAUSE 2], this issue has produced consequences that range from [CONSEQUENCE 1] to [CONSEQUENCE 2]. This essay will analyse the root causes of this phenomenon and propose two targeted solutions.`,
  },
  {
    id: "ps-3", name: "Body — Problem Analysis", band: 8, task: "Task 2", type: "Problems/Solutions",
    text: `One major cause of [PROBLEM] is [CAUSE 1]. This occurs because [EXPLANATION]. For example, [SPECIFIC ILLUSTRATION of the cause and its effects]. This results in [CONSEQUENCE], placing significant pressure on [AFFECTED SYSTEM or GROUP]. Without intervention, this cause is likely to produce increasingly severe outcomes.`,
  },
  {
    id: "ps-4", name: "Body — Root Cause + Chain", band: 9, task: "Task 2", type: "Problems/Solutions",
    text: `The root cause of [PROBLEM] lies in [PRIMARY CAUSE], which creates a self-reinforcing cycle of [NEGATIVE PATTERN]. This is further exacerbated by [CONTRIBUTING FACTOR], as evidenced by [SPECIFIC EXAMPLE]. The consequences cascade: [CONSEQUENCE 1] leads to [CONSEQUENCE 2], which in turn produces [FINAL OUTCOME] — imposing compounding costs on [SOCIETY/THE ENVIRONMENT/INDIVIDUALS].`,
  },
  {
    id: "ps-5", name: "Body — Solution Paragraph", band: 8, task: "Task 2", type: "Problems/Solutions",
    text: `One effective solution to [PROBLEM] would be for [RESPONSIBLE PARTY — governments/schools/employers] to [SPECIFIC ACTION]. This would address the issue by [MECHANISM — how it works]. For example, [EVIDENCE from a country or organisation that has tried this]. Whilst implementing this requires [RESOURCE or EFFORT], the long-term benefit of [KEY BENEFIT] would far outweigh the cost.`,
  },
  {
    id: "ps-6", name: "Body — Dual Solution", band: 9, task: "Task 2", type: "Problems/Solutions",
    text: `Addressing [PROBLEM] effectively demands a dual-pronged strategy. In the short term, [SHORT-TERM SOLUTION] would provide immediate relief by [MECHANISM 1]. In the longer term, structural reform is necessary: specifically, [LONG-TERM SOLUTION], which would dismantle the root cause of [ROOT CAUSE] by [MECHANISM 2]. Together, these interventions would [CUMULATIVE POSITIVE EFFECT].`,
  },
  {
    id: "ps-7", name: "Conclusion — Standard", band: 8, task: "Task 2", type: "Problems/Solutions",
    text: `In conclusion, [PROBLEM] is a multifaceted challenge whose primary causes — [CAUSE 1] and [CAUSE 2] — demand targeted responses. By implementing [SOLUTION 1] and [SOLUTION 2], it would be possible to [DESIRED OUTCOME]. Failure to act, however, risks [NEGATIVE CONSEQUENCE that will affect society or future generations].`,
  },
  {
    id: "ps-8", name: "Conclusion — Systemic Insight", band: 9, task: "Task 2", type: "Problems/Solutions",
    text: `To conclude, [PROBLEM] is neither inevitable nor irreversible. Its resolution demands, however, that [RESPONSIBLE ACTORS] move beyond [INADEQUATE CURRENT RESPONSE] towards a comprehensive strategy that simultaneously addresses [SURFACE CAUSE] and [DEEPER STRUCTURAL CAUSE]. Concerted action along these lines would [POSITIVE OUTCOME], representing a meaningful step towards [BROADER GOAL].`,
  },

  // ── Double Question ───────────────────────────────────────────────────────
  {
    id: "dq-1", name: "Intro — Two-Question Setup", band: 8, task: "Task 2", type: "Double Question",
    text: `[TOPIC] is a subject that raises important questions about [BROAD THEME]. This essay will address two specific questions: first, [RESTATE QUESTION 1 in your own words]; and second, [RESTATE QUESTION 2 in your own words]. Each will be examined in turn, drawing on relevant evidence and examples.`,
  },
  {
    id: "dq-2", name: "Intro — Advanced", band: 9, task: "Task 2", type: "Double Question",
    text: `The phenomenon of [TOPIC] raises profound questions about [BROADER IMPLICATION 1] and [BROADER IMPLICATION 2]. This essay will address these questions systematically: the first concerns [ESSENCE OF QUESTION 1], whilst the second explores [ESSENCE OF QUESTION 2]. A careful analysis of both will reveal that [BRIEF PREVIEW OF YOUR ANSWERS].`,
  },
  {
    id: "dq-3", name: "Body — Answer to Question 1", band: 8, task: "Task 2", type: "Double Question",
    text: `With regard to the first question — [RESTATE Q1] — the answer is [YOUR ANSWER]. This is because [REASON 1 with explanation]. Furthermore, [REASON 2]. A compelling illustration of this is [SPECIFIC EXAMPLE from a country or study], which demonstrates that [WHAT IT PROVES].`,
  },
  {
    id: "dq-4", name: "Body — Answer to Question 2", band: 9, task: "Task 2", type: "Double Question",
    text: `Turning to the second question — [RESTATE Q2] — the most defensible position is that [YOUR ANSWER]. This conclusion is supported by [REASON 1], which operates through [MECHANISM]. Equally significant is [REASON 2], as illustrated by [SPECIFIC EXAMPLE]. Taken together, these considerations suggest that [BROADER IMPLICATION of your answer].`,
  },
  {
    id: "dq-5", name: "Conclusion — Two-Part Summary", band: 8, task: "Task 2", type: "Double Question",
    text: `In conclusion, this essay has argued that [ANSWER TO Q1] and that [ANSWER TO Q2]. As demonstrated through the evidence presented, [BRIEF SUMMARY OF KEY REASONS]. Looking ahead, [FINAL THOUGHT or RECOMMENDATION related to the broader topic].`,
  },
  {
    id: "dq-6", name: "Conclusion — Advanced", band: 9, task: "Task 2", type: "Double Question",
    text: `In the final analysis, the two questions posed in this task are more closely interconnected than they may initially appear: [EXPLAIN THE LINK BETWEEN THE TWO ANSWERS]. To the first, the answer is clearly [ANSWER 1]; to the second, [ANSWER 2]. Together, these conclusions suggest that [BROADER INSIGHT about the topic that goes beyond either question individually].`,
  },

  // ── Task 1 Overview ───────────────────────────────────────────────────────
  {
    id: "t1ov-1", name: "Bar/Line Chart Overview", band: 8, task: "Task 1", type: "Task 1 Overview",
    text: `Overall, it is clear that [MAIN DATA SUBJECT] [rose significantly/fell considerably/fluctuated] over the period shown, whilst [SECONDARY CONTRASTING TREND]. The most notable feature is that [SINGLE MOST STRIKING OBSERVATION from the data].`,
  },
  {
    id: "t1ov-2", name: "Highest and Lowest Overview", band: 8, task: "Task 1", type: "Task 1 Overview",
    text: `Overall, [CATEGORY A] consistently recorded the highest [values/figures] throughout the period, whilst [CATEGORY B] remained the lowest at all points. It is also notable that [SECONDARY OBSERVATION — e.g., the gap between the two narrowed significantly by the end of the period].`,
  },
  {
    id: "t1ov-3", name: "Pie Chart Overview", band: 9, task: "Task 1", type: "Task 1 Overview",
    text: `Overall, the most striking feature of the data is the dominance of [LARGEST CATEGORY], which accounted for [PERCENTAGE]% of the total, whilst [SMALLEST CATEGORY] represented the smallest share at just [PERCENTAGE]%. The remaining [NUMBER] categories were [broadly similar in size / markedly varied], each contributing between [LOWER %]% and [UPPER %]%.`,
  },
  {
    id: "t1ov-4", name: "Map Overview", band: 9, task: "Task 1", type: "Task 1 Overview",
    text: `Overall, the most significant change over the [TIME PERIOD] was the [construction/demolition/transformation] of [MAIN CHANGED FEATURE]. Whilst [FEATURE A] remained largely unchanged, [FEATURE B] underwent substantial [development/redevelopment], resulting in a [MORE COMMERCIAL/RESIDENTIAL/MODERN] overall layout.`,
  },
  {
    id: "t1ov-5", name: "Process Diagram Overview", band: 8, task: "Task 1", type: "Task 1 Overview",
    text: `Overall, the diagram illustrates a [NUMBER]-stage process by which [WHAT IS PRODUCED or ACHIEVED]. The process begins with [FIRST STAGE or INPUT] and concludes with [FINAL STAGE or OUTPUT], involving [KEY INTERMEDIATE STAGES] along the way. The overall process is [automatic/manual/cyclical/linear] in nature.`,
  },
  {
    id: "t1ov-6", name: "Two Charts Combined Overview", band: 9, task: "Task 1", type: "Task 1 Overview",
    text: `Overall, both [charts/graphs/tables] reveal that [UNIFYING OBSERVATION linking both data sets]. Whilst the [first chart] highlights [CHART 1 KEY FEATURE], the [second chart] suggests a more [nuanced/complex] picture, particularly with regard to [SPECIFIC ASPECT]. Together, these data indicate that [INTEGRATED CONCLUSION].`,
  },

  // ── Task 1 Body ───────────────────────────────────────────────────────────
  {
    id: "t1bd-1", name: "Bar Chart — Category Comparison", band: 8, task: "Task 1", type: "Task 1 Body",
    text: `[CATEGORY A] recorded the highest [value/figure] at [NUMBER] [UNIT], followed by [CATEGORY B] at [NUMBER]. By contrast, [CATEGORY C] and [CATEGORY D] both showed considerably lower figures, at [NUMBER] and [NUMBER] respectively. Notably, [CATEGORY E] experienced the most dramatic [increase/decrease], [rising/falling] from [FIGURE] to [FIGURE] across the period.`,
  },
  {
    id: "t1bd-2", name: "Line Graph — Detailed Trend", band: 9, task: "Task 1", type: "Task 1 Body",
    text: `Between [START YEAR] and [END YEAR], [DATA SET A] [rose steadily/fell sharply/fluctuated considerably], moving from [FIGURE 1] to [FIGURE 2]. After reaching a [peak/trough] of [FIGURE] in [YEAR], the figure then [subsequently rose/fell/levelled off] to reach [FINAL FIGURE] by [END YEAR]. [DATA SET B], by contrast, followed a [similar/markedly different] trajectory, [DESCRIPTION OF B's TREND].`,
  },
  {
    id: "t1bd-3", name: "Pie Chart — Proportions", band: 8, task: "Task 1", type: "Task 1 Body",
    text: `[CATEGORY A] accounted for the largest share at [PERCENTAGE]%, more than [TIMES] times the proportion attributed to [CATEGORY B] ([PERCENTAGE]%). [CATEGORY C] and [CATEGORY D] represented [PERCENTAGE]% and [PERCENTAGE]% respectively, whilst [REMAINING CATEGORIES] collectively made up the remaining [PERCENTAGE]%.`,
  },
  {
    id: "t1bd-4", name: "Map — Changes Paragraph", band: 9, task: "Task 1", type: "Task 1 Body",
    text: `The most striking change to [LOCATION] was the [construction/demolition/replacement] of [FEATURE A], which was [replaced by/converted into] [FEATURE B]. To the [north/south/east/west], [FEATURE C] was [demolished/built/relocated], whilst [FEATURE D] remained [unchanged/largely unaltered]. A new [road/car park/building] was also added to the [direction], fundamentally altering the character of the area.`,
  },
  {
    id: "t1bd-5", name: "Process — Stage Description", band: 8, task: "Task 1", type: "Task 1 Body",
    text: `The process begins when [STAGE 1 — describe first action or input]. Following this, [STAGE 2], at which point [WHAT CHANGES or IS PRODUCED]. Subsequently, [STAGE 3], before [STAGE 4]. Finally, [FINAL OUTPUT of this section], completing [this phase of / the entire] process.`,
  },
  {
    id: "t1bd-6", name: "Table — Multi-Country Comparison", band: 9, task: "Task 1", type: "Task 1 Body",
    text: `With respect to [CATEGORY A], [COUNTRY/GROUP A] recorded the highest figure at [VALUE], which was [significantly/considerably] higher than [COUNTRY/GROUP B]'s [VALUE]. Notably, [COUNTRY/GROUP C] showed [INTERESTING FEATURE — e.g., the largest increase/most consistent pattern], whilst [COUNTRY/GROUP D] and [COUNTRY/GROUP E] both registered [similar values/a contrasting pattern] at [VALUE 1] and [VALUE 2] respectively.`,
  },

  // ── Task 1 Trend ─────────────────────────────────────────────────────────
  {
    id: "t1tr-1", name: "Steady Rise", band: 8, task: "Task 1", type: "Task 1 Trend",
    text: `[SUBJECT] rose steadily [from [FIGURE] in [YEAR] / over the period], reaching [PEAK FIGURE] by [END YEAR]. This upward trajectory was [consistent/interrupted by a brief plateau in [YEAR] before resuming], ultimately resulting in an overall increase of [AMOUNT or PERCENTAGE].`,
  },
  {
    id: "t1tr-2", name: "Sharp Decline", band: 8, task: "Task 1", type: "Task 1 Trend",
    text: `[SUBJECT] fell [sharply/dramatically/steeply] from [FIGURE] in [YEAR] to [FIGURE] in [YEAR], representing a [decline of AMOUNT / drop of PERCENTAGE]. This [rapid/sustained] decrease [continued throughout the period / was followed by a partial recovery in [YEAR]].`,
  },
  {
    id: "t1tr-3", name: "Fluctuation Description", band: 9, task: "Task 1", type: "Task 1 Trend",
    text: `[SUBJECT] exhibited considerable volatility over the period. After [rising/falling] to [FIGURE] in [YEAR], the figure [reversed course / continued] to reach [FIGURE] by [YEAR]. This fluctuation was followed by a [further rise/fall/period of stability], with the figure ultimately settling at [FINAL VALUE] — [HIGHER/LOWER/ROUGHLY THE SAME] than its starting point of [INITIAL VALUE].`,
  },
  {
    id: "t1tr-4", name: "Peak and Trough", band: 9, task: "Task 1", type: "Task 1 Trend",
    text: `[SUBJECT] reached its highest point of [PEAK FIGURE] in [PEAK YEAR], before [declining sharply/falling gradually] to a trough of [LOWEST FIGURE] in [TROUGH YEAR]. Following this low point, [SUBJECT] [recovered partially/rose steadily] to close the period at [FINAL FIGURE], [above/below/roughly equal to] its starting value of [INITIAL FIGURE].`,
  },
  {
    id: "t1tr-5", name: "Broadly Stable with Variation", band: 8, task: "Task 1", type: "Task 1 Trend",
    text: `[SUBJECT] remained broadly stable throughout the period, hovering between [LOWER BOUND] and [UPPER BOUND]. Whilst there was [a minor rise in [YEAR] / a slight dip in [YEAR]], these fluctuations were [marginal/short-lived], and the overall picture is one of [relative stability/consistent performance].`,
  },

  // ── Task 1 Comparison ─────────────────────────────────────────────────────
  {
    id: "t1cm-1", name: "Two-Category Contrast", band: 8, task: "Task 1", type: "Task 1 Comparison",
    text: `Whilst [CATEGORY A] [rose/fell/stood at] [FIGURE], [CATEGORY B] [showed a markedly different pattern / followed an opposite trend], [rising/falling] to [FIGURE]. The gap between the two [widened/narrowed/remained relatively constant] over the period, from [INITIAL DIFFERENCE] to [FINAL DIFFERENCE] by [END YEAR/POINT].`,
  },
  {
    id: "t1cm-2", name: "Multiple Category Ranking", band: 9, task: "Task 1", type: "Task 1 Comparison",
    text: `Across the [NUMBER] categories shown, [CATEGORY A] recorded the highest [figure/proportion/value] at [FIGURE], followed by [CATEGORY B] at [FIGURE] and [CATEGORY C] at [FIGURE]. By contrast, [CATEGORY D] and [CATEGORY E] represented the lowest figures, at [FIGURE] and [FIGURE] respectively — a [TIMES]-fold difference compared to the leading category.`,
  },
  {
    id: "t1cm-3", name: "Cross-Group Comparison", band: 8, task: "Task 1", type: "Task 1 Comparison",
    text: `The contrast between [GROUP A] and [GROUP B] is particularly instructive. Whilst [GROUP A] [CHARACTERISTIC — e.g., spent the most on X / recorded the highest Y], [GROUP B] [CONTRASTING CHARACTERISTIC]. This difference of [AMOUNT or PERCENTAGE POINTS] represents the largest disparity observed in the data.`,
  },
  {
    id: "t1cm-4", name: "Before and After Comparison", band: 9, task: "Task 1", type: "Task 1 Comparison",
    text: `Comparing the [maps/diagrams/figures] at [YEAR 1/TIME 1] and [YEAR 2/TIME 2], the most significant change is [MAIN CHANGE]. Whereas in [YEAR 1] [WHAT IT WAS LIKE], by [YEAR 2] [WHAT IT HAD BECOME]. Conversely, [FEATURE/ASPECT THAT REMAINED UNCHANGED OR CHANGED LESS], suggesting that [CONCLUSION from the comparison].`,
  },
  {
    id: "t1cm-5", name: "Proportion and Gap Analysis", band: 8, task: "Task 1", type: "Task 1 Comparison",
    text: `[SUBJECT A] accounted for [PERCENTAGE]% of the total — more than [TIMES] times the share of [SUBJECT B] ([PERCENTAGE]%). Together, [SUBJECT A] and [SUBJECT B] comprised [COMBINED PERCENTAGE]%, leaving the remaining [PERCENTAGE]% distributed among [DESCRIPTION OF OTHER CATEGORIES].`,
  },

  // ── Task 1 Conclusion ─────────────────────────────────────────────────────
  {
    id: "t1cn-1", name: "Trend Summary", band: 8, task: "Task 1", type: "Task 1 Conclusion",
    text: `In conclusion, the [chart/graph/table] clearly shows that [MAIN TREND]. Whilst [EXCEPTION or SECONDARY OBSERVATION], the overall pattern suggests that [GENERAL CONCLUSION or IMPLICATION of the data].`,
  },
  {
    id: "t1cn-2", name: "Comparison Summary", band: 8, task: "Task 1", type: "Task 1 Conclusion",
    text: `To summarise, the data reveals clear differences between [CATEGORY A] and [CATEGORY B] in terms of [VARIABLE]. [CATEGORY A] consistently [CHARACTERISTIC PATTERN], whilst [CATEGORY B] [CONTRASTING PATTERN] — a divergence that [increased/narrowed/remained stable] over the period examined.`,
  },
  {
    id: "t1cn-3", name: "Map Transformation Summary", band: 9, task: "Task 1", type: "Task 1 Conclusion",
    text: `In summary, the maps reveal a [town/facility/area] that was [DESCRIPTION AT START — e.g., predominantly agricultural/a quiet residential area] but was substantially transformed into [DESCRIPTION AT END] over the intervening [NUMBER] years. The dominant theme of these changes was [OVERALL PURPOSE — e.g., commercial development/increased residential density/improved leisure facilities].`,
  },
  {
    id: "t1cn-4", name: "Process Summary", band: 8, task: "Task 1", type: "Task 1 Conclusion",
    text: `In conclusion, the diagram illustrates that the production of [PRODUCT or OUTCOME] involves [NUMBER] distinct stages, progressing from the initial [INPUT or RAW MATERIAL] through a series of [mechanical/natural/chemical] transformations to the final [OUTPUT]. The process is [automatic/manual/cyclical/linear] in nature and [requires/does not require] [human intervention/external energy].`,
  },
  {
    id: "t1cn-5", name: "Two Charts Conclusion", band: 9, task: "Task 1", type: "Task 1 Conclusion",
    text: `Overall, the data from both [CHART TYPE 1] and [CHART TYPE 2] paint a consistent picture: [MAIN INTEGRATING INSIGHT linking both data sets]. The most significant finding is that [KEY OBSERVATION], a pattern that holds across [different groups/time periods/categories], suggesting that [BROADER IMPLICATION].`,
  },
  {
    id: "t1cn-6", name: "Pie Chart Summary", band: 8, task: "Task 1", type: "Task 1 Conclusion",
    text: `To summarise, [CATEGORY A] dominated [WHAT WAS MEASURED] in [YEAR or CONTEXT], accounting for [PERCENTAGE]% of the total, whilst [CATEGORY B] and [CATEGORY C] together represented a further [COMBINED PERCENTAGE]%. The remaining categories each contributed less than [THRESHOLD]%, playing a comparatively minor role.`,
  },
];

// ─── Derived constants ────────────────────────────────────────────────────────

const ALL_TYPES: EssayType[] = [
  "Opinion", "Discussion", "Advantages/Disadvantages", "Problems/Solutions", "Double Question",
  "Task 1 Overview", "Task 1 Body", "Task 1 Trend", "Task 1 Comparison", "Task 1 Conclusion",
];

const TYPE_LABELS: Record<string, string> = {
  "Opinion": "Opinion",
  "Discussion": "Discussion",
  "Advantages/Disadvantages": "Adv./Disadv.",
  "Problems/Solutions": "Prob./Sol.",
  "Double Question": "Double Q.",
  "Task 1 Overview": "T1 Overview",
  "Task 1 Body": "T1 Body",
  "Task 1 Trend": "T1 Trend",
  "Task 1 Comparison": "T1 Comparison",
  "Task 1 Conclusion": "T1 Conclusion",
};

const TASK2_TYPES: EssayType[] = ["Opinion", "Discussion", "Advantages/Disadvantages", "Problems/Solutions", "Double Question"];
const TASK1_TYPES: EssayType[] = ["Task 1 Overview", "Task 1 Body", "Task 1 Trend", "Task 1 Comparison", "Task 1 Conclusion"];

// ─── Shared UI ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handle() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  }
  return (
    <button onClick={handle}
      className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors"
      style={{ background: copied ? "rgba(34,197,94,0.12)" : "#1a1a1a", color: copied ? "#4ade80" : "#666", border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "#2a2a2a"}` }}>
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function BandBadge({ band }: { band: Band }) {
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{
      background: band === 9 ? "rgba(245,158,11,0.12)" : "rgba(139,92,246,0.12)",
      color: band === 9 ? "#fbbf24" : "#a78bfa",
      borderColor: band === 9 ? "rgba(245,158,11,0.3)" : "rgba(139,92,246,0.3)",
    }}>Band {band}</span>
  );
}

function TaskBadge({ task }: { task: TaskType }) {
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{
      background: task === "Task 1" ? "rgba(6,182,212,0.12)" : "rgba(34,197,94,0.12)",
      color: task === "Task 1" ? "#22d3ee" : "#4ade80",
      borderColor: task === "Task 1" ? "rgba(6,182,212,0.3)" : "rgba(34,197,94,0.3)",
    }}>{task}</span>
  );
}

function TypeBadge({ type }: { type: EssayType }) {
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#1a1a1a", color: "#666", border: "1px solid #2a2a2a" }}>
      {type}
    </span>
  );
}

// ─── AI Recommendation Card ───────────────────────────────────────────────────

function AIResultCard({ result, onDismiss }: { result: AIResult; onDismiss: () => void }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);

  function handleUseInChat() {
    localStorage.setItem("ielts_chat_template", JSON.stringify({
      template: result.customizedTemplate,
      name: result.templateName,
      category: result.essayType,
    }));
    router.push("/dashboard/chat");
  }

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
      className="rounded-xl mb-8" style={{ border: "2px solid rgba(79,70,229,0.4)", background: "rgba(79,70,229,0.05)" }}>
      <div className="flex items-start justify-between gap-3 p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg shrink-0" style={{ background: "rgba(79,70,229,0.12)" }}>
            <Sparkles className="h-4 w-4" style={{ color: "#4F46E5" }} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#4F46E5" }}>AI Recommended</span>
              <BandBadge band={result.band} />
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(79,70,229,0.12)", color: "#818cf8", border: "1px solid rgba(79,70,229,0.25)" }}>{result.essayType}</span>
            </div>
            <h3 className="text-sm font-semibold text-white">{result.templateName}</h3>
          </div>
        </div>
        <button onClick={onDismiss} style={{ color: "#555" }}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mx-5 mb-4 rounded-lg px-4 py-3 flex gap-2.5" style={{ background: "rgba(79,70,229,0.07)", border: "1px solid rgba(79,70,229,0.15)" }}>
        <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "#4F46E5" }} />
        <p className="text-xs leading-relaxed" style={{ color: "#888" }}>{result.explanation}</p>
      </div>

      <div className="mx-5 mb-4">
        <div className="rounded-lg p-4 cursor-pointer" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #1a1a1a" }} onClick={() => setExpanded((v) => !v)}>
          <p className="text-xs leading-relaxed font-mono whitespace-pre-wrap" style={{ color: "#ccc" }}>
            {expanded ? result.customizedTemplate : result.customizedTemplate.slice(0, 200) + "…"}
          </p>
        </div>
        <button onClick={() => setExpanded((v) => !v)} className="flex items-center gap-1 mt-1.5 text-[11px]" style={{ color: "#555" }}>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Show less" : "Show full template"}
        </button>
      </div>

      <div className="flex items-center gap-2 px-5 pb-5">
        <CopyButton text={result.customizedTemplate} />
        <button onClick={handleUseInChat}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors"
          style={{ background: "rgba(79,70,229,0.12)", color: "#818cf8", border: "1px solid rgba(79,70,229,0.25)" }}>
          <MessageSquare className="h-3 w-3" />
          Use in Chat
        </button>
      </div>
    </motion.div>
  );
}

// ─── Library Template Card ────────────────────────────────────────────────────

function TemplateCard({ t }: { t: Template }) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  function handleUseInChat() {
    localStorage.setItem("ielts_chat_template", JSON.stringify({
      template: t.text,
      name: t.name,
      category: t.type,
    }));
    router.push("/dashboard/chat");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
      className="rounded-xl flex flex-col" style={{ border: "1px solid #222222", background: "#111111" }}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <h3 className="text-sm font-semibold leading-snug text-white">{t.name}</h3>
          <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
            <TaskBadge task={t.task} />
            <BandBadge band={t.band} />
          </div>
        </div>
        <div className="mb-2.5"><TypeBadge type={t.type} /></div>

        <div className="rounded-lg p-3 mb-2 cursor-pointer" style={{ background: "rgba(0,0,0,0.25)", border: "1px solid #1a1a1a" }} onClick={() => setExpanded((v) => !v)}>
          <p className="text-xs leading-relaxed font-mono whitespace-pre-wrap" style={{ color: "#888" }}>
            {expanded ? t.text : t.text.slice(0, 130) + (t.text.length > 130 ? "…" : "")}
          </p>
        </div>

        <button onClick={() => setExpanded((v) => !v)} className="flex items-center gap-1 text-[11px] mb-3" style={{ color: "#555" }}>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Show less" : "Show full template"}
        </button>

        <div className="flex items-center gap-2">
          <CopyButton text={t.text} />
          <button onClick={handleUseInChat}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors"
            style={{ background: "rgba(79,70,229,0.1)", color: "#818cf8", border: "1px solid rgba(79,70,229,0.2)" }}>
            <MessageSquare className="h-3 w-3" />
            Use in Chat
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Filter button helpers ────────────────────────────────────────────────────

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap"
      style={{ background: active ? "#4F46E5" : "#111111", color: active ? "white" : "#555" }}>
      {children}
    </button>
  );
}

function PillBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
      style={{ background: active ? "#4F46E5" : "#111111", color: active ? "white" : "#888", border: active ? "none" : "1px solid #222222" }}>
      {children}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const [question, setQuestion] = useState("");
  const [finding, setFinding] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [taskFilter, setTaskFilter] = useState<"all" | "Task 1" | "Task 2">("all");
  const [typeFilter, setTypeFilter] = useState<EssayType | "all">("all");
  const [bandFilter, setBandFilter] = useState<"all" | "8" | "9">("all");

  async function handleFind() {
    if (!question.trim()) return;
    setFinding(true); setAiResult(null); setAiError(null);
    try {
      const res = await fetch("/api/find-template", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiResult(data as AIResult);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setFinding(false);
    }
  }

  const visibleTypes = useMemo(() => {
    if (taskFilter === "Task 1") return TASK1_TYPES;
    if (taskFilter === "Task 2") return TASK2_TYPES;
    return ALL_TYPES;
  }, [taskFilter]);

  const effectiveTypeFilter = useMemo<EssayType | "all">(() => {
    if (typeFilter === "all") return "all";
    if (taskFilter === "Task 1" && TASK2_TYPES.includes(typeFilter as EssayType)) return "all";
    if (taskFilter === "Task 2" && TASK1_TYPES.includes(typeFilter as EssayType)) return "all";
    return typeFilter;
  }, [typeFilter, taskFilter]);

  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TEMPLATES.filter((t) => {
      if (taskFilter !== "all" && t.task !== taskFilter) return false;
      if (effectiveTypeFilter !== "all" && t.type !== effectiveTypeFilter) return false;
      if (bandFilter !== "all" && String(t.band) !== bandFilter) return false;
      if (q && !t.name.toLowerCase().includes(q) && !t.text.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [taskFilter, effectiveTypeFilter, bandFilter, search]);

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="mb-7">
        <h1 className="text-xl font-bold text-white mb-0.5" style={{ letterSpacing: "-0.02em" }}>Essay Templates</h1>
        <p className="text-sm" style={{ color: "#888" }}>
          {TEMPLATES.length} Band 8–9 templates · paste your question to get an AI-customised recommendation
        </p>
      </div>

      {/* Smart Template Finder */}
      <div className="rounded-xl p-5 mb-8" style={{ background: "#111111", border: "1px solid #222222" }}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-1.5 rounded-lg" style={{ background: "rgba(79,70,229,0.1)" }}>
            <Sparkles className="h-4 w-4" style={{ color: "#4F46E5" }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Smart Template Finder</h3>
            <p className="text-xs" style={{ color: "#555" }}>Paste your IELTS question and AI will match the perfect template</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#888" }}>Your IELTS Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleFind(); }}
              placeholder={`Paste any IELTS question here…\n\ne.g. "Some people think that governments should pay for healthcare. Others believe individuals should be responsible for their own healthcare costs. Discuss both views and give your own opinion."`}
              rows={4}
              className="w-full rounded-lg px-3 py-2.5 text-sm placeholder:text-[#333] text-white focus:outline-none focus:ring-1 focus:ring-[#4F46E5] resize-none"
              style={{ background: "#0a0a0a", border: "1px solid #222222", colorScheme: "dark" }}
            />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleFind} disabled={finding || !question.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-40"
              style={{ background: "#4F46E5" }}>
              {finding ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Analysing…</> : <><Sparkles className="h-3.5 w-3.5" />Find Best Template</>}
            </button>
            {question && (
              <button onClick={() => { setQuestion(""); setAiResult(null); setAiError(null); }}
                className="text-xs transition-colors" style={{ color: "#555" }}>Clear</button>
            )}
            <span className="text-xs ml-auto hidden sm:block" style={{ color: "#444" }}>⌘ Enter to run</span>
          </div>
        </div>

        {aiError && (
          <div className="flex items-start gap-2 rounded-lg p-3 mt-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-400">{aiError}</p>
          </div>
        )}

        {finding && (
          <div className="mt-4 rounded-xl p-6 flex flex-col items-center gap-3" style={{ border: "1px solid rgba(79,70,229,0.2)", background: "rgba(79,70,229,0.05)" }}>
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#4F46E5" }} />
            <p className="text-xs" style={{ color: "#555" }}>Analysing question type and matching template…</p>
          </div>
        )}
      </div>

      <div ref={resultRef}>
        <AnimatePresence>
          {aiResult && !finding && <AIResultCard result={aiResult} onDismiss={() => setAiResult(null)} />}
        </AnimatePresence>
      </div>

      {/* Template Library */}
      <div className="pt-7" style={{ borderTop: "1px solid #222222" }}>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-1.5 rounded-lg" style={{ background: "#1a1a1a" }}>
            <BookOpen className="h-4 w-4" style={{ color: "#555" }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Template Library</h3>
            <p className="text-xs" style={{ color: "#555" }}>{displayed.length} of {TEMPLATES.length} templates</p>
          </div>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "#555" }} />
            <input type="text" placeholder="Search templates…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder:text-[#444] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              style={{ background: "#111111", border: "1px solid #222222" }} />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#555" }}>
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex rounded-lg overflow-hidden shrink-0" style={{ border: "1px solid #222222" }}>
            <FilterBtn active={taskFilter === "all"} onClick={() => { setTaskFilter("all"); setTypeFilter("all"); }}>All Tasks</FilterBtn>
            <FilterBtn active={taskFilter === "Task 1"} onClick={() => { setTaskFilter("Task 1"); setTypeFilter("all"); }}>Task 1</FilterBtn>
            <FilterBtn active={taskFilter === "Task 2"} onClick={() => { setTaskFilter("Task 2"); setTypeFilter("all"); }}>Task 2</FilterBtn>
          </div>

          <div className="flex rounded-lg overflow-hidden shrink-0" style={{ border: "1px solid #222222" }}>
            <FilterBtn active={bandFilter === "all"} onClick={() => setBandFilter("all")}>All Bands</FilterBtn>
            <FilterBtn active={bandFilter === "8"} onClick={() => setBandFilter("8")}>Band 8</FilterBtn>
            <FilterBtn active={bandFilter === "9"} onClick={() => setBandFilter("9")}>Band 9</FilterBtn>
          </div>
        </div>

        {/* Type pills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          <PillBtn active={effectiveTypeFilter === "all"} onClick={() => setTypeFilter("all")}>All Types</PillBtn>
          {visibleTypes.map((type) => (
            <PillBtn key={type} active={effectiveTypeFilter === type} onClick={() => setTypeFilter(type)}>{TYPE_LABELS[type]}</PillBtn>
          ))}
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {displayed.length > 0 ? (
            <motion.div key={`${taskFilter}-${effectiveTypeFilter}-${bandFilter}-${search}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayed.map((t) => <TemplateCard key={t.id} t={t} />)}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-14 gap-3 text-center">
              <p className="text-sm" style={{ color: "#555" }}>No templates match your filters</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {search && <button onClick={() => setSearch("")} className="text-xs" style={{ color: "#4F46E5" }}>Clear search</button>}
                {taskFilter !== "all" && <button onClick={() => setTaskFilter("all")} className="text-xs" style={{ color: "#4F46E5" }}>Clear task filter</button>}
                {bandFilter !== "all" && <button onClick={() => setBandFilter("all")} className="text-xs" style={{ color: "#4F46E5" }}>Clear band filter</button>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
