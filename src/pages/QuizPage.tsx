import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { subjectIcon } from "@/lib/icons";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, RotateCcw, ChevronLeft, ChevronRight, CircleCheckBig } from "lucide-react";
import { cn } from "@/lib/utils";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type QuizQuestion = {
  id: number;
  stem: string;
  options: string[];
  answer: string;
  explanation: string | null;
};

export default function QuizPage() {
  const [params, setParams] = useSearchParams();
  const { data: subjects, isLoading: loadingSubjects } = trpc.medical.subjectList.useQuery();

  const slug = params.get("subject") ?? "";
  const activeSlug = slug || subjects?.[0]?.slug || "";

  const { data, isLoading: loadingQuestions } = trpc.medical.questionList.useQuery(
    { subjectSlug: activeSlug },
    { enabled: !!activeSlug },
  );

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // 切换学科或拿到新数据时重置测验
  useEffect(() => {
    if (data?.questions) {
      setQuestions(shuffle(data.questions));
      setCurrent(0);
      setAnswers({});
      setSubmitted(false);
    }
  }, [data]);

  const score = useMemo(
    () => questions.filter((q) => answers[q.id] === q.answer).length,
    [questions, answers],
  );
  const answeredCount = Object.keys(answers).length;
  const q = questions[current];

  const selectOption = (qid: number, letter: string) => {
    if (submitted) return;
    setAnswers((m) => ({ ...m, [qid]: letter }));
  };

  const restart = () => {
    setQuestions((qs) => shuffle(qs));
    setCurrent(0);
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <BackButton to="/home" label="首页" className="mb-5" />
      <div className="mb-2 flex items-center gap-3">
        <span className="h-1.5 w-8 rounded-full bg-primary" />
        <span className="hud-tag">// SELF-EXAMINATION MODULE</span>
      </div>
      <h1 className="font-display text-3xl font-bold tracking-wide">自测题库</h1>
      <p className="mt-2 text-sm text-muted-foreground">按学科随机出题，全部作答后提交查看答案与解析。</p>

      {/* 学科选择 */}
      <div className="mt-7 flex flex-wrap gap-2">
        {loadingSubjects
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-32 " />)
          : subjects?.map((s) => {
              const Icon = subjectIcon(s.icon);
              const active = s.slug === activeSlug;
              return (
                <button
                  key={s.id}
                  onClick={() => setParams({ subject: s.slug })}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm shadow-[2px_2px_0_hsl(203_33%_16%/0.1)] transition-all hover:-translate-y-0.5",
                    active
                      ? "border-primary bg-primary font-bold text-primary-foreground shadow-[3px_3px_0_hsl(22_100%_45%/0.35)]"
                      : "border-foreground/60 bg-white text-muted-foreground hover:border-primary hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {s.name}
                  <span className={cn("font-tech text-xs", active ? "text-primary-foreground/70" : "text-muted-foreground/50")}>
                    {s.questionCount}
                  </span>
                </button>
              );
            })}
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        {loadingQuestions ? (
          <Skeleton className="h-80 " />
        ) : questions.length === 0 ? (
          <div className="ak-card p-12 text-center text-muted-foreground">该学科还没有题目，敬请期待。</div>
        ) : submitted ? (
          /* ---------- 结果与解析 ---------- */
          <div>
            <div className="ak-frame ak-card relative mb-8 flex flex-col items-center gap-2 overflow-visible p-10 text-center hover:transform-none">
              <img
                src="/stickers/amiya-gift.png"
                alt="阿米娅"
                className="doodle-float absolute -top-12 right-6 w-24 select-none md:-top-14 md:right-10 md:w-32"
              />
              <CircleCheckBig className="h-10 w-10 text-primary" />
              <p className="font-display text-4xl font-bold">
                {score} <span className="text-2xl text-muted-foreground">/ {questions.length}</span>
              </p>
              <p className="hud-tag mt-1">
                ACCURACY {Math.round((score / questions.length) * 100)}%
              </p>
              <Button onClick={restart} variant="outline" className="ak-btn-cut mt-4 gap-1.5">
                <RotateCcw className="h-4 w-4" /> 重新作答
              </Button>
            </div>

            <div className="space-y-4">
              {questions.map((qq, i) => {
                const mine = answers[qq.id];
                const right = mine === qq.answer;
                return (
                  <div key={qq.id} className="ak-card p-5 hover:transform-none">
                    <div className="flex items-start gap-2.5">
                      {right ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      ) : (
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-relaxed">
                          <span className="font-tech mr-1.5 text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                          {qq.stem}
                        </p>
                        <div className="mt-2.5 space-y-1.5">
                          {qq.options.map((opt) => {
                            const letter = opt.slice(0, 1);
                            const isAnswer = letter === qq.answer;
                            const isMine = letter === mine;
                            return (
                              <div
                                key={opt}
                                className={cn(
                                  "rounded-lg border-2 px-3 py-1.5 text-sm",
                                  isAnswer && "border-[hsl(199_89%_46%)]/60 bg-accent font-medium text-accent-foreground",
                                  isMine && !isAnswer && "border-destructive/50 bg-destructive/10 text-destructive",
                                  !isAnswer && !isMine && "border-foreground/15 bg-white text-muted-foreground",
                                )}
                              >
                                {opt}
                                {isAnswer && <span className="font-tech ml-2 text-xs">✓ 正确答案</span>}
                                {isMine && !isAnswer && <span className="font-tech ml-2 text-xs">你的选择</span>}
                              </div>
                            );
                          })}
                        </div>
                        {qq.explanation && (
                          <div className="mt-3 rounded-r-xl border-l-4 border-[hsl(199_89%_46%)] bg-accent px-3.5 py-2.5 text-sm leading-relaxed text-accent-foreground">
                            <span className="font-bold">解析 //</span> {qq.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ---------- 答题中 ---------- */
          q && (
            <div>
              <div className="mb-3 flex items-center justify-between font-tech text-xs text-muted-foreground">
                <span>
                  Q.{String(current + 1).padStart(2, "0")} / {String(questions.length).padStart(2, "0")}
                </span>
                <span>ANSWERED {answeredCount}</span>
              </div>
              <div className="mb-5 h-2 w-full rounded-full bg-foreground/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[hsl(190_84%_50%)] to-[hsl(217_66%_52%)] transition-all"
                  style={{ width: `${((current + 1) / questions.length) * 100}%` }}
                />
              </div>

              <div className="ak-frame ak-card p-6 hover:transform-none md:p-8">
                <span className="hud-tag !text-primary">SINGLE CHOICE // 单选题</span>
                <p className="mt-3 text-lg font-medium leading-relaxed">{q.stem}</p>
                <div className="mt-6 space-y-2">
                  {q.options.map((opt) => {
                    const letter = opt.slice(0, 1);
                    const selected = answers[q.id] === letter;
                    return (
                      <button
                        key={opt}
                        onClick={() => selectOption(q.id, letter)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition-all",
                          selected
                            ? "border-[hsl(199_89%_46%)] bg-accent font-medium text-accent-foreground"
                            : "border-foreground/20 bg-white hover:border-[hsl(199_89%_46%)]/60 hover:-translate-y-0.5",
                        )}
                      >
                        <span
                          className={cn(
                            "font-tech flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs",
                            selected ? "border-[hsl(199_89%_46%)] bg-[hsl(199_89%_46%)] text-white" : "border-foreground/30",
                          )}
                        >
                          {letter}
                        </span>
                        <span>{opt.slice(2).trim()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <Button
                  variant="outline"
                  className="ak-btn-cut"
                  disabled={current === 0}
                  onClick={() => setCurrent((c) => c - 1)}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> 上一题
                </Button>

                {current === questions.length - 1 ? (
                  <Button
                    className="ak-btn-cut font-bold"
                    onClick={() => setSubmitted(true)}
                    disabled={answeredCount < questions.length}
                    title={answeredCount < questions.length ? "还有题目未作答" : undefined}
                  >
                    提交并查看解析
                  </Button>
                ) : (
                  <Button className="ak-btn-cut" onClick={() => setCurrent((c) => c + 1)}>
                    下一题 <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>

              {current === questions.length - 1 && answeredCount < questions.length && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  还有 {questions.length - answeredCount} 题未作答，全部作答后才能提交。
                </p>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
