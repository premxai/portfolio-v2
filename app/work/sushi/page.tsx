import type { Metadata } from "next";
import { CaseStudyHeader } from "@/components/case-study-header";
import { Prose } from "@/components/prose";
import { Metric, MetricRow } from "@/components/metric";

export const metadata: Metadata = {
  title: "Sushi",
  description:
    "A full-stack exploratory data analysis product for profiling, statistics, and exportable reports.",
};

export default function SushiPage() {
  return (
    <article>
      <CaseStudyHeader
        slug="sushi"
        label="// case study · data product"
        title="Raw files in. Defensible analysis out."
        tagline="Sushi turns common data files into quality checks, descriptive statistics, visual analysis, and exportable reports."
        period="2026"
        role="Designer and engineer"
        repo="https://github.com/premxai/sushi-eda"
        demo="https://trysushi.xyz/"
      />

      <Prose>
        <p>
          Exploratory analysis often starts with the same fragile notebook
          loop: inspect types, count missing values, hunt outliers, generate
          plots, and then rebuild the useful pieces for someone else.
          <strong> Sushi</strong> packages that loop into a repeatable product.
        </p>

        <h2>Analysis flow</h2>
        <ol>
          <li>Ingest CSV, TSV, Excel, JSON, Parquet, or SQLite data.</li>
          <li>Infer column types and profile completeness, uniqueness, and distributions.</li>
          <li>Compute a 0–100 quality score and flag issues that deserve inspection.</li>
          <li>Run descriptive statistics, IQR-based outlier analysis, and selected hypothesis tests.</li>
          <li>Build Plotly visualizations and export a shareable analysis record.</li>
        </ol>
      </Prose>

      <div className="container-page">
        <MetricRow>
          <Metric value="6" label="Input formats" hint="files and SQLite" />
          <Metric value="0–100" label="Quality score" hint="consistent profiling signal" />
          <Metric value="IQR" label="Outlier method" hint="inspectable statistical rule" />
        </MetricRow>
      </div>

      <Prose>
        <h2>Product architecture</h2>
        <p>
          A Python and FastAPI backend owns ingestion and analysis. A Next.js
          interface handles the workflow and Plotly visualizations, while
          SQLite keeps lightweight analysis state. The boundary is deliberate:
          statistical behavior stays testable in Python and the browser remains
          focused on inspection and communication.
        </p>

        <h2>Why this is more than a chart gallery</h2>
        <p>
          Every visualization sits behind a data-quality and statistical
          workflow. Sushi does not pretend automated EDA replaces judgment; it
          makes the repetitive checks consistent so the analyst can spend more
          time questioning the result.
        </p>
      </Prose>
    </article>
  );
}
