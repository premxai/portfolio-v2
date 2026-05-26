import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Github } from "lucide-react";
import { Prose } from "@/components/prose";

export const metadata: Metadata = {
  title: "Transformer from Scratch",
  description:
    'A walkthrough of reimplementing "Attention Is All You Need" in raw PyTorch — what finally clicked, and what I got wrong the first three times.',
};

export default function TransformerFromScratchPage() {
  return (
    <article>
      <header className="container-page pt-16 pb-12">
        <Link
          href="/writing"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-accent)] transition-colors mb-10"
        >
          <ArrowLeft className="size-3.5" /> back to writing
        </Link>
        <p className="section-label mb-4">// article · ml fundamentals</p>
        <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-balance max-w-4xl">
          Transformer from Scratch
        </h1>
        <p className="mt-6 text-lg md:text-xl text-[color:var(--color-fg-muted)] max-w-3xl text-pretty">
          Reimplementing &ldquo;Attention Is All You Need&rdquo; in raw PyTorch
          — what finally clicked, and what I got wrong the first three times.
        </p>
        <dl className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <Meta term="Published" value="April 2025" />
          <Meta term="Reading time" value="~12 min" />
          <Meta term="Stack" value="PyTorch · Python" />
          <Meta
            term="Code"
            value={
              <a
                href="https://github.com/premxai/transformer-from-scratch"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[color:var(--color-accent)] hover:underline"
              >
                GitHub <Github className="size-3.5" />
              </a>
            }
          />
        </dl>
      </header>

      <Prose>
        <p>
          I&apos;d read the paper a dozen times. I&apos;d used HuggingFace and
          shipped real models. But I&apos;d never sat down and written every
          line — embeddings, attention, masking, the encoder, the decoder,
          the training loop — without copying anything. So I did. This article
          is what I&apos;d hand to past-me to skip the worst of the confusion.
        </p>

        <h2>Why bother</h2>
        <p>
          You don&apos;t learn a transformer by reading about it. You learn it
          by debugging a shape mismatch at 1am and realising your attention
          mask is broadcasting the wrong way. Doing the implementation
          end-to-end forces every fuzzy mental model to commit to a tensor
          shape.
        </p>

        <h2>The pieces, in order</h2>
        <ol>
          <li>
            <strong>Token + positional embeddings.</strong> The smallest piece
            and the easiest to get wrong. The positional encoding is just a
            fixed sinusoidal pattern added to the token embedding — but
            it&apos;s the choice that lets attention work on un-ordered sets.
          </li>
          <li>
            <strong>Scaled dot-product attention.</strong> Three projections —
            Q, K, V — and the famous{" "}
            <code>softmax(QK^T / sqrt(d_k)) V</code>. The{" "}
            <code>sqrt(d_k)</code> isn&apos;t cosmetic; without it, large
            dimensions push softmax into vanishing-gradient territory.
          </li>
          <li>
            <strong>Multi-head attention.</strong> Split the projections into{" "}
            <em>h</em> heads, attend in parallel, concat. The cheapest way to
            let the model look at multiple relations at once.
          </li>
          <li>
            <strong>Position-wise feed-forward.</strong> Two linear layers and
            a ReLU. Surprisingly, most of the parameter count lives here, not
            in attention.
          </li>
          <li>
            <strong>Encoder + decoder stacks.</strong> Residual connections
            around every sub-layer, layer norm before (or after) — the
            order matters more than you&apos;d think.
          </li>
        </ol>

        <h2>What I got wrong the first three times</h2>
        <ul>
          <li>
            <strong>Mask shape.</strong> The causal mask in the decoder is{" "}
            <code>(seq, seq)</code>, not <code>(batch, seq, seq)</code>. Let
            broadcasting do the work.
          </li>
          <li>
            <strong>Padding mask in attention.</strong> You mask{" "}
            <em>before</em> softmax, not after. Masking after gives you a
            distribution that doesn&apos;t sum to one and breaks gradients
            silently.
          </li>
          <li>
            <strong>Weight tying.</strong> Sharing the output projection with
            the input embedding matrix is a one-line change that cuts
            parameters and improves perplexity. The paper mentions it; almost
            every tutorial skips it.
          </li>
          <li>
            <strong>Warmup matters.</strong> The Noam schedule (linear warmup,
            then 1/sqrt(step) decay) isn&apos;t a hyperparameter you tune —
            it&apos;s load-bearing. Train without it and the loss goes flat.
          </li>
        </ul>

        <h2>The shape cheat-sheet</h2>
        <p>
          Carry this in your head and most of the work disappears:
        </p>
        <ul>
          <li>
            <code>x: (B, S, D)</code> — batch, sequence length, model dim.
          </li>
          <li>
            <code>q, k, v: (B, H, S, D/H)</code> — split across heads.
          </li>
          <li>
            <code>scores: (B, H, S, S)</code> — attention scores per head.
          </li>
          <li>
            <code>mask: (S, S) or (B, 1, 1, S)</code> — broadcasts over what
            it doesn&apos;t cover.
          </li>
        </ul>

        <h2>What I&apos;d do differently next time</h2>
        <ul>
          <li>
            Start with the inference path, not the training loop. Get a
            forward pass working on dummy tensors before touching loss.
          </li>
          <li>
            Write the attention block as a pure function first, wrap it in{" "}
            <code>nn.Module</code> only once shapes are nailed down.
          </li>
          <li>
            Sanity-check on a tiny copy-task before scaling up. If a 2-layer
            transformer can&apos;t learn to copy a sequence in 1000 steps,
            something&apos;s wrong with your masking.
          </li>
        </ul>

        <h2>The code</h2>
        <p>
          The full implementation lives on{" "}
          <a
            href="https://github.com/premxai/transformer-from-scratch"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          . It&apos;s deliberately small — one file per concept, no abstraction
          for its own sake. Read it top-to-bottom and you&apos;ll have a
          working transformer in your head.
        </p>
      </Prose>
    </article>
  );
}

function Meta({ term, value }: { term: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-fg-subtle)] mb-1">
        {term}
      </dt>
      <dd className="text-[color:var(--color-fg)]">{value}</dd>
    </div>
  );
}
