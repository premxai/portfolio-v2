import type { Metadata } from "next";
import { CaseStudyHeader } from "@/components/case-study-header";
import { Prose } from "@/components/prose";
import { Metric, MetricRow } from "@/components/metric";

export const metadata: Metadata = {
  title: "Emotion Engine",
  description:
    "A 72-feature LSTM rediscovers fear, grief, and suspicion from zero hardcoded rules. p = 3.3e-113 across 205,940 agent-step records.",
};

export default function EmotionEnginePage() {
  return (
    <article>
      <CaseStudyHeader
        slug="emotion-engine"
        label="// case study · research"
        title="Can emotions emerge from prediction alone?"
        tagline="A 72-feature LSTM, trained only to predict future world events, independently rediscovers fear, grief, and suspicion as functional internal states — no hardcoded appraisal rules."
        period="Feb 2026 – Apr 2026"
        role="Sole researcher"
        repo="https://github.com/premxai/emotion_engine"
        demo="https://github.com/premxai/emotion-engine-web"
      />

      <Prose>
        <p>
          Most generative-agent systems script emotions: <em>if low health,
          set state = fear</em>. That works, but it doesn&apos;t answer the
          more interesting question — does the agent actually <em>need</em>
          the rule? <strong>Emotion Engine</strong> extends Stanford&apos;s
          Generative Agents framework with a predictive world model and asks
          whether emotion-like internal states fall out for free when the only
          training signal is &ldquo;guess what happens next.&rdquo;
        </p>

        <h2>The setup: Ghost Town</h2>
        <p>
          Twelve agents are dropped into a grid-world survival simulation
          spanning three simulated days. Resources are scarce, social ties
          form and break, and ghosts attack at night. Each agent observes a
          21-dimensional state vector. I trained five architectures on the
          same world and compared their behavior:
        </p>
        <ul>
          <li>
            <strong>Baseline</strong> — no emotion machinery at all.
          </li>
          <li>
            <strong>A — Hand-coded appraisal.</strong> The classic
            OCC-rule-style system: scripted triggers for fear, grief,
            suspicion.
          </li>
          <li>
            <strong>B — Behavioral cloning.</strong> A network that imitates
            an emotion-rule policy from logs.
          </li>
          <li>
            <strong>C — Latent emotion dynamics.</strong> A learned emotion
            vector with no semantic supervision.
          </li>
          <li>
            <strong>D — Predictive world model.</strong> A 72-feature LSTM
            that ingests the 21-dim observation and is trained only to
            predict 12 future world events. No emotion supervision. None.
          </li>
        </ul>

        <h2>What the predictive model did unprompted</h2>
        <p>
          Condition D drove the strongest survival behavior in the
          simulation. More importantly, when I probed its hidden state, the
          model had spontaneously organized internal dimensions that
          functionally <em>are</em> emotions:
        </p>
        <ul>
          <li>
            A dimension that spikes when ghosts are nearby and drives
            shelter-seeking — <strong>fear</strong>, in everything but name.
          </li>
          <li>
            A dimension that activates after a known agent dies and
            depresses exploration for a window of steps — <strong>grief</strong>.
          </li>
          <li>
            A dimension that scales with betrayal frequency and refuses
            cooperation — <strong>suspicion</strong>.
          </li>
        </ul>
        <p>
          Seven of eight latent dimensions had legible behavioral
          correlates. The model had to reinvent emotion because emotion is
          what fast, low-bandwidth prediction looks like in a social,
          adversarial world.
        </p>
      </Prose>

      <div className="container-page">
        <MetricRow>
          <Metric
            value="99.0%"
            label="Fear-driven shelter-seeking"
            hint="vs 97.9% hand-coded"
          />
          <Metric
            value="3.3e-113"
            label="Fisher's exact p-value"
            hint="N = 205,940 agent-steps"
          />
          <Metric
            value="11.8 / 12"
            label="Mean survivors"
            hint="up from 10.1 baseline"
          />
          <Metric
            value="7 / 8"
            label="Interpretable latent dims"
            hint="fear, grief, suspicion, +4"
          />
        </MetricRow>
      </div>

      <Prose>
        <h2>Methodology</h2>
        <ul>
          <li>
            <strong>Data.</strong> 205,940 agent-step records across 8 random
            seeds and 6 scenarios.
          </li>
          <li>
            <strong>Statistics.</strong> Fisher&apos;s exact tests with Wilson
            95% confidence intervals to validate behavioral signatures.
          </li>
          <li>
            <strong>External baseline.</strong> Survival and behavior compared
            against the Gallup 2024 cooperation baseline to ground &ldquo;does
            this look like a real social agent.&rdquo;
          </li>
          <li>
            <strong>Stack.</strong> Custom Python simulation engine, PyTorch
            for training, Django for the interactive viewer.
          </li>
        </ul>

        <h2>Why this matters</h2>
        <p>
          For agent designers, this is permission to stop scripting affect.
          A small predictive head plus the right observation space gives you
          emotion-like behavior for free, and the latent space is legible
          enough to debug. For interpretability folks, it&apos;s a clean
          example of capability emerging from objective rather than
          architecture.
        </p>

        <h2>What I&apos;d do next</h2>
        <ul>
          <li>
            Push the observation vector to be sparser and see at what point
            emotion latents collapse.
          </li>
          <li>
            Move from grid-world to a continuous environment and check
            whether the same latent organization survives.
          </li>
          <li>
            Run an ablation on memory horizon — at what point does
            &ldquo;suspicion&rdquo; stop generalizing?
          </li>
        </ul>
      </Prose>
    </article>
  );
}
