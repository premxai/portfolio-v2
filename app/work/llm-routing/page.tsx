import type { Metadata } from "next";
import { CaseStudyHeader } from "@/components/case-study-header";
import { Prose } from "@/components/prose";
import { Metric, MetricRow } from "@/components/metric";

export const metadata: Metadata = {
  title: "Multi-Model LLM Routing",
  description:
    "Production routing across 3+ foundation models at 1.5s end-to-end latency. 18% cost cut, 42% fewer incidents.",
};

export default function LlmRoutingPage() {
  return (
    <article>
      <CaseStudyHeader
        label="// case study · production"
        title="Routing three foundation models at 1.5s, without paying for it twice."
        tagline="A production multi-model LLM inference layer behind enterprise applications — owning latency, cost, and reliability under varying load."
        period="Feb 2024 – Jul 2024"
        role="Generative AI Engineer at Concentrix + Webhelp"
      />

      <Prose>
        <p>
          Enterprise teams wanted access to multiple foundation models from
          one stable endpoint. Each model had a different cost curve, a
          different latency profile, and a different failure mode. The naive
          fix — pick one model and stick with it — left money on the table
          and made every outage a full outage. The better fix was to put a
          routing layer in front of all of them and treat model choice as a
          tunable knob.
        </p>

        <h2>The constraints</h2>
        <ul>
          <li>
            <strong>Latency budget.</strong> End-to-end response had to feel
            interactive across consumer-facing flows — sub-2s, ideally
            sub-1.5s.
          </li>
          <li>
            <strong>Cost ceiling.</strong> Inference spend was the largest
            line item in the platform&apos;s monthly bill.
          </li>
          <li>
            <strong>Accuracy floor.</strong> Routing decisions could not
            silently degrade response quality.
          </li>
          <li>
            <strong>Operability.</strong> When a model misbehaved, on-call
            needed to know in minutes, not days.
          </li>
        </ul>

        <h2>The architecture</h2>
        <ul>
          <li>
            <strong>Router.</strong> LiteLLM in front of AWS Bedrock and
            SageMaker endpoints, plus a request classifier that decided which
            model could meet the request&apos;s latency-cost-accuracy
            envelope.
          </li>
          <li>
            <strong>Fallback chain.</strong> Every route had a sibling model
            it could fall back to on rate-limit or 5xx, so a single provider
            blip never became a user-visible outage.
          </li>
          <li>
            <strong>Observability.</strong> Structured logging into
            CloudWatch with per-request model, latency, token, and
            confidence; safety checks ran inline and emitted their own
            stream.
          </li>
          <li>
            <strong>Drift monitoring.</strong> Daily aggregates over
            production traffic that flagged accuracy and latency
            distributions creeping outside their bounds.
          </li>
        </ul>
      </Prose>

      <div className="container-page">
        <MetricRow>
          <Metric
            value="1.5s"
            label="End-to-end latency"
            hint="p50 across all routes"
          />
          <Metric
            value="−18%"
            label="Inference cost"
            hint="vs single-model baseline"
          />
          <Metric
            value="95%+"
            label="Response accuracy"
            hint="under varying constraints"
          />
          <Metric
            value="−42% / +35%"
            label="Prod incidents / MTTD"
            hint="thanks to inline observability"
          />
        </MetricRow>
      </div>

      <Prose>
        <h2>What worked</h2>
        <ul>
          <li>
            <strong>Routing on a budget, not a vibe.</strong> The classifier
            picked the cheapest model that could meet the request&apos;s
            latency-accuracy envelope, not the &ldquo;best&rdquo; model
            globally. That&apos;s where most of the cost win came from.
          </li>
          <li>
            <strong>Cheap observability beats expensive intuition.</strong>
            Structured per-request logs and a couple of dashboards bought
            most of the incident reduction. The router itself was simple;
            the visibility around it was the moat.
          </li>
          <li>
            <strong>Fallbacks earned their keep on day one.</strong> Within
            the first week, a single Bedrock endpoint started returning
            inflated latency on a fraction of requests. The fallback chain
            absorbed it before anyone noticed.
          </li>
        </ul>

        <h2>What I&apos;d do differently</h2>
        <ul>
          <li>
            Move classification logic from heuristic to a small fine-tuned
            classifier earlier — the heuristic was good enough to ship but
            ate engineering time as the model menu grew.
          </li>
          <li>
            Pre-compute a per-tenant routing policy rather than a single
            global one — variance between enterprise customers&apos; mix of
            requests turned out to be larger than I expected.
          </li>
        </ul>
      </Prose>
    </article>
  );
}
